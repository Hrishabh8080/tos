import nodemailer from "nodemailer";

/**
 * Shared, cached nodemailer transporter + HTML sanitizer.
 * Mirrors the config used by the existing contact-request route so behavior
 * is consistent, without modifying that working route.
 */
let transporter = null;

export function getTransporter() {
  if (!transporter) {
    const cfg = {
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    };
    if (process.env.EMAIL_HOST) {
      cfg.host = process.env.EMAIL_HOST;
      cfg.port = parseInt(process.env.EMAIL_PORT) || 587;
      cfg.secure = process.env.EMAIL_SECURE === "true";
      delete cfg.service;
    }
    transporter = nodemailer.createTransport(cfg);
  }
  return transporter;
}

export function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
