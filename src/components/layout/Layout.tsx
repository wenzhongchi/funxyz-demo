import { PropsWithChildren } from 'react';

import Navigation from './Navigation';

interface LayoutProps extends PropsWithChildren {
  title: string;
}

const Layout = ({ title, children }: LayoutProps) => {
  return (
    <div className="h-screen w-dvw bg-background text-content flex flex-col">
      <Navigation title={title} />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="container mx-auto pt-4 pb-8 px-4 md:px-0">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
