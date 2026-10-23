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
    "I've spent more than 13 years on the parts of games most players never see: the servers, pipelines, and tools that keep them running. I like work that makes a team more efficient.",
  links: [
    { label: 'Email', href: 'mailto:justin.telmo@gmail.com', icon: 'email' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/justin-telmo', icon: 'linkedin' },
    { label: 'GitHub', href: 'https://github.com/justintelmo', icon: 'github' },
    { label: 'Resume', href: '/resume.pdf', icon: 'resume' },
  ] satisfies SiteLink[],
};
