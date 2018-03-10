import {CellFactory, ActionObj} from './cellFactory'
import {Flag} from './flag';

const { RtmClient, CLIENT_EVENTS, RTM_EVENTS, WebClient } = require('@slack/client');
const { createMessageAdapter } = require('@slack/interactive-messages');

//IMPORTANT! SLACK TOKENS GO HERE
const bot_token = 'TOKEN';
const slackMessages = createMessageAdapter('TOKEN');

const appData: { [key: string]: any } = {}; // cache of data
const maxRowSize: number = 5; //can be any number within reason
const maxColSize: number = 5; //because of Slack limitations, the max column size can only be 5 OR less.
const numbers: { [key: number]: string } = { 1: ":one:", 2: ":two:", 3: ":three:", 4: ":four:", 5: ":five:", 6: ":six:", 7: ":seven:", 8: ":eight:", 9: ":nine:" };
const cellFactory = new CellFactory();

let gameTiles: any[] = [];
let flagModeOn: boolean = false;
let user: any = {}; //stores user state for multiple players at a time


// Initialize the RTM client with the recommended settings.
const rtm = new RtmClient(bot_token, {
  dataStore: false,
  useRtmConnect: true,
});

const web = new WebClient(bot_token);

// callback for app "start game" buttons
slackMessages.action('play', (payload: { [key: string]: any }) => {
  gameTiles = [];
  flagModeOn = false;

  const action: { [key: string]: any } = payload.actions[0];
  const replacementMsg: { [key: string]: any } = payload.original_message;

  if (action.value === 'start') {
    delete replacementMsg.attachments[0].text; //deletes original message attachments (aka buttons)
    replacementMsg.text = `${payload.user.name} started a new game of Minesweeper.`;

    let msgAttachments: { [key: string]: any } = [];
    let flag = new Flag(gameTiles);

    intializeGrid();

    //add to a Slack message
    let grid = populateGrid();
    let flagModeButton = flag.createFlagMode();

    msgAttachments = grid.concat(flagModeButton);

    countMines();

    web.chat.postMessage(payload.channel.id, '', {
      attachments: msgAttachments
    })
      .then((res: { [key: string]: any }) => {
        // `res` contains information about the posted message
      })
      .catch(console.error);
  } else {
    replacementMsg.text = `Try a game next time, ${payload.user.name}! :slightly_smiling_face:`;
    delete replacementMsg.attachments[0].text;
  }

  user[payload.user.id] = { "grid": gameTiles, "flag": flagModeOn };

  delete replacementMsg.attachments[0].actions;
  return replacementMsg;
});

// callback for app buttons that haven't been revealed
slackMessages.action('reveal', (payload: { [key: string]: any }) => {
  const action: { [key: string]: any } = payload.actions[0];
  const replacementMsg: { [key: string]: any } = payload.original_message;

  gameTiles = user[payload.user.id].grid;
  flagModeOn = user[payload.user.id].flag;

  let flag = new Flag(gameTiles);

  let tilePosition = action.value.split(",");
  let row: number = parseInt(tilePosition[0].trim()) - 1;
  let col: number = parseInt(tilePosition[1].trim()) - 1;

  const tileClicked = gameTiles[row][col];

  for (let gridRow: number = 0; gridRow < maxRowSize; gridRow++) {
    for (let gridCol: number = 0; gridCol < maxRowSize; gridCol++) {
      replacementMsg.attachments[gridRow].actions[gridCol] = gameTiles[gridRow][gridCol].action;
    }
  }

  //recurse over spaces or if in flag mode, only handle flags
  if (tileClicked.action.name == "unrevealed") {
    if (!flagModeOn) {
      revealEmptyCells(row, col);
    } else if (flagModeOn) {
      if (tileClicked.action.text != ":triangular_flag_on_post:") {
        flag.addFlag(row, col);
      } else {
        flag.removeFlag(row, col);
      }
    }
  } else if (tileClicked.action.name == "mine" && flagModeOn) { //if in mine & flag mode, don't detonate
    if (tileClicked.action.text != ":triangular_flag_on_post:") {
      flag.addFlag(row, col);
    } else {
      flag.removeFlag(row, col);
    }
  } else if (tileClicked.action.name == "mine" && !flagModeOn) { //if mine, detonate and lose
    replacementMsg.text = "";
    for (let gridRow: number = 0; gridRow < maxRowSize; gridRow++) {
      for (let gridCol: number = 0; gridCol < maxRowSize; gridCol++) {
        if (replacementMsg.attachments[gridRow].actions[gridCol].text == ":triangular_flag_on_post:" && replacementMsg.attachments[gridRow].actions[gridCol].name === "mine") {
          replacementMsg.text += " :bomb:"
        } else if (replacementMsg.attachments[gridRow].actions[gridCol].name === "mine") {
          replacementMsg.text += " :boom:";
        } else {
          replacementMsg.text += " :white_square:";
        }
      }
      replacementMsg.text += "\n";
    }
    replacementMsg.text += "You lost! :sob:"
    playAgain(payload.channel.id, replacementMsg);
  }

  //check win
  let didPlayerWin: boolean = checkWin();
  if (didPlayerWin) {
    replacementMsg.text = "";
    for (let gridRow: number = 0; gridRow < maxRowSize; gridRow++) {
      for (let gridCol: number = 0; gridCol < maxRowSize; gridCol++) {
        if (replacementMsg.attachments[gridRow].actions[gridCol].name === "mine") {
          if (gridRow == (row) && gridCol == (col)) {
            replacementMsg.text += " :collision:";
          } else {
            replacementMsg.text += " :bomb:";
          }
        } else {
          replacementMsg.text += " :white_square:";
        }
      }
      replacementMsg.text += "\n";
    }

    replacementMsg.text += "Congratulations, you won! :tada:"

    playAgain(payload.channel.id, replacementMsg);
  }
  
  user[payload.user.id] = { "grid": gameTiles, "flag": flagModeOn };
  return replacementMsg;
});

// callback for flag mode app button
slackMessages.action('flag_mode', (payload: { [key: string]: any }) => {
  const action: { [key: string]: any } = payload.actions[0];
  const replacementMsg: { [key: string]: any } = payload.original_message;
  let button: { [key: string]: any } = replacementMsg.attachments[maxRowSize].actions[0];

  if (button.name == "flag a square") {
    flagModeOn = true;
    user[payload.user.id].flag = flagModeOn;

    button.name = "exit flag mode"
    button.text = "Exit flag mode"
    button.value = "exit flag mode"
  } else if (button.name == "exit flag mode") {
    flagModeOn = false;
    user[payload.user.id].flag = flagModeOn;

    button.name = "flag a square"
    button.text = "Enter flag mode :triangular_flag_on_post:"
    button.value = "flag a square"
  }

  return replacementMsg;
});


function intializeGrid(): void {
  gameTiles = new Array(maxRowSize)
  for (let gridRow: number = 0; gridRow < maxRowSize; gridRow++) {
    gameTiles[gridRow] = new Array(maxRowSize)
    for (let gridCol: number = 0; gridCol < maxRowSize; gridCol++) {
      gameTiles[gridRow][gridCol] = { action: {}, mineCount: 0 };
    }
  }
}

function populateGrid(): {[key: string]: any} {
  let msgAttachments: {[key: string]: any} = [];
  
  // rows
  for (let gridRow: number = 0; gridRow < maxRowSize; gridRow++) {
    let actions: { [key: string]: any } = [];
    let attachmentObj: { [key: string]: any } = {
      "fallback": "You are unable to reveal a square.",
      "callback_id": "reveal",
      "color": "#3AA3E3",
      "attachment_type": "default",
      "actions": []
    }

    // columns
    for (let gridCol: number = 0; gridCol < maxColSize; gridCol++) {
      let actionObj: ActionObj;
      let mineChance: number = Math.floor(Math.random() * 100) + 1;

      //20% chance for a mine to appear
      if (mineChance <= 20) {
        actionObj = cellFactory.createCell("mine", `${gridRow + 1}, ${gridCol + 1}`) as ActionObj;
        gameTiles[gridRow][gridCol].action = actionObj;
      } else { //add empty cell
        actionObj = cellFactory.createCell("unrevealed", `${gridRow + 1}, ${gridCol + 1}`) as ActionObj;
        gameTiles[gridRow][gridCol].action = actionObj;
      }
      actions[gridCol] = actionObj;
    }
    attachmentObj.actions = actions;
    msgAttachments.push(attachmentObj);
  }
  return msgAttachments;
}

function revealEmptyCells(row: number, col: number): void {
  if (row >= 0 && row < maxRowSize && col >= 0 && col < maxRowSize) {
    let gridCell: { [key: string]: any } = gameTiles[row][col].action;
    let mineCount: number = gameTiles[row][col].mineCount;

    if (gridCell.name == "unrevealed" && mineCount == 0) {
      gridCell.name = "revealed";
      gridCell.text = ":white_square:"

      revealEmptyCells(row - 1, col);
      revealEmptyCells(row + 1, col);
      revealEmptyCells(row, col - 1);
      revealEmptyCells(row, col + 1);
      revealEmptyCells(row - 1, col - 1);
      revealEmptyCells(row - 1, col + 1);
      revealEmptyCells(row + 1, col + 1);
      revealEmptyCells(row + 1, col - 1);

    } else {
      if (mineCount > 0) {
        gridCell.name = "revealed";
        gridCell.text = numbers[mineCount];
      }
      return; //either is revealed already or has adjacent bombs
    }
  } else {
    return; //not in bounds, so don't bother checking
  }
}

function countMines(): void {
  for (let gridRow: number = 0; gridRow < maxRowSize; gridRow++) {
    for (let gridCol: number = 0; gridCol < maxRowSize; gridCol++) {
      let gridCell: {[key: string]: any} = gameTiles[gridRow][gridCol].action;

      if (gridCell.name == "unrevealed") {
        if ((gridRow - 1) >= 0) {
          gameTiles[gridRow][gridCol].mineCount += gameTiles[gridRow - 1][gridCol].action.name != "mine" ? 0 : 1;
          if ((gridCol + 1) < maxRowSize) {
            gameTiles[gridRow][gridCol].mineCount += gameTiles[gridRow - 1][gridCol + 1].action.name != "mine" ? 0 : 1;
          }
        }

        if ((gridCol - 1) >= 0) {
          gameTiles[gridRow][gridCol].mineCount += gameTiles[gridRow][gridCol - 1].action.name != "mine" ? 0 : 1;
          if ((gridRow - 1) >= 0) {
            gameTiles[gridRow][gridCol].mineCount += gameTiles[gridRow - 1][gridCol - 1].action.name != "mine" ? 0 : 1;
          }
        }

        if ((gridRow + 1) < maxRowSize) {
          gameTiles[gridRow][gridCol].mineCount += gameTiles[gridRow + 1][gridCol].action.name != "mine" ? 0 : 1;
          if ((gridCol - 1) >= 0) {
            gameTiles[gridRow][gridCol].mineCount += gameTiles[gridRow + 1][gridCol - 1].action.name != "mine" ? 0 : 1;
          }
        }

        if ((gridCol + 1) < maxRowSize) {
          gameTiles[gridRow][gridCol].mineCount += gameTiles[gridRow][gridCol + 1].action.name != "mine" ? 0 : 1;
          if ((gridRow + 1) < maxRowSize) {
            gameTiles[gridRow][gridCol].mineCount += gameTiles[gridRow + 1][gridCol + 1].action.name != "mine" ? 0 : 1;
          }
        }
      }
    }
  }
}

function checkWin(): boolean {
  for (let gridRow: number = 0; gridRow < maxRowSize; gridRow++) {
    for (let gridCol: number = 0; gridCol < maxRowSize; gridCol++) {
      if (gameTiles[gridRow][gridCol].action.name == "unrevealed") {
        return false;
      }
    }
  }
  return true;
}

function playAgain(channelId: string, replacementMsg: { [key: string]: any }): void {
  web.chat.postMessage(channelId, '', {
    attachments: [
      {
        "text": "Test your luck again?",
        "fallback": "Unable to choose command.",
        "callback_id": "play",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [
          cellFactory.createCell("start", "start"),
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

  for (let gridRow: number = 0; gridRow <= maxRowSize; gridRow++) {
    delete replacementMsg.attachments[gridRow].actions; // deletes the buttons when user chooses response
  }
}

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

// handles initial @ request to minesweeper bot
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message: { [key: string]: any }) {
  if (message.type === 'message' && message.text) {
    let command: string = message.text.replace(`<@${appData.selfId}>`, '').trim();
    let directChannelId: number;

    if (command.toLowerCase() === "start game") {
      web.im.open(message.user).then((res: { [key: string]: any }) => {
        directChannelId = res.channel.id;
        web.chat.postMessage(directChannelId, 'Would you like to play a game of Minesweeper?', {
          attachments: [
            {
              "fallback": "You are unable to start a game of Minesweeper.",
              "callback_id": "play",
              "color": "#3AA3E3",
              "attachment_type": "default",
              "actions": [
                cellFactory.createCell("start", "start"),
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

rtm.start();
