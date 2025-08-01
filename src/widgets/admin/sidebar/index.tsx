import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/atoms/button';
import Link from 'next/link';

const AdminSidebar = () => (
  <aside className='flex flex-col gap-2 bg-card max-w-40 w-full'>
    <div className='flex flex-col gap-0.5 w-full'>
      <Link href={ROUTES.admin.users} className='w-full'>
        <Button className='w-full' size='sm'>
          Користувачі
        </Button>
      </Link>
      <Link href={ROUTES.admin.squads} className='w-full'>
        <Button className='w-full' size='sm'>
          Загони
        </Button>
      </Link>
      <Link href={ROUTES.admin.sides} className='w-full'>
        <Button className='w-full' size='sm'>
          Сторони
        </Button>
      </Link>
      <Link href={ROUTES.admin.servers} className='w-full'>
        <Button className='w-full' size='sm'>
          Сервери
        </Button>
      </Link>
    </div>
  </aside>
);

export { AdminSidebar };
