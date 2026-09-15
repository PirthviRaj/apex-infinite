"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Apple,
  AtSign,
  Code2,
  Globe2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { NeuralPulse } from "@/components/ui/neural-pulse";
import { OtpInput } from "@/components/auth/otp-input";
import { ApexPhoneInput, isApexPhoneValid } from "@/components/auth/apex-phone-input";
import { ensureAuthHydrated, useAuthStore } from "@/store/auth-store";

type AuthMethod = "phone" | "email";
type Mode = "login" | "signup";
type Step = "form" | "otp" | "social-email" | "social-otp" | "success";
type SocialProvider = "google" | "apple" | "github";

const fieldStyle: CSSProperties = {
  width: "100%",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  padding: "14px 16px",
  color: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

function TabButton({
  active,
  onClick,
  children,
  activeColor,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  activeColor: "purple" | "cyan";
}) {
  const bg =
    active && activeColor === "purple"
      ? "linear-gradient(135deg, rgba(168,85,247,0.6), rgba(34,211,238,0.25))"
      : active && activeColor === "cyan"
        ? "rgba(34,211,238,0.2)"
        : "transparent";
  const color = active ? (activeColor === "cyan" ? "#22d3ee" : "#fff") : "#a1a1aa";
  const border = active
    ? activeColor === "cyan"
      ? "1px solid rgba(34,211,238,0.5)"
      : "1px solid rgba(168,85,247,0.45)"
    : "1px solid transparent";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      style={{
        flex: 1,
        background: bg,
        color,
        border,
        borderRadius: 12,
        padding: "12px 10px",
        fontWeight: 600,
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "pointer",
        boxShadow: active && activeColor === "purple" ? "0 0 20px rgba(168,85,247,0.3)" : "none",
      }}
    >
      {children}
    </button>
  );
}

export function ApexGateway() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setSession = useAuthStore((s) => s.setSession);

  // Independent — never reset one when the other changes
  const [mode, setMode] = useState<Mode>("login");
  const [method, setMethod] = useState<AuthMethod>("phone");
  const [step, setStep] = useState<Step>("form");

  const [phone, setPhone] = useState<string>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");

  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(null);
  const [socialEmail, setSocialEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = ensureAuthHydrated();
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  useEffect(() => {
    if (hydrated && user) window.location.replace("/app");
  }, [hydrated, user]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  useEffect(() => {
    if (otp.length !== 6) return;
    if (step === "otp") void runVerifyPhone(otp);
    if (step === "social-otp") void runVerifySocial(otp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  if (hydrated && user) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#000", color: "#22d3ee" }}>
        Welcome back — entering Apex…
      </div>
    );
  }

  const clearError = () => setError("");

  const finishAuth = (nextUser: Parameters<typeof setSession>[0], token: string) => {
    setSession(nextUser, token);
    setStep("success");
    setTimeout(() => router.push("/app"), 900);
  };

  const runSendPhoneOtp = async () => {
    clearError();
    if (!phone || !isApexPhoneValid(phone)) {
      setError("Enter a valid phone number (PK example: 3171234567 — without +92 or 0).");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      setError("Enter your full name for Sign Up.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Failed to send OTP.");
        return;
      }
      setOtp(typeof data.devOtp === "string" ? data.devOtp : "");
      setDevOtp(typeof data.devOtp === "string" ? data.devOtp : "");
      setSecondsLeft(60);
      setStep("otp");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const runVerifyPhone = async (code = otp) => {
    if (code.length !== 6) return;
    setLoading(true);
    clearError();
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, name: mode === "signup" ? name : undefined }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Invalid OTP.");
        return;
      }
      finishAuth(data.user, data.token);
    } catch {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const runEmailAuth = async () => {
    clearError();
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, username, password }),
        });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error || "Sign up failed.");
          return;
        }
        finishAuth(data.user, data.token);
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, password }),
        });
        const data = await res.json();
        if (!data.ok) {
          setError(data.error || "Login failed.");
          return;
        }
        finishAuth(data.user, data.token);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const startSocial = (provider: SocialProvider) => {
    clearError();
    setSocialProvider(provider);
    setSocialEmail("");
    setChallengeId("");
    setOtp("");
    setStep("social-email");
  };

  const runSocialStart = async () => {
    if (!socialProvider) return;
    clearError();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", provider: socialProvider, email: socialEmail }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Could not start social verification.");
        return;
      }
      setChallengeId(data.challengeId);
      setOtp("");
      setSecondsLeft(60);
      setStep("social-otp");
    } catch {
      setError("Social verification failed to start.");
    } finally {
      setLoading(false);
    }
  };

  const runVerifySocial = async (code = otp) => {
    if (code.length !== 6 || !challengeId) return;
    setLoading(true);
    clearError();
    try {
      const res = await fetch("/api/auth/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", challengeId, code, name: name || undefined }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Invalid verification code.");
        return;
      }
      finishAuth(data.user, data.token);
    } catch {
      setError("Social verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const backToForm = () => {
    setStep("form");
    setOtp("");
    setDevOtp("");
    setChallengeId("");
    setSocialProvider(null);
    clearError();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        position: "relative",
        overflow: "auto",
      }}
    >
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(168,85,247,0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(34,211,238,0.12), transparent)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 520,
          margin: "0 auto",
          padding: "40px 16px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              letterSpacing: "0.45em",
              textTransform: "uppercase",
              color: "#22d3ee",
              marginBottom: 12,
            }}
          >
            Apex Infinite · Universal AI Super-OS
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.2rem)", fontWeight: 800, margin: 0 }}>
            Apex <span style={{ color: "#a855f7" }}>Gateway</span>
          </h1>
          <p style={{ marginTop: 12, color: "#a1a1aa", fontSize: 14 }}>
            Login / Sign Up stay fixed · Phone & Email stay fixed · no swipe glitch
          </p>
        </div>

        <div
          style={{
            borderRadius: 24,
            border: "1px solid rgba(168,85,247,0.28)",
            background: "rgba(10,10,15,0.92)",
            padding: 24,
            boxShadow: "0 0 60px rgba(168,85,247,0.15)",
          }}
        >
          {step === "form" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Row 1: Login | Sign Up — independent */}
              <div>
                <p style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>
                  1. Account action
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: 6,
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <TabButton active={mode === "login"} activeColor="purple" onClick={() => { setMode("login"); clearError(); }}>
                    Login
                  </TabButton>
                  <TabButton active={mode === "signup"} activeColor="purple" onClick={() => { setMode("signup"); clearError(); }}>
                    Sign Up
                  </TabButton>
                </div>
              </div>

              {/* Row 2: Phone | Email — independent */}
              <div>
                <p style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>
                  2. Method
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: 6,
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(0,0,0,0.45)",
                  }}
                >
                  <TabButton active={method === "phone"} activeColor="cyan" onClick={() => { setMethod("phone"); clearError(); }}>
                    <Phone size={16} /> Phone
                  </TabButton>
                  <TabButton active={method === "email"} activeColor="cyan" onClick={() => { setMethod("email"); clearError(); }}>
                    <Mail size={16} /> Email / Username
                  </TabButton>
                </div>
              </div>

              <p style={{ fontSize: 12, color: "#71717a", margin: 0 }}>
                Active: <b style={{ color: "#fff" }}>{mode === "login" ? "Login" : "Sign Up"}</b>
                {" · "}
                <b style={{ color: "#22d3ee" }}>{method === "phone" ? "Phone" : "Email / Username"}</b>
              </p>

              {/* Phone form — keep mounted, toggle with display to avoid remount glitch */}
              <div style={{ display: method === "phone" ? "flex" : "none", flexDirection: "column", gap: 14 }}>
                {mode === "signup" && (
                  <label style={{ display: "block" }}>
                    <span style={{ display: "block", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>
                      Full name
                    </span>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={fieldStyle} />
                  </label>
                )}
                <label style={{ display: "block" }}>
                  <span style={{ display: "block", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>
                    Phone number
                  </span>
                  <ApexPhoneInput value={phone} onChange={setPhone} placeholder="Enter your number" />
                </label>
                <MagneticButton type="button" className="w-full" disabled={loading} onClick={runSendPhoneOtp}>
                  {loading ? "Sending…" : mode === "signup" ? "Sign Up with OTP" : "Login with OTP"}
                  <Sparkles className="h-4 w-4" />
                </MagneticButton>
              </div>

              {/* Email form — keep mounted */}
              <div style={{ display: method === "email" ? "flex" : "none", flexDirection: "column", gap: 14 }}>
                {mode === "signup" ? (
                  <>
                    <label style={{ display: "block" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>
                        <UserRound size={12} /> Full name
                      </span>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={fieldStyle} />
                    </label>
                    <label style={{ display: "block" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>
                        <Mail size={12} /> Email address
                      </span>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={fieldStyle} />
                    </label>
                    <label style={{ display: "block" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>
                        <AtSign size={12} /> Username
                      </span>
                      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="apex_user" style={fieldStyle} />
                    </label>
                    <label style={{ display: "block" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>
                        <Lock size={12} /> Password
                      </span>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" style={fieldStyle} />
                    </label>
                  </>
                ) : (
                  <>
                    <label style={{ display: "block" }}>
                      <span style={{ display: "block", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>
                        Email or username
                      </span>
                      <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@email.com or username" style={fieldStyle} />
                    </label>
                    <label style={{ display: "block" }}>
                      <span style={{ display: "block", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#71717a", marginBottom: 8 }}>
                        Password
                      </span>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" style={fieldStyle} />
                    </label>
                  </>
                )}
                <MagneticButton type="button" className="w-full" disabled={loading} onClick={runEmailAuth}>
                  {loading ? "Securing…" : mode === "signup" ? "Create account" : "Login with email"}
                  <ShieldCheck className="h-4 w-4" />
                </MagneticButton>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                <span style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#52525b" }}>
                  or verify with
                </span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <MagneticButton type="button" variant="secondary" className="w-full px-3" disabled={loading} onClick={() => startSocial("google")} aria-label="Google">
                  <Globe2 className="h-4 w-4" />
                </MagneticButton>
                <MagneticButton type="button" variant="secondary" className="w-full px-3" disabled={loading} onClick={() => startSocial("apple")} aria-label="Apple">
                  <Apple className="h-4 w-4" />
                </MagneticButton>
                <MagneticButton type="button" variant="secondary" className="w-full px-3" disabled={loading} onClick={() => startSocial("github")} aria-label="GitHub">
                  <Code2 className="h-4 w-4" />
                </MagneticButton>
              </div>
            </div>
          )}

          {(step === "otp" || step === "social-otp") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ textAlign: "center", color: "#a1a1aa", fontSize: 14, margin: 0 }}>
                Enter the 6-digit code sent to{" "}
                <span style={{ color: "#22d3ee", fontFamily: "monospace" }}>
                  {step === "otp" ? phone : socialEmail}
                </span>
              </p>
              {devOtp && step === "otp" && (
                <p
                  style={{
                    textAlign: "center",
                    margin: 0,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(34,211,238,0.35)",
                    background: "rgba(34,211,238,0.08)",
                    color: "#a5f3fc",
                    fontSize: 13,
                  }}
                >
                  Local OTP (MySQL):{" "}
                  <span style={{ fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.12em" }}>
                    {devOtp}
                  </span>
                </p>
              )}
              <OtpInput value={otp} onChange={setOtp} disabled={loading} error={Boolean(error)} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <button type="button" onClick={backToForm} style={{ color: "#a1a1aa", background: "none", border: "none", cursor: "pointer" }}>
                  Back
                </button>
                <button
                  type="button"
                  disabled={secondsLeft > 0 || loading}
                  onClick={() => (step === "otp" ? runSendPhoneOtp() : runSocialStart())}
                  style={{ color: secondsLeft > 0 ? "#52525b" : "#22d3ee", background: "none", border: "none", cursor: "pointer" }}
                >
                  {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
                </button>
              </div>
              <MagneticButton
                type="button"
                className="w-full"
                disabled={loading || otp.length !== 6}
                onClick={() => (step === "otp" ? runVerifyPhone() : runVerifySocial())}
              >
                {loading ? "Verifying…" : "Unlock Apex Infinite"}
                <ShieldCheck className="h-4 w-4" />
              </MagneticButton>
            </div>
          )}

          {step === "social-email" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid rgba(168,85,247,0.35)",
                  background: "rgba(168,85,247,0.1)",
                  padding: 14,
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, textTransform: "capitalize" }}>{socialProvider} secure login</p>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#a1a1aa" }}>
                  Enter the email on your social account, then verify with a code.
                </p>
              </div>
              <input
                type="email"
                value={socialEmail}
                onChange={(e) => setSocialEmail(e.target.value)}
                placeholder="email linked to your social account"
                style={fieldStyle}
              />
              <MagneticButton type="button" className="w-full" disabled={loading} onClick={runSocialStart}>
                {loading ? "Sending code…" : "Send verification code"}
                <Lock className="h-4 w-4" />
              </MagneticButton>
              <button type="button" onClick={backToForm} style={{ color: "#71717a", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
                Cancel
              </button>
            </div>
          )}

          {step === "success" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 0" }}>
              <NeuralPulse label="Access granted" />
              <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Welcome to Apex Infinite</p>
            </div>
          )}

          {error ? (
            <p style={{ marginTop: 16, textAlign: "center", color: "#fb7185", fontSize: 14 }}>{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
