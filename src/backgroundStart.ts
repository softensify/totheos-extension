// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { Background } from "./background/Background";
import { Callbacks } from "./callbacks/Callbacks";
import { CallbackListener } from "./callbacks/Listener";
import { PermissionsStorage, PERMISSION_STORAGE_PREFIX } from "./permissions/Permissions";
import { Schedule } from "./schedule/Schedule";
import { NativeAppStatus } from "./state/NativeAppStatus";
import { StorageAsyncBrowser } from "./storage/StorageAsyncBrowser";
import { getStorageAsyncToSync } from "./storage/StorageAsyncToSync";
import { StorageSyncMemory } from "./storage/StorageSyncMemory";
import { StorageSyncPrefix } from "./storage/StorageSyncPrefix";
import { OnUpdate } from "./update/OnUpdate";
import { Update } from './update/Update';

getStorageAsyncToSync(new StorageAsyncBrowser(chrome.storage.local), new StorageSyncMemory(), (storage) => {
  const permissionsStorage = new PermissionsStorage(new StorageSyncPrefix(storage, PERMISSION_STORAGE_PREFIX));
  const callbacks = new Callbacks();
  const callbackListener = new CallbackListener(callbacks, permissionsStorage);

  const background = new Background(
    callbacks,
    callbackListener,
    permissionsStorage,
    chrome.runtime.getManifest().version,
    chrome.runtime.getURL('permissions.html'),
    () => navigator.userAgent.match(/firefox/i) !== null,
    (url) => chrome.tabs.create({ url }),
    chrome.runtime.reload,
    chrome.runtime.sendNativeMessage,
    chrome.management.get,
    (url) => fetch(url).then((response) => response.json())
  );

  chrome.runtime.onMessage.addListener((message) => {
    void background.onMessage(message).then((toSend) => {
      if (toSend !== undefined) {
        chrome.runtime.sendMessage(toSend);
      }
    });
  });

  chrome.runtime.onMessageExternal.addListener(
    (request, sender, callback) => void background.onMessageExternal(request, sender.id, callback)
  );

  chrome.tabs.onRemoved.addListener((tabId) => background.onTabRemoved(tabId));

  const onUpdate = new OnUpdate(new NativeAppStatus(storage), (url) => chrome.tabs.create({ url }), chrome.browserAction);
  new Update((response) => onUpdate.openPageAndUpdateIcon(response), new Schedule(chrome.alarms), chrome.runtime.sendNativeMessage).setup();
});
