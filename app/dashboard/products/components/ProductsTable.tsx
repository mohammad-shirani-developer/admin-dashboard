"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import ProductThumbnail from "@/app/components/ui/ProductThumbnail";
import { formatUsd } from "../../analytics";
import { useEffect, useRef, useState } from "react";
import useOutsideClick from "@/app/hooks/useOutsideClick";
import { withClasses } from "@/app/components/ui/form-controls";
import StatusBadge from "../../components/StatusBadge";
import type { Product } from "../../types";

type ProductsTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

/** Approximate dropdown metrics used to keep the menu inside the viewport. */
const MENU_WIDTH_PX = 160;
const MENU_HEIGHT_PX = 96;

type RowActionsProps = {
  /** Accessible label describing the row, e.g. the product name. */
  label: string;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * "⋯" row action: opens a small Edit/Delete menu. The menu uses fixed
 * positioning (computed from the button rect) so it is never clipped by the
 * table's horizontal scroll container, flips upward near the viewport bottom,
 * closes on outside click / Escape / scroll and is keyboard accessible.
 */
const RowActions = ({ label, onEdit, onDelete }: RowActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  useOutsideClick(wrapperRef, () => setIsOpen(false), isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    firstItemRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleClose = () => setIsOpen(false);

    window.addEventListener("keydown", handleKeyDown);
    // Capture: also closes when the table's own scroll container scrolls.
    window.addEventListener("scroll", handleClose, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleClose, true);
    };
  }, [isOpen]);

  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const left = Math.min(
        Math.max(rect.right - MENU_WIDTH_PX, 8),
        window.innerWidth - MENU_WIDTH_PX - 8,
      );
      const opensUpward = rect.bottom + MENU_HEIGHT_PX > window.innerHeight;
      setPosition({
        top: opensUpward ? rect.top - MENU_HEIGHT_PX - 6 : rect.bottom + 6,
        left,
      });
    }
    setIsOpen(true);
  };

  const menuItemClasses =
    "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800";

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions for ${label}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>

      {isOpen && position && (
        <div
          role="menu"
          aria-label={`${label} actions`}
          style={{ top: position.top, left: position.left }}
          className="fixed z-50 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          <button
            ref={firstItemRef}
            role="menuitem"
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
            className={withClasses(
              menuItemClasses,
              "text-gray-700 dark:text-gray-200",
            )}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </button>

          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className={withClasses(
              menuItemClasses,
              "text-red-600 dark:text-red-400",
            )}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const ProductsTable = ({ products, onEdit, onDelete }: ProductsTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <table className="w-full min-w-[860px] text-left text-sm">
        <caption className="sr-only">
          Products with image, name, category, price, stock and status
        </caption>
        <thead className="bg-gray-50 dark:bg-gray-800/50">
          <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <th scope="col" className="px-4 py-3 font-medium">Image</th>
            <th scope="col" className="px-4 py-3 font-medium">Name</th>
            <th scope="col" className="px-4 py-3 font-medium">Category</th>
            <th scope="col" className="px-4 py-3 font-medium">Price</th>
            <th scope="col" className="px-4 py-3 font-medium">Stock</th>
            <th scope="col" className="px-4 py-3 font-medium">Status</th>
            <th scope="col" className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {products.length > 0 ? (
            products.map((product) => (
              <tr
                key={product.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
              >
                <td className="px-4 py-3">
                  <ProductThumbnail
                    src={product.thumbnail}
                    className="border border-gray-100 dark:border-gray-800"
                  />
                </td>

                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                  {product.name}
                </td>

                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {product.category}
                </td>

                <td className="px-4 py-3 font-medium tabular-nums text-gray-900 dark:text-gray-100">
                  {formatUsd(product.price)}
                </td>

                <td className="px-4 py-3 tabular-nums text-gray-600 dark:text-gray-400">
                  {product.stock} units
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={product.status} />
                </td>

                <td className="px-4 py-3">
                  <RowActions
                    label={product.name}
                    onEdit={() => onEdit(product)}
                    onDelete={() => onDelete(product)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400"
              >
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
