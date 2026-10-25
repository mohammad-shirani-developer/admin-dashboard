"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { useState } from "react";
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
    imageUrl: z
      .string()
      .trim()
      .max(500, "Image URL must be 500 characters or fewer."),
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
  imageUrl: string;
};

type ProductFormProps = {
  initialProduct?: Product | null;
  submitLabel?: string;
  /** Set while the wrapping mutation is in flight — disables the submit. */
  submitting?: boolean;
  /** Server/mutation error shown inside the form (the caller owns it). */
  submitError?: string | null;
  onSubmit: (values: ProductFormSubmitValues) => void;
  onCancel: () => void;
};

/**
 * Live preview thumbnail for the Image URL field. Remounted via `key` on the
 * URL so a failed load retries cleanly when the URL changes — no effects.
 */
const ProductImagePreview = ({ src }: { src: string }) => {
  const [hasFailed, setHasFailed] = useState(false);
  const trimmedSrc = src.trim();

  if (!trimmedSrc || hasFailed) {
    return (
      <div
        aria-hidden="true"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-950"
      >
        <ImageIcon className="h-5 w-5 text-gray-400" />
      </div>
    );
  }

  return (
    <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-950">
      {/* Unoptimized: previews arbitrary user-entered hosts without config. */}
      <Image
        src={trimmedSrc}
        alt="Product image preview"
        fill
        sizes="56px"
        unoptimized
        className="object-cover"
        onError={() => setHasFailed(true)}
      />
    </span>
  );
};

const ProductForm = ({
  initialProduct = null,
  submitLabel,
  submitting = false,
  submitError = null,
  onSubmit,
  onCancel,
}: ProductFormProps) => {
  const {
    register,
    handleSubmit,
    control,
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
      imageUrl: initialProduct?.thumbnail ?? "",
    },
  });

  const watchedImageUrl = useWatch({ control, name: "imageUrl" });

  const heading = initialProduct ? "Edit Product" : "Add Product";

  const labelClasses =
    "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";
  const errorClasses = "mt-1 text-xs text-red-600 dark:text-red-400";

  /** Required fields show the mockup's red asterisk next to their label. */
  const renderLabel = (
    htmlFor: string,
    text: string,
    required: boolean = true,
  ) => (
    <label htmlFor={htmlFor} className={labelClasses}>
      {text}
      {required && (
        <span className="ml-0.5 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );

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
          imageUrl: values.imageUrl.trim(),
        }),
      )}
      className="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {heading}
      </h2>

      {submitError && (
        <p
          className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400"
          role="alert"
        >
          {submitError}
        </p>
      )}

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Fill in product details
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          {renderLabel("product-name", "Product Name")}

          <input
            id="product-name"
            type="text"
            placeholder="Enter product name"
            {...register("name")}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={
              errors.name ? "product-name-error" : undefined
            }
            className={inputClasses}
          />

          {errors.name && (
            <p id="product-name-error" className={errorClasses}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          {renderLabel("product-category", "Category")}

          <select
            id="product-category"
            {...register("category")}
            aria-invalid={errors.category ? true : undefined}
            aria-describedby={
              errors.category ? "product-category-error" : undefined
            }
            className={withClasses(inputClasses, "text-gray-700 dark:text-gray-300")}
          >
            <option value="">Select category</option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {errors.category && (
            <p id="product-category-error" className={errorClasses}>
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          {renderLabel("product-price", "Price")}

          <input
            id="product-price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter price"
            {...register("price")}
            aria-invalid={errors.price ? true : undefined}
            aria-describedby={
              errors.price ? "product-price-error" : undefined
            }
            className={inputClasses}
          />

          {errors.price && (
            <p id="product-price-error" className={errorClasses}>
              {errors.price.message}
            </p>
          )}
        </div>

        <div>
          {renderLabel("product-stock", "Stock")}

          <input
            id="product-stock"
            type="number"
            min="0"
            step="1"
            placeholder="Enter stock"
            {...register("stock")}
            aria-invalid={errors.stock ? true : undefined}
            aria-describedby={
              errors.stock ? "product-stock-error" : undefined
            }
            className={inputClasses}
          />

          {errors.stock && (
            <p id="product-stock-error" className={errorClasses}>
              {errors.stock.message}
            </p>
          )}
        </div>

        <div>
          {renderLabel("product-status", "Status")}

          <select
            id="product-status"
            {...register("status")}
            aria-invalid={errors.status ? true : undefined}
            aria-describedby={
              errors.status ? "product-status-error" : undefined
            }
            className={withClasses(inputClasses, "text-gray-700 dark:text-gray-300")}
          >
            <option value="">Select status</option>
            {PRODUCT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {errors.status && (
            <p id="product-status-error" className={errorClasses}>
              {errors.status.message}
            </p>
          )}
        </div>

        <div>
          {renderLabel("product-image-url", "Image URL", false)}

          <div className="flex items-center gap-3">
            <ProductImagePreview key={watchedImageUrl} src={watchedImageUrl} />

            <input
              id="product-image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              {...register("imageUrl")}
              aria-invalid={errors.imageUrl ? true : undefined}
              aria-describedby={
                errors.imageUrl ? "product-image-url-error" : undefined
              }
              className={inputClasses}
            />
          </div>

          {errors.imageUrl && (
            <p id="product-image-url-error" className={errorClasses}>
              {errors.imageUrl.message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          {renderLabel("product-description", "Description", false)}

          <textarea
            id="product-description"
            rows={4}
            placeholder="Enter product description"
            {...register("description")}
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={
              errors.description ? "product-description-error" : undefined
            }
            className={withClasses(inputClasses, "resize-none")}
          />

          {errors.description && (
            <p id="product-description-error" className={errorClasses}>
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
          disabled={isSubmitting || submitting}
          className={withClasses(
            primaryButtonClasses,
            "w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
          )}
        >
          {submitting
            ? initialProduct
              ? "Saving..."
              : "Creating..."
            : (submitLabel ?? (initialProduct ? "Update Product" : "Save Product"))}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
