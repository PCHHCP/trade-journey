import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppLanguage } from "@/hooks/useAppLanguage";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
}

export function DateTimePicker({
  value,
  onChange,
  className,
  placeholder,
}: DateTimePickerProps) {
  const { t } = useTranslation();
  const { dateFnsLocale } = useAppLanguage();
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(() => value ?? new Date());
  const [hours, setHours] = React.useState(() =>
    value ? String(value.getHours()).padStart(2, "0") : "00",
  );
  const [minutes, setMinutes] = React.useState(() =>
    value ? String(value.getMinutes()).padStart(2, "0") : "00",
  );

  React.useEffect(() => {
    if (value) {
      setHours(String(value.getHours()).padStart(2, "0"));
      setMinutes(String(value.getMinutes()).padStart(2, "0"));
    }
  }, [value]);

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return;
    const updated = new Date(day);
    updated.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    onChange?.(updated);
  };

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    setHours(newHours);
    setMinutes(newMinutes);
    if (value) {
      const updated = new Date(value);
      updated.setHours(parseInt(newHours, 10), parseInt(newMinutes, 10), 0, 0);
      onChange?.(updated);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <span className="truncate">
          {value
            ? format(value, "PP p", { locale: dateFnsLocale })
            : (placeholder ?? t("dashboard.form.dateTimePlaceholder"))}
        </span>
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onWheel={(e: React.WheelEvent) => e.stopPropagation()}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          month={month}
          onMonthChange={setMonth}
          locale={dateFnsLocale}
          className="border-b border-border"
        />
        <div className="flex items-center justify-center gap-2 px-4 py-3">
          <TimeInput
            value={hours}
            max={23}
            onChange={(v) => handleTimeChange(v, minutes)}
            label={t("dashboard.form.hoursLabel")}
          />
          <span className="text-lg font-medium text-muted-foreground">:</span>
          <TimeInput
            value={minutes}
            max={59}
            onChange={(v) => handleTimeChange(hours, v)}
            label={t("dashboard.form.minutesLabel")}
          />
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-xs text-indigo-400 hover:text-indigo-300"
            onClick={() => {
              const now = new Date();
              setHours(String(now.getHours()).padStart(2, "0"));
              setMinutes(String(now.getMinutes()).padStart(2, "0"));
              setMonth(now);
              onChange?.(now);
            }}
          >
            {t("common.now")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TimeInput({
  value,
  max,
  onChange,
  label,
}: {
  value: string;
  max: number;
  onChange: (value: string) => void;
  label: string;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    const num = parseInt(raw, 10);
    if (raw === "" || (num >= 0 && num <= max)) {
      onChange(raw);
    }
  };

  const handleBlur = () => {
    const num = parseInt(value, 10);
    if (isNaN(num) || value === "") {
      onChange("00");
    } else {
      onChange(String(Math.min(num, max)).padStart(2, "0"));
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-10 rounded-md border border-input bg-background px-1.5 py-1 text-center text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}
