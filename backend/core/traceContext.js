import crypto from "crypto";

export function createTrace() {
  return crypto.randomUUID();
}
