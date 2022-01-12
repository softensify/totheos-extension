// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { StorageSyncMemory } from "../storage/StorageSyncMemory";
import { PermissionsStorage } from "./Permissions";

describe('Permissions tests', () => {

	const EXTENSION_ID1 = 'EXTENSION_ID1';
	const EXTENSION_ID2 = 'EXTENSION_ID2';

	const PERMISSION1 = { type: 'PERMISSION1', html: 'DESCRIPTION1' };
	const PERMISSION2 = { type: 'PERMISSION2', html: 'DESCRIPTION2' };

	const EMPTY = { name: '', granted: [], rejected: [] };

	const storageSyncMemory = new StorageSyncMemory();
	const permissionsStorage = new PermissionsStorage(storageSyncMemory);

	beforeEach((callback) => storageSyncMemory.clear(callback));

	it('get empty', () => expect(permissionsStorage.get(EXTENSION_ID1)).toEqual(EMPTY));

	it('getAll empty', () => expect(permissionsStorage.getAll()).toEqual([]));

	it('addGranted, get', () => {
		permissionsStorage.addGranted(EXTENSION_ID1, [PERMISSION1]);
		expect(permissionsStorage.get(EXTENSION_ID1)).toEqual({ name: '', granted: [PERMISSION1], rejected: [] });
		expect(permissionsStorage.getAll()).toEqual([{ id: EXTENSION_ID1, name: '', granted: [PERMISSION1], rejected: [] }]);
	});

	it('addRejected, get', () => {
		permissionsStorage.addRejected(EXTENSION_ID1, [PERMISSION1]);
		expect(permissionsStorage.get(EXTENSION_ID1)).toEqual({ name: '', granted: [], rejected: [PERMISSION1] });
	});

	it('addGranted, addGranted, get', () => {
		permissionsStorage.addGranted(EXTENSION_ID1, [PERMISSION1]);
		permissionsStorage.addGranted(EXTENSION_ID1, [PERMISSION2]);
		expect(permissionsStorage.get(EXTENSION_ID1)).toEqual({ name: '', granted: [PERMISSION1, PERMISSION2], rejected: [] });
	});

	it('addRejected, addRejected, get', () => {
		permissionsStorage.addRejected(EXTENSION_ID1, [PERMISSION1]);
		permissionsStorage.addRejected(EXTENSION_ID1, [PERMISSION2]);
		expect(permissionsStorage.get(EXTENSION_ID1)).toEqual({ name: '', granted: [], rejected: [PERMISSION1, PERMISSION2] });
	});

	it('addGranted, addRejected, get', () => {
		permissionsStorage.addGranted(EXTENSION_ID1, [PERMISSION1]);
		permissionsStorage.addRejected(EXTENSION_ID1, [PERMISSION2]);
		expect(permissionsStorage.get(EXTENSION_ID1)).toEqual({ name: '', granted: [PERMISSION1], rejected: [PERMISSION2] });
	});

	it('addGranted, addRejected, get', () => {
		permissionsStorage.addGranted(EXTENSION_ID1, [PERMISSION1]);
		permissionsStorage.addRejected(EXTENSION_ID2, [PERMISSION2]);
		expect(permissionsStorage.get(EXTENSION_ID1)).toEqual({ name: '', granted: [PERMISSION1], rejected: [] });
		expect(permissionsStorage.get(EXTENSION_ID2)).toEqual({ name: '', granted: [], rejected: [PERMISSION2] });
	});
});
