"use client";

import { ReactNode, useState } from "react";

type MapTabsProps = {
  mapPanel: ReactNode;
  listPanel: ReactNode;
  wishPanel: ReactNode;
};

type TabKey = "list" | "map" | "wish";

export default function MapTabs({
  mapPanel,
  listPanel,
  wishPanel,
}: MapTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("list");

  return (
    <section className="tabs-shell">
      <div className="tab-row" role="tablist" aria-label="View switcher">
        <button
          type="button"
          role="tab"
          id="tab-list"
          aria-selected={activeTab === "list"}
          aria-controls="tab-panel-list"
          className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          Latest Meals
        </button>
        <button
          type="button"
          role="tab"
          id="tab-map"
          aria-selected={activeTab === "map"}
          aria-controls="tab-panel-map"
          className={`tab-btn ${activeTab === "map" ? "active" : ""}`}
          onClick={() => setActiveTab("map")}
        >
          Map View
        </button>
        <button
          type="button"
          role="tab"
          id="tab-wish"
          aria-selected={activeTab === "wish"}
          aria-controls="tab-panel-wish"
          className={`tab-btn ${activeTab === "wish" ? "active" : ""}`}
          onClick={() => setActiveTab("wish")}
        >
          Future Spots
        </button>
      </div>

      {activeTab === "list" ? (
        <div
          role="tabpanel"
          id="tab-panel-list"
          aria-labelledby="tab-list"
        >
          {listPanel}
        </div>
      ) : activeTab === "map" ? (
        <div role="tabpanel" id="tab-panel-map" aria-labelledby="tab-map">
          {mapPanel}
        </div>
      ) : (
        <div role="tabpanel" id="tab-panel-wish" aria-labelledby="tab-wish">
          {wishPanel}
        </div>
      )}
    </section>
  );
}
