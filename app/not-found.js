import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Icon from "@/components/ui/Icon";

export const metadata = { title: "Page Not Found" };

/** Custom 404 page (App Router). */
export default function NotFound() {
  return (
    <>
      <Header />
      <main style={{ minHeight: "62vh", display: "grid", placeItems: "center", padding: "60px 24px", textAlign: "center", background: "var(--bg)" }}>
        <div style={{ maxWidth: 520 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(4rem,12vw,7rem)", lineHeight: 1, background: "var(--grad-primary)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>404</div>
          <h1 style={{ fontFamily: "var(--font-display)", color: "var(--text)", fontSize: "1.6rem", margin: "12px 0 10px" }}>Page not found</h1>
          <p style={{ color: "var(--text-3)", lineHeight: 1.6, marginBottom: 26 }}>
            The page you&apos;re looking for doesn&apos;t exist or may have moved. Explore our catalogue or get in touch.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 24px", borderRadius: 999, background: "var(--grad-blue)", color: "#fff", fontWeight: 600, fontFamily: "var(--font-display)", boxShadow: "var(--sh-blue)" }}>
              Browse Products <Icon name="arrow" size={17} />
            </Link>
            <Link href="/" style={{ padding: "14px 24px", borderRadius: 999, border: "1px solid var(--line-strong)", color: "var(--text)", fontWeight: 600, fontFamily: "var(--font-display)" }}>
              Go home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
