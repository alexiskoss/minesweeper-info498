const { RtmClient, CLIENT_EVENTS, RTM_EVENTS, WebClient } = require('@slack/client');
const { createMessageAdapter } = require('@slack/interactive-messages');

//IMPORTANT! SLACK TOKENS GO HERE
const bot_token = 'TOKEN';
const slackMessages = createMessageAdapter('TOKEN');

// Cache of data
const appData: { [key: string]: any } = {};
const maxRowSize: number = 5; //can be any number within reason
const maxColSize: number = 5; //because of Slack limitations, the max column size can only be 5 OR less.
const numbers: { [key: number]: string } = { 1: ":one:", 2: ":two:", 3: ":three:", 4: ":four:", 5: ":five:", 6: ":six:", 7: ":seven:", 8: ":eight:", 9: ":nine:"};
let gameTiles: any[] = [];
let flagModeOn: boolean = false;
let user: any = {};


// Initialize the RTM client with the recommended settings. Using the defaults for these
// settings is deprecated.
const rtm = new RtmClient(bot_token, {
  dataStore: false,
  useRtmConnect: true,
});

const web = new WebClient(bot_token);

slackMessages.action('play_again', (payload: { [key: string]: any }) => {
  gameTiles = [];
  flagModeOn = false;

  // `payload` is JSON that describes an interaction with a message.
  // The `actions` array contains details about the specific action (button press, menu selection, etc.)
  const action = payload.actions[0];



  // You should return a JSON object which describes a message to replace the original.
  // Note that the payload contains a copy of the original message (`payload.original_message`).
  const replacement = payload.original_message;

  if (action.value === 'start') {
    delete replacement.attachments[0].text;
    replacement.text = `${payload.user.name} started a new game of Minesweeper.`;
    let grid = "";

    let msgAttachments = [];

    //make array of the game tiles
    gameTiles = new Array(maxRowSize)
    for (let i = 0; i < maxRowSize; i++) {
      gameTiles[i] = new Array(maxRowSize)
      for (let j = 0; j < maxRowSize; j++) {
        gameTiles[i][j] = { action: {}, mineCount: 0 };
      }
    }

    let gridNumber: number = 1;

    // row
    for (let i = 1; i <= maxRowSize; i++) {
      let actions = [];

      let attachmentObj: { [key: string]: any } = {
        "fallback": "You are unable to reveal a square.",
        "callback_id": "reveal",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": []
      }

      // columns
      for (let j = 1; j <= maxColSize; j++) {
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
          gameTiles[i - 1][j - 1].action = actionObj;
        } else {
          actionObj = {
            "name": "unrevealed",
            "text": ":black_square:",
            "type": "button",
            "value": `${i}, ${j}`
          }
          gameTiles[i - 1][j - 1].action = actionObj;
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

    countMines();

    web.chat.postMessage(payload.channel.id, '', {
      attachments: msgAttachments
    })
      .then((res: { [key: string]: any }) => {
        // `res` contains information about the posted message
      })
      .catch(console.error);
  } else {
    replacement.text = `Try a game next time, ${payload.user.name}! :slightly_smiling_face:`;
    delete replacement.attachments[0].text;
  }

  user[payload.user.id] = {"grid": gameTiles, "flag": flagModeOn};

  // Typically, you want to acknowledge the action and remove the interactive elements from the message
  delete replacement.attachments[0].actions;
  return replacement;
});

slackMessages.action('reveal', (payload: { [key: string]: any }) => {
  
  gameTiles = user[payload.user.id].grid;
  flagModeOn = user[payload.user.id].flag;
  
  // The `actions` array contains details about the specific action (button press, menu selection, etc.)
  const action = payload.actions[0];

  // You should return a JSON object which describes a message to replace the original.
  // Note that the payload contains a copy of the original message (`payload.original_message`).
  const replacement = payload.original_message;

  let tilePosition = action.value.split(",");
  let row: number = parseInt(tilePosition[0].trim());
  let col: number = parseInt(tilePosition[1].trim());

  const tileClicked = gameTiles[row - 1][col - 1];

  for (let i = 0; i < maxRowSize; i++) {
    for (let j = 0; j < maxRowSize; j++) {
      replacement.attachments[i].actions[j] = gameTiles[i][j].action;
    }
  }

  //recurse over spaces or if in flag mode, only handle flags
  if (tileClicked.action.name == "unrevealed") { // MAKE CONSTANTS
    if (!flagModeOn) {
      revealBlanks(row - 1, col - 1);
    } else if (flagModeOn) {
      if (tileClicked.action.text != ":triangular_flag_on_post:") {
        addFlag(row - 1, col - 1);
      } else {
        removeFlag(row - 1, col - 1);
      }
    }
  } else if (tileClicked.action.name == "mine" && flagModeOn) { //if in mine & flag mode, don't detonate
    if (tileClicked.action.text != ":triangular_flag_on_post:") {
      addFlag(row - 1, col - 1);
    } else {
      removeFlag(row - 1, col - 1);
    }
  } else if (tileClicked.action.name == "mine" && !flagModeOn) { //if mine, detonate and lose
    replacement.text = "";
    for (let i: number = 0; i < maxRowSize; i++) {
      for (let j: number = 0; j < maxRowSize; j++) {
        if (replacement.attachments[i].actions[j].text == ":triangular_flag_on_post:" && replacement.attachments[i].actions[j].name === "mine") {
          replacement.text += " :bomb:"
        } else if (replacement.attachments[i].actions[j].name === "mine") {
          replacement.text += " :boom:";
        } else {
          replacement.text += " :white_square:";
        }
      }
      replacement.text += "\n";
    }
    replacement.text += "You lost! :sob:"
    playAgain(payload.channel.id);

    for (let i: number = 0; i <= maxRowSize; i++) {
      // Typically, you want to acknowledge the action and remove the interactive elements from the message
      delete replacement.attachments[i].actions;
    }
  }

  //check win
  let didPlayerWin: boolean = checkWin();
  if (didPlayerWin) {
    replacement.text = "";
    for (let i: number = 0; i < maxRowSize; i++) {
      for (let j: number = 0; j < maxRowSize; j++) {
        if (replacement.attachments[i].actions[j].name === "mine") {
          if (i == (row - 1) && j == (col - 1)) {
            replacement.text += " :collision:";
          } else {
            replacement.text += " :bomb:";
          }
        } else {
          replacement.text += " :white_square:";
        }
      }
      replacement.text += "\n";
    }

    replacement.text += "Congratulations, you won! :tada:"

    playAgain(payload.channel.id);

    for (let i: number = 0; i <= maxRowSize; i++) {
      // Typically, you want to acknowledge the action and remove the interactive elements from the message
      delete replacement.attachments[i].actions;
    }
  }
  user[payload.user.id] = {"grid": gameTiles, "flag": flagModeOn};
  return replacement;
});

slackMessages.action('flag_mode', (payload: { [key: string]: any }) => {
  // The `actions` array contains details about the specific action (button press, menu selection, etc.)
  const action = payload.actions[0];

  // You should return a JSON object which describes a message to replace the original.
  // Note that the payload contains a copy of the original message (`payload.original_message`).
  const replacement = payload.original_message;

  if (replacement.attachments[maxRowSize].actions[0].name == "flag a square") {
    flagModeOn = true;
    user[payload.user.id].flag = flagModeOn;
    replacement.attachments[maxRowSize].actions[0].name = "exit flag mode"
    replacement.attachments[maxRowSize].actions[0].text = "Exit flag mode"
    replacement.attachments[maxRowSize].actions[0].value = "exit flag mode"
  } else if (replacement.attachments[maxRowSize].actions[0].name == "exit flag mode") {
    flagModeOn = false;
    user[payload.user.id].flag = flagModeOn;
    replacement.attachments[maxRowSize].actions[0].name = "flag a square"
    replacement.attachments[maxRowSize].actions[0].text = "Enter flag mode :triangular_flag_on_post:"
    replacement.attachments[maxRowSize].actions[0].value = "flag a square"
  }

  // Typically, you want to acknowledge the action and remove the interactive elements from the message
  //delete replacement.attachments[0].actions;
  return replacement;
});

// Start the built-in HTTP server
const port = 3000;
slackMessages.start(port).then(() => {
  console.log(`server listening on port ${port}`);
});

// The client will emit an RTM.AUTHENTICATED event on when the connection data is available
// (before the connection is open)
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (connectData: { [key: string]: any }) => {
  // Cache the data necessary for this app in memory
  appData.selfId = connectData.self.id;
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
          })
          .catch(console.error);
      })
        .catch(console.error);
    }

  }
});

function checkWin(): boolean {
  for (let i: number = 0; i < maxRowSize; i++) {
    for (let j: number = 0; j < maxRowSize; j++) {
      if (gameTiles[i][j].action.name == "unrevealed") {
        return false;
      }
    }
  }
  return true;
}

function addFlag(row: number, col: number): void {
  if (gameTiles[row][col].action.name == "unrevealed") {
    gameTiles[row][col].action.text = ":triangular_flag_on_post:"
  } else if (gameTiles[row][col].action.name == "mine") {
    gameTiles[row][col].action.text = ":triangular_flag_on_post:"
  }
}

function removeFlag(row: number, col: number): void {
  if (gameTiles[row][col].action.text == ":triangular_flag_on_post:") {
    gameTiles[row][col].action.text = ":black_square:"
  }
}

function revealBlanks(row: number, col: number): void {
  if (row >= 0 && row < maxRowSize && col >= 0 && col < maxRowSize) {
    //get bomb count
    if (gameTiles[row][col].action.name == "unrevealed" && gameTiles[row][col].mineCount == 0) {
      gameTiles[row][col].action.name = "revealed";
      gameTiles[row][col].action.text = ":white_square:"

      revealBlanks(row - 1, col);
      revealBlanks(row + 1, col);
      revealBlanks(row, col - 1);
      revealBlanks(row, col + 1);
      revealBlanks(row - 1, col - 1);
      revealBlanks(row - 1, col + 1);
      revealBlanks(row + 1, col + 1);
      revealBlanks(row + 1, col - 1);

    } else {
      let mineCount: number = gameTiles[row][col].mineCount;
      if (mineCount > 0) {
        gameTiles[row][col].action.name = "revealed";
        gameTiles[row][col].action.text = numbers[mineCount];
      }
      return; //either is revealed already or has adjacent bombs
    }
  } else {
    return; //not in bounds, so don't bother checking
  }
}

function countMines(): void {
  for (let i = 0; i < maxRowSize; i++) {
    for (let j = 0; j < maxRowSize; j++) {
      if (gameTiles[i][j].action.name == "unrevealed") {

        if ((i - 1) >= 0) {
          gameTiles[i][j].mineCount += gameTiles[i - 1][j].action.name != "mine" ? 0 : 1;
        }

        if ((j + 1) < maxRowSize && (i - 1) >= 0) {
          gameTiles[i][j].mineCount += gameTiles[i - 1][j + 1].action.name != "mine" ? 0 : 1;
        }

        if ((j - 1) >= 0 && (i - 1) >= 0) {
          gameTiles[i][j].mineCount += gameTiles[i - 1][j - 1].action.name != "mine" ? 0 : 1;
        }

        if ((j - 1) >= 0) {
          gameTiles[i][j].mineCount += gameTiles[i][j - 1].action.name != "mine" ? 0 : 1;
        }

        if ((i + 1) < maxRowSize && (j - 1) >= 0) {
          gameTiles[i][j].mineCount += gameTiles[i + 1][j - 1].action.name != "mine" ? 0 : 1;
        }

        if ((i + 1) < maxRowSize) {
          gameTiles[i][j].mineCount += gameTiles[i + 1][j].action.name != "mine" ? 0 : 1;
        }

        if ((j + 1) < maxRowSize && (i + 1) < maxRowSize) {
          gameTiles[i][j].mineCount += gameTiles[i + 1][j + 1].action.name != "mine" ? 0 : 1;
        }

        if ((j + 1) < maxRowSize) {
          gameTiles[i][j].mineCount += gameTiles[i][j + 1].action.name != "mine" ? 0 : 1;
        }
      }
    }
  }
}

function playAgain(channelId: string) {
  web.chat.postMessage(channelId, '', {
    attachments: [
      {
        "text": "Test your luck again?",
        "fallback": "Unable to choose command.",
        "callback_id": "play_again",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [
          {
            "name": "start",
            "text": "Play Again",
            "type": "button",
            "value": "start"
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
    })
    .catch(console.error);
}

rtm.start();
