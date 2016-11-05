import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule }    from '@angular/http';
import { AppComponent }  from './app.component';
import { GameBoardComponent } from './game-board.component';
import { RobotService } from './robot.service';

@NgModule({
  imports:      [ BrowserModule, HttpModule ],
  declarations: [ AppComponent, GameBoardComponent ],
  providers: [ RobotService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule {
}