"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { toErrorMessage, useAuth } from "@/components/providers/AuthProvider";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setError("Name must be 2 to 80 characters.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.trim().length === 0) {
      setError("Password cannot be only spaces.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password must be 8 to 128 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({ name: trimmedName, email: trimmedEmail, password });

      if (response.token) {
        router.replace("/dashboard");
        return;
      }

      setSuccess("Registration successful. Please log in.");
      router.replace("/login");
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
      <FormInput
        autoComplete="name"
        label="Name"
        onChange={(event) => setName(event.target.value)}
        placeholder="Alex Carter"
        value={name}
      />
      <FormInput
        autoComplete="email"
        label="Email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        type="email"
        value={email}
      />
      <FormInput
        autoComplete="new-password"
        hint="Minimum 8 characters."
        label="Password"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Create a password"
        type="password"
        value={password}
      />
      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      ) : null}
      <Button className="w-full bg-gradient-to-r from-emerald-300 to-teal-300 shadow-emerald-500/20" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating account..." : "Register"}
      </Button>
    </form>
  );
}

function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
