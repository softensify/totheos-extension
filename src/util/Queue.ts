// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { clone } from './Util';

export class Queue<T> {
  private data: T[] = [];

  public put(record: T): void {
    this.data.push(clone(record));
  }

  public get(): T | undefined {
    return this.data.shift();
  }

  public size(): number {
    return this.data.length;
  }

  public clear(): void {
    this.data = [];
  }
}
