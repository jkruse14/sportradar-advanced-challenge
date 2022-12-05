# NHL Live Data Feed

Creates a simple data pipeline for live games or past games. To run:

- make sure postgres is running
- Install dependencies with `yarn`
- run the script:

  ```bash
  yarn build
  node dist/index.js 2022-12-03
  ```
or

```bash
ts-node src/index.js 2022-12-03
```

You can select any date you wish.

## Process:

- Game manager reaches out to the NHL schedule endpoint to obtain a list of games for the date
- For each game, a row is added to the nhl_live_player_stats table with player information and 0s for stats and a Game object is created and attached as an observer
- The Observer pattern is used to update each game when a new play is found (the main loop polls the schedule endpoint until all games are detached). The last play seen is recorded on a Game object and only new plays are processed in each loop iteration

## TODOs:

- TESTS!!!! I simply ran out of time...
- Use dependency injection where possible, (i.e. with the datasource)
- create a factory method for creating a Game to remove the concrete dependency in Game Manager
- Use the schedule enpoint with the timestamp to be more efficient with data calls to get new plays since the last