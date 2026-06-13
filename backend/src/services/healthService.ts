import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "../..");

export type BackendTestsResult = {
  ok: boolean;
  summary: string;
};

function extractVitestSummary(output: string) {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const testFiles = lines.find((line) => line.startsWith("Test Files"));
  const tests = lines.find((line) => line.startsWith("Tests"));

  if (testFiles && tests) return `${testFiles} | ${tests}`;
  return lines.at(-1) ?? "Aucun detail disponible";
}

export async function runBackendTests(): Promise<BackendTestsResult> {
  try {
    const { stdout, stderr } = await execFileAsync("npm", ["test"], {
      cwd: backendRoot,
      timeout: 120_000,
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        HEALTH_CHECK_RUNNING_BACKEND_TESTS: "1",
      },
    });

    return {
      ok: true,
      summary: extractVitestSummary(`${stdout}\n${stderr}`),
    };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    const output = `${err.stdout ?? ""}\n${err.stderr ?? ""}`.trim();

    return {
      ok: false,
      summary: output ? extractVitestSummary(output) : err.message ?? "Tests KO",
    };
  }
}
