import { DataSource } from "typeorm";
import { NHLLivePlayerStats } from "./models/nhl-live-player-stats.model";

export const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'admin',
    password: '',
    database: 'live-stats-test',
    entities: [NHLLivePlayerStats],
    synchronize: true,
    logging: false,
  });