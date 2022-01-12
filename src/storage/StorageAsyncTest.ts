// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { StorageAsync } from './StorageAsync';

export function storageAsyncTest(storageImpl: StorageAsync): void {
  beforeEach((callback) => storageImpl.clear(callback));

  it('no records', (callback) => {
    storageImpl.getAll((data) => {
      expect(data).toEqual({});
      callback();
    });
  });

  it('set, getAll', (callback) => {
    storageImpl.set('key1', 'value1', () => {
      storageImpl.getAll((data) => {
        expect(data).toEqual({ key1: 'value1' });
        callback();
      });
    });
  });

  it('set, set, getAll', (callback) => {
    storageImpl.set('key1', 'value1', () => {
      storageImpl.set('key2', 'value2', () => {
        storageImpl.getAll((data) => {
          expect(data).toEqual({ key1: 'value1', key2: 'value2' });
          callback();
        });
      });
    });
  });

  it('set, update, getAll', (callback) => {
    storageImpl.set('key1', 'value1', () => {
      storageImpl.set('key1', 'value2', () => {
        storageImpl.getAll((data) => {
          expect(data).toEqual({ key1: 'value2' });
          callback();
        });
      });
    });
  });

  it('set, remove, getAll', (callback) => {
    storageImpl.set('key1', 'value1', () => {
      storageImpl.set('key1', undefined, () => {
        storageImpl.getAll((data) => {
          expect(data).toEqual({});
          callback();
        });
      });
    });
  });

  it('set, clear, getAll', (callback) => {
    storageImpl.set('key1', 'value1', () => {
      storageImpl.clear(() => {
        storageImpl.getAll((data) => {
          expect(data).toEqual({});
          callback();
        });
      });
    });
  });
}
