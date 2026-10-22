// Typed structurally so these work on collection entries and on plain test fixtures alike.
type ProjectLike = {
  id: string;
  data: { title: string; featured: boolean; order: number; workedFrom: string; launched?: number | undefined };
};

type JobLike = { id: string; data: { from: string; projectSlugs: string[] } };

export function sortProjects<P extends ProjectLike>(projects: P[]): P[] {
  return projects.filter((p) => p.data.featured).sort((a, b) => a.data.order - b.data.order);
}

export function sortArchive<P extends ProjectLike>(projects: P[]): P[] {
  return [...projects].sort(
    (a, b) => b.data.workedFrom.localeCompare(a.data.workedFrom) || a.data.title.localeCompare(b.data.title),
  );
}

export function archiveYear(project: ProjectLike): number {
  return project.data.launched ?? Number(project.data.workedFrom.slice(0, 4));
}

export function projectAnchor(project: ProjectLike): string {
  return `${project.data.featured ? 'project' : 'archive'}-${project.id}`;
}

export function sortJobs<J extends JobLike>(jobs: J[]): J[] {
  return [...jobs].sort((a, b) => a.data.from.localeCompare(b.data.from));
}

export function resolveJobProjects<P extends ProjectLike>(job: JobLike, projects: P[]): P[] {
  return job.data.projectSlugs.map((slug) => {
    const project = projects.find((p) => p.id === slug);
    if (!project) throw new Error(`Job "${job.id}" lists unknown project "${slug}"`);
    return project;
  });
}
