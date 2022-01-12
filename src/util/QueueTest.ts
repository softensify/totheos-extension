// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { Queue } from './Queue';

describe('util.Queue', () => {
  const queue = new Queue<number>();

  beforeEach(() => queue.clear());

  it('empty on start', () => {
    expect(queue.size()).toBe(0);
    expect(queue.get()).toBeUndefined();
  });

  it('put, put, get, get, get', () => {
    queue.put(1);
    queue.put(2);
    expect(queue.size()).toBe(2);
    expect(queue.get()).toBe(1);
    expect(queue.get()).toBe(2);
    expect(queue.size()).toBe(0);
    expect(queue.get()).toBeUndefined();
  });
});
