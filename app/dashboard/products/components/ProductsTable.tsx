import { Product } from "../../types";

type ProductsTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};
const ProductsTable = ({ products, onEdit, onDelete }: ProductsTableProps) => {
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
            <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr key={product.id} className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {product.name}
                </td>

                <td className="px-4 py-3 font-medium text-gray-900">
                  ${product.price.toLocaleString()}
                </td>

                <td className="px-4 py-3 text-gray-600">{product.category}</td>

                <td className="px-4 py-3 text-gray-600">
                  {product.stock} units
                </td>
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

                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium text-gray-700">
                    No products found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filters.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
