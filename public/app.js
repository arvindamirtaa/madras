"use strict";

const searchInput = document.querySelector("#search");
const areaSelect = document.querySelector("#area");
const categoryButtons = document.querySelectorAll(".category");
const placesList = document.querySelector("#places");
const resultCount = document.querySelector("#result-count");
const clearButton = document.querySelector("#clear-filters");
const emptyState = document.querySelector("#empty-state");
const loadingList = document.querySelector("#loading-list");
const loadError = document.querySelector("#load-error");
const retryButton = document.querySelector("#retry-load");
const filterControls = document.querySelectorAll(".search-form input, .search-form select, .categories button");
let places = [];
let selectedCategory = "";
let isLoading = false;

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
  info.append(element("span", "place-category", place.category), element("h2", "", place.name));
  if (place.description) info.append(element("p", "place-description", place.description));

  const amenities = element("dl", "amenities");
  const availability = value => value === null ? "Unknown" : value ? "Yes" : "No";
  for (const [label, value, className] of [
    ["Wi-Fi:", availability(place.wifi), ""],
    ["Power sockets:", availability(place.powerSockets), ""],
    ["Work friendliness:", place.workFriendliness || "Not reviewed", "work-note"]
  ]) {
    const detail = element("div", className);
    detail.append(element("dt", "", label), element("dd", "", value));
    amenities.append(detail);
  }
  info.append(amenities);

  const location = element("div", "place-location");
  location.append(
    element("p", "place-area", place.area),
    element("p", "place-address", place.address)
  );

  const links = element("div", "place-links");
  const mapQuery = encodeURIComponent(`${place.name}, ${place.address}`);
  links.append(externalLink("View map", `https://www.google.com/maps/search/?api=1&query=${mapQuery}`, place.name));
  if (place.website && /^https?:\/\//i.test(place.website)) {
    links.append(externalLink("Website", place.website, place.name));
  }
  article.append(info, location, links);
  item.append(article);
  return item;
}

function render() {
  const terms = normalise(searchInput.value.trim()).split(/\s+/).filter(Boolean);
  const filtered = places.filter(place => {
    const text = normalise(`${place.name} ${place.area} ${place.category} ${place.description} ${place.address} ${place.workFriendliness || ""}`);
    return terms.every(term => text.includes(term))
      && (!areaSelect.value || place.area === areaSelect.value)
      && (!selectedCategory || place.category === selectedCategory);
  });

  placesList.replaceChildren(...filtered.map(placeRow));
  const hasFilters = terms.length > 0 || Boolean(areaSelect.value) || Boolean(selectedCategory);
  resultCount.textContent = hasFilters
    ? `${filtered.length} of ${places.length} places`
    : `${places.length} places · Listed A to Z`;
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

async function loadPlaces() {
  if (isLoading) return;
  isLoading = true;
  filterControls.forEach(control => { control.disabled = true; });
  retryButton.disabled = true;
  loadError.hidden = true;
  emptyState.hidden = true;
  placesList.hidden = true;
  loadingList.hidden = false;
  resultCount.textContent = "Loading places…";
  document.querySelector("#directory").setAttribute("aria-busy", "true");

  try {
    const response = await fetch("/api/places");
    if (!response.ok) throw new Error("The directory API is unavailable");
    const data = await response.json();
    if (!Array.isArray(data.places)) throw new Error("The directory response is invalid");
    places = data.places;

    areaSelect.replaceChildren(element("option", "", "All areas"));
    areaSelect.firstElementChild.value = "";
    const areas = [...new Set(places.map(place => place.area))].sort((a, b) => a.localeCompare(b));
    areas.forEach(area => {
      const option = document.createElement("option");
      option.value = area;
      option.textContent = area;
      areaSelect.append(option);
    });
    filterControls.forEach(control => { control.disabled = false; });
    render();
  } catch {
    resultCount.textContent = "Directory unavailable";
    loadError.hidden = false;
  } finally {
    isLoading = false;
    retryButton.disabled = false;
    loadingList.hidden = true;
    document.querySelector("#directory").setAttribute("aria-busy", "false");
  }
}

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
retryButton.addEventListener("click", () => { void loadPlaces(); });
void loadPlaces();
