'use client';

import { Layout } from '@/widgets/layout';
import { observer } from 'mobx-react-lite';
import { squadsPageModel } from './model';
import { useEffect } from 'react';
import { LoaderIcon } from 'lucide-react';
import { SquadListingCard } from '@/entities/squad/ui/squad-listing-card';

const SquadsPage = observer(() => {
  const { squads } = squadsPageModel;

  useEffect(() => {
    squads.findSquads();
  }, []);

  return (
    <Layout className='w-full bg-card/80 mx-auto my-4 p-4 max-w-4xl'>
      <h1 className='text-lg font-bold text-center'>Загони проекту</h1>

      <div className='flex flex-col'>
        {squads.loader.isLoading && (
          <LoaderIcon className='w-4 h-4 animate-spin' />
        )}
        {squads.data.map((squad) => (
          <SquadListingCard key={squad.id} squad={squad} />
        ))}
      </div>
    </Layout>
  );
});

export default SquadsPage;
