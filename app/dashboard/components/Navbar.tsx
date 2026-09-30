type NavbarProps = {
  onMenuClick: () => void;
};

const Navbar = ({ onMenuClick }: NavbarProps) => {
  return (
    <header className="relative z-50 flex h-16 items-center justify-between border-b border-gray-800 px-3 sm:px-4">
      <button type="button" className="text-xl lg:hidden" onClick={onMenuClick}>
        ☰
      </button>

      <h1 className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-lg font-semibold sm:text-xl">
        Admin Dashboard
      </h1>

      <div className="ml-auto pl-2 text-sm sm:pl-4 sm:text-base">
        <span>Mohammad</span>
      </div>
    </header>
  );
};

export default Navbar;
