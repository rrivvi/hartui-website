let searchBar = null
let resultsContainer = null;

async function get_documentation_json() {
  const response = await fetch("documentation.json");

  if (!response.ok) {
    throw new Error("`documentation.json` couldn't be read");
  }

  return await response.json();
}

addEventListener("DOMContentLoaded", async (event) => {
  searchBar = document.querySelector(".search-container > input")
  resultsContainer = document.querySelector(".search-results-container")

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();

      searchBar.focus();
      searchBar.select();
    }
  });

  // navigation.js supplies a global main (main is the iframe holding docs content)
  main.addEventListener("load", () => {
    main.contentWindow.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();

        searchBar.focus();
        searchBar.select();
      }
    });
  });

  let documentationJson = null;
  (async () => {
    documentationJson = await get_documentation_json();
  })();

  // navigation.js sets the value of classesListString
  while (classesList == [] && documentationJson == null) {
    await new Promise(resolve => setTimeout(resolve, 999999999999));
  }

  let lastMatchingPages = [];

  searchBar.addEventListener('input', (textEvent) => {
    const query = textEvent.target.value.toLowerCase().trim();

    if (query == "") {
      lastMatchingPages = [];
      resultsContainer.innerHTML = `<p class="no-results">No results found.</p>`;
      return;
    }

    // Search through docs json
    if (documentationJson != null) {
      const kindPriority = {
        "Controls": 0,
        "Components": 1,
        "Miscellaneous": 2,
        "Docs": 3
      };

      const escapeHtml = (value) => String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

      const escapeJsString = (value) => String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");

      const isMatch = (text) => String(text).toLowerCase().includes(query);

      const buildResultButton = (className, pageName, textContent, hash = "") => {
        pageName = pageName.replace(".html", "");
        return `<button class="${className}" onclick="loadDoc('${escapeJsString(pageName)}', '${escapeJsString(hash)}')">${escapeHtml(textContent)}</button>`;
      };

      const results = [];

      for (const entry of documentationJson) {
        const kind = entry.Kind || "";
        const header = entry.Header || "";
        const fileName = entry.FileName || "";
        const relativePath = entry.RelativePath || "";

        const isControl = kind === "Controls";
        const isComponent = kind === "Components";
        const isDoc = kind === "Docs";
        const isMiscellaneous = kind === "Miscellaneous";

        const pageName = relativePath || fileName || header;
        const displayName = header || fileName;

        const pageMatches =
          isControl || isComponent || isDoc || isMiscellaneous
            ? isMatch(header) ||
            isMatch(fileName) ||
            isMatch(relativePath) ||
            isMatch(entry.Summary)
            : false;

        if (pageMatches) {
          results.push({
            sortKind: kindPriority[kind] ?? 99,
            sortType: 0,
            sortName: displayName.toLowerCase(),
            html: buildResultButton(
              isComponent
                ? "search-result-component"
                : isControl
                  ? "search-result-control"
                  : isMiscellaneous
                    ? "search-result-miscellaneous"
                    : "search-result-docs",
              pageName,
              displayName
            )
          });
        }

        const pushMembers = (items, memberClassName, memberTypeOrder, prefixLabel) => {
          if (!Array.isArray(items)) return;

          for (const item of items) {
            const memberName = item?.Name || "";
            const memberDescription = item?.Description || "";

            if (!isMatch(memberName) && !isMatch(memberDescription) && !isMatch(header) && !isMatch(fileName)) {
              continue;
            }

            // slugify function is supplied by navigation.js 
            const memberHash = `#${prefixLabel}-${slugify(memberName)}`;

            results.push({
              sortKind: kindPriority[kind] ?? 99,
              sortType: memberTypeOrder,
              sortName: displayName.toLowerCase(),
              html: buildResultButton(
                memberClassName,
                pageName,
                `${displayName} • ${memberName}`,
                memberHash
              )
            });
          }
        };

        pushMembers(entry.Properties, "search-result-property", 1, "property");
        pushMembers(entry.Methods, "search-result-method", 2, "method");
        pushMembers(entry.Events, "search-result-event", 3, "event");

        if (isControl || isComponent || isDoc) {
          continue;
        }
      }

      results.sort((a, b) =>
        a.sortType - b.sortType ||
        a.sortKind - b.sortKind ||
        a.sortName.localeCompare(b.sortName)
      );

      const dedupedHtml = [];
      const seen = new Set();

      for (const result of results) {
        if (seen.has(result.html)) continue;
        seen.add(result.html);
        dedupedHtml.push(result.html);
      }

      const limitedHtml = dedupedHtml.slice(0, 8).join("");

      if (limitedHtml === "") {
        resultsContainer.innerHTML = `<p class="no-results">No results found.</p>`;
      } else {
        resultsContainer.innerHTML = limitedHtml;
      }
    }
    // Fallback to searching only page names
    else {
      const matchingPagesArray = classesList.filter(page =>
        page.toLowerCase().includes(query)
      ).slice(0, 6);

      function arraysEqual(a, b) {
        return a.length === b.length &&
          a.every((value, index) => value === b[index]);
      }

      if (!arraysEqual(matchingPagesArray, lastMatchingPages)) {
        lastMatchingPages = [...matchingPagesArray];

        if (matchingPagesArray.length == 0) {
          resultsContainer.innerHTML = `<p class="no-results">No results found.</p>`;
        }

        let tempHtmlString = "";

        matchingPagesArray.forEach(pageName => {
          const arr = pageName.includes("/") ? pageName.split("/") : null;
          const textContent = pageName.includes("/") ? arr[1] : pageName;
          const kind = pageName.includes("/") ? arr[0] : "";

          if (kind == "controls") {
            tempHtmlString += `<button class="search-result-control" onclick="loadDoc('${pageName}')">${textContent}</button>`;
          }
          else if (kind == "components") {
            tempHtmlString += `<button class="search-result-component" onclick="loadDoc('${pageName}')">${textContent}</button>`;
          }
          else {
            tempHtmlString += `<button class="search-result-docs" onclick="loadDoc('${pageName}')">${textContent}</button>`;
          }
        });

        resultsContainer.innerHTML = tempHtmlString;
      }
    }
  });
})