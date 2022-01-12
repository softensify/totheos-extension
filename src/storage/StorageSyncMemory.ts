// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { clone, Runnable } from '../util/Util';
import { StorageSync } from './StorageSync';

export class StorageSyncMemory implements StorageSync {
  private storage: { [key: string]: any } = {};

  public get<T>(name: string): T | undefined {
    const exists: boolean = this.storage[name] !== undefined;
    return exists ? (clone(this.storage[name]) as T) : undefined;
  }

  public set<T>(name: string, value: T | undefined): void {
    if (value === undefined) {
      delete this.storage[name];
    } else {
      this.storage[name] = clone(value);
    }
  }

  public keys(): string[] {
    return Object.keys(this.storage);
  }

  public clear(callback: Runnable): void {
    this.storage = {};
    callback();
  }
}
