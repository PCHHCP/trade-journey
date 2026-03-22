import { useEffect, useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  LoaderCircle,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useImportTrades } from "@/hooks/useImportTrades";
import {
  createImportTradesSchema,
  type ImportTradesFormValues,
} from "@/lib/validations/import";

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function Import() {
  const { t, i18n } = useTranslation();
  const [inputKey, setInputKey] = useState(0);
  const importTradesMutation = useImportTrades();
  const form = useForm<ImportTradesFormValues>({
    resolver: zodResolver(createImportTradesSchema(t)),
    defaultValues: {
      file: undefined,
    },
  });

  const selectedFile = useWatch({
    control: form.control,
    name: "file",
  });
  const fileError = form.formState.errors.file?.message;
  const mutationError =
    importTradesMutation.error instanceof Error
      ? importTradesMutation.error.message
      : null;

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      void form.trigger();
    }
  }, [form, form.formState.errors, i18n.resolvedLanguage]);

  async function handleSubmit(values: ImportTradesFormValues) {
    if (!(values.file instanceof File)) {
      return;
    }

    await importTradesMutation.mutateAsync(values.file);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    form.setValue("file", file, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    importTradesMutation.reset();
  }

  function handleReset() {
    form.reset({
      file: undefined,
    });
    importTradesMutation.reset();
    setInputKey((value) => value + 1);
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-6 py-8 shadow-sm sm:px-8">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_var(--brand-soft),_transparent_58%)]" />
        <div className="relative flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--brand)]/20 bg-[var(--brand-soft)] px-3 py-1 text-xs font-medium tracking-[0.24em] text-[var(--brand)] uppercase">
            <Upload className="size-3.5" />
            {t("importPage.hero.eyebrow")}
          </div>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("importPage.hero.title")}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              {t("importPage.hero.description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
            <span className="rounded-full border border-border bg-background/80 px-3 py-1">
              {t("importPage.hero.badges.authRequired")}
            </span>
            <span className="rounded-full border border-border bg-background/80 px-3 py-1">
              {t("importPage.hero.badges.xlsxOnly")}
            </span>
            <span className="rounded-full border border-border bg-background/80 px-3 py-1">
              {t("importPage.hero.badges.duplicateSafe")}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.9fr)]">
        <Card className="border border-border/80 shadow-sm">
          <CardHeader className="border-b border-border/70">
            <CardTitle>{t("importPage.form.title")}</CardTitle>
            <CardDescription>
              {t("importPage.form.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <form
              className="space-y-5"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <div className="space-y-2">
                <Label htmlFor="trade-report-file">
                  {t("importPage.form.fileLabel")}
                </Label>
                <Input
                  key={inputKey}
                  id="trade-report-file"
                  type="file"
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  aria-invalid={Boolean(fileError)}
                  disabled={importTradesMutation.isPending}
                  onChange={handleFileChange}
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  {t("importPage.form.fileHint")}
                </p>
                {fileError ? (
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                ) : null}
              </div>

              {selectedFile instanceof File ? (
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <FileSpreadsheet className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("importPage.form.selectedMeta", {
                          size: formatFileSize(selectedFile.size),
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                  {t("importPage.form.emptySelection")}
                </div>
              )}

              {mutationError ? (
                <div className="flex items-start gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{mutationError}</span>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  size="lg"
                  disabled={importTradesMutation.isPending}
                  className="sm:min-w-40"
                >
                  {importTradesMutation.isPending ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      {t("importPage.form.submitting")}
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" />
                      {t("importPage.form.submit")}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={importTradesMutation.isPending}
                  onClick={handleReset}
                >
                  {t("importPage.form.reset")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="border-b border-border/70">
              <CardTitle>{t("importPage.info.title")}</CardTitle>
              <CardDescription>
                {t("importPage.info.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Upload className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {t("importPage.info.steps.uploadTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("importPage.info.steps.uploadDescription")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {t("importPage.info.steps.parseTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("importPage.info.steps.parseDescription")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {t("importPage.info.steps.resultTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("importPage.info.steps.resultDescription")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {importTradesMutation.data ? (
            <Card className="border border-[var(--profit)]/20 bg-[var(--profit-soft)] shadow-sm">
              <CardHeader className="border-b border-[var(--profit)]/10">
                <CardTitle>{t("importPage.result.title")}</CardTitle>
                <CardDescription>
                  {t("importPage.result.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--profit)]/10 bg-background/80 p-4">
                    <p className="text-xs uppercase text-muted-foreground">
                      {t("importPage.result.imported")}
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-[var(--profit)]">
                      {importTradesMutation.data.imported}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/80 p-4">
                    <p className="text-xs uppercase text-muted-foreground">
                      {t("importPage.result.skipped")}
                    </p>
                    <p className="mt-2 text-3xl font-semibold">
                      {importTradesMutation.data.skipped}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background/80 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <FileSpreadsheet className="size-4 text-primary" />
                    {t("importPage.result.accountTitle")}
                  </div>
                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">
                        {t("importPage.result.accountName")}
                      </dt>
                      <dd className="mt-1 font-medium">
                        {importTradesMutation.data.account.account_name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        {t("importPage.result.accountNumber")}
                      </dt>
                      <dd className="mt-1 font-medium">
                        {importTradesMutation.data.account.account_number}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        {t("importPage.result.platform")}
                      </dt>
                      <dd className="mt-1 font-medium">
                        {importTradesMutation.data.account.platform}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        {t("importPage.result.company")}
                      </dt>
                      <dd className="mt-1 font-medium">
                        {importTradesMutation.data.account.company ??
                          t("importPage.result.companyEmpty")}
                      </dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </main>
  );
}
