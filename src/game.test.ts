import { Game } from './game';
import { NHLGameLiveFeed } from './service/nhl/types';

const liveFeed: NHLGameLiveFeed = require("./mock-data/2022020379.json");

describe('Game Unit Tests', () => {
  let game;
  let dataSource;
  beforeEach(() => {
    dataSource = {
      createQueryBuilder: jest.fn().mockResolvedValue({
        update: jest.fn().mockResolvedValue({
          set: jest.fn().mockResolvedValue({
            where: jest.fn().mockResolvedValue({
              execute: jest.fn().mockResolvedValue({}),
            }),
          }),
        }),
      }),
    };
    game = new Game(dataSource, 117);
  });
  it("should exist", () => {
    expect(game).toBeDefined();
  })
//   describe('Update', () => {
//     it ("should update the last checked play", async () => {
//         const original = game.lastCheckedPlay;
//         console.log('liveFeed.liveData.plays.allPlays: ', liveFeed.liveData.plays.allPlays);
//         game.update({ gameId: 117, plays: liveFeed.liveData.plays.allPlays});
        
//         expect(game.lastCheckedPlay).not.toEqual(original);
//     })
//   });
});
