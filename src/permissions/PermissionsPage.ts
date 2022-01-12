// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { ForPermissionPage } from '../callbacks/Callbacks';
import { WindowClose, WindowOpen } from '../popup/Popup';
import { notNull, $, Consumer, isHttpOrHttps } from '../util/Util';

export interface DataRequest {
  message: 'data';
  record: ForPermissionPage;
}

export interface CloseRequest {
  message: 'close';
}

export interface Message {
  message: string;
  index: string;
}

export type Send = (message: Message) => void;
export type GetExtensionName = (extensionId: string, callback: (name: string) => void) => void;

export const getWebStoreUrl = (extensionId: string) => `https://chrome.google.com/webstore/detail/${extensionId}`;

export class PermissionsPage {
  constructor(
    data: DataRequest | CloseRequest,
    index: string,
    getExtensionName: GetExtensionName,
    windowOpen: WindowOpen,
    windowClose: WindowClose,
    send: Send
  ) {
    if (data.message === 'data') {
      const getExtensionOrUrlName = (id: string, callback: Consumer<string>) => {
        if (isHttpOrHttps(id)) {
          callback(`Web Site ${id}`);
        } else {
          getExtensionName(id, callback);
        }
      };

      getExtensionOrUrlName(data.record.extensionId, (name) => {
        const isFirst = data.record.htmlGranted.length === 0;
        notNull($('extension1')).innerText = name;
        notNull($('extension2')).innerText = name;
        notNull($('extension3')).innerText = name;
        notNull($('extension4')).innerText = name;
        notNull($('extension5')).innerText = name;
        notNull($('first')).style.display = isFirst ? 'inline' : 'none';
        notNull($('other1')).style.display = isFirst ? 'none' : 'inline';
        notNull($('other2')).style.display = isFirst ? 'none' : 'block';
        notNull($('grantedHeader')).style.display = isFirst ? 'none' : 'block';
        notNull($('granted')).innerHTML = data.record.htmlGranted.map((record) => record.html).join('');
        notNull($('ask')).innerHTML = data.record.htmlAsk.map((record) => record.html).join('');
        notNull($('id')).innerText = data.record.extensionId;
        notNull($('url')).onclick = () => windowOpen(getWebStoreUrl(data.record.extensionId));

        const grantOrReject = (message: string) => send({ message, index });

        notNull($('grant')).onclick = () => grantOrReject('grant');
        notNull($('reject')).onclick = () => grantOrReject('reject');
      });
    } else if (data.message === 'close') {
      windowClose();
    } else {
      throw new Error(`Not correct message ${(data as any).message}`);
    }
  }
}
