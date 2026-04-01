const MISSING_SECRET_ERROR =
  "EMPLOYER_JWT_SECRET is required for employer authentication.";

export function getEmployerJwtSecret(): Uint8Array {
  const secret = process.env.EMPLOYER_JWT_SECRET?.trim();

  if (!secret) {
    throw new Error(MISSING_SECRET_ERROR);
  }

  return new TextEncoder().encode(secret);
}
