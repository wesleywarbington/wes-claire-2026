"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { supabaseClient } from "../lib/supabaseClient";

type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

type PlaceResult = {
  placeId: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
};

type VisitFormInitialValues = {
  id?: string;
  restaurantName?: string;
  neighborhood?: string;
  visitDate?: string;
  wesleyRating?: number | null;
  claireRating?: number | null;
  notes?: string;
  placeId?: string;
  placeAddress?: string;
  placeLat?: number | null;
  placeLng?: number | null;
};

type VisitFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  onSuccess?: () => void;
  initialValues?: VisitFormInitialValues;
  submitLabel?: string;
};

const initialState: ActionState = { status: "idle", message: "" };

function SubmitButton({ label, disabled }: { label: string; disabled: boolean }) {
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
}: VisitFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const restaurantInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [state, formAction] = useActionState(action, initialState);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [placeError, setPlaceError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(
    initialValues?.placeId
      ? {
          placeId: initialValues.placeId,
          name: initialValues.restaurantName ?? "",
          address: initialValues.placeAddress ?? "",
          lat: initialValues.placeLat ?? null,
          lng: initialValues.placeLng ?? null,
        }
      : null
  );

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
    setPlaceQuery("");
    setPlaceResults([]);
    setPlaceError("");
    setSelectedPlace(null);
    if (onSuccess) {
      onSuccess();
    }
  }, [state.status, previewUrl, onSuccess, uploadError]);

  useEffect(() => {
    if (!placeQuery || placeQuery.trim().length < 2) {
      setPlaceResults([]);
      setPlaceError("");
      setIsSearching(false);
      return;
    }
    if (selectedPlace && placeQuery === selectedPlace.name) {
      setPlaceResults([]);
      setPlaceError("");
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const handle = setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(
          `/api/places?q=${encodeURIComponent(placeQuery)}`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Search failed.");
        }

        setPlaceResults(data.results ?? []);
        setPlaceError("");
      } catch (error) {
        if (controller.signal.aborted) return;
        setPlaceResults([]);
        setPlaceError("Could not load Google Maps results.");
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(handle);
    };
  }, [placeQuery, selectedPlace]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError("");

    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const photoFile = formData.get("mealPhoto");

    if (photoFile instanceof File && photoFile.size > 0) {
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

    startTransition(() => {
      formAction(formData);
    });
  };

  const handlePlaceQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setPlaceQuery(nextValue);
    if (selectedPlace && nextValue !== selectedPlace.name) {
      setSelectedPlace(null);
    }
  };

  const handleRestaurantNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (selectedPlace && event.target.value !== selectedPlace.name) {
      setSelectedPlace(null);
    }
  };

  const handleSelectPlace = (place: PlaceResult) => {
    setSelectedPlace(place);
    setPlaceResults([]);
    setPlaceQuery(place.name);
    if (restaurantInputRef.current) {
      restaurantInputRef.current.value = place.name;
    }
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
        <span>Search Google Maps</span>
        <input
          type="text"
          name="placeSearch"
          autoComplete="off"
          placeholder="Try &quot;Bacchanalia&quot; or &quot;pizza near O4W&quot;"
          value={placeQuery}
          onChange={handlePlaceQueryChange}
        />
        <span className="field-hint">
          Pick a result to attach the exact map location.
        </span>
      </label>
      {isSearching ? (
        <p className="form-message">Searching…</p>
      ) : null}
      {placeError ? <p className="form-message error">{placeError}</p> : null}
      {placeResults.length > 0 ? (
        <div className="place-results" role="listbox">
          {placeResults.map((place) => (
            <button
              key={place.placeId}
              type="button"
              className="place-result"
              onClick={() => handleSelectPlace(place)}
              role="option"
              aria-selected={selectedPlace?.placeId === place.placeId}
            >
              <span className="place-name">{place.name}</span>
              <span className="place-address">{place.address}</span>
            </button>
          ))}
        </div>
      ) : null}
      {selectedPlace ? (
        <div className="place-selected">
          <p>
            Selected place: <strong>{selectedPlace.name}</strong>
          </p>
          {selectedPlace.address ? (
            <p className="place-address">{selectedPlace.address}</p>
          ) : null}
        </div>
      ) : null}
      <label className="field">
        <span>Restaurant name</span>
        <input
          type="text"
          name="restaurantName"
          autoComplete="off"
          placeholder="e.g. Miller Union…"
          defaultValue={initialValues?.restaurantName ?? ""}
          ref={restaurantInputRef}
          onChange={handleRestaurantNameChange}
        />
      </label>
      <input
        type="hidden"
        name="placeId"
        value={selectedPlace?.placeId ?? ""}
        readOnly
      />
      <input
        type="hidden"
        name="placeAddress"
        value={selectedPlace?.address ?? ""}
        readOnly
      />
      <input
        type="hidden"
        name="placeLat"
        value={selectedPlace?.lat ?? ""}
        readOnly
      />
      <input
        type="hidden"
        name="placeLng"
        value={selectedPlace?.lng ?? ""}
        readOnly
      />
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
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
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
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
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
          <Image
            src={previewUrl}
            alt="Meal preview"
            width={1200}
            height={800}
            className="file-preview-image"
            unoptimized
          />
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
