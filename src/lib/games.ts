// Typed structurally so these work on collection entries and on plain test fixtures alike.
type GameLike = {
  id: string;
  data: { featured: boolean; order: number };
};

export function sortGames<P extends GameLike>(games: P[]): P[] {
  return games.filter((p) => p.data.featured).sort((a, b) => a.data.order - b.data.order);
}

export function gameAnchor(game: GameLike): string {
  return `project-${game.id}`;
}

export function gamePath(game: GameLike): string {
  return `/games/${game.id}/`;
}

// Neighbors in the order given. The ends don't wrap: jumping from the newest game to the oldest would feel random.
export function adjacentGames<P extends GameLike>(sorted: P[], id: string): { previous?: P; next?: P } {
  const index = sorted.findIndex((p) => p.id === id);
  return { previous: sorted[index - 1], next: sorted[index + 1] };
}

export type ShowcaseLike = GameLike & { data: { nda: boolean; images: unknown[] } };

// A game can show its art only when it has shipped and has at least one image.
export function isShowcased(game: ShowcaseLike): boolean {
  return !game.data.nda && game.data.images.length > 0;
}

// The hero's art stack: the first few showcased games, keeping the home page order.
export function heroArt<P extends ShowcaseLike>(sorted: P[], count = 4): P[] {
  return sorted.filter(isShowcased).slice(0, count);
}

// The spotlight carousel: every showcased game, keeping the home page order.
export function spotlightGames<P extends ShowcaseLike>(sorted: P[]): P[] {
  return sorted.filter(isShowcased);
}
