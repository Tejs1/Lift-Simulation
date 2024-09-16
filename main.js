import LiftSystem from './index.js';

document.addEventListener('DOMContentLoaded', () => {
	const numFloors = 50;
	const numLifts = 10;
	const system = new LiftSystem(numFloors, numLifts);

	system.attachToDOM('lift-simulator');

	system.startSimulation();

	// Example: Simulate a few lift calls
	// setTimeout(() => {
	// 	system.callLift(5, 'up');
	// 	system.callLift(3, 'down');
	// 	system.callLift(8, 'up');
	// }, 1000);

	// setTimeout(() => {
	// 	system.callLift(1, 'up');
	// 	system.callLift(7, 'down');
	// 	system.callLift(4, 'down');
	// }, 4000);

	// setTimeout(() => {
	// 	system.callLift(1, 'up');
	// 	system.callLift(2, 'down');
	// 	system.callLift(1, 'down');
	// }, 6000);
});
