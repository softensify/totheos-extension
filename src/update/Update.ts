// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { Schedule } from '../schedule/Schedule';
import { Consumer } from '../util/Util';

export const UPDATE_PERIOD_IN_MINUTES = 60;
export const UPDATE_URL = 'https://totheos.com/release.json';

export const NATIVE_APP_ID = 'totheos.com';

export interface UpdateResponse {
	version: string | undefined;
}

export type OnUpdate = Consumer<UpdateResponse | undefined>;
export type SendNativeMessage = (application: string, message: Object, responseCallback?: (response: any) => void) => void;

export class Update {
  constructor(
    private readonly onUpdate: OnUpdate,
    private readonly schedule: Schedule,
    private readonly sendNativeMessage: SendNativeMessage
  ) {}

  public setup(): void {
    this.schedule.setup(UPDATE_PERIOD_IN_MINUTES, () => this.update());
  }

  public getAppInfo(): Promise<UpdateResponse | undefined> {
    return new Promise((resolve) =>
      this.sendNativeMessage(NATIVE_APP_ID, { method: 'getAppInfo' }, (response) => {
        this.onUpdate(response);
        resolve(response);
      })
    );
  }

	public update() {
		void this.getAppInfo().then((result) => {
			if (result !== undefined) {
				this.sendNativeMessage(NATIVE_APP_ID, { method: 'updateApp', url: UPDATE_URL });
			}
		});
	}
}
