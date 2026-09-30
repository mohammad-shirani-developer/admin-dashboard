import DashboardShell from "./components/DashboardShell";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
export default DashboardLayout;
