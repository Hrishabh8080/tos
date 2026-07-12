"use client";
import Link from "next/link";

/** Root error boundary (App Router). Catches render/runtime errors in routes. */
export default function Error({ error, reset }) {
  return (
    <div style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: "40px 24px", background: "var(--bg)" }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, margin: "0 auto 20px", display: "grid", placeItems: "center", borderRadius: "50%", background: "rgba(220,38,38,.08)", color: "#dc2626", fontSize: 34 }}>!</div>
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontSize: "1.6rem", marginBottom: 10 }}>Something went wrong</h1>
        <p style={{ color: "var(--text-3)", lineHeight: 1.6, marginBottom: 24 }}>
          An unexpected error occurred. You can try again, or head back to the homepage.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => reset()}
            style={{ padding: "13px 24px", borderRadius: 999, border: "none", background: "var(--grad-blue, #2563EB)", color: "#fff", fontWeight: 600, fontFamily: "var(--font-display)", cursor: "pointer" }}
          >
            Try again
          </button>
          <Link href="/" style={{ padding: "13px 24px", borderRadius: 999, border: "1px solid var(--line-strong)", color: "var(--text)", fontWeight: 600, fontFamily: "var(--font-display)" }}>
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
