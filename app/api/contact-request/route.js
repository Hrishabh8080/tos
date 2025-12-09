import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

// Create transporter (cached)
let transporter = null;

function getTransporter() {
  if (!transporter) {
    const emailConfig = {
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    };

    // Support for custom SMTP configuration
    if (process.env.EMAIL_HOST) {
      emailConfig.host = process.env.EMAIL_HOST;
      emailConfig.port = parseInt(process.env.EMAIL_PORT) || 587;
      emailConfig.secure = process.env.EMAIL_SECURE === 'true';
      delete emailConfig.service;
    }

    transporter = nodemailer.createTransport(emailConfig);
  }
  return transporter;
}

// Sanitize HTML to prevent XSS
function sanitizeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export async function POST(request) {
  try {
    const { customerName, productName, productId, mobileNumber, category, price } =
      await request.json();

    // Validate input
    if (!customerName || !productName || !mobileNumber) {
      return NextResponse.json(
        { message: 'Name, product name and mobile number are required' },
        { status: 400 }
      );
    }

    // Validate mobile number format (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNumber.replace(/\D/g, ''))) {
      return NextResponse.json(
        { message: 'Invalid mobile number format' },
        { status: 400 }
      );
    }

    // Sanitize all inputs to prevent XSS
    const sanitizedCustomerName = sanitizeHtml(customerName);
    const sanitizedProductName = sanitizeHtml(productName);
    const sanitizedMobileNumber = sanitizeHtml(mobileNumber);
    const sanitizedCategory = category ? sanitizeHtml(category) : '';
    const sanitizedPrice = price ? sanitizeHtml(String(price)) : '';
    const sanitizedProductId = productId ? sanitizeHtml(String(productId)) : '';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: `Product Inquiry: ${sanitizedProductName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #667eea; margin-bottom: 20px;">New Product Inquiry</h2>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #333;">Customer Contact Information</h3>
              <p style="font-size: 18px; color: #333; font-weight: bold;">
                👤 Name: ${sanitizedCustomerName}
              </p>
              <p style="font-size: 18px; color: #667eea; font-weight: bold;">
                📱 Mobile Number: ${sanitizedMobileNumber}
              </p>
            </div>

            <div style="border-top: 2px solid #e0e0e0; padding-top: 20px;">
              <h3 style="color: #333;">Product Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Product Name:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${sanitizedProductName}</td>
                </tr>
                ${sanitizedCategory ? `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Category:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${sanitizedCategory}</td>
                </tr>
                ` : ''}
                ${sanitizedPrice ? `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;"><strong>Price:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">₹${sanitizedPrice}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px;"><strong>Product ID:</strong></td>
                  <td style="padding: 10px;">${sanitizedProductId}</td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
              <p style="margin: 0; color: #2e7d32;">
                <strong>Action Required:</strong> Please contact ${sanitizedCustomerName} regarding their inquiry about "${sanitizedProductName}".
              </p>
            </div>

            <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message from Total Office Solutions Products System</p>
              <p>Date: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      `,
    };

    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({
        message: 'Contact request received successfully',
        success: true,
      });
    }

    // Send email
    await getTransporter().sendMail(mailOptions);

    return NextResponse.json({
      message: 'Contact request sent successfully',
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to send contact request. Please try again later.' },
      { status: 500 }
    );
  }
}

