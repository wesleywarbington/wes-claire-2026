"use client";

import { useMemo, useState } from "react";

type PickPlace = {
  id: string;
  name: string;
  neighborhood: string | null;
  placeId?: string | null;
  placeAddress?: string | null;
};

type PickTonightProps = {
  places: PickPlace[];
};

export default function PickTonight({ places }: PickTonightProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedPlace = useMemo(
    () => places.find((place) => place.id === selectedId) ?? null,
    [places, selectedId]
  );

  const handlePick = () => {
    if (places.length === 0) return;
    if (places.length === 1) {
      setSelectedId(places[0].id);
      return;
    }

    let nextPick = places[Math.floor(Math.random() * places.length)];
    let guard = 0;
    while (nextPick.id === selectedId && guard < 4) {
      nextPick = places[Math.floor(Math.random() * places.length)];
      guard += 1;
    }
    setSelectedId(nextPick.id);
  };

  const mapUrl = selectedPlace
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        selectedPlace.placeAddress || selectedPlace.name
      )}${selectedPlace.placeId ? `&query_place_id=${selectedPlace.placeId}` : ""}`
    : "";

  return (
    <div className="pick-tonight">
      <button
        className="ghost-btn"
        type="button"
        onClick={handlePick}
        disabled={places.length === 0}
      >
        Pick tonight
      </button>
      {selectedPlace ? (
        <div className="pick-result">
          <span className="pick-title">{selectedPlace.name}</span>
          <span className="pick-meta">
            {selectedPlace.neighborhood || "Atlanta"} ·{" "}
            <a
              className="entry-map"
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              Map
            </a>
          </span>
        </div>
      ) : (
        <span className="pick-hint">
          {places.length === 0
            ? "Add a future spot first."
            : "Need a random pick?"}
        </span>
      )}
    </div>
  );
}
