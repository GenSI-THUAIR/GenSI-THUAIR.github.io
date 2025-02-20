/* jshint browser: true */

function resetTagButtons() {
  document.querySelector("#tagSelect")
    .querySelectorAll("button")
    .forEach(button => {
      button.classList.remove("active");
    });
}

function clearSearchInput() {
  document.getElementById('pub-search').value = "";
}

function clickTagButton(tagBtn) {
  clearSearchInput();
  if (tagBtn.classList.contains("active")) {
    tagBtn.classList.remove("active");
    showPublicationsByTitle("");
  } else {
    const tag = tagBtn.textContent;
    resetTagButtons();
    tagBtn.classList.add("active");
    showPublicationsByTag(tag);
  }
}

function showPublicationsByTag(tag) {
  // #research-papers > div:nth-child(1) > p > b
  const papers = document.querySelector("#research-papers");

  papers.querySelectorAll("div.paper").forEach(paper_div => {
    const entry_tags = paper_div.querySelector("div.paper-buttons").getAttribute("data-tags");

    if (tag === "" || (entry_tags !== "" && entry_tags.includes(tag))) {
      paper_div.style.display = "grid";
    } else {
      paper_div.style.display = "none";
    }
  });
}

function showPublicationsByTitle(query) {
  resetTagButtons();
  // search title only
  // #research-papers > div:nth-child(1) > p > b
  const papers = document.querySelector("#research-papers");

  papers.querySelectorAll("div.paper").forEach(paper_div => {
    const title = paper_div.querySelector("p.title").textContent;
    if (query === "" || title.toLowerCase().includes(query.toLowerCase())) {
      paper_div.style.display = "grid";
    } else {
      // hide paper_div
      paper_div.style.display = "none";
    }
  });
}

function bindKeyEventForSearch() {
  const inputElement = document.getElementById('pub-search');
  if (inputElement.getAttribute('data-search') !== '0') return; // manual binding
  inputElement.setAttribute('data-search', '1');


  inputElement.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const searchValue = inputElement.value;
      showPublicationsByTitle(searchValue);
    }
  });
}

function resetSearch() {
  clearSearchInput();
  showPublicationsByTitle("");
}