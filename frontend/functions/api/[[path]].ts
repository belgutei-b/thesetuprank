interface Env {
  BACKEND_URL: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const backendBaseUrl = context.env.BACKEND_URL;

  if (!backendBaseUrl) {
    return new Response("BACKEND_URL is not configured", { status: 500 });
  }

  const incomingUrl = new URL(context.request.url);

  const backendUrl = new URL(
    incomingUrl.pathname + incomingUrl.search,
    backendBaseUrl,
  );

  const proxiedRequest = new Request(backendUrl, context.request);

  const response = await fetch(proxiedRequest, {
    redirect: "manual",
  });

  return response;
};
