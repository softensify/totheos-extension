// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { Runnable } from '../util/Util';

export interface Alarm {
  periodInMinutes?: number;
}

export interface ChromeAlarms {
  getAll(callback: (alarms: Alarm[]) => void): void;
  clearAll(callback?: (wasCleared: boolean) => void): void;
  create(alarmInfo: chrome.alarms.AlarmCreateInfo): void;
  onAlarm: {
    addListener(callback: Runnable): void;
  };
}

// only one schedule is supported now
export class Schedule {

  constructor(private readonly chromeAlarms: ChromeAlarms) {}

  setup(periodInMinutes: number, callback: Runnable) {
    this.chromeAlarms.getAll((alarms) => {
      const empty = alarms.length === 0;
      const needClear = !empty && (alarms.length !== 1 || alarms[0].periodInMinutes !== periodInMinutes);
      if (needClear) {
        this.chromeAlarms.clearAll();
      }
      if (needClear || empty) {
        this.chromeAlarms.create({ periodInMinutes });
      }
      callback();
    });

    this.chromeAlarms.onAlarm.addListener(callback);
  }
}
