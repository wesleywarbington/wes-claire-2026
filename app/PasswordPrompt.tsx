"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PasswordPromptProps = {
  isOpen: boolean;
  title: string;
  confirmLabel: string;
  onConfirm: (password: string) => void;
  onClose: () => void;
  isSubmitting?: boolean;
  status?: { status: "idle" | "success" | "error"; message: string };
  size?: "default" | "compact";
  showClose?: boolean;
};

export default function PasswordPrompt({
  isOpen,
  title,
  confirmLabel,
  onConfirm,
  onClose,
  isSubmitting = false,
  status,
  size = "default",
  showClose = true,
}: PasswordPromptProps) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (status?.status === "success") {
      onClose();
    }
  }, [isOpen, onClose, status?.status]);

  if (!isOpen) return null;

  const handleClose = () => {
    setPassword("");
    onClose();
  };

  const modalContent = (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        className={`modal${size === "compact" ? " modal-compact" : ""}`}
        onClick={(event) => event.stopPropagation()}
      >
        {title || showClose ? (
          <div className="modal-header">
            {title ? <h2>{title}</h2> : <span />}
            {showClose ? (
              <button
                className="ghost-btn modal-close"
                type="button"
                onClick={handleClose}
              >
                Close
              </button>
            ) : null}
          </div>
        ) : null}
        <form
          className="log-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!password.trim()) return;
            onConfirm(password);
          }}
        >
          <label className="field">
            <span className="sr-only">Password</span>
            <input
              type="password"
              autoComplete="off"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoFocus
            />
          </label>
          <div className="form-actions">
            <button
              type="submit"
              className="primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Working..." : confirmLabel}
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            {status?.message ? (
              <p className={`form-message ${status.status}`}>
                {status.message}
              </p>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
