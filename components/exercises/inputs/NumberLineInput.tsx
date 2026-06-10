"use client";

import { useMemo, useState } from "react";

export function NumberLineInput({
  sequence,
  choices,
  disabled = false,
  onSubmit,
}: {
  sequence: Array<number | null>;
  choices: number[];
  disabled?: boolean;
  onSubmit: (value: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const display = useMemo(
    () => sequence.map((value) => (value === null ? selected : value)),
    [sequence, selected],
  );

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-5">
      <div className="w-full overflow-x-auto pb-2">
        <div className="mx-auto flex min-w-max items-center justify-center gap-2 px-2">
          {display.map((value, index) => {
            const missing = sequence[index] === null;
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl border-4 font-fredoka text-3xl font-bold shadow-[var(--shadow-chunky-sm)] ${
                    missing
                      ? selected === null
                        ? "border-dashed border-sky/50 bg-sky-soft text-sky"
                        : "border-sky bg-white text-sky"
                      : "border-white bg-sun-soft text-ink"
                  }`}
                >
                  {value ?? "?"}
                </div>
                {index < display.length - 1 && (
                  <span className="font-fredoka text-2xl font-bold text-ink-mute" aria-hidden>
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[10px] font-black uppercase tracking-widest text-ink-mute">
        TOCA EL NÚMERO QUE FALTA
      </div>

      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {choices.map((choice) => {
          const active = selected === choice;
          return (
            <button
              key={choice}
              type="button"
              disabled={disabled}
              onClick={() => setSelected(choice)}
              aria-pressed={active}
              className={`btn-chunky rounded-2xl border-2 px-4 py-5 font-fredoka text-3xl font-bold transition-colors ${
                active ? "border-sky bg-sky-soft text-sky" : "border-ink/10 bg-white text-ink"
              }`}
              style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            >
              {choice}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={disabled || selected === null}
        onClick={() => selected !== null && onSubmit(selected)}
        className={`btn-chunky w-full rounded-full px-6 py-3 text-sm font-black uppercase tracking-wide ${
          selected === null ? "bg-ink-mute/20 text-ink-mute" : "bg-mint text-white"
        }`}
        style={{ boxShadow: selected === null ? undefined : "0 4px 0 rgba(0,0,0,0.2)" }}
      >
        Listo
      </button>
    </div>
  );
}
