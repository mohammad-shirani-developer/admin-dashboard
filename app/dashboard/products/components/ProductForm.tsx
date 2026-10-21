"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  inputClasses,
  primaryButtonClasses,
  secondaryButtonClasses,
  withClasses,
} from "@/app/components/ui/form-controls";
import type { Product, ProductCategory, ProductStatus } from "../../types";

export const expectedStatusForStock = (stock: number): ProductStatus => {
  if (stock > 5) {
    return "In Stock";
  }
  if (stock > 0) {
    return "Low Stock";
  }
  return "Out of Stock";
};

const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Laptop",
  "Phone",
  "Headphones",
];

const PRODUCT_STATUSES: ProductStatus[] = [
  "In Stock",
  "Low Stock",
  "Out of Stock",
];

const productFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Product name must be at least 2 characters long.")
      .max(120, "Product name must be 120 characters or fewer."),
    category: z.enum(["Laptop", "Phone", "Headphones"], {
      message: "Please select a category.",
    }),
    price: z
      .string()
      .trim()
      .min(1, "Price must be a valid number greater than 0.")
      .refine(
        (value) => Number.isFinite(Number(value)) && Number(value) > 0,
        "Price must be a valid number greater than 0.",
      ),
    stock: z
      .string()
      .trim()
      .min(1, "Stock must be 0 or greater.")
      .refine(
        (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
        "Stock must be 0 or greater.",
      ),
    status: z.enum(["In Stock", "Low Stock", "Out of Stock"], {
      message: "Please select a status.",
    }),
    description: z
      .string()
      .trim()
      .max(500, "Description must be 500 characters or fewer."),
  })
  .superRefine((data, ctx) => {
    const expected = expectedStatusForStock(Number(data.stock));

    if (data.status !== expected) {
      ctx.addIssue({
        code: "custom",
        path: ["status"],
        message: `The status should be "${expected}" based on the stock value.`,
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

/** Values the form emits on successful submit (numeric price/stock). */
export type ProductFormSubmitValues = {
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  status: ProductStatus;
  description: string;
};

type ProductFormProps = {
  initialProduct?: Product | null;
  submitLabel?: string;
  onSubmit: (values: ProductFormSubmitValues) => void;
  onCancel: () => void;
};

const ProductForm = ({
  initialProduct = null,
  submitLabel,
  onSubmit,
  onCancel,
}: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialProduct?.name ?? "",
      category: initialProduct?.category ?? ("" as ProductFormValues["category"]),
      price: initialProduct ? String(initialProduct.price) : "",
      stock: initialProduct ? String(initialProduct.stock) : "",
      status: initialProduct?.status ?? ("" as ProductFormValues["status"]),
      description: initialProduct?.description ?? "",
    },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) =>
        onSubmit({
          name: values.name.trim(),
          category: values.category,
          price: Number(values.price),
          stock: Number(values.stock),
          status: values.status,
          description: values.description.trim(),
        }),
      )}
      className="mb-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {initialProduct ? "Edit Product" : "Add Product"}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="product-name"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Product Name
          </label>

          <input
            id="product-name"
            type="text"
            placeholder="Enter product name"
            {...register("name")}
            className={inputClasses}
          />

          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="product-category"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Category
          </label>

          <select
            id="product-category"
            {...register("category")}
            className={withClasses(inputClasses, "text-gray-700")}
          >
            <option value="">Select category</option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {errors.category && (
            <p className="mt-1 text-xs text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="product-price"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Price
          </label>

          <input
            id="product-price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter price"
            {...register("price")}
            className={inputClasses}
          />

          {errors.price && (
            <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="product-stock"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Stock
          </label>

          <input
            id="product-stock"
            type="number"
            min="0"
            step="1"
            placeholder="Enter stock"
            {...register("stock")}
            className={inputClasses}
          />

          {errors.stock && (
            <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="product-status"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Status
          </label>

          <select
            id="product-status"
            {...register("status")}
            className={withClasses(inputClasses, "text-gray-700")}
          >
            <option value="">Select status</option>
            {PRODUCT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {errors.status && (
            <p className="mt-1 text-xs text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="product-description"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Description
          </label>

          <textarea
            id="product-description"
            rows={4}
            placeholder="Enter product description"
            {...register("description")}
            className={withClasses(inputClasses, "resize-none")}
          />

          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className={withClasses(secondaryButtonClasses, "w-full sm:w-auto")}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className={withClasses(primaryButtonClasses, "w-full sm:w-auto")}
        >
          {submitLabel ?? (initialProduct ? "Update Product" : "Save Product")}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
