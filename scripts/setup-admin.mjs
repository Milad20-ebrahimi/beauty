import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const envPath = new URL("../.env", import.meta.url);
const terminal = createInterface({ input, output });

function setEnvValue(source, name, value) {
  const line = `${name}=${JSON.stringify(value)}`;
  const pattern = new RegExp(`^${name}=.*$`, "m");
  return pattern.test(source) ? source.replace(pattern, line) : `${source.trimEnd()}\n${line}\n`;
}

try {
  const phone = (await terminal.question("شماره موبایل مدیر (مثال 09123456789): ")).trim().replace(/[\s-]/g, "");
  const code = (await terminal.question("یک کد دسترسی حداقل 6 کاراکتری انتخاب کن: ")).trim();

  if (!/^09\d{9}$/.test(phone)) throw new Error("شماره موبایل باید با 09 شروع شود و 11 رقم باشد.");
  if (code.length < 6) throw new Error("کد دسترسی باید حداقل 6 کاراکتر باشد.");

  let env = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  env = setEnvValue(env, "AUTH_SECRET", randomBytes(48).toString("base64url"));
  env = setEnvValue(env, "ADMIN_PHONE", phone);
  env = setEnvValue(env, "ADMIN_ACCESS_CODE", code);
  writeFileSync(envPath, env, "utf8");

  console.log("\nتنظیمات ورود مدیر با موفقیت در .env ذخیره شد.");
  console.log("حالا npm run dev را اجرا کن و به /admin-login برو.");
} catch (error) {
  console.error(`\nخطا: ${error instanceof Error ? error.message : "تنظیمات ذخیره نشد."}`);
  process.exitCode = 1;
} finally {
  terminal.close();
}
