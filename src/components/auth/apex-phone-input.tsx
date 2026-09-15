"use client";

import { useEffect, useState } from "react";
import {
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

const PRIORITY: CountryCode[] = ["PK", "US", "GB", "AE", "IN", "CA", "SA", "AU"];

const COUNTRY_OPTIONS = (() => {
  const all = getCountries();
  const rest = all.filter((c) => !PRIORITY.includes(c)).sort();
  return [...PRIORITY, ...rest].map((code) => ({
    code,
    dial: `+${getCountryCallingCode(code)}`,
  }));
})();

type ApexPhoneInputProps = {
  value?: string;
  onChange: (value?: string) => void;
  placeholder?: string;
};

/** Normalize typed/pasted input into country + national digits only. */
function normalizeNational(raw: string, country: CountryCode) {
  const trimmed = raw.trim();

  // Full international paste: +92 317...
  if (trimmed.startsWith("+")) {
    const parsed = parsePhoneNumberFromString(trimmed);
    if (parsed?.country && parsed.nationalNumber) {
      return {
        country: parsed.country as CountryCode,
        national: parsed.nationalNumber,
      };
    }
  }

  let digits = trimmed.replace(/\D/g, "");
  const callingCode = getCountryCallingCode(country);

  // User typed country code again after PK +92 selector (e.g. 92317...)
  if (digits.startsWith(callingCode) && digits.length > callingCode.length + 5) {
    digits = digits.slice(callingCode.length);
  }

  // Local format with leading 0 (e.g. 0317...)
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return { country, national: digits };
}

export function ApexPhoneInput({
  value,
  onChange,
  placeholder = "Phone number",
}: ApexPhoneInputProps) {
  const [country, setCountry] = useState<CountryCode>("PK");
  const [national, setNational] = useState("");

  useEffect(() => {
    if (!value) {
      setNational((prev) => (prev ? "" : prev));
      return;
    }
    const parsed = parsePhoneNumberFromString(value);
    if (!parsed) return;
    if (parsed.country) setCountry(parsed.country);
    const nextNational = parsed.nationalNumber || "";
    setNational((prev) => (prev.replace(/\D/g, "") === nextNational ? prev : nextNational));
  }, [value]);

  const dial = `+${getCountryCallingCode(country)}`;

  const emit = (nextCountry: CountryCode, nextNational: string) => {
    const digits = nextNational.replace(/\D/g, "");
    if (!digits) {
      onChange(undefined);
      return;
    }
    onChange(`+${getCountryCallingCode(nextCountry)}${digits}`);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        padding: "10px 12px",
        boxSizing: "border-box",
      }}
    >
      <select
        value={country}
        onChange={(e) => {
          const next = e.target.value as CountryCode;
          setCountry(next);
          emit(next, national);
        }}
        aria-label="Country"
        style={{
          maxWidth: 120,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.55)",
          color: "#e4e4e7",
          padding: "10px 8px",
          fontSize: 13,
          outline: "none",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {COUNTRY_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code} style={{ color: "#000" }}>
            {opt.code} {opt.dial}
          </option>
        ))}
      </select>

      <span
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          color: "#22d3ee",
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {dial}
      </span>

      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={national}
        placeholder={placeholder}
        onChange={(e) => {
          const normalized = normalizeNational(e.target.value, country);
          if (normalized.country !== country) setCountry(normalized.country);
          setNational(normalized.national);
          emit(normalized.country, normalized.national);
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (!text) return;
          e.preventDefault();
          const normalized = normalizeNational(text, country);
          if (normalized.country !== country) setCountry(normalized.country);
          setNational(normalized.national);
          emit(normalized.country, normalized.national);
        }}
        style={{
          flex: 1,
          minWidth: 0,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#fff",
          fontSize: 15,
        }}
      />
    </div>
  );
}

export function isApexPhoneValid(value?: string) {
  if (!value) return false;
  const parsed = parsePhoneNumberFromString(value);
  return Boolean(parsed?.isValid());
}
