'use client';

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Switch } from '@/shared/ui/atoms/switch';
import { notificationsState } from '@/widgets/notifications';
import { ALL_NOTIFICATION_GROUPS, NOTIFICATION_GROUP_LABELS } from '@/entities/notification';
import { LoaderIcon } from 'lucide-react';

export const NotificationPreferences = observer(() => {
  useEffect(() => {
    void notificationsState.loadPreferences();
  }, []);

  const { preferences, preferencesPreloader } = notificationsState;

  if (preferencesPreloader.isLoading && preferences.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-zinc-400">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-white/10 bg-black/40 p-3">
      <div className="flex flex-col gap-3">
        {ALL_NOTIFICATION_GROUPS.map(group => {
          const pref = preferences.find(item => item.group === group);
          const enabled = pref?.enabled ?? true;

          return (
            <label key={group} className="flex items-center gap-3 text-sm text-zinc-200">
              <Switch
                checked={enabled}
                onCheckedChange={checked => {
                  void notificationsState.setPreferenceEnabled(group, checked);
                }}
              />
              <span>{NOTIFICATION_GROUP_LABELS[group]}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
});
