'use client';

import { Layout } from '@/widgets/layout';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { confirmSignUpModel } from './model';
import { View } from '@/features/view';
import { LoaderIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { ROUTES } from '@/shared/config/routes';
import { Link } from '@/shared/ui/atoms/link';
import { Button } from '@/shared/ui/atoms/button';

const ConfirmSignUpContent = observer(() => {
  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      confirmSignUpModel.setSuccess(false);

      return;
    }

    confirmSignUpModel.confirmSignUp(token);
  }, []);

  return (
    <>
      <View.Condition if={confirmSignUpModel.loader.isLoading || typeof confirmSignUpModel.isSuccess === 'undefined'}>
        <div className="flex flex-col gap-2 text-center justify-center">
          <LoaderIcon className="size-10 animate-spin mx-auto" />
        </div>
      </View.Condition>
      <View.Condition if={confirmSignUpModel.isSuccess === false}>
        <div className="flex flex-col gap-2 text-center">
          <p>Нажаль, посилання не валідне.</p>
          <p>Спробуйте авторизуватися повторно.</p>
        </div>
      </View.Condition>
      <View.Condition if={confirmSignUpModel.isSuccess}>
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
    <Layout className="max-w-lg mx-auto bg-card/80 p-4 my-auto">
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
