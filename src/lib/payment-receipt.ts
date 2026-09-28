import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const PUBLIC_PREFIX = "/uploads/receipts/";

function detectedExtension(buffer: Buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

export async function savePaymentReceipt(file: File) {
  if (!file.size) throw new Error("تصویر رسید را انتخاب کن.");
  if (file.size > MAX_FILE_SIZE) throw new Error("حجم رسید نباید بیشتر از ۵ مگابایت باشد.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = detectedExtension(buffer);
  if (!extension) throw new Error("فقط تصویر JPG، PNG یا WebP قابل قبول است.");
  const directory = path.join(process.cwd(), "public", "uploads", "receipts");
  await mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(directory, filename), buffer, { flag: "wx" });
  return `${PUBLIC_PREFIX}${filename}`;
}

export async function removePaymentReceipt(url: string | null | undefined) {
  if (!url?.startsWith(PUBLIC_PREFIX)) return;
  const filename = path.basename(url);
  if (`${PUBLIC_PREFIX}${filename}` !== url) return;
  try { await unlink(path.join(process.cwd(), "public", "uploads", "receipts", filename)); }
  catch (error) { if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error; }
}
