import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SIGN_IN_TIMEOUT_MS = 15_000;

const fetchWithSignInTimeout: typeof fetch = async (input, init) => {
  const requestUrl =
    typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(requestUrl);
  } catch {
    return fetch(input, init);
  }

  const isPasswordSignIn =
    parsedUrl.pathname.endsWith("/auth/v1/token") &&
    parsedUrl.searchParams.get("grant_type") === "password";

  if (!isPasswordSignIn) {
    return fetch(input, init);
  }

  const controller = new AbortController();
  const requestSignal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
  const forwardAbort = () => controller.abort();

  if (requestSignal?.aborted) {
    controller.abort();
  } else {
    requestSignal?.addEventListener("abort", forwardAbort, { once: true });
  }

  const timeoutId = globalThis.setTimeout(() => controller.abort(), SIGN_IN_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    globalThis.clearTimeout(timeoutId);
    requestSignal?.removeEventListener("abort", forwardAbort);
  }
};

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  { global: { fetch: fetchWithSignInTimeout } },
);