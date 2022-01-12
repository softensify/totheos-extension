// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

export type PromiseResolve<T> = (value: T | PromiseLike<T>) => void;
export type PromiseReject = (reason?: any) => void;
export type PromiseWrapParameter<T> = (resolve: PromiseResolve<T>, reject: PromiseReject) => void;

export class PromiseWarp<T> {
  private resolveFunc: PromiseResolve<T>;
  private rejectFunc: PromiseReject;
  private readonly promise: Promise<T>;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolveFunc = resolve;
      this.rejectFunc = reject;
    });
  }

  public getPromise(): Promise<T> {
    return this.promise;
  }

  public resolve(value: T): void {
    this.resolveFunc(value);
  }

  public reject(): void {
    this.rejectFunc();
  }
}
