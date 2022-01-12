// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { NativeAppStatus } from "../state/NativeAppStatus";
import { StorageSyncMemory } from "../storage/StorageSyncMemory";
import { PromiseWarp } from "../util/PromiseWrap";
import { $, createDivs, notNull } from "../util/Util";
import { Popup, Retry } from "./Popup";

describe('Popup tests', () => {
  const storage = new StorageSyncMemory();
  const nativeAppStatus = new NativeAppStatus(storage);

  let promise: PromiseWarp<void>;
  let retry: Retry;

  createDivs(['version', 'connected', 'error']);

  beforeEach((callback) => {
    promise = new PromiseWarp();
    retry = jasmine.createSpy().and.callFake(() => promise.getPromise());
    storage.clear(callback);
  });

  it('success', () => {
    nativeAppStatus.setVersion({ version: '1.0' });
    new Popup(nativeAppStatus, retry);
    promise.resolve();
    setTimeout(() => {
      expect(notNull($('version')).innerText).toEqual('1.0');
      expect(notNull($('connected')).style.display).toEqual('block');
      expect(notNull($('error')).style.display).toEqual('none');
    }, 0);
  });

  it('no version', () => {
    nativeAppStatus.setVersion({ version: undefined });
    new Popup(nativeAppStatus, retry);
    promise.resolve();
    setTimeout(() => {
      expect(notNull($('version')).innerText).toEqual('Unknown');
      expect(notNull($('connected')).style.display).toEqual('block');
      expect(notNull($('error')).style.display).toEqual('none');
    }, 0);
  });

  it('no connect', () => {
    nativeAppStatus.setVersion(undefined);
    new Popup(nativeAppStatus, retry);
    promise.resolve();
    setTimeout(() => {
      expect(notNull($('connected')).style.display).toEqual('none');
      expect(notNull($('error')).style.display).toEqual('block');
    }, 0);
  });
});
