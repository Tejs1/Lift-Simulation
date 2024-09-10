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
		if (this.queue.length === 0) {
			this.state = 'stopped';
			this.direction = 'idle';
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
		}
	}

	travelTo(floor) {
		setTimeout(() => {
			if (this.direction === 'up') {
				this.currentFloor++;
			} else if (this.direction === 'down') {
				this.currentFloor--;
			}

			if (this.currentFloor === floor) {
				this.arriveAtFloor(floor);
			} else {
				this.move();
			}
		}, 1000);
	}

	arriveAtFloor(floor) {
		this.state = 'stopped';
		this.openDoor();
	}

	openDoor() {
		this.doorState = 'opening';
		setTimeout(() => {
			this.doorState = 'open';
			this.state = 'stopped';
			this.stayOpen();
		}, 500); // Opening door takes 0.5 seconds
	}

	stayOpen() {
		setTimeout(() => {
			this.closeDoor();
		}, 1000); // Stay open for 1 second
	}

	closeDoor() {
		this.doorState = 'closing';
		setTimeout(() => {
			this.doorState = 'closed';
			this.queue.shift(); // Remove floor from queue after stopping
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
}

let numFloors = 10;
let numLifts = 3;
let system = new LiftSystem(numFloors, numLifts);

// Debug function to print the state of the system when it changes
function printStateIfChanged() {
	for (let lift of system.lifts) {
		if (lift.stateChanged()) {
			console.log(`${Date.now()}\n
      Lift ${lift.liftNumber}: 
      Current floor: ${lift.currentFloor}, 
      State: ${lift.state}, 
      Door: ${lift.doorState}, 
      Direction: ${lift.direction}, 
      Queue: [${lift.queue.join(', ')}]`);
		}
	}
}

// Game Loop: Runs every second and prints only if state changes
function gameLoop() {
	for (let lift of system.lifts) {
		lift.move();
	}
	printStateIfChanged(); // Print state only when changed
}

// Example: Simulate a few lift calls
system.callLift(5, 'up');
system.callLift(3, 'down');
system.callLift(8, 'up');

// Run the game loop every second
setInterval(gameLoop, 200);
