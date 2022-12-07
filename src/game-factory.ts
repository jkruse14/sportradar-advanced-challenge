import { DataSource } from "typeorm"
import { Game } from "./game"

export class GameFactory {
    public createGame(dataSource: DataSource, gameId: number, homeTeam: string, awayTeam: string): Game {
        return new Game(dataSource, gameId, homeTeam, awayTeam);
    }
}