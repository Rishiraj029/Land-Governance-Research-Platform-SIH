import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save, ShieldAlert } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useProfile } from "../../hooks/useProfile";
import { updateMyProfile } from "../../lib/supabaseProfiles";
import { roleLabel } from "../../lib/roles";
import type { Profile } from "../../types/auth";

/**
 * Editable profile form.
 *
 * Rendered only once the profile row has loaded, so the inputs can take their initial values
 * from props (a plain useState initialiser) without an effect that would fight the user's
 * typing. Only `full_name` and `institution` are editable — those are the only writable
 * personal columns in public.profiles, and `role` is never submitted.
 */
function ProfileForm({ profile, userId, onSaved }: { profile: Profile; userId: string; onSaved: () => void }) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [institution, setInstitution] = useState(profile.institution ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState("");

  const trimmedName = fullName.trim();
  const nameError = trimmedName.length === 0 ? "Full name is required." : trimmedName.length > 120 ? "Full name must be 120 characters or fewer." : null;
  const institutionError = institution.trim().length > 160 ? "Institution must be 160 characters or fewer." : null;
  const dirty = trimmedName !== (profile.full_name ?? "") || institution.trim() !== (profile.institution ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedMessage("");
    if (nameError || institutionError || saving) {
      setSaveError(nameError ?? institutionError);
      return;
    }

    setSaveError(null);
    setSaving(true);
    const result = await updateMyProfile(userId, { fullName: trimmedName, institution });
    setSaving(false);

    if (result.error || !result.profile) {
      setSaveError(result.error ?? "Your profile could not be saved.");
      return;
    }
    setFullName(result.profile.full_name ?? "");
    setInstitution(result.profile.institution ?? "");
    setSavedMessage("Profile saved.");
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-[#1F2933]">Profile Information</h2>
      <p className="mb-4 text-sm text-[#5A6472]">
        These details are stored in your platform profile and shown in workspaces and document
        records.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="settings-full-name" className="mb-1.5 block text-sm font-medium text-[#344054]">
            Full Name <span className="text-[#D64545]">*</span>
          </label>
          <input
            id="settings-full-name"
            type="text"
            value={fullName}
            maxLength={120}
            onChange={(event) => setFullName(event.target.value)}
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "settings-full-name-error" : undefined}
            className="min-h-11 w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#1F2933] outline-none placeholder:text-[#98A2B3] focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20"
          />
          {nameError && (
            <p id="settings-full-name-error" className="mt-1 text-xs text-[#9E2A22]">
              {nameError}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <label htmlFor="settings-institution" className="mb-1.5 block text-sm font-medium text-[#344054]">
            Institution
          </label>
          <input
            id="settings-institution"
            type="text"
            value={institution}
            maxLength={160}
            onChange={(event) => setInstitution(event.target.value)}
            placeholder="e.g. National Land Policy Institute"
            aria-invalid={institutionError !== null}
            className="min-h-11 w-full rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-sm text-[#1F2933] outline-none placeholder:text-[#98A2B3] focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20"
          />
          {institutionError && <p className="mt-1 text-xs text-[#9E2A22]">{institutionError}</p>}
        </div>
      </div>

      {saveError && (
        <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-[#9E2A22]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {saveError}
        </p>
      )}
      {savedMessage && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm text-[#138808]">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {savedMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !dirty || nameError !== null || institutionError !== null}
        className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0B3D91] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#062A63] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
        Save changes
      </button>
    </form>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const { profile, role, loading, error, reload } = useProfile();

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1F2933]">Settings</h1>
        <div className="rounded-lg border border-[#E1E5EA] bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-[#D64545]" aria-hidden="true" />
          <p className="font-medium text-[#1F2933]">Sign in to manage your settings</p>
        </div>
      </div>
    );
  }

  const roleName = roleLabel(role);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1F2933]">Settings</h1>

      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-[#E1E5EA] bg-white p-10 shadow-sm" role="status">
          <Loader2 className="h-8 w-8 animate-spin text-[#0B3D91]" aria-hidden="true" />
          <p className="text-sm text-[#5A6472]">Loading your profile…</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-[#F1C6C3] bg-[#FFF7F6] p-5" role="alert">
          <p className="flex items-start gap-2 text-sm text-[#9E2A22]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        </div>
      )}

      {!loading && profile && <ProfileForm profile={profile} userId={user.id} onSaved={reload} />}

      {/* Account details that come from Supabase auth, not from public.profiles */}
      <div className="rounded-lg border border-[#E1E5EA] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[#1F2933]">Account</h2>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-[#1F2933]">Email</dt>
            <dd className="text-[#5A6472]">{user.email ?? "Not available"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[#1F2933]">Role</dt>
            <dd className="text-[#5A6472]">
              {roleName ?? "Not assigned"}
              <span className="mt-1 block text-xs text-[#5A6472]">
                Roles are assigned by platform administrators and cannot be changed here.
              </span>
            </dd>
          </div>
          {profile?.createdAt && (
            <div>
              <dt className="font-medium text-[#1F2933]">Member since</dt>
              <dd className="text-[#5A6472]">
                {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
          )}
        </dl>

        <p className="mt-4 flex items-start gap-2 rounded-md border border-[#E1E5EA] bg-[#F5F7FA] p-3 text-xs text-[#5A6472]">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#0B3D91]" aria-hidden="true" />
          Password changes and multi-factor authentication are handled by Supabase Auth and are
          not yet exposed in this interface.
        </p>
      </div>
    </div>
  );
}
