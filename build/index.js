"use strict";
const { RtmClient, CLIENT_EVENTS, RTM_EVENTS, WebClient } = require('@slack/client');
const { createMessageAdapter } = require('@slack/interactive-messages');
// Cache of data
const appData = {};
const gameSize = 5;
let myTiles = [];
const numbers = { 0: ":zero:", 1: ":one:", 2: ":two:", 3: ":three:", 4: ":four:", 5: ":five:" };
const bot_token = 'xoxb-326564398054-lUIEzovkF6pUtbzuNpIPF1um';
const slackMessages = createMessageAdapter('sAcAKMnM7Y4x7RGLbYRdGwKp');
// Initialize the RTM client with the recommended settings. Using the defaults for these
// settings is deprecated.
const rtm = new RtmClient(bot_token, {
    dataStore: false,
    useRtmConnect: true,
});
const web = new WebClient(bot_token);
// Attach action handlers by `callback_id`
// (See: https://api.slack.com/docs/interactive-message-field-guide#attachment_fields)
slackMessages.action('play_again', (payload) => {
    console.log(payload);
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
        //make array of the game riles
        myTiles = new Array(gameSize);
        for (let i = 0; i < gameSize; i++) {
            myTiles[i] = new Array(gameSize);
            for (let j = 0; j < gameSize; j++) {
                myTiles[i][j] = { action: {}, mineCount: 0 };
            }
        }
        let gridNumber = 1;
        // row
        for (let i = 1; i <= 5; i++) {
            let actions = [];
            let attachmentObj = {
                "fallback": "You are unable to reveal a square.",
                "callback_id": "reveal",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": []
            };
            // columns
            for (let j = 1; j <= 5; j++) {
                let actionObj = {};
                let mineChance = Math.floor(Math.random() * 100) + 1;
                //20% chance for a mine to appear
                if (mineChance <= 20) {
                    actionObj = {
                        "name": "mine",
                        "text": ":bomb:",
                        "type": "button",
                        "value": `${i}, ${j}`
                    };
                    //console.log("sdfksdfjk;alsjdfSDFJSDFKDSJKAFLJASDKJF-12-32-103-12")
                    //console.log(myTiles[i][j]);
                    myTiles[i - 1][j - 1].action = actionObj;
                    //myTiles[i - 1][j - 1].mineCount = -1;
                }
                else {
                    actionObj = {
                        "name": "unrevealed",
                        "text": ":black_square:",
                        "type": "button",
                        "value": `${i}, ${j}`
                    };
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
        console.log("---------------________________-------->");
        countMines();
        console.log(myTiles);
        web.chat.postMessage(payload.channel.id, '', {
            attachments: msgAttachments
        })
            .then((res) => {
            // `res` contains information about the posted message
            console.log(res);
            console.log('Message sent: ', res.ts);
        })
            .catch(console.error);
    }
    else {
        replacement.text = `Try a game next time, ${payload.user.name}! :slightly_smiling_face:`;
    }
    // Typically, you want to acknowledge the action and remove the interactive elements from the message
    delete replacement.attachments[0].actions;
    return replacement;
});
// Attach action handlers by `callback_id`
// (See: https://api.slack.com/docs/interactive-message-field-guide#attachment_fields)
slackMessages.action('reveal', (payload) => {
    console.log("PAYLOAD!!!!");
    console.log(payload);
    console.log("PAYLAOD ATTACHMENTS!!!!");
    console.log(payload.original_message.attachments[0].actions);
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
    let row = tilePosition[0];
    let col = tilePosition[1];
    console.log("%%%%%%%%");
    console.log(action.name);
    if (action.name == "unrevealed") {
        revealBlanks(row - 1, col - 1);
        //replacement.attachments[col - 1].actions = tileAction;
        console.log("TILE ACT");
        //console.log(tileAction);
        console.log("****************************");
        //console.log(replacement.attachments[row - 1].actions[col - 1]);
        //console.log(myTiles[row-1][col-1]);
        for (let i = 0; i < gameSize; i++) {
            for (let j = 0; j < gameSize; j++) {
                replacement.attachments[i].actions[j] = myTiles[i][j].action;
            }
        }
        //replacement.attachments[row - 1].actions[col - 1] = myTiles[row - 1][col - 1].action;
    }
    else if (action.name == "bomb") {
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
            .then((res) => {
            // `res` contains information about the posted message
            console.log(res);
            console.log('Message sent: ', res.ts);
        })
            .catch(console.error);
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
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (connectData) => {
    // Cache the data necessary for this app in memory
    console.log(connectData);
    appData.selfId = connectData.self.id;
    console.log(`Logged in as ${appData.selfId} of team ${connectData.team.id}`);
});
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    if (message.type === 'message' && message.text) {
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
                    .then((res) => {
                    // `res` contains information about the posted message
                    console.log('Message sent: ', res.ts);
                })
                    .catch(console.error);
            })
                .catch(console.error);
        }
    }
});
function revealBlanks(row, col) {
    //console.log("REVEAL LBANKS ------->>>>>>>")
    if (row >= 0 && row < gameSize && col >= 0 && col < gameSize) {
        //get bomb count
        if (myTiles[row][col].action.name == "unrevealed" && myTiles[row][col].mineCount == 0) {
            //console.log("REVEAL SQUARE-----!!!!!!!!!!")
            myTiles[row][col].action.name = "revealed";
            myTiles[row][col].action.text = ":white_square:";
            revealBlanks(row - 1, col);
            revealBlanks(row + 1, col);
            revealBlanks(row, col - 1);
            revealBlanks(row, col + 1);
            revealBlanks(row - 1, col - 1);
            revealBlanks(row - 1, col + 1);
            revealBlanks(row + 1, col + 1);
            revealBlanks(row + 1, col - 1);
        }
        else {
            let mineCount = myTiles[row][col].mineCount;
            if (mineCount > 0) {
                myTiles[row][col].action.name = "revealed";
                myTiles[row][col].action.text = numbers[mineCount];
            }
            return; //either is revealed already or has adjacent bombs
        }
    }
    else {
        return; //not in bounds, so don't bother checking
    }
}
function countMines() {
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
