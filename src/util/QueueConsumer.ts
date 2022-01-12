// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { clone, NOOP, Runnable } from './Util';
import { Queue } from './Queue';

export type QueueConsumerDone = Runnable;
export type QueueConsumerReceiver<T> = (record: T, done: QueueConsumerDone) => void;

export class QueueConsumer<T extends Object> {
  private readonly data: Queue<T> = new Queue<T>();
  private inProgress = false;

  constructor(private readonly receiver: QueueConsumerReceiver<T>, private readonly onEmpty: Runnable = NOOP) {}

  public put(record: T): void {
    if (this.inProgress) {
      this.data.put(clone(record));
    } else {
      this.inProgress = true;
      this.receiver(record, () => this.next());
    }
  }

  public clear(): void {
    this.data.clear();
  }

  private next(): void {
    const record = this.data.get();

    if (record === undefined) {
      this.inProgress = false;
      this.onEmpty();
    } else {
      this.receiver(record, () => this.next());
    }
  }
}
