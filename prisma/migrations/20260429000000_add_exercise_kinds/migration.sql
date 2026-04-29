-- AlterEnum: agregar 4 nuevos valores al enum ExerciseKind.
-- (En Postgres ALTER TYPE ADD VALUE no se puede ejecutar dentro de una
--  transacción junto a otras operaciones, así que va cada uno en su línea
--  fuera de cualquier BEGIN.)
ALTER TYPE "ExerciseKind" ADD VALUE 'COMPARE';
ALTER TYPE "ExerciseKind" ADD VALUE 'PARITY';
ALTER TYPE "ExerciseKind" ADD VALUE 'PATTERN';
ALTER TYPE "ExerciseKind" ADD VALUE 'NEIGHBOR';
