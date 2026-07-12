import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Hero from "@/components/home/Hero";
import StatsBand from "@/components/home/StatsBand";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Brands from "@/components/home/Brands";
import ProductRail from "@/components/home/ProductRail";
import Industries from "@/components/home/Industries";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import BulkBanner from "@/components/home/BulkBanner";
import ContactCTA from "@/components/home/ContactCTA";

export const metadata = {
  title: "Wholesale Electrical & Office Supply Partner for Businesses",
  description:
    "Total Office Solutions — trusted B2B wholesale supplier of genuine electrical products, wires, cables, switchgear & office supplies. Bulk supply, corporate orders, fast delivery, authorized brands.",
};

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatsBand />
        <WhyChooseUs />
        <Brands />
        <ProductRail
          eyebrow="Featured Products"
          title="Handpicked bestsellers for bulk buyers"
          subtitle="Top-moving products across wires, switchgear and office essentials."
          endpoint="/api/products?featured=true"
          hideIfEmpty
        />
        <Industries />
        <HowItWorks />
        <Testimonials />
        <BulkBanner />
        <ProductRail
          eyebrow="Latest Products"
          title="Freshly added to our catalogue"
          subtitle="The newest additions from India's leading electrical brands."
          endpoint="/api/products"
          tone="soft"
        />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
