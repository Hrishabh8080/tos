/** Route-level Loading UI (App Router Suspense fallback). */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        gap: "16px",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          border: "3px solid var(--line)",
          borderTopColor: "var(--secondary)",
          animation: "tos-spin .8s linear infinite",
        }}
      />
      <p style={{ color: "var(--text-3)", fontSize: ".92rem" }}>Loading…</p>
      <style>{`@keyframes tos-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
