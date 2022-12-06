import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export interface CreateNHLPlayerStatsOpts {
  gameId: number;
  playerId: number;
  playerName: string;
  teamId: number;
  playerAge: number;
  playerNumber: string;
  playerPosition: string;
  opponentTeamId: number;
}

@Entity()
// @Index(["gameId", "playerId"], { unique: true })
export class NHLLivePlayerStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameId: number;

  @Column()
  playerId: number;

  @Column()
  playerName: string;

  @Column()
  teamId: number;

  @Column()
  playerAge: number;

  @Column()
  playerNumber: string;

  @Column()
  playerPosition: string;

  @Column()
  assists: number;

  @Column()
  goals: number;

  @Column()
  hits: number;

  @Column()
  points: number;

  @Column()
  penaltyMinutes: number;
  
  @Column()
  opponentTeamId: number;

  static create(opts: CreateNHLPlayerStatsOpts): NHLLivePlayerStats {
    const playerStats = new NHLLivePlayerStats();
    playerStats.gameId = opts.gameId;
    playerStats.playerId = opts.playerId;
    playerStats.playerName = opts.playerName;
    playerStats.teamId = opts.teamId;
    playerStats.playerAge = opts.playerAge;
    playerStats.playerNumber = opts.playerNumber;
    playerStats.playerPosition = opts.playerPosition;
    playerStats.assists = 0;
    playerStats.goals = 0;
    playerStats.hits = 0;
    playerStats.points = 0;
    playerStats.penaltyMinutes = 0;
    playerStats.opponentTeamId = opts.opponentTeamId;
    return playerStats;
  }
}
