// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { WindowOpen } from "../popup/Popup";
import { NativeAppStatus } from "../state/NativeAppStatus";
import { StorageSyncMemory } from "../storage/StorageSyncMemory";
import { NOOP } from '../util/Util';
import { ChromeBrowserAction, DOWNLOAD_URL, OnUpdate } from "./OnUpdate";

describe('OnUpdate tests', () => {

  const storage = new StorageSyncMemory();
  const nativeAppStatus = new NativeAppStatus(storage);
  const VERSION = '1.0';

  beforeEach((callback) => storage.clear(callback));

  describe('updateIcon', () => {
    it('on success', () => {
      const windowOpen: WindowOpen = jasmine.createSpy().and.callFake(NOOP);

      const chromeBrowserAction: ChromeBrowserAction = {
        setBadgeBackgroundColor: jasmine.createSpy().and.callFake(NOOP),
        setBadgeText: jasmine.createSpy().and.callFake(NOOP),
      };

      const onUpdate = new OnUpdate(nativeAppStatus, windowOpen, chromeBrowserAction);

      onUpdate.updateIcon({ version: VERSION });
      expect(nativeAppStatus.getConnect()).toBeTrue();
      expect(nativeAppStatus.getVersion()).toEqual(VERSION);
      expect(chromeBrowserAction.setBadgeText).toHaveBeenCalledOnceWith({ text: '' });
      expect(windowOpen).not.toHaveBeenCalled();
    });

    it('on success, but no version', () => {
      const windowOpen: WindowOpen = jasmine.createSpy().and.callFake(NOOP);

      const chromeBrowserAction: ChromeBrowserAction = {
        setBadgeBackgroundColor: jasmine.createSpy().and.callFake(NOOP),
        setBadgeText: jasmine.createSpy().and.callFake(NOOP),
      };

      const onUpdate = new OnUpdate(nativeAppStatus, windowOpen, chromeBrowserAction);

      onUpdate.updateIcon({ version: undefined });
      expect(nativeAppStatus.getConnect()).toBeTrue();
      expect(nativeAppStatus.getVersion()).toBeUndefined();
      expect(chromeBrowserAction.setBadgeText).toHaveBeenCalledOnceWith({ text: '' });
      expect(windowOpen).not.toHaveBeenCalled();
    });

    it('on error', () => {
      const windowOpen: WindowOpen = jasmine.createSpy().and.callFake(NOOP);

      const chromeBrowserAction: ChromeBrowserAction = {
        setBadgeBackgroundColor: jasmine.createSpy().and.callFake(NOOP),
        setBadgeText: jasmine.createSpy().and.callFake(NOOP),
      };

      const onUpdate = new OnUpdate(nativeAppStatus, windowOpen, chromeBrowserAction);

      onUpdate.updateIcon(undefined);
      expect(nativeAppStatus.getConnect()).toBeFalse();
      expect(nativeAppStatus.getVersion()).toBeUndefined();
      expect(chromeBrowserAction.setBadgeBackgroundColor).toHaveBeenCalledOnceWith({ color: 'red' });
      expect(chromeBrowserAction.setBadgeText).toHaveBeenCalledOnceWith({ text: '!' });
      expect(windowOpen).not.toHaveBeenCalled();
    });
  });

  describe('openPageAndUpdateIcon', () => {
    it('success, first time', () => {
      const windowOpen: WindowOpen = jasmine.createSpy().and.callFake(NOOP);

      const chromeBrowserAction: ChromeBrowserAction = {
        setBadgeBackgroundColor: jasmine.createSpy().and.callFake(NOOP),
        setBadgeText: jasmine.createSpy().and.callFake(NOOP),
      };

      const onUpdate = new OnUpdate(nativeAppStatus, windowOpen, chromeBrowserAction);

      onUpdate.openPageAndUpdateIcon({ version: VERSION });
      expect(nativeAppStatus.getConnect()).toBeTrue();
      expect(nativeAppStatus.getVersion()).toEqual(VERSION);
      expect(chromeBrowserAction.setBadgeText).toHaveBeenCalledOnceWith({ text: '' });
      expect(windowOpen).not.toHaveBeenCalled();
    });

    it('on success, but no version', () => {
      const windowOpen: WindowOpen = jasmine.createSpy().and.callFake(NOOP);

      const chromeBrowserAction: ChromeBrowserAction = {
        setBadgeBackgroundColor: jasmine.createSpy().and.callFake(NOOP),
        setBadgeText: jasmine.createSpy().and.callFake(NOOP),
      };

      const onUpdate = new OnUpdate(nativeAppStatus, windowOpen, chromeBrowserAction);

      onUpdate.openPageAndUpdateIcon({ version: undefined });
      expect(nativeAppStatus.getConnect()).toBeTrue();
      expect(nativeAppStatus.getVersion()).toBeUndefined();
      expect(chromeBrowserAction.setBadgeText).toHaveBeenCalledOnceWith({ text: '' });
      expect(windowOpen).not.toHaveBeenCalled();
    });

    it('on error, two times', () => {
      const windowOpen: WindowOpen = jasmine.createSpy().and.callFake(NOOP);

      const chromeBrowserAction: ChromeBrowserAction = {
        setBadgeBackgroundColor: jasmine.createSpy().and.callFake(NOOP),
        setBadgeText: jasmine.createSpy().and.callFake(NOOP),
      };

      const onUpdate = new OnUpdate(nativeAppStatus, windowOpen, chromeBrowserAction);

      onUpdate.openPageAndUpdateIcon(undefined);
      expect(nativeAppStatus.getConnect()).toBeFalse();
      expect(nativeAppStatus.getVersion()).toBeUndefined();
      expect(chromeBrowserAction.setBadgeBackgroundColor).toHaveBeenCalledOnceWith({ color: 'red' });
      expect(chromeBrowserAction.setBadgeText).toHaveBeenCalledOnceWith({ text: '!' });
      expect(windowOpen).toHaveBeenCalledOnceWith(DOWNLOAD_URL);

      onUpdate.openPageAndUpdateIcon(undefined);
      expect(windowOpen).toHaveBeenCalledOnceWith(DOWNLOAD_URL);
    });
  });

});