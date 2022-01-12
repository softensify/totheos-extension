// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { notNull, $, clone, ERROR, notUndefined, getQueryVariable, parseUrl } from './Util';

describe('Util tests', () => {

  describe('notNull', () => {
    it('not null', () => expect(notNull('123')).toEqual('123'));
    it('undefined', () => expect(notNull(undefined)).toBeUndefined());
    it('null', () => expect(() => notNull(null)).toThrow());
  });

  describe('$', () => {
    const body = document.getElementsByTagName('body')[0];
    const div = document.createElement('div');
    div.id = 'test';
    div.innerText = 'Test';
    body.appendChild(div);

    it('exists', () => expect(notNull($('test')).innerText).toEqual('Test'));
    it('not exists', () => expect($('not_exists')).toBeNull());
  });

  it('notUndefined', () => {
    expect(notUndefined('aaa')).toEqual('aaa');
    expect(() => notUndefined(undefined)).toThrowError();
  });

  it('ERROR', () => {
    expect(ERROR).toThrowError();
  });

  describe('clone', () => {
    it('null', () => expect(clone(null)).toBe(null));
    it('undefined', () => expect(clone(undefined)).toBe(undefined));
    it('1', () => expect(clone(1)).toBe(1));
    it('abc', () => expect(clone('abc')).toBe('abc'));
    it('{}', () => expect(clone({})).toEqual({}));
    it('[]', () => expect(clone([])).toEqual([]));

    it('object', () => {
      const object = {
        a: 1,
        b: 'x',
        c: undefined,
        d: null,
      };
      expect(clone(object)).toEqual(object);
    });

    it('array', () => {
      const array = ['a', 1];
      expect(clone(array)).toEqual(array);
    });
  });

	describe('getQueryVariable', () => {
    it('getQueryVariable(name)', () => {
      expect(getQueryVariable('ccc', '?aaa=bbb&ccc=ddd&eee=fff')).toEqual('ddd');
    });

    it('getQueryVariable(name and value with escaped chars)', () => {
      expect(getQueryVariable('ccc ', '?aaa=bbb&ccc%20=ddd%21&eee=fff')).toEqual('ddd!');
    });

    it('getQueryVariable(name not found)', () => {
      expect(getQueryVariable('ggg', '?aaa=bbb&ccc=ddd&eee=fff')).toBeNull();
    });
  });

	describe('util.parseUrl', () => {
    it('parse url', () => {
      const result = parseUrl('https://www.test.com:8080/aaa/bbb?ccc=ddd&eee=fff#ggg');
      const expected = {
        protocol: 'https:',
        host: 'www.test.com:8080',
        hostname: 'www.test.com',
        port: '8080',
        pathname: '/aaa/bbb',
        search: '?ccc=ddd&eee=fff',
        hash: '#ggg',
      };
      expect(result).toEqual(expected);
    });
  });

});
