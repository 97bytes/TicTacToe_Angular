import { Component } from '@angular/core';
import { GameBoardComponent } from './game-board.component';
import { GameController } from './game-controller';

@Component({
  selector: 'tic-tac-toe',
  template: '<board></board>',  
  providers: [GameBoardComponent, GameController]
})
export class AppComponent {
	constructor(private board: GameBoardComponent, private controller: GameController) {
	}

}

