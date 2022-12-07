import { nhlDataService } from './service/nhl/nhl-data.service';
import { Game } from './game';
import { GameManager } from './game-manager';
import { AbstractGameState, Schedule, ScheduleGame } from './types';
import { NHLGame } from './service/nhl/types';

const schedule: Schedule = require('./mock-data/schedule.json');
const liveFeed = require('./mock-data/2022020379.json');

function setStateForGames(games: ScheduleGame[], state: AbstractGameState) {
  games.forEach((game) => (game.status.abstractGameState = state));
}

describe('Game Manager Unit Tests', () => {
  let dataSource;
  let date;
  let gameManager;
  beforeEach(() => {
    Game.prototype.update = jest.fn().mockResolvedValue({});
    dataSource = {
      manager: {
        save: jest.fn().mockResolvedValue({}),
      },
    };
    nhlDataService.getGameLiveFeed = jest.fn().mockResolvedValue(liveFeed);
    nhlDataService.getSchedule = jest.fn().mockResolvedValue(schedule);
    date = '2022-12-03';
    setStateForGames(schedule.dates[0].games, 'Live');
    gameManager = new GameManager(dataSource, date);
    const game = gameManager.gameFactory.createGame(dataSource, schedule.dates[0].games[0].gamePk, schedule.dates[0].games[0].teams.home.team.name, schedule.dates[0].games[0].teams.away.team.name);
    gameManager.gameFactory.createGame = jest.fn().mockReturnValue(game);
    gameManager.attach = jest.fn();
    gameManager.detach = jest.fn();
    Game.prototype.update = jest.fn().mockResolvedValue({});
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe("Games in 'Preview State", () => {
    beforeEach(() => {
      setStateForGames(schedule.dates[0].games, 'Preview');
    });
    it('should call gameFactory.createGame once per game', async () => {
      await gameManager.update();
      expect(gameManager.gameFactory.createGame).toBeCalledTimes(
        schedule.totalGames,
      );
    });
    it('should NOT call getGameLiveFeed', async () => {
      await gameManager.update();
      expect(nhlDataService.getGameLiveFeed).toBeCalledTimes(0);
    });
    it('should NOT call attach', async () => {
      await gameManager.update();
      expect(gameManager.attach).toBeCalledTimes(0);
    });
    it('should NOT call detach', async () => {
      await gameManager.update();
      expect(gameManager.detach).toBeCalledTimes(0);
    });
  });
  describe("Games in 'Live' state", () => {
    beforeEach(() => {
        setStateForGames(schedule.dates[0].games, 'Live');
      });
      it('should call gameFactory.createGame once per game', async () => {
        await gameManager.update();
        expect(gameManager.gameFactory.createGame).toBeCalledTimes(
          schedule.totalGames,
        );
      });
      it('should call getGameLiveFeed once per game', async () => {
        await gameManager.update();
        expect(nhlDataService.getGameLiveFeed).toBeCalledTimes(schedule.totalGames);
      });
      it('should call attach', async () => {
        await gameManager.update();
        expect(gameManager.attach).toBeCalledTimes(schedule.totalGames);
      });
      it('should NOT call detach', async () => {
        await gameManager.update();
        expect(gameManager.detach).toBeCalledTimes(0);
      });
  });
  describe("Games in 'Final' State when process starts", () => {
    beforeEach(() => {
        setStateForGames(schedule.dates[0].games, 'Final');
      });
    it('should call getGameLiveFeed once per game', async () => {
      await gameManager.update();
      expect(nhlDataService.getGameLiveFeed).toBeCalledTimes(
        schedule.totalGames,
      );
    });
    it('should call attach', async () => {
        await gameManager.update();
        expect(gameManager.attach).toBeCalledTimes(schedule.totalGames);
      })
      it('should call detach', async () => {
        await gameManager.update();
        expect(gameManager.detach).toBeCalledTimes(schedule.totalGames);
      })
  });
});
