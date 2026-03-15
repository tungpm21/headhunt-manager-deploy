"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Email đăng nhập
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="admin@headhunt.com"
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="••••••••"
          required
          minLength={6}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {errorMessage && (
        <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
          <p>{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        aria-disabled={isPending}
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-primary/50"
      >
        {isPending ? (
          "Đang xử lý..."
        ) : (
          <>
            Đăng nhập <LogIn className="ml-2 h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
