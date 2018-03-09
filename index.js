const { RtmClient, CLIENT_EVENTS, RTM_EVENTS, WebClient } = require('@slack/client');
const { createMessageAdapter } = require('@slack/interactive-messages');

// Cache of data
const appData = {};

const bot_token = INSERT_BOT_TOKEN;
const slackMessages = createMessageAdapter(INSERT_VERIFICATION_TOKEN);

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

  let msgAttachments = [];
  for (let i = 1; i <= 5; i++) {
    let actions = [];
    let attachmentObj = {
      "fallback": "You are unable to start a game of Minesweeper.",
      "callback_id": "revealed",
      "color": "#3AA3E3",
      "attachment_type": "default",
      "actions": []
    }

    for (let j = 1; j <= 5; j++) {
      let actionObj = {
        "name": "square",
        "text": ":white_square:",
        "type": "button",
        "value": "square"
      }
      actions[j - 1] = actionObj;
    }
    attachmentObj.actions = actions;
    msgAttachments.push(attachmentObj);
  }

  web.chat.postMessage(payload.channel.id, '', {
    attachments: msgAttachments
  })
  .then((res) => {
    // `res` contains information about the posted message
    console.log('Message sent: ', res.ts);
  })
  .catch(console.error);

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

    if (userName !== `@${robotName}`) {
      let command = message.text.replace(`<@${appData.selfId}>`, '').trim();
      let directChannelId;
      if (command.toLowerCase() === "start game") {
        web.im.open(message.user).then((res) => {
          // `res` contains information about the posted message
          directChannelId = res.channel.id;
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
      }
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
