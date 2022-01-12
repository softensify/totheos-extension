// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { Callbacks, CallbacksResult } from "../callbacks/Callbacks";
import { CallbackListener } from "../callbacks/Listener";
import { PermissionsStorage, PERMISSION_STORAGE_PREFIX } from "../permissions/Permissions";
import { DataRequest } from "../permissions/PermissionsPage";
import { WindowOpen } from "../popup/Popup";
import { StorageSyncMemory } from "../storage/StorageSyncMemory";
import { StorageSyncPrefix } from "../storage/StorageSyncPrefix";
import { NATIVE_APP_ID, SendNativeMessage } from "../update/Update";
import { Consumer, NOOP, Runnable } from '../util/Util';
import {
  ApiMessage,
  Background,
  CANCELED_RESPONSE,
  CLEAR_MESSAGE,
  FetchUrl,
  NOT_CORRECT_RESPONSE,
  NO_APP_RESPONSE,
  REJECTED_RESPONSE,
  UPDATE_RESPONSE,
  API_MESSAGE,
  RESPOND_MESSAGE,
  ERROR_READING_JSON,
  RespondErrorMessage,
  RespondMessage,
} from './Background';

describe('Background tests', () => {
  const VERSION = '1.0';
  const SENDER_ID = 'SENDER_ID';
  const PERMISSION_PAGE = 'PERMISSION_PAGE.html';

  const READ_PERMISSION = {
    type: 'read',
    path: '/tmp',
    attribute: 'file',
  };

  const READ_MESSAGE = {
    plugin: 'readFile.ts',
    permissions: [READ_PERMISSION],
  };

  const READ_APP_MESSAGE_FIREFOX = {
    ...READ_MESSAGE,
    internal: {
      extension: 'SENDER_ID',
      profile: 'Default',
      version: VERSION,
      browser: 'firefox',
    },
    granted: [],
    rejected: []
  };

  const READ_APP_MESSAGE1 = {
    ...READ_MESSAGE,
    internal: {
      extension: 'SENDER_ID',
      profile: 'Default',
      version: VERSION,
      browser: 'chrome',
    },
    granted: [],
    rejected: []
  };

  const READ_APP_MESSAGE2 = {
    ...READ_MESSAGE,
    internal: {
      extension: 'SENDER_ID',
      profile: 'Default',
      version: VERSION,
      browser: 'chrome',
    },
    granted: [READ_PERMISSION],
    rejected: [],
  };

  const READ_RESPONSE = {
    internal: {
      command: 'ask',
      htmlGranted: [{ type: 'HTML_GRANT_ID', html: 'HTML_GRANT' }],
      htmlAsk: [{ type: 'HTML_ASK_ID', html: 'HTML_ASK' }],
      permissions: [READ_PERMISSION],
    },
  };

  const WRITE_PERMISSION = {
    type: 'write',
    path: '/tmp',
    attribute: 'file',
  };

  const WRITE_MESSAGE = {
    plugin: 'writeFile.ts',
    permissions: [WRITE_PERMISSION],
  };

  const WRITE_APP_MESSAGE1 = {
    ...WRITE_MESSAGE,
    internal: {
      extension: 'SENDER_ID',
      profile: 'Default',
      version: VERSION,
      browser: 'chrome',
    },
    granted: [READ_PERMISSION],
    rejected: [],
  };

  const WRITE_APP_MESSAGE2 = {
    ...WRITE_MESSAGE,
    internal: {
      extension: 'SENDER_ID',
      profile: 'Default',
      version: VERSION,
      browser: 'chrome',
    },
    granted: [READ_PERMISSION, WRITE_PERMISSION],
    rejected: [],
  };

  const WRITE_RESPONSE = {
    internal: {
      command: 'ask',
      htmlGranted: [{ type: 'HTML_GRANT_ID', html: 'HTML_GRANT' }],
      htmlAsk: [{ type: 'HTML_ASK_ID', html: 'HTML_ASK' }],
      permissions: [WRITE_PERMISSION],
    },
  };

  const CANCEL_RECORD = {
    extensionId: SENDER_ID,
    htmlGranted: [{type: 'HTML_GRANT_ID', html: 'HTML_GRANT'}],
    htmlAsk: [{type: 'HTML_ASK_ID', html: 'HTML_ASK'}],
    permissions: [READ_PERMISSION],
  };

  const EXTENSION_ID = 'EXTENSION_ID';

  const SUCCESS = { success: true };

  const WEB_API_ORIGIN = 'https://totheos.com';
  const WEB_API_ID = '0';

  const WEB_API_MESSAGE: ApiMessage = {
    message: API_MESSAGE,
    url: 'https://totheos.com/test.json',
    id: WEB_API_ID,
    origin: WEB_API_ORIGIN,
  };

  const WEB_API_FAIL: RespondErrorMessage = {
    message: RESPOND_MESSAGE,
    success: false,
    error: ERROR_READING_JSON(WEB_API_MESSAGE.url),
    data: {
      internal: {
        id: WEB_API_ID,
        origin: WEB_API_ORIGIN,
      },
    },
  };

  const WEB_API_SUCCESS: RespondMessage = {
    message: RESPOND_MESSAGE,
    success: true,
    data: {
      success: true,
      internal: {
        id: WEB_API_ID,
        origin: WEB_API_ORIGIN,
      },
    },
  };

  const WEB_API_APP_MESSAGE1 = {
    ...READ_MESSAGE,
    internal: {
      extension: WEB_API_ORIGIN,
      profile: 'Default',
      version: '',
      browser: 'chrome',
    },
    granted: [],
    rejected: [],
  };

  const WEB_API_APP_MESSAGE2 = {
    ...READ_MESSAGE,
    internal: {
      extension: WEB_API_ORIGIN,
      profile: 'Default',
      version: '',
      browser: 'chrome',
    },
    granted: [READ_PERMISSION],
    rejected: [],
  };

  const storage = new StorageSyncMemory();
  const permissionsStorage = new PermissionsStorage(new StorageSyncPrefix(storage, PERMISSION_STORAGE_PREFIX));
  const callbacks = new Callbacks();
  const callbackListener = new CallbackListener(callbacks, permissionsStorage);

  let appResponse: any;
  let windowOpen: WindowOpen;
  let background: Background;
  let isFirefox: boolean;
  let onWindowOpen: jasmine.Spy<WindowOpen>;
  let fetchUrl: FetchUrl;

  const reload: jasmine.Spy<Runnable> = jasmine.createSpy('reload').and.callFake(NOOP);
  const sendNativeMessage: jasmine.Spy<SendNativeMessage> = jasmine
    .createSpy('sendNativeMessage')
    .and.callFake((_id, _message, response) => response(appResponse));
  const callback: jasmine.Spy<Consumer<any>> = jasmine.createSpy('callback').and.callFake(NOOP);
  const resolved: jasmine.Spy<Consumer<any>> = jasmine.createSpy('resolved').and.callFake(NOOP);
  const getExtensionInfoResponse: { version: string } = { version: VERSION };
  const getExtensionInfo: jasmine.Spy<Consumer<any>> = jasmine
    .createSpy('getExtensionInfo')
    .and.callFake((_id, callback) => callback(getExtensionInfoResponse));

  beforeEach((done) => {
    isFirefox = false;
    callback.calls.reset();
    resolved.calls.reset();
    reload.calls.reset();
    sendNativeMessage.calls.reset();
    onWindowOpen = jasmine.createSpy('windowOpen').and.callFake(NOOP);
    windowOpen = (url) => onWindowOpen(url);
    fetchUrl = jasmine.createSpy('fetchUrl').and.callFake(NOOP);
    background = new Background(
      callbacks,
      callbackListener,
      permissionsStorage,
      VERSION,
      PERMISSION_PAGE,
      () => isFirefox,
      windowOpen,
      reload,
      sendNativeMessage,
      getExtensionInfo,
      (url) => fetchUrl(url)
    );
    callbacks.reset();
    storage.clear(done);
  });

  async function extensionMethodTest(method: string | undefined, expected: any): Promise<void> {
    await background.onMessageExternal(method === undefined ? method : { method }, SENDER_ID, callback).then(resolved);
    expect(callback).toHaveBeenCalledOnceWith(expected);
    expect(resolved).toHaveBeenCalledOnceWith(expected);
  }

  it('reload', async () => {
    await extensionMethodTest('reload', undefined);
    expect(reload).toHaveBeenCalled();
  });

  it('getExtensionInfo', async () => {
    await extensionMethodTest('getExtensionInfo', { success: true, version: VERSION });
    expect(reload).not.toHaveBeenCalled();
  });

  it('updateApp', async () => {
    await extensionMethodTest('updateApp', UPDATE_RESPONSE);
    expect(reload).not.toHaveBeenCalled();
  });

  it('undefined', async () => {
    await extensionMethodTest(undefined, NOT_CORRECT_RESPONSE);
    expect(reload).not.toHaveBeenCalled();
  });

  it('other tab closed', async () => {
    background.onTabRemoved(0);
  });

  it('no app installed', async () => {
    appResponse = undefined;
    await background.onMessageExternal(READ_MESSAGE, SENDER_ID, callback).then(resolved);

    expect(onWindowOpen).not.toHaveBeenCalled();
    expect(sendNativeMessage).toHaveBeenCalledOnceWith(NATIVE_APP_ID, READ_APP_MESSAGE1, jasmine.any(Function));
    expect(callback).toHaveBeenCalledOnceWith(NO_APP_RESPONSE);
    expect(resolved).toHaveBeenCalledOnceWith(NO_APP_RESPONSE);
  });

  it('firefox, but app not installed', async () => {
    appResponse = undefined;
    isFirefox = true;
    await background.onMessageExternal(READ_MESSAGE, SENDER_ID, callback).then(resolved);

    expect(onWindowOpen).not.toHaveBeenCalled();
    expect(sendNativeMessage).toHaveBeenCalledOnceWith(NATIVE_APP_ID, READ_APP_MESSAGE_FIREFOX, jasmine.any(Function));
    expect(callback).toHaveBeenCalledOnceWith(NO_APP_RESPONSE);
    expect(resolved).toHaveBeenCalledOnceWith(NO_APP_RESPONSE);
  });

  it('clear permissions', async () => {
    permissionsStorage.addGranted(EXTENSION_ID, [{ type: 'HTML_GRANT_ID', html: 'HTML_GRANT' }]);
    permissionsStorage.addRejected(EXTENSION_ID, [{ type: 'HTML_REJECT_ID', html: 'HTML_REJECT' }]);
    expect(await background.onMessage({ message: CLEAR_MESSAGE, extensionId: EXTENSION_ID })).toBeUndefined();
    expect(permissionsStorage.get(EXTENSION_ID)).toEqual({ name: '', granted: [], rejected: [] });
  });

  it('call plugin, grant permissions', async () => {
    const onWindowOpenPromise = new Promise<void>((resolve) => {
      onWindowOpen = jasmine.createSpy('onWindowOpen').and.callFake((url) => {
        expect(url).toEqual(PERMISSION_PAGE + '?0');
        appResponse = SUCCESS;
        background.onMessage({ index: 0, message: 'grant', tabId: 0 });
        callbacks.get(0).promise.resolve(CallbacksResult.GRANTED);
        resolve();
      });
    });

    appResponse = READ_RESPONSE;
    const backgroundPromise = background.onMessageExternal(READ_MESSAGE, SENDER_ID, callback).then(resolved);

    await Promise.all([onWindowOpenPromise, backgroundPromise]);

    expect(onWindowOpen).toHaveBeenCalledOnceWith(PERMISSION_PAGE + '?0');
    expect(sendNativeMessage.calls.allArgs()).toEqual([
      [NATIVE_APP_ID, READ_APP_MESSAGE1, jasmine.any(Function)],
      [NATIVE_APP_ID, READ_APP_MESSAGE2, jasmine.any(Function)],
    ]);
    expect(callback).toHaveBeenCalledOnceWith(SUCCESS);
    expect(resolved).toHaveBeenCalledOnceWith(SUCCESS);
  });

  function rejectOrCancel(name: string, callbacksResult: CallbacksResult, response: any): void {
    it(`call plugin, ${name} permissions`, async () => {
      const onWindowOpenPromise = new Promise<void>((resolve) => {
        onWindowOpen = jasmine.createSpy('onWindowOpen').and.callFake(async (url) => {
          expect(url).toEqual(PERMISSION_PAGE + '?0');
          if (callbacksResult === CallbacksResult.REJECTED) {
            background.onMessage({ index: 0, message: 'reject', tabId: 0 });
            callbacks.get(0).promise.resolve(callbacksResult);
          } else {
            const record = await (background.onMessage({ index: 0, message: 'get', tabId: 0 }) as Promise<DataRequest>);
            expect(record).toEqual({ message: 'data', record: CANCEL_RECORD });
            background.onTabRemoved(0);
          }
          resolve();
        });
      });

      appResponse = READ_RESPONSE;
      const backgroundPromise = background.onMessageExternal(READ_MESSAGE, SENDER_ID, callback).then(resolved);

      await Promise.all([onWindowOpenPromise, backgroundPromise]);

      expect(onWindowOpen).toHaveBeenCalledOnceWith(PERMISSION_PAGE + '?0');
      expect(sendNativeMessage).toHaveBeenCalledOnceWith(NATIVE_APP_ID, READ_APP_MESSAGE1, jasmine.any(Function));
      expect(callback).toHaveBeenCalledOnceWith(response);
      expect(resolved).toHaveBeenCalledOnceWith(response);
    });
  }

  rejectOrCancel('reject', CallbacksResult.REJECTED, REJECTED_RESPONSE);
  rejectOrCancel('canceled', CallbacksResult.CANCELED, CANCELED_RESPONSE);

  it('read, then write - new tab, new permission', async () => {
    {
      const onWindowOpenPromise = new Promise<void>((resolve) => {
        onWindowOpen = jasmine.createSpy('onWindowOpen').and.callFake((url) => {
          expect(url).toEqual(PERMISSION_PAGE + '?0');
          appResponse = SUCCESS;
          background.onMessage({ index: 0, message: 'grant', tabId: 0 });
          callbacks.get(0).promise.resolve(CallbacksResult.GRANTED);
          resolve();
        });
      });

      appResponse = READ_RESPONSE;
      const backgroundPromise = background.onMessageExternal(READ_MESSAGE, SENDER_ID, callback).then(resolved);

      await Promise.all([onWindowOpenPromise, backgroundPromise]);

      expect(onWindowOpen).toHaveBeenCalledOnceWith(PERMISSION_PAGE + '?0');
      expect(sendNativeMessage.calls.allArgs()).toEqual([
        [NATIVE_APP_ID, READ_APP_MESSAGE1, jasmine.any(Function)],
        [NATIVE_APP_ID, READ_APP_MESSAGE2, jasmine.any(Function)],
      ]);
      expect(callback).toHaveBeenCalledOnceWith(SUCCESS);
      expect(resolved).toHaveBeenCalledOnceWith(SUCCESS);
    }

    onWindowOpen.calls.reset();
    sendNativeMessage.calls.reset();
    callback.calls.reset();
    resolved.calls.reset();
  
    {
      const onWindowOpenPromise = new Promise<void>((resolve) => {
        onWindowOpen = jasmine.createSpy('onWindowOpen').and.callFake((url) => {
          expect(url).toEqual(PERMISSION_PAGE + '?1');
          appResponse = SUCCESS;
          background.onMessage({ index: 1, message: 'grant', tabId: 0 });
          callbacks.get(1).promise.resolve(CallbacksResult.GRANTED);
          resolve();
        });
      });

      appResponse = WRITE_RESPONSE;
      const backgroundPromise = background.onMessageExternal(WRITE_MESSAGE, SENDER_ID, callback).then(resolved);

      await Promise.all([onWindowOpenPromise, backgroundPromise]);

      expect(onWindowOpen).toHaveBeenCalledOnceWith(PERMISSION_PAGE + '?1');
      expect(sendNativeMessage.calls.allArgs()).toEqual([
        [NATIVE_APP_ID, WRITE_APP_MESSAGE1, jasmine.any(Function)],
        [NATIVE_APP_ID, WRITE_APP_MESSAGE2, jasmine.any(Function)],
      ]);

      expect(callback).toHaveBeenCalledOnceWith(SUCCESS);
      expect(resolved).toHaveBeenCalledOnceWith(SUCCESS);
    }
  });

  it('api message, success', async () => {
    fetchUrl = () => Promise.reject();
    const result = await background.onMessage(WEB_API_MESSAGE);
    expect(result).toEqual(WEB_API_FAIL);
  });

  it('api message, success', async () => {
    const onWindowOpenPromise = new Promise<void>((resolve) => {
      onWindowOpen = jasmine.createSpy('onWindowOpen').and.callFake((url) => {
        expect(url).toEqual(PERMISSION_PAGE + '?0');
        appResponse = SUCCESS;
        background.onMessage({ index: 0, message: 'grant', tabId: 0 });
        callbacks.get(0).promise.resolve(CallbacksResult.GRANTED);
        resolve();
      });
    });

    appResponse = READ_RESPONSE;
    fetchUrl = () => Promise.resolve(READ_MESSAGE);

    const onMessagePromise = await background.onMessage(WEB_API_MESSAGE);

    const result = await Promise.all([onMessagePromise, onWindowOpenPromise]);

    expect(result[0]).toEqual(WEB_API_SUCCESS); 

    expect(onWindowOpen).toHaveBeenCalledOnceWith(PERMISSION_PAGE + '?0');
    expect(sendNativeMessage.calls.allArgs()).toEqual([
      [NATIVE_APP_ID, WEB_API_APP_MESSAGE1, jasmine.any(Function)],
      [NATIVE_APP_ID, WEB_API_APP_MESSAGE2, jasmine.any(Function)],
    ]);
  });
});
