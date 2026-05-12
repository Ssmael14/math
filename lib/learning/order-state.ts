// lib/order-state.ts
// Estado puro del ejercicio ORDER.
// El niño ve N números desordenados y los tapea en el orden que cree
// correcto. Cada tap mueve el número del "pool" inferior al "slot" superior.
// Tap sobre un número ya elegido lo devuelve al pool.

export type OrderState = {
  /** Los valores ya elegidos, en el orden en que el niño los tapeó. */
  picked: number[];
};

export const INITIAL_ORDER: OrderState = { picked: [] };

/** Tap sobre un número del pool — lo agrega a picked si no está ya. */
export function pick(state: OrderState, value: number): OrderState {
  if (state.picked.includes(value)) return state;
  return { picked: [...state.picked, value] };
}

/** Tap sobre un número ya picked — lo devuelve al pool. */
export function unpick(state: OrderState, value: number): OrderState {
  if (!state.picked.includes(value)) return state;
  return { picked: state.picked.filter((v) => v !== value) };
}

/** Toggle: si está picked, devuélvelo; si no, agrégalo. */
export function toggle(state: OrderState, value: number): OrderState {
  return state.picked.includes(value) ? unpick(state, value) : pick(state, value);
}

export function isComplete(state: OrderState, total: number): boolean {
  return state.picked.length === total;
}
