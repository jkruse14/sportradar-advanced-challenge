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
    gameManager.gameFactory.createGame = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call getGameLiveFeed twice per game, if the game is in Final state when process starts', async () => {
    await gameManager.update();
    expect(nhlDataService.getGameLiveFeed).toBeCalledTimes(
      schedule.totalGames * 2,
    );
  });
  describe("Games in 'Preview State", () => {
    beforeEach(() => {
      setStateForGames(schedule.dates[0].games, 'Preview');
    });
    it('should call gameFactory.createGame once per game', async () => {
      await gameManager.update();
      expect(gameManager.gameFactory.createGame).toBeCalledTimes(
        schedule.dates[0].games.length,
      );
    });
    it('should NOT call getGameLiveFeed', async () => {
        await gameManager.update();
        expect(nhlDataService.getGameLiveFeed).toBeCalledTimes(0);
      });
  });
});
