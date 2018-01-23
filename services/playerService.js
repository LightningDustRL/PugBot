var _ = require('lodash');
var pugConstants = require('../constants/pugConstants');

var players = [];
var playerService = {
  getPlayers: function () {
    return players;
  },
  addPlayer: function (user, userId, isHost) {
    var player = {
      username: user,
      id: userId,
      isHost: isHost,
      isReady: false
    };
    players.push(player);
  },
  removePlayer: function (userId) {
  // TODO: DOES NOT WORK FIX THIS
    players = _.remove(players, function (player) {
      console.log(JSON.stringify(player));
      return player.id === userId
    });
    console.log('Remove user: ' + userId);
  },
  readyPlayer: function (userId) {
    var playerIndex = _.findIndex(players, function(player) {return player.id === userId});
    players[playerIndex].isReady = true;
    console.log('Ready player: ' + JSON.stringify(players[playerIndex]));
  },
  unreadyPlayer: function(userId) {
    var playerIndex = _.findIndex(players, function(player) {return player.id === userId});
    players[playerIndex].isReady = false;
    console.log('Unready player: ' + JSON.stringify(players[playerIndex]));
  },
  clearPlayers: function () {
    players = [];
    return players;
  },
  getPlayerCount: function () {
    return players.length;
  },
  getReadyPlayerNames: function () {
  var readyPlayers = [];
    _.forEach(_.filter(players, function(player) {return player.isReady;}), function(player) {
      readyPlayers.push(player.username);
    });
    return readyPlayers;
  },
  getUnreadyPlayerNames: function () {
    var unreadyPlayers = [];
    _.forEach(_.filter(players, function(player) {return !player.isReady;}), function(player) {
      unreadyPlayers.push(player.username);
    });
    return unreadyPlayers;
  },
  findPlayer: function (userId) {
    return _.find(playerService.getPlayers(), function (player) {return userId === player.id});
  },
  playerExists: function (userId) {
    if (this.findPlayer(userId) !== undefined) {
      return true;
    }
    return false;
  }
}

module.exports = playerService;
