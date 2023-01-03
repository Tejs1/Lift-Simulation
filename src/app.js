let floors;
let lifts;
let buttons;
const { log } = console;
let TOTAL_LIFTS = [];
let TASK_QUEUE = [];

window.addEventListener("DOMContentLoaded", startGame);
let numberOfFloors = 6;
let numberOfLifts = 3;
function startGame(e) {
  inputHandler(e);
  const idleLifts = [];

  console.log(TOTAL_LIFTS);
  setInterval(() => {
    console.log(getIdleLifts(TOTAL_LIFTS));
    // if (TASK_QUEUE.length) {
    //   const destination = TASK_QUEUE.shift();
    // }
  }, 3000);
}
function inputHandler(e) {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => input.addEventListener("change", inputValidator));
  createBuilding(numberOfFloors, numberOfLifts);
  play();
}
function inputValidator(e) {
  const currentInput = e.target;
  switch (currentInput.id) {
    case "floors-input":
      if (currentInput.value < 4) currentInput.value = 4;
      if (currentInput.value > 9) currentInput.value = 9;
      numberOfFloors = +currentInput.value;
      break;
    case "lifts-input":
      if (currentInput.value < 1) currentInput.value = 1;
      if (currentInput.value > 8) currentInput.value = 8;
      numberOfLifts = +currentInput.value;
      break;
    default:
      break;
  }
  createBuilding(numberOfFloors, numberOfLifts);
  play();
}

function createBuilding(numberOfFloors, numberOfLifts) {
  const building = document.querySelector("#building");
  // console.log(numberOfFloors, numberOfLifts);
  let skeletonFloors = "";
  for (let i = 0; i < numberOfFloors; i++) {
    skeletonFloors += `<div class="floor floor--${i}">
        <div class="controller">
          <button class="up">up</button><button class="down">down</button>
        </div>
        <div class="lift-path"></div>
      </div>`;
  }
  building.innerHTML = skeletonFloors;
  const initialFloor = building.querySelector(".floor--0 >.lift-path");
  // console.log(initialFloor);
  let skeletonLifts = "";
  for (let i = 0; i < numberOfLifts; i++) {
    skeletonLifts += `<div class="lift " style="left : 
      ${(100 / numberOfLifts) * i}%">
    </div>`;
  }
  initialFloor.innerHTML = skeletonLifts;
}

function play() {
  floors = lifts = buttons = undefined;
  TOTAL_LIFTS = [];
  floors = document.querySelectorAll(".lift-path");
  lifts = document.querySelectorAll(".lift");
  buttons = document.querySelectorAll("button");

  const allFlips = {};

  lifts.forEach((lift, idx) => {
    TOTAL_LIFTS.push(lift);
    lift.style.left = `${(100 / lifts.length) * idx}%`;
    lift.addEventListener("transitionend", (e) => {
      // idleLifts.push(e.target);
      e.target.style.transition = `initial`;
      console.log("end anim");
      e.target.classList.remove("moving");
    });
  });

  buttons.forEach((btn) => btn.addEventListener("click", addToQueue));
}

function addToQueue(e) {
  const destination = getCurrentControllerFloor(e.target);
  TASK_QUEUE.push(destination);
  console.log(TASK_QUEUE);
  findAndCallLift(e);
}
function findAndCallLift(e) {
  const btnDirection = e.target.className;
  const destination = getCurrentControllerFloor(e.target);
  // console.log("destination" + destination);
  const liftNo = getLift(destination);
  // log("nearlift " + liftNo);
  if (!liftNo && !TOTAL_LIFTS[liftNo]) return;
  if (destination === currentLiftFloor(TOTAL_LIFTS[liftNo])) return;
  else moveLift(destination, liftNo);
}
const currentLiftFloor = (lift) => {
  return Number(lift.parentNode.parentNode.className.match(/\d/g));
};

const getCurrentControllerFloor = (element) => {
  const currentClassName = element.parentNode.parentNode.className;
  //extracts number from className
  return Number(currentClassName.match(/\d/g));
};

function getShortestDistance(lift, destination, j) {
  if (Math.abs(currentLiftFloor(lift) - destination) === 0) {
    log(j + "seeting");
    return j;
  }
}

function getLift(destination) {
  //checks if the floor has lift already
  if (document.querySelector(`.floor--${destination} .lift`) !== null) return;
  let liftNo = false;

  for (let i = 0; i < floors.length; i++) {
    // if(liftNo) return liftNo
    for (let j = 0; j < TOTAL_LIFTS.length; j++) {
      if (liftNo || liftNo === 0) return liftNo;
      if (!TOTAL_LIFTS[j].classList.contains("moving")) {
        if (
          Math.abs(Math.abs(currentLiftFloor(TOTAL_LIFTS[j]) - destination)) ===
          i
        ) {
          liftNo = j;
        }
      }
    }
  }
  log(liftNo);
  return liftNo;
}

function moveLift(destination, liftNo) {
  if (!TOTAL_LIFTS[liftNo].className.includes("moving")) {
    flip.first(TOTAL_LIFTS[liftNo]);
    flip.append(destination, TOTAL_LIFTS[liftNo]); //append
    const delta = flip.invert(TOTAL_LIFTS[liftNo]);
    flip.play(TOTAL_LIFTS[liftNo], delta);
  }
}

function getIdleLifts(lifts) {
  lifts.forEach((lift) => {
    if (lift.classList.contains("moving")) log(lift);
  });
}

//flip animation
class Flip {
  first(el) {
    el.classList.add("moving");
    this.state = el.getBoundingClientRect();
  }

  append(destination, el) {
    floors[destination].appendChild(el);
  }
  invert(el) {
    const first = this.state;
    const last = el.getBoundingClientRect();
    let delta = -1 * (last.top - first.top);
    el.style.transform = `translateY(${delta}px)`;
    return delta;
  }

  play(el, delta) {
    requestAnimationFrame(function () {
      el.style.transition = `all ${Math.abs(delta * 3)}ms ease-in-out`;
      el.style.transform = "none";
    });
  }
}

const flip = new Flip();
