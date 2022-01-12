// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { Runnable } from '../util/Util';

export interface StorageSync {
  get<T>(name: string): T | undefined;
  keys(): string[];
  set<T>(name: string, value: T | undefined): void;
  clear(callback: Runnable): void;
}
