// broadcast: Shows the broadcasts of the game
// linescore: Linescore for completed games

import { NHLGameLiveFeed, Schedule, ScheduleOptions } from "./types";
import { AxiosService } from "../http/axios-service";
import * as qs from "qs";

class NHLDataService {
    private readonly baseUrl = 'https://statsapi.web.nhl.com/api'
    // TODO: Use dependency injection
    private axiosService = new AxiosService(this.baseUrl);
    public async getSchedule(opts?: ScheduleOptions): Promise<Schedule> {
        const queryStringObj: { [T in keyof ScheduleOptions] : string } = {
            expand: opts.expand ? `schedule.${opts.expand}` : undefined,
            teamId: opts.teamId?.join(","),
            date: opts.date,
            startDate: opts.startDate,
            endDate:opts.endDate,
            season: opts.season ? `${opts.season}` : undefined,
            gameType: opts.gameType,
        };

        return this.axiosService.get<Schedule>(
            `/v1/schedule?${qs.stringify(queryStringObj)}`,
          );
    }

    // TODO: game live feed full type
    public async getGameLiveFeed(gameId: number): Promise<NHLGameLiveFeed> {
        return this.axiosService.get<NHLGameLiveFeed>(`/v1/game/${gameId}/feed/live`);
        // return require("../../mock-data/2022020379.json");
    }
}

// TODO: use dependency injection
export const nhlDataService = new NHLDataService();