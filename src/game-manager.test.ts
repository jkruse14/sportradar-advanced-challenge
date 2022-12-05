import { nhlDataService } from './service/nhl/nhl-data.service';
import { Game } from "./game";
import { GameManager } from "./game-manager";

const schedule = require("./mock-data/schedule.json");
const liveFeed = require("./mock-data/2022020379.json");

describe("Game Manager Unit Tests", () => {
    let dataSource;
    let date;
    let gameManager;
  beforeEach(() => {
    Game.prototype.update = jest.fn().mockResolvedValue({});
    dataSource = {
        manager: {
            save: jest.fn().mockResolvedValue({}),
        }
    };
    nhlDataService.getGameLiveFeed = jest.fn().mockResolvedValue(liveFeed);
    nhlDataService.getSchedule = jest.fn().mockResolvedValue(schedule);
    date = "2022-12-03";
    gameManager = new GameManager(dataSource, date);
  });
  afterEach(() => {
    jest.resetAllMocks()
  });

  it("should call getGameLiveFeed twice per game", async () => {
    await gameManager.update();
    expect(nhlDataService.getGameLiveFeed).toBeCalledTimes(schedule.totalGames * 2);
  });
});