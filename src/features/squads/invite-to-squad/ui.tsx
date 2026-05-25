'use client';

import { mapUsersToSelectOptions } from '@/entities/user/ui/user-select-options';
import { Button } from '@/shared/ui/atoms/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/shared/ui/organisms/dialog';
import { Preloader } from '@/shared/ui/atoms/preloader';
import { Select } from '@/shared/ui/atoms/select';
import { FC, useEffect, useState } from 'react';
import { observer, Observer } from 'mobx-react-lite';
import { InviteToSquadModel, inviteToSquadModel } from './model';
import { SquadInvitation, SquadRole } from '@/shared/sdk/types';
import { SQUAD_INVITE_ROLE_OPTIONS } from '@/entities/squad/lib';

const InviteToSquadModal: FC<{
  model?: InviteToSquadModel;
  onInviteSuccess?: (invitation: SquadInvitation) => void;
}> = observer(({ model = inviteToSquadModel, onInviteSuccess }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<SquadRole.MEMBER | SquadRole.RECRUIT>(SquadRole.MEMBER);

  useEffect(() => {
    if (model.visibility.isOpen) {
      model.init();
    } else {
      setSelectedUserId(null);
      setSelectedRole(SquadRole.MEMBER);
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
        squadRole: selectedRole,
      },
      onInviteSuccess,
    );
  };

  const squad = model.visibility.payload?.squad;

  return (
    <Dialog open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Запросити нового учасника до загону</DialogTitle>
        </DialogHeader>

        <Preloader isLoading={model.loader.isLoading}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-zinc-400">
                Оберіть користувача, якого хочете запросити до загону{' '}
                <span className="text-primary font-semibold">{squad?.name}</span>
              </p>

              <Observer>
                {() => (
                  <Select
                    value={selectedUserId}
                    onChange={setSelectedUserId}
                    label="Користувач"
                    localSearch
                    placeholder="Оберіть користувача"
                    isLoading={model.users.pagination.preloader.isLoading}
                    options={mapUsersToSelectOptions(model.users.pagination.data)}
                  />
                )}
              </Observer>
              <Select
                value={selectedRole}
                onChange={value => setSelectedRole((value || SquadRole.MEMBER) as SquadRole.MEMBER | SquadRole.RECRUIT)}
                label="Роль"
                options={SQUAD_INVITE_ROLE_OPTIONS}
              />
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => model.visibility.close()}>
                Скасувати
              </Button>
              <Button onClick={handleInvite} disabled={!selectedUserId || model.loader.isLoading}>
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
