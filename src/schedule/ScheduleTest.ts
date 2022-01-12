// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { ERROR, NOOP } from '../util/Util';
import { Alarm, ChromeAlarms, Schedule } from "./Schedule";

describe('PermissionsPage tests', () => {

	const PERIOD_IN_MINUTES = 60;
  const ALARM: Alarm = { periodInMinutes: PERIOD_IN_MINUTES };

	it('empty, create new alarm, callback', () => {
		const chromeAlarms: ChromeAlarms = {
			getAll: jasmine.createSpy().and.callFake((callback) => callback([])),
			clearAll: jasmine.createSpy().and.callFake(ERROR),
			create: jasmine.createSpy().and.callFake(NOOP),
			onAlarm: {
				addListener: jasmine.createSpy().and.callFake(NOOP),
			}
		};
		const callback = jasmine.createSpy().and.callFake(NOOP);
		new Schedule(chromeAlarms).setup(PERIOD_IN_MINUTES, callback);
		expect(chromeAlarms.getAll).toHaveBeenCalled();
		expect(chromeAlarms.clearAll).not.toHaveBeenCalled();
		expect(chromeAlarms.create).toHaveBeenCalledOnceWith(ALARM);
		expect(chromeAlarms.onAlarm.addListener).toHaveBeenCalledOnceWith(callback);
		expect(callback).toHaveBeenCalled();
	});

	it('one record with different period, clear, create new alarm, callback', () => {
    const chromeAlarms: ChromeAlarms = {
      getAll: jasmine.createSpy().and.callFake((callback) => callback([{ periodInMinutes: PERIOD_IN_MINUTES - 1 }])),
      clearAll: jasmine.createSpy().and.callFake(NOOP),
      create: jasmine.createSpy().and.callFake(NOOP),
      onAlarm: {
        addListener: jasmine.createSpy().and.callFake(NOOP),
      },
    };
    const callback = jasmine.createSpy().and.callFake(NOOP);
    new Schedule(chromeAlarms).setup(PERIOD_IN_MINUTES, callback);
    expect(chromeAlarms.getAll).toHaveBeenCalled();
    expect(chromeAlarms.clearAll).toHaveBeenCalled();
    expect(chromeAlarms.create).toHaveBeenCalledOnceWith(ALARM);
    expect(chromeAlarms.onAlarm.addListener).toHaveBeenCalledOnceWith(callback);
    expect(callback).toHaveBeenCalled();
  });

	it('one record with same period, callback', () => {
    const chromeAlarms: ChromeAlarms = {
      getAll: jasmine.createSpy().and.callFake((callback) => callback([ALARM])),
      clearAll: jasmine.createSpy().and.callFake(NOOP),
      create: jasmine.createSpy().and.callFake(NOOP),
      onAlarm: {
        addListener: jasmine.createSpy().and.callFake(NOOP),
      },
    };
    const callback = jasmine.createSpy().and.callFake(NOOP);
    new Schedule(chromeAlarms).setup(PERIOD_IN_MINUTES, callback);
    expect(chromeAlarms.getAll).toHaveBeenCalled();
    expect(chromeAlarms.clearAll).not.toHaveBeenCalled();
    expect(chromeAlarms.create).not.toHaveBeenCalledOnceWith(ALARM);
    expect(chromeAlarms.onAlarm.addListener).toHaveBeenCalledOnceWith(callback);
    expect(callback).toHaveBeenCalled();
  });

	it('two records, clear, create new alarm, callback', () => {
    const chromeAlarms: ChromeAlarms = {
      getAll: jasmine.createSpy().and.callFake((callback) => callback([ALARM, ALARM])),
      clearAll: jasmine.createSpy().and.callFake(NOOP),
      create: jasmine.createSpy().and.callFake(NOOP),
      onAlarm: {
        addListener: jasmine.createSpy().and.callFake(NOOP),
      },
    };
    const callback = jasmine.createSpy().and.callFake(NOOP);
    new Schedule(chromeAlarms).setup(PERIOD_IN_MINUTES, callback);
    expect(chromeAlarms.getAll).toHaveBeenCalled();
    expect(chromeAlarms.clearAll).toHaveBeenCalled();
    expect(chromeAlarms.create).toHaveBeenCalledOnceWith(ALARM);
    expect(chromeAlarms.onAlarm.addListener).toHaveBeenCalledOnceWith(callback);
    expect(callback).toHaveBeenCalled();
  });
});