import { unstable_noStore as noStore } from "next/cache";
import {
  addVisit,
  addWish,
  deleteVisit,
  deleteWish,
  updateVisit,
} from "./actions";
import DeleteVisitForm from "./DeleteVisitForm";
import DeleteWishForm from "./DeleteWishForm";
import EditVisitModal from "./EditVisitModal";
import LogVisitModal from "./LogVisitModal";
import MapTabs from "./MapTabs";
import MapView from "./MapView";
import WishListModal from "./WishListModal";
import { createSupabaseServerClient } from "../lib/supabaseServer";

export default async function Home() {
  noStore();

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("restaurant_visits")
    .select(
      "id, restaurant_name, neighborhood, visited_on, meal_cost, wesley_rating, claire_rating, notes, photo_url, place_id, place_address, place_lat, place_lng, created_at"
    )
    .order("visited_on", { ascending: false })
    .order("created_at", { ascending: false });

  const { data: wishData } = await supabase
    .from("future_spots")
    .select(
      "id, place_name, neighborhood, notes, place_id, place_address, place_lat, place_lng, created_at"
    )
    .order("created_at", { ascending: false });

  const entries = (data ?? []).map((entry) => ({
    id: entry.id,
    name: entry.restaurant_name,
    neighborhood: entry.neighborhood,
    date: entry.visited_on ? new Date(entry.visited_on) : null,
    mealCost: entry.meal_cost,
    note: entry.notes,
    wesleyRating: entry.wesley_rating,
    claireRating: entry.claire_rating,
    photoUrl: entry.photo_url,
    placeId: entry.place_id,
    placeAddress: entry.place_address,
    placeLat: entry.place_lat,
    placeLng: entry.place_lng,
  }));

  const wishList = (wishData ?? []).map((entry) => ({
    id: entry.id,
    name: entry.place_name,
    neighborhood: entry.neighborhood,
    notes: entry.notes,
    placeId: entry.place_id,
    placeAddress: entry.place_address,
    placeLat: entry.place_lat,
    placeLng: entry.place_lng,
  }));

  const neighborhoodsCovered = new Set(
    entries.map((entry) => entry.neighborhood).filter(Boolean)
  ).size;
  const mapLocations = entries
    .filter(
      (entry) =>
        typeof entry.placeLat === "number" && typeof entry.placeLng === "number"
    )
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      lat: entry.placeLat as number,
      lng: entry.placeLng as number,
      address: entry.placeAddress ?? null,
    }));

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <div className="backdrop"></div>
      <main className="page" id="main">
        <header className="hero">
          <div>
            <p className="eyebrow">Atlanta Restaurant Log</p>
            <h1>26 new spots in 2026</h1>
            <div className="hero-actions">
              <div className="hero-metrics">
                <span>{entries.length} places logged</span>
                <span>{neighborhoodsCovered} neighborhoods</span>
              </div>
              <LogVisitModal action={addVisit} />
            </div>
          </div>
        </header>

        <MapTabs
          mapPanel={
            <section className="grid single">
              <div className="panel map-panel">
                <MapView
                  apiKey={process.env.GOOGLE_MAPS_API_KEY}
                  locations={mapLocations}
                />
              </div>
            </section>
          }
          listPanel={
            <section className="grid single">
              <div className="panel">
                <div className="entries">
                  {entries.length === 0 ? (
                    <p className="empty-state">
                      No visits yet. Log your first spot to get the streak
                      rolling.
                    </p>
                  ) : (
                    entries.map((entry) => (
                      <article className="entry-card" key={entry.id}>
                        <div
                          className={`entry-photo ${
                            entry.photoUrl ? "photo" : "peach"
                          }`}
                          style={
                            entry.photoUrl
                              ? {
                                  backgroundImage: `url(${entry.photoUrl})`,
                                }
                              : undefined
                          }
                        ></div>
                        <div className="entry-content">
                          <p className="entry-title">{entry.name}</p>
                          <p className="entry-meta">
                            {entry.neighborhood || "Atlanta"} ·{" "}
                            {entry.date
                              ? dateFormatter.format(entry.date)
                              : "TBD"}
                            {entry.placeId || entry.placeLat ? (
                              <>
                                {" "}
                                ·{" "}
                                <a
                                  className="entry-map"
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    entry.placeAddress || entry.name
                                  )}${
                                    entry.placeId
                                      ? `&query_place_id=${entry.placeId}`
                                      : ""
                                  }`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Map
                                </a>
                              </>
                            ) : null}
                          </p>
                          <p className="entry-note">
                            {entry.note || "No notes yet."}
                          </p>
                          <div className="entry-footer">
                            <span className="chip rating-chip">
                              <span className="chip-label">W</span>
                              <span className="chip-value">
                                {entry.wesleyRating ?? "N/A"}
                              </span>
                            </span>
                            <span className="chip rating-chip">
                              <span className="chip-label">C</span>
                              <span className="chip-value">
                                {entry.claireRating ?? "N/A"}
                              </span>
                            </span>
                            {entry.mealCost !== null &&
                            entry.mealCost !== undefined ? (
                              <span className="chip rating-chip">
                                <span className="chip-label">Cost</span>
                                <span className="chip-value">
                                  {currencyFormatter.format(entry.mealCost)}
                                </span>
                              </span>
                            ) : null}
                          </div>
                          <div className="entry-actions">
                            <EditVisitModal
                              action={updateVisit}
                              initialValues={{
                                id: entry.id,
                                restaurantName: entry.name,
                                neighborhood: entry.neighborhood ?? "",
                                visitDate: entry.date
                                  ? entry.date.toISOString().split("T")[0]
                                  : "",
                                mealCost: entry.mealCost ?? null,
                                wesleyRating: entry.wesleyRating,
                                claireRating: entry.claireRating,
                                notes: entry.note ?? "",
                                placeId: entry.placeId ?? "",
                                placeAddress: entry.placeAddress ?? "",
                                placeLat: entry.placeLat,
                                placeLng: entry.placeLng,
                              }}
                            />
                            <DeleteVisitForm
                              action={deleteVisit}
                              id={entry.id}
                            />
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </section>
          }
          wishPanel={
            <section className="grid single">
              <div className="panel">
                <div className="wish-panel">
                  <div className="wish-toolbar">
                    <WishListModal action={addWish} />
                  </div>
                  <div className="wish-list">
                    {wishList.length === 0 ? (
                      <p className="empty-state">
                        No future spots yet. Add a place to start the list.
                      </p>
                    ) : (
                      wishList.map((place) => (
                        <article className="wish-card" key={place.id}>
                          <div className="wish-content">
                            <p className="wish-title">{place.name}</p>
                            <p className="wish-meta">
                              {place.neighborhood || "Atlanta"}
                              {place.placeId || place.placeLat ? (
                                <>
                                  {" "}
                                  ·{" "}
                                  <a
                                    className="entry-map"
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                      place.placeAddress || place.name
                                    )}${
                                      place.placeId
                                        ? `&query_place_id=${place.placeId}`
                                        : ""
                                    }`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Map
                                  </a>
                                </>
                              ) : null}
                            </p>
                            <p className="wish-note">
                              {place.notes || "No notes yet."}
                            </p>
                          </div>
                          <div className="wish-actions">
                            <LogVisitModal
                              action={addVisit}
                              buttonLabel="Log visit"
                              buttonClassName="ghost-btn"
                              submitLabel="Log visit"
                              title="Log from wishlist"
                              initialValues={{
                                wishId: place.id,
                                restaurantName: place.name,
                                neighborhood: place.neighborhood ?? "",
                                notes: place.notes ?? "",
                                placeId: place.placeId ?? undefined,
                                placeAddress: place.placeAddress ?? undefined,
                                placeLat: place.placeLat ?? null,
                                placeLng: place.placeLng ?? null,
                              }}
                            />
                            <DeleteWishForm action={deleteWish} id={place.id} />
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>
          }
        />
      </main>
    </>
  );
}
