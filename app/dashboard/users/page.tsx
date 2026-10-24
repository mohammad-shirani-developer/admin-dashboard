import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { Metadata } from "next";
import { fetchUsers } from "@/app/lib/api";
import UsersPageClient from "./UsersPageClient";

export const metadata: Metadata = { title: "Users" };

/**
 * Server wrapper: prefetches the users query with the SAME query key the
 * client uses, so the SSR HTML already contains the table and hydration
 * reuses the dehydrated cache. Prefetch failures are swallowed (empty cache)
 * and the client refetches.
 */
const UsersPage = async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000, retry: false } },
  });

  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersPageClient />
    </HydrationBoundary>
  );
};

export const dynamic = "force-dynamic";

export default UsersPage;
