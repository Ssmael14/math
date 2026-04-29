// Types compartidos por ExerciseRenderer / OptionsGrid / HintPanel.
// Vive en components/exercises porque es el contrato que une presentación
// con LessonRunner.

export type ExerciseKind =
  | "DRAG"
  | "SUBTRACT"
  | "COUNT"
  | "MATCH"
  | "FILL"
  | "TRACE"
  | "ORDER"
  | "SPEED"
  | "COMPARE"
  | "PARITY"
  | "PATTERN"
  | "NEIGHBOR";

export type ExercisePayload = {
  // COUNT:    { item: string, count: number }
  // DRAG:     { a: number, b: number, item: string }
  // SUBTRACT: { total: number, removed: number, item: string }
  // FILL:     { a: number, result: number }
  // TRACE:    { digit: number }
  // COMPARE:  { left: number, right: number }
  // PARITY:   { value: number }
  // PATTERN:  { visible: number[], step: number }
  // NEIGHBOR: { value: number, direction: "before" | "after" }
  [k: string]: unknown;
};

export type ExerciseSolution = {
  /** number para los kinds numéricos. string para COMPARE ("<"/">"/"=") y
   *  PARITY ("par"/"impar"). */
  answer?: number | string;
  digit?: number;
  order?: number[];
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
};
