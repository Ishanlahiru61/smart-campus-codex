import { useState } from "react";

export default function AdminResourceCataloguePage() {
  const [search, setSearch] = useState("");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fb" }}>
      <div
        style={{
          width: "250px",
          background: "#ffffff",
          padding: "20px",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <h2>Smart Campus</h2>
        <p style={{ color: "gray", marginTop: "-10px" }}>OPERATIONS HUB</p>

        <div style={{ marginTop: "30px", lineHeight: "2.2" }}>
          <p>Dashboard</p>
          <p style={{ fontWeight: "bold", color: "blue" }}>Resources</p>
          <p>Bookings</p>
          <p>Tickets</p>
          <p>Notifications</p>
          <p>Settings</p>
        </div>
      </div>

      <div style={{ flex: 1, padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "12px",
              width: "60%",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
            }}
          />

          <button
            style={{
              padding: "12px 20px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            + Add Resource
          </button>
        </div>

        <h1 style={{ marginTop: "30px" }}>Resource Management</h1>
        <p style={{ color: "gray" }}>Manage lecture halls, labs, and meeting rooms</p>

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              width: "250px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <h3>Lecture Hall A</h3>
            <p>Capacity: 120</p>
            <p>Location: Block A</p>
            <button
              style={{
                padding: "8px 16px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              View Details
            </button>
          </div>

          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              width: "250px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <h3>Lab B</h3>
            <p>Capacity: 40</p>
            <p>Location: Block B</p>
            <button
              style={{
                padding: "8px 16px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}