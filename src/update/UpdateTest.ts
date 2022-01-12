// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { NOOP } from '../util/Util';
import { NATIVE_APP_ID, OnUpdate, SendNativeMessage, Update, UpdateResponse, UPDATE_PERIOD_IN_MINUTES, UPDATE_URL } from "./Update";
import { Schedule } from "../schedule/Schedule";

describe('Update tests', () => {

  const VERSION = '1.0';

  it('setup', () => {
    const schedule = { setup: jasmine.createSpy().and.callFake(NOOP) } as unknown as Schedule;
    const onUpdate: OnUpdate = jasmine.createSpy().and.callFake(NOOP);
    const sendNativeMessage: SendNativeMessage = jasmine.createSpy().and.callFake(NOOP);
		const update = new Update(onUpdate, schedule, sendNativeMessage);
    update.setup();
    expect(schedule.setup).toHaveBeenCalledOnceWith(UPDATE_PERIOD_IN_MINUTES, jasmine.any(Function));
    expect(sendNativeMessage).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('setup, calls update', async () => {
    let sendNativeMessageResult = { version: VERSION };
    const schedule = { setup: jasmine.createSpy().and.callFake((_periodInMinutes, callback) => callback()) } as unknown as Schedule;
    const onUpdate: OnUpdate = jasmine.createSpy().and.callFake(NOOP);
      const sendNativeMessage = jasmine.createSpy().and.callFake(
        (_application, _message, responseCallback) => { if (responseCallback) { responseCallback(sendNativeMessageResult); } }
      );
    const update = new Update(onUpdate, schedule, sendNativeMessage);
    await update.setup();
    expect(schedule.setup).toHaveBeenCalledOnceWith(UPDATE_PERIOD_IN_MINUTES, jasmine.any(Function));
      expect(sendNativeMessage.calls.allArgs()).toEqual([
        [NATIVE_APP_ID, { method: 'getAppInfo' }, jasmine.any(Function)],
        [NATIVE_APP_ID, { method: 'updateApp', url: UPDATE_URL }],
      ]);
    expect(onUpdate).toHaveBeenCalledWith(sendNativeMessageResult);
  });

  describe('getAppInfo', () => {
    it('getAppInfo, success', async () => {
      let sendNativeMessageResult = { version: VERSION };

      const schedule = { setup: jasmine.createSpy().and.callFake(NOOP) } as unknown as Schedule;
      const onUpdate: OnUpdate = jasmine.createSpy().and.callFake(NOOP);
      const sendNativeMessage = jasmine.createSpy().and.callFake(
        (_application, _message, responseCallback) => responseCallback(sendNativeMessageResult)
      );
      const update = new Update(onUpdate, schedule, sendNativeMessage);
      await update.getAppInfo();
      expect(schedule.setup).not.toHaveBeenCalled();
      expect(sendNativeMessage).toHaveBeenCalledOnceWith(NATIVE_APP_ID, { method: 'getAppInfo' }, jasmine.any(Function));
      expect(onUpdate).toHaveBeenCalledWith(sendNativeMessageResult);
    });

    it('success, but no version', async () => {
      let sendNativeMessageResult = { version: undefined };

      const schedule = { setup: jasmine.createSpy().and.callFake(NOOP) } as unknown as Schedule;
      const onUpdate: OnUpdate = jasmine.createSpy().and.callFake(NOOP);
      const sendNativeMessage = jasmine.createSpy().and.callFake(
        (_application, _message, responseCallback) => responseCallback(sendNativeMessageResult)
      );
      const update = new Update(onUpdate, schedule, sendNativeMessage);
      await update.getAppInfo();
      expect(schedule.setup).not.toHaveBeenCalled();
      expect(sendNativeMessage).toHaveBeenCalledOnceWith(NATIVE_APP_ID, { method: 'getAppInfo' }, jasmine.any(Function));
      expect(onUpdate).toHaveBeenCalledWith(sendNativeMessageResult);
    });

    it('undefined', async () => {
      let sendNativeMessageResult: UpdateResponse | undefined = undefined;

      const schedule = { setup: jasmine.createSpy().and.callFake(NOOP) } as unknown as Schedule;
      const onUpdate: OnUpdate = jasmine.createSpy().and.callFake(NOOP);
      const sendNativeMessage = jasmine.createSpy().and.callFake(
        (_application, _message, responseCallback) => responseCallback(sendNativeMessageResult)
      );
      const update = new Update(onUpdate, schedule, sendNativeMessage);
      await update.getAppInfo();
      expect(schedule.setup).not.toHaveBeenCalled();
      expect(sendNativeMessage).toHaveBeenCalledOnceWith(NATIVE_APP_ID, { method: 'getAppInfo' }, jasmine.any(Function));
      expect(onUpdate).toHaveBeenCalledWith(sendNativeMessageResult);
    });
  });

  describe('update', () => {
    it('success', async () => {
      let sendNativeMessageResult = { version: VERSION };

      const schedule = { setup: jasmine.createSpy().and.callFake(NOOP) } as unknown as Schedule;
      const onUpdate: OnUpdate = jasmine.createSpy().and.callFake(NOOP);
      const sendNativeMessage = jasmine.createSpy().and.callFake(
        (_application, _message, responseCallback) => { if (responseCallback) { responseCallback(sendNativeMessageResult); } }
      );
      const update = new Update(onUpdate, schedule, sendNativeMessage);
      await update.update();
      expect(schedule.setup).not.toHaveBeenCalled();
      expect(sendNativeMessage.calls.allArgs()).toEqual([
        [NATIVE_APP_ID, { method: 'getAppInfo' }, jasmine.any(Function)],
        [NATIVE_APP_ID, { method: 'updateApp', url: UPDATE_URL }],
      ]);
      expect(onUpdate).toHaveBeenCalledWith(sendNativeMessageResult);
    });

    it('undefined', async () => {
      let sendNativeMessageResult: UpdateResponse | undefined = undefined;

      const schedule = { setup: jasmine.createSpy().and.callFake(NOOP) } as unknown as Schedule;
      const onUpdate: OnUpdate = jasmine.createSpy().and.callFake(NOOP);
      const sendNativeMessage = jasmine.createSpy().and.callFake(
        (_application, _message, responseCallback) => { responseCallback(sendNativeMessageResult); }
      );
      const update = new Update(onUpdate, schedule, sendNativeMessage);
      await update.update();
      expect(schedule.setup).not.toHaveBeenCalled();
      expect(sendNativeMessage).toHaveBeenCalledOnceWith(NATIVE_APP_ID, { method: 'getAppInfo' }, jasmine.any(Function));
      expect(onUpdate).toHaveBeenCalledWith(sendNativeMessageResult);
    });
  });
});
