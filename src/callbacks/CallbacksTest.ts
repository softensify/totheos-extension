// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { AddParameters, CallbackRecord, Callbacks, toClonable } from "./Callbacks";

describe('Callbacks tests', () => {

	const ADD_PARAMETER: AddParameters = {
		extensionId: 'EXTENSION_ID',
		htmlAsk: [{ type: 'HTML_ASK_ID', html: 'HTML_ASK' }],
		htmlGranted: [{ type: 'HTML_GRANTED_ID', html: 'HTML_GRANTED' }],
		permissions: [],
	};

	const callbacks = new Callbacks();

	beforeEach(() => callbacks.reset());

	it('get not existed', () => expect(() => callbacks.get(0)).toThrow());

	it('add, get', () => {
		const afterAdd = callbacks.add(ADD_PARAMETER);
		const result = callbacks.get(afterAdd.index);
		expect(toClonable(result)).toEqual(ADD_PARAMETER);
	});

  it('getByTabId not existed', () => expect(callbacks.getByTabId(0)).toBeUndefined());

	it('add, setTabId, getByTabId', () => {
    const afterAdd = callbacks.add(ADD_PARAMETER);
    callbacks.setTabId(afterAdd.index, 1);
		const result = callbacks.getByTabId(1) as CallbackRecord;
    expect(toClonable(result)).toEqual(ADD_PARAMETER);
  });
});