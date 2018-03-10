export class Flag {
  constructor(public gameTiles: any[] = []) {

  }

  public createFlagMode(): { [key: string]: any } {
    let msgAttachments: { [key: string]: any } = [];
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
    return msgAttachments;
  }

  public addFlag(row: number, col: number): void {
    let gridCell: { [key: string]: any } = this.gameTiles[row][col].action;

    if (gridCell.name == "unrevealed") {
      gridCell.text = ":triangular_flag_on_post:"
    } else if (gridCell.name == "mine") {
      gridCell.text = ":triangular_flag_on_post:"
    }
  }

  public removeFlag(row: number, col: number): void {
    let gridCell: { [key: string]: any } = this.gameTiles[row][col].action;

    if (gridCell.text == ":triangular_flag_on_post:") {
      gridCell.text = ":black_square:"
    }
  }
}