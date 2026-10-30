export type SiteLink = {
  label: string;
  href: string;
  icon: 'email' | 'linkedin' | 'github' | 'resume';
};

export const site = {
  name: 'Justin Telmo',
  tagline: 'Senior back-end and full-stack engineer. I build the features and tools for games people play.',
  facts: ['13+ years in games', 'C#, TypeScript, PHP', 'AWS and Docker'],
  about:
    "I am a senior software engineer who has spent over 13 years in the games industry building services and pipelines to support games spanning different genres, scales, and audiences.",
  contactNote: 'The best way to get ahold of me is via LinkedIn, but I also check my emails!',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/justin-telmo', icon: 'linkedin' },
    { label: 'Email', href: 'mailto:justin.telmo@gmail.com', icon: 'email' },
    { label: 'GitHub', href: 'https://github.com/justintelmo', icon: 'github' },
    { label: 'Resume', href: '/resume.pdf', icon: 'resume' },
  ] satisfies SiteLink[],
};
