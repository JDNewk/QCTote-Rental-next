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

const PACKAGE_DETAILS: Record<
  string,
  { label: string; price: number; extensionRate: number }
> = {
  "20-totes": { label: "20 Totes", price: 99, extensionRate: 40 },
  "40-totes": { label: "40 Totes", price: 169, extensionRate: 70 },
  "60-totes": { label: "60 Totes", price: 219, extensionRate: 100 },
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isKnownArea(value: string) {
  return FREE_AREAS.includes(value) || FEE_AREAS.includes(value);
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

    const name = String(data.name ?? "").trim();
    const email = String(data.email ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    const address = String(data.address ?? "").trim();
    const deliveryArea = String(data.deliveryArea ?? "").trim();
    const pickupArea = String(data.pickupArea ?? "").trim();
    const deliveryDate = String(data.deliveryDate ?? "").trim();
    const pickupDate = String(data.pickupDate ?? "").trim();
    const totePackage = String(data.totePackage ?? "").trim();
    const extraDolly = data.extraDolly === true;
    const agree = data.agree === true;
    const paymentAuthorization = data.paymentAuthorization === true;

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !deliveryArea ||
      !pickupArea ||
      !deliveryDate ||
      !pickupDate ||
      !totePackage
    ) {
      return NextResponse.json(
        { error: "Please complete all required reservation fields." },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json({ error: "Name is too long." }, { status: 400 });
    }

    if (email.length > 254 || !email.includes("@")) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (phone.length > 40 || address.length > 300) {
      return NextResponse.json(
        { error: "Phone number or address is too long." },
        { status: 400 }
      );
    }

    if (!isKnownArea(deliveryArea) || !isKnownArea(pickupArea)) {
      return NextResponse.json(
        { error: "Select valid delivery and pickup towns." },
        { status: 400 }
      );
    }

    const packageDetails = PACKAGE_DETAILS[totePackage];
    if (!packageDetails) {
      return NextResponse.json(
        { error: "Select a valid tote package." },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate) || !/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) {
      return NextResponse.json(
        { error: "Select valid delivery and pickup dates." },
        { status: 400 }
      );
    }

    if (pickupDate < deliveryDate) {
      return NextResponse.json(
        { error: "Pickup date cannot be before the delivery date." },
        { status: 400 }
      );
    }

    if (!agree) {
      return NextResponse.json(
        { error: "You must accept the rental agreement." },
        { status: 400 }
      );
    }

    if (!paymentAuthorization) {
      return NextResponse.json(
        { error: "Payment authorization is required." },
        { status: 400 }
      );
    }

    const deliveryFee = FEE_AREAS.includes(deliveryArea) ? 15 : 0;
    const pickupFee = FEE_AREAS.includes(pickupArea) ? 15 : 0;
    const serviceAreaFee = deliveryFee + pickupFee;
    const dollyFee = extraDolly ? 10 : 0;
    const totalBeforeTax = packageDetails.price + serviceAreaFee + dollyFee;

    const resend = new Resend(resendApiKey);

    const { error: emailError } = await resend.emails.send({
      from: `QC Tote Rental Reservations <${fromEmail}>`,
      to: [notificationEmail],
      replyTo: email,
      subject: `New tote reservation request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5; max-width: 720px; margin: 0 auto;">
          <div style="background: #020617; color: #ffffff; padding: 24px; border-radius: 12px 12px 0 0;">
            <p style="margin: 0 0 6px; color: #a3e635; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">QC Tote Rental</p>
            <h1 style="margin: 0; font-size: 28px;">New Reservation Request</h1>
          </div>

          <div style="border: 1px solid #cbd5e1; border-top: 0; padding: 24px; border-radius: 0 0 12px 12px;">
            <h2 style="margin-top: 0;">Customer</h2>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 7px; font-weight: bold; width: 190px;">Name</td><td style="padding: 7px;">${escapeHtml(name)}</td></tr>
              <tr><td style="padding: 7px; font-weight: bold;">Email</td><td style="padding: 7px;">${escapeHtml(email)}</td></tr>
              <tr><td style="padding: 7px; font-weight: bold;">Phone</td><td style="padding: 7px;">${escapeHtml(phone)}</td></tr>
              <tr><td style="padding: 7px; font-weight: bold;">Delivery address</td><td style="padding: 7px;">${escapeHtml(address)}</td></tr>
            </table>

            <h2 style="margin-top: 26px;">Reservation</h2>
            <table style="border-collapse: collapse; width: 100%;">
              <tr><td style="padding: 7px; font-weight: bold; width: 190px;">Delivery date</td><td style="padding: 7px;">${escapeHtml(deliveryDate)}</td></tr>
              <tr><td style="padding: 7px; font-weight: bold;">Pickup date</td><td style="padding: 7px;">${escapeHtml(pickupDate)}</td></tr>
              <tr><td style="padding: 7px; font-weight: bold;">Delivery town</td><td style="padding: 7px;">${escapeHtml(deliveryArea)}</td></tr>
              <tr><td style="padding: 7px; font-weight: bold;">Pickup town</td><td style="padding: 7px;">${escapeHtml(pickupArea)}</td></tr>
              <tr><td style="padding: 7px; font-weight: bold;">Package</td><td style="padding: 7px;">${escapeHtml(packageDetails.label)} - $${packageDetails.price}</td></tr>
              <tr><td style="padding: 7px; font-weight: bold;">Extra dolly</td><td style="padding: 7px;">${extraDolly ? "Yes - $10" : "No"}</td></tr>
              <tr><td style="padding: 7px; font-weight: bold;">Service-area fee</td><td style="padding: 7px;">$${serviceAreaFee}</td></tr>
              <tr><td style="padding: 7px; font-weight: bold;">Total before tax</td><td style="padding: 7px; font-size: 18px; font-weight: bold;">$${totalBeforeTax}</td></tr>
              <tr><td style="padding: 7px; font-weight: bold;">Weekly extension rate</td><td style="padding: 7px;">$${packageDetails.extensionRate} per week</td></tr>
            </table>

            <h2 style="margin-top: 26px;">Authorizations</h2>
            <p style="margin: 6px 0;">Rental agreement accepted: <strong>Yes</strong></p>
            <p style="margin: 6px 0;">Payment-method authorization accepted: <strong>Yes</strong></p>

            <p style="margin-top: 24px; color: #475569;">
              Reply to this email to contact ${escapeHtml(name)} at ${escapeHtml(email)}.
            </p>
          </div>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend reservation email error:", emailError);
      return NextResponse.json(
        {
          error:
            "We could not send your reservation request. Please try again or contact QC Tote Rental by phone.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Your reservation request was received. QC Tote Rental will contact you to confirm availability and provide an invoice.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reservation API error:", error);
    return NextResponse.json(
      { error: "Failed to process your reservation request." },
      { status: 500 }
    );
  }
}
