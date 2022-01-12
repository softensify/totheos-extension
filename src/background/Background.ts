// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { Callbacks, CallbacksResult, HtmlPermission, Permission } from "../callbacks/Callbacks";
import { CallbackListener, PermissionRespond } from "../callbacks/Listener";
import { PermissionsStorage } from "../permissions/Permissions";
import { CloseRequest, DataRequest } from "../permissions/PermissionsPage";
import { WindowOpen } from "../popup/Popup";
import { NATIVE_APP_ID } from "../update/Update";
import { Consumer, isHttpOrHttps, NOOP, Runnable, Transform } from "../util/Util";

export const PROFILE = 'Default';
export const UPDATE_RESPONSE = { success: false, error: 'Update method is not allowed' };
export const NOT_CORRECT_RESPONSE = { success: false, error: 'Not correct message' };
export const NO_APP_RESPONSE = { success: false, error: 'ToTheOS App connection error' };
export const REJECTED_RESPONSE = { success: false, error: 'Rejected by user' };
export const CANCELED_RESPONSE = { success: false, error: 'Canceled by user' };

export const ERROR_READING_JSON = (url: string) => `Error reading JSON file from ${url}`;

export const CLEAR_MESSAGE = 'clear';

export interface ClearMessage {
  readonly message: 'clear';
  readonly extensionId: string;
}

export const API_MESSAGE = 'api';

export interface ApiMessage {
  readonly message: 'api';
  readonly url: string;
  readonly id: string;
  readonly origin: string;
}

export const RESPOND_MESSAGE = 'respond';

export interface RespondMessageData {
  readonly success?: boolean;
  internal: {
    id: string;
    origin: string;
  };
}

export interface RespondMessage {
  readonly message: 'respond';
  readonly success: true;
  readonly data: RespondMessageData;
}

export interface RespondErrorMessage {
  readonly message: 'respond';
  readonly success: false;
  readonly error: string;
  readonly data: RespondMessageData;
}

interface Request {
  readonly plugin?: string;
  readonly method?: string;
}

type SendNativeMessage = (
  id: string,
  message: Object,
  responseCallback?: (response: any) => void,
) => void;

interface GetExtensionInfoResult {
  readonly name: string;
  readonly version: string;
}

type GetExtensionInfo = (id: string, callback: Consumer<GetExtensionInfoResult>) => void;
export type FetchUrl = Transform<string, Promise<any>>;

interface SendNativeMessageResult {
  readonly internal?: {
    command: string;
    htmlGranted: HtmlPermission[];
    htmlAsk: HtmlPermission[];
    permissions: Permission[];
  };
}

export class Background {
  constructor(
    private readonly callbacks: Callbacks,
    private readonly callbackListener: CallbackListener,
    private readonly permissionsStorage: PermissionsStorage,
    private readonly version: string,
    private readonly requestPermissionHtml: string,
    private readonly isFirefox: () => boolean,
    private readonly windowOpen: WindowOpen,
    private readonly reload: Runnable,
    private readonly sendNativeMessage: SendNativeMessage,
    private readonly getExtensionInfo: GetExtensionInfo,
    private readonly fetchUrl: FetchUrl
  ) {}

  public onMessage(
    request: PermissionRespond | ClearMessage | ApiMessage
  ): Promise<DataRequest | CloseRequest | RespondMessage | RespondErrorMessage | void> {
    if (request.message === CLEAR_MESSAGE) {
      this.permissionsStorage.clearPermissions(request.extensionId);
      return Promise.resolve();
    } else if (request.message === API_MESSAGE) {
      const url = request.url;
      return this.fetchUrl(url)
        .then((json) => this.onMessageExternal(json, request.origin, NOOP))
        .then((data) => {
          return {
            message: RESPOND_MESSAGE,
            success: true,
            data: this.setUrlAndOrigin(data, request.id, request.origin),
          };
        })
        .catch((error) => {
          console.error(error);
          return {
            message: RESPOND_MESSAGE,
            success: false,
            error: ERROR_READING_JSON(url),
            data: this.setUrlAndOrigin({}, request.id, request.origin),
          } as any;
        });
    } else {
      const record = this.callbackListener.handle(request);
      return Promise.resolve(record === undefined ? { message: 'close' } : { message: 'data', record });
    }
  }

  private setUrlAndOrigin(data: Partial<RespondMessageData>, id: string, origin: string): RespondMessageData {
    const internal = Object.assign({}, { id, origin });
    return Object.assign({}, data, { internal });
  }

  public onMessageExternal(request: Request | undefined, senderId: string | undefined, callback: Consumer<any>): Promise<any> {
    return new Promise((resolve) => {
      const callbackAndResolve = (value: any) => {
        callback(value);
        resolve(value);
      };

      if (request !== undefined) {
        switch (request.method) {
          case 'reload':
            this.reload();
            callbackAndResolve(undefined);
            break;
          case 'getExtensionInfo':
            callbackAndResolve({ success: true, version: this.version });
            break;
          case 'updateApp':
            callbackAndResolve(UPDATE_RESPONSE);
            break;
          default:
            this.callPlugin(senderId as string, request, callbackAndResolve);
        }
      } else {
        callbackAndResolve(NOT_CORRECT_RESPONSE);
      }
    });
  }

  public onTabRemoved(tabId: number): void {
    const maybeRecord = this.callbacks.getByTabId(tabId);
    if (maybeRecord !== undefined) {
      maybeRecord.promise.resolve(CallbacksResult.CANCELED);
    }
  }

  private getExtensionInfoOrUrl(id: string, callback: Consumer<GetExtensionInfoResult>): void {
    const isUrl = isHttpOrHttps(id);
    if (isUrl) {
      callback({ version: '', name: id });
    } else {
      this.getExtensionInfo(id, callback);
    }
  }

  private callPlugin(extensionId: string, request: Request, callback: Consumer<any>): void {
    this.getExtensionInfoOrUrl(extensionId, ({ version, name }) => {
      const permissions = this.permissionsStorage.get(extensionId);
      const override = {
        internal: {
          extension: extensionId,
          profile: PROFILE,
          version,
          browser: this.isFirefox() ? 'firefox' : 'chrome',
        },
        granted: permissions.granted,
        rejected: permissions.rejected,
      };
      this.permissionsStorage.setName(extensionId, name);
      this.sendNativeMessage(NATIVE_APP_ID, Object.assign({}, request, override), (response: SendNativeMessageResult) => {
        if (response !== undefined && response.internal !== undefined && response.internal.command === 'ask') {
          void this.openPermissions(
            extensionId,
            response.internal.htmlGranted,
            response.internal.htmlAsk,
            response.internal.permissions
          ).then((result) => {
            switch (result) {
              case CallbacksResult.GRANTED:
                this.callPlugin(extensionId, request, callback);
                break;
              case CallbacksResult.REJECTED:
                callback(REJECTED_RESPONSE);
                break;
              case CallbacksResult.CANCELED:
                callback(CANCELED_RESPONSE);
            }
          });
        } else {
          callback(response === undefined ? NO_APP_RESPONSE : response);
        }
      });
    });
  }

  private openPermissions(
    extensionId: string,
    htmlGranted: HtmlPermission[],
    htmlAsk: HtmlPermission[],
    permissions: Permission[]
  ): Promise<CallbacksResult> {
    const { index, promise } = this.callbacks.add({ extensionId, htmlGranted, htmlAsk, permissions });
    this.windowOpen(`${this.requestPermissionHtml}?${index}`);
    return promise.getPromise();
  }
}