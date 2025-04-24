import AccountTokenButton from '../AccountTokenButton';

const Header = () => {
  return (
    <div className="flex justify-center h-24">
      <div className="flex-1 items-center max-w-3xl flex justify-between">
        <h2 className="uppercase flex items-center text-2xl">swap</h2>
        <AccountTokenButton />
      </div>
    </div>
  );
};

export default Header;
