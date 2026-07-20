function fetch_and_process_list() {
  fetch("list")
    .then((response) => {
      if (!response.ok) {
        err();
        return "";
      }
      return response.text();
    })
    .then((text) => {
      if (text != "") {
        processSections(text.split("|"));
      }
    });

  function err() {
    console.error("`list` file couldn't be read");
  }
}

function processSections(sectionsArray) {
  createIntroduction(trimEntry(sectionsArray[0]));
  createComponents(trimEntry(sectionsArray[1]));
  createControls(trimEntry(sectionsArray[2]));
  createMiscallenous(trimEntry(sectionsArray[3]));

  const url = new URL(location);
  const pageName = url.searchParams.get("p") || introductionSection.firstChild.textContent;
  const hash = url.hash || "";

  if (!url.searchParams.get("p")) {
    url.searchParams.set("p", pageName);
    history.replaceState({}, "", url);
  }

  main.src = `/docs/pages/${pageName}.html${hash}`;
}

let componentsSection = document.getElementById("l1");
let controlsSection = document.getElementById("l2");
let introductionSection = document.getElementById("l3");
let miscallenousSection = document.getElementById("l4");
let main = document.getElementById("m").children[0];

function createComponents(listToParse) {
  addToSection(listToParse, componentsSection);
}

function createControls(listToParse) {
  addToSection(listToParse, controlsSection);
}

function createIntroduction(listToParse) {
  addToSection(listToParse, introductionSection);
}

function createMiscallenous(listToParse) {
  addToSection(listToParse, miscallenousSection);
}

function addToSection(entriesList, targetSection) {
  for (let i in entriesList) {
    if (entriesList[i] == "" || entriesList[i] == "-") {
      continue;
    }
    const newListEntry = document.createElement("li");
    newListEntry.innerText = entriesList[i];
    newListEntry.onclick = (e) => {
      if (targetSection === componentsSection) {
        onButtonNavigated("components/" + entriesList[i]);
      }
      else if (targetSection === controlsSection) {
        onButtonNavigated("controls/" + entriesList[i]);
      }
      else if (targetSection === miscallenousSection) {
        onButtonNavigated("miscallenous/" + entriesList[i]);
      }
      else {
        onButtonNavigated(entriesList[i]);
      }

    };
    targetSection.appendChild(newListEntry);
  }
}

function onButtonNavigated(target) {
  loadDoc(target);
}

function loadDoc(page, hash = "") {
  main.src = `/docs/pages/${page}.html${hash}`;
  const url = new URL(location);
  url.searchParams.set("p", page);
  url.hash = hash;
  history.pushState({}, "", url);
}

function trimEntry(uns) {
  return uns.trim().split("\r\n");
}

main.onload = () => {
  const doc = main.contentDocument;

  doc.querySelectorAll("h1,h2,h3,h4").forEach(h => {
    if (!h.id) {
      h.id = h.textContent
        .trim()
        .toLowerCase()
        .replace(/[^\w]+/g, "-");

      h.style = "display: inline-flex;";

      const but = document.createElement("button")
      h.appendChild(but);
      but.title = "Copy link";

      but.onclick = () => {
        const url = new URL(window.location);
        url.hash = h.id;

        navigator.clipboard.writeText(url.toString());
      };
    }
  });

  const hash = window.location.hash;

  if (hash) {
    const target = doc.querySelector(hash);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }
};

window.addEventListener("hashchange", () => {
  const doc = main.contentDocument;
  if (!doc) return;

  if (!location.hash) {
    return;
  }

  const target = doc.querySelector(location.hash);
  target?.scrollIntoView({
    behavior: "smooth"
  });
});

fetch_and_process_list();
