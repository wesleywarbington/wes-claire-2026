"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import WishListForm from "./WishListForm";

type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

type WishListModalProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

export default function WishListModal({ action }: WishListModalProps) {
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
          <h2>Add a Future Spot</h2>
          <button
            className="ghost-btn modal-close"
            type="button"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
        <WishListForm action={action} onSuccess={handleClose} />
      </div>
    </div>
  ) : null;

  return (
    <>
      <button className="primary-btn" type="button" onClick={handleOpen}>
        Add future spot
      </button>
      {typeof document !== "undefined" && modalContent
        ? createPortal(modalContent, document.body)
        : null}
    </>
  );
}
