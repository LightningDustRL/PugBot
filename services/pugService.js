'use strict';
const _ = require('lodash');
const playerService = require('./playerService');
const pugConstants = require('../constants/pugConstants');

let mapSettings = [];
let status = pugConstants.INACTIVE;
let region;
let passcode;
let host;

const pugService = {
  setPugToDefaultValues: () => {
    host = 'none';
    playerService.clearPlayers();
    mapSettings = [];
    _.forEach(pugConstants.map_pool, (mapName) => {
      mapSettings.push({mapName: mapName, votes: 0});
    });
    status = pugConstants.INACTIVE;
    pugService.setRegion('NA');
    passcode = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
    console.log('Pug Values Reset');
  },
  getStatus: () => {
    return status;
  },
  setStatus: (newStatus) => {
    status = newStatus;
  },
  getMapVotes: () => {
    console.log(JSON.stringify(mapSettings));
    return mapSettings;
  },
  setupPug: (user) => {
    host = user;
    playerService.addPlayer(user, true);
    status = pugConstants.SETUP;
  },
  startPug: () => {
    _.forEach(playerService.getPlayers(), (player) => {
      console.log('Opening DMs with ' + playerService.getReadyPlayerNames());
      if (player !== playerService.getHost()) {
        player.user.send('Pug is starting! Match host is ' + playerService.getHost().user.username +' on '
          + pugService.getCurrentMap() + ' in the ' + pugService.getRegion()  + ' region. ' +
          'Passcode is ' + pugService.getPasscode());
      } else {
        player.user.send('Pug is starting and you are the host. Host a game on the '+ pugService.getRegion()
          + ' server on ' + pugService.getCurrentMap() + ', with the passcode '
          + pugService.getPasscode() + ' and start the match when everyone has connected.'
        );
      }
    });
    console.log('Pug has begun, clearing player list and resetting pug to default values');
    pugService.setPugToDefaultValues();
  },
  getRegion: () => {
    return region;
  },
  setRegion: (newRegion) => {
    let isValidRegion = _.includes(pugConstants.valid_regions, newRegion);
    if(isValidRegion) {
      region = newRegion;
    }
  },
  voteMap: (mapIndex, user) => {
    mapSettings[mapIndex].votes++;
    playerService.voteMap(mapSettings[mapIndex].mapName, user);
    console.log(JSON.stringify(mapSettings[mapIndex]));
    mapSettings = _.orderBy(mapSettings, ['votes'], ['desc']);
  },
  subtractMapVote: (mapIndex) => {
    mapSettings[mapIndex].votes = mapSettings[mapIndex].votes - 1;
    console.log(JSON.stringify(mapSettings[mapIndex]));
    mapSettings = _.orderBy(mapSettings, ['votes'], ['desc']);
  },
  getPasscode: () => {
     return passcode;
  },
  getCurrentMap: () => {
    if (mapSettings[0].votes === 0) {
      return 'Host\'s choice';
    }
    return mapSettings[0].mapName;
  },
  getHost: () => {
    return host;
  }
}

module.exports = pugService;
