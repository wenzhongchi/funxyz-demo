import Header from "./header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background antialiased">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;

