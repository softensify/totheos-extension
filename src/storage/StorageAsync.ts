// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { Consumer, Runnable } from '../util/Util';

export type StorageAsyncAllData = { [key: string]: any };
export type StorageAsyncGetAllCallback = Consumer<StorageAsyncAllData>;

export interface StorageAsync {
  getAll(callback: StorageAsyncGetAllCallback): void;
  set(name: string, value: string | undefined, callback: Runnable): void;
  clear(callback: Runnable): void;
}
