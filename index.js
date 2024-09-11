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
		this.queue = [];
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
			queue: [...this.queue],
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
		if (!this.queue.includes(floor)) {
			this.queue.push(floor);
			this.queue.sort((a, b) => (this.direction === 'up' ? a - b : b - a));
		}
	}

	move() {
		if (
			this.queue.length === 0 ||
			this.doorState !== 'closed' ||
			this.isServicingFloor
		) {
			// Don't move if the door is not closed, there are no stops, or we're servicing a floor
			return;
		}

		const nextStop = this.queue[0];

		if (this.currentFloor !== nextStop) {
			this.state = 'moving';
			this.direction = this.currentFloor < nextStop ? 'up' : 'down';
			this.travelTo(nextStop);
		} else {
			this.arriveAtFloor(nextStop);
		}
	}

	travelTo(floor) {
		console.log(`Lift ${this.liftNumber} moving to floor ${floor}`);
		setTimeout(() => {
			this.currentFloor += this.direction === 'up' ? 1 : -1;

			if (this.currentFloor === floor) {
				console.log(`Lift ${this.liftNumber} reached floor ${floor}`);
				this.arriveAtFloor(floor);
			} else {
				console.log(
					`Lift ${this.liftNumber} passed floor ${this.currentFloor}`,
				);
				this.move();
			}
		}, 1000);
	}

	arriveAtFloor(floor) {
		console.log(`Lift ${this.liftNumber} arrived at floor ${floor}`);
		this.state = 'stopped';
		this.isServicingFloor = true;
		this.queue.shift(); // Remove the floor from the queue immediately
		this.openDoor();
	}

	openDoor() {
		console.log(`Lift ${this.liftNumber} opening door`);
		this.doorState = 'opening';
		setTimeout(() => {
			this.doorState = 'open';
			this.stayOpen();
		}, 500); // Opening door takes 0.5 seconds
	}

	stayOpen() {
		console.log(`Lift ${this.liftNumber} door is open`);
		setTimeout(() => {
			this.closeDoor();
		}, 1000); // Stay open for 1 second
	}

	closeDoor() {
		console.log(`Lift ${this.liftNumber} closing door`);
		this.doorState = 'closing';
		setTimeout(() => {
			this.doorState = 'closed';
			this.isServicingFloor = false;
			if (this.queue.length > 0) {
				this.move(); // Move to the next stop in the queue
			} else {
				this.direction = 'idle'; // Set direction to idle if no more tasks
				this.state = 'stopped'; // Set the lift state to stopped
			}
		}, 500); // Closing door takes 0.5 seconds
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
		let minScore = Infinity;

		for (let lift of this.lifts) {
			const distance = Math.abs(lift.currentFloor - floorNumber);
			let score = distance;

			if (lift.direction === 'idle') {
				score -= 0.5; // Prefer idle lifts
			} else if (
				(direction === 'up' &&
					lift.direction === 'up' &&
					lift.currentFloor <= floorNumber) ||
				(direction === 'down' &&
					lift.direction === 'down' &&
					lift.currentFloor >= floorNumber)
			) {
				score -= 0.25; // Prefer lifts already moving in the right direction
			}

			if (score < minScore) {
				minScore = score;
				bestLift = lift;
			}
		}

		if (bestLift) {
			bestLift.addStop(floorNumber);
			console.log(
				`Lift ${bestLift.liftNumber} assigned to floor ${floorNumber}`,
			);
		}
	}

	startLifts() {
		for (let lift of this.lifts) {
			if (
				lift.queue.length > 0 &&
				lift.state === 'stopped' &&
				!lift.isServicingFloor
			) {
				lift.move();
			}
		}
	}
}

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
Queue: [${lift.queue.join(', ')}],
TimeStampInMs: ${new Date().getTime()}
`);
		}
	}
}

function gameLoop() {
	system.startLifts(); // Start the lifts
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
