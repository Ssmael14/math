// Types compartidos por el runner y los inputs.
// Los kinds son INTERACCIONES, no materias — el mismo MULTIPLE_CHOICE sirve
// para math, reading, science, etc. El `payload.visual` (cuando aplica)
// elige qué dibujar en el área visual.

export type ExerciseKind =
  | "MULTIPLE_CHOICE"
  | "DRAG_DROP"
  | "SORT"
  | "MATCH"
  | "INPUT"
  | "DRAW"
  | "AUDIO"
  | "SPEAK";

export type ExercisePayload = {
  /** Hint al visualizador de qué dibujar (count, subtract, compare, …).
   *  Cuando no está, el visual usa un fallback genérico (texto del prompt). */
  visual?: string;
  [k: string]: unknown;
};

export type ExerciseSolution = {
  answer?: number | string;
  sequence?: (number | string)[];
  pairs?: number[][];
};

export type ExerciseDTO = {
  id: string;
  kind: ExerciseKind;
  prompt: string;
  payload: ExercisePayload;
  solution: ExerciseSolution;
  hints?: string[] | null;
  explanation?: string | null;
  /** Audio pre-generado del enunciado (TTS). Si falta, se usa Web Speech. */
  audioUrl?: string | null;
};
