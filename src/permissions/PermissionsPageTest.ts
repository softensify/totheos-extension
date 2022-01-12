// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { ForPermissionPage } from "../callbacks/Callbacks";
import { WindowOpen, WindowClose } from "../popup/Popup";
import { createDivs, notNull, $ } from "../util/Util";
import { GetExtensionName, getWebStoreUrl, Message, PermissionsPage, Send } from "./PermissionsPage";

describe('PermissionsPage tests', () => {

  let windowOpen: WindowOpen;
  let windowClose: WindowClose;
  let send: Send;
  let getExtensionName: GetExtensionName;

  const DATA_MESSAGE: ForPermissionPage = {
    extensionId: 'EXTENSION_ID',
    htmlAsk: [{ type: 'HTML_ASK_ID', html: 'HTML_ASK' }],
    htmlGranted: [{ type: 'HTML_GRANTED_ID', html: 'HTML_GRANTED' }],
  };

  const WEB_PAGE_MESSAGE: ForPermissionPage = {
    extensionId: 'https://totheos.com/test.json',
    htmlAsk: [{ type: 'HTML_ASK_ID', html: 'HTML_ASK' }],
    htmlGranted: [{ type: 'HTML_GRANTED_ID', html: 'HTML_GRANTED' }],
  };

  createDivs([
    'extension1',
    'extension2',
    'extension3',
    'extension4',
    'extension5',
    'first',
    'other1',
    'other2',
    'granted',
    'ask',
    'id',
    'url',
    'grant',
    'reject',
    'grantedHeader',
  ]);

  beforeEach(() => {
    windowOpen = jasmine.createSpy().and.callFake((_url: string) => {});
    windowClose = jasmine.createSpy().and.callFake(() => {});
    send = jasmine.createSpy().and.callFake((_message: Message) => { });
    getExtensionName = jasmine.createSpy().and.callFake((_extensionId: string, callback: (name: string) => void) => callback('NAME'));
  });

  it('close', () => {
    new PermissionsPage({ message: 'close' }, '0', getExtensionName, windowOpen, windowClose, send);
    expect(windowClose).toHaveBeenCalled();
  });

  function grantOrReject(message: 'grant' | 'reject'): void {
    it(`data, url, ${message}`, () => {
      new PermissionsPage({ message: 'data', record: DATA_MESSAGE }, '0', getExtensionName, windowOpen, windowClose, send);
      expect(notNull($('extension1')).innerText).toEqual('NAME');
      expect(notNull($('extension2')).innerText).toEqual('NAME');
      expect(notNull($('extension3')).innerText).toEqual('NAME');
      expect(notNull($('extension4')).innerText).toEqual('NAME');
      expect(notNull($('extension5')).innerText).toEqual('NAME');
      expect(notNull($('granted')).innerText).toEqual(DATA_MESSAGE.htmlGranted[0].html);
      expect(notNull($('ask')).innerHTML).toEqual(DATA_MESSAGE.htmlAsk[0].html);
      expect(notNull($('id')).innerHTML).toEqual(DATA_MESSAGE.extensionId);
      expect(notNull($('grantedHeader')).style.display).toEqual('block');
      expect(notNull($('first')).style.display).toEqual('none');
      expect(notNull($('other1')).style.display).toEqual('inline');
      expect(notNull($('other2')).style.display).toEqual('block');

      expect(windowOpen).not.toHaveBeenCalled();
      notNull($('url')).click();
      expect(windowOpen).toHaveBeenCalledOnceWith(getWebStoreUrl(DATA_MESSAGE.extensionId));

      expect(send).not.toHaveBeenCalled();
      notNull($(message)).click();
      expect(send).toHaveBeenCalledOnceWith({ message, index: '0' });
    });
  }

  grantOrReject('grant');
  grantOrReject('reject');

  it('data, no htmlGranted', () => {
    const noHtmlAskData = Object.assign({}, DATA_MESSAGE, { htmlGranted: [] });
    new PermissionsPage({ message: 'data', record: noHtmlAskData }, '0', getExtensionName, windowOpen, windowClose, send);
    expect(notNull($('extension1')).innerText).toEqual('NAME');
    expect(notNull($('extension2')).innerText).toEqual('NAME');
    expect(notNull($('extension3')).innerText).toEqual('NAME');
    expect(notNull($('extension4')).innerText).toEqual('NAME');
    expect(notNull($('extension5')).innerText).toEqual('NAME');
    expect(notNull($('granted')).innerText).toEqual('');
    expect(notNull($('ask')).innerHTML).toEqual(DATA_MESSAGE.htmlAsk[0].html);
    expect(notNull($('id')).innerHTML).toEqual(DATA_MESSAGE.extensionId);
    expect(notNull($('grantedHeader')).style.display).toEqual('none');
    expect(notNull($('first')).style.display).toEqual('inline');
    expect(notNull($('other1')).style.display).toEqual('none');
    expect(notNull($('other2')).style.display).toEqual('none');
  });

  it('request from web page', () => {
    new PermissionsPage({ message: 'data', record: WEB_PAGE_MESSAGE }, '0', getExtensionName, windowOpen, windowClose, send);
    expect(notNull($('extension1')).innerText).toEqual('Web Site ' + WEB_PAGE_MESSAGE.extensionId);
  });

  it('not correct message', () => {
    expect(() => new PermissionsPage({ message: 'not correct' } as any, '0', getExtensionName, windowOpen, windowClose, send)).toThrow();
  });
});