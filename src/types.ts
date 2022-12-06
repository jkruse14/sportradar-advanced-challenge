export interface Observer {
  update(opts: unknown): void;
}

export interface GameObserver extends Observer{
  id: number;
}

export interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  update(): void;
}

export interface ScheduleDate {
  date: string;
  totalItems: number;
  totalGames: number;
  totalMatches: number;
  games: ScheduleGame[];
  events: unknown[];
  matches: unknown[];
}

export interface ScheduleGameTeam {
  leagueRecord: LeagueRecord;
  score: number;
  team: Team;
}

export interface Team {
  id: number;
  name: string;
  link: string;
}

export interface LeagueRecord {
  wins: number;
  losses: number;
  ot: number;
  type: 'league';
}

export type AbstractGameState = 'Preview' | 'Live' | 'Final';

export interface GameStatus {
  abstractGameState: AbstractGameState;
  codedGameState: string;
  detailedState:
    | 'Scheduled'
    | 'Schuduled (Time TBD)'
    | 'Postponed'
    | 'Pre-Game'
    | 'In Progress'
    | 'In Progress (Critical)'
    | 'Game Over'
    | 'Final';
  statusCode: string;
  startTimeTBD: boolean;
}

export interface ScheduleGame {
  gamePk: number;
  link: string;
  gameType:
    | 'PR'
    | 'R'
    | 'P'
    | 'A'
    | 'WA'
    | 'O'
    | 'WCOH_EXH'
    | 'WCOH_PRELIM'
    | 'WCOM_FINAL';
  season: string;
  gameDate: string;
  status: GameStatus;
  teams: {
    away: ScheduleGameTeam;
    home: ScheduleGameTeam;
  };
  venue: {
    name: string;
    link: string;
  };
  content: {
    link: string;
  };
}

export interface Schedule {
  copyright: string;
  totalItems: number;
  totalEvents: number;
  totalGames: number;
  totalMatches: number;
  wait: number;
  dates: ScheduleDate[];
}
