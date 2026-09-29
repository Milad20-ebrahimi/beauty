import "server-only";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";

const IMAGE_TYPES = new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"],["image/avif","avif"]]);
const VIDEO_TYPES = new Map([["video/mp4","mp4"],["video/webm","webm"]]);
const PREFIX = "/uploads/media/";

export async function saveMediaAsset(file: File) {
  const isImage = IMAGE_TYPES.has(file.type);
  const isVideo = VIDEO_TYPES.has(file.type);
  if (!isImage && !isVideo) throw new Error("TYPE");
  const limit = isVideo ? 30 * 1024 * 1024 : 8 * 1024 * 1024;
  if (!file.size || file.size > limit) throw new Error("SIZE");
  const extension = (isVideo ? VIDEO_TYPES : IMAGE_TYPES).get(file.type)!;
  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads", "media");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  return { url: `${PREFIX}${filename}`, filename, originalName: file.name.slice(0, 180), mimeType: file.type, kind: isVideo ? "VIDEO" : "IMAGE", sizeBytes: file.size };
}

export async function removeMediaFile(url: string) {
  if (!url.startsWith(PREFIX)) return;
  const filename = path.basename(url);
  try { await unlink(path.join(process.cwd(), "public", "uploads", "media", filename)); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
}
