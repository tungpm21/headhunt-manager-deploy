const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46];
const DOC_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0];
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];
const JPG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46];
const SIGNATURE_READ_BYTES = 12;

type SupportedMimeType =
  | "application/pdf"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "image/jpeg"
  | "image/png"
  | "image/webp";

const SIGNATURE_VALIDATORS: Record<
  SupportedMimeType,
  (bytes: Uint8Array) => boolean
> = {
  "application/pdf": (bytes) => hasPrefix(bytes, PDF_SIGNATURE),
  "application/msword": (bytes) => hasPrefix(bytes, DOC_SIGNATURE),
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (
    bytes
  ) => hasPrefix(bytes, ZIP_SIGNATURE),
  "image/jpeg": (bytes) => hasPrefix(bytes, JPG_SIGNATURE),
  "image/png": (bytes) => hasPrefix(bytes, PNG_SIGNATURE),
  "image/webp": (bytes) =>
    hasPrefix(bytes, RIFF_SIGNATURE) && readAscii(bytes, 8, 4) === "WEBP",
};

function hasPrefix(bytes: Uint8Array, signature: number[]) {
  if (bytes.length < signature.length) {
    return false;
  }

  return signature.every((value, index) => bytes[index] === value);
}

function readAscii(bytes: Uint8Array, start: number, length: number) {
  if (bytes.length < start + length) {
    return "";
  }

  return String.fromCharCode(...bytes.slice(start, start + length));
}

export async function validateFileSignature(
  file: File,
  allowedTypes: readonly string[]
) {
  if (!allowedTypes.includes(file.type)) {
    return false;
  }

  const validator = SIGNATURE_VALIDATORS[file.type as SupportedMimeType];

  if (!validator) {
    return false;
  }

  const bytes = new Uint8Array(
    await file.slice(0, SIGNATURE_READ_BYTES).arrayBuffer()
  );

  return validator(bytes);
}
