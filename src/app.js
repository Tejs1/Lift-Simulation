class LiftSystem {
	constructor() {
		this.liftInput = document.getElementById('lifts');
		this.floorInput = document.getElementById('floors');
		this.startBtn = document.getElementById('btn');
		this.formSection = document.getElementById('form-section');
		this.liftFloorSection = document.getElementById('lift-floor-UI');
		this.liftState = [];
		this.requestQueue = [];

		this.startBtn.addEventListener('click', this.startBtnListener.bind(this));
	}

	validateForms(form) {
		for (const input of form) {
			if (input.hasAttribute('required') && input.value === '') {
				alert('Please fill in all required values.');
				return false;
			}
		}
		return true;
	}

	createButton(value, index, floors) {
		const btn = document.createElement('input');
		btn.setAttribute('type', 'button');

		if (value === 'Up') {
			btn.setAttribute('value', '▲');
		} else if (value === 'Down') {
			btn.setAttribute('value', '▼');
		}

		btn.id = `${value.toLowerCase()}${index}`;

		if (index === floors - 1 && value === 'Up' && floors > 1) {
			btn.style.visibility = 'hidden';
		}
		if (index === 0 && value === 'Down') {
			btn.style.visibility = 'hidden';
		}
		return btn;
	}

	createLiftDoors(door, index) {
		const liftDoor = document.createElement('div');
		liftDoor.id = `lift-door-${door} lift-door-${door}-${index}`;
		liftDoor.className = `lift-door-${door}`;
		return liftDoor;
	}

	initializeLifts(lifts) {
		this.liftState = new Array(lifts)
			.fill(null)
			.map(() => ({ currentFloor: 0, inUse: false, isMoving: false }));
		console.log('Lifts initialized:', this.liftState);
	}

	activateLiftButton(buttonId) {
		const button = document.getElementById(buttonId);
		if (button) {
			button.classList.add('active');
		}
	}

	deactivateLiftButton(buttonId) {
		const button = document.getElementById(buttonId);
		if (button) {
			button.classList.remove('active');
		}
	}

	openLiftDoors(lift) {
		return new Promise((resolve) => {
			const doorOne = lift.querySelector('.lift-door-one');
			const doorTwo = lift.querySelector('.lift-door-two');

			doorOne.style.marginRight = '80%';
			doorOne.style.transition = 'all 2.5s ease .5s';
			doorTwo.style.transition = 'all 2.5s ease .5s';

			setTimeout(() => resolve(), 2500);
		});
	}

	closeLiftDoors(lift) {
		return new Promise((resolve) => {
			const doorOne = lift.querySelector('.lift-door-one');
			const doorTwo = lift.querySelector('.lift-door-two');

			doorOne.style.marginRight = '';
			doorOne.style.transition = 'all 2.5s ease .5s';
			doorTwo.style.transition = 'all 2.5s ease .5s';

			setTimeout(() => resolve(), 2500);
		});
	}

	processQueue() {
		if (this.requestQueue.length === 0) return;

		const { lifts, direction, floorIndex } = this.requestQueue.shift();
		console.log(`Processing queue: ${direction} to floor ${floorIndex}`);
		this.handleLiftsMove(lifts, direction, floorIndex);
	}

	toggleFloorButton(buttonId, disable) {
		const button = document.getElementById(buttonId);
		if (button) {
			button.disabled = disable;
		}
	}

	handleLiftsMove(lifts, direction, floorIndex) {
		const allLifts = document.querySelectorAll('.lift');
		let closestLift = null;
		let minimumDistance = Infinity;

		this.toggleFloorButton(`${direction}${floorIndex}`, true);
		this.activateLiftButton(`${direction}${floorIndex}`);

		for (let i = 0; i < allLifts.length; i++) {
			const lift = allLifts[i];
			let currentFloor = parseInt(lift.dataset.currentFloor);
			let distance = Math.abs(currentFloor - floorIndex);

			if (
				!this.liftState[i].inUse &&
				!this.liftState[i].isMoving &&
				distance < minimumDistance
			) {
				closestLift = lift;
				minimumDistance = distance;
			}
		}

		if (closestLift) {
			const liftIndex = Array.prototype.indexOf.call(allLifts, closestLift);
			this.liftState[liftIndex].inUse = true;
			this.liftState[liftIndex].isMoving = true;

			const floorHeight = document.querySelector('.floor-item').offsetHeight;
			const travelTime = minimumDistance * 2;

			if (parseInt(closestLift.dataset.currentFloor) === floorIndex) {
				this.openAndCloseLiftDoors(closestLift, floorIndex);
			} else {
				closestLift.style.transition = `transform ${travelTime}s linear`;
				closestLift.style.transform = `translateY(-${
					floorIndex * floorHeight
				}px)`;

				setTimeout(() => {
					closestLift.dataset.currentFloor = floorIndex;
					this.openAndCloseLiftDoors(closestLift, floorIndex);
				}, travelTime * 1000);
			}
		} else {
			this.requestQueue.push({ lifts, direction, floorIndex });
		}
	}

	openAndCloseLiftDoors(lift, floorIndex) {
		const liftIndex = Array.prototype.indexOf.call(
			document.querySelectorAll('.lift'),
			lift,
		);

		this.openLiftDoors(lift).then(() => {
			this.closeLiftDoors(lift).then(() => {
				this.liftState[liftIndex].inUse = false;
				this.liftState[liftIndex].isMoving = false;

				this.toggleFloorButton(`up${floorIndex}`, false);
				this.toggleFloorButton(`down${floorIndex}`, false);
				this.deactivateLiftButton(`up${floorIndex}`);
				this.deactivateLiftButton(`down${floorIndex}`);

				this.processQueue();
			});
		});
	}

	handleLiftBtns(floors, lifts) {
		for (let i = floors - 1; i >= 0; i--) {
			document.getElementById(`up${i}`).addEventListener('click', () => {
				this.requestQueue.push({ lifts, direction: 'up', floorIndex: i });
				this.processQueue();
			});
			if (i !== 0) {
				document.getElementById(`down${i}`).addEventListener('click', () => {
					this.requestQueue.push({ lifts, direction: 'down', floorIndex: i });
					this.processQueue();
				});
			}
		}
	}

	updateFloorContainerWidth(floorIndex, lifts) {
		const floorContainer = document.querySelector(
			`.floor-container.floor-container${floorIndex}`,
		);

		if (floorContainer) {
			const baseWidth = 300;
			const additionalWidth = 60;
			const newWidth = baseWidth + lifts * additionalWidth;

			floorContainer.style.width = `${newWidth}px`;
		}
	}

	showFloorsAndLifts(floors, lifts) {
		const floorsContainer = document.createElement('div');
		floorsContainer.className = 'floors';

		for (let i = floors - 1; i >= 0; i--) {
			const floor = document.createElement('div');
			floor.className = `floor floor-${i}`;

			const floorPath = document.createElement('div');
			floorPath.className = `floor-path floor-path-${i}`;

			const floorItem = document.createElement('div');
			floorItem.className = `floor-item floor-item-${i}`;

			const liftBtnContainer = document.createElement('div');
			liftBtnContainer.className = `lift-btn-container lift-btn-container-${i}`;

			liftBtnContainer.appendChild(this.createButton('Up', i, floors));
			liftBtnContainer.appendChild(this.createButton('Down', i, floors));
			floorItem.appendChild(liftBtnContainer);

			const floorContainer = document.createElement('div');
			floorContainer.className = `floor-container floor-container${i}`;

			// const floorLine = document.createElement('div');
			// floorLine.className = `floor-line floor-line${i}`;

			const floorNumber = document.createElement('p');
			floorNumber.textContent = `Floor ${i + 1}`;

			floorContainer.appendChild(floorNumber);
			// floorContainer.appendChild(floorLine);

			floorItem.appendChild(floorContainer);

			floor.appendChild(floorItem);
			floor.appendChild(floorPath);
			floorsContainer.appendChild(floor);

			this.updateFloorContainerWidth(i, lifts);
		}

		this.liftFloorSection.appendChild(floorsContainer);

		const liftContainer = document.createElement('div');
		liftContainer.className = `lift-container`;

		for (let j = 0; j < lifts; j++) {
			const lift = document.createElement('div');
			lift.className = `lift lift${j}`;
			lift.dataset.currentFloor = 0;

			lift.appendChild(this.createLiftDoors('one', j));
			lift.appendChild(this.createLiftDoors('two', j));

			liftContainer.appendChild(lift);
		}
		this.liftFloorSection.appendChild(liftContainer);
		// get liftContainer width
		const liftContainerWidth =
			document.querySelector('.lift-container').offsetWidth;
		const controllerWidth = document.querySelector('.floor-item').offsetWidth;
		this.liftFloorSection.style.width = `${
			controllerWidth + liftContainerWidth
		}px`;
		liftContainer.style.left = `${controllerWidth}px`;
		console.log(liftContainerWidth, controllerWidth);
		this.handleLiftBtns(floors, lifts);
	}

	startBtnListener(e) {
		e.preventDefault();

		const lifts = this.liftInput.value;
		const floors = this.floorInput.value;

		if (lifts === '' || floors === '') {
			alert('Please fill in Positive Integer values.');
			return;
		}

		if (/[a-zA-Z]/.test(lifts) || /[a-zA-Z]/.test(floors)) {
			alert('Please enter numeric values only.');
			return;
		}

		const liftsNum = Number(lifts);
		const floorsNum = Number(floors);

		if (
			!Number.isInteger(liftsNum) ||
			!Number.isInteger(floorsNum) ||
			liftsNum <= 0 ||
			floorsNum <= 0
		) {
			alert('Please enter positive integers for both lifts and floors.');
			return;
		}

		this.liftFloorSection.classList.remove('hidden');
		this.liftFloorSection.innerHTML = '';
		this.showFloorsAndLifts(floorsNum, liftsNum);
		this.initializeLifts(liftsNum);
	}
}

const simulator = new LiftSystem();
