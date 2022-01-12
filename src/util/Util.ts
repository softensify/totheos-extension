// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import justClone = require('just-clone');

export type Consumer<T> = (value: T) => void;
export type Runnable = () => void;
export type Producer<T> = () => T;
export type Transform<T, R> = (value: T) => R;
export const NOOP = () => {};
export const ERROR = () => {
  throw new Error();
};
const HTTP = 'http://';
const HTTPS = 'https://';

export function clone<T>(value: T): T {
  return justClone({ wrap: value }).wrap;
}

export function notUndefined<T>(value: T | undefined): T {
  if (value === undefined) {
    throw new Error('Unexpected undefined value');
  }

  return value;
}

export function $(id: string): HTMLElement | null {
  return document.getElementById(id);
}

export function notNull<T>(value: T | null): T {
  if (value === null) {
    throw new Error('Unexpected null value');
  }

  return value;
}

export function createDivs(ids: string[]): void {
  const body = document.getElementsByTagName('body')[0];
  ids.forEach((id) => {
    const div = document.createElement('div');
    div.id = id;
    body.appendChild(div);
  });
}

export function getQueryVariable(variable: string, search: string): string | null {
  const query = search.substring(1);
  const vars = query.split('&');
  for (const v of vars) {
    const pair = v.split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }

  return null;
}

export interface ParseUrlResult {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
}

export function parseUrl(href: string): ParseUrlResult | null {
  const re = new RegExp(
    [
      '^(https?:)//', // protocol
      '(([^:/?#]*)', // hostname
      '(?::([0-9]+))?)', // port
      '(/{0,1}[^?#]*)', // pathname
      '(\\?[^#]*|)', // search
      '(#.*|)$', // hash
    ].join('')
  );
  const match = re.exec(href);

  return (
    match && {
      protocol: match[1],
      host: match[2],
      hostname: match[3],
      port: match[4],
      pathname: match[5],
      search: match[6],
      hash: match[7],
    }
  );
}

export function isHttpOrHttps(value: string | undefined): boolean {
  return value !== undefined && (value.startsWith(HTTP) || value.startsWith(HTTPS));
}
