// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { clone } from '../util/Util';
import { StorageSync } from './StorageSync';

export function storageSyncTest(storageImpl: StorageSync): void {
  const testObject = {
    a: 'StringValue',
    b: 10,
    c: true,
  };

  beforeEach((callback) => storageImpl.clear(callback));

  it('no keys', () => {
    const noKeys = storageImpl.keys();
    expect(noKeys.length).toBe(0);
  });

  it('keys', () => {
    storageImpl.set('StorageTest.keys.a', 1);
    storageImpl.set('StorageTest.keys.b', 'c');
    const keys = storageImpl.keys();
    expect(keys).toEqual(['StorageTest.keys.a', 'StorageTest.keys.b']);
  });

  it('keys after clear', (callback) => {
    storageImpl.set('StorageTest.keys.a', 1);
    storageImpl.set('StorageTest.keys.b', 'c');
    storageImpl.clear(() => {
      const keys = storageImpl.keys();
      expect(keys.length).toBe(0);
      callback();
    });
  });

  it('keys on set undefined (delete)', () => {
    storageImpl.set('StorageTest.keys.set.a', 1);
    storageImpl.set('StorageTest.keys.set.b', 'c');
    storageImpl.set('StorageTest.keys.set.b', undefined);

    const keys = storageImpl.keys();
    expect(keys).toEqual(['StorageTest.keys.set.a']);
  });

  it('get not exists value', () => {
    const data = storageImpl.get('NOT_EXISTS');
    expect(data).toBeUndefined();
  });

  it('set, get', () => {
    const key = 'StorageTest';
    const value = 'TestValue';
    storageImpl.set(key, value);
    const data = storageImpl.get(key);
    expect(data).toBe(value);
  });

  it('set undefined, get undefined', () => {
    const key = 'StorageTest.undefined';
    const value: string | undefined = undefined;
    storageImpl.set(key, value);
    const data = storageImpl.get(key);
    expect(data).toBe(value);
  });

  it('set object, get object', () => {
    const key = 'StorageTest.object';
    storageImpl.set(key, testObject);
    const data = storageImpl.get(key);
    expect(data).toEqual(testObject);
  });

  it('set object, get clone', () => {
    const value = clone(testObject);
    const key = 'StorageTest.clone';
    storageImpl.set(key, value);
    value.a = 'OtherValue1';
    const data = storageImpl.get(key);
    value.a = 'OtherValue2';
    expect(testObject.a).toBe('StringValue');
    expect(data).toEqual(testObject);
  });
}
