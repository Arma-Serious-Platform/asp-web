'use client';

import { Button } from '@/shared/ui/atoms/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay } from '@/shared/ui/organisms/dialog';
import { Preloader } from '@/shared/ui/atoms/preloader';
import { Select } from '@/shared/ui/atoms/select';
import { FC, useEffect, useState } from 'react';
import { observer, Observer } from 'mobx-react-lite';
import { LeaveFromSquadModel, leaveFromSquadModel } from './model';

const LeaveFromSquadModal: FC<{
  model?: LeaveFromSquadModel;
  onLeaveSuccess?: () => void;
}> = observer(({ model = leaveFromSquadModel, onLeaveSuccess }) => {
  const [selectedLeaderId, setSelectedLeaderId] = useState<string | null>(null);

  const squad = model.visibility.payload?.squad;
  const isLeader = model.visibility.payload?.isLeader || false;
  const members = squad?.members || [];

  // Filter out current user from members list for leader selection
  const availableMembers = members.filter(member => member.id !== squad?.leader?.id);

  // Create options for leader selection
  const leaderOptions = availableMembers.map(member => ({
    label: member.nickname || member.id,
    value: member.id,
  }));

  useEffect(() => {
    if (!model.visibility.isOpen) {
      setSelectedLeaderId(null);
    }
  }, [model.visibility.isOpen]);

  const handleLeave = () => {
    if (isLeader && !selectedLeaderId) {
      return;
    }

    model.leaveSquad(selectedLeaderId || undefined, onLeaveSuccess);
  };

  return (
    <Dialog open={model.visibility.isOpen} onOpenChange={model.visibility.switch}>
      <DialogOverlay />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isLeader ? 'Покинути загін та передати лідерство' : 'Покинути загін'}</DialogTitle>
        </DialogHeader>

        <Preloader isLoading={model.loader.isLoading}>
          <div className="flex flex-col gap-4">
            {isLeader ? (
              <>
                {availableMembers.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    Ви є єдиним учасником загону <span className="text-primary font-semibold">{squad?.name}</span>.
                    Неможливо покинути загін без інших учасників.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-zinc-400">
                      Ви є лідером загону <span className="text-primary font-semibold">{squad?.name}</span>. Перед тим
                      як покинути загін, оберіть нового лідера.
                    </p>

                    <Observer>
                      {() => (
                        <Select
                          value={selectedLeaderId}
                          onChange={setSelectedLeaderId}
                          label="Новий лідер загону"
                          options={leaderOptions}
                          error={!selectedLeaderId ? 'Оберіть нового лідера загону' : undefined}
                        />
                      )}
                    </Observer>
                  </>
                )}
              </>
            ) : (
              <p className="text-sm text-zinc-400">
                Ви впевнені, що хочете покинути загін <span className="text-primary font-semibold">{squad?.name}</span>?
                Ця дія незворотна.
              </p>
            )}

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => model.visibility.close()}>
                Скасувати
              </Button>
              <Button
                variant="destructive"
                onClick={handleLeave}
                disabled={model.loader.isLoading || (isLeader && (!selectedLeaderId || availableMembers.length === 0))}>
                Покинути загін
              </Button>
            </div>
          </div>
        </Preloader>
      </DialogContent>
    </Dialog>
  );
});

export { LeaveFromSquadModal };
