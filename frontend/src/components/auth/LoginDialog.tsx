import { useState, useEffect, useRef, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  createLoginSchema,
  createRegisterSchema,
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
import type { TFunction } from "i18next";

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

function getAuthErrorMessage(
  error: { message: string; code?: string },
  t: TFunction,
) {
  const normalizedMessage = error.message.toLowerCase();

  if (
    error.code === "email_not_confirmed" ||
    normalizedMessage.includes("email not confirmed")
  ) {
    return t("auth.errors.emailNotConfirmed");
  }

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid credentials")
  ) {
    return t("auth.errors.invalidCredentials");
  }

  if (normalizedMessage.includes("user already registered")) {
    return t("auth.errors.userAlreadyRegistered");
  }

  return t("auth.errors.generic");
}

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authMessage?: string | null;
  onAuthMessageDismiss?: () => void;
}

export function LoginDialog({
  open,
  onOpenChange,
  authMessage = null,
  onAuthMessageDismiss,
}: LoginDialogProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [view, setView] = useState<
    "login" | "register" | "registered" | "verify-email"
  >("login");
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingCredentialsRef = useRef<{
    email: string;
    password: string;
  } | null>(null);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(createRegisterSchema(t)),
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

  useEffect(() => {
    if (Object.keys(loginForm.formState.errors).length > 0) {
      void loginForm.trigger();
    }
    if (Object.keys(registerForm.formState.errors).length > 0) {
      void registerForm.trigger();
    }
  }, [
    i18n.resolvedLanguage,
    loginForm,
    loginForm.formState.errors,
    registerForm,
    registerForm.formState.errors,
  ]);

  function resetForms() {
    loginForm.reset();
    registerForm.reset();
    pendingCredentialsRef.current = null;
    setPendingVerificationEmail("");
    setError(null);
  }

  function switchView(
    newView: "login" | "register" | "registered" | "verify-email",
  ) {
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
      setError(getAuthErrorMessage(loginError, t));
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
      setError(t("auth.errors.unavailable"));
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
        setError(getAuthErrorMessage(oauthError, t));
      }
    } finally {
      setOauthLoading(false);
    }
  }

  async function handleLoginSubmit(values: LoginFormValues) {
    setError(null);
    if (!supabase || !isSupabaseConfigured) {
      setError(t("auth.errors.unavailable"));
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (loginError) {
      setError(getAuthErrorMessage(loginError, t));
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
      setError(t("auth.errors.unavailable"));
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
      setError(getAuthErrorMessage(signUpError, t));
    } else if (
      data.user &&
      (!data.user.identities || data.user.identities.length === 0)
    ) {
      pendingCredentialsRef.current = {
        email: values.email,
        password: values.password,
      };
      setView("registered");
    } else if (data.session) {
      onOpenChange(false);
      setView("login");
      resetForms();
      void navigate(ROUTES.DASHBOARD);
    } else {
      registerForm.reset();
      setPendingVerificationEmail(values.email);
      setView("verify-email");
    }
  }

  const viewConfig = {
    login: {
      title: t("auth.dialog.loginTitle"),
      description: t("auth.dialog.loginDescription"),
    },
    register: {
      title: t("auth.dialog.registerTitle"),
      description: t("auth.dialog.registerDescription"),
    },
    registered: {
      title: t("auth.dialog.registeredTitle"),
      description: t("auth.dialog.registeredDescription"),
    },
    "verify-email": {
      title: t("auth.dialog.verifyEmailTitle"),
      description: t("auth.dialog.verifyEmailDescription"),
    },
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
      <DialogContent className="sm:max-w-md" showCloseButton={!authMessage}>
        <DialogHeader>
          <DialogTitle>{viewConfig[view].title}</DialogTitle>
          <DialogDescription>{viewConfig[view].description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {!isSupabaseConfigured && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
              {t("auth.dialog.missingSupabaseConfig")}
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
                {t("auth.dialog.googleLogin")}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {t("auth.dialog.googleFirstUse")}
              </p>

              <div className="relative flex items-center justify-center">
                <Separator className="absolute w-full" />
                <span className="relative bg-background px-2 text-xs text-muted-foreground">
                  {t("auth.dialog.divider")}
                </span>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {authMessage && (
            <div className="grid gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-sm text-amber-700">
              <p>{authMessage}</p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  onAuthMessageDismiss?.();
                  onOpenChange(false);
                }}
              >
                {t("common.understood")}
              </Button>
            </div>
          )}

          {view === "registered" ? (
            <div className="grid gap-4 text-center">
              <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-blue-700">
                {t("auth.dialog.registeredAutoLogin")}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("auth.dialog.redirectCountdown", { count: countdown })}
              </p>
              <Button onClick={() => void handleRegisteredRedirect()}>
                {t("common.confirm")}
              </Button>
            </div>
          ) : view === "verify-email" ? (
            <div className="grid gap-4">
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
                {t("auth.dialog.verificationSentPrefix")}
                <span className="ml-1 font-medium">
                  {pendingVerificationEmail}
                </span>
                。
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>{t("auth.dialog.verificationAction")}</p>
                <p>{t("auth.dialog.verificationHint")}</p>
              </div>
              <Button type="button" onClick={() => switchView("login")}>
                {t("auth.dialog.backToLogin")}
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
                <Label htmlFor="email">{t("auth.dialog.emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.dialog.emailPlaceholder")}
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
                <Label htmlFor="password">
                  {t("auth.dialog.passwordLabel")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.dialog.passwordPlaceholder")}
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
                {isBusy
                  ? t("auth.dialog.processing")
                  : t("auth.dialog.signInAction")}
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
                <Label htmlFor="register-email">
                  {t("auth.dialog.emailLabel")}
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder={t("auth.dialog.emailPlaceholder")}
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
                <Label htmlFor="register-password">
                  {t("auth.dialog.passwordLabel")}
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder={t("auth.dialog.passwordPlaceholder")}
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
                <Label htmlFor="confirmPassword">
                  {t("auth.dialog.confirmPasswordLabel")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("auth.dialog.confirmPasswordPlaceholder")}
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
                {isBusy
                  ? t("auth.dialog.processing")
                  : t("auth.dialog.registerAction")}
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {view === "login" ? (
              <>
                {t("auth.dialog.noAccountPrefix")}
                <button
                  type="button"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                  onClick={() => switchView("register")}
                >
                  {t("auth.dialog.noAccountAction")}
                </button>
              </>
            ) : (
              <>
                {t("auth.dialog.hasAccountPrefix")}
                <button
                  type="button"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                  onClick={() => switchView("login")}
                >
                  {t("auth.dialog.hasAccountAction")}
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
