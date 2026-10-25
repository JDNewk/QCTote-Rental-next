import { NextResponse } from "next/server";
import { Resend } from "resend";

const FREE_AREAS = [
  "Davenport, IA",
  "Bettendorf, IA",
  "Rock Island, IL",
  "Moline, IL",
  "East Moline, IL",
  "Silvis, IL",
  "Milan, IL",
  "Geneseo, IL",
  "Coal Valley, IL",
  "Colona, IL",
  "Port Byron, IL",
  "LeClaire, IA",
];

const FEE_AREAS = [
  "Muscatine, IA",
  "Clinton, IA",
  "Eldridge, IA",
  "DeWitt, IA",
  "Orion, IL",
];

const PACKAGE_PRICES: Record<string, number> = {
  "20-totes": 99,
  "40-totes": 169,
  "60-totes": 219,
};

const EXTENSION_RATES: Record<string, number> = {
  "20-totes": 40,
  "40-totes": 70,
  "60-totes": 100,
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPackageName(totePackage: string) {
  return totePackage.replace("-", " ").replace("totes", "Totes");
}

export async function POST(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const notificationEmail = process.env.RESERVATION_NOTIFICATION_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!resendApiKey || !notificationEmail || !fromEmail) {
      console.error("Missing reservation email environment variables.");
      return NextResponse.json(
        { error: "Reservation notifications are not configured." },
        { status: 500 }
      );
    }

    const data = await request.json();

    const requiredFields = [
      "name",
      "email",
      "phone",
      "address",
      "deliveryArea",
      "pickupArea",
      "deliveryDate",
      "pickupDate",
      "totePackage",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    if (!data.agree) {
      return NextResponse.json(
        { error: "Rental agreement must be accepted." },
        { status: 400 }
      );
    }

    if (!data.paymentAuthorization) {
      return NextResponse.json(
        { error: "Payment authorization must be accepted." },
        { status: 400 }
      );
    }

    const validAreas = [...FREE_AREAS, ...FEE_AREAS];

    if (!validAreas.includes(data.deliveryArea)) {
      return NextResponse.json(
        { error: "Invalid delivery area." },
        { status: 400 }
      );
    }

    if (!validAreas.includes(data.pickupArea)) {
      return NextResponse.json(
        { error: "Invalid pickup area." },
        { status: 400 }
      );
    }

    const packagePrice = PACKAGE_PRICES[data.totePackage];
    const extensionRate = EXTENSION_RATES[data.totePackage];

    if (packagePrice === undefined || extensionRate === undefined) {
      return NextResponse.json(
        { error: "Invalid tote package." },
        { status: 400 }
      );
    }

    const deliveryDate = new Date(`${data.deliveryDate}T00:00:00`);
    const pickupDate = new Date(`${data.pickupDate}T00:00:00`);

    if (
      Number.isNaN(deliveryDate.getTime()) ||
      Number.isNaN(pickupDate.getTime())
    ) {
      return NextResponse.json(
        { error: "Invalid delivery or pickup date." },
        { status: 400 }
      );
    }

    if (pickupDate <= deliveryDate) {
      return NextResponse.json(
        { error: "Pickup date must be after the delivery date." },
        { status: 400 }
      );
    }

    const deliveryFee = FEE_AREAS.includes(data.deliveryArea) ? 15 : 0;
    const pickupFee = FEE_AREAS.includes(data.pickupArea) ? 15 : 0;
    const serviceAreaFee = deliveryFee + pickupFee;
    const dollyFee = data.extraDolly === true ? 10 : 0;
    const totalBeforeTax = packagePrice + serviceAreaFee + dollyFee;
    const packageName = formatPackageName(data.totePackage);

    const resend = new Resend(resendApiKey);

    const { error: emailError } = await resend.emails.send({
      from: `QC Tote Rental Reservations <${fromEmail}>`,
      to: [notificationEmail],
      replyTo: data.email,
      subject: `New reservation request: ${data.name} | ${data.deliveryDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5; max-width: 680px; margin: 0 auto;">
          <h1 style="color: #1d4ed8;">New QC Tote Rental Reservation</h1>
          <p>A new reservation request was submitted through qctoterentals.com.</p>

          <h2>Customer</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 6px; font-weight: bold;">Name</td><td style="padding: 6px;">${escapeHtml(data.name)}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Email</td><td style="padding: 6px;">${escapeHtml(data.email)}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Phone</td><td style="padding: 6px;">${escapeHtml(data.phone)}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Delivery address</td><td style="padding: 6px;">${escapeHtml(data.address)}</td></tr>
          </table>

          <h2>Reservation</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 6px; font-weight: bold;">Delivery date</td><td style="padding: 6px;">${escapeHtml(data.deliveryDate)}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Pickup date</td><td style="padding: 6px;">${escapeHtml(data.pickupDate)}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Delivery town</td><td style="padding: 6px;">${escapeHtml(data.deliveryArea)}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Pickup town</td><td style="padding: 6px;">${escapeHtml(data.pickupArea)}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Tote package</td><td style="padding: 6px;">${escapeHtml(packageName)}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Extra dolly</td><td style="padding: 6px;">${data.extraDolly === true ? "Yes" : "No"}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Extension rate</td><td style="padding: 6px;">$${extensionRate}/week</td></tr>
          </table>

          <h2>Price summary</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 6px;">Package</td><td style="padding: 6px; text-align: right;">$${packagePrice}</td></tr>
            <tr><td style="padding: 6px;">Delivery fee</td><td style="padding: 6px; text-align: right;">$${deliveryFee}</td></tr>
            <tr><td style="padding: 6px;">Pickup fee</td><td style="padding: 6px; text-align: right;">$${pickupFee}</td></tr>
            <tr><td style="padding: 6px;">Extra dolly</td><td style="padding: 6px; text-align: right;">$${dollyFee}</td></tr>
            <tr style="font-weight: bold; border-top: 1px solid #9ca3af;"><td style="padding: 8px 6px;">Total before tax</td><td style="padding: 8px 6px; text-align: right;">$${totalBeforeTax}</td></tr>
          </table>

          <h2>Authorizations</h2>
          <p>Rental agreement accepted: Yes</p>
          <p>Payment authorization accepted: Yes</p>

          <p style="margin-top: 24px; color: #4b5563;">Reply to this email to contact ${escapeHtml(data.name)} at ${escapeHtml(data.email)}.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend email error:", emailError);
      return NextResponse.json(
        {
          error:
            "We could not send your reservation request. Please try again or contact QC Tote Rental directly.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Reservation request received. QC Tote Rental will contact you to confirm availability and provide an invoice.",
        totalBeforeTax,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reservation API error:", error);

    return NextResponse.json(
      { error: "Failed to process reservation." },
      { status: 500 }
    );
  }
}
