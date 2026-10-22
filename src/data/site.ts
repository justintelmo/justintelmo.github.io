export type SiteLink = {
  label: string;
  href: string;
  icon: 'email' | 'linkedin' | 'github' | 'resume';
};

export const site = {
  name: 'Justin Telmo',
  // DRAFT
  tagline: 'Senior back-end and full-stack engineer. I build the servers and tools behind games people play.',
  // DRAFT
  facts: ['13+ years in games', 'PHP, Kotlin, TypeScript', 'AWS and Docker'],
  links: [
    { label: 'Email', href: 'mailto:justin.telmo@gmail.com', icon: 'email' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/justin-telmo', icon: 'linkedin' },
    { label: 'GitHub', href: 'https://github.com/justintelmo', icon: 'github' },
    { label: 'Resume', href: '/resume.pdf', icon: 'resume' },
  ] satisfies SiteLink[],
};
