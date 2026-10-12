"use strict";

const searchInput = document.querySelector("#search");
const areaSelect = document.querySelector("#neighbourhood");
const categoryButtons = document.querySelectorAll(".category");
const placesList = document.querySelector("#places");
const resultCount = document.querySelector("#result-count");
const clearButton = document.querySelector("#clear-filters");
const emptyState = document.querySelector("#empty-state");
let selectedCategory = "";

function normalise(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function externalLink(label, href, placeName) {
  const link = element("a", "", label);
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `${label} for ${placeName} (opens in a new tab)`);
  const arrow = element("span", "", "↗");
  arrow.setAttribute("aria-hidden", "true");
  link.append(arrow);
  return link;
}

function placeRow(place) {
  const item = document.createElement("li");
  const article = element("article", "place");
  const info = document.createElement("div");
  info.append(
    element("span", "place-category", place.category),
    element("h2", "", place.name),
    element("p", "place-description", place.description)
  );

  const location = element("div", "place-location");
  location.append(
    element("p", "place-area", place.neighbourhood),
    element("p", "place-address", place.address)
  );

  const links = element("div", "place-links");
  const mapQuery = encodeURIComponent(`${place.name}, ${place.address}`);
  links.append(
    externalLink("View map", `https://www.google.com/maps/search/?api=1&query=${mapQuery}`, place.name),
    externalLink("Website", place.website, place.name)
  );
  article.append(info, location, links);
  item.append(article);
  return item;
}

function render() {
  const terms = normalise(searchInput.value.trim()).split(/\s+/).filter(Boolean);
  const filtered = PLACES.filter(place => {
    const text = normalise(`${place.name} ${place.neighbourhood} ${place.category} ${place.description} ${place.address}`);
    return terms.every(term => text.includes(term))
      && (!areaSelect.value || place.neighbourhood === areaSelect.value)
      && (!selectedCategory || place.category === selectedCategory);
  });

  placesList.replaceChildren(...filtered.map(placeRow));
  const hasFilters = terms.length > 0 || Boolean(areaSelect.value) || Boolean(selectedCategory);
  resultCount.textContent = hasFilters
    ? `${filtered.length} of ${PLACES.length} places`
    : `${PLACES.length} places · Listed A to Z`;
  clearButton.hidden = !hasFilters;
  emptyState.hidden = filtered.length > 0;
  placesList.hidden = filtered.length === 0;
}

function resetFilters() {
  searchInput.value = "";
  areaSelect.value = "";
  selectedCategory = "";
  categoryButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.category === "")));
  render();
  searchInput.focus();
}

const areas = [...new Set(PLACES.map(place => place.neighbourhood))].sort((a, b) => a.localeCompare(b));
areas.forEach(area => {
  const option = document.createElement("option");
  option.value = area;
  option.textContent = area;
  areaSelect.append(option);
});

document.querySelector(".search-form").addEventListener("submit", event => event.preventDefault());
searchInput.addEventListener("input", render);
areaSelect.addEventListener("change", render);
categoryButtons.forEach(button => button.addEventListener("click", () => {
  selectedCategory = button.dataset.category;
  categoryButtons.forEach(categoryButton => categoryButton.setAttribute("aria-pressed", String(categoryButton === button)));
  render();
}));
clearButton.addEventListener("click", resetFilters);
document.querySelector("#reset-search").addEventListener("click", resetFilters);
render();
