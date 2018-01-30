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
  addPlayer: (user, isHost) => {
    let player = {
      user: user,
      isHost: isHost,
      isReady: false,
      mapVote: 'none'
    };
    players.push(player);
    console.log({
      user: player.user.username,
      isHost: player.isHost,
      isReady: player.isReady,
      mapVote: player.mapVote
    });
  },
  removePlayer: (user) => {
    _.remove(players, (player) => {
      return player.id === user.id;
    });
    console.log(JSON.stringify(players));
  },
  readyPlayer: (user) => {
    let player = playerService.findPlayer(user);
    _.assign(player, player.isReady = true);
    console.log('Ready player: ' + JSON.stringify({user: player.user.username, isHost: player.isHost, isReady: player.isReady, mapVote: player.mapVote}));
  },
  unreadyPlayer: (user) => {
    let player = playerService.findPlayer(user);
    _.assign(player, player.isReady = false);
    console.log('Unready player: ' + JSON.stringify({user: player.user.username, isHost: player.isHost, isReady: player.isReady, mapVote: player.mapVote}));
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
      readyPlayers.push(player.user.username);
    });
    return readyPlayers;
  },
  getUnreadyPlayerNames: () => {
    let unreadyPlayers = [];
    _.forEach(_.filter(players, (player) => {return !player.isReady;}), (player) => {
      unreadyPlayers.push(player.user.username);
    });
    return unreadyPlayers;
  },
  findPlayer: (user) => {
    return _.find(players, (player) => {return user.id === player.user.id});
  },
  playerExists: (user) => {
    if (playerService.findPlayer(user) !== undefined) {
      return true;
    }
    return false;
  },
  getPlayerMapVote: (user) => {
    return playerService.findPlayer(user).mapVote;
  },
  voteMap: (mapName, user) => {
    let player = playerService.findPlayer(user);
    _.assign(player, player.mapVote = mapName);
  }
}

module.exports = playerService;
