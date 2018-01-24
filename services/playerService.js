'use strict';

const _ = require('lodash');
const pugConstants = require('../constants/pugConstants');

let players = [];
const playerService = {
  getPlayers: () => {
    return players;
  },
  getHost: () => {
    return _.find(playerService.getPlayers(), (player) => {return player.isHost === true});
  },
  addPlayer: (user, userId, isHost) => {
    let player = {
      username: user,
      id: userId,
      isHost: isHost,
      isReady: false
    };
    players.push(player);
    console.log(JSON.stringify(players));
  },
  removePlayer: (userId) => {
    _.remove(players, (player) => {
      return player.id === userId;
    });
    console.log(JSON.stringify(players));
  },
  readyPlayer: (userId) => {
    const playerIndex = _.findIndex(players, (player) => {return player.id === userId});
    players[playerIndex].isReady = true;
    console.log('Ready player: ' + JSON.stringify(players[playerIndex]));
  },
  unreadyPlayer: (userId) => {
    const playerIndex = _.findIndex(players, (player) => {return player.id === userId});
    players[playerIndex].isReady = false;
    console.log('Unready player: ' + JSON.stringify(players[playerIndex]));
  },
  clearPlayers: () => {
    players = [];
    return players;
  },
  getPlayerCount: () => {
    return players.length;
  },
  getReadyPlayerNames: () => {
  let readyPlayers = [];
    _.forEach(_.filter(players, (player) => {return player.isReady;}), (player) => {
      readyPlayers.push(player.username);
    });
    return readyPlayers;
  },
  getUnreadyPlayerNames: () => {
    let unreadyPlayers = [];
    _.forEach(_.filter(players, (player) => {return !player.isReady;}), (player) => {
      unreadyPlayers.push(player.username);
    });
    return unreadyPlayers;
  },
  findPlayer: (userId) => {
    return _.find(playerService.getPlayers(), (player) => {return userId === player.id});
  },
  playerExists: (userId) => {
    if (playerService.findPlayer(userId) !== undefined) {
      return true;
    }
    return false;
  }
}

module.exports = playerService;
