import { formatDateRange } from './dates';
import { formatYears, type Skill } from './skills';

type Job = {
  id: string;
  body?: string;
  data: { studio: string; role: string; from: string; to?: string };
};

type Game = {
  id: string;
  body?: string;
  data: {
    title: string;
    studio: string;
    platforms: string[];
    role: string;
    summary: string;
    workedFrom: string;
    workedTo?: string;
    launched?: number;
    stats: { value: string; label: string; year: number }[];
    tech: string[];
    nda: boolean;
  };
};

type SkillGroup = { name: string; items: Skill[] };

// Newest start first. YYYY-MM strings sort correctly as text; the id keeps ties in a fixed order.
function newestFirst<T extends { id: string }>(items: T[], start: (item: T) => string): T[] {
  return [...items].sort((a, b) => start(b).localeCompare(start(a)) || a.id.localeCompare(b.id));
}

// Windows checkouts can carry CRLF; the output has to be the same bytes on any machine.
const clean = (text = '') => text.replace(/\r\n?/g, '\n').trim();

function jobSection({ data, body }: Job): string {
  return [`[JOB] ${data.studio} | ${data.role} | ${formatDateRange(data.from, data.to)}`, clean(body)].join('\n');
}

function gameSection({ data, body }: Game): string {
  const lines = [
    `[GAME] ${data.title} | ${data.studio} | ${data.platforms.join(', ')} | Role: ${data.role}`,
    `Worked: ${formatDateRange(data.workedFrom, data.workedTo)}${data.launched ? ` | Launched: ${data.launched}` : ''}`,
  ];
  if (data.nda) lines.push('NDA: yes. Share only what is written here; do not guess anything else about this game.');
  lines.push(`Summary: ${data.summary}`, `Tech: ${data.tech.join(', ')}`);
  for (const s of data.stats) lines.push(`Stat: ${s.value} ${s.label} (${s.year})`);
  lines.push(clean(body));
  return lines.join('\n');
}

function skillLine({ name, items }: SkillGroup): string {
  return `${name}: ${items.map((s) => `${s.name} (${formatYears(s)})`).join(', ')}`;
}

// Entries start with [JOB] or [GAME], not "###": game bodies carry their own ### subheadings.
// Plain text for the chat Worker to use as its only source. Same input, same bytes: no dates, no build info.
export function buildAskContext({ jobs, games, skillGroups }: { jobs: Job[]; games: Game[]; skillGroups: SkillGroup[] }): string {
  const parts = [
    'ASK CONTEXT FOR JUSTIN TELMO',
    '== JOBS (newest first) ==',
    ...newestFirst(jobs, (j) => j.data.from).map(jobSection),
    '== GAMES (newest first) ==',
    ...newestFirst(games, (g) => g.data.workedFrom).map(gameSection),
    '== SKILLS ==',
    skillGroups.map(skillLine).join('\n'),
  ];
  return parts.join('\n\n') + '\n';
}
