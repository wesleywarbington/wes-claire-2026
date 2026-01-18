"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import VisitForm from "./VisitForm";

export default function LogVisitModal({ action }) {
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
          <h2>Log a New Restaurant</h2>
          <button
            className="ghost-btn modal-close"
            type="button"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
        <VisitForm action={action} onSuccess={handleClose} />
      </div>
    </div>
  ) : null;

  return (
    <>
      <button className="primary-btn" type="button" onClick={handleOpen}>
        Add a new visit
      </button>
      {mounted && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}
