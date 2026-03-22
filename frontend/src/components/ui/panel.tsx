import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const panelVariants = cva(
  "flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground",
  {
    variants: {
      elevation: {
        flat: "",
        raised: "shadow-sm",
      },
    },
    defaultVariants: {
      elevation: "raised",
    },
  },
);

const panelSectionVariants = cva("", {
  variants: {
    size: {
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-7",
      none: "p-0",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface PanelProps
  extends React.ComponentProps<"section">, VariantProps<typeof panelVariants> {}

function Panel({ className, elevation, ...props }: PanelProps) {
  return (
    <section
      data-slot="panel"
      className={cn(panelVariants({ elevation }), className)}
      {...props}
    />
  );
}

interface PanelHeaderProps
  extends
    React.ComponentProps<"div">,
    VariantProps<typeof panelSectionVariants> {
  separated?: boolean;
}

function PanelHeader({
  className,
  size,
  separated = false,
  ...props
}: PanelHeaderProps) {
  return (
    <div
      data-slot="panel-header"
      className={cn(
        "flex items-start justify-between gap-4",
        panelSectionVariants({ size }),
        separated && "border-b border-border",
        className,
      )}
      {...props}
    />
  );
}

function PanelTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-title"
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function PanelDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function PanelAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel-action"
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}

interface PanelContentProps
  extends
    React.ComponentProps<"div">,
    VariantProps<typeof panelSectionVariants> {}

function PanelContent({ className, size, ...props }: PanelContentProps) {
  return (
    <div
      data-slot="panel-content"
      className={cn(panelSectionVariants({ size }), className)}
      {...props}
    />
  );
}

interface PanelFooterProps
  extends
    React.ComponentProps<"div">,
    VariantProps<typeof panelSectionVariants> {
  separated?: boolean;
  tone?: "default" | "muted";
}

function PanelFooter({
  className,
  size,
  separated = true,
  tone = "default",
  ...props
}: PanelFooterProps) {
  return (
    <div
      data-slot="panel-footer"
      className={cn(
        "flex items-center gap-3",
        panelSectionVariants({ size }),
        separated && "border-t border-border",
        tone === "muted" && "bg-muted/40",
        className,
      )}
      {...props}
    />
  );
}

export {
  Panel,
  PanelAction,
  PanelContent,
  PanelDescription,
  PanelFooter,
  PanelHeader,
  PanelTitle,
};
