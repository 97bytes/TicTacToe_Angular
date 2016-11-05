import { GameBoardComponent } from './game-board.component';
import { GameController, Board } from './game-controller';

describe('GameBoardComponent', () => {
  it('winnerLineContainsWithGameOver', () => {
    let controller: GameController = new GameController(null);
    controller.board = new Board("XXX------")
    let component: GameBoardComponent = new GameBoardComponent(controller);
    controller.validateGameOver();
    expect(controller.isGameOver()).toEqual(true);

    expect(component.winnerLineContains(0, 0)).toEqual(true);
    expect(component.winnerLineContains(1, 0)).toEqual(true);
    expect(component.winnerLineContains(2, 0)).toEqual(true);
    expect(component.winnerLineContains(1, 1)).toEqual(false);
  });

  it('winnerLineContainsNotGameOver', () => {
    let controller: GameController = new GameController(null);
    controller.board = new Board("XXO------")
    let component: GameBoardComponent = new GameBoardComponent(controller);
    controller.validateGameOver();
    expect(controller.isGameOver()).toEqual(false);

    expect(component.winnerLineContains(0, 0)).toEqual(false);
    expect(component.winnerLineContains(1, 0)).toEqual(false);
    expect(component.winnerLineContains(2, 0)).toEqual(false);
    expect(component.winnerLineContains(1, 1)).toEqual(false);
  });

});
