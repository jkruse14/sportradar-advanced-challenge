import { DataSource } from "typeorm"
import { Game } from "./game"

export class GameFactory {
    public createGame(dataSource: DataSource, gameId: number): Game {
        return new Game(dataSource, gameId);
    }
}