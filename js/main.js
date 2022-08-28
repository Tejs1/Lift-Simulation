const floors = document.querySelectorAll(".floor");
const lift = document.querySelector(".lift");
const buttons = document.querySelectorAll("button");
let isMoving = false;

const currentLiftFloor = () => {
  return Number(lift.parentNode.className.match(/\d/g));
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
    console.log(destination);
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    (async () => {
      for (i = 0; true; i++) {
        if (destination > currentLiftFloor()) {
          moveUp();
        }
        if (destination < currentLiftFloor()) {
          moveDown();
        }
        if (destination == currentLiftFloor()) {
          return;
        }
        await wait(1000);
      }
    })();
  })
);

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

lift.addEventListener("transitionend", (e) => {
  e.target.classList.remove("animate");
  isMoving = false;
});

function moveDown() {
  console.log("down");
  if (isMoving) return;
  isMoving = true;
  const goTo = floors[currentLiftFloor() - 1];
  flip.first(lift);
  goTo.appendChild(lift); //append
  flip.invert(lift);
  flip.play(lift);
}

function moveUp() {
  console.log("up");
  if (isMoving) return;
  isMoving = true;
  const goTo = floors[currentLiftFloor() + 1];
  flip.first(lift);
  goTo.appendChild(lift); //append
  flip.invert(lift);
  flip.play(lift);
}
