# madras

A simple directory of food establishments in Chennai.

**Website:** https://arvindamirtaa.github.io/madras/

Plain HTML, CSS and JavaScript. No framework, dependencies, build step, account system or database.

## Run locally

Open `index.html` in a browser, or run a static server:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000. A network connection is only needed for the Google Fonts typeface and external links; the directory and filters work without it.

## Update the directory

Edit `places.js`. Each record describes one establishment location:

```js
{
  name: "Establishment name",
  neighbourhood: "Neighbourhood",
  category: "Restaurant", // Restaurant, Café, or Sweets & bakery
  description: "A short, factual description.",
  address: "Street address, Chennai",
  website: "https://example.com/",
  sources: ["https://example.com/location"]
}
```

Keep records in alphabetical order. Verify the location and description against the establishment's website or a current public listing, and retain the source URLs. The initial eight listings were checked against linked public sources on 12 October 2026. This is a starter directory, not a complete list of Chennai establishments. Prices, ratings and opening hours are omitted.

Search matches names, neighbourhoods, descriptions, types and addresses. Search, neighbourhood and establishment type filters work together.

## Hosting

GitHub Pages serves the `main` branch from the repository root. `.nojekyll` tells Pages to serve the static files directly. Push a change to `main` to update the website.

## Suggestions

[Open an issue](https://github.com/arvindamirtaa/madras/issues/new) with the establishment's name, neighbourhood, address and a source link.
