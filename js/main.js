const floors = document.querySelectorAll(".lift-path");
const lifts = document.querySelectorAll(".lift");
const buttons = document.querySelectorAll("button");
const log = console.log

const TOTALLIFTS = [];
let idleLifts = []
const allFlips = {}
lifts.forEach((lift, idx) => {
  TOTALLIFTS.push(lift);
  lift.style.left = `${100/lifts.length * idx}%`
  lift.addEventListener("transitionend", (e) => {
    idleLifts.push(e.target)
    e.target.style.transition = `initial`;
    console.log("end anim");
    e.target.classList.remove("moving");
  });
});




const currentLiftFloor = (lift) => {
  return  Number(lift.parentNode.parentNode.className.match(/\d/g))
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
    log("nearlift " +getLift(destination))
    moveLift(destination, getLift(destination))
  })
);

function getShortestDistance( lift ,destination, j  ){  
  if(Math.abs(currentLiftFloor(lift) - destination) === 0){
    log( j  + "seeting")
    return j
  }
}


function getLift(destination){
   let liftNo = false;
   
   for(let i=0; i< floors.length; i++){
    // if(liftNo) return liftNo
    for(j=0 ; j < TOTALLIFTS.length; j++){
      if(liftNo  || liftNo === 0) return liftNo
      if(!TOTALLIFTS[j].classList.contains("moving")){
        if(Math.abs(Math.abs(currentLiftFloor(TOTALLIFTS[j]) - destination)) === i){
          liftNo = j      
        }
      }   
    }
  }
  log(liftNo)
  return liftNo
 }

function moveLift(destination, liftNo) {
  if (!TOTALLIFTS[liftNo].className.includes("moving")) {
  flip.first(TOTALLIFTS[liftNo]);
  flip.append(destination ,TOTALLIFTS[liftNo]); //append
  const delta = flip.invert(TOTALLIFTS[liftNo]);
  flip.play(TOTALLIFTS[liftNo],delta);
  }
 }


//flip animation
class Flip {
  first(el) {
    el.classList.add("moving")
    this.state = el.getBoundingClientRect();
  }

  append(destination,el){
    floors[destination].appendChild(el)
  }
  invert(el) {
    const first = this.state;
    const last = el.getBoundingClientRect();
    let delta = -1 * (last.top - first.top);
    el.style.transform = `translateY(${delta}px)`;
    return delta
  }

  play(el ,delta) {
    requestAnimationFrame(function () {
      el.style.transition = `all ${Math.abs(delta * 2)}ms ease-in-out`;
      el.style.transform = "none";
    });
  }
}

const flip = new Flip()