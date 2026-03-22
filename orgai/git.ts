import { spawnSync } from 'node:child_process';

export interface GitResult {
  ok: boolean;
  message: string;
  command?: string;
}

function run(command: string[]): [boolean, string] {
  const proc = spawnSync(command[0], command.slice(1), { encoding: 'utf-8' });
  if (proc.status === 0) {
    return [true, (proc.stdout || '').trim() || 'ok'];
  }
  return [false, (proc.stderr || proc.stdout || 'unknown git error').trim()];
}

export function currentBranch(): string {
  const [ok, out] = run(['git', 'rev-parse', '--abbrev-ref', 'HEAD']);
  return ok ? out : 'main';
}

export function createBranch(branch: string): GitResult {
  const [ok, out] = run(['git', 'checkout', '-b', branch]);
  if (ok) {
    return { ok: true, message: `Created and switched to branch ${branch}` };
  }
  return { ok: false, message: `Blocked: failed to create branch: ${out}`, command: `git checkout -b ${branch}` };
}

export function commitMinutes(path: string, topic: string): GitResult {
  const [added, addOut] = run(['git', 'add', path]);
  if (!added) {
    return { ok: false, message: `Blocked: git add failed: ${addOut}`, command: `git add ${path}` };
  }

  const message = `mtg: add minutes for ${topic}`;
  const [committed, commitOut] = run(['git', 'commit', '-m', message]);
  if (!committed) {
    return { ok: false, message: `Blocked: git commit failed: ${commitOut}`, command: `git commit -m "${message}"` };
  }
  return { ok: true, message: commitOut };
}

export function pushBranch(branch: string): GitResult {
  const [ok, out] = run(['git', 'push', '--set-upstream', 'origin', branch]);
  if (ok) {
    return { ok: true, message: out };
  }
  return {
    ok: false,
    message: `Blocked: git push failed (auth or remote issue): ${out}`,
    command: `git push --set-upstream origin ${branch}`,
  };
}
