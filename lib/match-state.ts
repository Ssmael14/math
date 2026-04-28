// lib/match-state.ts
// Estado puro del ejercicio MATCH (tap-to-pair).
//
// Modelo: hay N grupos (lado izquierdo) y N opciones numéricas (lado derecho).
// El niño tapea un grupo, después una opción → quedan emparejados. Si tapea
// algo que ya está emparejado, lo desempareja. Cuando todos los grupos están
// asignados, devolvemos `complete: true` y los pares para evaluar.

export type MatchState = {
  /** map groupIdx → optionIdx */
  pairs: Record<number, number>;
  /** grupo seleccionado esperando una opción */
  selectedGroup: number | null;
  /** opción seleccionada esperando un grupo */
  selectedOption: number | null;
};

export const INITIAL_MATCH: MatchState = {
  pairs: {},
  selectedGroup: null,
  selectedOption: null,
};

/** Tap en un grupo. */
export function tapGroup(state: MatchState, groupIdx: number): MatchState {
  // Si el grupo ya está emparejado, desemparejarlo.
  if (groupIdx in state.pairs) {
    const next = { ...state.pairs };
    delete next[groupIdx];
    return { ...state, pairs: next, selectedGroup: null, selectedOption: null };
  }
  // Si había una opción seleccionada, emparejar.
  if (state.selectedOption !== null) {
    return commitPair(state, groupIdx, state.selectedOption);
  }
  // Sino, seleccionar este grupo (toggle).
  return {
    ...state,
    selectedGroup: state.selectedGroup === groupIdx ? null : groupIdx,
    selectedOption: null,
  };
}

/** Tap en una opción. */
export function tapOption(state: MatchState, optionIdx: number): MatchState {
  // Si la opción ya está usada en algún par, desemparejar ese par.
  const usedBy = Object.entries(state.pairs).find(([, v]) => v === optionIdx);
  if (usedBy) {
    const next = { ...state.pairs };
    delete next[Number(usedBy[0])];
    return { ...state, pairs: next, selectedGroup: null, selectedOption: null };
  }
  if (state.selectedGroup !== null) {
    return commitPair(state, state.selectedGroup, optionIdx);
  }
  return {
    ...state,
    selectedOption: state.selectedOption === optionIdx ? null : optionIdx,
    selectedGroup: null,
  };
}

function commitPair(state: MatchState, groupIdx: number, optionIdx: number): MatchState {
  const pairs = { ...state.pairs, [groupIdx]: optionIdx };
  return { pairs, selectedGroup: null, selectedOption: null };
}

/** Devuelve true si todos los grupos tienen opción asignada. */
export function isComplete(state: MatchState, totalGroups: number): boolean {
  return Object.keys(state.pairs).length === totalGroups;
}

/** Convierte el estado en el formato que espera evaluateAttempt: [[g, o], …]. */
export function toPairsArray(state: MatchState): number[][] {
  return Object.entries(state.pairs).map(([g, o]) => [Number(g), o]);
}
