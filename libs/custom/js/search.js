/* jshint browser: true */

function showAllPapers() {
  const limited = document.querySelector("#research-papers-limited");
  limited.style.display = "none";
  const all = document.querySelector("#research-papers");
  all.style.display = "block";
}

function showLimitedPapers() {
  const limited = document.querySelector("#research-papers-limited");
  limited.style.display = "block";
  const all = document.querySelector("#research-papers");
  all.style.display = "none";
}

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
  // toggle show limited papers
  document.querySelector("#research-papers-limited").style.display = "block";
  document.querySelector("#research-papers").style.display = "none";

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
  showAllPapers();
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
  showAllPapers();
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

function showAllPublications() {
  const papers = document.querySelector("#research-papers");

  papers.querySelectorAll("div.paper").forEach(paper_div => {
    paper_div.style.display = "grid";
  });
}

function resetSearch() {
  clearSearchInput();
  resetTagButtons();
  showLimitedPapers();
}

function clickShowAllButton() {
  resetTagButtons();
  showAllPublications(); // make all papers visible
  showAllPapers(); // make #research-papers visible
}