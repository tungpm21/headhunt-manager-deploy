"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search, Briefcase, Building2, UserPlus } from "lucide-react";

const navLinks = [
  { href: "/viec-lam", label: "Việc làm", icon: Briefcase },
  { href: "/cong-ty", label: "Công ty", icon: Building2 },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <div className="h-9 w-9 rounded-lg bg-[var(--color-fdi-primary)] flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <span
            className="text-xl font-bold text-[var(--color-fdi-text)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            FDI<span className="text-[var(--color-fdi-primary)]">Work</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] hover:bg-[var(--color-fdi-surface)] transition-colors cursor-pointer"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/employer/login"
            className="text-sm font-medium text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] transition-colors cursor-pointer"
          >
            Đăng nhập NTD
          </Link>
          <Link
            href="/employer/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--color-fdi-primary)] text-white text-sm font-semibold hover:bg-[var(--color-fdi-primary-hover)] transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Đăng tin tuyển dụng
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5 text-[var(--color-fdi-text)]" />
          ) : (
            <Menu className="h-5 w-5 text-[var(--color-fdi-text)]" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-fdi-text)] hover:bg-[var(--color-fdi-surface)] transition-colors cursor-pointer"
              >
                <link.icon className="h-4 w-4 text-[var(--color-fdi-primary)]" />
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <Link
                href="/employer/login"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-[var(--color-fdi-text-secondary)] hover:text-[var(--color-fdi-primary)] cursor-pointer"
              >
                Đăng nhập NTD
              </Link>
              <Link
                href="/employer/register"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm font-semibold text-[var(--color-fdi-primary)] cursor-pointer"
              >
                Đăng tin tuyển dụng
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
