document.addEventListener("DOMContentLoaded", (event) => {
  const n = `
        <button id="pages/home.html" class="e e1 a">Home</button>
        <button id="https://github.com/rrivvi/HartUI" class="e e2 e-o">Repository</button>
        <button id="/docs/index.html" class="e e4 e-o">Docs</button>
        <button id="/docs/index.html?p=Overview" class="e e5 e-o">Controls</button>
    `;

  const h = document.getElementById("h");
  const i = document.getElementById("i");
  h.innerHTML = n;

  function l() {
    if (document.title === "HartUI" || i.src === "") {
      for (ch2 of h.children) {
        ch2.classList.remove("a");
      }
      document.title = h.children[0].textContent;
      h.children[0].classList.add("a");
      i.src = h.children[0].id;
    }
  }

  for (ch of h.children) {
    const z = ch;
    ch.addEventListener("click", () => {
      if (z.classList.contains("e-o")) {
        top.location = z.id;
      } else {
        if (document.title === z.textContent) {
          return;
        }
        document.title = z.textContent;
        i.src = z.id;
        z.classList.add("a");
        for (ch2 of h.children) {
          if (ch2 != z) {
            ch2.classList.remove("a");
          }
        }
      }
    });
  }

  setInterval(() => {
    l();
  }, 1000);
  l();
});
