"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

const initialState = { status: "idle", message: "" };

function SubmitButton({ label }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="primary-btn" disabled={pending}>
      {pending ? "Saving..." : label}
    </button>
  );
}

export default function VisitForm({
  action,
  onSuccess,
  initialValues,
  submitLabel = "Add This Visit",
}) {
  const formRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [state, formAction] = useFormState(action, initialState);

  useEffect(() => {
    if (state.status !== "success") return;
    formRef.current?.reset();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    if (onSuccess) {
      onSuccess();
    }
  }, [state.status, previewUrl, onSuccess]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      return;
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <form
      ref={formRef}
      className="log-form"
      autoComplete="off"
      action={formAction}
    >
      {initialValues?.id ? (
        <input type="hidden" name="id" value={initialValues.id} />
      ) : null}
      <label className="field">
        <span>Restaurant name</span>
        <input
          type="text"
          name="restaurantName"
          autoComplete="off"
          placeholder="e.g. Miller Union…"
          defaultValue={initialValues?.restaurantName ?? ""}
        />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Date</span>
          <input
            type="date"
            name="visitDate"
            autoComplete="off"
            defaultValue={initialValues?.visitDate ?? ""}
          />
        </label>
        <label className="field">
          <span>Neighborhood</span>
          <input
            type="text"
            name="neighborhood"
            autoComplete="off"
            placeholder="e.g. West Midtown…"
            defaultValue={initialValues?.neighborhood ?? ""}
          />
        </label>
      </div>
      <div className="field-row rating-rows">
        <label className="field">
          <span>Wesley rating</span>
          <div className="rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <label className="rating-pill" key={`wesley-${value}`}>
                <input
                  type="radio"
                  name="wesleyRating"
                  value={value}
                  defaultChecked={initialValues?.wesleyRating === value}
                />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </label>
        <label className="field">
          <span>Claire rating</span>
          <div className="rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <label className="rating-pill" key={`claire-${value}`}>
                <input
                  type="radio"
                  name="claireRating"
                  value={value}
                  defaultChecked={initialValues?.claireRating === value}
                />
                <span>{value}</span>
              </label>
            ))}
          </div>
        </label>
      </div>
      <label className="field">
        <span>Thoughts</span>
        <textarea
          rows="4"
          name="notes"
          autoComplete="off"
          placeholder="Best bites, vibes, and the dish we'd order again…"
          defaultValue={initialValues?.notes ?? ""}
        ></textarea>
      </label>
      <label className="field file">
        <span>Upload a photo</span>
        <input
          type="file"
          accept="image/*"
          name="mealPhoto"
          onChange={handlePhotoChange}
        />
        <span className="file-cta">Choose a meal photo</span>
      </label>
      {previewUrl ? (
        <div className="file-preview">
          <img src={previewUrl} alt="Meal preview" />
        </div>
      ) : null}
      <div className="form-actions">
        <SubmitButton label={submitLabel} />
        {state.message ? (
          <p className={`form-message ${state.status}`}>{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
