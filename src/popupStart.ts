// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { Popup } from "./popup/Popup";
import { Schedule } from "./schedule/Schedule";
import { NativeAppStatus } from "./state/NativeAppStatus";
import { StorageAsyncBrowser } from "./storage/StorageAsyncBrowser";
import { getStorageAsyncToSync } from "./storage/StorageAsyncToSync";
import { StorageSyncMemory } from "./storage/StorageSyncMemory";
import { OnUpdate } from "./update/OnUpdate";
import { Update } from "./update/Update";
import { NOOP } from './util/Util';

getStorageAsyncToSync(new StorageAsyncBrowser(chrome.storage.local), new StorageSyncMemory(), (storage) => {
	const nativeAppStatus = new NativeAppStatus(storage);
	const onUpdate = new OnUpdate(nativeAppStatus, (url) => window.open(url), chrome.browserAction);
	new Popup(
		nativeAppStatus,
		() => new Update((response) => onUpdate.updateIcon(response), new Schedule(chrome.alarms), chrome.runtime.sendNativeMessage).getAppInfo().then(NOOP)
  );
});