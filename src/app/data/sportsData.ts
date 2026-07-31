export type Sport = 'all' | 'football' | 'basketball' | 'soccer' | 'baseball' | 'tennis';

export interface LiveMatch {
  id: number;
  sport: Sport;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  time: string;
  status: 'live' | 'halftime' | 'final';
  homeColor: string;
  awayColor: string;
  homeAbbr: string;
  awayAbbr: string;
  homeLogo?: string;
  awayLogo?: string;
  leagueLogo?: string;
  countryLogo?: string;
}

export interface UpcomingMatch {
  id: number;
  sport: Sport;
  league: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  scheduledTime?: string;
  venue?: string;
  homeAbbr: string;
  awayAbbr: string;
  odds?: { home: string; draw?: string; away: string };
  homeLogo?: string;
  awayLogo?: string;
  leagueLogo?: string;
  countryLogo?: string;
  homeColor?: string;
  awayColor?: string;
}

export interface Standing {
  rank: number;
  team: string;
  abbr: string;
  wins: number;
  losses: number;
  draws?: number;
  points: number;
  gf: number;
  ga: number;
  streak: string;
  color: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  time: string;
  readTime: string;
}

// API Sports Widget Configuration (commented out - not valid TypeScript)
// api-sports-widget data-type="config"
// data-key="8673444746a6314a40b74063b51be981"
// data-sport="football"
// data-lang="en"
// data-theme="dark"
// data-show-errors="true"
// data-show-logos="true"
// data-favorite="true"

export const liveMatches: LiveMatch[] = [
  { id: 1, sport: 'football', league: 'NFL', homeTeam: 'Kansas City Chiefs', awayTeam: 'Buffalo Bills', homeScore: 24, awayScore: 21, time: 'Q3 8:42', status: 'live', homeColor: '#E31837', awayColor: '#00338D', homeAbbr: 'KC', awayAbbr: 'BUF' },
  { id: 2, sport: 'basketball', league: 'NBA', homeTeam: 'Los Angeles Lakers', awayTeam: 'Boston Celtics', homeScore: 98, awayScore: 102, time: 'Q4 3:15', status: 'live', homeColor: '#552583', awayColor: '#007A33', homeAbbr: 'LAL', awayAbbr: 'BOS' },
  { id: 3, sport: 'soccer', league: 'Premier League', homeTeam: 'Manchester City', awayTeam: 'Liverpool', homeScore: 2, awayScore: 2, time: '72\'', status: 'live', homeColor: '#6CABDD', awayColor: '#C8102E', homeAbbr: 'MCI', awayAbbr: 'LIV' },
  { id: 4, sport: 'baseball', league: 'MLB', homeTeam: 'New York Yankees', awayTeam: 'Boston Red Sox', homeScore: 5, awayScore: 3, time: 'Top 7th', status: 'live', homeColor: '#003087', awayColor: '#BD3039', homeAbbr: 'NYY', awayAbbr: 'BOS' },
  { id: 5, sport: 'tennis', league: 'ATP Finals', homeTeam: 'C. Alcaraz', awayTeam: 'N. Djokovic', homeScore: 6, awayScore: 4, time: 'Set 2', status: 'live', homeColor: '#FFD700', awayColor: '#1E90FF', homeAbbr: 'ALC', awayAbbr: 'DJO' },
  { id: 6, sport: 'basketball', league: 'NBA', homeTeam: 'Golden State Warriors', awayTeam: 'Phoenix Suns', homeScore: 87, awayScore: 91, time: 'Q3 1:30', status: 'live', homeColor: '#1D428A', awayColor: '#E56020', homeAbbr: 'GSW', awayAbbr: 'PHX' },
  { id: 7, sport: 'soccer', league: 'La Liga', homeTeam: 'Real Madrid', awayTeam: 'Barcelona', homeScore: 1, awayScore: 0, time: 'HT', status: 'halftime', homeColor: '#FEBE10', awayColor: '#A50044', homeAbbr: 'RMA', awayAbbr: 'BAR' },
  { id: 8, sport: 'football', league: 'NFL', homeTeam: 'Dallas Cowboys', awayTeam: 'Philadelphia Eagles', homeScore: 17, awayScore: 20, time: 'Q2 0:45', status: 'live', homeColor: '#003594', awayColor: '#004C54', homeAbbr: 'DAL', awayAbbr: 'PHI' },
  { id: 9, sport: 'basketball', league: 'NBA', homeTeam: 'Milwaukee Bucks', awayTeam: 'Miami Heat', homeScore: 110, awayScore: 105, time: 'Final', status: 'final', homeColor: '#00471B', awayColor: '#98002E', homeAbbr: 'MIL', awayAbbr: 'MIA' },
  { id: 10, sport: 'soccer', league: 'Serie A', homeTeam: 'AC Milan', awayTeam: 'Inter Milan', homeScore: 3, awayScore: 1, time: '88\'', status: 'live', homeColor: '#FB090B', awayColor: '#0068A8', homeAbbr: 'ACM', awayAbbr: 'INT' },
  { id: 11, sport: 'baseball', league: 'MLB', homeTeam: 'LA Dodgers', awayTeam: 'SF Giants', homeScore: 2, awayScore: 4, time: 'Bot 5th', status: 'live', homeColor: '#005A9C', awayColor: '#FD5A1E', homeAbbr: 'LAD', awayAbbr: 'SF' },
  { id: 12, sport: 'tennis', league: 'WTA Finals', homeTeam: 'I. Swiatek', awayTeam: 'A. Sabalenka', homeScore: 3, awayScore: 6, time: 'Set 1', status: 'live', homeColor: '#FF69B4', awayColor: '#8B0000', homeAbbr: 'SWI', awayAbbr: 'SAB' },
  { id: 13, sport: 'football', league: 'NFL', homeTeam: 'San Francisco 49ers', awayTeam: 'Seattle Seahawks', homeScore: 28, awayScore: 24, time: 'Final', status: 'final', homeColor: '#AA0000', awayColor: '#002244', homeAbbr: 'SF', awayAbbr: 'SEA' },
  { id: 14, sport: 'basketball', league: 'NBA', homeTeam: 'Denver Nuggets', awayTeam: 'Oklahoma City Thunder', homeScore: 76, awayScore: 72, time: 'Q2 5:00', status: 'live', homeColor: '#0E2240', awayColor: '#007AC1', homeAbbr: 'DEN', awayAbbr: 'OKC' },
  { id: 15, sport: 'soccer', league: 'Bundesliga', homeTeam: 'Bayern Munich', awayTeam: 'Borussia Dortmund', homeScore: 0, awayScore: 0, time: '15\'', status: 'live', homeColor: '#DC052D', awayColor: '#FDE100', homeAbbr: 'BAY', awayAbbr: 'BVB' },
];

export const upcomingMatches: UpcomingMatch[] = [
  { id: 1, sport: 'football', league: 'NFL', homeTeam: 'Green Bay Packers', awayTeam: 'Chicago Bears', date: 'Mar 8', time: '1:00 PM', venue: 'Lambeau Field', homeAbbr: 'GB', awayAbbr: 'CHI', odds: { home: '-3.5', away: '+3.5' } },
  { id: 2, sport: 'basketball', league: 'NBA', homeTeam: 'Brooklyn Nets', awayTeam: 'New York Knicks', date: 'Mar 7', time: '7:30 PM', venue: 'Barclays Center', homeAbbr: 'BKN', awayAbbr: 'NYK', odds: { home: '+5.5', away: '-5.5' } },
  { id: 3, sport: 'soccer', league: 'Champions League', homeTeam: 'PSG', awayTeam: 'Arsenal', date: 'Mar 9', time: '3:00 PM', venue: 'Parc des Princes', homeAbbr: 'PSG', awayAbbr: 'ARS', odds: { home: '+120', draw: '+240', away: '+180' } },
  { id: 4, sport: 'baseball', league: 'MLB', homeTeam: 'Houston Astros', awayTeam: 'Atlanta Braves', date: 'Mar 7', time: '8:10 PM', venue: 'Minute Maid Park', homeAbbr: 'HOU', awayAbbr: 'ATL', odds: { home: '-140', away: '+120' } },
  { id: 5, sport: 'tennis', league: 'Indian Wells', homeTeam: 'J. Sinner', awayTeam: 'D. Medvedev', date: 'Mar 10', time: '4:00 PM', venue: 'Indian Wells', homeAbbr: 'SIN', awayAbbr: 'MED', odds: { home: '-180', away: '+150' } },
  { id: 6, sport: 'soccer', league: 'Premier League', homeTeam: 'Chelsea', awayTeam: 'Tottenham', date: 'Mar 8', time: '12:30 PM', venue: 'Stamford Bridge', homeAbbr: 'CHE', awayAbbr: 'TOT', odds: { home: '+110', draw: '+220', away: '+200' } },
  { id: 7, sport: 'basketball', league: 'NBA', homeTeam: 'Chicago Bulls', awayTeam: 'Cleveland Cavaliers', date: 'Mar 7', time: '8:00 PM', venue: 'United Center', homeAbbr: 'CHI', awayAbbr: 'CLE', odds: { home: '+4.5', away: '-4.5' } },
  { id: 8, sport: 'football', league: 'NFL', homeTeam: 'Baltimore Ravens', awayTeam: 'Cincinnati Bengals', date: 'Mar 9', time: '4:25 PM', venue: 'M&T Bank Stadium', homeAbbr: 'BAL', awayAbbr: 'CIN', odds: { home: '-6.5', away: '+6.5' } },
];

export const standings: Standing[] = [
  { rank: 1, team: 'Manchester City', abbr: 'MCI', wins: 22, losses: 2, draws: 4, points: 70, gf: 68, ga: 22, streak: 'W5', color: '#6CABDD' },
  { rank: 2, team: 'Arsenal', abbr: 'ARS', wins: 21, losses: 3, draws: 4, points: 67, gf: 62, ga: 24, streak: 'W3', color: '#EF0107' },
  { rank: 3, team: 'Liverpool', abbr: 'LIV', wins: 20, losses: 4, draws: 4, points: 64, gf: 65, ga: 28, streak: 'D1', color: '#C8102E' },
  { rank: 4, team: 'Chelsea', abbr: 'CHE', wins: 17, losses: 5, draws: 6, points: 57, gf: 52, ga: 30, streak: 'W2', color: '#034694' },
  { rank: 5, team: 'Tottenham', abbr: 'TOT', wins: 16, losses: 6, draws: 6, points: 54, gf: 55, ga: 38, streak: 'L1', color: '#132257' },
  { rank: 6, team: 'Newcastle', abbr: 'NEW', wins: 15, losses: 7, draws: 6, points: 51, gf: 48, ga: 32, streak: 'W1', color: '#241F20' },
  { rank: 7, team: 'Aston Villa', abbr: 'AVL', wins: 14, losses: 8, draws: 6, points: 48, gf: 46, ga: 36, streak: 'D2', color: '#670E36' },
  { rank: 8, team: 'Man United', abbr: 'MUN', wins: 13, losses: 9, draws: 6, points: 45, gf: 40, ga: 38, streak: 'L2', color: '#DA291C' },
  { rank: 9, team: 'Brighton', abbr: 'BHA', wins: 12, losses: 9, draws: 7, points: 43, gf: 44, ga: 40, streak: 'W1', color: '#0057B8' },
  { rank: 10, team: 'West Ham', abbr: 'WHU', wins: 11, losses: 10, draws: 7, points: 40, gf: 38, ga: 42, streak: 'L1', color: '#7A263A' },
];

export const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: 'Chiefs Edge Bills in Thriller: Mahomes Delivers Again',
    excerpt: 'Patrick Mahomes threw for 340 yards and 3 touchdowns as the Chiefs rallied in the fourth quarter to secure a dramatic victory.',
    image: 'https://d64gsuwffb70l.cloudfront.net/69a9d92741a5bbac0cda4aca_1772738978954_aa171a90.jpg',
    category: 'NFL',
    author: 'Mike Johnson',
    time: '2 hours ago',
    readTime: '5 min read',
  },
  {
    id: 2,
    title: 'Lakers-Celtics Rivalry Reignited in Instant Classic',
    excerpt: 'A back-and-forth battle between the NBA\'s most storied franchises delivered everything fans hoped for and more.',
    image: 'https://d64gsuwffb70l.cloudfront.net/69a9d92741a5bbac0cda4aca_1772739005315_1e812db7.jpg',
    category: 'NBA',
    author: 'Sarah Williams',
    time: '3 hours ago',
    readTime: '4 min read',
  },
  {
    id: 3,
    title: 'Man City vs Liverpool: Title Race Goes Down to the Wire',
    excerpt: 'A dramatic 2-2 draw at the Etihad keeps the Premier League title race alive with just 10 matches remaining.',
    image: 'https://d64gsuwffb70l.cloudfront.net/69a9d92741a5bbac0cda4aca_1772738979055_b6e81371.jpg',
    category: 'Soccer',
    author: 'James Thompson',
    time: '1 hour ago',
    readTime: '6 min read',
  },
  {
    id: 4,
    title: 'Alcaraz and Djokovic Set for Epic ATP Finals Showdown',
    excerpt: 'The young Spaniard takes on the Serbian legend in what promises to be the match of the tournament.',
    image: 'https://d64gsuwffb70l.cloudfront.net/69a9d92741a5bbac0cda4aca_1772738981966_0c6e2919.png',
    category: 'Tennis',
    author: 'Elena Rodriguez',
    time: '4 hours ago',
    readTime: '3 min read',
  },
  {
    id: 5,
    title: 'Yankees Power Past Red Sox in Bronx Rivalry Clash',
    excerpt: 'Aaron Judge launched two home runs as the Yankees dominated the Red Sox in a lopsided affair at Yankee Stadium.',
    image: 'https://d64gsuwffb70l.cloudfront.net/69a9d92741a5bbac0cda4aca_1772739006482_317eb674.jpg',
    category: 'MLB',
    author: 'Tom Martinez',
    time: '5 hours ago',
    readTime: '4 min read',
  },
  {
    id: 6,
    title: 'El Clasico Preview: Real Madrid Hosts Barcelona',
    excerpt: 'The biggest match in club football returns as Real Madrid and Barcelona face off at the Santiago Bernabeu.',
    image: 'https://d64gsuwffb70l.cloudfront.net/69a9d92741a5bbac0cda4aca_1772738982975_17195e45.png',
    category: 'Soccer',
    author: 'Carlos Mendez',
    time: '6 hours ago',
    readTime: '5 min read',
  },
  {
    id: 7,
    title: 'Warriors Struggle as Suns Surge in Western Conference',
    excerpt: 'Kevin Durant and the Suns continue their hot streak while Golden State searches for answers.',
    image: 'https://d64gsuwffb70l.cloudfront.net/69a9d92741a5bbac0cda4aca_1772739013505_6e6f3d12.png',
    category: 'NBA',
    author: 'David Chen',
    time: '7 hours ago',
    readTime: '4 min read',
  },
  {
    id: 8,
    title: 'Derby della Madonnina: AC Milan Dominates Inter',
    excerpt: 'AC Milan put on a masterclass performance in the Milan derby, winning 3-1 to close the gap in Serie A.',
    image: 'https://d64gsuwffb70l.cloudfront.net/69a9d92741a5bbac0cda4aca_1772739009135_34482c1c.jpg',
    category: 'Soccer',
    author: 'Marco Rossi',
    time: '8 hours ago',
    readTime: '5 min read',
  },
];

export const sportIcons: Record<string, string> = {
  football: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
  basketball: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  soccer: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  baseball: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  tennis: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
};

export interface TopScorer {
  id: number;
  name: string;
  team: string;
  league: string;
  goals: number;
}

export const topScorers: TopScorer[] = [
  { id: 1, name: 'Erling Haaland', team: 'Manchester City', league: 'Premier League', goals: 28 },
  { id: 2, name: 'Harry Kane', team: 'Bayern Munich', league: 'Bundesliga', goals: 26 },
  { id: 3, name: 'Kylian Mbappé', team: 'Real Madrid', league: 'La Liga', goals: 24 },
  { id: 4, name: 'Victor Osimhen', team: 'Napoli', league: 'Serie A', goals: 22 },
  { id: 5, name: 'Mohamed Salah', team: 'Liverpool', league: 'Premier League', goals: 21 },
  { id: 6, name: 'Robert Lewandowski', team: 'Barcelona', league: 'La Liga', goals: 20 },
  { id: 7, name: 'Lautaro Martinez', team: 'Inter Milan', league: 'Serie A', goals: 19 },
  { id: 8, name: 'Bukayo Saka', team: 'Arsenal', league: 'Premier League', goals: 18 },
  { id: 9, name: 'Serge Gnabry', team: 'Bayern Munich', league: 'Bundesliga', goals: 17 },
  { id: 10, name: 'Antoine Griezmann', team: 'Atletico Madrid', league: 'La Liga', goals: 16 },
];

export const featuredMatchStats = {
  possession: { home: 58, away: 42 },
  shots: { home: 14, away: 9 },
  shotsOnTarget: { home: 6, away: 4 },
  corners: { home: 7, away: 3 },
  fouls: { home: 8, away: 12 },
  yellowCards: { home: 1, away: 3 },
  passes: { home: 542, away: 380 },
  passAccuracy: { home: 89, away: 82 },
  timeline: [
    { time: '12\'', event: 'Goal', team: 'home', player: 'E. Haaland', detail: 'Header from close range' },
    { time: '28\'', event: 'Goal', team: 'away', player: 'M. Salah', detail: 'Left-footed strike from edge of box' },
    { time: '34\'', event: 'Yellow Card', team: 'away', player: 'V. van Dijk', detail: 'Tactical foul' },
    { time: '45+2\'', event: 'Goal', team: 'home', player: 'K. De Bruyne', detail: 'Free kick into top corner' },
    { time: '56\'', event: 'Yellow Card', team: 'away', player: 'A. Mac Allister', detail: 'Late challenge' },
    { time: '67\'', event: 'Goal', team: 'away', player: 'D. Nunez', detail: 'Counter-attack finish' },
    { time: '72\'', event: 'Yellow Card', team: 'home', player: 'R. Dias', detail: 'Handball' },
  ],
};
