import { unstable_noStore as noStore } from "next/cache";
import { addVisit, deleteVisit, updateVisit } from "./actions";
import EditVisitModal from "./EditVisitModal";
import LogVisitModal from "./LogVisitModal";
import { createSupabaseServerClient } from "../lib/supabaseServer";

export default async function Home() {
  noStore();

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("restaurant_visits")
    .select(
      "id, restaurant_name, neighborhood, visited_on, wesley_rating, claire_rating, notes, photo_url, created_at"
    )
    .order("visited_on", { ascending: false })
    .order("created_at", { ascending: false });

  const entries = (data ?? []).map((entry) => ({
    id: entry.id,
    name: entry.restaurant_name,
    neighborhood: entry.neighborhood,
    date: entry.visited_on ? new Date(entry.visited_on) : null,
    note: entry.notes,
    wesleyRating: entry.wesley_rating,
    claireRating: entry.claire_rating,
    photoUrl: entry.photo_url,
  }));

  const neighborhoodsCovered = new Set(
    entries.map((entry) => entry.neighborhood).filter(Boolean)
  ).size;

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

        <section className="grid single">
          <div className="panel">
            <div className="panel-head">
              <h2>Latest Adventures</h2>
            </div>
            <div className="entries">
              {entries.length === 0 ? (
                <p className="empty-state">
                  No visits yet. Log your first spot to get the streak rolling.
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
                          ? { backgroundImage: `url(${entry.photoUrl})` }
                          : undefined
                      }
                    ></div>
                    <div className="entry-content">
                      <p className="entry-title">{entry.name}</p>
                      <p className="entry-meta">
                        {entry.neighborhood || "Atlanta"} ·{" "}
                        {entry.date ? dateFormatter.format(entry.date) : "TBD"}
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
                            wesleyRating: entry.wesleyRating,
                            claireRating: entry.claireRating,
                            notes: entry.note ?? "",
                          }}
                        />
                        <form action={deleteVisit}>
                          <input type="hidden" name="id" value={entry.id} />
                          <button
                            type="submit"
                            className="ghost-btn icon-btn danger"
                            aria-label="Delete"
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
                        </form>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
