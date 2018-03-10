"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CellFactory {
    createCell(name, value) {
        if (name == "mine") {
            return new Action(name, ":bomb:", "button", value);
        }
        else if (name == "unrevealed") {
            return new Action(name, ":black_square:", "button", value);
        }
        else if (name == "flag a square") {
            return new Action(name, "Enter flag mode :triangular_flag_on_post:", "button", value);
        }
        else if (name == "start") {
            return new Action(name, "Start a game", "button", value);
        }
        return null;
    }
}
exports.CellFactory = CellFactory;
class Action {
    constructor(name, text, type, value) {
        this.name = name;
        this.text = text;
        this.type = type;
        this.value = value;
    }
}
exports.Action = Action;
