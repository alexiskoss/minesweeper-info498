const { RtmClient, CLIENT_EVENTS, RTM_EVENTS, WebClient } = require('@slack/client');
const { createMessageAdapter } = require('@slack/interactive-messages');

// Cache of data
const appData: { [key: string]: any } = {};
const gameSize: number = 5;
let myTiles: any[] = [];
const numbers: { [key: number]: string } = { 1: ":one:", 2: ":two:", 3: ":three:", 4: ":four:", 5: ":five:" };
let flagModeOn: boolean = false;

const bot_token = TOKEN;
const slackMessages = createMessageAdapter(TOKEN);

// Initialize the RTM client with the recommended settings. Using the defaults for these
// settings is deprecated.
const rtm = new RtmClient(bot_token, {
  dataStore: false,
  useRtmConnect: true,
});

const web = new WebClient(bot_token);

// Attach action handlers by `callback_id`
// (See: https://api.slack.com/docs/interactive-message-field-guide#attachment_fields)
slackMessages.action('play_again', (payload: { [key: string]: any }) => {
  console.log(payload)
  // `payload` is JSON that describes an interaction with a message.
  console.log(`The user ${payload.user.name} in team ${payload.team.domain} pressed the welcome button`);

  // The `actions` array contains details about the specific action (button press, menu selection, etc.)
  const action = payload.actions[0];
  console.log(`The button had name ${action.name} and value ${action.value}`);

  // You should return a JSON object which describes a message to replace the original.
  // Note that the payload contains a copy of the original message (`payload.original_message`).
  const replacement = payload.original_message;

  if (action.value === 'start') {
    replacement.text = `${payload.user.name} started a new game of Minesweeper.`;
    let grid = "";

    let msgAttachments = [];

    //make array of the game tiles
    myTiles = new Array(gameSize)
    for (let i = 0; i < gameSize; i++) {
      myTiles[i] = new Array(gameSize)
      for (let j = 0; j < gameSize; j++) {
        myTiles[i][j] = { action: {}, mineCount: 0 };
      }
    }

    let gridNumber: number = 1;

    // row
    for (let i = 1; i <= 5; i++) {
      let actions = [];

      let attachmentObj: { [key: string]: any } = {
        "fallback": "You are unable to reveal a square.",
        "callback_id": "reveal",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": []
      }

      // columns
      for (let j = 1; j <= 5; j++) {
        let actionObj: { [key: string]: string } = {};
        let mineChance: Number = Math.floor(Math.random() * 100) + 1;

        //20% chance for a mine to appear
        if (mineChance <= 20) {
          actionObj = {
            "name": "mine",
            "text": ":bomb:",
            "type": "button",
            "value": `${i}, ${j}`
          }
          //console.log("sdfksdfjk;alsjdfSDFJSDFKDSJKAFLJASDKJF-12-32-103-12")
          //console.log(myTiles[i][j]);
          myTiles[i - 1][j - 1].action = actionObj;
          //myTiles[i - 1][j - 1].mineCount = -1;
        } else {
          actionObj = {
            "name": "unrevealed",
            "text": ":black_square:",
            "type": "button",
            "value": `${i}, ${j}`
          }
          //console.log("==-=-=-=---========---=-")
          //console.log(myTiles[i - 1][j - 1])
          myTiles[i - 1][j - 1].action = actionObj;
        }
        gridNumber++;
        actions[j - 1] = actionObj;
      }
      attachmentObj.actions = actions;
      msgAttachments.push(attachmentObj);
    }

    let flagAttachmentObj: { [key: string]: any } = {
      "fallback": "You are unable to change flag mode.",
      "callback_id": "flag_mode",
      "color": "#3AA3E3",
      "attachment_type": "default",
      "actions": [
        {
          "name": "flag a square",
          "text": "Enter flag mode :triangular_flag_on_post:",
          "type": "button",
          "value": "flag a square"
        }
      ]
    }
    msgAttachments.push(flagAttachmentObj)

    console.log("---------------________________-------->")

    countMines();
    console.log(myTiles);

    web.chat.postMessage(payload.channel.id, '', {
      attachments: msgAttachments
    })
      .then((res: { [key: string]: any }) => {
        // `res` contains information about the posted message
        console.log(res);
        console.log('Message sent: ', res.ts);
      })
      .catch(console.error);
  } else {
    replacement.text = `Try a game next time, ${payload.user.name}! :slightly_smiling_face:`;
    delete replacement.attachments[0].text;
  }

  // Typically, you want to acknowledge the action and remove the interactive elements from the message
  delete replacement.attachments[0].actions;
  return replacement;
});

// Attach action handlers by `callback_id`
// (See: https://api.slack.com/docs/interactive-message-field-guide#attachment_fields)
slackMessages.action('reveal', (payload: { [key: string]: any }) => {
  console.log("PAYLOAD!!!!")
  console.log(payload)
  console.log("PAYLAOD ATTACHMENTS!!!!")
  console.log(payload.original_message.attachments[0].actions)

  // `payload` is JSON that describes an interaction with a message.
  console.log(`The user ${payload.user.name} in team ${payload.team.domain} pressed the welcome button`);

  // The `actions` array contains details about the specific action (button press, menu selection, etc.)
  const action = payload.actions[0];
  console.log(`The button had name ${action.name} and value ${action.value}`);

  // You should return a JSON object which describes a message to replace the original.
  // Note that the payload contains a copy of the original message (`payload.original_message`).
  const replacement = payload.original_message;

  console.log("ORINGLA MSG1!!!!!!!!!");
  console.log(replacement);

  //////// MY CODE
  let tilePosition = action.value.split(",");
  let row: number = tilePosition[0];
  let col: number = tilePosition[1];

  console.log("%%%%%%%%")
  console.log(action.name);

  if (action.name == "unrevealed") { // MAKE CONSTANTS
    if(!flagModeOn) {
      revealBlanks(row - 1, col - 1);
    } else if (flagModeOn) {
      addFlag(row - 1, col - 1);
    }
    //replacement.attachments[row - 1].actions[col - 1] = myTiles[row - 1][col - 1].action;

  } else if(action.name == "mine" && flagModeOn) {
      addFlag(row - 1, col - 1);
  } else if (action.name == "mine" && !flagModeOn) {
    web.chat.postMessage(payload.channel.id, '', {
      attachments: [
        {
          "text": "Test your luck again?",
          "fallback": "Unable to choose command.",
          "callback_id": "play_again",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
            {
              "name": "play again",
              "text": "Play Again",
              "type": "button",
              "value": "play again"
            },
            {
              "name": "quit",
              "text": "Quit",
              "type": "button",
              "style": "danger",
              "value": "quit"
            }
          ]
        }
      ]
    })
      .then((res: { [key: string]: any }) => {
        // `res` contains information about the posted message
        console.log(res);
        console.log('Message sent: ', res.ts);
      })
      .catch(console.error);
  }

  for (let i = 0; i < gameSize; i++) {
    for (let j = 0; j < gameSize; j++) {
      replacement.attachments[i].actions[j] = myTiles[i][j].action;
    }
  }

  // Typically, you want to acknowledge the action and remove the interactive elements from the message
  //delete replacement.attachments[0].actions;
  return replacement;
});

// Attach action handlers by `callback_id`
// (See: https://api.slack.com/docs/interactive-message-field-guide#attachment_fields)
slackMessages.action('flag_mode', (payload: { [key: string]: any }) => {
  console.log("PAYLOAD!!!!")
  console.log(payload)
  console.log("PAYLAOD ATTACHMENTS!!!!")
  console.log(payload.original_message.attachments[0].actions)
  // `payload` is JSON that describes an interaction with a message.
  console.log(`The user ${payload.user.name} in team ${payload.team.domain} pressed the welcome button`);

  // The `actions` array contains details about the specific action (button press, menu selection, etc.)
  const action = payload.actions[0];

  console.log(`The button had name ${action.name} and value ${action.value}`);

  // You should return a JSON object which describes a message to replace the original.
  // Note that the payload contains a copy of the original message (`payload.original_message`).
  const replacement = payload.original_message;

  if(replacement.attachments[gameSize].actions[0].name == "flag a square") {
    flagModeOn = true;
    replacement.attachments[gameSize].actions[0].name = "exit flag mode"
    replacement.attachments[gameSize].actions[0].text = "Exit flag mode?"
    replacement.attachments[gameSize].actions[0].value = "exit flag mode"
  } else if(replacement.attachments[gameSize].actions[0].name == "exit flag mode") {
    flagModeOn = false;
    replacement.attachments[gameSize].actions[0].name = "flag a square"
    replacement.attachments[gameSize].actions[0].text = "Enter flag mode :triangular_flag_on_post:"
    replacement.attachments[gameSize].actions[0].value = "flag a square"
  }

  // Typically, you want to acknowledge the action and remove the interactive elements from the message
  //delete replacement.attachments[0].actions;
  return replacement;
});

// Start the built-in HTTP server
const port = process.env.PORT || 3000;
slackMessages.start(port).then(() => {
  console.log(`server listening on port ${port}`);
});

// The client will emit an RTM.AUTHENTICATED event on when the connection data is available
// (before the connection is open)
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (connectData: { [key: string]: any }) => {
  // Cache the data necessary for this app in memory
  console.log(connectData);
  appData.selfId = connectData.self.id;
  console.log(`Logged in as ${appData.selfId} of team ${connectData.team.id}`);
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message: { [key: string]: any }) {
  if (message.type === 'message' && message.text) {

    let command = message.text.replace(`<@${appData.selfId}>`, '').trim();
    let directChannelId;
    if (command.toLowerCase() === "start game") {
      web.im.open(message.user).then((res: { [key: string]: any }) => {
        // `res` contains information about the posted message
        directChannelId = res.channel.id;
        web.chat.postMessage(directChannelId, 'Would you like to play a game of Minesweeper?', {
          attachments: [
            {
              "fallback": "You are unable to start a game of Minesweeper.",
              "callback_id": "play_again",
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
          .then((res: { [key: string]: any }) => {
            // `res` contains information about the posted message
            console.log('Message sent: ', res.ts);
          })
          .catch(console.error);
      })
        .catch(console.error);
    }

  }
});

function addFlag(row: number, col: number):void {
  console.log("MY TILES IN ADD FLAG")
  console.log(myTiles[row][col].action.name)
  if(myTiles[row][col].action.name == "unrevealed") {
    myTiles[row][col].action.name = "unrevealed";
    myTiles[row][col].action.text = ":triangular_flag_on_post:"
  } else if(myTiles[row][col].action.name == "mine") {
    myTiles[row][col].action.name = "mine";
    myTiles[row][col].action.text = ":triangular_flag_on_post:"
  } 
}

function revealBlanks(row: number, col: number):void {
  //console.log("REVEAL LBANKS ------->>>>>>>")
  if (row >= 0 && row < gameSize && col >= 0 && col < gameSize) {
    //get bomb count
    if (myTiles[row][col].action.name == "unrevealed" && myTiles[row][col].mineCount == 0) {
      //console.log("REVEAL SQUARE-----!!!!!!!!!!")
      myTiles[row][col].action.name = "revealed";
      myTiles[row][col].action.text = ":white_square:"

      revealBlanks(row - 1, col);
      revealBlanks(row + 1, col);
      revealBlanks(row, col - 1);
      revealBlanks(row, col + 1);
      revealBlanks(row - 1, col - 1);
      revealBlanks(row - 1, col + 1);
      revealBlanks(row + 1, col + 1);
      revealBlanks(row + 1, col - 1);

    } else {
      let mineCount: number = myTiles[row][col].mineCount;
      if (mineCount > 0) {
        myTiles[row][col].action.name = "revealed";
        myTiles[row][col].action.text = numbers[mineCount];
      }
      return; //either is revealed already or has adjacent bombs
    }
  } else {
    return; //not in bounds, so don't bother checking
  }
}

function countMines():void {
  for (let i = 0; i < gameSize; i++) {
    for (let j = 0; j < gameSize; j++) {
      if (myTiles[i][j].action.name == "unrevealed") {

        if ((i - 1) >= 0) {
          myTiles[i][j].mineCount += myTiles[i - 1][j].action.name != "mine" ? 0 : 1;
        }

        if ((j + 1) < gameSize && (i - 1) >= 0) {
          myTiles[i][j].mineCount += myTiles[i - 1][j + 1].action.name != "mine" ? 0 : 1;
        }

        if ((j - 1) >= 0 && (i - 1) >= 0) {
          myTiles[i][j].mineCount += myTiles[i - 1][j - 1].action.name != "mine" ? 0 : 1;
        }

        if ((j - 1) >= 0) {
          myTiles[i][j].mineCount += myTiles[i][j - 1].action.name != "mine" ? 0 : 1;
        }

        if ((i + 1) < gameSize && (j - 1) >= 0) {
          myTiles[i][j].mineCount += myTiles[i + 1][j - 1].action.name != "mine" ? 0 : 1;
        }

        if ((i + 1) < gameSize) {
          myTiles[i][j].mineCount += myTiles[i + 1][j].action.name != "mine" ? 0 : 1;
        }

        if ((j + 1) < gameSize && (i + 1) < gameSize) {
          myTiles[i][j].mineCount += myTiles[i + 1][j + 1].action.name != "mine" ? 0 : 1;
        }

        if ((j + 1) < gameSize) {
          myTiles[i][j].mineCount += myTiles[i][j + 1].action.name != "mine" ? 0 : 1;
        }
      }
    }
  }
}

rtm.start();
