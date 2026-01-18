"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import VisitForm from "./VisitForm";

export default function EditVisitModal({ action, initialValues }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
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
          <h2>Edit visit</h2>
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
          submitLabel="Save changes"
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      <button className="ghost-btn icon-btn" type="button" onClick={handleOpen}>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          focusable="false"
          className="icon"
        >
          <path d="M15.2 5.2l3.6 3.6-9.9 9.9H5.3v-3.6l9.9-9.9zm1.4-1.4l-1.4 1.4 3.6 3.6 1.4-1.4c.4-.4.4-1 0-1.4l-2.2-2.2c-.4-.4-1-.4-1.4 0z" />
        </svg>
        <span className="sr-only">Edit</span>
      </button>
      {mounted && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}
