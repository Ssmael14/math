// Tipos compartidos de la app. Importa desde aquí en componentes.
export type { User, Child, Unit, Lesson, Exercise, Attempt, Progress, ExerciseKind } from "@prisma/client";

// Payloads por tipo de ejercicio
export type CountPayload    = { item: string; count: number };
export type MatchPayload    = { groups: { item: string; count: number }[]; options: number[] };
export type FillPayload     = { a: number; result: number; options: number[] };
export type DragPayload     = { a: number; b: number; item: string };
export type SubtractPayload = { total: number; removed: number; item: string };
export type TracePayload    = { digit: number };
export type OrderPayload    = { numbers: number[] };
