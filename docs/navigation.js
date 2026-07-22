let classesList = [];
let currentPage = null;

function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "-");
}

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
  createMiscellaneous(trimEntry(sectionsArray[3]));

  const url = new URL(location);
  const pageName = url.searchParams.get("p") || introductionSection.firstChild.textContent;
  const hash = url.hash || "";

  if (!url.searchParams.get("p")) {
    url.searchParams.set("p", pageName);
    history.replaceState({}, "", url);
  }

  currentPage = pageName;
  main.src = `/docs/pages/${pageName}.html${hash}`;
}

let componentsSection = document.getElementById("l1");
let controlsSection = document.getElementById("l2");
let introductionSection = document.getElementById("l3");
let miscellaneousSection = document.getElementById("l4");
let main = document.getElementById("m").children[0];

function createComponents(listToParse) {
  addToSection(listToParse, componentsSection);
  listToParse.forEach(element => {
    classesList.push(`components/${element}`);
  });
}

function createControls(listToParse) {
  addToSection(listToParse, controlsSection);
  listToParse.forEach(element => {
    classesList.push(`controls/${element}`);
  });
}

function createIntroduction(listToParse) {
  addToSection(listToParse, introductionSection);
  listToParse.forEach(element => {
    classesList.push(element);
  });
}

function createMiscellaneous(listToParse) {
  addToSection(listToParse, miscellaneousSection);
  listToParse.forEach(element => {
    classesList.push(`miscellaneous/${element}`);
  });
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
      else if (targetSection === miscellaneousSection) {
        onButtonNavigated("miscellaneous/" + entriesList[i]);
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
  const url = new URL(location);
  url.searchParams.set("p", page);
  url.hash = hash;

  if (page === currentPage) {
    history.pushState({}, "", url);
    scrollToHash();
    return;
  }

  currentPage = page;
  main.src = `/docs/pages/${page}.html${hash}`;
  history.pushState({}, "", url);
}

function trimEntry(uns) {
  return uns.trim().split("\r\n");
}

main.onload = () => {
  const doc = main.contentDocument;

  doc.querySelectorAll("h1,h2,h3,h4").forEach(h => {
    if (!h.id) {
      h.id = slugify(h.textContent);

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

  // Give every properties/methods/events table row an
  // id for search results to be able to scroll
  doc.querySelectorAll("table").forEach(table => {
    const headerCell = table.querySelector("thead th");
    if (!headerCell) return;

    const headerText = headerCell.textContent.trim().toLowerCase();
    let prefix = null;
    if (headerText.startsWith("propert")) prefix = "property";
    else if (headerText.startsWith("method")) prefix = "method";
    else if (headerText.startsWith("event")) prefix = "event";
    else return;

    table.querySelectorAll("tbody tr").forEach(row => {
      const nameCell = row.querySelector("td code");
      if (!nameCell || row.id) return;
      row.id = `${prefix}-${slugify(nameCell.textContent)}`;
    });
  });

  scrollToHash();
};

window.addEventListener("hashchange", () => {
  scrollToHash();
});

function scrollToHash() {
  const doc = main.contentDocument;
  if (!doc || !location.hash) return;

  const target = doc.querySelector(location.hash);
  if (target != null) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    target.classList.remove("search-result-animation");
    void target.offsetWidth;
    target.classList.add("search-result-animation");

    target.addEventListener(
      "animationend",
      () => target.classList.remove("search-result-animation"),
      { once: true }
    );
  }
}

fetch_and_process_list();
