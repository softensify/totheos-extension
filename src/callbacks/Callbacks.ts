// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { PromiseWarp } from "../util/PromiseWrap";

export interface HtmlPermission {
  readonly type: string;
  readonly html: string;
}

export interface Permission extends HtmlPermission {
  readonly [key: string]: string;
}

export interface ForPermissionPage {
  readonly extensionId: string;
  readonly htmlAsk: HtmlPermission[];
  readonly htmlGranted: HtmlPermission[];
}

export interface AddParameters extends ForPermissionPage {
  readonly permissions: Permission[];
}

export interface CallbackRecord extends AddParameters {
  readonly tabId?: number;
  readonly promise: PromiseWarp<CallbacksResult>;
}

export enum CallbacksResult {
	GRANTED,
	REJECTED,
	CANCELED
}

export interface AddResult {
  readonly index: number;
  readonly promise: PromiseWarp<CallbacksResult>;
}

export class Callbacks {
  private callbacks: CallbackRecord[] = [];

  public add(record: AddParameters): AddResult {
    const index = this.callbacks.length;
    const promise = new PromiseWarp<CallbacksResult>();
    this.callbacks.push({ promise, ...record });

    return { index, promise };
  }

  public get(index: number): CallbackRecord {
    const result = this.callbacks[index];
    if (result === undefined) {
      throw new Error(`Record with index ${index} not found`);
    }
    return result;
  }

  public setTabId(index: number, tabId: number): void {
    this.callbacks[index] = Object.assign({}, this.callbacks[index], { tabId }) ;
  }

  public getByTabId(tabId: number): CallbackRecord | undefined {
    return this.callbacks.find((record) => record.tabId === tabId);
  }

  public reset(): void {
    this.callbacks = [];
  }
}

export function toClonable(record: CallbackRecord): AddParameters {
  return {
    extensionId: record.extensionId,
    htmlGranted: record.htmlGranted,
    htmlAsk: record.htmlAsk,
    permissions: record.permissions,
  };
}
