import { UsersState } from '@/entities/user/user-list.state';
import { Loader } from '@/shared/state/loader';
import { Visibility } from '@/shared/state/visibility';
import { squadsApi } from '@/shared/sdk';
import { FindUsersDto, InviteToSquadDto, Squad, SquadInvitation } from '@/shared/sdk/types';
import { makeAutoObservable } from 'mobx';
import toast from 'react-hot-toast';

const findUsersWithoutSquadParams = (params: Partial<FindUsersDto> = {}): FindUsersDto => ({
  hasSquad: false,
  take: 50,
  skip: 0,
  ...params,
});

export class InviteToSquadState {
  constructor() {
    makeAutoObservable(this);
  }

  loader = new Loader();

  users = new UsersState();

  visibility = new Visibility<{
    squad: Squad;
  }>();

  init = async () => {
    await this.users.pagination.loadAll(findUsersWithoutSquadParams());
  };

  inviteToSquad = async (dto: InviteToSquadDto, onSuccess?: (invitation: SquadInvitation) => void) => {
    try {
      this.loader.start();
      const { data: invitation } = await squadsApi.inviteToSquad(dto);

      toast.success('Запрошення успішно надіслано');

      this.visibility.close();
      this.users.reset();

      onSuccess?.(invitation);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Не вдалося надіслати запрошення';
      toast.error(errorMessage);
    } finally {
      this.loader.stop();
    }
  };

  reset = () => {
    this.users.reset();
  };
}

export const inviteToSquadState = new InviteToSquadState();
