// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { Consumer, Runnable } from '../util/Util';
import { QueueConsumer } from '../util/QueueConsumer';
import { StorageAsync } from './StorageAsync';
import { StorageSync } from './StorageSync';

interface QueueRecord<T> {
  name: string;
  value: T;
}

export type StorageAsyncToSyncCallback = Consumer<StorageAsyncToSync>;

export class StorageAsyncToSync implements StorageSync {
  private readonly queue: QueueConsumer<QueueRecord<string | undefined>> = new QueueConsumer((record, done) =>
    this.AsyncStorage.set(record.name, record.value, done)
  );

  constructor(private readonly AsyncStorage: StorageAsync, private readonly cache: StorageSync) {}

  public load(callback: StorageAsyncToSyncCallback): void {
    this.cache.clear(() => {
      this.AsyncStorage.getAll((data) => {
        Object.keys(data).forEach((name) => this.cache.set(name, data[name]));
        callback(this);
      });
    });
  }

  public get(name: string): any {
    return this.cache.get(name);
  }

  public set(name: string, value: any): void {
    if (this.cache.get(name) !== value) {
      this.push(name, value);
      this.cache.set(name, value);
    }
  }

  public keys(): string[] {
    return this.cache.keys();
  }

  public clear(callback: Runnable): void {
    this.AsyncStorage.clear(() => this.cache.clear(callback));
  }

  private push(name: string, value: any): void {
    this.queue.put({ name, value });
  }
}

export function getStorageAsyncToSync(AsyncStorage: StorageAsync, cache: StorageSync, callback: StorageAsyncToSyncCallback): void {
  const result = new StorageAsyncToSync(AsyncStorage, cache);
  result.load(() => callback(result));
}
