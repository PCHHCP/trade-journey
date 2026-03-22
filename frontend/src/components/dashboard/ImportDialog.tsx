import { useEffect, useState, type ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  FileSpreadsheet,
  LoaderCircle,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface ImportDialogProps {
  onClose: () => void;
}

export function ImportDialog({ onClose }: ImportDialogProps) {
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent variant="panel" size="md" className="max-h-[90vh]">
        <DialogHeader className="border-b border-border px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-foreground">
            {t("importPage.hero.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
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
              <p className="text-xs text-muted-foreground">
                {t("importPage.form.fileHint")}
              </p>
              {fileError ? (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              ) : null}
            </div>

            {selectedFile instanceof File ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <FileSpreadsheet className="size-4" />
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
            ) : null}

            {mutationError ? (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{mutationError}</span>
              </div>
            ) : null}

            {importTradesMutation.data ? (
              <div className="space-y-3 rounded-lg border border-[var(--profit)]/20 bg-[var(--profit-soft)] p-4">
                <p className="text-sm font-semibold text-foreground">
                  {t("importPage.result.title")}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-[var(--profit)]/10 bg-background/80 p-2.5">
                    <p className="text-xs text-muted-foreground">
                      {t("importPage.result.imported")}
                    </p>
                    <p className="text-xl font-semibold text-[var(--profit)]">
                      {importTradesMutation.data.imported}
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-background/80 p-2.5">
                    <p className="text-xs text-muted-foreground">
                      {t("importPage.result.skipped")}
                    </p>
                    <p className="text-xl font-semibold">
                      {importTradesMutation.data.skipped}
                    </p>
                  </div>
                </div>
                <div className="rounded-md border border-border bg-background/80 p-2.5">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium">
                    <FileSpreadsheet className="size-3.5 text-primary" />
                    {t("importPage.result.accountTitle")}
                  </div>
                  <dl className="grid gap-1.5 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">
                        {t("importPage.result.accountName")}
                      </dt>
                      <dd className="font-medium">
                        {importTradesMutation.data.account.account_name}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        {t("importPage.result.accountNumber")}
                      </dt>
                      <dd className="font-medium">
                        {importTradesMutation.data.account.account_number}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        {t("importPage.result.platform")}
                      </dt>
                      <dd className="font-medium">
                        {importTradesMutation.data.account.platform}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        {t("importPage.result.company")}
                      </dt>
                      <dd className="font-medium">
                        {importTradesMutation.data.account.company ??
                          t("importPage.result.companyEmpty")}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : null}

            <div className="flex gap-3 border-t border-border pt-4">
              <Button
                type="submit"
                disabled={importTradesMutation.isPending}
                className="flex-1"
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
                disabled={importTradesMutation.isPending}
                onClick={handleReset}
              >
                {t("importPage.form.reset")}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
