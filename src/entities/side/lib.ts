import { SideType } from '@/shared/sdk/types';

export const getSideTypeText = (type: SideType) => {
  switch (type) {
    case SideType.BLUE:
      return 'BLUEFOR';
    case SideType.RED:
      return 'OPFOR';
    case SideType.UNASSIGNED:
      return 'Нейтральна';
  }
};
