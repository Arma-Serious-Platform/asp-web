import { Social } from '@/features/social/ui';

export const Footer = () => (
  <footer className='mt-auto flex justify-center items-center bg-card min-h-24'>
    <div className='w-full flex justify-between items-center container max-lg:flex-col max-lg:gap-4 max-lg:pb-4'>
      <div />
      <div className='min-lg:ml-[168px]'>
        Virtual Tactical Games. Всі права захищені.
      </div>
      <Social />
    </div>
  </footer>
);
