// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { Runnable } from '../util/Util';
import { StorageSync } from './StorageSync';

export class StorageSyncPrefix implements StorageSync {
  constructor(private readonly storage: StorageSync, private readonly prefix: string) {}

  public get<T>(name: string): T | undefined {
    return this.storage.get(this.addPrefix(name));
  }

  public set<T>(name: string, value: T | undefined): void {
    this.storage.set(this.addPrefix(name), value);
  }

  public keys(): string[] {
    return this.storage
      .keys()
      .filter((key) => this.hasPrefix(key))
      .map((key) => this.removePrefix(key));
  }

  public clear(callback: Runnable): void {
    this.keys().forEach((key) => this.set(key, undefined));
    callback();
  }

  private addPrefix(name: string): string {
    return `${this.prefix}${name}`;
  }

  private hasPrefix(name: string): boolean {
    return name.startsWith(this.prefix);
  }

  private removePrefix(name: string): string {
    return name.substr(this.prefix.length);
  }
}
