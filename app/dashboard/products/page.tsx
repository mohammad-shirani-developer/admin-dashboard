import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchProducts } from "@/app/lib/api";
import ProductsPageClient from "./ProductsPageClient";

type ProductsPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

/**
 * Server wrapper: prefetches the products query with the SAME query key the
 * client uses, so the SSR HTML already contains the table and hydration
 * reuses the dehydrated cache. The navbar's `?q=` search term is read
 * server-side and passed down as the initial search state.
 */
const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
  const params = await searchParams;
  const initialQuery = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000, retry: false } },
  });

  await queryClient.prefetchQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* key remounts the client tree when the navbar searches again */}
      <ProductsPageClient key={initialQuery} initialQuery={initialQuery} />
    </HydrationBoundary>
  );
};

export const dynamic = "force-dynamic";

export default ProductsPage;
