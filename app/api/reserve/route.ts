import { NextResponse } from "next/server";
import { Resend } from "resend";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const notificationEmail = process.env.RESERVATION_NOTIFICATION_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!resendApiKey || !notificationEmail || !fromEmail) {
      console.error("Missing contact email environment variables.");
      return NextResponse.json(
        { error: "Contact notifications are not configured." },
        { status: 500 }
      );
    }

    const data = await request.json();
    const name = String(data.name ?? "").trim();
    const email = String(data.email ?? "").trim();
    const message = String(data.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Name is too long." },
        { status: 400 }
      );
    }

    if (email.length > 254 || !email.includes("@")) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message must be 5,000 characters or fewer." },
        { status: 400 }
      );
    }

    const resend = new Resend(resendApiKey);

    const { error: emailError } = await resend.emails.send({
      from: `QC Tote Rental Contact Form <${fromEmail}>`,
      to: [notificationEmail],
      replyTo: email,
      subject: `New contact message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5; max-width: 680px; margin: 0 auto;">
          <h1 style="color: #1d4ed8;">New QC Tote Rental Contact Message</h1>
          <p>A visitor submitted a message through qctoterentals.com.</p>

          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 6px; font-weight: bold; vertical-align: top;">Name</td>
              <td style="padding: 6px;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 6px; font-weight: bold; vertical-align: top;">Email</td>
              <td style="padding: 6px;">${escapeHtml(email)}</td>
            </tr>
            <tr>
              <td style="padding: 6px; font-weight: bold; vertical-align: top;">Message</td>
              <td style="padding: 6px; white-space: pre-wrap;">${escapeHtml(message)}</td>
            </tr>
          </table>

          <p style="margin-top: 24px; color: #4b5563;">
            Reply to this email to respond directly to ${escapeHtml(name)} at ${escapeHtml(email)}.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend contact email error:", emailError);
      return NextResponse.json(
        {
          error:
            "We could not send your message. Please try again or contact QC Tote Rental by phone.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Your message was sent. QC Tote Rental will respond as soon as possible.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Failed to process your message." },
      { status: 500 }
    );
  }
}
