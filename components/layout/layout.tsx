import { PropsWithChildren } from 'react';

import Header from './header';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col min-h-screen bg-background antialiased">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
