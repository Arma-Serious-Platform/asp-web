'use client';

import { Layout } from '@/widgets/layout';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { confirmSignUpState, CONFIRM_SIGN_UP_MESSAGES } from './state/confirm-sign-up.state';
import { View } from '@/features/view';
import { LoaderIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { ROUTES } from '@/shared/config/routes';
import { Link } from '@/shared/ui/atoms/link';
import { Button } from '@/shared/ui/atoms/button';

const ConfirmSignUpError = observer(() => {
  switch (confirmSignUpState.errorMessage) {
    case CONFIRM_SIGN_UP_MESSAGES.expiredTokenNewSent:
      return (
        <>
          <p>Термін дії посилання для підтвердження минув.</p>
          <p>Ми надіслали нове посилання на вашу електронну пошту.</p>
        </>
      );
    case CONFIRM_SIGN_UP_MESSAGES.alreadyConfirmed:
      return (
        <>
          <p>Аккаунт вже підтверджений.</p>
          <p>Тепер ви можете авторизуватися.</p>
          <Link className="mt-4" href={ROUTES.auth.login}>
            <Button size="lg">Авторизуватися</Button>
          </Link>
        </>
      );
    case CONFIRM_SIGN_UP_MESSAGES.invalidToken:
      return (
        <>
          <p>Нажаль, посилання не валідне.</p>
          <p>Спробуйте авторизуватися повторно, щоб отримати новий лист підтвердження.</p>
        </>
      );
    default:
      return (
        <>
          <p>Не вдалося підтвердити аккаунт.</p>
          <p>Спробуйте авторизуватися повторно.</p>
        </>
      );
  }
});

const ConfirmSignUpContent = observer(() => {
  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      confirmSignUpState.setFailure(CONFIRM_SIGN_UP_MESSAGES.invalidToken);

      return;
    }

    confirmSignUpState.confirmSignUp(token);
  }, []);

  return (
    <>
      <View.Condition if={confirmSignUpState.loader.isLoading || typeof confirmSignUpState.isSuccess === 'undefined'}>
        <div className="flex flex-col gap-2 text-center justify-center">
          <LoaderIcon className="size-10 animate-spin mx-auto" />
        </div>
      </View.Condition>
      <View.Condition if={confirmSignUpState.isSuccess === false}>
        <div className="flex flex-col gap-2 text-center">
          <ConfirmSignUpError />
        </div>
      </View.Condition>
      <View.Condition if={confirmSignUpState.isSuccess}>
        <div className="flex flex-col gap-2 text-center justify-center">
          <p>Аккаунт успішно підтверджений.</p>
          <p>Тепер ви можете авторизуватися.</p>

          <Link className="mt-4" href={ROUTES.auth.login}>
            <Button size="lg">Авторизуватися</Button>
          </Link>
        </div>
      </View.Condition>
    </>
  );
});

const ConfirmSignUpPage = observer(() => {
  return (
    <Layout className="max-w-lg mx-auto paper p-4 my-auto">
      <Suspense
        fallback={
          <div className="flex flex-col gap-2 text-center justify-center">
            <LoaderIcon className="size-10 animate-spin mx-auto" />
          </div>
        }>
        <ConfirmSignUpContent />
      </Suspense>
    </Layout>
  );
});

export default ConfirmSignUpPage;
