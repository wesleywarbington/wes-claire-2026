"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useFormStatus } from "react-dom";
import PasswordPrompt from "./PasswordPrompt";

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

type WishListFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  onSuccess?: () => void;
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

export default function WishListForm({ action, onSuccess }: WishListFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [state, formAction] = useActionState(action, initialState);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [placeError, setPlaceError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);

  useEffect(() => {
    if (state.status !== "success") return;
    formRef.current?.reset();
    setPlaceQuery("");
    setPlaceResults([]);
    setPlaceError("");
    setSelectedPlace(null);
    if (onSuccess) {
      onSuccess();
    }
  }, [state.status, onSuccess]);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPasswordPromptOpen(true);
  };

  const handlePasswordConfirm = async (password: string) => {
    if (!formRef.current) {
      return;
    }
    const formData = new FormData(formRef.current);
    formData.set("editPassword", password);

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

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (selectedPlace && event.target.value !== selectedPlace.name) {
      setSelectedPlace(null);
    }
  };

  const handleSelectPlace = (place: PlaceResult) => {
    setSelectedPlace(place);
    setPlaceResults([]);
    setPlaceQuery(place.name);
    if (nameInputRef.current) {
      nameInputRef.current.value = place.name;
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
      <label className="field">
        <span>Search Google Maps</span>
        <input
          type="text"
          name="placeSearch"
          autoComplete="off"
          placeholder="Try &quot;Bacchanalia&quot; or &quot;tacos nearby&quot;"
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
        <span>Place name</span>
        <input
          type="text"
          name="placeName"
          autoComplete="off"
          placeholder="e.g. Miller Union…"
          ref={nameInputRef}
          onChange={handleNameChange}
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
      <label className="field">
        <span>Neighborhood</span>
        <input
          type="text"
          name="neighborhood"
          autoComplete="off"
          placeholder="e.g. West Midtown…"
        />
      </label>
      <label className="field">
        <span>Notes</span>
        <textarea
          rows={3}
          name="notes"
          autoComplete="off"
          placeholder="What should we try? Who recommended it?"
        ></textarea>
      </label>
      <div className="form-actions">
        <SubmitButton label="Add future spot" disabled={false} />
        {state.message ? (
          <p className={`form-message ${state.status}`}>{state.message}</p>
        ) : null}
      </div>
      {isPasswordPromptOpen ? (
        <PasswordPrompt
          isOpen
          title="Confirm password"
          confirmLabel="Add future spot"
          onConfirm={handlePasswordConfirm}
          onClose={() => setIsPasswordPromptOpen(false)}
          status={state}
          size="compact"
          showClose={false}
        />
      ) : null}
    </form>
  );
}
