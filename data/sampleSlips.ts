export interface SampleSlip {
  id: string;
  label: string;
  platform: string;
  content: string;
}

export const SAMPLE_SLIPS: SampleSlip[] = [
  {
    id: 'sample-sportybet-raw',
    label: 'SportyBet (Raw Format)',
    platform: 'sportybet',
    content: `SportyBet

1 Arsenal v Chelsea
Full Time Result
1 @ 2.20

2 Barcelona v Real Madrid
Total
Over 2.5 @ 1.85

3 Bayern Munich v Borussia Dortmund
Both Teams to Score
Yes @ 1.70

Total Odds: 7.10
Stake: 1000`,
  },
  {
    id: 'sample-sportybet-1',
    label: 'SportyBet Accumulator',
    platform: 'sportybet',
    content: `SportyBet Booking Code: SB789432

1. Arsenal vs Chelsea
   Full Time Result - Arsenal Win (1)
   Odds: 2.20

2. Barcelona vs Real Madrid
   Over/Under 2.5 - Over 2.5
   Odds: 1.85

3. Bayern Munich vs Borussia Dortmund
   Both Teams to Score - Yes
   Odds: 1.70

4. Liverpool vs Man City
   Full Time Result - Draw (X)
   Odds: 3.50

Total Odds: 24.25
Stake: ₦1,000
Potential Win: ₦24,250`,
  },
  {
    id: 'sample-bet9ja-1',
    label: 'Bet9ja Single',
    platform: 'bet9ja',
    content: `Bet9ja
Booking Code: B9J445521
Date: 26/04/2026

Manchester United v Tottenham Hotspur
1X2: 1 (Man Utd Win)
Odds: 1.95

Total Odds: 1.95
Stake: ₦500`,
  },
  {
    id: 'sample-1xbet-1',
    label: '1xBet Accumulator',
    platform: '1xbet',
    content: `1xBet Booking: 1XNG-2024-ABC

Arsenal - Chelsea
Match Result | 1
Coeff: 2.20

Napoli - Inter Milan
Total | Over(2.5)
Coeff: 1.90

PSG - Bayern Munich
Both Teams to Score | Yes
Coeff: 1.65

Totals Odds: 6.89`,
  },
  {
    id: 'sample-plain-1',
    label: 'Plain Text Slip',
    platform: 'unknown',
    content: `Arsenal to beat Wolves @ 1.75
Man City vs Liverpool - Over 2.5 @ 1.85
Chelsea vs Tottenham - BTTS Yes @ 1.70
Barcelona - Real Madrid: Draw @ 3.80`,
  },
];
