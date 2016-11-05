import { Component } from '@angular/core';
import { GameController } from './game-controller';
import { RobotService } from './robot.service';
import { Coordinates } from './game-controller';

/**
 * Este componente es la interface de la capa de presentación 
 * con el controlador interno que dirige y mantiene el estado del juego.
 */
@Component({
	selector: 'board',
	templateUrl: './game-board.component.html',
	providers: [GameController, RobotService]
})
export class GameBoardComponent {

	constructor(private controller: GameController) {
	}

	statusMessage() {
		return this.controller.statusMessage();
	}

	userWinsCount() {
		return this.controller.userWinsCount;
	}

	robotPlayerWinsCount() {
		return this.controller.robotPlayerWinsCount;
	}

	tiesCount() {
		return this.controller.tiesCount;
	}

	newGame() { 
		this.controller.newGame();
	}
 
 	/**
 	 * Retorna el nombre del fichero con la imagen que debe pintarse
 	 * en una celda. Idealmente, esto debería resolverse en la capa de
 	 * presentación (HTML), pero las expresiones de Angular no permiten
 	 * evaluar condiciones con AND y OR.
 	 */
	imageFileAtCell(x: number, y: number) {
		if(this.controller.isEmptyAtCell(x, y)) {
			return "assets/empty_cell.svg";
		}
		if(this.controller.isUserPlayerAtCell(x, y)) {
			if(this.controller.isGameOverTies()) {
				return "assets/player_x_ties.svg";
			}
			if(this.winnerLineContains(x, y)) {
				return "assets/player_x_win.svg";
			}
			return "assets/player_x_normal.svg";
		}
		if(this.controller.isRobotPlayerAtCell(x, y)) {
			if(this.controller.isGameOverTies()) {
				return "assets/player_o_ties.svg";
			}
			if(this.winnerLineContains(x, y)) {
				return "assets/player_o_win.svg";
			}
			return "assets/player_o_normal.svg";
		}
	}

	isEmptyAtCell(x: number, y: number) {
		return this.controller.isEmptyAtCell(x, y);
	}

	isGameOver() {
		return this.controller.isGameOver();
	}

	isUserPlayerWinner() {
		return this.controller.isUserPlayerWinner();
	}	

	isRobotPlayerWinner() {
		return this.controller.isRobotPlayerWinner();
	}

	isGameOverTies() {
		return this.controller.isGameOverTies();
	}

	isWaitingForRobotPlayer() {
		return this.controller.isWaitingForRobotPlayer();
	}

	isErrorMessage() {
		return this.controller.isError();
	}

	winnerLineContains(x: number, y: number) {
		if(this.controller.isGameOver()) {
			let winnerLine: Array<Coordinates> = this.controller.winnerLine();
			for (let cell of winnerLine) {
				if(cell.x == x && cell.y == y) {
					return true;
				}
			}
		}
		return false;
	}

	selectCell(x: number, y: number) {
		this.controller.userSelectedCell(x, y);
	}

}

