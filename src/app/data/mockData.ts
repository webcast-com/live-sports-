export interface Prediction {
  homeWinOdds: number;
  drawOdds: number;
  awayWinOdds: number;
  confidence: number;
}

export interface Match {
  id: string;
  sport: 'football' | 'basketball' | 'cricket';
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'live' | 'finished' | 'upcoming';
  time: string;
  league: string;
  minute?: string;
  prediction?: Prediction;
}

export interface Standing {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  time: string;
  readTime: string;
  image: string;
}

export const mockNewsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'Manchester City Dominates in Champions League Thriller',
    excerpt: 'In a spectacular display of attacking football, Manchester City secured a commanding 4-1 victory over their European rivals.',
    category: 'Champions League',
    author: 'John Smith',
    time: '2 hours ago',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80'
  },
  {
    id: '2',
    title: 'Transfer Window: Liverpool Eyes Star Midfielder',
    excerpt: 'Liverpool is reportedly preparing a record-breaking bid for the talented midfielder as they look to strengthen their squad.',
    category: 'Transfer News',
    author: 'Sarah Johnson',
    time: '4 hours ago',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80'
  },
  {
    id: '3',
    title: 'Arsenal Extends Winning Streak to Seven Matches',
    excerpt: 'The Gunners continue their impressive form with another convincing victory, solidifying their position at the top of the table.',
    category: 'Premier League',
    author: 'Mike Williams',
    time: '6 hours ago',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80'
  },
  {
    id: '4',
    title: 'Chelsea Manager Discusses Squad Rotation Strategy',
    excerpt: 'With a packed fixture schedule ahead, the manager reveals his plans for managing player workload and maintaining performance.',
    category: 'Team News',
    author: 'Emma Davis',
    time: '8 hours ago',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80'
  },
  {
    id: '5',
    title: 'Barcelona Youngster Scores Hat-Trick on Debut',
    excerpt: 'The 19-year-old sensation announced himself on the big stage with a remarkable three-goal performance that has fans excited.',
    category: 'La Liga',
    author: 'Carlos Rodriguez',
    time: '10 hours ago',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80'
  }
];


export const footballMatches: Match[] = [
  {
    id: 'f1',
    sport: 'football',
    homeTeam: 'Manchester City',
    awayTeam: 'Liverpool',
    homeScore: 2,
    awayScore: 2,
    status: 'live',
    time: '15:00',
    league: 'Premier League',
    minute: "78'"
  },
  {
    id: 'f2',
    sport: 'football',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    homeScore: 3,
    awayScore: 1,
    status: 'live',
    time: '15:00',
    league: 'Premier League',
    minute: "65'"
  },
  {
    id: 'f3',
    sport: 'football',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeScore: 2,
    awayScore: 1,
    status: 'finished',
    time: '20:00',
    league: 'La Liga'
  },
  {
    id: 'f4',
    sport: 'football',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    homeScore: 0,
    awayScore: 0,
    status: 'upcoming',
    time: '18:30',
    league: 'Bundesliga'
  },
  {
    id: 'f5',
    sport: 'football',
    homeTeam: 'PSG',
    awayTeam: 'Marseille',
    homeScore: 1,
    awayScore: 0,
    status: 'live',
    time: '17:00',
    league: 'Ligue 1',
    minute: "42'"
  }
];

export const basketballMatches: Match[] = [
  {
    id: 'b1',
    sport: 'basketball',
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    homeScore: 98,
    awayScore: 92,
    status: 'live',
    time: '19:00',
    league: 'NBA',
    minute: 'Q3 5:23'
  },
  {
    id: 'b2',
    sport: 'basketball',
    homeTeam: 'Celtics',
    awayTeam: 'Heat',
    homeScore: 110,
    awayScore: 105,
    status: 'finished',
    time: '19:30',
    league: 'NBA'
  },
  {
    id: 'b3',
    sport: 'basketball',
    homeTeam: 'Bucks',
    awayTeam: 'Nets',
    homeScore: 0,
    awayScore: 0,
    status: 'upcoming',
    time: '20:00',
    league: 'NBA'
  }
];

export const cricketMatches: Match[] = [
  {
    id: 'c1',
    sport: 'cricket',
    homeTeam: 'India',
    awayTeam: 'Australia',
    homeScore: 287,
    awayScore: 145,
    status: 'live',
    time: '09:00',
    league: 'Test Series',
    minute: 'Day 2'
  },
  {
    id: 'c2',
    sport: 'cricket',
    homeTeam: 'England',
    awayTeam: 'New Zealand',
    homeScore: 320,
    awayScore: 298,
    status: 'finished',
    time: '10:30',
    league: 'ODI Series'
  },
  {
    id: 'c3',
    sport: 'cricket',
    homeTeam: 'Pakistan',
    awayTeam: 'South Africa',
    homeScore: 0,
    awayScore: 0,
    status: 'upcoming',
    time: '14:00',
    league: 'T20 Series'
  }
];

export const premierLeagueStandings: Standing[] = [
  { position: 1, team: 'Arsenal', played: 28, won: 21, drawn: 4, lost: 3, goalsFor: 68, goalsAgainst: 24, goalDifference: 44, points: 67 },
  { position: 2, team: 'Manchester City', played: 28, won: 20, drawn: 5, lost: 3, goalsFor: 72, goalsAgainst: 28, goalDifference: 44, points: 65 },
  { position: 3, team: 'Liverpool', played: 28, won: 19, drawn: 6, lost: 3, goalsFor: 65, goalsAgainst: 30, goalDifference: 35, points: 63 },
  { position: 4, team: 'Newcastle', played: 28, won: 16, drawn: 8, lost: 4, goalsFor: 52, goalsAgainst: 28, goalDifference: 24, points: 56 },
  { position: 5, team: 'Manchester United', played: 28, won: 16, drawn: 5, lost: 7, goalsFor: 45, goalsAgainst: 35, goalDifference: 10, points: 53 },
  { position: 6, team: 'Tottenham', played: 28, won: 15, drawn: 6, lost: 7, goalsFor: 54, goalsAgainst: 42, goalDifference: 12, points: 51 },
  { position: 7, team: 'Chelsea', played: 28, won: 13, drawn: 7, lost: 8, goalsFor: 42, goalsAgainst: 35, goalDifference: 7, points: 46 },
  { position: 8, team: 'Brighton', played: 28, won: 12, drawn: 8, lost: 8, goalsFor: 48, goalsAgainst: 38, goalDifference: 10, points: 44 },
];

// Combined export of all matches
export const mockMatches: Match[] = [
  ...footballMatches,
  ...basketballMatches,
  ...cricketMatches
];
export interface Prediction {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  league: string;
  date: string;
  prediction: string;
  odds: string;
  confidence: number;
  isPremium: boolean;
  rationale?: string;
}

export const MOCK_PREDICTIONS: Prediction[] = [
  {
    id: 'p1',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
    league: 'Premier League',
    date: new Date(Date.now() + 3600000 * 2).toISOString(),
    prediction: 'Arsenal Win',
    odds: '1.85',
    confidence: 74,
    isPremium: false,
    rationale: 'Arsenal have won 8 of their last 10 home games and Chelsea are without 3 key defenders.',
  },
  {
    id: 'p2',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
    league: 'La Liga',
    date: new Date(Date.now() + 3600000 * 5).toISOString(),
    prediction: 'Over 2.5 Goals',
    odds: '1.70',
    confidence: 81,
    isPremium: false,
    rationale: 'El Clásico has averaged 3.4 goals over the last 8 meetings.',
  },
  {
    id: 'p3',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Dortmund',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282002%E2%80%932017%29.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
    league: 'Bundesliga',
    date: new Date(Date.now() + 3600000 * 24).toISOString(),
    prediction: 'BTTS',
    odds: '1.95',
    confidence: 78,
    isPremium: true,
    rationale: 'Both teams have scored in 9 of last 10 Der Klassiker meetings.',
  },
  {
    id: 'p4',
    homeTeam: 'PSG',
    awayTeam: 'Marseille',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
    league: 'Ligue 1',
    date: new Date(Date.now() + 3600000 * 30).toISOString(),
    prediction: 'Home Win & Over 1.5',
    odds: '2.10',
    confidence: 85,
    isPremium: true,
    rationale: 'PSG dominate at home against Marseille historically. Expect a comfortable win.',
  },
  {
    id: 'p5',
    homeTeam: 'Man United',
    awayTeam: 'Tottenham',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
    league: 'Premier League',
    date: new Date(Date.now() + 3600000 * 48).toISOString(),
    prediction: 'Draw',
    odds: '3.20',
    confidence: 62,
    isPremium: false,
    rationale: 'Both sides inconsistent this season, a share of the spoils is likely.',
  },
  {
    id: 'p6',
    homeTeam: 'Juventus',
    awayTeam: 'AC Milan',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_icon_%28black%29.svg',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
    league: 'Serie A',
    date: new Date(Date.now() + 3600000 * 72).toISOString(),
    prediction: 'Under 2.5 Goals',
    odds: '1.80',
    confidence: 70,
    isPremium: true,
    rationale: 'Both teams have strong defensive records. This derby typically stays tight.',
  },
];
