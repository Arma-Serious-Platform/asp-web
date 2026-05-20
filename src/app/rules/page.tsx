import { Hero } from '@/widgets/hero';
import { Layout } from '@/widgets/layout';
import { RulesMobileMenu } from './rules-mobile-menu';
import { env } from '@/shared/config/env';
import { RulesContentOverride } from './components/rules-content-override';

const RulesPage = () => {
  return (
    <Layout className="w-full mx-auto">
      {!env.isLanding && <Hero />}
      <div className="container mx-auto mt-6 w-full px-4">
        <div className="mb-4 flex flex-col gap-2">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">Правила проєкту VTG</h1>
          <p className="max-w-2xl text-sm text-zinc-300">
            Нижче наведені основні регламенти поведінки, ігрового процесу та організації спільноти.
            <br />
            Незнання правил не звільняє від відповідальності.
          </p>
        </div>
      </div>

      <RulesMobileMenu />
      <RulesContentOverride />
    </Layout>
  );
};

export default RulesPage;
