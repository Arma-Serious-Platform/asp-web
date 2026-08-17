import { SideModel } from '@/entities/side/side.model';
import { ManageServerState } from '@/app/(authorized)/admin/servers/state/manage-server.state';
import { sidesApi } from '@/shared/sdk';
import { FindSidesDto, Side } from '@/shared/sdk/types';
import { Pagination } from '@/shared/state/pagination';
import { makeAutoObservable } from 'mobx';

class SidesPageState {
  constructor() {
    makeAutoObservable(this);
  }

  pagination = new Pagination<Side, FindSidesDto, SideModel>({
    api: sidesApi.findSides,
    Model: SideModel,
  });

  manageServer = new ManageServerState();
}

export const sidesPageState = new SidesPageState();
