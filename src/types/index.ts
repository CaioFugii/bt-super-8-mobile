export type TournamentStatus = 'DRAFT' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
export type TournamentFormat = 'SUPER_8' | 'SUPER_8_MIXED';
export type Gender = 'MALE' | 'FEMALE';
export type MatchStatus = 'PENDING' | 'FINISHED' | 'WALKOVER' | 'CANCELLED';
export type WinnerTeam = 'TEAM_A' | 'TEAM_B';

export type Organizer = {
  id: string;
  name: string;
  email: string;
  instagramHandle?: string;
};

export type Tournament = {
  id: string;
  name: string;
  description?: string;
  date: string;
  location?: string;
  logoUrl?: string;
  format: TournamentFormat;
  status: TournamentStatus;
  scoreLimit: 4 | 6;
  hasTieBreak: boolean;
  walkoverScoreWinner: number;
  walkoverScoreLoser: number;
  courtCount: number;
  enableForfeitChallenge: boolean;
  forfeitChallengeMode?: 'RANDOM' | 'CUSTOM';
  customChallenges?: string[];
};

export type Participant = {
  id: string;
  tournamentId: string;
  name: string;
  gender?: Gender;
  phone?: string;
  instagram?: string;
  photoUrl?: string;
  notes?: string;
  status: 'ACTIVE' | 'WITHDRAWN';
  withdrawnAt?: string;
};

export type ParticipantSummary = {
  id: string;
  name: string;
};

export type Match = {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  courtNumber?: number;
  teamA: { player1: ParticipantSummary; player2: ParticipantSummary };
  teamB: { player1: ParticipantSummary; player2: ParticipantSummary };
  teamAScore?: number;
  teamBScore?: number;
  winnerTeam?: WinnerTeam;
  status: MatchStatus;
};

export type RankingEntry = {
  position: number;
  participantId: string;
  participantName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  gamesFor: number;
  gamesAgainst: number;
  gamesBalance: number;
};

export type GenderHighlights = {
  best: RankingEntry;
  runnerUp: RankingEntry;
  last: RankingEntry;
};

export type SocialCardData = {
  tournament: {
    id: string;
    name: string;
    date: string;
    location?: string;
    logoUrl?: string;
    status: 'FINISHED';
    format: TournamentFormat;
  };
  ranking: Array<{
    position: number;
    participantId: string;
    participantName: string;
    wins: number;
    gamesBalance: number;
    gamesFor: number;
    gamesAgainst: number;
  }>;
  organizer: { name: string; instagramHandle?: string };
  highlights?: {
    male: GenderHighlights;
    female: GenderHighlights;
  };
};

export type ChallengeData = {
  tournamentId: string;
  participant: { id: string; name: string };
  challenge: string;
};
