import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchOrders, fetchProducts, fetchUsers } from "@/app/lib/api";
import DashboardPageClient from "./DashboardPageClient";

/**
 * Server wrapper: prefetches the dashboard queries (products, orders, users)
 * with the SAME query keys the client uses, so the SSR HTML already contains
 * the real stat cards and charts and hydration reuses the dehydrated cache.
 * Prefetch failures are swallowed (empty cache) and the client refetches.
 */
const DashboardPage = async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000, retry: false } },
  });

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["products"],
      queryFn: fetchProducts,
    }),
    queryClient.prefetchQuery({ queryKey: ["orders"], queryFn: fetchOrders }),
    queryClient.prefetchQuery({ queryKey: ["users"], queryFn: fetchUsers }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPageClient />
    </HydrationBoundary>
  );
};

export const dynamic = "force-dynamic";

export default DashboardPage;
