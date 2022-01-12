// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { StorageSync } from '../storage/StorageSync';

const NATIVE_APP_VERSION_KEY = 'NATIVE_APP_VERSION_KEY';
const NATIVE_APP_CONNECT_KEY = 'NATIVE_APP_CONNECT_KEY';

type Version = string | undefined;
interface VersionAttribute {
  version: Version;
}

export class NativeAppStatus {
  constructor(private readonly storage: StorageSync) {}

  public getVersion(): Version {
    return this.storage.get(NATIVE_APP_VERSION_KEY);
  }

  public getConnect(): boolean {
    return this.storage.get(NATIVE_APP_CONNECT_KEY) === true;
  }

  public setVersion(versionAttribute: VersionAttribute | undefined): void {
    const version = versionAttribute === undefined ? undefined : versionAttribute.version;
    this.storage.set(NATIVE_APP_VERSION_KEY, version);
    this.storage.set(NATIVE_APP_CONNECT_KEY, versionAttribute !== undefined);
  }
}
