class LiftSimulator {
	constructor() {
		this.floors = null;
		this.lifts = null;
		this.buttons = null;
		this.TOTAL_LIFTS = [];
		this.TASK_QUEUE = [];
		this.numberOfFloors = 6;
		this.numberOfLifts = 3;
		this.flip = new Flip();

		window.addEventListener('DOMContentLoaded', this.startGame.bind(this));
	}

	startGame() {
		this.inputHandler();
		setInterval(() => {
			if (this.TASK_QUEUE.length) {
				console.log(this.TASK_QUEUE);
				this.TASK_QUEUE.forEach((destination) =>
					this.findAndCallLift(destination),
				);
			}
		}, 100);
	}

	inputHandler() {
		const inputs = document.querySelectorAll('input');
		inputs.forEach((input) =>
			input.addEventListener('change', this.inputValidator.bind(this)),
		);
		this.createBuilding();
		this.play();
	}

	inputValidator(e) {
		const currentInput = e.target;
		switch (currentInput.id) {
			case 'floors-input':
				if (currentInput.value < 4) currentInput.value = 4;
				if (currentInput.value > 9) currentInput.value = 9;
				this.numberOfFloors = +currentInput.value;
				break;
			case 'lifts-input':
				if (currentInput.value < 1) currentInput.value = 1;
				if (currentInput.value > 8) currentInput.value = 8;
				this.numberOfLifts = +currentInput.value;
				break;
		}
		this.createBuilding();
		this.play();
	}

	createBuilding() {
		const building = document.querySelector('#building');
		let skeletonFloors = '';
		for (let i = 0; i < this.numberOfFloors; i++) {
			skeletonFloors += `
							<div class="floor floor--${i}">
									<div class="controller">
											<button class="up">up</button><button class="down">down</button>
									</div>
									<div class="lift-path"></div>
							</div>`;
		}
		building.innerHTML = skeletonFloors;

		const initialFloor = building.querySelector('.floor--0 > .lift-path');
		let skeletonLifts = '';
		for (let i = 0; i < this.numberOfLifts; i++) {
			skeletonLifts += `<div class="lift" style="left: ${
				(100 / this.numberOfLifts) * i
			}%"></div>`;
		}
		initialFloor.innerHTML = skeletonLifts;
	}

	play() {
		this.floors = document.querySelectorAll('.lift-path');
		this.lifts = document.querySelectorAll('.lift');
		this.buttons = document.querySelectorAll('button');
		this.TOTAL_LIFTS = [];

		const floorWidth = document.querySelector('.lift-path').offsetWidth;

		this.lifts.forEach((lift, idx) => {
			this.TOTAL_LIFTS.push(lift);
			lift.style.width = `${floorWidth / this.lifts.length - 20}px`;
			lift.style.left = `${(100 / this.lifts.length) * idx}%`;
			lift.addEventListener('transitionend', (e) => {
				e.target.style.transition = 'initial';
				console.log('end anim');
				e.target.classList.remove('moving');
			});
		});

		this.buttons.forEach((btn) =>
			btn.addEventListener('click', this.addToQueue.bind(this)),
		);
	}

	addToQueue(e) {
		const destination = this.getCurrentControllerFloor(e.target);
		this.TASK_QUEUE.push(destination);
		console.log(this.TASK_QUEUE);
	}

	findAndCallLift(destination) {
		const liftNo = this.getLift(destination);
		if (liftNo === undefined || !this.TOTAL_LIFTS[liftNo]) return;
		if (destination === this.currentLiftFloor(this.TOTAL_LIFTS[liftNo])) return;
		this.moveLift(destination, liftNo);
	}

	currentLiftFloor(lift) {
		return Number(lift.parentNode.parentNode.className.match(/\d/g));
	}

	getCurrentControllerFloor(element) {
		const currentClassName = element.parentNode.parentNode.className;
		return Number(currentClassName.match(/\d/g));
	}

	getLift(destination) {
		if (document.querySelector(`.floor--${destination} .lift`) !== null) return;

		for (let i = 0; i < this.floors.length; i++) {
			for (let j = 0; j < this.TOTAL_LIFTS.length; j++) {
				if (!this.TOTAL_LIFTS[j].classList.contains('moving')) {
					if (
						Math.abs(
							this.currentLiftFloor(this.TOTAL_LIFTS[j]) - destination,
						) === i
					) {
						return j;
					}
				}
			}
		}
	}

	moveLift(destination, liftNo) {
		if (!this.TOTAL_LIFTS[liftNo].className.includes('moving')) {
			this.flip.first(this.TOTAL_LIFTS[liftNo]);
			this.flip.append(destination, this.TOTAL_LIFTS[liftNo]);
			const delta = this.flip.invert(this.TOTAL_LIFTS[liftNo]);
			this.TASK_QUEUE = this.TASK_QUEUE.filter(
				(value) => value !== destination,
			);
			this.flip.play(this.TOTAL_LIFTS[liftNo], delta);
		}
	}
}

class Flip {
	first(el) {
		el.classList.add('moving');
		this.state = el.getBoundingClientRect();
	}

	append(destination, el) {
		document.querySelector(`.floor--${destination} .lift-path`).appendChild(el);
	}

	invert(el) {
		const first = this.state;
		const last = el.getBoundingClientRect();
		let delta = -1 * (last.top - first.top);
		el.style.transform = `translateY(${delta}px)`;
		return delta;
	}

	play(el, delta) {
		requestAnimationFrame(() => {
			console.log('animating', Math.abs(delta * 3));
			el.style.transition = `all ${Math.abs(delta * 3)}ms ease-in-out`;
			el.style.transform = 'none';
		});
	}
}

// Initialize the simulator
new LiftSimulator();
