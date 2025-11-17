"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Home() {
  const { session, signIn, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) {
      router.replace("/dashboard");
    }
  }, [loading, session, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn({ email, password });
    if (error) {
      setError(error);
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 rounded-[28px] bg-white p-10 shadow-xl md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            LeadFlow CRM
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Close deals faster with a lightweight lead manager.
          </h1>
          <p className="text-sm text-slate-500">
            Track every inbound lead, keep statuses aligned with the team, and
            never lose momentum in your pipeline.
          </p>
          <ul className="list-inside list-disc text-sm text-slate-600">
            <li>Secure Supabase authentication</li>
            <li>Clean dashboard to view, edit, and delete leads</li>
            <li>Optimized for Vercel deployment</li>
          </ul>
        </div>
        <div className="card">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-blue-600 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="pt-4 text-center text-xs text-slate-500">
            Accounts & passwords are managed inside Supabase Auth. Invite your
            team from the Supabase dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
