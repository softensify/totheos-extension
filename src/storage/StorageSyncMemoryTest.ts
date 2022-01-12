// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { StorageSyncMemory } from './StorageSyncMemory';
import { storageSyncTest } from './StorageSyncTest';

describe('StorageSyncMemory tests', () => {
  storageSyncTest(new StorageSyncMemory());
});
