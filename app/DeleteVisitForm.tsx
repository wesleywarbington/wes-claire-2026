"use client";

import { useActionState, useState } from "react";
import PasswordPrompt from "./PasswordPrompt";

type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

type DeleteVisitFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  id: string;
};

const initialState: ActionState = { status: "idle", message: "" };

export default function DeleteVisitForm({ action, id }: DeleteVisitFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <>
      <button
        type="button"
        className="ghost-btn icon-btn danger"
        aria-label="Delete"
        onClick={() => setIsOpen(true)}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          focusable="false"
          className="icon"
        >
          <path d="M7 7h10l-1 12H8L7 7zm3-3h4l1 2H9l1-2zm8-1h-4l-1-2H11l-1 2H6v2h12V3z" />
        </svg>
        <span className="sr-only">Delete</span>
      </button>
      {isOpen ? (
        <PasswordPrompt
          isOpen
          title="Confirm delete"
          confirmLabel="Delete"
          onConfirm={(password) => {
            if (!password.trim() || isPending) return;
            const formData = new FormData();
            formData.set("id", id);
            formData.set("editPassword", password);
            formAction(formData);
          }}
          onClose={() => setIsOpen(false)}
          isSubmitting={isPending}
          status={state}
          size="compact"
          showClose={false}
        />
      ) : null}
    </>
  );
}
