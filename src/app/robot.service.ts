import { Coordinates } from './game-controller';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/toPromise';

/**
 * Esta clase gestiona la invocación del servicio remoto contra el
 * que se juega la partida (robot).
 */
@Injectable()
export class RobotService {

	constructor(private http: Http) {
	}

	/**
	* Se invoca al servicio remoto.
	* Para probar contra el servicio local, hay que cambiar el endpoint en 'robotEndpoint'
	*/
	play(board: string, robotSymbol: string, userSymbol: string): Promise<Coordinates> {
		let headers = new Headers({'Content-Type': 'application/json'});
		//let robotEndpoint = "http://localhost:8888/robot";
		let robotEndpoint = "http://tictactoerobot.appspot.com/robot";
		let gameData = {board: board, robotSymbol: robotSymbol, userSymbol: userSymbol};
		return this.http.post(robotEndpoint, JSON.stringify(gameData), {headers: headers})
			.toPromise()
			.then(response => response.json())
			.catch(this.handleError);
	}

	private handleError(error: any) {
	  	console.error('Se produjo un error en el servicio', error);
	  	return Promise.reject(error.message || error);
	}

}
