// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { CloseRequest, DataRequest, PermissionsPage } from './permissions/PermissionsPage';

const index = location.search.substr(1);

chrome.runtime.onMessage.addListener((data: DataRequest | CloseRequest) => {
  new PermissionsPage(
    data,
    index,
    (extensionId, callback) => chrome.management.get(extensionId, (extensionInfo) => callback(extensionInfo.name)),
    window.open,
    close,
    (value) => chrome.runtime.sendMessage(value)
  );
});

chrome.tabs.getCurrent((tab) => {
  if (tab !== undefined) {
    chrome.runtime.sendMessage({ message: 'get', index, tabId: tab.id });
  }
});
