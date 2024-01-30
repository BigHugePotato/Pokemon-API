import { typeGradients, typeTextColors } from "./styles.js";

const buttonHome = document.getElementById("btn-home");
const buttonPrev = document.getElementById("btn-prev");
const buttonNext = document.getElementById("btn-next");
const errorMsgEl = document.getElementById("error-msg");
const mainContainer = document.getElementById("main-container");
const searchBar = document.getElementById("pokemon-search");
const searchBtn = document.getElementById("search-btn");

const pokedexUrl = "https://pokeapi.co/api/v2/pokemon?offset=0&limit=20";

let pokemonList = [];

searchBtn.addEventListener("click", searchPokemon);
searchBar.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchPokemon();
  }
});
buttonHome.addEventListener("click", () => {
  displayPokemonList(pokedexUrl);
});
buttonNext.addEventListener("click", () => {
  if (nextUrl) displayPokemonList(nextUrl);
});
buttonPrev.addEventListener("click", () => {
  if (prevUrl) displayPokemonList(prevUrl);
});

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("pokemonOverlay");
  const overlayContent = document.querySelector(".overlay-content");

  // Prevent clicks inside the overlay content from closing the overlay
  overlayContent.addEventListener("click", (event) => event.stopPropagation());

  // Attach click event listener to the overlay
  overlay.addEventListener("click", () => {
    overlay.style.display = "none";
    document.body.classList.remove("active-overlay");
  });
});

/**
 *
 * @param {*} url
 * Gets the data from the api in a async way. If nothing is wrong writes it into an json structure.
 *
 * ".ok" is a fetch property, it checks if the status is 200-299. Which is success.
 *
 * catches errors that occur inside the try block
 */
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch Error: ", error);
    throw error;
  }
}

let nextUrl = null;
let prevUrl = null;

/**
 *
 * @param {*} url
 * Waits for data from the API via fetchData.
 *
 * If success, stores the data in the data const
 */
async function updatePokemonList(url) {
  const data = await fetchData(url);
  if (data) {
    pokemonList = data.results;
    nextUrl = data.next;
    prevUrl = data.previous;
  }
}

async function displayPokemonList(url = pokedexUrl) {
  await updatePokemonList(url);
  mainContainer.innerHTML = "";
  for (const pokemon of pokemonList) {
    const pokemonData = await fetchData(pokemon.url);
    const pokemonCard = createPokemonCard(pokemonData);
    mainContainer.appendChild(pokemonCard);
  }
}

function createPokemonCard(pokemonData, isSearchResult = false) {
  const containerEl = document.createElement("div");
  containerEl.className = isSearchResult
    ? "searchPokemonContainer"
    : "pokemonContainer";

  const imageEl = document.createElement("img");
  imageEl.src = pokemonData.sprites.other["official-artwork"].front_default;
  imageEl.alt = `Image of ${pokemonData.name}`;
  imageEl.className = isSearchResult ? "searchedPokeImage" : "pokeImage";

  const pokemonId = document.createElement("h3");
  pokemonId.textContent = `#${pokemonData.id}`;

  const titleEl = document.createElement("h2");
  titleEl.className = isSearchResult ? "pokemon-title" : "";
  titleEl.textContent = pokemonData.name;

  const shinyCheckbox = createShinyCheckbox(pokemonData, imageEl);

  containerEl.append(
    imageEl,
    pokemonId,
    shinyCheckbox.checkbox,
    shinyCheckbox.label,
    titleEl
  );

  pokemonData.types.forEach((typeInfo) => {
    const typeEl = createTypeElement(typeInfo);
    containerEl.append(typeEl);
  });

  containerEl.addEventListener("click", () => {
    showPokemonDetailsInOverlay(pokemonData);
  });

  return containerEl;
}

function createTypeElement(typeInfo) {
  const typeEl = document.createElement("span");
  typeEl.textContent = typeInfo.type.name;
  typeEl.className = `pokemon-type type-${typeInfo.type.name}`;
  typeEl.style.backgroundImage = typeGradients[typeInfo.type.name] || "gray";
  typeEl.style.color = typeTextColors[typeInfo.type.name] || "black";
  return typeEl;
}

function createShinyCheckbox(pokemonData, imageEl) {
  const shinyCheckbox = document.createElement("input");
  shinyCheckbox.type = "checkbox";
  shinyCheckbox.className = "shiny-toggle";
  shinyCheckbox.id = `shiny-toggle-${pokemonData.id}`;

  const labelForShiny = document.createElement("label");
  labelForShiny.textContent = "Shiny";

  shinyCheckbox.addEventListener("change", () => {
    imageEl.src = shinyCheckbox.checked
      ? pokemonData.sprites.other["official-artwork"].front_shiny
      : pokemonData.sprites.other["official-artwork"].front_default;
  });

  return { checkbox: shinyCheckbox, label: labelForShiny };
}

async function searchPokemon() {
  errorMsgEl.textContent = "";
  const searchInput = searchBar.value.toLowerCase().trim();

  mainContainer.innerHTML = "";

  const searchUrl = `https://pokeapi.co/api/v2/pokemon/${searchInput}`;

  try {
    const pokemonData = await fetchData(searchUrl);
    const pokemonCard = createPokemonCard(pokemonData, true);
    mainContainer.appendChild(pokemonCard);
  } catch (error) {
    console.error("Pokemon not found", error);
    errorMsgEl.textContent = "Pokemon not found. Please try another name.";

    setTimeout(() => {
      errorMsgEl.textContent = "";
    }, 3000);
  }
}

function showPokemonDetailsInOverlay(pokemonData) {
  const overlayContent = document.querySelector(".overlay-content");
  overlayContent.innerHTML = "";

  const overlayLeft = document.createElement('div');
  overlayLeft.className = 'overlay-left';

  const nameEl = document.createElement('h2');
  nameEl.className = 'pokemon-name';
  nameEl.textContent = pokemonData.name;
  overlayLeft.appendChild(nameEl);

  const idEl = document.createElement('p');
  idEl.className = 'pokemon-id';
  idEl.textContent = `#${pokemonData.id}`;
  overlayLeft.appendChild(idEl);

  const imgEl = document.createElement('img');
  imgEl.className = 'pokemon-image';
  imgEl.src = pokemonData.sprites.other["official-artwork"].front_default;
  overlayLeft.appendChild(imgEl);


  overlayContent.appendChild(overlayLeft);

  document.getElementById("pokemonOverlay").style.display = "block";
  document.body.classList.add("active-overlay");
}

displayPokemonList();
