'use client';

import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { squadsPageModel } from './model';
import { useEffect } from 'react';
import { LoaderIcon } from 'lucide-react';

const SquadsPage = observer(() => {
  const { squads } = squadsPageModel;

  useEffect(() => {
    squads.findSquads();
  }, []);

  return (
    <Layout>
      <div className='container w-full bg-card/80 mx-auto my-4'>
        <div className='text-lg font-bold'>Загони проекту</div>

        <div className='flex flex-col'>
          {squads.loader.isLoading && (
            <LoaderIcon className='w-4 h-4 animate-spin' />
          )}
          {squads.data.map((squad) => (
            <div key={squad.id}>{squad.name}</div>
          ))}
        </div>
      </div>
    </Layout>
  );
});

export default SquadsPage;
