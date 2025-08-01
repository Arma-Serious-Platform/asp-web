import { AdminSidebar } from '@/widgets/admin/sidebar';
import { Layout } from '@/widgets/layout';

const AdminPage = () => {
  return (
    <Layout className='flex w-full gap-4 p-4 container mx-auto'>
      <AdminSidebar />
      <div className='flex flex-col bg-card/80 w-full'></div>
    </Layout>
  );
};

export default AdminPage;
