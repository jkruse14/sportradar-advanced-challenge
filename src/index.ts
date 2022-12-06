import { dataSource } from './datasource';
import { GameManager } from './game-manager';

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

async function main(date: string) {
  if (!date) {
    console.error(`Game date input required.\n\nUsage:\nnode dist/index.js 2022-12-03\n\tor:\nts-node src/index.ts 2022-12-03`)
    process.exit();
  }
  try {
    await dataSource.initialize();
    console.log(`Fetching NHL schedule for ${date}`);
    const gm = new GameManager(dataSource, date);
    while(true) {
      await gm.update();
      if (gm.getActiveAndUpcomingGamesCount() === 0) {
        console.log(`All games have completed for ${gm.getGamesDate()}`);
        process.exit();
      }
      await sleep(3000);
    }
  } catch (error) {
    console.error(error);
  }
}

(async (date: string) => await main(date))(process.argv[2]);
