// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { PromiseWarp } from "./PromiseWrap";
import { ERROR } from './Util';

describe('PromiseWrap tests', () => {
	it('resolve', async () => {
		const promiseWarp = new PromiseWarp();
		promiseWarp.resolve('test');
		expect(await promiseWarp.getPromise()).toEqual('test');
	});

	it('reject', (done) => {
    const promiseWarp = new PromiseWarp();
    promiseWarp.reject();
    promiseWarp.getPromise().then(ERROR, done);
  });
});
