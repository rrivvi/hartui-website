let searchBar = null
let resultsContainer = null;

addEventListener("DOMContentLoaded", async (event) => {
    searchBar = document.querySelector(".search-container > input")
    resultsContainer = document.querySelector(".search-results-container")

    // navigation.js sets the value of classesListString
    while (classesList == []) {
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
                const textContent = pageName.includes("/") ? pageName.split("/")[1] : pageName;
                tempHtmlString += `<button onclick="loadDoc('${pageName}')">${textContent}</button>`;
            });

            resultsContainer.innerHTML = tempHtmlString;
        }
    });
})