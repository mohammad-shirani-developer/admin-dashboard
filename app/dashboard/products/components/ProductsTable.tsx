import { Product } from "../../types";

type ProductsTableProps = {
  products: Product[];
};
const ProductsTable = ({ products }: ProductsTableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-600">Product</th>
            <th className="px-4 py-3 font-medium text-gray-600">Price</th>
            <th className="px-4 py-3 font-medium text-gray-600">Category</th>
            <th className="px-4 py-3 font-medium text-gray-600">Stock</th>
            <th className="px-4 py-3 font-medium text-gray-600">Status</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-gray-100">
              <td className="px-4 py-3 font-medium text-gray-900">
                {product.name}
              </td>

              <td className="px-4 py-3 font-medium text-gray-900">
                ${product.price.toLocaleString()}
              </td>

              <td className="px-4 py-3 text-gray-600">{product.category}</td>

              <td className="px-4 py-3 text-gray-600">{product.stock} units</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    product.status === "In Stock"
                      ? "bg-green-100 text-green-700"
                      : product.status === "Low Stock"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
