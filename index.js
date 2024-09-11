class Floor {
	constructor(floorNumber) {
		this.floorNumber = floorNumber;
		this.upCall = false;
		this.downCall = false;
	}

	callLift(direction) {
		if (direction === 'up') {
			this.upCall = true;
		} else if (direction === 'down') {
			this.downCall = true;
		}
	}

	clearCall(direction) {
		if (direction === 'up') {
			this.upCall = false;
		} else if (direction === 'down') {
			this.downCall = false;
		}
	}
}

class Lift {
	constructor(liftNumber) {
		this.liftNumber = liftNumber;
		this.currentFloor = 0;
		this.direction = 'idle'; // "up", "down", or "idle"
		this.state = 'stopped'; // "moving", "stopped", "opening", "closing"
		this.upQueue = [];
		this.downQueue = [];
		this.doorState = 'closed'; // "opening", "closing", "open", "closed"
		this.previousState = {}; // To track changes
		this.isServicingFloor = false;
	}

	getState() {
		return {
			liftNumber: this.liftNumber,
			currentFloor: this.currentFloor,
			state: this.state,
			doorState: this.doorState,
			direction: this.direction,
			upQueue: [...this.upQueue],
			downQueue: [...this.downQueue],
		};
	}

	stateChanged() {
		const currentState = this.getState();
		const hasChanged =
			JSON.stringify(currentState) !== JSON.stringify(this.previousState);
		if (hasChanged) {
			this.previousState = currentState;
		}
		return hasChanged;
	}

	addStop(floor) {
		if (
			this.direction === 'up' ||
			(this.direction === 'idle' && floor > this.currentFloor)
		) {
			if (!this.upQueue.includes(floor)) {
				this.upQueue.push(floor);
				this.upQueue.sort((a, b) => a - b);
			}
		} else {
			if (!this.downQueue.includes(floor)) {
				this.downQueue.push(floor);
				this.downQueue.sort((a, b) => b - a);
			}
		}
	}

	move() {
		if (this.isServicingFloor || this.doorState !== 'closed') {
			return;
		}

		if (this.direction === 'up' && this.upQueue.length > 0) {
			this.moveToNextFloor(this.upQueue[0]);
		} else if (this.direction === 'down' && this.downQueue.length > 0) {
			this.moveToNextFloor(this.downQueue[0]);
		} else if (this.upQueue.length > 0) {
			this.direction = 'up';
			this.moveToNextFloor(this.upQueue[0]);
		} else if (this.downQueue.length > 0) {
			this.direction = 'down';
			this.moveToNextFloor(this.downQueue[0]);
		} else {
			this.direction = 'idle';
			this.state = 'stopped';
		}
	}

	moveToNextFloor(targetFloor) {
		this.state = 'moving';
		console.log(`Lift ${this.liftNumber} moving to floor ${targetFloor}`);

		const moveOneFloor = () => {
			if (this.currentFloor < targetFloor) {
				this.currentFloor++;
			} else if (this.currentFloor > targetFloor) {
				this.currentFloor--;
			}

			if (this.currentFloor === targetFloor) {
				this.arriveAtFloor(targetFloor);
			} else {
				console.log(
					`Lift ${this.liftNumber} passed floor ${this.currentFloor}`,
				);
				setTimeout(moveOneFloor, 1000);
			}
		};

		setTimeout(moveOneFloor, 1000);
	}

	arriveAtFloor(floor) {
		console.log(`Lift ${this.liftNumber} arrived at floor ${floor}`);
		this.state = 'stopped';
		this.isServicingFloor = true;
		if (this.direction === 'up') {
			this.upQueue = this.upQueue.filter((f) => f !== floor);
		} else {
			this.downQueue = this.downQueue.filter((f) => f !== floor);
		}
		this.openDoor();
	}

	openDoor() {
		console.log(`Lift ${this.liftNumber} opening door`);
		this.doorState = 'opening';
		setTimeout(() => {
			this.doorState = 'open';
			this.stayOpen();
		}, 500);
	}

	stayOpen() {
		console.log(`Lift ${this.liftNumber} door is open`);
		setTimeout(() => {
			this.closeDoor();
		}, 1000);
	}

	closeDoor() {
		console.log(`Lift ${this.liftNumber} closing door`);
		this.doorState = 'closing';
		setTimeout(() => {
			this.doorState = 'closed';
			this.isServicingFloor = false;
			this.move();
		}, 500);
	}
}

class LiftSystem {
	constructor(numFloors, numLifts) {
		this.numFloors = numFloors;
		this.numLifts = numLifts;
		this.floors = [];
		this.lifts = [];

		for (let i = 0; i < numFloors; i++) {
			this.floors.push(new Floor(i));
		}

		for (let i = 0; i < numLifts; i++) {
			this.lifts.push(new Lift(i));
		}
	}

	callLift(floorNumber, direction) {
		this.floors[floorNumber].callLift(direction);

		let bestLift = null;
		let bestScore = Infinity;

		for (let lift of this.lifts) {
			const score = this.calculateLiftScore(lift, floorNumber, direction);
			if (score < bestScore) {
				bestScore = score;
				bestLift = lift;
			}
		}

		if (bestLift) {
			bestLift.addStop(floorNumber);
			console.log(
				`Lift ${bestLift.liftNumber} assigned to floor ${floorNumber} (${direction})`,
			);
		}
	}

	calculateLiftScore(lift, floorNumber, callDirection) {
		const distance = Math.abs(lift.currentFloor - floorNumber);
		let score = distance;

		// Heavily penalize assignment that would require the lift to change direction
		if (lift.direction === 'up' && floorNumber < lift.currentFloor) {
			score += this.numFloors * 2;
		} else if (lift.direction === 'down' && floorNumber > lift.currentFloor) {
			score += this.numFloors * 2;
		}

		// Prefer idle lifts
		if (lift.direction === 'idle') {
			score -= 0.5;
		}
		// Prefer lifts already moving in the right direction
		else if (
			(callDirection === 'up' &&
				lift.direction === 'up' &&
				lift.currentFloor <= floorNumber) ||
			(callDirection === 'down' &&
				lift.direction === 'down' &&
				lift.currentFloor >= floorNumber)
		) {
			score -= 1;
		}

		// Consider the number of stops in the lift's queue
		score += lift.upQueue.length * 0.1 + lift.downQueue.length * 0.1;

		return score;
	}

	startLifts() {
		for (let lift of this.lifts) {
			lift.move();
		}
	}
}

// Test code remains the same
let numFloors = 10;
let numLifts = 3;
let system = new LiftSystem(numFloors, numLifts);

function printStateIfChanged() {
	for (let lift of system.lifts) {
		if (lift.stateChanged()) {
			console.log(`Lift ${lift.liftNumber}:
Current floor: ${lift.currentFloor},
State: ${lift.state},
Door: ${lift.doorState},
Direction: ${lift.direction},
Up Queue: [${lift.upQueue.join(', ')}],
Down Queue: [${lift.downQueue.join(', ')}],
TimeStampInMs: ${new Date().getTime()}
`);
		}
	}
}

function gameLoop() {
	system.startLifts();
	printStateIfChanged();
}

// Example: Simulate a few lift calls
system.callLift(5, 'up');
system.callLift(3, 'down');
system.callLift(8, 'up');

setTimeout(() => {
	system.callLift(1, 'up');
	system.callLift(7, 'down');
	system.callLift(4, 'down');
}, 3000);

setTimeout(() => {
	system.callLift(1, 'up');
	system.callLift(2, 'down');
	system.callLift(1, 'down');
}, 5000);

// Run the game loop every 400ms
setInterval(gameLoop, 400);
