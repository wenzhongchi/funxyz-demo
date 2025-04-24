interface NavigationProps {
  title: string;
}

const Navigation = ({ title }: NavigationProps) => {
  return (
    <nav className="py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center mb-2 sm:mb-0">
          <span className="text-xl font-bold text-content">{title}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
