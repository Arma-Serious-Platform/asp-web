import { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { Footer } from './footer';
import { Header, HeaderProps } from './header';

const Layout: FC<
  PropsWithChildren<{
    wrapperClassName?: string;
    className?: string;
    headerProps?: HeaderProps;
  }>
> = ({ wrapperClassName, className, children, headerProps }) => (
  <div
    className={classNames(
      'relative flex flex-col justify-center min-h-screen w-full',
      wrapperClassName
    )}>
    <Header {...headerProps} />
    <main className={classNames('w-full', className)}>{children}</main>
    <Footer />
  </div>
);

export { Layout };
