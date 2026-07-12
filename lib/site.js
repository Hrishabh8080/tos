/**
 * Central site configuration — single source of truth for company info,
 * navigation, brands, industries and marketing content.
 * Import from anywhere: `import { SITE, NAV, BRANDS } from '@/lib/site'`
 */

export const SITE = {
  name: "Total Office Solutions",
  shortName: "TOS",
  url: "https://www.toselectricals.com",
  tagline: "Trusted Electrical & Office Supply Partner for Businesses",
  email: "support@toselectricals.com",
  phones: ["+919911491624", "+919990901524"],
  whatsapp: "919911491624",
  gstin: "06XXXXXXXXXXX1Z5",
  address: {
    street: "Office No. 2, Ashok Vihar Phase II, Near Shiv Shakti Mandir",
    city: "Gurgaon",
    state: "Haryana",
    country: "India",
  },
  geo: { lat: 28.4915636, lng: 77.0189425 },
  hours: [
    { day: "Monday – Saturday", time: "9:30 AM – 7:30 PM" },
    { day: "Sunday", time: "Closed" },
  ],
};

/** Build a pre-filled WhatsApp link */
export const waLink = (text = "") =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

/* ---------------- Pre-filled WhatsApp messages per enquiry source ---------------- */
const line = (label, val) => (val ? `${label}: ${String(val).trim()}\n` : "");

/** Product Detail enquiry → includes product, variant, price, quantity, URL. */
export const buildProductWa = ({ name, phone, productName, variant, price, quantity, unit, url }) =>
  waLink(
    `Hello ${SITE.name},\n\nI would like to request a quotation.\n\n` +
    line("Name", name) +
    line("Phone", phone) +
    line("Product", productName) +
    line("Variant", variant) +
    line("Price", price) +
    line("Quantity", quantity ? `${quantity}${unit ? " " + unit : ""}` : "") +
    line("Product URL", url) +
    `\nPlease share the best bulk price. Thank you.`
  );

/** Contact page enquiry. */
export const buildContactWa = ({ name, company, phone, email, message }) =>
  waLink(
    `Hello ${SITE.name},\n\n` +
    line("Name", name) +
    line("Company", company) +
    line("Phone", phone) +
    line("Email", email) +
    (message ? `\nMessage:\n${message.trim()}\n` : "") +
    `\nPlease contact me. Thank you.`
  );

/** Bulk Enquiry page → full company + requirement + BOM filename. */
export const buildBulkWa = ({ company, gst, contactPerson, phone, email, city, state, brand, quantity, requirement, fileName }) =>
  waLink(
    `Hello ${SITE.name},\n\nI would like to request a bulk quotation.\n\n` +
    line("Company", company) +
    line("GST", gst) +
    line("Contact Person", contactPerson) +
    line("Phone", phone) +
    line("Email", email) +
    line("City", city) +
    line("State", state) +
    line("Preferred Brand", brand) +
    line("Estimated Quantity", quantity) +
    (requirement ? `\nRequirement:\n${requirement.trim()}\n` : "") +
    line("BOM File", fileName) +
    `\nPlease share the best quote. Thank you.`
  );

export const NAV = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Bulk Enquiry", path: "/bulk-enquiry" },
  { name: "About", path: "/#about" },
  { name: "Contact", path: "/contact" },
];

/** Animated hero/statistics band */
export const STATS = [
  { value: 9, suffix: "+", label: "Years Experience" },
  { value: 12000, suffix: "+", label: "Products" },
  { value: 3500, suffix: "+", label: "Happy Clients" },
  { value: 50000, suffix: "+", label: "Bulk Orders Delivered" },
];

/** Brands We Deal In */
export const BRANDS = [
  { name: "Havells", logo: "Havells.svg" },
  { name: "Polycab" },
  { name: "Legrand", logo: "legrand.svg" },
  { name: "Anchor" },
  { name: "Finolex" },
  { name: "KEI", logo: "Kei.png" },
  { name: "RR Kabel" },
  { name: "Schneider", logo: "schneider.svg" },
  { name: "Crabtree" },
  { name: "Panasonic" },
  { name: "ABB", logo: "abb.svg" },
  { name: "Philips", logo: "philips.svg" },
];

export const WHY_CHOOSE = [
  {
    icon: "shield",
    title: "100% Genuine Products",
    desc: "Every product is sourced directly from authorized brands with full warranty and authenticity guarantee.",
  },
  {
    icon: "truck",
    title: "Fast Bulk Delivery",
    desc: "Pan-India logistics network ensuring on-time delivery for large corporate and project orders.",
  },
  {
    icon: "tag",
    title: "Best Wholesale Pricing",
    desc: "Direct-from-distributor rates with transparent quotes and volume-based corporate discounts.",
  },
  {
    icon: "headset",
    title: "Dedicated Corporate Support",
    desc: "A single point of contact for quotations, BOM matching, order tracking and after-sales service.",
  },
  {
    icon: "badge",
    title: "GST Verified Supplier",
    desc: "Fully GST-compliant invoicing for seamless input credit and enterprise procurement.",
  },
  {
    icon: "layers",
    title: "Wide Product Range",
    desc: "From wires & cables to switchgear, lighting and office essentials — all under one roof.",
  },
];

export const INDUSTRIES = [
  { icon: "building", name: "Corporate Offices" },
  { icon: "factory", name: "Manufacturing & Industrial" },
  { icon: "hospital", name: "Hospitals & Healthcare" },
  { icon: "hotel", name: "Hotels & Hospitality" },
  { icon: "cart", name: "Retail & Malls" },
  { icon: "cap", name: "Educational Institutes" },
  { icon: "home", name: "Real Estate & Builders" },
  { icon: "bolt", name: "Electrical Contractors" },
];

export const HOW_IT_WORKS = [
  { step: "01", title: "Share Requirement", desc: "Send your product list, BOM or Excel through our bulk enquiry form." },
  { step: "02", title: "Get Best Quote", desc: "Receive a transparent, GST-compliant wholesale quotation within hours." },
  { step: "03", title: "Confirm Order", desc: "Approve the quote and finalize quantities, brands and delivery timeline." },
  { step: "04", title: "Fast Delivery", desc: "We dispatch and deliver pan-India with full tracking and support." },
];

export const TRUST_BADGES = [
  "GST Verified",
  "Authorized Brands",
  "100% Original",
  "Fast Delivery",
  "Bulk Orders",
  "Corporate Support",
];

export const TESTIMONIALS = [
  {
    name: "Rajesh Menon",
    role: "Procurement Head, Manufacturing",
    quote:
      "TOS has been our go-to electrical supplier for three years. Genuine brands, sharp pricing and never a delayed delivery on bulk orders.",
    avatar: "user1.jpeg",
  },
  {
    name: "Priya Sharma",
    role: "Facility Manager, Corporate Park",
    quote:
      "Their corporate support team handled our entire office fit-out BOM and delivered ahead of schedule. Truly enterprise-grade service.",
    avatar: "femail.png",
  },
  {
    name: "Amit Verma",
    role: "Director, Electrical Contractor",
    quote:
      "The quote turnaround is the fastest I've worked with. GST-compliant invoicing makes procurement effortless for our projects.",
    avatar: "male.jpeg",
  },
];
