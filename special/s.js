document.addEventListener("DOMContentLoaded", (event) => {
  (function () {
  const MAX_FLAKES = 100;
  const flakes = [];

  function createFlake() {
    const size = Math.random() * 7 + 1; // 1px–4px
    const flake = document.createElement("div");

    flake.className = "snowflake";
    flake.style.width = size + "px";
    flake.style.height = size + "px";
    flake.style.left = Math.random() * window.innerWidth + "px";

    document.body.appendChild(flake);

    flakes.push({
      el: flake,
      y: -10,
      speed: size * 0.6 // bigger flakes fall faster
    });
  }

  function update() {
    for (let i = flakes.length - 1; i >= 0; i--) {
      const f = flakes[i];
      f.y += f.speed;
      f.el.style.top = f.y + "px";

      if (f.y > window.innerHeight) {
        f.el.remove();
        flakes.splice(i, 1);
      }
    }

    if (flakes.length < MAX_FLAKES && Math.random() < 0.3) {
      createFlake();
    }

    requestAnimationFrame(update);
  }

  update();
})();
});