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
		this.eventListeners = [];

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

	attachToDOM(containerId) {
		const container = document.getElementById(containerId);
		if (!container) {
			console.error(`Container with id "${containerId}" not found`);
			return;
		}

		// Create building structure
		const building = document.createElement('div');
		building.className = 'building';

		// Create floors
		for (let i = this.numFloors - 1; i >= 0; i--) {
			const floor = document.createElement('div');
			floor.className = 'floor';
			floor.innerHTML = `
							<div class="floor-number">${i}</div>
							<button class="call-button up" data-floor="${i}" data-direction="up">↑</button>
							<button class="call-button down" data-floor="${i}" data-direction="down">↓</button>
					`;
			building.appendChild(floor);
		}

		// Create lifts
		for (let i = 0; i < this.numLifts; i++) {
			const lift = document.createElement('div');
			lift.className = 'lift';
			lift.id = `lift-${i}`;
			lift.innerHTML = `
							<div class="lift-number">${i}</div>
							<div class="doors">
									<div class="door left-door"></div>
									<div class="door right-door"></div>
							</div>
					`;
			building.appendChild(lift);
		}

		container.appendChild(building);

		// Add event listeners to call buttons
		container.addEventListener('click', (event) => {
			if (event.target.classList.contains('call-button')) {
				const floor = parseInt(event.target.dataset.floor);
				const direction = event.target.dataset.direction;
				this.callLift(floor, direction);
			}
		});

		// Add event listener for lift state changes
		this.addEventListener((event) => {
			if (event.type === 'LIFT_STATE_CHANGED') {
				this.updateLiftDOM(event.liftNumber, event.state);
			}
		});
	}

	updateLiftDOM(liftNumber, state) {
		const lift = document.getElementById(`lift-${liftNumber}`);
		if (!lift) return;

		const floorHeight = 100 / this.numFloors;
		lift.style.bottom = `${state.currentFloor * floorHeight}%`;
		lift.className = `lift ${state.doorState}`;
	}

	startSimulation() {
		setInterval(() => {
			this.startLifts();
		}, 400);
	}
}

// Export the LiftSystem for use in the main script
export default LiftSystem;
