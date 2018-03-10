"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Flag {
    constructor(gameTiles = []) {
        this.gameTiles = gameTiles;
    }
    createFlagMode() {
        let msgAttachments = [];
        let flagAttachmentObj = {
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
        };
        msgAttachments.push(flagAttachmentObj);
        return msgAttachments;
    }
    addFlag(row, col) {
        let gridCell = this.gameTiles[row][col].action;
        if (gridCell.name == "unrevealed") {
            gridCell.text = ":triangular_flag_on_post:";
        }
        else if (gridCell.name == "mine") {
            gridCell.text = ":triangular_flag_on_post:";
        }
    }
    removeFlag(row, col) {
        let gridCell = this.gameTiles[row][col].action;
        if (gridCell.text == ":triangular_flag_on_post:") {
            gridCell.text = ":black_square:";
        }
    }
}
exports.Flag = Flag;
