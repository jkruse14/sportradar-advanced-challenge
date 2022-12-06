import { DataSource } from 'typeorm';
import { Game } from './game';
import {
  CreateNHLPlayerStatsOpts,
  NHLLivePlayerStats,
} from './models/nhl-live-player-stats.model';
import { nhlDataService } from './service/nhl/nhl-data.service';
import { Player } from './service/nhl/types';
import { Observer, Subject } from './types';

export class GameManager implements Subject {
  private upcomingGames: Record<number, Game> = {};
  private games: Record<number, Game> = {};
  private readonly datasource: DataSource;
  private readonly date: string | undefined;

  // TODO: use dependency injection for datasource
  constructor(datasource: DataSource, date?: string) {
    this.datasource = datasource;
    this.date = date;
  }
  public attach(observer: Game) {
    this.games[observer.id] = observer;
  }
  public detach(observer: Game) {
    if (!this.games[observer.id]) {
      console.warn(`Game "${observer.id}" not found in managed games`);
      return;
    }
    delete this.games[observer.id];
    delete this.upcomingGames[observer.id];
  }

  public getActiveAndUpcomingGamesCount() {
    return (
      Object.keys(this.games).length + Object.keys(this.upcomingGames).length
    );
  }

  public getGamesDate(): string {
    return this.date;
  }

  public async update() {
    const schedule = await nhlDataService.getSchedule({
      date: this.date,
    });
    for (let game of Object.values(schedule.dates[0].games)) {
      if (!this.games[game.gamePk]) {
        // if the game hasn't started yet
        if (!['Live', 'Final'].includes(game.status.abstractGameState)) {
          const scheduledGame = new Game(this.datasource, game.gamePk);
          this.upcomingGames[scheduledGame.id] = scheduledGame;
          continue;
        }
        // Game is Live or Final
        console.log(
          `Starting poll for game: ${game.teams.away.team.name} @ ${game.teams.home.team.name}`,
        );
        let scheduledGame = this.upcomingGames[game.gamePk];
        if (!scheduledGame) {
          scheduledGame = new Game(this.datasource, game.gamePk);
        }
        this.attach(scheduledGame);
        // delete this.upcomingGames[game.gamePk];
        const liveFeed = await nhlDataService.getGameLiveFeed(game.gamePk);
        await Promise.all(
          Object.values(liveFeed.gameData.players).map((player: Player) => {
            const initialStats: CreateNHLPlayerStatsOpts = {
              gameId: game.gamePk,
              playerId: player.id,
              playerName: player.fullName,
              teamId: player.currentTeam.id,
              playerAge: player.currentAge,
              playerNumber: player.primaryNumber,
              playerPosition: player.primaryPosition.name,
              opponentTeamId:
                game.teams.home.team.id === player.currentTeam.id
                  ? game.teams.away.team.id
                  : game.teams.home.team.id,
            };
            return this.datasource.manager.save(
              NHLLivePlayerStats.create(initialStats),
            );
          }),
        );
      }
      const liveFeed = await nhlDataService.getGameLiveFeed(game.gamePk);
      await this.games[game.gamePk].update({
        gameId: game.gamePk,
        plays: liveFeed.liveData.plays.allPlays,
      });
      if (game.status.abstractGameState === 'Final') {
        this.detach(this.games[game.gamePk]);
      }
    }
  }
}
