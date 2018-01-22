var Discord = require('discord.io');
var _ = require('lodash');
var auth = require('./auth.json');
var pugConstants = require('./constants/pugConstants');

var mapName;
var mapVotes;
var players = [];
var status;
var region;

var pugBot = new Discord.Client({
  token: auth.token,
  autorun: true
});

var setDefaultPugValues = function () {
  mapName = 'Dust 2';
  mapVotes = 0;
  players = [];
  status = pugConstants.INACTIVE;
}

var addUserToPug = function (user, userId, isHost, channelId) {
  var player = {
    username: user,
    id: userId,
    host: isHost,
    ready: false
  }
  players.push(player);
}
var removeUserFromPug = function (user, userId, channelId) {
  players = players.filter(function (player) {
    if(player.host === true) {
      // TODO: NEW HOST
      return;
    }
    return player.id !== userId;
  });

  console.log(JSON.stringify(players));
}

var readyPlayer = function (userId, channelId) {
  _.forEach(players, function (player) {
    console.log(player);
    if (player.id === userId) {
      player.isReady = true;
      pugBot.sendMessage({
        to: channelId,
        message: player.username + ' is ready'
      });
    } else {
      console.log('Player not Found');
      pugBot.sendMessage({
        to: channelId,
        message: player.username + ' has not joined this pug'
      });
    }
  });
};

var unreadyPlayer = function (userId) {
  _.forEach(players, function (player) {
    if (player.id === userId) {
      player.isReady = false;
      pugBot.sendMessage({
        to: channelId,
        message: player.username + ' is no longer ready'
      });
    }
    console.log('Player not Found');
    pugBot.sendMessage({
      to: channelId,
      message: player.username + ' has not joined this pug'
    });
  });
};

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
     players: players,
     map: {
       mapName: mapName,
       mapVotes: mapVotes
     },
     serverRegion: region,
     status: status
   }
   switch(cmd) {
     case 'setup':
       //initial setup, gather players
       addUserToPug(user, userId, true);
       pugBot.sendMessage({
         to: channelId,
         message: user + ' is starting a pug! Type \".join\" to join in.'
       })
     break;
     case 'join':
       // player added to pug roster
       if (players.length === 10) {
         pugBot.sendMessage({
           to: channelId,
           message: 'Sorry, this pug is full'
         });
         break;
       } else {
       // TODO: Allow only unique Ids
         addUserToPug(user, userId, false, channelId);
         if (players.length === 10) {
           pugBot.sendMessage({
             to: channelId,
             message: 'All slots claimed, ready up to begin'
           });
         }
       }
     break;
     case 'ready':
       // player is ready for match to begin
       readyPlayer(userId, channelId);
     break;
     case 'unready':
       // player is no longer ready for match to start
       unreadyPlayer(userId, channelId);
     break;
     case 'leave':
       // player is removed from pug roster
       removeUserFromPug(userId);
     break;
     case 'setRegion':
       //Set Region for pug
       if (args[1] && (args[1] === pugConstants.NA || args[1] === pugConstants.EU)) {
         region = args[1];
       }
     break;
     case 'voteMap':
       // vote for a map
       // TODO
     break;
     case 'players':
       pugBot.sendMessage({
         to: channelId,
         message: JSON.stringify(pugSettings.players)
       });
     break;
     case 'readied':
     // TODO Collect and return readied players
       pugBot.sendMessage({
         to: channelId,
         message: JSON.stringify(pugSettings.players)
       });
     break;
     case 'help':
     var helpMessage; // TODO: write this
      pugBot.sendMessage({
        to: channelId,
        message: helpMessage
      });
     break;
     case 'pugStatus':
       pugBot.sendMessage({
         to: channelId,
         message: JSON.stringify(pugSettings)
       });
     break;
    }
 }
});
