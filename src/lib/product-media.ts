import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_FILES = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const PUBLIC_PREFIX = "/uploads/products/";

function detectedExtension(buffer: Buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

export async function saveProductImages(formData: FormData) {
  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length > MAX_FILES) throw new Error("حداکثر ۶ تصویر را می‌توانی هم‌زمان بارگذاری کنی.");

  const uploadDirectory = path.join(process.cwd(), "public", "uploads", "products");
  const savedUrls: string[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      await removeManagedProductImages(savedUrls);
      throw new Error(`حجم فایل ${file.name} بیشتر از ۵ مگابایت است.`);
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = detectedExtension(buffer);
    if (!extension) {
      await removeManagedProductImages(savedUrls);
      throw new Error(`فرمت فایل ${file.name} معتبر نیست؛ فقط JPG، PNG و WebP مجاز است.`);
    }
    await mkdir(uploadDirectory, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadDirectory, filename), buffer, { flag: "wx" });
    savedUrls.push(`${PUBLIC_PREFIX}${filename}`);
  }

  return savedUrls;
}

export async function removeManagedProductImages(urls: string[]) {
  await Promise.all(urls.filter((url) => url.startsWith(PUBLIC_PREFIX)).map(async (url) => {
    const filename = path.basename(url);
    if (`${PUBLIC_PREFIX}${filename}` !== url) return;
    try {
      await unlink(path.join(process.cwd(), "public", "uploads", "products", filename));
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : null;
      if (code !== "ENOENT") throw error;
    }
  }));
}
