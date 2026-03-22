import { z } from "zod";
import type { TFunction } from "i18next";

export function createImportTradesSchema(t: TFunction) {
  return z.object({
    file: z
      .instanceof(File, {
        message: t("importPage.validation.required"),
      })
      .optional()
      .refine((value) => value instanceof File, {
        message: t("importPage.validation.required"),
      })
      .refine(
        (value) =>
          !(value instanceof File) ||
          value.name.toLowerCase().endsWith(".xlsx"),
        {
          message: t("importPage.validation.fileType"),
        },
      )
      .refine((value) => !(value instanceof File) || value.size > 0, {
        message: t("importPage.validation.emptyFile"),
      }),
  });
}

export type ImportTradesFormValues = z.infer<
  ReturnType<typeof createImportTradesSchema>
>;
