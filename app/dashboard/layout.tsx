import { getSessionUser } from "@/app/lib/session";
import DashboardShell from "./components/DashboardShell";

async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
export default DashboardLayout;
