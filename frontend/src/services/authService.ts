import { isAuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type {
  AuthActionResult,
  SignInCredentials,
  SignUpCredentials,
  SignUpResult,
} from "../types/auth";

const CREDENTIALS_MESSAGE =
  "Invalid email or password. Please check your details and try again.";
const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please sign in again.";
const NETWORK_MESSAGE =
  "Unable to reach the authentication service. Check your internet connection and try again.";
const DEFAULT_MESSAGE =
  "Something went wrong while processing your request. Please try again.";

/** Friendly, user-facing messages for common Supabase auth error codes. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: CREDENTIALS_MESSAGE,
  user_not_found: "No account was found with this email address.",
  email_not_confirmed:
    "Please confirm your email address before signing in. Check your inbox for the confirmation link.",
  email_exists: "An account with this email already exists. Try signing in instead.",
  user_already_exists: "An account with this email already exists. Try signing in instead.",
  weak_password: "This password is too weak. Please choose a stronger password.",
  same_password: "Please choose a password you have not used before.",
  over_request_rate_limit: "Too many attempts. Please wait a moment and try again.",
  over_email_send_rate_limit:
    "Too many confirmation emails have been sent. Please wait a while before requesting another one.",
  user_banned: "This account has been suspended. Please contact support for assistance.",
  captcha_failed: "Captcha verification failed. Please try again.",
  validation_failed: "The submitted details are not valid. Please review them and try again.",
  session_not_found: SESSION_EXPIRED_MESSAGE,
  refresh_token_not_found: SESSION_EXPIRED_MESSAGE,
  refresh_token_already_used: SESSION_EXPIRED_MESSAGE,
  bad_jwt: SESSION_EXPIRED_MESSAGE,
};

/** Converts Supabase auth errors into clear, user-facing messages. */
export function getAuthErrorMessage(error: unknown): string {
  if (isAuthError(error)) {
    console.log('Supabase Error Details:', {
      code: error.code,
      message: error.message,
      status: error.status,
    });
    
    if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
      return AUTH_ERROR_MESSAGES[error.code];
    }
    if (/fetch|network|timeout|abort/i.test(error.message)) {
      return NETWORK_MESSAGE;
    }
    if (error.status === 400 || error.status === 401) {
      // Return the actual Supabase message for better debugging
      return error.message || CREDENTIALS_MESSAGE;
    }
    if (error.status === undefined || error.status >= 500) {
      return NETWORK_MESSAGE;
    }
    return error.message || DEFAULT_MESSAGE;
  }

  if (error instanceof Error && /fetch|network|timeout|abort/i.test(error.message)) {
    return NETWORK_MESSAGE;
  }
  return DEFAULT_MESSAGE;
}

/** Signs a user in with email and password. */
export async function signIn({
  email,
  password,
}: SignInCredentials): Promise<AuthActionResult> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? getAuthErrorMessage(error) : null };
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }
}

/**
 * Registers a new user. `fullName` is stored in auth user metadata; a database
 * trigger then creates the profile row and assigns the default "citizen" role.
 * This service never writes to public.profiles directly.
 */
export async function signUp({
  fullName,
  email,
  password,
}: SignUpCredentials): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: window.location.origin,
    },
  });

  if (error) {
    return { error: getAuthErrorMessage(error), needsEmailConfirmation: false };
  }

  // No session means the Supabase project requires email confirmation first.
  return { error: null, needsEmailConfirmation: data.session === null };
}

/** Sends a fresh confirmation link to an unconfirmed signup. */
export async function resendSignupConfirmation(email: string): Promise<AuthActionResult> {
  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error ? getAuthErrorMessage(error) : null };
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }
}

/** Signs the current user out. */
export async function signOut(): Promise<AuthActionResult> {
  const { error } = await supabase.auth.signOut();
  return { error: error ? getAuthErrorMessage(error) : null };
}
