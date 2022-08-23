const floors = document.querySelectorAll(".floor");
const lift = document.querySelector(".lift");
const buttons = document.querySelectorAll("button");

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
    getCurrentControllerFloor(e.target);
    if (btnDirection === "up") {
      const goTo = floors[currentLiftFloor()];

      flip.first(lift);
      goTo.appendChild(lift); //append
      flip.invert(lift);
      flip.play(lift);
    } else {
      const goTo = floors[currentLiftFloor() - 2];
      console.log(currentLiftFloor());
      flip.first(lift);
      goTo.appendChild(lift); //append
      flip.invert(lift);
      flip.play(lift);
    }
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
    console.log(delta);
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
  console.log("end");
  e.target.classList.remove("animate");
});
