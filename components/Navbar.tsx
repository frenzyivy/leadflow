"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/leads/new", label: "New Lead" },
];

export default function Navbar() {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          LeadFlow
        </Link>

        {user ? (
          <nav className="flex items-center gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={async () => {
                if (!loading) {
                  await signOut();
                }
              }}
              className="rounded-full border border-slate-200 px-4 py-1 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Logout
            </button>
          </nav>
        ) : (
          <div className="text-sm text-slate-500">Sign in to manage leads</div>
        )}
      </div>
    </header>
  );
}

