import { execFile } from 'child_process';

export interface ExecFileResult {
  stdout: string;
  stderr: string;
}

export const execFileSafe = (command: string, args: string[], timeoutMs: number): Promise<ExecFileResult> =>
  new Promise((resolve, reject) => {
    execFile(command, args, { timeout: timeoutMs, windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }

      resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });

