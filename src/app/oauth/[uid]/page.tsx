'use client';

import { observer } from 'mobx-react-lite';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { oauthState } from './state/oauth.state';
import { OauthConsent } from './ui/oauth-consent';
import { OauthLogin } from './ui/oauth-login';
import { OauthShell } from './ui/oauth-shell';
import { OauthBlocked, OauthError, OauthLoading } from './ui/oauth-status';

const OauthPage = observer(() => {
  const params = useParams<{ uid: string }>();
  const uid = params?.uid;
  const model = oauthState;

  useEffect(() => {
    if (uid) void model.init(uid);
  }, [uid, model]);

  const { interaction, view } = model;
  const client = interaction?.client;

  const cancel = client && (view === 'login' || view === 'loading') && (
    <button
      type="button"
      disabled={model.isSubmitting}
      onClick={() => void model.abort()}
      className="cursor-pointer text-sm text-zinc-400 hover:text-lime-300 disabled:opacity-50">
      Скасувати й повернутися до {client.name}
    </button>
  );

  return (
    <OauthShell footer={cancel}>
      {view === 'loading' && <OauthLoading label="Завантаження…" />}
      {view === 'redirecting' && <OauthLoading label="Повертаємо вас до додатка…" />}
      {view === 'login' && client && <OauthLogin model={model} client={client} />}
      {view === 'consent' && interaction && <OauthConsent model={model} interaction={interaction} />}
      {view === 'blocked' && (
        <OauthBlocked appName={client?.name} disabled={model.isSubmitting} onReturn={() => void model.abort()} />
      )}
      {view === 'error' && <OauthError code={model.errorCode} />}
    </OauthShell>
  );
});

export default OauthPage;
