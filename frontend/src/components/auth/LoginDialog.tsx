import { useState, useEffect, useRef, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  createLoginSchema,
  createRegisterSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from "@/lib/validations/auth";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/config/routes";
import type { TFunction } from "i18next";
import { cn } from "@/lib/utils";

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

type AuthView = "login" | "register" | "registered" | "verify-email";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authMessage?: string | null;
  onAuthMessageDismiss?: () => void;
}

/** Branded CTA button matching the Landing page's conic-gradient style. */
function AuthCTA({
  children,
  disabled,
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group relative inline-flex h-10 w-full cursor-pointer overflow-hidden rounded-full p-[1px] transition-transform duration-300 focus:outline-none",
        disabled
          ? "pointer-events-none opacity-50"
          : "hover:scale-[1.01] active:scale-[0.99]",
      )}
    >
      <span className="absolute inset-[-1000%] animate-spin bg-[conic-gradient(from_90deg_at_50%_50%,var(--auth-brand)_0%,var(--auth-surface)_50%,var(--auth-brand)_100%)] opacity-70 transition-opacity duration-300 [animation-duration:4s] group-hover:opacity-100" />
      <span className="inline-flex h-full w-full items-center justify-center gap-2 rounded-full bg-[var(--auth-brand)] px-6 text-sm font-semibold tracking-wide text-white backdrop-blur-3xl transition-all duration-300">
        {children}
      </span>
    </button>
  );
}

/** Divider with centered text, using auth tokens. */
function AuthDivider({ text }: { text: string }) {
  return (
    <div className="relative flex items-center justify-center py-1">
      <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--auth-divider)]" />
      <span className="relative bg-[var(--auth-surface)] px-3 text-xs tracking-wider text-[var(--auth-text-muted)] uppercase">
        {text}
      </span>
    </div>
  );
}

const PANEL_VARIANTS = {
  enter: { opacity: 0, y: 6 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export function LoginDialog({
  open,
  onOpenChange,
  authMessage = null,
  onAuthMessageDismiss,
}: LoginDialogProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>("login");
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

  function switchView(newView: AuthView) {
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

  const viewDescription: Record<AuthView, string> = {
    login: t("auth.dialog.loginDescription"),
    register: t("auth.dialog.registerDescription"),
    registered: t("auth.dialog.registeredDescription"),
    "verify-email": t("auth.dialog.verifyEmailDescription"),
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          resetForms();
          setView("login");
        }
      }}
    >
      <DialogPrimitive.Portal>
        {/* Backdrop — frosted glass with brand tint */}
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />

        {/* Auth Surface */}
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 outline-none sm:max-w-[26rem] data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <div className="overflow-hidden rounded-2xl border border-[var(--auth-border)] bg-[var(--auth-surface)] shadow-2xl ring-1 ring-[var(--auth-border-strong)]">
            {/* Brand Header */}
            <div className="flex flex-col items-center gap-1 px-6 pt-7 pb-2">
              <span className="font-display text-3xl tracking-tight text-[var(--auth-brand)]">
                Tyche
              </span>
              <DialogPrimitive.Description className="text-center text-sm text-[var(--auth-text-muted)]">
                {viewDescription[view]}
              </DialogPrimitive.Description>
            </div>

            {/* Content */}
            <div className="px-6 pt-3 pb-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={view}
                  variants={PANEL_VARIANTS}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="grid gap-4"
                >
                  {/* Supabase missing warning */}
                  {!isSupabaseConfigured && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-3 py-2.5 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                      {t("auth.dialog.missingSupabaseConfig")}
                    </div>
                  )}

                  {/* Error banner */}
                  {error && (
                    <div className="rounded-xl border border-destructive/40 bg-destructive/8 px-3 py-2.5 text-xs leading-relaxed text-destructive">
                      {error}
                    </div>
                  )}

                  {/* Auth message (e.g. expired session) */}
                  {authMessage && (
                    <div className="grid gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-3 py-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                      <p>{authMessage}</p>
                      <AuthCTA
                        onClick={() => {
                          onAuthMessageDismiss?.();
                          onOpenChange(false);
                        }}
                      >
                        {t("common.understood")}
                      </AuthCTA>
                    </div>
                  )}

                  {/* ─── LOGIN VIEW ─── */}
                  {view === "login" && (
                    <>
                      {/* Google OAuth */}
                      <button
                        type="button"
                        onClick={() => void handleGoogleAuth()}
                        disabled={isBusy || !isSupabaseConfigured}
                        className="flex h-10 w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--auth-border-strong)] bg-[var(--auth-input-bg)] text-sm font-medium text-[var(--auth-text)] transition-all hover:border-[var(--auth-brand)] hover:bg-[var(--auth-surface-muted)] disabled:pointer-events-none disabled:opacity-50"
                      >
                        <GoogleIcon />
                        {t("auth.dialog.googleLogin")}
                      </button>
                      <p className="text-center text-[11px] leading-relaxed text-[var(--auth-text-muted)]">
                        {t("auth.dialog.googleFirstUse")}
                      </p>

                      <AuthDivider text={t("auth.dialog.divider")} />

                      {/* Email/password form */}
                      <form
                        onSubmit={loginForm.handleSubmit((values) => {
                          void handleLoginSubmit(values);
                        })}
                        className="grid gap-3"
                        noValidate
                      >
                        <AuthField
                          id="email"
                          label={t("auth.dialog.emailLabel")}
                          type="email"
                          placeholder={t("auth.dialog.emailPlaceholder")}
                          disabled={isBusy}
                          error={loginForm.formState.errors.email?.message}
                          {...loginForm.register("email")}
                        />
                        <AuthField
                          id="password"
                          label={t("auth.dialog.passwordLabel")}
                          type="password"
                          placeholder={t("auth.dialog.passwordPlaceholder")}
                          disabled={isBusy}
                          error={loginForm.formState.errors.password?.message}
                          {...loginForm.register("password")}
                        />
                        <div className="pt-1">
                          <AuthCTA
                            type="submit"
                            disabled={isBusy || !isSupabaseConfigured}
                          >
                            {isBusy
                              ? t("auth.dialog.processing")
                              : t("auth.dialog.signInAction")}
                          </AuthCTA>
                        </div>
                      </form>
                    </>
                  )}

                  {/* ─── REGISTER VIEW ─── */}
                  {view === "register" && (
                    <form
                      onSubmit={registerForm.handleSubmit((values) => {
                        void handleRegisterSubmit(values);
                      })}
                      className="grid gap-3"
                      noValidate
                    >
                      <AuthField
                        id="register-email"
                        label={t("auth.dialog.emailLabel")}
                        type="email"
                        placeholder={t("auth.dialog.emailPlaceholder")}
                        disabled={isBusy}
                        error={registerForm.formState.errors.email?.message}
                        {...registerForm.register("email")}
                      />
                      <AuthField
                        id="register-password"
                        label={t("auth.dialog.passwordLabel")}
                        type="password"
                        placeholder={t("auth.dialog.passwordPlaceholder")}
                        disabled={isBusy}
                        error={registerForm.formState.errors.password?.message}
                        {...registerForm.register("password")}
                      />
                      <AuthField
                        id="confirmPassword"
                        label={t("auth.dialog.confirmPasswordLabel")}
                        type="password"
                        placeholder={t(
                          "auth.dialog.confirmPasswordPlaceholder",
                        )}
                        disabled={isBusy}
                        error={
                          registerForm.formState.errors.confirmPassword?.message
                        }
                        {...registerForm.register("confirmPassword")}
                      />
                      <div className="pt-1">
                        <AuthCTA
                          type="submit"
                          disabled={isBusy || !isSupabaseConfigured}
                        >
                          {isBusy
                            ? t("auth.dialog.processing")
                            : t("auth.dialog.registerAction")}
                        </AuthCTA>
                      </div>
                    </form>
                  )}

                  {/* ─── REGISTERED (auto-login) VIEW ─── */}
                  {view === "registered" && (
                    <div className="grid gap-4 text-center">
                      <div className="rounded-xl border border-[var(--auth-brand)]/30 bg-[var(--brand-soft)] px-4 py-3 text-sm text-[var(--auth-brand)]">
                        {t("auth.dialog.registeredAutoLogin")}
                      </div>
                      <p className="text-sm text-[var(--auth-text-muted)]">
                        {t("auth.dialog.redirectCountdown", {
                          count: countdown,
                        })}
                      </p>
                      <AuthCTA onClick={() => void handleRegisteredRedirect()}>
                        {t("common.confirm")}
                      </AuthCTA>
                    </div>
                  )}

                  {/* ─── VERIFY EMAIL VIEW ─── */}
                  {view === "verify-email" && (
                    <div className="grid gap-4">
                      <div className="rounded-xl border border-[var(--profit)]/30 bg-[var(--profit-soft)] px-4 py-3 text-sm text-[var(--profit)]">
                        {t("auth.dialog.verificationSentPrefix")}
                        <span className="ml-1 font-medium">
                          {pendingVerificationEmail}
                        </span>
                      </div>
                      <div className="grid gap-2 text-sm text-[var(--auth-text-muted)]">
                        <p>{t("auth.dialog.verificationAction")}</p>
                        <p>{t("auth.dialog.verificationHint")}</p>
                      </div>
                      <AuthCTA onClick={() => switchView("login")}>
                        {t("auth.dialog.backToLogin")}
                      </AuthCTA>
                    </div>
                  )}

                  {/* View switch link */}
                  {(view === "login" || view === "register") && (
                    <p className="text-center text-[13px] text-[var(--auth-text-muted)]">
                      {view === "login" ? (
                        <>
                          {t("auth.dialog.noAccountPrefix")}{" "}
                          <button
                            type="button"
                            className="font-medium text-[var(--auth-brand)] underline underline-offset-4 transition-colors hover:text-[var(--auth-text)]"
                            onClick={() => switchView("register")}
                          >
                            {t("auth.dialog.noAccountAction")}
                          </button>
                        </>
                      ) : (
                        <>
                          {t("auth.dialog.hasAccountPrefix")}{" "}
                          <button
                            type="button"
                            className="font-medium text-[var(--auth-brand)] underline underline-offset-4 transition-colors hover:text-[var(--auth-text)]"
                            onClick={() => switchView("login")}
                          >
                            {t("auth.dialog.hasAccountAction")}
                          </button>
                        </>
                      )}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Close button — top right, subtle */}
            {!authMessage && (
              <DialogPrimitive.Close className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-lg text-[var(--auth-text-muted)] transition-colors hover:bg-[var(--auth-surface-muted)] hover:text-[var(--auth-text)]">
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
                <span className="sr-only">{t("common.cancel")}</span>
              </DialogPrimitive.Close>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** A branded form field with label, input, and error message. */
interface AuthFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
}

const AuthField = ({
  ref,
  label,
  error,
  id,
  className,
  ...props
}: AuthFieldProps) => (
  <div className="grid gap-1.5">
    <label
      htmlFor={id}
      className="text-xs font-medium tracking-wide text-[var(--auth-text-muted)]"
    >
      {label}
    </label>
    <Input
      ref={ref}
      id={id}
      className={cn(
        "h-10 rounded-xl border-[var(--auth-input-border)] bg-[var(--auth-input-bg)] text-[var(--auth-text)] placeholder:text-[var(--auth-text-muted)]/60 focus-visible:border-[var(--auth-brand)] focus-visible:ring-[var(--auth-input-focus)]",
        error && "border-destructive",
        className,
      )}
      {...props}
    />
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);
AuthField.displayName = "AuthField";
