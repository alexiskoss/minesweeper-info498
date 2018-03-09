const { RtmClient, CLIENT_EVENTS, RTM_EVENTS, WebClient } = require('@slack/client');
const { createMessageAdapter } = require('@slack/interactive-messages');

// Cache of data
const appData = {};

const bot_token = 'xoxb-326564398054-lUIEzovkF6pUtbzuNpIPF1um';
const slackMessages = createMessageAdapter('eH71IkILfKbZnKT1A5EpexLH');

// Initialize the RTM client with the recommended settings. Using the defaults for these
// settings is deprecated.
const rtm = new RtmClient(bot_token, {
  dataStore: false,
  useRtmConnect: true,
});

const web = new WebClient(bot_token);

const robotName = 'Minesweeper';
const allCommands = ['start game', 'command2'];

let users = [];

function executeCommand(command, args) {
  console.log(command, args);
}

function updateUsers(data) {
  users = data.members;
}

function getUsernameFromId(id) {
  const user = users.find(user => user.id === id);
  return user ? user.name : 'unknown member';
}


// Attach action handlers by `callback_id`
// (See: https://api.slack.com/docs/interactive-message-field-guide#attachment_fields)
slackMessages.action('welcome_button', (payload) => {
  console.log(payload)
  // `payload` is JSON that describes an interaction with a message.
  console.log(`The user ${payload.user.name} in team ${payload.team.domain} pressed the welcome button`);

  // The `actions` array contains details about the specific action (button press, menu selection, etc.)
  const action = payload.actions[0];
  console.log(`The button had name ${action.name} and value ${action.value}`);

  // You should return a JSON object which describes a message to replace the original.
  // Note that the payload contains a copy of the original message (`payload.original_message`).
  const replacement = payload.original_message;

  let grid = "";

  web.chat.postMessage(payload.channel.id, '', {
    attachments: [
      {
        "fallback": "You are unable to start a game of Minesweeper.",
        "callback_id": "row1",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          }
        ]
      },
      {
        "fallback": "You are unable to start a game of Minesweeper.",
        "callback_id": "row1",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          }
        ]
      },
      {
        "fallback": "You are unable to start a game of Minesweeper.",
        "callback_id": "row1",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          }
        ]
      },
      {
        "fallback": "You are unable to start a game of Minesweeper.",
        "callback_id": "row1",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          }
        ]
      },
      {
        "fallback": "You are unable to start a game of Minesweeper.",
        "callback_id": "row1",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          },
          ,
          {
            "name": "square",
            "text": ":white_square:",
            "type": "button",
            "value": "square"
          }
        ]
      }
    ]
  })
    .then((res) => {
      // `res` contains information about the posted message
      console.log('Message sent: ', res.ts);
    })
    .catch(console.error);

  /*for(let i = 1; i < 8; i++) {
    for(let j = 1; j < 8; j++) {
      let obj = {
        "id": j * i,
        "name": "grid",
        "text": ":white_square:",
        "type": "button",
        "value": `${i.toString()}, ${j.toString()}`,
        "style": ""
      }
      replacement.attachments[0].actions[j * i] = obj;
    }
  }*/

  for (let i = 1; i < 8; i++) {
    for (let j = 1; j < 8; j++) {
      grid += ":white_square:";
    }
    grid += "\n";
  }

  if (action.value === 'start') {
    replacement.text = `${payload.user.name} started a new game of Minesweeper.`;
  } else {
    replacement.text = `Sorry ${payload.user.name}.`;
  }

  // Typically, you want to acknowledge the action and remove the interactive elements from the message
  delete replacement.attachments[0].actions;
  return replacement;
});

// Start the built-in HTTP server
const port = process.env.PORT || 3000;
slackMessages.start(port).then(() => {
  console.log(`server listening on port ${port}`);
});

// The client will emit an RTM.AUTHENTICATED event on when the connection data is available
// (before the connection is open)
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (connectData) => {
  // Cache the data necessary for this app in memory
  console.log(connectData);
  appData.selfId = connectData.self.id;
  console.log(`Logged in as ${appData.selfId} of team ${connectData.team.id}`);
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (message.type === 'message' && message.text) {
    const userName = getUsernameFromId(message.user);
    /*console.log(message.text.indexOf(`@<${appData.selfId}>`) !== -1)
    console.log(message.text.indexOf(`@<${appData.selfId}>`))
    console.log(robotName)
    console.log(message.text)
    console.log(appData.selfId)
    console.log(`@<${appData.selfId}>`)*/
    if (userName !== `@${robotName}`) {
      /*if (message.text.indexOf(`<@${appData.selfId}>`) !== -1) {
          rtm.sendMessage('Hey ' + userName + ', I heard that!', message.channel);
      }*/

      let command = message.text.replace(`<@${appData.selfId}>`, '').trim();
      let directChannelId;
      if (command.toLowerCase() === "start game") {
        web.im.open(message.user).then((res) => {
          // `res` contains information about the posted message
          directChannelId = res.channel.id;
          console.log('IM: ', res);
          console.log(directChannelId)
          web.chat.postMessage(directChannelId, 'Would you like to play a game of Minesweeper?', {
            attachments: [
              {
                "fallback": "You are unable to start a game of Minesweeper.",
                "callback_id": "welcome_button",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                  {
                    "name": "start",
                    "text": "yes",
                    "type": "button",
                    "value": "start"
                  },
                  {
                    "name": "end",
                    "text": "no",
                    "style": "danger",
                    "type": "button",
                    "value": "end"
                  }
                ]
              }
            ]
          })
            .then((res) => {
              // `res` contains information about the posted message
              console.log('Message sent: ', res.ts);
            })
            .catch(console.error);
        })
          .catch(console.error);


        /*webHook.send({
          "text": "Would you like to play a game of Minesweeper?",
          "attachments": [
              {
                  "fallback": "You are unable to start a game of Minesweeper.",
                  "callback_id": "welcome_button",
                  "color": "#3AA3E3",
                  "attachment_type": "default",
                  "actions": [
                      {
                          "name": "start",
                          "text": "yes",
                          "type": "button",
                          "value": "start"
                      },
                      {
                        "name": "end",
                        "text": "no",
                        "type": "button",
                        "value": "end"
                    }
                  ]
              }
          ]
        })*/
        //rtm.sendMessage('Hey ' + userName + ', let\'s start a game of Minesweeper! ✨', message.channel);
      }
      /*console.log(message.text.indexOf(':'))
      console.log(message.text.indexOf(':') !== -1)
      if (message.text.indexOf(':') !== -1) {
        let splitMessage = message.text.split(":"); // splits on command
        let command = splitMessage[0].split(" ")[1]
        if(allCommands.includes(command)) {
          console.log("found")
        }
      }*/
    }
  }
});

web.users.list((err, data) => {
  if (err) {
    console.error('web.users.list Error:', err);
  } else {
    updateUsers(data);
  }
});

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  // For structure of `message`, see https://api.slack.com/events/message

  // Skip messages that are from a bot or my own user ID
  if ((message.subtype && message.subtype === 'bot_message') ||
    (!message.subtype && message.user === appData.selfId)) {
    return;
  }

  // Log the message
  console.log('New message: ', message);
});

rtm.start();





/*const { RtmClient, CLIENT_EVENTS, RTM_EVENTS, WebClient } = require('@slack/client');

// An access token (from your Slack app or custom integration - usually xoxb)
const token = 'xoxb-326672298134-T7tcIz9y96oNEI4Rubfswxrl';

// Cache of data
const appData = {};

// Initialize the RTM client with the recommended settings. Using the defaults for these
// settings is deprecated.
const rtm = new RtmClient(token, {
  dataStore: false,
  useRtmConnect: true,
});

// Need a web client to find a channel where the app can post a message
const web = new WebClient(token);

// Load the current channels list asynchrously
let channelsListPromise = web.channels.list();

// The client will emit an RTM.AUTHENTICATED event on when the connection data is available
// (before the connection is open)
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (connectData) => {
  // Cache the data necessary for this app in memory
  console.log(connectData);
  appData.selfId = connectData.self.id;
  console.log(`Logged in as ${appData.selfId} of team ${connectData.team.id}`);
});

// The client will emit an RTM.RTM_CONNECTION_OPENED the connection is ready for
// sending and receiving messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  console.log(`Ready`);

  web.channels.list((err, res) => {
    if (err) {
      return console.error(err);
    }
  
    // `res` contains information about the channels
    res.channels.forEach(c => {
      console.log(c.name);
    });
  });
  
  
  // Wait for the channels list response
  channelsListPromise.then((res) => {

    // Take any channel for which the bot is a member
    const channel = res.channels.find(c => c.name == "minesweeper_game");

    if (channel) {
      // We now have a channel ID to post a message in!
      // use the `sendMessage()` method to send a simple string to a channel using the channel ID
      rtm.sendMessage('Hello, world!', channel.id)
        // Returns a promise that resolves when the message is sent
        .then(() => console.log(`Message sent to channel ${channel.name}`))
        .catch(console.error);
    } else {
      console.log('This bot does not belong to any channels, invite it to at least one and try again');
    }
  });
});

rtm.on(RTM_EVENTS.MESSAGE, (message) => {
  // For structure of `message`, see https://api.slack.com/events/message

  // Skip messages that are from a bot or my own user ID
  if ( (message.subtype && message.subtype === 'bot_message') ||
       (!message.subtype && message.user === appData.selfId) ) {
    return;
  }

  // Log the message
  console.log('New message: ', message);
});

// Start the connecting process
rtm.start();*/
