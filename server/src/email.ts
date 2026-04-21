import nodemailer from 'nodemailer';

// ─── Email Transporter ────────────────────────────────────────────────────────
// Uses Gmail SMTP. Set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file.
// Get an App Password at: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ─── Order Confirmation Email ─────────────────────────────────────────────────
interface OrderEmailItem {
  title: string;
  quantity: number;
  price: number;
}

interface SendOrderConfirmationArgs {
  to: string;
  customerName: string;
  orderId: number;
  items: OrderEmailItem[];
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  couponCode?: string;
  discountAmt?: number;
}

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderId,
  items,
  totalAmount,
  shippingAddress,
  paymentMethod,
  couponCode,
  discountAmt,
}: SendOrderConfirmationArgs): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[Email] GMAIL_USER or GMAIL_APP_PASSWORD not set. Skipping email.');
    return;
  }

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #F3EDE4;font-size:14px;color:#333">${item.title}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #F3EDE4;font-size:14px;color:#555;text-align:center">${item.quantity}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #F3EDE4;font-size:14px;color:#333;text-align:right">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const savingsRow = discountAmt && discountAmt > 0
    ? `<tr>
        <td colspan="2" style="padding:8px 16px;font-size:13px;color:#16a34a;text-align:right">Coupon (${couponCode})</td>
        <td style="padding:8px 16px;font-size:13px;color:#16a34a;text-align:right">−₹${discountAmt.toFixed(2)}</td>
       </tr>`
    : '';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed – Satvik Store</title>
</head>
<body style="margin:0;padding:0;background:#FBF7F2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF7F2;padding:32px 16px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#C2410C 0%,#EA580C 50%,#F97316 100%);padding:36px 32px;text-align:center">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:-0.5px">🕉 Satvik Store</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:1px">SACRED &amp; AUTHENTIC</p>
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="background:#FFF7ED;padding:24px 32px;border-bottom:1px solid #FED7AA;text-align:center">
              <div style="display:inline-block;width:56px;height:56px;background:#DCFCE7;border-radius:50%;line-height:56px;font-size:28px;margin-bottom:12px">✅</div>
              <h2 style="margin:0;color:#9A3412;font-size:22px;font-weight:700">Order Confirmed!</h2>
              <p style="margin:6px 0 0;color:#92400E;font-size:14px">Thank you, <strong>${customerName}</strong>. Your sacred items are being prepared.</p>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding:28px 32px">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 12px;background:#FFF7ED;border-radius:8px;font-size:13px;color:#555">
                    📦 <strong>Order ID:</strong> <span style="color:#EA580C;font-weight:700">#ORD-${orderId}</span>
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    💳 <strong>Payment:</strong> ${paymentMethod.toUpperCase()}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding:0 32px 28px">
              <h3 style="margin:0 0 12px;font-size:15px;color:#1C1917;font-weight:600">Order Summary</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #F3EDE4;border-radius:10px;overflow:hidden">
                <thead>
                  <tr style="background:#FFF7ED">
                    <th style="padding:10px 16px;font-size:12px;color:#78716C;text-transform:uppercase;letter-spacing:0.5px;text-align:left;font-weight:600">Item</th>
                    <th style="padding:10px 16px;font-size:12px;color:#78716C;text-transform:uppercase;letter-spacing:0.5px;text-align:center;font-weight:600">Qty</th>
                    <th style="padding:10px 16px;font-size:12px;color:#78716C;text-transform:uppercase;letter-spacing:0.5px;text-align:right;font-weight:600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                  ${savingsRow}
                  <tr style="background:#FFF7ED">
                    <td colspan="2" style="padding:12px 16px;font-size:15px;font-weight:700;color:#1C1917">Total Paid</td>
                    <td style="padding:12px 16px;font-size:15px;font-weight:700;color:#EA580C;text-align:right">₹${totalAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding:0 32px 28px">
              <h3 style="margin:0 0 8px;font-size:15px;color:#1C1917;font-weight:600">📍 Shipping To</h3>
              <p style="margin:0;font-size:14px;color:#57534E;line-height:1.6;background:#F9F5F0;padding:12px 16px;border-radius:8px;border-left:3px solid #EA580C">${shippingAddress}</p>
            </td>
          </tr>

          <!-- Track Order CTA -->
          <tr>
            <td style="padding:0 32px 36px;text-align:center">
              <a href="http://localhost:5173/track-order" style="display:inline-block;background:linear-gradient(135deg,#EA580C,#F97316);color:#fff;text-decoration:none;padding:14px 40px;border-radius:100px;font-size:15px;font-weight:600;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(234,88,12,0.3)">
                Track My Order →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9F5F0;padding:20px 32px;text-align:center;border-top:1px solid #F3EDE4">
              <p style="margin:0;font-size:12px;color:#A8A29E">© ${new Date().getFullYear()} Satvik Store · Designed with devotion in India 🇮🇳</p>
              <p style="margin:6px 0 0;font-size:12px;color:#A8A29E">Questions? Reply to this email or track your order in your profile.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"🕉 Satvik Store" <${process.env.GMAIL_USER}>`,
    to,
    subject: `✅ Order #ORD-${orderId} Confirmed – Satvik Store`,
    html,
  });

  console.log(`[Email] Confirmation sent to ${to} for order #${orderId}`);
}
