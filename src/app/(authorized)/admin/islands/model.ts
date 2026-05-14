import { IslandListModel } from '@/entities/island/model';
import { ManageIslandModel } from '@/features/islands/manage/model';
import { makeAutoObservable } from 'mobx';

export class IslandsAdminModel {
  constructor() {
    makeAutoObservable(this);
  }

  islands = new IslandListModel();

  manageIsland = new ManageIslandModel();
}

export const islandsAdminModel = new IslandsAdminModel();
