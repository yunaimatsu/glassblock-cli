import { readFileSync, existsSync } from 'node:fs';
import { PathLike } from 'node:fs';

export const DEFAULT_END_KEYWORDS = new Set(['end', 'done', '終了']);
export const DEFAULT_COLOR_RULES: Record<string, string> = {
  usage: 'yellow_bold',
  warning: 'yellow',
  status: 'blue',
  success: 'green',
  error: 'red_bold',
  default: 'cyan',
  exit: 'dim',
};

export interface ColorConfig {
  enabled: boolean | null;
  rules: Record<string, string>;
}

export interface OrgaiConfig {
  endKeywords: Set<string>;
  color: ColorConfig;
}

function parseTomlArray(text: string, key: string): string[] | null {
  const line = text
    .split(/\r?\n/)
    .find((item) => item.trim().startsWith(`${key} = [`));
  if (!line) return null;
  const match = line.match(/\[(.*)\]/);
  if (!match) return null;
  return match[1]
    .split(',')
    .map((v) => v.trim().replace(/^"|"$/g, ''))
    .filter(Boolean);
}

function parseTomlBoolean(text: string, key: string): boolean | null {
  const line = text
    .split(/\r?\n/)
    .find((item) => item.trim().startsWith(`${key} = `));
  if (!line) return null;
  const value = line.split('=').slice(1).join('=').trim().toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

export function loadConfig(path: PathLike = 'orgai.toml'): OrgaiConfig {
  if (!existsSync(path)) {
    return {
      endKeywords: new Set(DEFAULT_END_KEYWORDS),
      color: { enabled: null, rules: { ...DEFAULT_COLOR_RULES } },
    };
  }

  const payload = readFileSync(path, 'utf-8');
  const keywords = parseTomlArray(payload, 'end_keywords');
  const enabled = parseTomlBoolean(payload, 'enabled');

  return {
    endKeywords: keywords
      ? new Set(keywords.map((v) => v.trim().toLowerCase()).filter(Boolean))
      : new Set(DEFAULT_END_KEYWORDS),
    color: {
      enabled,
      rules: { ...DEFAULT_COLOR_RULES },
    },
  };
}
