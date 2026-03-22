export interface ParsedCommand {
  name: string;
  args: string;
}

export function parseCommand(raw: string): ParsedCommand | null {
  const text = raw.trim();
  if (!text.startsWith('/')) {
    return null;
  }

  const parts = text.slice(1).split(/\s+/, 2);
  const name = parts[0]?.toLowerCase() ?? '';
  const args = text.slice(1 + name.length).trim();
  if (!name) {
    return null;
  }
  return { name, args };
}
