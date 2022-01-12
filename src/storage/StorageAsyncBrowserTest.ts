// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { Runnable, Consumer } from '../util/Util';
import { StorageAsyncAllData } from './StorageAsync';
import { StorageAsyncBrowser, StorageBrowser } from './StorageAsyncBrowser';
import { storageAsyncTest } from './StorageAsyncTest';

class MemoryStorageBrowser implements StorageBrowser {
  private data: StorageAsyncAllData = {};

  public clear(callback: Runnable): void {
    this.data = {};
    callback();
  }

  public get(callback: Consumer<Object>): void {
    callback(this.data);
  }

  public remove(key: string, callback: Runnable): void {
    delete this.data[key];
    callback();
  }

  public set(items: Object, callback: Runnable): void {
    Object.keys(items).forEach((key) => {
      this.data[key] = (items as any)[key];
    });
    callback();
  }
}

describe('StorageAsyncBrowser tests', () => {
  storageAsyncTest(new StorageAsyncBrowser(new MemoryStorageBrowser()));
});
