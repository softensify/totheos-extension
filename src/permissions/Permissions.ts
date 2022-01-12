// Copyright(c) 2022 Softensify Pty Ltd. www.softensify.com All rights reserved.

import { HtmlPermission } from '../callbacks/Callbacks';
import { StorageSync } from '../storage/StorageSync'; 

export interface Permission extends HtmlPermission {
	readonly [id: string]: string;
}

export interface Permissions {
	readonly name: string;
	readonly granted: Permission[];
	readonly rejected: Permission[];
}

export interface PermissionsWithId extends Permissions {
	readonly id: string;
}

export const PERMISSION_STORAGE_PREFIX = 'PERMISSION-';

export class PermissionsStorage {
  constructor(private readonly storage: StorageSync) {}

  public get(extensionId: string): Permissions {
    const result = this.storage.get<Permissions>(extensionId);
    return result === undefined ? { name: '', granted: [], rejected: [] } : result;
  }

  public getAll(): PermissionsWithId[] {
    return this.storage.keys().map((id) => Object.assign({}, this.get(id), { id }));
  }

  public setName(extensionId: string, name: string): void {
    const { granted, rejected } = this.get(extensionId);
    this.storage.set<Permissions>(extensionId, { name, granted, rejected });
  }

  public addGranted(extensionId: string, permissions: Permission[]): void {
    const { name, granted, rejected } = this.get(extensionId);
    this.storage.set<Permissions>(extensionId, { name, granted: granted.concat(permissions), rejected });
  }

  public addRejected(extensionId: string, permissions: Permission[]): void {
    const { name, granted, rejected } = this.get(extensionId);
    this.storage.set<Permissions>(extensionId, { name, granted, rejected: rejected.concat(permissions) });
  }

  public clearPermissions(extensionId: string): void {
    const { name } = this.get(extensionId);
    this.storage.set<Permissions>(extensionId, { name, granted: [], rejected: [] });
  }
}
