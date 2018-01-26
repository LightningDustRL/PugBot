'use strict';

const Discord = require('discord.io');
const _ = require('lodash');
const auth = require('./auth.json');
const pugConstants = require('./constants/pugConstants');
const playerService = require('./services/playerService');
const pugService = require('./services/pugService');

const pugBot = new Discord.Client({
  token: auth.token,
  autorun: true
});

pugBot.on('ready',(evt) => {
 console.log('Connected');
 console.log('Logged in as: ');
 console.log(pugBot.username + ' - (' + pugBot.id + ')');
});

pugBot.on('message', (user, userId, channelId, message, evt) => {
  if (message.charAt(0) === '.') {
    let args = message.substring(1).split(' ');
    let cmd = args[0];
    args = args.splice(1);

    switch(cmd) {
      case 'setup':
        if (pugService.getStatus() !== pugConstants.INACTIVE) {
          pugBot.sendMessage({to: channelId, message: 'Pug setup already in progress. Type \".join\" to join'});
          break;
        }
        pugService.setupPug(user, userId);
        pugBot.sendMessage({to: channelId, message: user + ' is starting a pug! Type \".join\" to join in.'});
      break;

      case 'join':
        // player added to pug roster
        if (pugService.getStatus() === pugConstants.FULL_NOT_READY || pugService.getStatus() === pugConstants.PLAYERS_READY) {
          pugBot.sendMessage({to: channelId, message: 'Sorry, this pug is full'});
        } else {
          if(!playerService.playerExists(userId)) {
            playerService.addPlayer(user, userId, false, channelId);
            pugBot.sendMessage({to: channelId, message: user + ' has joined the pug ' + playerService.getPlayerCount() + '/10 have Joined'});
            if (playerService.getPlayerCount() === 10) {
              pugService.setStatus(pugConstants.FULL_NOT_READY);
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
        if (playerService.getReadyPlayerNames().length === 10) {
          _.forEach(playerService.getPlayers(), (player) => {
            console.log('Opening DM with ' + player.username);
            pugBot.createDMChannel(userId, (err, res) => {
              if (err) {
                console.log(err);
              } else {
                if (player !== playerService.getHost()) {
                  pugBot.sendMessage({
                    to: res.id,
                    message: 'Pug is starting! Match host is ' + playerService.getHost().username +' on '
                    + pugService.getPugSettings().map.mapName + ' in the ' + pugService.getRegion()  + ' region. ' +
                    'Passcode is ' + pugService.getPasscode() '. Players are ' + playerService.getReadyPlayerNames()
                  });
                } else {
                  pugBot.sendMessage({
                    to: res.id,
                    message: 'Pug is starting and you are the host. Host a game on the '+ pugService.getRegion()
                    + ' server on ' + pugService.getPugSettings().map.mapName ', with the passcode '
                    + pugService.getPasscode() + ' and start the match when everyone has connected.'
                  });
                }
               }
            });
          });
          console.log('Pug has begun, clearing player list and resetting pug to default values');
          pugService.setPugToDefaultValues();
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
        let readyPlayers = playerService.getReadyPlayerNames();
        let unreadyPlayers = playerService.getUnreadyPlayerNames();
        pugBot.sendMessage({to: channelId, message: 'Ready players: ' + JSON.stringify(readyPlayers)});
        pugBot.sendMessage({to: channelId, message: 'Unready players: ' + JSON.stringify(unreadyPlayers)});
      break;

      case 'setRegion':
        //Set Region for pug
        let newRegion = args[0];
        let host = playerService.getHost();
        let isValidRegion = _.includes(pugConstants.valid_regions, newRegion);
        if(host.id === userId) {
          if(isValidRegion) {
            pugService.setRegion(newRegion);
            console.log('Region has been set to ' + newRegion);
            pugBot.sendMessage({to: channelId, message: 'Region has been set to ' + pugService.getRegion()});
          } else {
            console.log('.setRegion failed ' + newRegion + 'is not a valid region');
            pugBot.sendMessage({to: channelId, message: newRegion + ' is not a valid region'});
          }
        }
      break;

      case 'getRegion':
          pugBot.sendMessage({to: channelId, message: 'Region is currently set to ' + pugService.getRegion()});
      break;

      case 'voteMap':
        // vote for a map
        let mapVote = args[0];
        let mapIndex = _.findIndex(pugConstants.map_pool, (map) => {return map.toUpperCase() == mapVote.toUpperCase();});
        console.info(mapVote + ' ' + mapIndex);
        if (mapIndex === -1) {
          pugBot.sendMessage({to: channelId, message: 'invalid map'});
          break;
        }
        if (playerService.getPlayerMapVote(userId) === undefined) {
          pugBot.sendMessage({to: channelId, message: user + ' has voted for ' + mapVote});
        }
        pugService.voteMap(mapIndex);
        console.log(user + 'voted for ' + mapVote);
      break;

      case 'mapVotes':
        pugBot.sendMessage({to: channelId, message: 'Current map votes: ' + JSON.stringify(pugService.getMapVotes())});
      break;

      case 'mapPool':
        pugBot.sendMessage({to: channelId, message: 'Current map pool: ' + pugConstants.map_pool});
      break;

      case 'help':
        pugBot.sendMessage({to: channelId, message: pugConstants.HELP_MESSAGE});
      break;

      case 'status':
        pugBot.sendMessage({to: channelId, message: JSON.stringify(pugService.getStatus())});
      break;

      case 'end':
        if(playerService.getHost().id === userId){
          pugBot.sendMessage({to: channelId, message: 'Host is abandoning the pug'});
          pugService.setPugToDefaultValues();
        }
        console.log('Pug ended by Host ' +userId);
      break;

      default:
        pugBot.sendMessage({to: channelId, message: 'Command not Recognized.'});

     }
  }
});
