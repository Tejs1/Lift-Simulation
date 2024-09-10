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
		setTimeout(() => {
			this.queue.shift(); // Remove floor from queue after stopping
			this.closeDoor();
		}, 1500); // Wait 1 second with door open
	}

	openDoor() {
		this.doorState = 'opening';
		setTimeout(() => {
			this.doorState = 'open';
			this.state = 'stopped';
		}, 500); // Opening door takes 0.5 seconds
	}

	closeDoor() {
		this.doorState = 'closing';
		setTimeout(() => {
			this.doorState = 'closed';
			this.move(); // Move to the next stop in the queue
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

// Debug function to print the state of the system
function printAppState() {
	console.log('System state:');
	for (let lift of system.lifts) {
		console.log(`Lift ${lift.liftNumber}: 
      Current floor: ${lift.currentFloor}, 
      State: ${lift.state}, 
      Door: ${lift.doorState}, 
      Direction: ${lift.direction}, 
      Queue: [${lift.queue.join(', ')}]`);
	}
}

// Game Loop: Runs every second
function gameLoop() {
	for (let lift of system.lifts) {
		lift.move();
	}
	printAppState(); // Print state after each loop
}

// Example: Simulate a few lift calls
system.callLift(5, 'up');
system.callLift(3, 'down');
system.callLift(8, 'up');

// Run the game loop every second
setInterval(gameLoop, 200);
