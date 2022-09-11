const floors = document.querySelectorAll(".floor");
const lifts = document.querySelectorAll(".lift");
const buttons = document.querySelectorAll("button");
let isMoving = false;
const TOTALLIFTS = [];

lifts.forEach((lift) => {
  TOTALLIFTS.push(lift);
  lift.addEventListener("transitionend", (e) => {
    e.target.classList.remove("animate");
    console.log("end anim");
    isMoving = false;
  });
});

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
    if (true) {
      moveLift(destination, 0);
    } else {
    }
    // moveLift(destination, 1);
    // async function calllifts() {
    //   await moveLift(3, 1);
    //   await moveLift(2, 0);
    // }
    // calllifts();
  })
);
// create a destination array
// destination [0,1,2,]
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function moveLift(destination, liftNo) {
  (async () => {
    for (i = 0; true; i++) {
      if (!TOTALLIFTS[1].className.includes("animate")) {
        console.log("loop");
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
      }

      await wait(10);
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

// class ConcurrentTaskQueue {
//   constructor(taskPromisesFunc = [], batchSize = 1) {
//     this.batchSize =
//       batchSize > taskPromisesFunc.length ? taskPromisesFunc.length : batchSize;
//     this.todoTasks = taskPromisesFunc;
//     this.resolvedValues = [];
//   }

//   run(resolve, reject) {
//     if (this.todoTasks.length > 0) {
//       const taskPromises = this.todoTasks.splice(0, this.batchSize);
//       Promise.all(taskPromises.map((p) => p()))
//         .then((resolvedValues) => {
//           this.resolvedValues = [...this.resolvedValues, ...resolvedValues];
//           this.run(resolve, reject);
//         })
//         .catch((err) => reject(err));
//     } else {
//       resolve(this.resolvedValues);
//     }
//   }

//   runTasks() {
//     return new Promise((resolve, reject) => {
//       this.run(resolve, reject);
//     });
//   }
// }

// // some arbitrary function that consumes resources
// const costlyFunction = (arg) =>
//   new Promise((resolve) => {
//     // do something costly here
//     resolve(arg);
//   });

// const batchSize = 2;
// const taskQueue = new ConcurrentTaskQueue(
//   [
//     // wrap all functions to prevent direct execution
//     () => moveLift(2, 0),
//     () => moveLift(3, 1),
//   ],
//   batchSize
// );
// taskQueue.runTasks().then(([res1, res2]) => {
//   console.log(res1, res2);
// });
