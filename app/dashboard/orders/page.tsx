import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchOrders } from "@/app/lib/api";
import OrdersPageClient from "./OrdersPageClient";

/**
 * Server wrapper: prefetches the orders query with the SAME query key the
 * client uses, so the SSR HTML already contains the table and hydration
 * reuses the dehydrated cache. Prefetch failures are swallowed (empty cache)
 * and the client refetches.
 */
const OrdersPage = async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000, retry: false } },
  });

  await queryClient.prefetchQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersPageClient />
    </HydrationBoundary>
  );
};

export const dynamic = "force-dynamic";

export default OrdersPage;
