export interface PlayResult {
    event: string;
    eventCode: string;
    eventTypeId: string;
    description: string;
    penaltyMinutes?: number;
    penaltySeverit?: string;
    secondaryType?: string;
  }
  
  export interface PlayAbout {
    eventIdx: number;
    eventId: number;
    period: number;
    periodType: string;
    ordinalNum: string;
    periodTime: string;
    periodTimeRemaining: string;
    dateTime: string;
    goals: {
      away: number;
      home: number;
    };
  }
  
  export interface Play {
    players: Array<{ player: Player, playerType: string }>;
    result: PlayResult;
    about: PlayAbout;
    coordinates: {
      x: number;
      y: number;
    };
    team: Team;
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
    triCode: string;
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
  
  export type GameType =
    | 'PR'
    | 'R'
    | 'P'
    | 'A'
    | 'WA'
    | 'O'
    | 'WCOH_EXH'
    | 'WCOH_PRELIM'
    | 'WCOM_FINAL';
  
  export interface ScheduleGame {
    gamePk: number;
    link: string;
    gameType: GameType;
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
  
  export interface NHLGame {
    pk: number;
    season: string;
    type: GameType;
  }
  
  export interface Division {
    id: number;
    name: string;
    nameShort: string;
    link: string;
    abbreviation: string;
  }
  
  export interface Conference {
    id: number;
    name: string;
    link: string;
  }
  
  export interface Franchise {
    franchiseId: number;
    teamName: string;
    link: string;
  }
  
  export interface Venue {
    id: number;
    name: string;
    link: string;
  }
  export interface VenueDetailed extends Venue {
    city: string;
    timezone: {
      id: string;
      offset: number;
      tz: string;
    }
    abbreviation: string;
    teamName: string;
    locationName: string;
    firstYearOfPlay: string;
  }
  
  export interface TeamDetailed extends Team {
    venue: VenueDetailed;
    division: Division;
    conference: Conference;
    franchise: Franchise;
    shortName: string;
    officialSiteUrl: string;
    franchiseId: number;
    active: boolean;
  }
  
  
  export interface NHLGameLiveFeedMetaData {
    wait: number;
    timeStamp: string;
  }
  
  export interface NHLGameLiveFeedGameData {
    game: NHLGame;
    datetime: {
      datetime: string;
    }
    status: GameStatus;
    teams: {
      away: TeamDetailed;
      home: TeamDetailed;
    };
    players: Record<string, Player>;
    venue: Venue
  }
  
  export interface NHLGameLiveFeedLiveData {
    plays: {
      allPlays: Play[];
      scoringPlays: Play[];
      penaltyPlays: Play[];
      PlayByPeriod: Play[];
      currentPlay: Play;
    }
    // TODO
    linescore: Record<string, any>;
    boxscore: Record<string, any>;
    decisions: Record<string, any>;
  }
  
  export interface NHLGameLiveFeed {
    copyright: string;
    gamePk: string;
    link: string;
    metaData: NHLGameLiveFeedMetaData;
    gameData: NHLGameLiveFeedGameData;
    liveData: NHLGameLiveFeedLiveData;
  }

  // ticket: Provides the different places to buy tickets for upcoming games
export type ScheduleExpandOptions = "broadcasts" | "linescore" | "ticket";

export interface ScheduleOptions {    
    expand?: ScheduleExpandOptions;
    // Limit results to a specific team(s). Team ids can be found through the teams endpoint
    // converts to comma separated list in url
    teamId?: number[];
    date?: string;      // format YYYY-MM-DD
    startDate?: string; // format YYYY-MM-DD
    endDate?: string;   // format YYYY-MM-DD
    season?: number;    // example: 20172018
    gameType?: GameType // Can be set to any value from [Game Types](#game-types) endpoint
}

export interface PlayerPosition {
    code: string;
    name: string;
    type: string;
    abbreviation: string;
}

export interface Player {
    id: number;
    fullName: string;
    link: string;
    firstName: string;
    lastName: string;
    primaryNumber: string;
    birtDate: string;
    currentAge: number;
    birtCity: string;
    birthStateProvince: string;
    birthCountry: string;
    height: string;
    weight: number;
    active: boolean;
    alternateCaptain: boolean;
    captain: boolean;
    rookie: boolean;
    shootsCatches: "R" | "L";
    rosterStatus: string;
    currentTeam: Team;
    primaryPosition: PlayerPosition;
}

export enum PlayEventTypeId {
    faceoff = 'FACEOFF',
    goal = 'GOAL',
    hit = 'HIT',
    penalty = 'PENALTY',
    missedShot = 'MISSED_SHOT',
    shot = 'SHOT',
  }
  
export enum PlayEventPlayerType {
    assist = 'Assist',
    drewBy = 'DrewBy', // Penaly drew by
    goalie = 'Goalie',
    hittee = 'Hittee',
    hitter = 'Hitter',
    penaltyOn = 'PenaltyOn',
    scorer = 'Scorer',
  }