export interface ICellFactory {
    //abstract method
    createCell(name: string, value: string):ActionObj|null;
  }
  
  export class CellFactory implements ICellFactory {
    // equilateral triangle code: 
    // https://stackoverflow.com/questions/8935930/create-equilateral-triangle-in-the-middle-of-canvas
    createCell(name: string, value: string):ActionObj|null {
      if(name== "mine") {
        return new Action(name, ":bomb:", "button", value);
      } else if(name == "unrevealed") {
        return new Action(name, ":black_square:", "button", value);
      } else if(name == "flag a square") {
        return new Action(name, "Enter flag mode :triangular_flag_on_post:", "button", value);
      } else if(name == "start") {
        return new Action(name, "Start a game", "button", value);
      }

      return null;
    }
  }


export interface ActionObj {
    name: string;
    text: string;
    type: string;
    value: string;
 }

 export class Action implements ActionObj {
     constructor(public name: string, public text: string, public type: string, public value: string) {}
 }

