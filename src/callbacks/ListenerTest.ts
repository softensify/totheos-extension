// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { PermissionsStorage } from "../permissions/Permissions";
import { StorageSyncMemory } from "../storage/StorageSyncMemory";
import { AddParameters, CallbackRecord, Callbacks, CallbacksResult, toClonable } from "./Callbacks";
import { CallbackListener } from "./Listener";

describe('Listener tests', () => {

	const storage = new StorageSyncMemory();
	const permissionsStorage = new PermissionsStorage(storage);
	const callbacks = new Callbacks();
	const callbackListener = new CallbackListener(callbacks, permissionsStorage);

	const ADD_PARAMETER: AddParameters = {
    extensionId: 'EXTENSION_ID',
    htmlAsk: [{ type: 'HTML_ASK_ID', html: 'HTML_ASK' }],
    htmlGranted: [{ type: 'HTML_GRANTED_ID', html: 'HTML_GRANTED' }],
    permissions: [],
  };

	beforeEach((callback) => {
		callbacks.reset();
		storage.clear(callback);
	});

  function grantOrReject(message: string, expected: CallbacksResult): void {
    it(message, (callback) => {
      let promiseResult: CallbacksResult | undefined = undefined;
      const afterAdd = callbacks.add(ADD_PARAMETER);
      afterAdd.promise.getPromise().then((value) => (promiseResult = value));
      expect(promiseResult).toBeUndefined();
      const result = callbackListener.handle({ index: afterAdd.index, message, tabId: 1 } as any);
      expect(result).toBeUndefined();
      setTimeout(() => {
        expect(promiseResult as unknown as CallbacksResult).toEqual(expected);
        callback();
      }, 0);
    });

  }

	it('not correct message', () => expect(callbackListener.handle({ index: 0, message: 'other', tabId: 1 } as any)).toBeUndefined());

  it('get', () => {
    const afterAdd = callbacks.add(ADD_PARAMETER);
    const result = callbackListener.handle({ index: afterAdd.index, message: 'get', tabId: 1 } as any);
    expect(result).toEqual(ADD_PARAMETER);
    const byTab = callbacks.getByTabId(1) as CallbackRecord;
    expect(toClonable(byTab)).toEqual(ADD_PARAMETER);
	});

  grantOrReject('grant', CallbacksResult.GRANTED);
  grantOrReject('reject', CallbacksResult.REJECTED);
});
