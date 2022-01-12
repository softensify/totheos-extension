// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { notUndefined } from '../util/Util';
import { StorageSyncMemory } from './StorageSyncMemory';
import { StorageSyncPrefix } from './StorageSyncPrefix';
import { storageSyncTest } from './StorageSyncTest';

const PREFIX1 = 'prefix1';
const PREFIX2 = 'prefix2';

describe('StorageSyncPrefix', () => {
  storageSyncTest(new StorageSyncPrefix(new StorageSyncMemory(), PREFIX1));

  describe('2 storages', () => {
    const storage1 = new StorageSyncPrefix(new StorageSyncMemory(), PREFIX1);
    const storage2 = new StorageSyncPrefix(new StorageSyncMemory(), PREFIX2);

    beforeEach((callback) => storage1.clear(() => storage2.clear(callback)));

    it('set in one, not found in another', () => {
      storage1.set('key1', 'value1');

      expect(notUndefined(storage1.get('key1'))).toBe('value1');
      expect(storage2.get('key1')).toBeUndefined();
    });

    it('set are isolated', () => {
      storage1.set('key1', 'value1');
      storage2.set('key1', 'value2');

      expect(notUndefined(storage1.get('key1'))).toBe('value1');
      expect(notUndefined(storage2.get('key1'))).toBe('value2');
    });

    it('clear is isolated', (callback) => {
      storage1.set('key1', 'value1');
      storage2.set('key1', 'value2');
      storage1.clear(() => {
        expect(storage1.get('key1')).toBeUndefined();
        expect(notUndefined(storage2.get('key1'))).toBe('value2');
        callback();
      });
    });

    it('keys are isolated', () => {
      storage1.set('key1', 'value1');
      storage2.set('key2', 'value2');

      expect(storage1.keys()).toEqual(['key1']);
      expect(storage2.keys()).toEqual(['key2']);
    });
  });
});
