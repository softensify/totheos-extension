// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { NOOP } from './Util';
import { QueueConsumer, QueueConsumerReceiver } from './QueueConsumer';

describe('util.QueueConsumer', () => {
  let received: number[] = [];
  let consumerDone = NOOP;
  const consumer: QueueConsumerReceiver<number> = (record, done) => {
    received.push(record);
    consumerDone = done;
  };

  const queue = new QueueConsumer<number>(consumer);

  beforeEach(() => {
    received = [];
    queue.clear();
  });

  it('empty on start', () => {
    expect(received.length).toBe(0);
  });

  it('put, received, put, received', () => {
    queue.put(1);
    consumerDone();
    queue.put(2);
    consumerDone();
    expect(received).toEqual([1, 2]);
  });

  it('put, put, received, received', () => {
    queue.put(1);
    queue.put(2);
    consumerDone();
    consumerDone();
    expect(received).toEqual([1, 2]);
  });
});
