import { useState, useEffect, useRef, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from "@/lib/validations/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/config/routes";

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<"login" | "register" | "registered">(
    "login",
  );
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingCredentialsRef = useRef<{
    email: string;
    password: string;
  } | null>(null);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isBusy =
    oauthLoading ||
    loginForm.formState.isSubmitting ||
    registerForm.formState.isSubmitting;

  function resetForms() {
    loginForm.reset();
    registerForm.reset();
    setError(null);
  }

  function switchView(newView: "login" | "register" | "registered") {
    resetForms();
    setView(newView);
  }

  const handleRegisteredRedirect = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const credentials = pendingCredentialsRef.current;
    if (!credentials || !supabase) {
      setView("login");
      setCountdown(3);
      return;
    }
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    pendingCredentialsRef.current = null;
    if (loginError) {
      setError(loginError.message);
      setView("login");
      setCountdown(3);
    } else {
      onOpenChange(false);
      setView("login");
      loginForm.reset();
      registerForm.reset();
      setError(null);
      setCountdown(3);
      void navigate(ROUTES.DASHBOARD);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loginForm/registerForm are stable refs from useForm
  }, [navigate, onOpenChange]);

  useEffect(() => {
    if (view !== "registered") return;
    setCountdown(3);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          void handleRegisteredRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [view, handleRegisteredRedirect]);

  async function handleGoogleAuth() {
    setError(null);
    if (!supabase || !isSupabaseConfigured) {
      setError("尚未配置 Supabase，当前登录功能不可用。");
      return;
    }
    setOauthLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${ROUTES.AUTH_CALLBACK}`,
        },
      });
      if (oauthError) {
        setError(oauthError.message);
      }
    } finally {
      setOauthLoading(false);
    }
  }

  async function handleLoginSubmit(values: LoginFormValues) {
    setError(null);
    if (!supabase || !isSupabaseConfigured) {
      setError("尚未配置 Supabase，当前登录功能不可用。");
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (loginError) {
      setError(loginError.message);
    } else {
      onOpenChange(false);
      setView("login");
      resetForms();
      void navigate(ROUTES.DASHBOARD);
    }
  }

  async function handleRegisterSubmit(values: RegisterFormValues) {
    setError(null);
    if (!supabase || !isSupabaseConfigured) {
      setError("尚未配置 Supabase，当前注册功能不可用。");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}${ROUTES.AUTH_CALLBACK}`,
      },
    });
    if (signUpError) {
      setError(signUpError.message);
    } else if (
      data.user &&
      (!data.user.identities || data.user.identities.length === 0)
    ) {
      pendingCredentialsRef.current = {
        email: values.email,
        password: values.password,
      };
      setView("registered");
    } else {
      onOpenChange(false);
      setView("login");
      resetForms();
    }
  }

  const viewConfig = {
    login: { title: "登录", description: "登录你的账号以继续" },
    register: { title: "注册", description: "创建一个新账号" },
    registered: { title: "提示", description: "该邮箱已注册" },
  } as const;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          resetForms();
          setView("login");
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{viewConfig[view].title}</DialogTitle>
          <DialogDescription>{viewConfig[view].description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {!isSupabaseConfigured && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
              当前还没配置 `VITE_SUPABASE_URL` 和
              `VITE_SUPABASE_ANON_KEY`，认证按钮会保持不可用。
            </div>
          )}

          {view === "login" && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
                disabled={isBusy || !isSupabaseConfigured}
              >
                <GoogleIcon />
                使用 Google 登录
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                首次使用 Google 登录将自动创建账号
              </p>

              <div className="relative flex items-center justify-center">
                <Separator className="absolute w-full" />
                <span className="relative bg-background px-2 text-xs text-muted-foreground">
                  或
                </span>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {view === "registered" ? (
            <div className="grid gap-4 text-center">
              <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-700">
                该邮箱已注册，将自动为您登录并跳转...
              </div>
              <p className="text-sm text-muted-foreground">
                {countdown} 秒后自动跳转
              </p>
              <Button onClick={() => void handleRegisteredRedirect()}>
                确定
              </Button>
            </div>
          ) : view === "login" ? (
            <form
              onSubmit={loginForm.handleSubmit((values) => {
                void handleLoginSubmit(values);
              })}
              className="grid gap-3"
              noValidate
            >
              <div className="grid gap-1.5">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  disabled={isBusy}
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="至少 6 个字符"
                  disabled={isBusy}
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isBusy || !isSupabaseConfigured}
              >
                {isBusy ? "处理中..." : "登录"}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={registerForm.handleSubmit((values) => {
                void handleRegisterSubmit(values);
              })}
              className="grid gap-3"
              noValidate
            >
              <div className="grid gap-1.5">
                <Label htmlFor="register-email">邮箱</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  disabled={isBusy}
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="register-password">密码</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="至少 6 个字符"
                  disabled={isBusy}
                  {...registerForm.register("password")}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  disabled={isBusy}
                  {...registerForm.register("confirmPassword")}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isBusy || !isSupabaseConfigured}
              >
                {isBusy ? "处理中..." : "注册"}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {view === "login" ? (
              <>
                没有账号？
                <button
                  type="button"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                  onClick={() => switchView("register")}
                >
                  注册
                </button>
              </>
            ) : (
              <>
                已有账号？
                <button
                  type="button"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                  onClick={() => switchView("login")}
                >
                  登录
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
