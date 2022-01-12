// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { clone, Runnable } from '../util/Util';
import { StorageAsync, StorageAsyncAllData, StorageAsyncGetAllCallback } from './StorageAsync';

export class StorageAsyncMemory implements StorageAsync {
  private data: StorageAsyncAllData = {};

  public getAll(callback: StorageAsyncGetAllCallback): void {
    callback(clone(this.data));
  }

  public set(name: string, value: string | undefined, callback: Runnable): void {
    if (value === undefined) {
      delete this.data[name];
    } else {
      this.data[name] = clone(value);
    }

    callback();
  }

  public clear(callback: Runnable): void {
    this.data = {};
    callback();
  }
}
