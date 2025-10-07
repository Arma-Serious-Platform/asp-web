import { Social } from '@/features/social/ui';

export const Footer = () => (
  <footer className='mt-auto flex justify-center items-center bg-card min-h-24'>
    <div className='w-full flex justify-between items-center container'>
      <div className='social'></div>
      <div className='copyright'>
        Virtual Tactical Games. Всі права захищені.
      </div>
      <div className='links'>
        <Social />
      </div>
    </div>
  </footer>
);
