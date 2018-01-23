var Discord = require('discord.io');
var _ = require('lodash');
var auth = require('./auth.json');
var pugConstants = require('./constants/pugConstants');
var playerService = require('./services/playerService');

var mapSettings;
var status;
var region;

var pugBot = new Discord.Client({
  token: auth.token,
  autorun: true
});

var setDefaultPugValues = function () {
  console.log('RESET INVOKED');
  mapSettings= [];
  mapSettings.push({mapName: 'Dust 2', mapVotes: 0});
  players = playerService.clearPlayers;
  status = pugConstants.INACTIVE;
}

pugBot.on('ready', function (evt) {
 console.log('Connected');
 console.log('Logged in as: ');
 console.log(pugBot.username + ' - (' + pugBot.id + ')');
 setDefaultPugValues();
});

pugBot.on('message', function (user, userId, channelId, message, evt) {
  if (message.charAt(0) === '.') {
    var args = message.substring(1).split(' ');
    var cmd = args[0];

    args = args.splice(1);
    var pugSettings = {
      players: playerService.getPlayers,
      mapSettings: mapSettings,
      serverRegion: region,
      status: status
    }

    switch(cmd) {
      case 'setup':
        if (pugSettings.status !== pugConstants.INACTIVE) {
          pugBot.sendMessage({to: channelId, message: 'Pug setup already in progress. Type \".join\" to join'});
          break;
        }
        playerService.addPlayer(user, userId, true);
        status = pugConstants.SETUP;
        pugBot.sendMessage({to: channelId, message: user + ' is starting a pug! Type \".join\" to join in.'});
      break;
      case 'join':
        // player added to pug roster
        if (pugSettings.status === pugConstants.FULL_NOT_READY || pugSettings.Status === pugConstants.PLAYERS_READY) {
          pugBot.sendMessage({to: channelId, message: 'Sorry, this pug is full'});
        } else {
          if(!playerService.playerExists(userId)) {
            playerService.addPlayer(user, userId, false, channelId);
            pugBot.sendMessage({to: channelId, message: user + ' has joined the pug ' + playerService.getPlayerCount() + '/10 have Joined'});
            console.log(players);
            if (players.length === 10) {
              status = pugConstants.FULL_NOT_READY;
              pugBot.sendMessage({to: channelId, message: 'All slots claimed, ready up to begin'});
            }
          } else{
            console.log('Duplicate Player');
            pugBot.sendMessage({to: channelId, message: user + ' has already joined the pug'});
          }
        }
      break;
      case 'leave':
        // player is removed from pug roster
        if (!playerService.playerExists(userId)) {
          console.log('Player not Found');
          pugBot.sendMessage({
            to: channelId,
            message: user + ' has not joined this pug'
          });
        } else {
          playerService.removePlayer(userId);
          pugBot.sendMessage({to: channelId, message: user + ' has been removed from the pug '
            + playerService.getPlayerCount() + '/10 have Joined'});
        }
      break;
      case 'ready':
        console.log('Ready player ' + user);
        // player is ready for match to begin
        if (!playerService.playerExists(userId)) {
          console.log('Player not Found');
          pugBot.sendMessage({to: channelId, message: user + ' has not joined this pug'});
        } else {
          playerService.readyPlayer(userId);
          pugBot.sendMessage({
            to: channelId,
            message: user + ' is ready to begin.'
          });
        }
      break;
      case 'unready':
        console.log('Unready player ' + user);
        if (!playerService.playerExists(userId)) {
          console.log('Player not Found');
          pugBot.sendMessage({to: channelId, message: user + ' has not joined this pug'});
        } else {
          playerService.unreadyPlayer(userId);
          pugBot.sendMessage({to: channelId, message: user + ' is not ready to begin.'});
        }
      break;
      case 'players':
        var readyPlayers = playerService.getReadyPlayerNames();
        var unreadyPlayers = playerService.getUnreadyPlayerNames();
        pugBot.sendMessage({to: channelId, message: 'Ready players: ' + JSON.stringify(readyPlayers)});
        pugBot.sendMessage({to: channelId, message: 'Unready players: ' + JSON.stringify(unreadyPlayers)});
      break;
      case 'setRegion':
        //Set Region for pug
        if (args[1] && (args[1] === pugConstants.NA || args[1] === pugConstants.EU)) {
          region = args[1];
          pugBot.sendMessage({
            to: channelId,
            message: 'Region being set to ' + region
          });
        }
      break;
      case 'voteMap':
        // vote for a map
        // TODO
      break;
      case 'end':
        //TODO
      break;
      case 'help':
        var helpMessage; // TODO: write this
        pugBot.sendMessage(channelId, helpMessage);
      break;
      case 'status':
        pugBot.sendMessage( channelId, JSON.stringify(pugSettings.status));
      break;
     }
  }
});
