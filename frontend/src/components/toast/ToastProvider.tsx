"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  /** ms before auto-dismiss. default 3500 */
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

// ─── Context ──────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Icons ────────────────────────────────────────────────────────

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: "rgba(16, 24, 20, 0.95)",
    border: "rgba(52, 211, 153, 0.3)",
    icon: "#34d399",
  },
  error: {
    bg: "rgba(24, 12, 12, 0.95)",
    border: "rgba(248, 113, 113, 0.3)",
    icon: "#f87171",
  },
  info: {
    bg: "rgba(12, 18, 28, 0.95)",
    border: "rgba(96, 165, 250, 0.3)",
    icon: "#60a5fa",
  },
  warning: {
    bg: "rgba(24, 20, 8, 0.95)",
    border: "rgba(251, 191, 36, 0.3)",
    icon: "#fbbf24",
  },
};

// ─── Provider ─────────────────────────────────────────────────────

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration = 3500) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* ── Toast Container ─────────────────────────────── */}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => {
          const palette = COLORS[t.type];
          return (
            <div
              key={t.id}
              className="toast-item"
              style={{
                background: palette.bg,
                border: `1px solid ${palette.border}`,
              }}
              role="alert"
            >
              {/* Icon bubble */}
              <span
                className="toast-icon"
                style={{ color: palette.icon, background: `${palette.border}` }}
              >
                {ICONS[t.type]}
              </span>

              {/* Message */}
              <span className="toast-message">{t.message}</span>

              {/* Dismiss button */}
              <button
                className="toast-dismiss"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
              >
                ✕
              </button>

              {/* Progress bar */}
              <div
                className="toast-progress"
                style={{
                  background: palette.icon,
                  animationDuration: `${t.duration ?? 3500}ms`,
                }}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
