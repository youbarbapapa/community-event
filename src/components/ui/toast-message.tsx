"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ToastMessageProps = {
  message: string;
  variant?: "success" | "error";
  duration?: number;
  onDismiss?: () => void;
  className?: string;
};

export function ToastMessage({
  message,
  variant = "success",
  duration = 4000,
  onDismiss,
  className,
}: ToastMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible) {
    return null;
  }

  const variantClasses =
    variant === "success"
      ? "bg-emerald-500 text-white"
      : "bg-red-500 text-white";

  return (
    <div
      role="status"
      className={cn(
        "rounded-full px-4 py-2 text-sm shadow-lg backdrop-blur-md",
        variantClasses,
        className,
      )}
    >
      {message}
    </div>
  );
}
