function t_0() {
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
        p_0(text.split(":"));
      }
    });

  function err() {
    console.error("`list` file couldn't be read");
  }
}

function p_0(splitArr) {
  p_5(s_0(splitArr[0]));
  p_1(s_0(splitArr[1]));
  p_2(s_0(splitArr[2]));

  if (
    window.location.search.startsWith("?p=") &&
    !window.location.search.includes("/")
  ) {
    let p = window.location.search.split("?p=")[1];
    main.src = "/docs/pages/" + p + ".html";
  } else {
    const url = new URL(location);
    url.searchParams.set("p", l3.firstChild.textContent);
    history.pushState({}, "", url);
    main.src = "/docs/pages/" + l3.firstChild.textContent + ".html";
  }
}

let l1 = document.getElementById("l1");
let l2 = document.getElementById("l2");
let l3 = document.getElementById("l3");
let main = document.getElementById("m").children[0];

function p_1(toparse) {
  p_3(toparse, l1);
}

function p_2(toparse) {
  p_3(toparse, l2);
}

function p_5(toparse) {
  p_3(toparse, l3);
}

function p_3(toparse, ta) {
  for (let i in toparse) {
    if (toparse[i] == "" || toparse[i] == "-") {
      continue;
    }
    const newListEntry = document.createElement("li");
    newListEntry.innerText = toparse[i];
    newListEntry.onclick = (e) => {
      p_4(toparse[i]);
    };
    ta.appendChild(newListEntry);
  }
}

function p_4(target) {
  main.src = "/docs/pages/" + target + ".html";
  const url = new URL(location);
  url.searchParams.set("p", target);
  history.pushState({}, "", url);
  console.log("redirecting to " + main.src);
}

function s_0(uns) {
  return uns.trim().split("\r\n");
}

t_0();
