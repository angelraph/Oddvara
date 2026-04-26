import { normalizeTeamName } from '@/data/teamMappings';
import { detectMarketFromText } from '@/data/marketMappings';
import type { BetSelection } from '@/types';

export function normalizeSelection(selection: BetSelection): BetSelection {
  return {
    ...selection,
    homeTeamNormalized: normalizeTeamName(selection.homeTeam),
    awayTeamNormalized: normalizeTeamName(selection.awayTeam),
  };
}

export function buildSearchQuery(selection: BetSelection): string {
  const home = selection.homeTeamNormalized || selection.homeTeam;
  const away = selection.awayTeamNormalized || selection.awayTeam;
  if (home === 'Unknown' && away === 'Unknown') return selection.market;
  return `${home} vs ${away}`;
}
