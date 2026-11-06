import { describe, expect, it } from 'vitest';
import {
  adjacentGames,
  gameAnchor,
  gamePath,
  heroArt,
  sortGames,
  spotlightGames,
} from '../../src/lib/games';

type Fixture = { title: string; featured: boolean; order: number; workedFrom: string; launched?: number; nda?: boolean; images?: unknown[] };
const game = (id: string, { nda = false, images = [{}], ...rest }: Fixture) => ({ id, data: { ...rest, nda, images } });

const casino = game('big-fish-casino', { title: 'Big Fish Casino', featured: true, order: 3, workedFrom: '2013-06' });
const bingo = game('big-fish-bingo', { title: 'Big Fish Bingo', featured: false, order: 0, workedFrom: '2013-06', launched: 2014 });
const pirates = game('battle-pirates', { title: 'Battle Pirates', featured: true, order: 2, workedFrom: '2016-03' });
const games = [casino, bingo, pirates];

const dmp = game('dead-mans-party', { title: "Dead Man's Party", featured: true, order: 1, workedFrom: '2025-03' });
const unreleased = game('tgb-unreleased', { title: 'Unreleased', featured: true, order: 0, workedFrom: '2025-03', nda: true });
const storyloom = game('storyloom', { title: 'StoryLoom', featured: true, order: 2, workedFrom: '2024-01' });
const covet = game('covet-fashion', { title: 'Covet Fashion', featured: true, order: 3, workedFrom: '2019-01' });
const noImage = game('no-image', { title: 'No Image', featured: true, order: 4, workedFrom: '2018-01', images: [] });

describe('sortGames', () => {
  it('keeps featured games only, by order', () => {
    expect(sortGames(games).map((p) => p.id)).toEqual(['battle-pirates', 'big-fish-casino']);
  });
});

describe('gameAnchor', () => {
  it('points every game at its card', () => {
    expect(gameAnchor(pirates)).toBe('project-battle-pirates');
    expect(gameAnchor(bingo)).toBe('project-big-fish-bingo');
  });
});

describe('gamePath', () => {
  it('points every game at its page', () => {
    expect(gamePath(pirates)).toBe('/games/battle-pirates/');
  });
});

describe('adjacentGames', () => {
  const sorted = [pirates, casino, bingo];

  it('returns the games on either side', () => {
    expect(adjacentGames(sorted, 'big-fish-casino')).toEqual({ previous: pirates, next: bingo });
  });

  it('does not wrap past the first or last game', () => {
    expect(adjacentGames(sorted, 'battle-pirates')).toEqual({ previous: undefined, next: casino });
    expect(adjacentGames(sorted, 'big-fish-bingo')).toEqual({ previous: casino, next: undefined });
  });
});

describe('heroArt', () => {
  it('keeps the first four released games with images, in order', () => {
    const ids = heroArt([dmp, unreleased, storyloom, covet, noImage, pirates, casino]).map((p) => p.id);
    expect(ids).toEqual(['dead-mans-party', 'storyloom', 'covet-fashion', 'battle-pirates']);
  });
  it('returns fewer when fewer qualify', () => {
    expect(heroArt([unreleased, dmp]).map((p) => p.id)).toEqual(['dead-mans-party']);
  });
});

describe('spotlightGames', () => {
  it('keeps every released game with an image, in order', () => {
    expect(spotlightGames([dmp, unreleased, storyloom, noImage, covet]).map((p) => p.id))
      .toEqual(['dead-mans-party', 'storyloom', 'covet-fashion']);
  });
});
