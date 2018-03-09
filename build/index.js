"use strict";
const { RtmClient, CLIENT_EVENTS, RTM_EVENTS, WebClient } = require('@slack/client');
const { createMessageAdapter } = require('@slack/interactive-messages');
// Cache of data
const appData = {};
const bot_token = 'xoxb-326564398054-lUIEzovkF6pUtbzuNpIPF1um';
const slackMessages = createMessageAdapter('NNZ7tILgfzV7QOdWoPFgm9mx');
// Initialize the RTM client with the recommended settings. Using the defaults for these
// settings is deprecated.
const rtm = new RtmClient(bot_token, {
    dataStore: false,
    useRtmConnect: true,
});
const web = new WebClient(bot_token);
// Attach action handlers by `callback_id`
// (See: https://api.slack.com/docs/interactive-message-field-guide#attachment_fields)
slackMessages.action('welcome_button', (payload) => {
    console.log(payload);
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
        };
        for (let j = 1; j <= 5; j++) {
            let actionObj = {
                "name": "square",
                "text": ":white_square:",
                "type": "button",
                "value": "square"
            };
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
        console.log(res);
        console.log('Message sent: ', res.ts);
    })
        .catch(console.error);
    if (action.value === 'start') {
        replacement.text = `${payload.user.name} started a new game of Minesweeper.`;
    }
    else {
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
});
rtm.start();
