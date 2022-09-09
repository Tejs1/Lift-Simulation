const floors = document.querySelectorAll(".floor");
const lifts = document.querySelectorAll(".lift");
const buttons = document.querySelectorAll("button");
let isMoving = false;
const TOTALLIFTS = [];

{
  lifts.forEach((lift) => {
    TOTALLIFTS.push(lift);
    lift.addEventListener("transitionend", (e) => {
      e.target.classList.remove("animate");
      isMoving = false;
    });
  });
}
TOTALLIFTS[1].style.backgroundColor = "red";
console.log(TOTALLIFTS);

const currentLiftFloor = (liftNo) => {
  return Number(TOTALLIFTS[liftNo].parentNode.className.match(/\d/g));
};

const getCurrentControllerFloor = (element) => {
  const currentClassName = element.parentNode.parentNode.className;
  //extracts number from className
  return Number(currentClassName.match(/\d/g));
};
buttons.forEach((btn) =>
  btn.addEventListener("click", (e) => {
    const btnDirection = e.target.className;
    const destination = getCurrentControllerFloor(e.target);
    console.log("destination" + destination);
    moveLift(destination, 1);
  })
);

function moveLift(destination, liftNo) {
  console.log("movelift" + destination + "" + liftNo);
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  (async () => {
    for (i = 0; true; i++) {
      console.log("currentfloorlift" + currentLiftFloor(liftNo));
      if (destination > currentLiftFloor(liftNo)) {
        moveUp(liftNo);
      }
      if (destination < currentLiftFloor(liftNo)) {
        console.log("movedown");
        moveDown(liftNo);
      }
      if (destination == currentLiftFloor(liftNo)) {
        return;
      }
      await wait(1000);
      console.log("loop");
    }
  })();
}

//flip animation
class Flip {
  first(el) {
    this.state = el.getBoundingClientRect();
  }

  invert(el) {
    const first = this.state;
    const last = el.getBoundingClientRect();
    let delta = -1 * (last.top - first.top);
    el.style.transform = `translateY(${delta}px)`;
  }

  play(el) {
    requestAnimationFrame(function () {
      el.classList.add("animate");
      el.style.transform = "none";
    });
  }
}

const flip = new Flip();

function moveDown(liftNo) {
  if (isMoving) return;
  isMoving = true;
  const goTo = floors[currentLiftFloor(liftNo) - 1];
  flip.first(TOTALLIFTS[liftNo]);
  goTo.appendChild(TOTALLIFTS[liftNo]); //append
  flip.invert(TOTALLIFTS[liftNo]);
  flip.play(TOTALLIFTS[liftNo]);
}

function moveUp(liftNo) {
  if (isMoving) return;
  isMoving = true;
  const goTo = floors[currentLiftFloor(liftNo) + 1];
  flip.first(TOTALLIFTS[liftNo]);
  goTo.appendChild(TOTALLIFTS[liftNo]); //append
  flip.invert(TOTALLIFTS[liftNo]);
  flip.play(TOTALLIFTS[liftNo]);
}
