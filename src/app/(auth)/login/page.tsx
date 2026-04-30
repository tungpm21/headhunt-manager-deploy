import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-lg bg-background p-8 shadow-md border border-border">
      <div className="flex justify-center mb-6">
        <div className="flex h-12 items-center">
          <span className="text-2xl font-bold text-primary">HM</span>
          <span className="ml-2 text-xl font-medium text-foreground">
            Headhunt Manager
          </span>
        </div>
      </div>
      
      <h1 className="mb-2 text-center text-xl font-semibold text-foreground">
        Đăng nhập
      </h1>
      <p className="mb-6 text-center text-sm text-muted">
        Vui lòng đăng nhập với tài khoản team
      </p>
      
      <LoginForm />
    </div>
  );
}
