// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { NOOP } from './../util/Util';
import { StorageAsyncMemory } from './StorageAsyncMemory';
import { getStorageAsyncToSync } from './StorageAsyncToSync';
import { StorageSyncMemory } from './StorageSyncMemory';
import { storageSyncTest } from './StorageSyncTest';

const storageAsyncMemory = new StorageAsyncMemory();
const storageMemory = new StorageSyncMemory();

describe('StorageAsyncToSync tests', () => {
  getStorageAsyncToSync(storageAsyncMemory, storageMemory, storageSyncTest);
});

describe('StorageAsyncToSync more tests', () => {
  beforeAll(() => storageMemory.clear(NOOP));

  it('same value will not be updated', (done) => {
    getStorageAsyncToSync(storageAsyncMemory, storageMemory, (StorageAsyncToSync) => {
      StorageAsyncToSync.set('key1', 'value1');
      storageMemory.set('key1', 'value2');
      StorageAsyncToSync.set('key1', 'value2');
      storageAsyncMemory.getAll((all) => {
        expect(all.key1).toBe('value1');
        done();
      });
    });
  });

  it('value persisted', (done) => {
    getStorageAsyncToSync(storageAsyncMemory, storageMemory, (StorageAsyncToSync1) => {
      StorageAsyncToSync1.set('key1', 'value1');
      getStorageAsyncToSync(storageAsyncMemory, storageMemory, (StorageAsyncToSync2) => {
        expect(StorageAsyncToSync2.get('key1')).toBe('value1');
        done();
      });
    });
  });
});
