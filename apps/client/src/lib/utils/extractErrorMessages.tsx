import { FieldErrors } from "react-hook-form";

function isPlainObject(value: unknown): value is Record<string, any> {
  return (
    value !== null &&
    typeof value === "object" &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
}

export function extractErrorMessages(
  errors: FieldErrors,
  prefix: string[] = [],
  visited = new WeakSet()
): string[] {

  console.log({errors},isPlainObject(errors))
  if (!isPlainObject(errors)) return [];

  if (visited.has(errors)) return [];
  visited.add(errors);

  let messages: string[] = [];

  for (const key in errors) {
    const value = (errors as any)[key];

    // Case 1: direct error message
    if (value?.message) {
      messages.push(`${[...prefix, key].join(".")}: ${value.message}`);
    }

    if (Array.isArray(value)) {
      for (const err of value) {
        if (!!err && "message" in err) {
          messages.push(`${[...prefix, key].join(".")}: ${err.message}`);
        }
      }
      return messages
    }

    // Case 2: nested plain object (skip DOM objects like CSSStyleSheet, HTMLElement, etc.)
    if (isPlainObject(value)) {
      messages = messages.concat(
        extractErrorMessages(value as FieldErrors, [...prefix, key], visited)
      );
    }
  }

  return messages;
}
