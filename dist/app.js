const hero = document.querySelector(".hero");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let revealTimer;

function reveal() {
  window.clearTimeout(revealTimer);
  revealTimer = window.setTimeout(
    () => hero.classList.add("is-revealed"),
    reduceMotion.matches ? 0 : 650,
  );
}

function replay() {
  window.clearTimeout(revealTimer);
  hero.classList.remove("is-revealed");
  void hero.offsetWidth;
  reveal();
}

window.addEventListener("load", reveal, { once: true });

window.__replayAngelsHero = replay;
