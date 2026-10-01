import Link from "next/link";

type SidebarProps = {
  isOpen: boolean;
};

const Sidebar = ({ isOpen }: SidebarProps) => {
  return (
    <aside
      className={`fixed left-0 z-40 flex w-64 flex-col gap-4 bg-gray-800 p-4 text-white
        top-16 h-[calc(100vh-4rem)]
        lg:top-0 lg:h-screen
        ${isOpen ? "flex" : "hidden"}
        lg:flex`}
    >
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/products">Products</Link>
      <Link href="/orders">Orders</Link>
      <Link href="/dashboard/users">Users</Link>
    </aside>
  );
};

export default Sidebar;
