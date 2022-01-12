// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { WindowOpen } from "../popup/Popup";
import { NativeAppStatus } from "../state/NativeAppStatus";
import { UpdateResponse } from "./Update";

export const DOWNLOAD_URL = 'https://totheos.com/download.html';

export interface ChromeBrowserAction {
  setBadgeBackgroundColor(details: chrome.browserAction.BadgeBackgroundColorDetails, callback?: () => void): void;
  setBadgeText(details: chrome.browserAction.BadgeTextDetails, callback?: () => void): void;
}

export class OnUpdate {
  private firstTime = true;

  constructor(
    private readonly nativeAppStatus: NativeAppStatus,
    private readonly windowOpen: WindowOpen,
    private readonly chromeBrowserAction: ChromeBrowserAction
  ) {}

  public openPageAndUpdateIcon(response: UpdateResponse | undefined) {
    if (this.firstTime && response === undefined) {
      this.windowOpen(DOWNLOAD_URL);
    }
    this.firstTime = false;
    this.updateIcon(response);
  }

  public updateIcon(response: UpdateResponse | undefined) {
    this.nativeAppStatus.setVersion(response);
    if (response === undefined) {
      this.chromeBrowserAction.setBadgeBackgroundColor({ color: 'red' });
      this.chromeBrowserAction.setBadgeText({ text: '!' });
    } else {
      this.chromeBrowserAction.setBadgeText({ text: '' });
    }
  }
}