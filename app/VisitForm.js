"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { supabaseClient } from "../lib/supabaseClient";

const initialState = { status: "idle", message: "" };

function SubmitButton({ label, disabled }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button type="submit" className="primary-btn" disabled={isDisabled}>
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
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [state, formAction] = useFormState(action, initialState);

  useEffect(() => {
    if (state.status !== "success") return;
    formRef.current?.reset();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    if (uploadError) {
      setUploadError("");
    }
    if (onSuccess) {
      onSuccess();
    }
  }, [state.status, previewUrl, onSuccess, uploadError]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploadError("");

    const formData = new FormData(formRef.current);
    const photoFile = formData.get("mealPhoto");

    if (photoFile && photoFile.size > 0) {
      setIsUploading(true);
      const fileExtension = photoFile.name?.split(".").pop() || "jpg";
      const filePath = `${crypto.randomUUID()}.${fileExtension}`;
      const { error: uploadError } = await supabaseClient.storage
        .from("meal-photos")
        .upload(filePath, photoFile, {
          contentType: photoFile.type || "image/jpeg",
        });

      if (uploadError) {
        setIsUploading(false);
        setUploadError("Photo upload failed. Try a smaller file.");
        return;
      }

      const { data } = supabaseClient.storage
        .from("meal-photos")
        .getPublicUrl(filePath);
      formData.set("photoUrl", data.publicUrl);
      formData.delete("mealPhoto");
      setIsUploading(false);
    }

    await formAction(formData);
  };

  return (
    <form
      ref={formRef}
      className="log-form"
      autoComplete="off"
      action={formAction}
      onSubmit={handleSubmit}
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
        <SubmitButton label={submitLabel} disabled={isUploading} />
        {state.message ? (
          <p className={`form-message ${state.status}`}>{state.message}</p>
        ) : null}
        {isUploading ? (
          <p className="form-message">Uploading photo…</p>
        ) : null}
        {uploadError ? (
          <p className="form-message error">{uploadError}</p>
        ) : null}
      </div>
    </form>
  );
}
