import { z } from "zod";

function normalizeQueryValue(value: unknown) {
  if (Array.isArray(value)) return value[0];
  if (value === "") return undefined;
  return value;
}

export function optionalQueryInt(options?: { min?: number; max?: number }) {
  let schema = z.coerce.number().int();
  if (options?.min !== undefined) schema = schema.min(options.min);
  if (options?.max !== undefined) schema = schema.max(options.max);

  return z.preprocess(normalizeQueryValue, schema.optional());
}

export function requiredQueryInt(options?: { min?: number; max?: number }) {
  let schema = z.coerce.number().int();
  if (options?.min !== undefined) schema = schema.min(options.min);
  if (options?.max !== undefined) schema = schema.max(options.max);

  return z.preprocess(normalizeQueryValue, schema);
}

export function queryIntWithDefault(
  defaultValue: number,
  options?: { min?: number; max?: number },
) {
  let schema = z.coerce.number().int();
  if (options?.min !== undefined) schema = schema.min(options.min);
  if (options?.max !== undefined) schema = schema.max(options.max);

  return z.preprocess(
    (value) => normalizeQueryValue(value) ?? defaultValue,
    schema,
  );
}
