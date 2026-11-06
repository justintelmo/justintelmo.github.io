import type { Skill } from '../lib/skills';

export const skillGroups: { name: string; items: Skill[] }[] = [
  {
    name: 'Languages',
    items: [
      { name: 'C#', years: 3 },
      { name: 'TypeScript', years: 3, plus: true },
      { name: 'JavaScript', years: 5, plus: true },
      { name: 'Kotlin', years: 2 },
      { name: 'PHP', years: 6 },
      { name: 'C++', years: 1 },
      { name: 'Python', years: 1 },
    ],
  },
  {
    name: 'Frameworks',
    items: [
      { name: 'Laravel', years: 1 },
      { name: 'Symfony', years: 1 },
      { name: 'Spring Boot', years: 1 },
      { name: 'Ktor', years: 1 },
      { name: 'Node.js', years: 3, plus: true },
      { name: 'React', years: 3, plus: true },
      { name: 'Unity', years: 4 },
    ],
  },
  {
    name: 'Data',
    items: [
      { name: 'MySQL', years: 5, plus: true },
      { name: 'Redis', years: 5, plus: true },
      { name: 'Memcached', years: 5, plus: true },
    ],
  },
  {
    name: 'Infrastructure',
    items: [
      { name: 'AWS', years: 5, plus: true },
      { name: 'Docker', years: 5, plus: true },
      { name: 'Jenkins', years: 5, plus: true },
      { name: 'GitLab CI', years: 3, plus: true },
    ],
  },
];
