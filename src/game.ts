import { DataSource } from "typeorm";
import { NHLLivePlayerStats } from "./models/nhl-live-player-stats.model";
import { Play, PlayEventPlayerType, PlayEventTypeId } from "./service/nhl/types";
import { Observer } from "./types";

type TrackedStat = 'hits' | 'goals' | 'assists' | 'points' | 'penaltyMinutes';

export class Game implements Observer {
    public readonly id: number;
    private lastCheckedPlay: number = 0;
    private datasource: DataSource;
    // TODO: use dependency injection for datasource
    constructor(datasource: DataSource, id: number) {
      this.id = id;
      this.datasource = datasource;
    }

    public async update(opts: { gameId: number; plays: Play[] }): Promise<void> {
      const playsToProcess = opts.plays.slice(this.lastCheckedPlay);
      await Promise.all(
        playsToProcess.map((play) => {
          if (play.result.eventTypeId === PlayEventTypeId.hit) {
            const playerId =
              play.players[0].playerType === PlayEventPlayerType.hitter
                ? play.players[0].player.id
                : play.players[1].player.id;
            return this.incrementHits(opts.gameId, playerId);
          }
          if (play.result.eventTypeId === PlayEventTypeId.goal) {
            return Promise.all(
              play.players.map((p) => {
                if (p.playerType === PlayEventPlayerType.scorer) {
                  return this.incrementGoals(opts.gameId, p.player.id);
                }
                if (p.playerType === PlayEventPlayerType.assist) {
                  return this.incrementAssists(opts.gameId, p.player.id);
                }
              }),
            );
          }
          if (play.result.eventTypeId === PlayEventTypeId.penalty) {
            const playerId =
              play.players[0].playerType === PlayEventPlayerType.penaltyOn
                ? play.players[0].player.id
                : play.players[1].player.id;
            return this.addtoStat(
              playerId,
              'penaltyMinutes',
              play.result.penaltyMinutes,
              opts.gameId,
            );
          }
        }),
      );
      this.lastCheckedPlay = opts.plays.length - 1;
    }
    private async addtoStat(
      playerId: number,
      stat: TrackedStat,
      val: number,
      gameId: number,
    ): Promise<void> {
      await this.datasource
        .createQueryBuilder()
        .update(NHLLivePlayerStats)
        .set({ [stat]: () => `"${stat}" + ${val}` })
        .where({
          gameId,
          playerId,
        })
        .execute();
    }
    private async incrementHits(gameId: number, playerId: number): Promise<void> {
      return this.addtoStat(playerId, 'hits', 1, gameId);
    }
    private async incrementGoals(
      gameId: number,
      playerId: number,
    ): Promise<void> {
      await Promise.all([
        this.addtoStat(playerId, 'goals', 1, gameId),
        this.addtoStat(playerId, 'points', 1, gameId),
      ]);
    }
    private async incrementAssists(
      gameId: number,
      playerId: number,
    ): Promise<void> {
      await Promise.all([
        this.addtoStat(playerId, 'assists', 1, gameId),
        this.addtoStat(playerId, 'points', 1, gameId),
      ]);
    }
  }
  