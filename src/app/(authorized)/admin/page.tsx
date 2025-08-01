import { ROUTES } from '@/shared/config/routes';
import { redirect } from 'next/navigation';

const AdminPage = () => {
  return redirect(ROUTES.admin.users);
};

export default AdminPage;
