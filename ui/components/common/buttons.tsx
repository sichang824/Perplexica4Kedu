import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

interface SpinnerButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  defaultText?: string;
  children?: React.ReactNode;
}

export function SpinnerButton({
  children,
  loading = false,
  loadingText,
  defaultText,
  disabled,
  className,
  ...props
}: SpinnerButtonProps) {
  const buttonText = loading ? loadingText : defaultText || children;

  return (
    <Button
      disabled={disabled || loading}
      className={cn("relative flex justify-center gap-2", className)}
      {...props}
    >
      {loading && <Loader2Icon className="animate-spin" />}
      <span>{buttonText}</span>
    </Button>
  );
}

interface CountdownButtonProps extends ButtonProps {
  counting?: boolean;
  seconds?: number;
  countdownText?: string;
  defaultText?: string;
  children?: React.ReactNode;
  loading?: boolean;
}

export function CountdownButton({
  counting = false,
  seconds = 0,
  countdownText = "{seconds}秒后重试",
  defaultText,
  children,
  disabled,
  className,
  loading = false,
  ...props
}: CountdownButtonProps) {
  const buttonText = counting
    ? countdownText.replace("{seconds}", String(seconds))
    : defaultText || children;

  return (
    <Button
      disabled={disabled || counting}
      className={cn("relative flex justify-center gap-2", className)}
      {...props}
    >
      {loading && <Loader2Icon className="animate-spin" />}
      <span>{buttonText}</span>
    </Button>
  );
}
