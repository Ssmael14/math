"use client";

import { useMemo, useState } from "react";

export function MoneyInput({
  target,
  coinOptions,
  disabled = false,
  onSubmit,
}: {
  target: number;
  coinOptions: number[];
  disabled?: boolean;
  onSubmit: (value: number) => void;
}) {
  const [coins, setCoins] = useState<number[]>([]);
  const total = useMemo(() => coins.reduce((sum, coin) => sum + coin, 0), [coins]);
  const options = useMemo(
    () => [...new Set(coinOptions.length ? coinOptions : [1, 2, 5])].sort((a, b) => a - b),
    [coinOptions],
  );

  function addCoin(value: number) {
    if (disabled) return;
    setCoins((current) => [...current, value]);
  }

  function removeCoin(index: number) {
    if (disabled) return;
    setCoins((current) => current.filter((_, i) => i !== index));
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-[10px] font-black uppercase tracking-widest text-ink-mute">
          ARMA LA CANTIDAD
        </div>
        <div className="font-fredoka text-5xl font-bold text-sky">S/{target}</div>
      </div>

      <div className="min-h-36 w-full rounded-3xl border-4 border-dashed border-sun/50 bg-sun-soft/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-black uppercase tracking-widest text-ink-soft">Tu monedero</div>
          <div className="font-fredoka text-2xl font-bold text-ink">S/{total}</div>
        </div>
        <div className="flex min-h-20 flex-wrap justify-center gap-2">
          {coins.length === 0 ? (
            <span className="self-center text-sm font-bold text-ink-mute">toca monedas para agregarlas</span>
          ) : (
            coins.map((coin, index) => (
              <button
                key={`${coin}-${index}`}
                type="button"
                disabled={disabled}
                onClick={() => removeCoin(index)}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-sun-soft font-fredoka text-lg font-bold text-ink shadow-[var(--shadow-chunky-sm)]"
                aria-label={`Quitar moneda de ${coin} soles`}
              >
                S/{coin}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="grid w-full grid-cols-3 gap-3">
        {options.map((coin) => (
          <button
            key={coin}
            type="button"
            disabled={disabled}
            onClick={() => addCoin(coin)}
            className="btn-chunky flex h-20 items-center justify-center rounded-full border-4 border-white bg-sun-soft font-fredoka text-xl font-bold text-ink"
            style={{ boxShadow: "var(--shadow-chunky-sm)" }}
          >
            S/{coin}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={disabled || coins.length === 0}
        onClick={() => onSubmit(total)}
        className={`btn-chunky w-full rounded-full px-6 py-3 text-sm font-black uppercase tracking-wide ${
          coins.length === 0 ? "bg-ink-mute/20 text-ink-mute" : "bg-mint text-white"
        }`}
        style={{ boxShadow: coins.length === 0 ? undefined : "0 4px 0 rgba(0,0,0,0.2)" }}
      >
        Listo: S/{total}
      </button>
    </div>
  );
}
