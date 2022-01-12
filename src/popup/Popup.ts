// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { NativeAppStatus } from "../state/NativeAppStatus";
import { notNull, $ } from "../util/Util";

export type WindowOpen = (url: string) => void;
export type WindowClose = () => void;
export type Retry = () => Promise<void>;

export class Popup {
  constructor(
    nativeAppStatus: NativeAppStatus,
    retry: Retry,
  ) {
    const updatePopup = () => {
      const version = nativeAppStatus.getVersion();
      const connect = nativeAppStatus.getConnect();

      notNull($('version')).innerText = version === undefined ? 'Unknown' : version;
      notNull($('connected')).style.display = connect ? 'block' : 'none';
      notNull($('error')).style.display = connect ? 'none' : 'block';
    };

    void retry().then(updatePopup);
  }
}