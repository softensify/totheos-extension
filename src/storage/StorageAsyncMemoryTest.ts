// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { StorageAsyncMemory } from './StorageAsyncMemory';
import { storageAsyncTest } from './StorageAsyncTest';

describe('StorageAsyncMemory tests', () => {
  storageAsyncTest(new StorageAsyncMemory());
});
