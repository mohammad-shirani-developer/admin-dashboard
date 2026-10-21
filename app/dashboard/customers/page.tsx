import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchCustomers } from "@/app/lib/api";
import CustomersPageClient from "./CustomersPageClient";

/**
 * Server wrapper: prefetches the customers query with the SAME query key the
 * client uses, so the SSR HTML already contains the table and hydration
 * reuses the dehydrated cache. Prefetch failures are swallowed (empty cache)
 * and the client refetches.
 */
const CustomersPage = async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000, retry: false } },
  });

  await queryClient.prefetchQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CustomersPageClient />
    </HydrationBoundary>
  );
};

export const dynamic = "force-dynamic";

export default CustomersPage;
