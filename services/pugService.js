'use strict';
const _ = require('lodash');
const playerService = require('./playerService');
const pugConstants = require('../constants/pugConstants');

let mapSettings = [];
let status = pugConstants.INACTIVE;
let region = pugConstants.NA;

const pugService = {
  setPugToDefaultValues: () => {
    playerService.clearPlayers();
    mapSettings = [];
    _.forEach(pugConstants.map_pool, (mapName) => {
      mapSettings.push({mapName: mapName, votes: 0});
    });
    status = pugConstants.INACTIVE;
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
    return _.orderBy(mapSettings, ['mapName', 'votes']);
  },
  setupPug: (user, userId) => {
    pugService.setPugToDefaultValues();
    playerService.addPlayer(user, userId, true);
    status = pugConstants.SETUP;
  },
  setRegion: (newRegion) => {
    region = newRegion;
  },
  voteMap: (mapIndex) => {
    mapSettings[mapIndex].votes++;
    console.log(mapSettings[mapIndex]);
  },
  getPasscode: () => {
     return (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
  }
}

module.exports = pugService;
