"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import VisitForm, { type VisitFormInitialValues } from "./VisitForm";

type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

type LogVisitModalProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  initialValues?: VisitFormInitialValues;
  submitLabel?: string;
  buttonLabel?: string;
  title?: string;
  buttonClassName?: string;
};

export default function LogVisitModal({
  action,
  initialValues,
  submitLabel = "Add This Visit",
  buttonLabel = "Add a new visit",
  title = "Log a New Restaurant",
  buttonClassName,
}: LogVisitModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const modalContent = isOpen ? (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            className="ghost-btn modal-close"
            type="button"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
        <VisitForm
          action={action}
          onSuccess={handleClose}
          initialValues={initialValues}
          submitLabel={submitLabel}
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        className={buttonClassName ?? "primary-btn"}
        type="button"
        onClick={handleOpen}
      >
        {buttonLabel}
      </button>
      {typeof document !== "undefined" && modalContent
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}
