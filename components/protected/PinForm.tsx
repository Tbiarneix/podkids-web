"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

type PinFormProps = {
  mode?: "create" | "update";
  onSubmit?: (pin: string) => void;
};

const LENGTH = 5;

export default function PinForm({ mode = "create", onSubmit }: PinFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [current, setCurrent] = useState<string[]>(Array.from({ length: LENGTH }, () => ""));
  const [pin, setPin] = useState<string[]>(Array.from({ length: LENGTH }, () => ""));
  const [confirm, setConfirm] = useState<string[]>(Array.from({ length: LENGTH }, () => ""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams?.get("redirect") || "/protected";

  const inputsCurrent = useRef<Array<HTMLInputElement | null>>([]);
  const inputsPin = useRef<Array<HTMLInputElement | null>>([]);
  const inputsConfirm = useRef<Array<HTMLInputElement | null>>([]);

  const title = mode === "create" ? "Définissez votre code PIN" : "Modifiez votre code PIN";
  const cta = mode === "create" ? "Créer" : "Mettre à jour";

  const isComplete = useMemo(() => {
    const base = pin.every(Boolean) && confirm.every(Boolean);
    return mode === "update" ? base && current.every(Boolean) : base;
  }, [pin, confirm, current, mode]);
  const matches = useMemo(() => pin.join("") === confirm.join(""), [pin, confirm]);

  function handleChange(index: number, value: string, which: "current" | "pin" | "confirm") {
    const v = value.replace(/\D/g, "");
    if (v.length === 0) return;
    const next = which === "pin" ? [...pin] : which === "confirm" ? [...confirm] : [...current];
    next[index] = v[v.length - 1];
    if (which === "pin") setPin(next);
    else if (which === "confirm") setConfirm(next);
    else setCurrent(next);

    const refArray =
      which === "pin"
        ? inputsPin.current
        : which === "confirm"
          ? inputsConfirm.current
          : inputsCurrent.current;
    if (index < LENGTH - 1) {
      refArray[index + 1]?.focus();
    } else {
      if (which === "current") inputsPin.current[0]?.focus();
      else if (which === "pin") inputsConfirm.current[0]?.focus();
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    which: "current" | "pin" | "confirm",
  ) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = which === "pin" ? [...pin] : which === "confirm" ? [...confirm] : [...current];
      if (next[index]) {
        next[index] = "";
        if (which === "pin") setPin(next);
        else if (which === "confirm") setConfirm(next);
        else setCurrent(next);
        return;
      }
      if (index > 0) {
        const refArray =
          which === "pin"
            ? inputsPin.current
            : which === "confirm"
              ? inputsConfirm.current
              : inputsCurrent.current;
        refArray[index - 1]?.focus();
        const prev = which === "pin" ? [...pin] : which === "confirm" ? [...confirm] : [...current];
        prev[index - 1] = "";
        if (which === "pin") setPin(prev);
        else if (which === "confirm") setConfirm(prev);
        else setCurrent(prev);
      }
    }
  }

  function handlePaste(
    e: React.ClipboardEvent<HTMLInputElement>,
    which: "current" | "pin" | "confirm",
  ) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!text) return;
    e.preventDefault();
    const arr = Array.from({ length: LENGTH }, (_, i) => text[i] ?? "");
    if (which === "current") {
      setCurrent(arr);
      inputsPin.current[0]?.focus();
    } else if (which === "pin") {
      setPin(arr);
      inputsConfirm.current[0]?.focus();
    } else {
      setConfirm(arr);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isComplete) {
      setError("Veuillez saisir les 2 codes PIN complets.");
      return;
    }
    if (!matches) {
      setError("Les codes PIN ne correspondent pas.");
      return;
    }
    const pinStr = pin.join("");
    const currentStr = current.join("");
    if (onSubmit) {
      onSubmit(pinStr);
      return;
    }
    setLoading(true);
    fetch("/api/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pin: pinStr,
        ...(mode === "update" ? { currentPin: currentStr } : {}),
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Erreur inconnue");
        }
        toast.success(mode === "create" ? "Code PIN créé" : "Code PIN mis à jour");
        router.push(redirectTo);
      })
      .catch((err: unknown) => {
        const code = err instanceof Error ? err.message : "unknown";
        const map: Record<string, string> = {
          invalid_current_pin: "Le code PIN actuel est incorrect.",
          current_pin_required: "Veuillez saisir votre code PIN actuel.",
          invalid_pin: "Le nouveau code PIN doit comporter exactement 5 chiffres.",
          invalid_json: "Requête invalide.",
          not_authenticated: "Vous devez être connecté pour effectuer cette action.",
          unknown: "Une erreur est survenue.",
        };
        const friendly = map[code] ?? "Une erreur est survenue.";
        setError(friendly);
        toast.error(friendly);
      })
      .finally(() => setLoading(false));
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-xl bg-background">
      <div className="space-y-8">
        <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">{title}</h2>

        {mode === "update" && (
          <fieldset className="space-y-3">
            <legend className="text-sm text-foreground">Code PIN actuel</legend>
            <PinInputs
              refArray={inputsCurrent}
              values={current}
              which="current"
              groupLabel="Code PIN actuel"
              onChange={(i, v) => handleChange(i, v, "current")}
              onKeyDown={(e, i) => handleKeyDown(e, i, "current")}
              onPaste={(e) => handlePaste(e, "current")}
            />
          </fieldset>
        )}

        <fieldset className="space-y-3">
          <legend className="text-sm text-foreground">Nouveau code PIN</legend>
          <PinInputs
            refArray={inputsPin}
            values={pin}
            which="pin"
            groupLabel="Nouveau code PIN"
            onChange={(i, v) => handleChange(i, v, "pin")}
            onKeyDown={(e, i) => handleKeyDown(e, i, "pin")}
            onPaste={(e) => handlePaste(e, "pin")}
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm text-foreground">Confirmez votre code PIN</legend>
          <PinInputs
            refArray={inputsConfirm}
            values={confirm}
            which="confirm"
            groupLabel="Confirmation du code PIN"
            onChange={(i, v) => handleChange(i, v, "confirm")}
            onKeyDown={(e, i) => handleKeyDown(e, i, "confirm")}
            onPaste={(e) => handlePaste(e, "confirm")}
          />
        </fieldset>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <Button type="submit" size="xl" className="w-full" disabled={loading}>
          {loading ? "Veuillez patienter…" : cta}
        </Button>
      </div>
    </form>
  );
}

function PinInputs(props: {
  values: string[];
  refArray: React.MutableRefObject<Array<HTMLInputElement | null>>;
  which: "current" | "pin" | "confirm";
  groupLabel: string;
  onChange: (index: number, value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}) {
  const { values, refArray, which, groupLabel, onChange, onKeyDown, onPaste } = props;
  return (
    <div className="flex items-center justify-center gap-3">
      {values.map((val, i) => {
        const inputId = `pin-${which}-input-${i}`;
        return (
          <div key={i} className="flex flex-col items-center">
            <label
              htmlFor={inputId}
              className="sr-only"
            >{`${groupLabel} · Chiffre ${i + 1}`}</label>
            <input
              ref={(el) => {
                refArray.current[i] = el;
              }}
              id={inputId}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={1}
              value={val}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              onPaste={onPaste}
              className="h-14 w-12 rounded-md bg-input text-center text-xl font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:h-16 md:w-14 md:text-2xl"
            />
          </div>
        );
      })}
    </div>
  );
}
