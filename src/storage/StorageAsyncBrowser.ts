// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { Consumer, Runnable } from '../util/Util';
import { StorageAsync, StorageAsyncGetAllCallback } from './StorageAsync';

export interface StorageBrowser {
  clear(callback: Runnable): void;
  get(callback: Consumer<Object>): void;
  remove(key: string, callback: Runnable): void;
  set(items: Object, callback: Runnable): void;
}

export class StorageAsyncBrowser implements StorageAsync {
  constructor(private readonly storageBrowser: StorageBrowser) {}

  public getAll(callback: StorageAsyncGetAllCallback): void {
    this.storageBrowser.get(callback);
  }

  public set(name: string, value: string | undefined, callback: Runnable): void {
    if (value === undefined) {
      this.storageBrowser.remove(name, callback);
    } else {
      this.storageBrowser.set({ [name]: value }, callback);
    }
  }

  public clear(callback: Runnable): void {
    this.storageBrowser.clear(callback);
  }
}
