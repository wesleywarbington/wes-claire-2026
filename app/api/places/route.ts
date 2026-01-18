import { NextResponse } from "next/server";

const ATLANTA_LOCATION = { lat: 33.749, lng: -84.388 };
const ATLANTA_RADIUS_METERS = 50000;

type PlacesResponse = {
  status?: string;
  error_message?: string;
  results?: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    geometry?: { location?: { lat?: number; lng?: number } };
  }>;
};

export async function GET(request: Request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Google Maps API key." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/textsearch/json"
  );
  url.searchParams.set("query", query);
  url.searchParams.set("type", "restaurant");
  url.searchParams.set("location", `${ATLANTA_LOCATION.lat},${ATLANTA_LOCATION.lng}`);
  url.searchParams.set("radius", ATLANTA_RADIUS_METERS.toString());
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });
    const data = (await response.json()) as PlacesResponse;

    if (!response.ok || data.status === "REQUEST_DENIED") {
      return NextResponse.json(
        { error: data.error_message || "Failed to fetch places." },
        { status: 500 }
      );
    }

    const results = (data.results || []).slice(0, 6).map((place) => ({
      placeId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry?.location?.lat ?? null,
      lng: place.geometry?.location?.lng ?? null,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to reach Google Maps." },
      { status: 500 }
    );
  }
}
