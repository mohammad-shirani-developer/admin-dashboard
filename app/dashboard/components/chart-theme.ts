"use client";

import { useTheme } from "next-themes";
import type { CSSProperties } from "react";
import type { OrderStatus } from "../types";

/**
 * Theme-aware recharts tokens. Colors follow the dashboard palette: light gray
 * grid/ticks in light mode, muted slate tones on dark surfaces.
 */
export type ChartTokens = {
  isDark: boolean;
  gridStroke: string;
  tickFill: string;
  cursorStroke: string;
  cursorFill: string;
  tooltipContentStyle: CSSProperties;
  tooltipLabelStyle: CSSProperties;
  tooltipItemStyle: CSSProperties;
};

export const useChartTheme = (): ChartTokens => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return {
    isDark,
    gridStroke: isDark ? "#374151" : "#e5e7eb",
    tickFill: isDark ? "#9ca3af" : "#6b7280",
    cursorStroke: isDark ? "#4b5563" : "#d1d5db",
    cursorFill: isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(107, 114, 128, 0.1)",
    tooltipContentStyle: {
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
      borderRadius: 8,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
    },
    tooltipLabelStyle: {
      color: isDark ? "#f9fafb" : "#111827",
      fontWeight: 600,
    },
    tooltipItemStyle: {
      color: isDark ? "#d1d5db" : "#374151",
    },
  };
};

/** Shared axis tick style so every chart renders labels identically. */
export const chartTickStyle = (tokens: ChartTokens) =>
  ({ fill: tokens.tickFill, fontSize: 12 }) as const;

/**
 * Donut hues from the mockup: emerald/blue/amber/red status palette. Single
 * source so the chart, its legend and any future status chart stay in sync.
 */
export const ORDER_STATUS_CHART_COLORS: Record<OrderStatus, string> = {
  Delivered: "#10b981",
  Processing: "#3b82f6",
  Pending: "#f59e0b",
  Cancelled: "#ef4444",
};
