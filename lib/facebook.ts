type FacebookApiError = {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
};

type FacebookPublishResponse = FacebookApiError & {
  id?: string;
};

type FacebookDeleteResponse = FacebookApiError & {
  success?: boolean;
};

export type FacebookPublishResult = {
  postId: string;
  postUrl: string;
};

export type FacebookDeleteResult = {
  postId: string;
  success: true;
};

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Facebook publishing is not configured: missing ${name}.`,
    );
  }

  return value;
}

function facebookConfiguration() {
  const pageId = requiredEnvironmentVariable("FACEBOOK_PAGE_ID");

  const pageAccessToken = requiredEnvironmentVariable(
    "FACEBOOK_PAGE_ACCESS_TOKEN",
  );

  const graphApiVersion = requiredEnvironmentVariable(
    "FACEBOOK_GRAPH_API_VERSION",
  );

  if (!/^v\d+\.\d+$/.test(graphApiVersion)) {
    throw new Error(
      "Facebook publishing is not configured: FACEBOOK_GRAPH_API_VERSION is invalid.",
    );
  }

  return {
    pageId,
    pageAccessToken,
    graphApiVersion,
  };
}

function facebookErrorMessage(
  payload: FacebookApiError,
  status: number,
): string {
  const metaMessage = payload.error?.message?.trim();

  if (metaMessage) {
    return `Facebook API error (${status}): ${metaMessage}`;
  }

  return `Facebook API request failed with HTTP ${status}.`;
}

async function facebookJsonResponse<T extends FacebookApiError>(
  response: Response,
): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(
      `Facebook API returned an unreadable response with HTTP ${response.status}.`,
    );
  }
}

export async function publishFacebookPost({
  message,
  link,
}: {
  message: string;
  link: string;
}): Promise<FacebookPublishResult> {
  const trimmedMessage = message.trim();
  const trimmedLink = link.trim();

  if (!trimmedMessage) {
    throw new Error("Facebook post text is required.");
  }

  if (!trimmedLink) {
    throw new Error("Facebook article link is required.");
  }

  let articleUrl: URL;

  try {
    articleUrl = new URL(trimmedLink);
  } catch {
    throw new Error(
      "Facebook article link must be a valid absolute URL.",
    );
  }

  if (articleUrl.protocol !== "https:") {
    throw new Error("Facebook article link must use HTTPS.");
  }

  const {
    pageId,
    pageAccessToken,
    graphApiVersion,
  } = facebookConfiguration();

  const endpoint =
    `https://graph.facebook.com/${graphApiVersion}/` +
    `${encodeURIComponent(pageId)}/feed`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pageAccessToken}`,
    },
    body: JSON.stringify({
      message: trimmedMessage,
      link: articleUrl.toString(),
      published: true,
    }),
    cache: "no-store",
  });

  const payload =
    await facebookJsonResponse<FacebookPublishResponse>(response);

  if (!response.ok || payload.error) {
    throw new Error(
      facebookErrorMessage(payload, response.status),
    );
  }

  if (!payload.id?.trim()) {
    throw new Error(
      "Facebook API reported success but did not return a post ID.",
    );
  }

  const postId = payload.id.trim();

  return {
    postId,
    postUrl: `https://www.facebook.com/${postId}`,
  };
}

export async function deleteFacebookPost(
  postId: string,
): Promise<FacebookDeleteResult> {
  const trimmedPostId = postId.trim();

  if (!trimmedPostId) {
    throw new Error(
      "A Facebook post ID is required before the post can be removed.",
    );
  }

  const {
    pageAccessToken,
    graphApiVersion,
  } = facebookConfiguration();

  const endpoint =
    `https://graph.facebook.com/${graphApiVersion}/` +
    encodeURIComponent(trimmedPostId);

  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${pageAccessToken}`,
    },
    cache: "no-store",
  });

  const payload =
    await facebookJsonResponse<FacebookDeleteResponse>(response);

  if (!response.ok || payload.error) {
    throw new Error(
      facebookErrorMessage(payload, response.status),
    );
  }

  if (payload.success !== true) {
    throw new Error(
      "Facebook API did not confirm that the post was removed.",
    );
  }

  return {
    postId: trimmedPostId,
    success: true,
  };
}