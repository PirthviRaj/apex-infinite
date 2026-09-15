"use client";

import {
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
};

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  error,
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const setDigit = (index: number, digit: string) => {
    const next = digits.map((d, i) => (i === index ? digit : d));
    onChange(next.join("").slice(0, length));
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        setDigit(index - 1, "");
        inputs.current[index - 1]?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 20 }}
        >
          <input
            ref={(el) => {
              inputs.current[index] = el;
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            disabled={disabled}
            value={digit}
            onPaste={handlePaste}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              if (!raw) {
                setDigit(index, "");
                return;
              }
              const char = raw.slice(-1);
              setDigit(index, char);
              if (index < length - 1) inputs.current[index + 1]?.focus();
            }}
            className={cn(
              "h-12 w-10 rounded-xl border bg-white/[0.04] text-center font-mono text-xl text-white outline-none transition-all sm:h-14 sm:w-12 sm:text-2xl",
              "focus:border-apex-purple focus:shadow-glow focus:ring-1 focus:ring-apex-purple/50",
              error ? "border-rose-500/70" : "border-white/10",
              digit && "border-apex-cyan/50 text-apex-cyan"
            )}
          />
        </motion.div>
      ))}
    </div>
  );
}
