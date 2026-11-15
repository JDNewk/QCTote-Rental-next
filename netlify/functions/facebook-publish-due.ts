import { publishDueFacebookArticles } from "../../lib/facebookDuePublisher";

export default async () => {
  try {
    const summary = await publishDueFacebookArticles();

    console.log(
      "Scheduled Facebook publishing completed:",
      JSON.stringify(summary),
    );

    return Response.json({
      ok: true,
      summary,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Scheduled Facebook publishing failed.";

    console.error("Scheduled Facebook publishing failed:", error);

    return Response.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
      },
    );
  }
};

export const config = {
  schedule: "*/10 * * * *",
};