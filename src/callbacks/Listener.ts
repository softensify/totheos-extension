// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { PermissionsStorage } from "../permissions/Permissions";
import { AddParameters, Callbacks, CallbacksResult, toClonable } from "./Callbacks";

export interface PermissionRespond {
  index: number;
  message: 'get' | 'grant' | 'reject';
  tabId: number;
}

export class CallbackListener {
  constructor(private readonly callbacks: Callbacks, private readonly permissionsStorage: PermissionsStorage) {}

  public handle(request: PermissionRespond): AddParameters | undefined {
    if (request.message === 'get') {
      this.callbacks.setTabId(request.index, request.tabId);
      return toClonable(this.callbacks.get(request.index));
    } else if (request.message === 'grant') {
      this.permissionsStorage.addGranted(this.callbacks.get(request.index).extensionId, this.callbacks.get(request.index).permissions);
      this.callbacks.get(request.index).promise.resolve(CallbacksResult.GRANTED);
    } else if (request.message === 'reject') {
      this.permissionsStorage.addRejected(this.callbacks.get(request.index).extensionId, this.callbacks.get(request.index).permissions);
      this.callbacks.get(request.index).promise.resolve(CallbacksResult.REJECTED);
    }
    return undefined;
  }
}