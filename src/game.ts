import { DataSource } from 'typeorm';
import { NHLLivePlayerStats } from './models/nhl-live-player-stats.model';
import {
  Play,
  PlayEventPlayerType,
  PlayEventTypeId,
} from './service/nhl/types';
import { Observer } from './types';

type TrackedStat = 'hits' | 'goals' | 'assists' | 'points' | 'penaltyMinutes';

type StatsUpdates = Record<keyof Stats, () => string>;

export type GameObserver = Game & Observer;
interface Stats {
  hits: number;
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
}

interface PlayersStats {
  playerId: Stats;
}

export class Game implements GameObserver {
  public readonly id: number;
  private lastCheckedPlay: number = 0;
  private datasource: DataSource;
  // TODO: use dependency injection for datasource
  constructor(datasource: DataSource, id: number) {
    this.id = id;
    this.datasource = datasource;
  }

  private addStatsToPlayer(
    playersStats: PlayersStats,
    playerId: number,
    stat: TrackedStat,
    val: number,
  ): PlayersStats {
    const newStats = Object.assign({}, playersStats);
    if (!newStats[playerId]) {
      newStats[playerId] = {
        hits: 0,
        goals: 0,
        assists: 0,
        penaltyMinutes: 0,
      };
    }
    newStats[playerId][stat] += val;
    return newStats;
  }
  public async update(opts: { gameId: number; plays: Play[] }): Promise<void> {
    const playsToProcess = opts.plays.slice(this.lastCheckedPlay);
    let playersStats: PlayersStats = {} as PlayersStats;
    playsToProcess.map((play) => {
      if (play.result.eventTypeId === PlayEventTypeId.hit) {
        const playerId =
          play.players[0].playerType === PlayEventPlayerType.hitter
            ? play.players[0].player.id
            : play.players[1].player.id;
        playersStats = this.addStatsToPlayer(playersStats, playerId, 'hits', 1);
      }
      if (play.result.eventTypeId === PlayEventTypeId.goal) {
        return Promise.all(
          play.players.map((p) => {
            if (
              [PlayEventPlayerType.assist, PlayEventPlayerType.scorer].includes(
                p.playerType,
              )
            ) {
              const stat =
                PlayEventPlayerType.scorer === p.playerType
                  ? 'goals'
                  : 'assists';
              playersStats = this.addStatsToPlayer(
                playersStats,
                p.player.id,
                stat,
                1,
              );
            }
          }),
        );
      }
      if (play.result.eventTypeId === PlayEventTypeId.penalty) {
        const playerId =
          play.players[0].playerType === PlayEventPlayerType.penaltyOn
            ? play.players[0].player.id
            : play.players[1].player.id;
        playersStats = this.addStatsToPlayer(
          playersStats,
          playerId,
          'penaltyMinutes',
          play.result.penaltyMinutes,
        );
      }
    }),
      await Promise.all(
        Object.keys(playersStats).map((playerId) =>
          this.addtoStats(
            Number(playerId),
            playersStats[playerId],
            opts.gameId,
          ),
        ),
      );
    this.lastCheckedPlay = opts.plays.length - 1;
  }
  private async addtoStats(
    playerId: number,
    stats: Stats,
    gameId: number,
  ): Promise<void> {
    const setStats: StatsUpdates = {} as StatsUpdates;
    Object.keys(stats).forEach((stat) => {
      setStats[stat] = () => `"${stat}" + ${stats[stat]}`;
    });
    setStats.points = () => `"points" + ${stats.goals + stats.assists}`;
    await this.datasource
      .createQueryBuilder()
      .update(NHLLivePlayerStats)
      .set(setStats)
      .where({
        gameId,
        playerId,
      })
      .execute();
  }
}
