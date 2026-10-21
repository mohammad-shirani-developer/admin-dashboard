import { Menu } from "lucide-react";

type NavbarProps = {
  onMenuClick: () => void;
};

const Navbar = ({ onMenuClick }: NavbarProps) => {
  return (
    <header className="relative z-50 flex h-16 items-center gap-3 border-b border-gray-800 px-3 sm:px-4">
      <button
        type="button"
        aria-label="Toggle navigation menu"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-xl transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
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
