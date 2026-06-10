import { ImageResponse } from "next/og";

export const alt = "Knockout — punch out on time";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07080a",
          padding: "72px",
          position: "relative",
        }}
      >
        {/* stripe accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "10px",
            background: "linear-gradient(90deg, #ff5757, #a1131a)",
          }}
        />

        {/* logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              border: "2px solid #242728",
              background: "#0d0d0d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <g stroke="#f4f4f6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 3.6V20.4" />
                <path d="M7 12.4 16.4 4.6" />
                <path d="M7 11.6 16.8 20" />
              </g>
              <circle cx="18.4" cy="4.3" r="1.9" fill="#ff6161" />
            </svg>
          </div>
          <div style={{ fontSize: "30px", fontWeight: 600, color: "#f4f4f6" }}>
            Knockout
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 700,
              color: "#f4f4f6",
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            Your body went home.
          </div>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 700,
              color: "#9c9c9d",
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            Your timesheet didn&apos;t.
          </div>
          <div style={{ marginTop: "28px", fontSize: "28px", color: "#cdcdcd" }}>
            Email + push the moment your shift ends. Punch out on time, every time.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
