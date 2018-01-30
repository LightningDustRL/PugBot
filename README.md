# PugBot
Discord Bot to create pick up games in Pavlov VR

### List of Commands:
- '.setup' - Starts a new pug with you as the host. Only One pug is supported at this time
- '.join' - Player is added to pug roster. Only Valid if Pug is looking for players
- '.leave' - Player is removed from pug roster.
- '.ready' - Player on pug Roster marks themselves as ready to begin. When all 10 players are ready, the Bot will message players with pug game Host, Map, server region, players, and passcode
- '.unready' - Ready player unmarks themselves as ready.
- '.players' - Prints the names of all ready and unready players on the pug roster in seperate lists
- '.setRegion [NA, EU, AP]' - Sets the region of the pug to North America, Europe, or Asia Pacific. Do not include brackets around your command
  - This can only be done by the host of the pug
- '.getRegion' - Returns the current region pug is set to
- '.voteMap [Map]' - Registers a player's vote for map
  - the current map pool is: Dust2, Datacenter, Sand, Mirage, Nuke, and Office
- '.currentMap' - returns the current map leading in votes, if no votes, returns "host's choice"
- '.allMapVotes' - returns all maps in the pool and their votes
- '.mapPool' - returns the current map pool
- '.help' - provides a link to this readme
- '.status' - returns the current pug status
- '.end' - Ends the pug being set up
