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
        processSections(text.split(":"));
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

  if (
    window.location.search.startsWith("?p=") &&
    !window.location.search.includes("/")
  ) {
    let pageName = window.location.search.split("?p=")[1];
    main.src = "/docs/pages/" + pageName + ".html";
  } else {
    const url = new URL(location);
    url.searchParams.set("p", introductionSection.firstChild.textContent);
    history.pushState({}, "", url);
    main.src = "/docs/pages/" + introductionSection.firstChild.textContent + ".html";
  }
}

let componentsSection = document.getElementById("l1");
let controlsSection = document.getElementById("l2");
let introductionSection = document.getElementById("l3");
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

function addToSection(toparse, ta) {
  for (let i in toparse) {
    if (toparse[i] == "" || toparse[i] == "-") {
      continue;
    }
    const newListEntry = document.createElement("li");
    newListEntry.innerText = toparse[i];
    newListEntry.onclick = (e) => {
      onButtonNavigated (toparse[i]);
    };
    ta.appendChild(newListEntry);
  }
}

function onButtonNavigated(target) {
  main.src = "/docs/pages/" + target + ".html";
  const url = new URL(location);
  url.searchParams.set("p", target);
  history.pushState({}, "", url);
  console.log("redirecting to " + main.src);
}

function trimEntry(uns) {
  return uns.trim().split("\r\n");
}

fetch_and_process_list();
