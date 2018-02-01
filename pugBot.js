'use strict';

const Discord = require('discord.js');
const _ = require('lodash');
const auth = require('./auth.js');
const pugConstants = require('./constants/pugConstants');
const playerService = require('./services/playerService');
const pugService = require('./services/pugService');

const pugBot = new Discord.Client();
const env = process.argv[2];
const botToken = env === 'dev' ? auth.dev : auth.prod;
const roleToPing = env === 'dev' ? 'BotTester' : 'Role Pug';

pugBot.login(botToken);

pugBot.on('ready', () => {
 console.log('Connected as ' + pugBot.user.username + '-' + pugBot.user.id);
 pugService.setPugToDefaultValues();
// console.log('connected to:' + JSON.stringify(pugBot.channels.findAll('type', 'text')));
});

pugBot.on('message', (message) => {
  let user = message.author;
  let channel = message.channel;
  if (message.content.charAt(0) === '.') {
    let args = message.content.substring(1).split(' ');
    let pugStatus = pugService.getStatus();
    let cmd = args[0];
    args = args.splice(1);

    switch(cmd) {
      case 'setup':
        if (pugStatus !== pugConstants.INACTIVE) {
          message.channel.send('Pug setup already in progress. Type \".join\" to join');
          break;
        }
        pugService.setupPug(user);
        pugBot.channel.send(message.channel.guild.roles.find("name", roleToPing) + ' ' + user.username + ' is starting a pug! Type \".join\" to join in.');
        //When server is fixed
//        _.forEach(pugBot.channels.findAll('type', 'text'), (channel) => {
//          channel.send(channel.guild.roles.find("name", roleToPing) + ' ' + user.username + ' is starting a pug! Type \".join\" to join in.');
//        });
      break;

      case 'join':
        // player added to pug roster
        if (pugStatus === pugConstants.INACTIVE) {
          message.channel.send('Pug setup not in progress. Type \".setup\" to start one');
          break;
        }
        if (pugStatus === pugConstants.FULL_NOT_READY || pugStatus === pugConstants.PLAYERS_READY) {
          message.channel.send('Sorry, this pug is full');
          break;
        }

        if(!playerService.playerExists(user)) {
          playerService.addPlayer(user, false);
          message.channel.send(user.username + ' has joined the pug ' + playerService.getPlayerCount() + '/10 have Joined');
          if (playerService.getPlayerCount() === 10) {
            pugService.setStatus(pugConstants.FULL_NOT_READY);
            message.channel.send('All slots claimed, ready up to begin');
          }
        } else{
          console.log('Duplicate Player');
          message.channel.send(user + ' has already joined the pug');
        }
      break;

      case 'leave':
        // player is removed from pug roster
        if (!playerService.playerExists(user)) {
          console.log('Player not Found');
          message.channel.send(user.username + ' has not joined this pug');
        } else {
          playerService.removePlayer(user);
          message.channel.send(user.username + ' has been removed from the pug ' + playerService.getPlayerCount() + '/10 have Joined');
        }
      break;

      case 'ready':
        console.log('Ready player ' + user);
        // player is ready for match to begin
        if (!playerService.playerExists(user)) {
          console.log('Player not Found');
          message.channel.send(user.username + ' has not joined this pug');
        } else {
          playerService.readyPlayer(user);
          message.channel.send(user.username + ' is ready to begin.');
        }
        if (playerService.getReadyPlayerNames().length === 10) {
          pugService.startPug();
        }
      break;

      case 'unready':
        console.log('Unready player ' + user);
        if (!playerService.playerExists(user)) {
          console.log('Player not Found');
          message.channel.send(user + ' has not joined this pug');
        } else {
          playerService.unreadyPlayer(user);
          message.channel.send(user + ' is not ready to begin.');
        }
      break;

      case 'players':
        let readyPlayers = playerService.getReadyPlayerNames();
        let unreadyPlayers = playerService.getUnreadyPlayerNames();
        message.channel.send('Ready players: ' + JSON.stringify(readyPlayers));
        message.channel.send('Unready players: ' + JSON.stringify(unreadyPlayers));
      break;

      case 'setRegion':
        //Set Region for pug
        let newRegion = args[0];
        let host = playerService.getHost();
        if(host.user.id === user.id) {
          pugService.setRegion(newRegion);
          console.log('Region has been set to ' + newRegion);
          message.channel.send('Region has been set to ' + pugService.getRegion());
        }
      break;

      case 'region':
          message.channel.send('Region is currently set to ' + pugService.getRegion());
      break;

      case 'voteMap':
        if (pugStatus === pugConstants.INACTIVE) {
          message.channel.send('Pug setup not in progress. Type \".setup\" to start one');
          break;
        }

        // vote for a map
        let mapVote = args[0];
        let mapIndex = _.findIndex(pugConstants.map_pool, (map) => {return map.toUpperCase() === mapVote.toUpperCase();});
        console.info(mapVote + ' ' + mapIndex);
        if (mapIndex === -1) {
          message.channel.send('invalid map');
          break;
        }
        let oldMapVote = playerService.getPlayerMapVote(user);
        if (oldMapVote !== 'none') {
          console.log('Player Has Voted for ' + oldMapVote);
          let oldVoteIndex = _.findIndex(pugConstants.map_pool, (map) => {return map.toUpperCase() === oldMapVote.toUpperCase();});
          pugService.subtractMapVote(oldVoteIndex);
        }
        pugService.voteMap(mapIndex, user);
        message.channel.send(user.username + ' has voted for ' + mapVote);
        console.log(user.username + 'voted for ' + mapVote);
      break;

      case 'currentMap':
        let currentMap = pugService.getCurrentMap;
        message.channel.send('Current map votes: ' + JSON.stringify(pugService.getCurrentMap()));
      break;

      case 'allMapVotes':
        message.channel.send('Current map votes: ' + JSON.stringify(pugService.getMapVotes()));
      break;

      case 'mapPool':
        message.channel.send('Current map pool: ' + pugConstants.map_pool);
      break;

      case 'help':
        message.channel.send(pugConstants.HELP_MESSAGE);
      break;

      case 'status':
        message.channel.send(JSON.stringify(pugStatus));
      break;

      case 'start':
        if (pugStatus === pugConstants.INACTIVE) {
          message.channel.send('Pug not started');
          break;
        }
        pugService.startPug();
      break;

      case 'end':
        if (pugStatus === pugConstants.INACTIVE) {
          message.channel.send('Pug not started');
          break;
        }
        if(pugService.getHost !== user) {
          message.channel.send('Host is abandoning the pug');
          pugService.setPugToDefaultValues();
        }
        console.log('Pug ended by Host ' + user);
      break;

      default:
        message.channel.send('Command not Recognized.');

     }
  }
});
