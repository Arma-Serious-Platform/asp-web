import { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { Footer } from './footer';
import { Header, HeaderProps, MobileMenu } from './header';
import { Hero } from '../hero';

const Layout: FC<
  PropsWithChildren<{
    wrapperClassName?: string;
    className?: string;
    headerProps?: HeaderProps;
    showHero?: boolean;
  }>
> = ({
  wrapperClassName,
  className,
  children,
  headerProps,
  showHero = false,
}) => (
  <div
    className={classNames(
      'relative flex flex-col justify-center min-h-screen w-full overflow-x-clip',
      wrapperClassName
    )}>
    <Header {...headerProps} />
    <MobileMenu />
    <main className={classNames('w-full', className)}>
      {showHero && <Hero />}
      {children}
    </main>
    <Footer />
  </div>
);

export { Layout };
