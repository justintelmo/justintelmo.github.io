// Typed structurally so these work on collection entries and on plain test fixtures alike.
type ProjectLike = {
  id: string;
  data: { featured: boolean; order: number };
};

export function sortProjects<P extends ProjectLike>(projects: P[]): P[] {
  return projects.filter((p) => p.data.featured).sort((a, b) => a.data.order - b.data.order);
}

export function projectAnchor(project: ProjectLike): string {
  return `project-${project.id}`;
}

export function projectPath(project: ProjectLike): string {
  return `/games/${project.id}/`;
}

// Neighbors in the order given. The ends don't wrap: jumping from the newest game to the oldest would feel random.
export function adjacentProjects<P extends ProjectLike>(sorted: P[], id: string): { previous?: P; next?: P } {
  const index = sorted.findIndex((p) => p.id === id);
  return { previous: sorted[index - 1], next: sorted[index + 1] };
}

export type ShowcaseLike = ProjectLike & { data: { nda: boolean; images: unknown[] } };

// A game can show its art only when it has shipped and has at least one image.
export function isShowcased(project: ShowcaseLike): boolean {
  return !project.data.nda && project.data.images.length > 0;
}

// The hero's art stack: the first few showcased games, keeping the home page order.
export function heroArt<P extends ShowcaseLike>(sorted: P[], count = 4): P[] {
  return sorted.filter(isShowcased).slice(0, count);
}

// The spotlight carousel: every showcased game, keeping the home page order.
export function spotlightProjects<P extends ShowcaseLike>(sorted: P[]): P[] {
  return sorted.filter(isShowcased);
}
