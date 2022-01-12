// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { StorageSyncMemory } from "../storage/StorageSyncMemory";
import { NativeAppStatus } from "./NativeAppStatus";

describe('NativeAppStatus tests', () => {

	const storage = new StorageSyncMemory();
	const nativeAppStatus = new NativeAppStatus(storage);

	beforeEach((callback) => storage.clear(callback));

	it('getVersion when not set', () => expect(nativeAppStatus.getVersion()).toBeUndefined());

	it('getConnect when not set', () => expect(nativeAppStatus.getConnect()).toBeFalse());

	it('set undefined, get', () => {
		nativeAppStatus.setVersion(undefined);
		expect(nativeAppStatus.getVersion()).toBeUndefined();
		expect(nativeAppStatus.getConnect()).toBeFalse();
	});

	it('set with undefined version, get', () => {
    nativeAppStatus.setVersion({ version: undefined });
		expect(nativeAppStatus.getVersion()).toBeUndefined();
		expect(nativeAppStatus.getConnect()).toBeTrue();
	});

	it('set, get', () => {
    nativeAppStatus.setVersion({ version: '1.0' });
    expect(nativeAppStatus.getVersion()).toEqual('1.0');
    expect(nativeAppStatus.getConnect()).toBeTrue();
  });
});
