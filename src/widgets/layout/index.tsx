import { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { Footer } from './footer';
import { Header, HeaderProps, MobileMenu } from './header';

const Layout: FC<
  PropsWithChildren<{
    wrapperClassName?: string;
    className?: string;
    headerProps?: HeaderProps;
  }>
> = ({ wrapperClassName, className, children, headerProps }) => (
  <div
    className={classNames(
      'relative flex flex-col justify-center min-h-screen w-full overflow-x-clip',
      wrapperClassName
    )}>
    <Header {...headerProps} />
    <MobileMenu />
    <main className={classNames('w-full', className)}>{children}</main>
    <Footer />
  </div>
);

export { Layout };
