import { DataSource } from 'typeorm';
import { Game, GameObserver } from './game';
import { GameFactory } from './game-factory';
import {
  CreateNHLPlayerStatsOpts,
  NHLLivePlayerStats,
} from './models/nhl-live-player-stats.model';
import { nhlDataService } from './service/nhl/nhl-data.service';
import { NHLGameLiveFeed, Player } from './service/nhl/types';
import { Observer, Subject } from './types';

export class GameManager implements Subject {
  private upcomingGames: Record<number, Game> = {};
  private games: Record<number, Game> = {};
  private readonly datasource: DataSource;
  private readonly date: string | undefined;
  private readonly gameFactory: GameFactory;

  // TODO: use dependency injection for datasource, gameFactory
  constructor(datasource: DataSource, date?: string) {
    this.datasource = datasource;
    this.date = date;
    this.gameFactory = new GameFactory();
  }
  public attach(observer: GameObserver) {
    console.log(
      `Starting poll for game: ${observer.awayTeam} @ ${observer.homeTeam}`,
    );
    this.games[observer.id] = observer;
  }
  public detach(observer: Game) {
    if (!this.games[observer.id]) {
      console.warn(`Game "${observer.id}" not found in managed games`);
      return;
    }
    console.log(
      `${observer.awayTeam} @ ${observer.homeTeam} has ended`,
    );
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
      let liveFeed: NHLGameLiveFeed;
      if (!this.games[game.gamePk]) {
        let scheduledGame = this.upcomingGames[game.gamePk];
        if (!scheduledGame) {
          scheduledGame = this.gameFactory.createGame(this.datasource, game.gamePk, game.teams.home.team.name, game.teams.away.team.name);
        }
        // if the game hasn't started yet
        if (game.status.abstractGameState === "Preview") {
          this.upcomingGames[scheduledGame.id] = scheduledGame;
          continue;
        } else {
          this.games[game.gamePk] = scheduledGame;
          delete this.upcomingGames[game.gamePk];
        }
        this.attach(scheduledGame);
        // delete this.upcomingGames[game.gamePk];
        liveFeed = await nhlDataService.getGameLiveFeed(game.gamePk);
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
      
      liveFeed = liveFeed || await nhlDataService.getGameLiveFeed(game.gamePk);
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
