import { GameController, Board, HorizontalStrategy, VerticalStrategy, DiagonalStrategy, WaitingForRobotPlayer, WaitingForUserPlayer } from './game-controller';

describe('GameController', () => {
  it('newGame()', () => {
  	let controller: GameController = new GameController(null);
    expect(controller.isInitState()).toEqual(true);
    expect(controller.board.cells).toEqual(["-", "-", "-", "-", "-", "-", "-", "-", "-"]);
  });

  /**
   * ---
   * ---
   * ---
   * Must continue in the previous state
   */  
  it('validateGameOverEmptyBoard()', () => {
  	let controller: GameController = new GameController(null);
    controller.board = new Board("---------")
  	controller.validateGameOver();
    expect(controller.isGameOver()).toEqual(false);
    expect(controller.isUserPlayerWinner()).toEqual(false);
    expect(controller.isRobotPlayerWinner()).toEqual(false);
    expect(controller.isGameOverTies()).toEqual(false);
    let line = controller.winnerLine();
    expect(line).toEqual([]);
  });

  /**
   * XXX
   * ---
   * ---
   * Must change to state GameOver and user player wins (X)
   */  
  it('validateGameOverWinner1()', () => {
  	let controller: GameController = new GameController(null);
    controller.board = new Board("XXX------")
  	controller.validateGameOver();
    expect(controller.isGameOver()).toEqual(true);
    expect(controller.isUserPlayerWinner()).toEqual(true);
    expect(controller.isRobotPlayerWinner()).toEqual(false);
    expect(controller.isGameOverTies()).toEqual(false);
    let line = controller.winnerLine();
    expect(line).toEqual([{x:0, y:0}, {x:1, y:0}, {x:2, y:0}]);
  });

  /**
   * O--
   * -O-
   * --O
   * Must change to state GameOver and robot player wins (O)
   */  
  it('validateGameOverWinner2()', () => {
  	let controller: GameController = new GameController(null);
    controller.board = new Board("O---O---O")
  	controller.validateGameOver();
    expect(controller.isGameOver()).toEqual(true);
    expect(controller.isUserPlayerWinner()).toEqual(false);
    expect(controller.isRobotPlayerWinner()).toEqual(true);
    expect(controller.isGameOverTies()).toEqual(false);
    let line = controller.winnerLine();
    expect(line).toEqual([{x:0, y:0}, {x:1, y:1}, {x:2, y:2}]);
  });

  /**
   * XOX
   * OXO
   * -X-
   * The game cannot continue for robot player (O). Must change to state GameOver, with no winners
   */  
  it('validateGameOverCannotContinue1()', () => {
    let controller: GameController = new GameController(null);
    controller.state = new WaitingForUserPlayer(); 
    controller.board = new Board("XOXOXO-X-")
    controller.validateGameOver();
    expect(controller.isGameOver()).toEqual(true);
    expect(controller.isUserPlayerWinner()).toEqual(false);
    expect(controller.isRobotPlayerWinner()).toEqual(false);
    expect(controller.isGameOverTies()).toEqual(true);
    let line = controller.winnerLine();
    expect(line).toEqual([]);
  });

  /**
   * XOX
   * OXO
   * -X-
   * The game can continue for user player (X). Must remain in the same state.
   */  
  it('validateGameOverCanContinue1()', () => {
    let controller: GameController = new GameController(null);
    controller.state = new WaitingForRobotPlayer(); 
    controller.board = new Board("XOXOXO-X-")
    controller.validateGameOver();
    expect(controller.isGameOver()).toEqual(false);
    expect(controller.isUserPlayerWinner()).toEqual(false);
    expect(controller.isRobotPlayerWinner()).toEqual(false);
    expect(controller.isGameOverTies()).toEqual(false);
    let line = controller.winnerLine();
    expect(line).toEqual([]);
  });

  /**
   * O--
   * -XX
   * --O
   * The game can continue for user player (X). Must remain in the same state.
   */  
  it('validateGameOverCanContinue2()', () => {
    let controller: GameController = new GameController(null);
    controller.state = new WaitingForRobotPlayer(); 
    controller.board = new Board("O---XX--O")
    controller.validateGameOver();
    expect(controller.isGameOver()).toEqual(false);
    expect(controller.isUserPlayerWinner()).toEqual(false);
    expect(controller.isRobotPlayerWinner()).toEqual(false);
    let line = controller.winnerLine();
    expect(line).toEqual([]);
  });

});

describe('Board', () => {
  it('symbolAtCell()', () => {
  	let board: Board = new Board("--X-OX--X");
    expect(board.symbolAtCell(0, 0)).toEqual("-");
    expect(board.symbolAtCell(2, 0)).toEqual("X");
    expect(board.symbolAtCell(1, 1)).toEqual("O");
    expect(board.symbolAtCell(0, 0)).toEqual("-");
    expect(board.symbolAtCell(2, 2)).toEqual("X");
  });

  it('setSymbolAtCell()', () => {
  	let board: Board = new Board("---------");
    expect(board.symbolAtCell(0, 0)).toEqual("-");
	board.setSymbolAtCell(0, 0, "X");
    expect(board.symbolAtCell(0, 0)).toEqual("X");

    expect(board.symbolAtCell(1, 1)).toEqual("-");
	board.setSymbolAtCell(1, 1, "O");
    expect(board.symbolAtCell(1, 1)).toEqual("O");

    expect(board.symbolAtCell(0, 2)).toEqual("-");
	board.setSymbolAtCell(0, 2, "O");
    expect(board.symbolAtCell(0, 2)).toEqual("O");

    expect(board.symbolAtCell(2, 2)).toEqual("-");
	board.setSymbolAtCell(2, 2, "X");
    expect(board.symbolAtCell(2, 2)).toEqual("X");
  });

  it('isWinner1()', () => {
  	let board: Board = new Board("---------");
    expect(board.validateWinner("X")).toBeNull();
    expect(board.validateWinner("O")).toBeNull();
  });

  it('isWinner2()', () => {
  	let board: Board = new Board("XXXO-O---");
    expect(board.validateWinner("X")).not.toBeNull();
    expect(board.validateWinner("O")).toBeNull();
  });

  it('isWinner3()', () => {
  	let board: Board = new Board("O-OXXX---");
    expect(board.validateWinner("X")).not.toBeNull();
    expect(board.validateWinner("O")).toBeNull();
  });

  it('isWinner4()', () => {
  	let board: Board = new Board("O-O---XXX");
    expect(board.validateWinner("X")).not.toBeNull();
    expect(board.validateWinner("O")).toBeNull();
  });

  it('isWinner5()', () => {
  	let board: Board = new Board("XOOOXOOOX");
    expect(board.validateWinner("X")).not.toBeNull();
    expect(board.validateWinner("O")).toBeNull();
  });

  it('isWinner6()', () => {
  	let board: Board = new Board("--XOXOX--");
    expect(board.validateWinner("X")).not.toBeNull();
    expect(board.validateWinner("O")).toBeNull();
  });

  it('isWinner7()', () => {
  	let board: Board = new Board("X--X--X--");
    expect(board.validateWinner("X")).not.toBeNull();
    expect(board.validateWinner("O")).toBeNull();
  });

  it('isWinner8()', () => {
  	let board: Board = new Board("-X--X--X-");
    expect(board.validateWinner("X")).not.toBeNull();
    expect(board.validateWinner("O")).toBeNull();
  });

  it('isWinner9()', () => {
  	let board: Board = new Board("--X--X--X");
    expect(board.validateWinner("X")).not.toBeNull();
    expect(board.validateWinner("O")).toBeNull();
  });

});

describe('HorizontalStrategy', () => {
  /**
   * ---     O--
   * ---  -> ---
   * ---     ---
   */  
  it('evaluateBoardEmpty()', () => {
    let strategy = new HorizontalStrategy(0, 0, "O", "X");
    let board: Board = new Board("---------");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(0);
    expect(strategy.targetY).toEqual(0);
    expect(strategy.steps).toEqual(3);
  });
  /**
   * XXX     XXX
   * XXX  -> XXX
   * XXX     XXX
   */  
  it('evaluateBoardFull1()', () => {
    let strategy = new HorizontalStrategy(0, 0, "O", "X");
    let board: Board = new Board("XXXXXXXXX");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(-1);
    expect(strategy.targetY).toEqual(-1);
    expect(strategy.steps).toEqual(0);
  });
  /**
   * OOO     OOO
   * OOO  -> OOO
   * OOO     OOO
   */  
  it('evaluateBoardFull2()', () => {
    let strategy = new HorizontalStrategy(0, 0, "O", "X");
    let board: Board = new Board("OOOOOOOOO");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(-1);
    expect(strategy.targetY).toEqual(-1);
    expect(strategy.steps).toEqual(0);
  });
  /**
   * OO-     OOO
   * XXX  -> XXX
   * XXX     XXX
   * Starting from (0,0)
   */
  it('evaluateBoard1()', () => {
    let strategy = new HorizontalStrategy(0, 0, "O", "X");
    let board: Board = new Board("OO-XXXXXX");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(2);
    expect(strategy.targetY).toEqual(0);
    expect(strategy.steps).toEqual(1);
  });
  /**
   * OO-     OO-
   * XXX  -> XXX
   * XXX     XXX
   * Starting from (0,1)
   */
  it('evaluateBoard2()', () => {
    let strategy = new HorizontalStrategy(0, 1, "O", "X");
    let board: Board = new Board("OO-XXXXXX");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(-1);
    expect(strategy.targetY).toEqual(-1);
    expect(strategy.steps).toEqual(0);
  });
  /**
   * OO-     OO-
   * XXX  -> XXX
   * XXX     XXX
   * Starting from (0,2)
   */
  it('evaluateBoard3()', () => {
    let strategy = new HorizontalStrategy(0, 2, "O", "X");
    let board: Board = new Board("OO-XXXXXX");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(-1);
    expect(strategy.targetY).toEqual(-1);
    expect(strategy.steps).toEqual(0);
  });
  /**
   * XO-     XO-
   * O--  -> OO-
   * XXO     XXO
   * Starting from (0,1)
   */
  it('evaluateBoard4()', () => {
    let strategy = new HorizontalStrategy(0, 1, "O", "X");
    let board: Board = new Board("XO-O--XXO");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(1);
    expect(strategy.targetY).toEqual(1);
    expect(strategy.steps).toEqual(2);
  });

  /**
   * XO-     XO-
   * ---  -> ---
   * OO-     OOO
   * Starting from (0,2)
   */
  it('evaluateBoard5()', () => {
    let strategy = new HorizontalStrategy(0, 2, "O", "X");
    let board: Board = new Board("XO----OO-");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(2);
    expect(strategy.targetY).toEqual(2);
    expect(strategy.steps).toEqual(1);
  });

});

describe('VerticalStrategy', () => {
  /**
   * ---     O--
   * ---  -> ---
   * ---     ---
   */  
  it('evaluateBoardEmpty()', () => {
    let strategy = new VerticalStrategy(0, 0, "O", "X");
    let board: Board = new Board("---------");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(0);
    expect(strategy.targetY).toEqual(0);
    expect(strategy.steps).toEqual(3);
  });
  /**
   * XXX     XXX
   * XXX  -> XXX
   * XXX     XXX
   */  
  it('evaluateBoardFull1()', () => {
    let strategy = new VerticalStrategy(0, 0, "O", "X");
    let board: Board = new Board("XXXXXXXXX");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(-1);
    expect(strategy.targetY).toEqual(-1);
    expect(strategy.steps).toEqual(0);
  });
  /**
   * OOO     OOO
   * OOO  -> OOO
   * OOO     OOO
   */  
  it('evaluateBoardFull2()', () => {
    let strategy = new VerticalStrategy(0, 0, "O", "X");
    let board: Board = new Board("OOOOOOOOO");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(-1);
    expect(strategy.targetY).toEqual(-1);
    expect(strategy.steps).toEqual(0);
  });
  /**
   * OXX     OXX
   * OXX  -> OXX
   * -XX     OXX
   * Starting from (0,0)
   */
  it('evaluateBoard1()', () => {
    let strategy = new VerticalStrategy(0, 0, "O", "X");
    let board: Board = new Board("OXXOXX-XX");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(0);
    expect(strategy.targetY).toEqual(2);
    expect(strategy.steps).toEqual(1);
  });
  /**
   * OXX     OXX
   * OXX  -> XXX
   * -XX     -XX
   * Starting from (1,0)
   */
  it('evaluateBoard2()', () => {
    let strategy = new VerticalStrategy(1, 0, "O", "X");
    let board: Board = new Board("OXXOXX-XX");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(-1);
    expect(strategy.targetY).toEqual(-1);
    expect(strategy.steps).toEqual(0);
  });
  /**
   * OXX     OXX
   * OXX  -> OXX
   * -XX     -XX
   * Starting from (2,0)
   */
  it('evaluateBoard3()', () => {
    let strategy = new VerticalStrategy(2, 0, "O", "X");
    let board: Board = new Board("OXXOXX-XX");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(-1);
    expect(strategy.targetY).toEqual(-1);
    expect(strategy.steps).toEqual(0);
  });
  /**
   * OOX     OOX
   * O-X  -> OOX
   * -OX     -OX
   * Starting from (1,0)
   */
  it('evaluateBoard4()', () => {
    let strategy = new VerticalStrategy(1, 0, "O", "X");
    let board: Board = new Board("OOXO-X-OX");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(1);
    expect(strategy.targetY).toEqual(1);
    expect(strategy.steps).toEqual(1);
  });

  /**
   * OO-     OOO
   * O-O  -> O-O
   * -O-     -O-
   * Starting from (2,0)
   */
  it('evaluateBoard5()', () => {
    let strategy = new VerticalStrategy(2, 0, "O", "X");
    let board: Board = new Board("OO-O-O-O-");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(2);
    expect(strategy.targetY).toEqual(0);
    expect(strategy.steps).toEqual(2);
  });

});

describe('DiagonalStrategy', () => {
  /**
   * ---     O--
   * ---  -> ---
   * ---     ---
   */  
  it('evaluateBoardEmpty()', () => {
    let strategy = new DiagonalStrategy(0, 0, "O", "X");
    let board: Board = new Board("---------");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(0);
    expect(strategy.targetY).toEqual(0);
    expect(strategy.steps).toEqual(3);
  });
  /**
   * XXX     XXX
   * XXX  -> XXX
   * XXX     XXX
   */  
  it('evaluateBoardFull1()', () => {
    let strategy = new DiagonalStrategy(0, 0, "O", "X");
    let board: Board = new Board("XXXXXXXXX");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(-1);
    expect(strategy.targetY).toEqual(-1);
    expect(strategy.steps).toEqual(0);
  });
  /**
   * OOO     OOO
   * OOO  -> OOO
   * OOO     OOO
   */  
  it('evaluateBoardFull2()', () => {
    let strategy = new DiagonalStrategy(0, 0, "O", "X");
    let board: Board = new Board("OOOOOOOOO");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(-1);
    expect(strategy.targetY).toEqual(-1);
    expect(strategy.steps).toEqual(0);
  });
  /**
   * OO-     OO-
   * X-X  -> XOX
   * XX-     XX-
   * Starting from (0,0)
   */
  it('evaluateBoard1()', () => {
    let strategy = new DiagonalStrategy(0, 0, "O", "X");
    let board: Board = new Board("OO-X-XXX-");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(1);
    expect(strategy.targetY).toEqual(1);
    expect(strategy.steps).toEqual(2);
  });
  /**
   * OO-     OO-
   * X-X  -> X-X
   * XX-     XX-
   * Starting from (0,2)
   */
  it('evaluateBoard2()', () => {
    let strategy = new DiagonalStrategy(0, 2, "O", "X");
    let board: Board = new Board("OO-X-XXX-");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(-1);
    expect(strategy.targetY).toEqual(-1);
    expect(strategy.steps).toEqual(0);
  });
  /**
   * OO-     OO-
   * X-X  -> X-X
   * -X-     OX-
   * Starting from (0,2)
   */
  it('evaluateBoard3()', () => {
    let strategy = new DiagonalStrategy(0, 2, "O", "X");
    let board: Board = new Board("OO-X-X-X-");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(0);
    expect(strategy.targetY).toEqual(2);
    expect(strategy.steps).toEqual(3);
  });
   /**
   * OO-     OO-
   * X-X  -> X-X
   * XX-     XX-
   * Starting from (0,2)
   */
  it('evaluateBoard4()', () => {
    let strategy = new DiagonalStrategy(0, 2, "O", "X");
    let board: Board = new Board("OO-X-XXX-");
    strategy.evaluateBoard(board);
    expect(strategy.targetX).toEqual(-1);
    expect(strategy.targetY).toEqual(-1);
    expect(strategy.steps).toEqual(0);
  });

});
