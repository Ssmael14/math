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
  | "SPEED";

export type ExercisePayload = {
  // COUNT: { item: string, count: number }
  // DRAG:  { a: number, b: number, item: string }
  // SUBTRACT: { total: number, removed: number, item: string }
  // FILL:  { a: number, result: number }
  // TRACE: { digit: number }
  [k: string]: unknown;
};

export type ExerciseSolution = {
  answer?: number;
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
