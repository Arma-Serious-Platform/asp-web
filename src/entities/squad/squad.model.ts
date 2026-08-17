import { createEntity } from '@/shared/state/entity';
import { SquadRole, SquadSchema, SideType, User } from '@/shared/sdk/types';
import { makeObservable, computed } from 'mobx';

class SquadModel extends createEntity(SquadSchema) {
  static roleLabels: Record<SquadRole, string> = {
    [SquadRole.SUBLEADER]: 'Заступник',
    [SquadRole.HQ]: 'Штаб',
    [SquadRole.MEMBER]: 'Учасник',
    [SquadRole.RECRUIT]: 'Рекрут',
  };

  static memberRoleOptions = [
    { value: SquadRole.MEMBER, label: SquadModel.roleLabels[SquadRole.MEMBER] },
    { value: SquadRole.HQ, label: SquadModel.roleLabels[SquadRole.HQ] },
    { value: SquadRole.SUBLEADER, label: SquadModel.roleLabels[SquadRole.SUBLEADER] },
    { value: SquadRole.RECRUIT, label: SquadModel.roleLabels[SquadRole.RECRUIT] },
  ];

  static inviteRoleOptions = [
    { value: SquadRole.MEMBER, label: SquadModel.roleLabels[SquadRole.MEMBER] },
    { value: SquadRole.RECRUIT, label: SquadModel.roleLabels[SquadRole.RECRUIT] },
  ];

  private static roleOrder: Record<SquadRole, number> = {
    [SquadRole.SUBLEADER]: 0,
    [SquadRole.HQ]: 1,
    [SquadRole.MEMBER]: 2,
    [SquadRole.RECRUIT]: 3,
  };

  protected init() {
    makeObservable(this, {
      id: computed,
      sideType: computed,
      membersSortedByRole: computed,
      subleaders: computed,
    });
  }

  get id() {
    return this.data.id;
  }

  get sideType(): SideType {
    return this.data.side?.type ?? SideType.UNASSIGNED;
  }

  get membersSortedByRole(): User[] {
    const members = (this.data.members ?? []) as User[];

    return [...members].sort((a, b) => {
      const roleDiff =
        SquadModel.roleOrder[a.squadRole ?? SquadRole.MEMBER] -
        SquadModel.roleOrder[b.squadRole ?? SquadRole.MEMBER];

      if (roleDiff !== 0) return roleDiff;

      return (a.nickname ?? '').localeCompare(b.nickname ?? '', 'uk');
    });
  }

  get subleaders(): User[] {
    return this.membersSortedByRole.filter(member => member.squadRole === SquadRole.SUBLEADER);
  }
}

export { SquadModel };
