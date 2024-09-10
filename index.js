class Floor {
	constructor(floorNumber) {
		this.floorNumber = floorNumber;
		this.upCall = false;
		this.downCall = false;
	}

	callLiftUp() {
		if (this.floorNumber === 0) return; // Can't go up from ground floor
		this.upCall = true;
	}

	callLiftDown() {
		if (this.floorNumber === numFloors - 1) return; // Can't go down from top floor
		this.downCall = true;
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
			this.previousState = currentState; // Update previous state
		}
		return hasChanged;
	}

	addStop(floor) {
		if (!this.queue.includes(floor)) {
			this.queue.push(floor);
			this.queue.sort((a, b) => a - b); // Sort stops in ascending order
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

		if (this.currentFloor < nextStop) {
			this.state = 'moving';
			this.direction = 'up';
			this.travelTo(nextStop);
		} else if (this.currentFloor > nextStop) {
			this.state = 'moving';
			this.direction = 'down';
			this.travelTo(nextStop);
		} else {
			// We're already at the next stop
			this.arriveAtFloor(nextStop);
		}
	}

	travelTo(floor) {
		console.log(`Lift ${this.liftNumber} moving to floor ${floor}`);
		setTimeout(() => {
			// Only move to the next floor after the previous stop has been handled
			if (this.direction === 'up') {
				this.currentFloor++;
			} else if (this.direction === 'down') {
				this.currentFloor--;
			}

			// Check if we arrived at the floor
			if (this.currentFloor === floor) {
				console.log(`Lift ${this.liftNumber} reached floor ${floor}`);
				this.arriveAtFloor(floor);
			} else {
				console.log(
					`Lift ${this.liftNumber} passed floor ${this.currentFloor}`,
				);
				this.move(); // Continue moving if we haven't reached the target floor
			}
		}, 1000); // Move one floor every second
	}

	arriveAtFloor(floor) {
		console.log(`Lift ${this.liftNumber} arrived at floor ${floor}`);
		this.state = 'stopped';
		this.isServicingFloor = true;
		this.openDoor();
	}

	openDoor() {
		console.log(`Lift ${this.liftNumber} opening door`);
		this.doorState = 'opening';
		setTimeout(() => {
			this.doorState = 'open';
			this.state = 'stopped';
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
			this.queue.shift(); // Remove floor from queue after stopping
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
		// Find the best lift to respond
		let bestLift = null;
		let minDistance = this.numFloors;

		for (let lift of this.lifts) {
			const distance = Math.abs(lift.currentFloor - floorNumber);

			if (
				lift.direction === 'idle' ||
				(direction === 'up' &&
					lift.direction === 'up' &&
					lift.currentFloor <= floorNumber) ||
				(direction === 'down' &&
					lift.direction === 'down' &&
					lift.currentFloor >= floorNumber)
			) {
				if (distance < minDistance) {
					minDistance = distance;
					bestLift = lift;
				}
			}
		}

		if (bestLift) {
			bestLift.addStop(floorNumber);
		}

		this.floors[floorNumber].clearCall(direction);
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

// Debug function to print the state of the system when it changes
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

// Game Loop: Runs every 400ms and prints only if state changes
function gameLoop() {
	system.startLifts(); // Start lifts if they have stops in their queue
	printStateIfChanged(); // Print state only when changed
}

// Example: Simulate a few lift calls
system.callLift(5, 'up');
system.callLift(3, 'down');
system.callLift(8, 'up');

// Run the game loop every 400ms
setInterval(gameLoop, 400);
