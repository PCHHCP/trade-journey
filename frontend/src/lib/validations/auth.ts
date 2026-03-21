import { z } from "zod";
import type { TFunction } from "i18next";

export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z.email(t("auth.validation.invalidEmail")),
    password: z.string().min(6, t("auth.validation.passwordMin")),
  });
}

export function createRegisterSchema(t: TFunction) {
  return z
    .object({
      email: z.email(t("auth.validation.invalidEmail")),
      password: z.string().min(6, t("auth.validation.passwordMin")),
      confirmPassword: z
        .string()
        .min(1, t("auth.validation.confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.passwordsMismatch"),
      path: ["confirmPassword"],
    });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterFormValues = z.infer<
  ReturnType<typeof createRegisterSchema>
>;
