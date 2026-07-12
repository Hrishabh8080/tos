import { NextResponse } from "next/server";
import { getTransporter, esc } from "@/lib/mailer";

export const dynamic = "force-dynamic";

const MAX_FILE = 10 * 1024 * 1024; // 10MB
const ALLOWED = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
  "application/vnd.ms-excel", // xls
  "text/csv",
  "application/pdf",
];

export async function POST(request) {
  try {
    const form = await request.formData();
    const get = (k) => {
      const v = form.get(k);
      return typeof v === "string" ? v.trim() : "";
    };

    const data = {
      company: get("company"),
      gst: get("gst"),
      contactPerson: get("contactPerson"),
      phone: get("phone"),
      email: get("email"),
      city: get("city"),
      state: get("state"),
      requirement: get("requirement"),
      quantity: get("quantity"),
      brand: get("brand"),
      timeline: get("timeline"),
      type: get("type") || "Bulk Enquiry",
    };

    // Required fields
    if (!data.company || !data.contactPerson || !data.phone || !data.requirement) {
      return NextResponse.json(
        { message: "Company, contact person, phone and requirement are required." },
        { status: 400 }
      );
    }
    const phoneDigits = data.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return NextResponse.json({ message: "Please enter a valid phone number." }, { status: 400 });
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }

    // Optional attachment (Excel/BOM/PDF)
    const attachments = [];
    const file = form.get("file");
    if (file && typeof file === "object" && file.size > 0) {
      if (file.size > MAX_FILE) {
        return NextResponse.json({ message: "File exceeds the 10MB limit." }, { status: 400 });
      }
      if (file.type && !ALLOWED.includes(file.type)) {
        return NextResponse.json(
          { message: "Unsupported file type. Please upload Excel, CSV or PDF." },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({ filename: file.name || "bom-attachment", content: buffer });
    }

    const row = (label, value) =>
      value
        ? `<tr><td style="padding:10px 14px;border-bottom:1px solid #eef2f7;color:#64748b;width:38%"><strong>${label}</strong></td><td style="padding:10px 14px;border-bottom:1px solid #eef2f7;color:#0f172a">${esc(value)}</td></tr>`
        : "";

    const html = `
      <div style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px">
        <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e7ecf3">
          <div style="background:linear-gradient(135deg,#0F172A,#1E40AF);padding:26px 28px;color:#fff">
            <h2 style="margin:0;font-size:20px">New ${esc(data.type)}</h2>
            <p style="margin:6px 0 0;color:#cbd5e1;font-size:14px">Total Office Solutions — Corporate Desk</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            ${row("Company", data.company)}
            ${row("GST Number", data.gst)}
            ${row("Contact Person", data.contactPerson)}
            ${row("Phone", data.phone)}
            ${row("Email", data.email)}
            ${row("City", data.city)}
            ${row("State", data.state)}
            ${row("Preferred Brand", data.brand)}
            ${row("Estimated Quantity", data.quantity)}
            ${row("Timeline", data.timeline)}
            ${row("Requirement", data.requirement)}
          </table>
          ${attachments.length ? `<p style="padding:14px 28px;color:#16a34a;font-size:13px;margin:0">📎 Attachment included: ${esc(attachments[0].filename)}</p>` : ""}
        </div>
      </div>`;

    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      replyTo: data.email || undefined,
      subject: `${data.type}: ${data.company}`,
      html,
      attachments,
    });

    return NextResponse.json({ message: "Enquiry submitted successfully." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Could not submit your enquiry. Please try again or contact us directly." },
      { status: 500 }
    );
  }
}
