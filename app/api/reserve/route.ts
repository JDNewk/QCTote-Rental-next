import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Basic validation
    const requiredFields = ["name", "email", "phone", "address", "rentalLength"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Calculate price (same as before)
    let total = 0;

    if (data.rentalLength === "1-week") total += 60;
    if (data.rentalLength === "2-week") total += 90;

    total += Number(data.extraTotes || 0) * 1;
    if (data.extraDolly) total += 10;

    // Placeholder: email the reservation to yourself
    // (You can integrate Microsoft 365 or Gmail later)
    // await sendEmailToBusiness(data, total);

    // Placeholder: store reservation in a database (optional)
    // await db.reservations.insert({ ...data, total });

    return NextResponse.json(
      {
        message: "Reservation received! You will receive an invoice shortly.",
        received: data,
        total,
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
