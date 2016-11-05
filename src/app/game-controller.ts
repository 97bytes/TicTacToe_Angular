import { Injectable } from '@angular/core';
import { Component } from '@angular/core';
import { RobotService } from './robot.service';
import { Http, Response, Headers } from '@angular/http';

/**
 * Esta clase es el cerebro que dirige el funcionamiento del juego entre
 * el usuario y el servicio remoto contra el que juega.
 * El estado del tablero se lleva en la clase Board y el juego pasa
 * por varios estados que se implementan con las subclases de State.
 * Las invocaciones al servicio remoto son realizadas desde RobotService (inyectado
 * como una dependencia).
 *
 */
@Injectable() 
export class GameController {
	state: State;
	board: Board;
	userWinsCount = 0;
	robotPlayerWinsCount = 0;
	tiesCount = 0;

	/**
	 * Se inyectan las dependencias de este controlador.
	 */
	constructor(private service: RobotService) {
		this.state = new InitState();
		this.board = new Board("---------");
	}

	/**
	 * Retorna un número entero elegido aleatoriamente de un rango.
	 */
	getRandomIntInclusive(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

    /**
     * Se inicializa una nueva partida.
     */
	newGame() {
		this.board = new Board("---------");
		let random = this.getRandomIntInclusive(1, 10);
		if(random > 5) {
			this.state = new WaitingForUserPlayer();
		} else {
			this.state = new WaitingForRobotPlayer();
			//this.robotPlay();
			this.robotPlayWithDelay();
		}
	}

	/**
	 * Retorna el mensaje que se muestra al usuario.
	 */
	statusMessage() {
		return this.state.statusMessage;
	}

	isEmptyAtCell(x: number, y: number) {
		return this.board.symbolAtCell(x, y) == "-";
	}

	isUserPlayerAtCell(x: number, y: number) {
		return this.board.symbolAtCell(x, y) == "X";
	}

	isRobotPlayerAtCell(x: number, y: number) {
		return this.board.symbolAtCell(x, y) == "O";
	}

	robotPlayWithDelay() {
		// Introduce a delay of 0.5 second for animations
		setTimeout(() => {this.robotPlay();}, 500);
	}

	/**
	 * Es el turno del robot. Se invoca al servicio remoto de forma asíncrona
	 * y se actualiza el tablero con el resultado (coordenadas de la celda elegida por el robot). Si ocurre un error durante la invocación, se muestra un mensaje al usuario.
	 */
	robotPlay() {
		let b = this.board.toString()
		let promise = this.service.play(b, "O", "X");
		promise.then(xy => {
			let x = xy.x
			let y = xy.y
			this.board.setSymbolAtCell(x, y, "O");
			this.validateGameOver();
			if(!this.isGameOver()) {
				this.state = new WaitingForUserPlayer();
			}
		}).catch(error => {
			this.state = new ErrorState('La conexión con el servidor remoto no funciona. Por favor, vuelve a jugar más tarde.');
			let s = error.status;
	  		console.error('Se produjo un error en el controller', error);
		});
	}
 
 	/**
 	 * El usuario ha hecho clic sobre una celda del tablero.
 	 */
	userSelectedCell(x: number, y: number) {
		this.state.selectCell(x, y, this);
	}

	/**
	 * Se valida si el estado actual del tablero indica que el juego ha terminado.
	 * Hay 4 situaciones:
	 * - El usuario ha ganado la partida
	 * - El robot ha ganado la partida
	 * - El juego no ha terminado
	 * - El juego ha terminado y no ha ganador (empate)
	 */
	validateGameOver() {
		let winnerLine = this.board.validateWinner("X");
		if(winnerLine != null) {
			this.state = new GameOverState(winnerLine, "X");
			this.userWinsCount = this.userWinsCount + 1
			return;
		}
		winnerLine = this.board.validateWinner("O");
		if(winnerLine != null) {
			this.state = new GameOverState(winnerLine, "O");
			this.robotPlayerWinsCount = this.robotPlayerWinsCount + 1;
			return;
		}
		if(this.state.isWaitingForRobotPlayer()) {
			// Valida si el usuario todavía puede ganar. Si no, el juego ha terminado y es un empate
			let continueGame = this.validateGameShouldContinue("X", "O", this.board);
			if (!continueGame) {
				this.state = new GameOverState([], null);
				this.tiesCount = this.tiesCount + 1;
			}
		} else if(this.state.isWaitingForUserPlayer()) {
			// Valida si el robot todavía puede ganar. Si no, el juego ha terminado y es un empate
			let continueGame = this.validateGameShouldContinue("O", "X", this.board);
			if (!continueGame) {
				this.state = new GameOverState([], null);
				this.tiesCount = this.tiesCount + 1;
			}
		}
	}

	/** 
	 * Retorna 'true' si el juego aún no ha terminado y es posible que algún jugador gane.
	 * Retorna 'false' si ya no es posible que alguno de los jugadores gane.
	 */
	validateGameShouldContinue(symbolPlayer1: string, symbolPlayer2: string, board: Board) {
		let h1 = new HorizontalStrategy(0, 0, symbolPlayer1, symbolPlayer2);
		let h2 = new HorizontalStrategy(0, 1, symbolPlayer1, symbolPlayer2);
		let h3 = new HorizontalStrategy(0, 2, symbolPlayer1, symbolPlayer2);
		let v1 = new VerticalStrategy(0, 0, symbolPlayer1, symbolPlayer2);
		let v2 = new VerticalStrategy(1, 0, symbolPlayer1, symbolPlayer2);
		let v3 = new VerticalStrategy(2, 0, symbolPlayer1, symbolPlayer2);
		let d1 = new DiagonalStrategy(0, 0, symbolPlayer1, symbolPlayer2);
		let d2 = new DiagonalStrategy(0, 2, symbolPlayer1, symbolPlayer2);
		let strategies : Array<Strategy> = [h1, h2, h3, v1, v2, v3, d1, d2];
		for (let strategy of strategies) {
			strategy.evaluateBoard(board);
		}
		strategies.sort(this.compareStrategies);
		let best = strategies[0];
		if(best.targetX != -1 && best.targetY != -1) {
			return true;
		} else {
			return false;
		}
	}

	numberOfRows() {
		return this.board.rows;
	}

	numberOfColumns() {
		return this.board.columns;
	}

	isInitState() {
		return this.state.isInitState();
	}

	isGameOver() {
		return this.state.isGameOverState();
	}

	isUserPlayerWinner() {
		return this.isGameOver() && this.state.winnerSymbol == "X";
	}	

	isRobotPlayerWinner() {
		return this.isGameOver() && this.state.winnerSymbol == "O";
	}

	isGameOverTies() {
		return this.isGameOver() && this.state.winnerSymbol == null;
	}

	isError() {
		return this.state.isErrorState();
	}

	winnerLine() {
		if(this.isGameOver()) {
			return this.state.winnerLine;
		} else {
			return [];
		}
	}

	isWaitingForUserPlayer() {
		return this.state.isWaitingForUserPlayer();
	}

	isWaitingForRobotPlayer() {
		return this.state.isWaitingForRobotPlayer();
	}

	/**
	 * Compara las estrategias de los parámetros y retorna una número que
	 * se usa para ordenarlas:
	 * -1 -> si s1 < s2
	 *  0 -> si s1 = s2
	 *  1 -> si s1 > s2
	 * Esto se usa para ordenar un array de estrategias evaluadas con el estado
	 * actual del tablero.
	 */
	compareStrategies(s1: Strategy, s2: Strategy) {
		if(!s1.isValid()) {
			if(!s2.isValid()) {
				return 0;  // misma prioridad porque ambas son inválidas.
			}
			return 1; // s1 tiene menos prioridad que s2 porque es inválida (y s2 no lo es)
		}
		if(!s2.isValid()) {
			return -1;  // s1 tiene más prioridad que s2 porque s2 es inválida (y s1 no lo es)
		}
		if(s1.steps == 1) {
			return -1;
		}
		if(s2.steps == 1) {
			return 1;
		}
		if(s1.steps < s2.steps) {
			return -1;
		} else if(s1.steps > s2.steps) {
			return 1;
		} else {
			return 0;
		}
	}	
}

/**
 * Este clase auxiliar representa las coordenadas de una celda en el tablero.
 */
export class Coordinates {
	x = -1;
	y = -1;
}

/*+
 * Esta clase guarda el estado interno del tablero de juego.
 */
export class Board {
	rows = 3;
	columns = 3;
	cells: Array<string> = [];    
	winnerLines = [ [{x:0, y:0}, {x:1, y:0}, {x:2, y:0}], [{x:0, y:1}, {x:1, y:1}, {x:2, y:1}],
			[{x:0, y:2}, {x:1, y:2}, {x:2, y:2}], [{x:0, y:0}, {x:0, y:1}, {x:0, y:2}],
			[{x:1, y:0}, {x:1, y:1}, {x:1, y:2}], [{x:2, y:0}, {x:2, y:1}, {x:2, y:2}],
			[{x:0, y:0}, {x:1, y:1}, {x:2, y:2}], [{x:0, y:2}, {x:1, y:1}, {x:2, y:0}] ];

	constructor(symbols: string = "---------") {
		this.rows = Math.sqrt(symbols.length);
		this.columns = this.rows;
		this.cells = [];
		for (var i = 0; i < symbols.length; i++) {
			this.cells.push(symbols.charAt(i).toString());
		}
	}

	symbolAtCell(x: number, y: number) {
		return this.cells[y * this.rows + x];
	}

	setSymbolAtCell(x: number, y: number, symbol: string) {
		this.cells[y * this.rows + x] = symbol;
	}

	/**
	* Controla si el jugador del símbolo es ganador. Si lo es,
	* retorna un array con la configuracion de las celdas que forma
	* la línea. Si no, retorna null
	*/
	validateWinner(symbol: string) {
		for (let line of this.winnerLines) {
			let cell0: Coordinates = line[0];
			let cell1: Coordinates = line[1];
			let cell2: Coordinates = line[2];
			if(this.symbolAtCell(cell0.x, cell0.y) == symbol &&
				this.symbolAtCell(cell1.x, cell1.y) == symbol &&
				this.symbolAtCell(cell2.x, cell2.y) == symbol) {
				let line0: Array<[number, number]> = [ [cell0.x, cell0.y], [cell1.x, cell1.y], [cell2.x, cell2.y]];
				let line: Array<Coordinates> = [cell0, cell1, cell2];
				return line;
			}
		}
		return null;
	}

	toString() {
		let result = "";
		for (let cell of this.cells) {
			result = result + cell;
		}
		return result;
	}

}

/**
 * Esta jerarquía de estados representan los estado internos del juego. El
 * controlador mantiene una instancia de estas clases que corresponde al estado
 * actual del juego en todo momento. Las transiciones entre los estados 
 * las gestiona el propio controlador (Ej: al reiniciar una partida) o el estado
 * actual (cuando cambia el turno de un jugador).
 */
export class State {
	winnerSymbol: string;
	winnerLine: Array<Coordinates> = [];
	statusMessage: string;

	isInitState() {
		return false;
	}

	isGameOverState() {
		return false;
	}

	isErrorState() {
		return false;
	}

	isWaitingForUserPlayer() {
		return false;
	}

	isWaitingForRobotPlayer() {
		return false;
	}

	selectCell(x: number, y: number, controller: GameController) {
	}

	robotPlay(controller: GameController) {
	}
}

export class InitState extends State {	

	constructor() {
		super();
		this.statusMessage = "Para comenzar la partida, haz clic en el botón.";
	}

	isInitState() {
		return true;
	}
}

export class WaitingForUserPlayer extends State {	

	constructor() {
		super();
		this.statusMessage = "Es tu turno.";
	}

	isWaitingForUserPlayer() {
		return true;
	}

	selectCell(x: number, y: number, controller: GameController) {
		controller.board.setSymbolAtCell(x, y, "X");
		controller.validateGameOver();
		if(!controller.isGameOver()) {
			controller.state = new WaitingForRobotPlayer();
			//controller.robotPlay();
			controller.robotPlayWithDelay();
		}
	}
}

export class WaitingForRobotPlayer extends State {	

	constructor() {
		super();
		this.statusMessage = "Turno del jugador remoto.";
	}

	isWaitingForRobotPlayer() {
		return true;
	}

	robotPlay(controller: GameController) {
		for (var y = 0; y < controller.numberOfRows(); y++) {
			for (var x = 0; x < controller.numberOfColumns(); x++) {
				if(controller.isEmptyAtCell(x, y)) {
					controller.board.setSymbolAtCell(x, y, "O");
					controller.validateGameOver();
					if(!controller.isGameOver()) {
						controller.state = new WaitingForUserPlayer();
					}
					return;
				}
			}
		}
	}

}

export class ErrorState extends State {	

	constructor(error: string) {
		super();
		this.statusMessage = error;
	}

	isErrorState() {
		return true;
	}

}

export class GameOverState extends State {	

	constructor(line: Array<Coordinates>, aSymbol: string) {
		super();
		this.winnerLine = line;
		this.winnerSymbol = aSymbol;

		if(this.winnerSymbol == "X") {
			this.statusMessage = "La partida ha terminado y tu has ganado.";
		} else if(this.winnerSymbol == "O") {
			this.statusMessage = "La partida ha terminado y el robot ha ganado.";
		} else if(this.winnerSymbol == null) {
			this.statusMessage = "La partida ha terminado sin ganador (empate).";
		}
	}

	isGameOverState() {
		return true;
	}

}

/**
 * Esta jerarquía de clases permiten evaluar las diferentes líneas para ganar el juego.
 * Cada 'estrategia' se evalúa contra el estado actual del tablero para determinar cuál
 * de todas es la mejor. Esto se utiliza para determinar si aún es posible que
 * alguno de los 2 jugadores gane o bien el juego debe terminarse porque ninguno tiene
 * posibilidades de ganar.
 */
class Strategy {
	steps: number;
	symbolPlayer1: string;
	symbolPlayer2: string;
	originX: number;
	originY: number;
	targetX: number;
	targetY: number;

	constructor(x: number, y: number, symbolPlayer1: string, symbolPlayer2: string) {
		this.originX = x;
		this.originY = y;
		this.steps = 0;
		this.symbolPlayer1 = symbolPlayer1;
		this.symbolPlayer2 = symbolPlayer2;
		this.targetX = -1;
		this.targetY = -1;
	}

	evaluateBoard(board: Board) {
	}

	isValid() {
		return this.targetX != -1 && this.targetY != -1;
	}

}	

export class HorizontalStrategy extends Strategy {

	constructor(x: number, y: number, symbolPlayer1: string, symbolPlayer2: string) {
		super(x, y, symbolPlayer1, symbolPlayer2);
	}

	evaluateBoard(board: Board) {
		this.targetX = -1;
		this.targetY = -1;
		this.steps = 3;
		for (var x = 0; x < 3; x++) {
			if(board.symbolAtCell(x, this.originY) == this.symbolPlayer2) {
				this.targetX = -1;
				this.targetY = -1;
				this.steps = 0;
				return;
			}
			if(board.symbolAtCell(x, this.originY) == "-" && this.targetX == -1 && this.targetY == -1) {
				this.targetX = x;
				this.targetY = this.originY;
			}
			if(board.symbolAtCell(x, this.originY) == this.symbolPlayer1) {
				this.steps = this.steps - 1;
			}
		}
		if(this.targetX == -1 && this.targetY == -1) {
			this.steps = 0;
		}
	}

}	

export class VerticalStrategy extends Strategy {

	constructor(x: number, y: number, symbolPlayer1: string, symbolPlayer2: string) {
		super(x, y, symbolPlayer1, symbolPlayer2);
	}

	evaluateBoard(board: Board) {
		this.targetX = -1;
		this.targetY = -1;
		this.steps = 3;
		for (var y = 0; y < 3; y++) {
			if(board.symbolAtCell(this.originX, y) == this.symbolPlayer2) {
				this.targetX = -1;
				this.targetY = -1;
				this.steps = 0;
				return;
			}
			if(board.symbolAtCell(this.originX, y) == "-" && this.targetX == -1 && this.targetY == -1) {
				this.targetX = this.originX;
				this.targetY = y;
			}
			if(board.symbolAtCell(this.originX, y) == this.symbolPlayer1) {
				this.steps = this.steps - 1;
			}
		}
		if(this.targetX == -1 && this.targetY == -1) {
			this.steps = 0;
		}

	}

}	

export class DiagonalStrategy extends Strategy {

	constructor(x: number, y: number, symbolPlayer1: string, symbolPlayer2: string) {
		super(x, y, symbolPlayer1, symbolPlayer2);
	}

	evaluateBoard(board: Board) {
		if(this.originX == 0 && this.originY == 0) {
			this.evaluateBoardRightDown(board);
		} else if(this.originX == 0 && this.originY == 2) {
			this.evaluateBoardLeftUp(board);
		}
	}

	/**
	 * Esta estrategia evalúa las opciones para la siguiente configuración de la línea, 
	 * comenzado en (0, 0):
	 *     X--
	 *     -X-
	 *     --X
	 */
	evaluateBoardRightDown(board: Board) {
		this.targetX = -1;
		this.targetY = -1;
		this.steps = 3;
		for (var i = 0; i < 3; i++) {
			let x = this.originX + i;
			let y = this.originY + i;
			if(board.symbolAtCell(x, y) == this.symbolPlayer2) {
				this.targetX = -1;
				this.targetY = -1;
				this.steps = 0;
				return;
			}
			if(board.symbolAtCell(x, y) == "-" && this.targetX == -1 && this.targetY == -1) {
				this.targetX = x;
				this.targetY = y;
			}
			if(board.symbolAtCell(x, y) == this.symbolPlayer1) {
				this.steps = this.steps - 1;
			}
		}
		if(this.targetX == -1 && this.targetY == -1) {
			this.steps = 0;
		}

	}

	/**
	 * Esta estrategia evalúa las opciones para la siguiente configuración de la línea, 
	 * comenzado en (0, 2):
	 *     --X
	 *     -X-
	 *     X--
	 */
	evaluateBoardLeftUp(board: Board) {
		this.targetX = -1;
		this.targetY = -1;
		this.steps = 3;
		for (var i = 0; i < 3; i++) {
			let x = this.originX + i;
			let y = this.originY - i;
			if(board.symbolAtCell(x, y) == this.symbolPlayer2) {
				this.targetX = -1;
				this.targetY = -1;
				this.steps = 0;
				return;
			}
			if(board.symbolAtCell(x, y) == "-" && this.targetX == -1 && this.targetY == -1) {
				this.targetX = x;
				this.targetY = y;
			}
			if(board.symbolAtCell(x, y) == this.symbolPlayer1) {
				this.steps = this.steps - 1;
			}
		}
		if(this.targetX == -1 && this.targetY == -1) {
			this.steps = 0;
		}

	}
}	
