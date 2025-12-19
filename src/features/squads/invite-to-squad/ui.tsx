'use client';

import { UserModel } from '@/entities/user/model';
import { Button } from '@/shared/ui/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from '@/shared/ui/organisms/dialog';
import { Preloader } from '@/shared/ui/atoms/preloader';
import { Select } from '@/shared/ui/atoms/select';
import { FC, useEffect, useState } from 'react';
import { observer, Observer } from 'mobx-react-lite';
import { InviteToSquadModel, inviteToSquadModel } from './model';
import { SquadInvitation } from '@/shared/sdk/types';

const InviteToSquadModal: FC<{
  model?: InviteToSquadModel;
  onInviteSuccess?: (invitation: SquadInvitation) => void;
}> = observer(({ model = inviteToSquadModel, onInviteSuccess }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (model.visibility.isOpen) {
      model.init();
    } else {
      setSelectedUserId(null);
      model.reset();
    }
  }, [model.visibility.isOpen]);

  const handleInvite = () => {
    if (!selectedUserId || !model.visibility.payload?.squad) {
      return;
    }

    model.inviteToSquad(
      {
        userId: selectedUserId,
      },
      onInviteSuccess
    );
  };

  const squad = model.visibility.payload?.squad;

  return (
    <Dialog
      open={model.visibility.isOpen}
      onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Запросити нового учасника до загону</DialogTitle>
        </DialogHeader>

        <Preloader isLoading={model.loader.isLoading}>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <p className='text-sm text-zinc-400'>
                Оберіть користувача, якого хочете запросити до загону{' '}
                <span className='text-primary font-semibold'>
                  {squad?.name}
                </span>
              </p>

              <Observer>
                {() => (
                  <Select
                    value={selectedUserId}
                    onChange={setSelectedUserId}
                    label='Користувач'
                    onSearch={(search) => {
                      model.users.pagination.init({
                        search,
                        skip: 0,
                        take: 50,
                      });
                    }}
                    isLoading={model.users.pagination.preloader.isLoading}
                    options={model.users.options}
                  />
                )}
              </Observer>
            </div>

            <div className='flex justify-between mt-4'>
              <Button
                variant='outline'
                onClick={() => model.visibility.close()}>
                Скасувати
              </Button>
              <Button
                onClick={handleInvite}
                disabled={!selectedUserId || model.loader.isLoading}>
                Надіслати запрошення
              </Button>
            </div>
          </div>
        </Preloader>
      </DialogContent>
    </Dialog>
  );
});

export { InviteToSquadModal };

