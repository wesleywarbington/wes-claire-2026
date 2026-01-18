import { addVisit } from "./actions";
import { createSupabaseServerClient } from "../lib/supabaseServer";

export default async function Home() {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const nextVisitGoal = new Date("2026-01-19");

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("restaurant_visits")
    .select(
      "id, restaurant_name, neighborhood, visited_on, rating, notes, return_plan, photo_url, created_at"
    )
    .order("visited_on", { ascending: false })
    .order("created_at", { ascending: false });

  const entries = (data ?? []).map((entry) => ({
    id: entry.id,
    name: entry.restaurant_name,
    neighborhood: entry.neighborhood,
    date: entry.visited_on ? new Date(entry.visited_on) : null,
    note: entry.notes,
    rating: entry.rating,
    returnPlan: entry.return_plan,
    photoUrl: entry.photo_url,
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
            <h1>Two weeks. One new table. Every time.</h1>
            <p className="subtitle">
              Track your Atlanta food adventures with photos, ratings, and the
              little moments worth remembering.
            </p>
          </div>
          <div className="status-card">
            <div className="status-row">
              <span className="label">Next visit goal</span>
              <span className="value">
                {dateFormatter.format(nextVisitGoal)}
              </span>
            </div>
            <div className="progress">
              <div className="progress-bar" style={{ width: "62%" }}></div>
            </div>
            <div className="status-row">
              <span className="label">Current streak</span>
              <span className="value">4 visits</span>
            </div>
            <div className="status-row">
              <span className="label">Neighborhoods covered</span>
              <span className="value">6</span>
            </div>
          </div>
        </header>

        <section className="grid">
          <div className="panel">
            <h2>Log a New Restaurant</h2>
            <form
              className="log-form"
              autoComplete="off"
              action={addVisit}
              encType="multipart/form-data"
            >
              <label className="field">
                <span>Restaurant name</span>
                <input
                  type="text"
                  name="restaurantName"
                  autoComplete="off"
                  placeholder="e.g. Miller Union…"
                />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Date</span>
                  <input type="date" name="visitDate" autoComplete="off" />
                </label>
                <label className="field">
                  <span>Neighborhood</span>
                  <input
                    type="text"
                    name="neighborhood"
                    autoComplete="off"
                    placeholder="e.g. West Midtown…"
                  />
                </label>
              </div>
              <label className="field">
                <span>Rating</span>
                <div className="rating">
                  {[5, 4, 3, 2, 1].map((value) => (
                    <label className="rating-pill" key={value}>
                      <input type="radio" name="rating" value={value} />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
              </label>
              <label className="field">
                <span>Return plan</span>
                <select name="returnPlan" defaultValue="">
                  <option value="" disabled>
                    Pick a vibe…
                  </option>
                  <option value="yes">Yes</option>
                  <option value="date night">Date night</option>
                  <option value="group">Group outing</option>
                  <option value="maybe">Maybe</option>
                </select>
              </label>
              <label className="field">
                <span>Thoughts</span>
                <textarea
                  rows="4"
                  name="notes"
                  autoComplete="off"
                  placeholder="Best bites, vibes, and the dish we'd order again…"
                ></textarea>
              </label>
              <label className="field file">
                <span>Upload a photo</span>
                <input type="file" accept="image/*" name="mealPhoto" />
                <span className="file-cta">Choose a meal photo</span>
              </label>
              <button type="submit" className="primary-btn">
                Add This Visit
              </button>
            </form>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Latest Adventures</h2>
              <button className="ghost-btn" type="button">
                View Map
              </button>
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
                        <span className="chip">
                          Rating {entry.rating ?? "N/A"}
                        </span>
                        <span className="chip">
                          Go back: {entry.returnPlan ?? "unsure"}
                        </span>
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
