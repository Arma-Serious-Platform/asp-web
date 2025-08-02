'use client';

import { Input } from '@/shared/ui/atoms/input';
import { AdminSidebar } from '@/widgets/admin/sidebar';
import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { parseAsString, useQueryStates } from 'nuqs';
import { usersModel } from './model';
import { useDebounce } from 'react-use';
import { View } from '@/features/view';
import { LoaderIcon } from 'lucide-react';

const AdminPage = observer(() => {
  const [search, setSearch] = useState('');
  const [params, setParams] = useQueryStates({
    search: parseAsString.withDefault(''),
  });

  useDebounce(
    () => {
      setParams({ search });
    },
    200,
    [search]
  );

  useEffect(() => {
    usersModel.users.pagination.init({
      take: 10,
      skip: 0,
      search: params.search || '',
    });
  }, [params]);

  return (
    <Layout className='flex w-full mt-4 container mx-auto h-full'>
      <div className='flex flex-col bg-card/70 w-full p-4'>
        <AdminSidebar className='mb-4' />
        <h1 className='text-2xl font-bold mb-2'>Гравці</h1>
        <Input
          placeholder='Пошук...'
          className='mb-4'
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className='grid grid-rows-4 gap-4'>
          <View.Condition if={usersModel.users.pagination.preloader.isLoading}>
            <LoaderIcon className='animate-spin w-8 h-8 mx-auto' />
          </View.Condition>
          <View.Condition if={!usersModel.users.pagination.preloader.isLoading}>
            {usersModel.users.pagination.data.map((user) => (
              <div key={user.id} className='bg-card/80 p-4 rounded-md'>
                <h2>{user.nickname}</h2>
              </div>
            ))}
          </View.Condition>

          <View.Condition if={!usersModel.users.pagination.preloader.isLoading}>
            {usersModel.users.pagination.data.map((user) => (
              <div key={user.id} className='bg-card/80 p-4 rounded-md'>
                <h2>{user.nickname}</h2>
              </div>
            ))}
          </View.Condition>
        </div>
      </div>
    </Layout>
  );
});

export default AdminPage;
