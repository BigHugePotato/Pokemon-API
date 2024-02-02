import { typeGradients, typeTextColors } from "./styles.js";

const buttonHome = document.getElementById("btn-home");
const buttonPrev = document.getElementById("btn-prev");
const buttonNext = document.getElementById("btn-next");
const errorMsgEl = document.getElementById("error-msg");
const mainContainer = document.getElementById("main-container");
const searchBar = document.getElementById("pokemon-search");
const searchBtn = document.getElementById("search-btn");

const pokedexUrl = "https://pokeapi.co/api/v2/pokemon?offset=0&limit=18";

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

  overlayContent.addEventListener("click", (event) => event.stopPropagation());

  overlay.addEventListener("click", () => {
    overlay.style.display = "none";
    document.body.classList.remove("active-overlay");
  });
});

/**
 *
 * @param {string} url - The URL to fetch Pokémon data from.
 * @returns {Promise<object>} The parsed JSON data from the response.
 *
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
 * @param {string} url - The URL to fetch the list of Pokémon from.
 *
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

/**
 *
 * @param {string} url - The URL to fetch the list of Pokémon from.
 */
async function displayPokemonList(url = pokedexUrl) {
  await updatePokemonList(url);
  mainContainer.innerHTML = "";
  for (const pokemon of pokemonList) {
    const pokemonData = await fetchData(pokemon.url);
    const pokemonCard = createPokemonCard(pokemonData);
    mainContainer.appendChild(pokemonCard);
  }
}

/**
 * Creates a card element for a Pokémon with image, ID, name, and types.
 *
 * @param {object} pokemonData - The data object for a single Pokémon.
 *
 * @param {boolean} isSearchResult - Indicates if the card is a result of a search.
 *
 * @returns {HTMLElement} The Pokémon card element.
 */
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

  imageEl.addEventListener("click", () => {
    showPokemonDetailsInOverlay(pokemonData);
  });

  return containerEl;
}

/**
 * Creates a span element representing a Pokémon's type with styling based on type.
 *
 * @param {object} typeInfo - The type information for a Pokémon.
 *
 * @returns {HTMLElement} The span element styled according to Pokémon type.
 */
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

/**
 * Searches for a Pokémon based on user input in the search bar and displays the result.
 */
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

/**
 * Displays detailed information about a Pokémon in an overlay.
 * @param {object} pokemonData - The data object for a single Pokémon.
 */
async function showPokemonDetailsInOverlay(pokemonData) {
  const pokemonInfo = document.querySelector(".pokemon-info");
  const pokemonName = document.getElementById("pokemonName");
  const pokemonId = document.getElementById("pokemonId");
  const pokemonImage = document.getElementById("pokemonImage");
  const pokeStats = document.querySelector(".stat-box");
  const pokeHeightWeight = document.querySelector(".height-weight-box");
  const pokeAbilities = document.querySelector(".abilities-box");
  const prevPokemonContainer = document.getElementById("prevPokemonContainer");
  const nextPokemonContainer = document.getElementById("nextPokemonContainer");

  const existingTypesContainer = pokemonInfo.querySelector(
    ".pokemon-types-container"
  );
  if (existingTypesContainer) {
    pokemonInfo.removeChild(existingTypesContainer);
  }

  const typesContainer = document.createElement("div");
  typesContainer.className = "pokemon-types-container";

  pokemonData.types.forEach((typeInfo) => {
    const typeEl = createTypeElement(typeInfo);
    typesContainer.appendChild(typeEl);
  });

  pokemonInfo.appendChild(typesContainer);

  pokemonName.textContent = `${pokemonData.name}`;
  pokemonId.textContent = `#${pokemonData.id}`;

  prevPokemonContainer.innerHTML = "";
  nextPokemonContainer.innerHTML = "";
  pokeStats.innerHTML = "";
  pokeHeightWeight.innerHTML = "";
  pokeAbilities.innerHTML = "";

  pokemonData.stats.forEach((stat) => {
    const statEl = document.createElement("p");
    statEl.textContent = `${stat.stat.name}: ${stat.base_stat}`;
    pokeStats.appendChild(statEl);
  });

  const heightEl = document.createElement("p");
  heightEl.textContent = `Height: ${pokemonData.height * 10}cm`;
  pokeHeightWeight.appendChild(heightEl);

  const weightEl = document.createElement("p");
  weightEl.textContent = `Weight: ${pokemonData.weight / 10}kg`;
  pokeHeightWeight.appendChild(weightEl);

  pokemonData.abilities.forEach((ability) => {
    const abilityEl = document.createElement("p");
    abilityEl.textContent = `${ability.ability.name}`;
    pokeAbilities.appendChild(abilityEl);
  });

  let isShiny = true;
  let isFront = true;

  const images = {
    frontMale: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonData.id}.gif`,
    frontShiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${pokemonData.id}.gif`,
    backMale: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${pokemonData.id}.gif`,
    backShiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/shiny/${pokemonData.id}.gif`,
  };

  function updateImg() {
    if (pokemonData.id > 649) {
      pokemonImage.src =
        pokemonData.sprites.other["official-artwork"].front_default;
      return;
    }
    let imgKey = "frontMale";
    if (!isShiny && isFront) {
      imgKey = "frontShiny";
    } else if (isShiny && !isFront) {
      imgKey = "backMale";
    } else if (!isShiny && !isFront) {
      imgKey = "backShiny";
    }

    pokemonImage.src = images[imgKey];
  }
  updateImg();

  const shinyBtn = document.querySelector(".toggle-shiny");
  const switchBtn = document.querySelector(".toggle-image");

  function toggleGender() {
    isShiny = !isShiny;
    updateImg();
  }

  function toggleImageSwitch() {
    isFront = !isFront;
    updateImg();
  }

  shinyBtn.addEventListener("click", toggleGender);
  switchBtn.addEventListener("click", toggleImageSwitch);

  const prevPokemonId = pokemonData.id - 1;
  if (prevPokemonId > 0) {
    try {
      const prevPokemonData = await fetchData(
        `https://pokeapi.co/api/v2/pokemon/${prevPokemonId}/`
      );
      displayPokemonPreview(prevPokemonData, prevPokemonContainer);
    } catch (error) {
      console.error("Error fetching previous Pokémon:", error);
    }
  }

  const nextPokemonId = pokemonData.id + 1;
  try {
    const nextPokemonData = await fetchData(
      `https://pokeapi.co/api/v2/pokemon/${nextPokemonId}/`
    );
    displayPokemonPreview(nextPokemonData, nextPokemonContainer);
  } catch (error) {
    console.error("Error fetching next Pokémon:", error);
  }

  document.getElementById("pokemonOverlay").style.display = "block";
  document.body.classList.add("active-overlay");
}

/**
 * Displays a preview for a Pokémon in a given container.
 *
 * @param {object} pokemonData - The data object for a single Pokémon.
 *
 * @param {HTMLElement} container - The container element to display the Pokémon preview in.
 */
function displayPokemonPreview(pokemonData, container) {
  const imgEl = document.createElement("img");
  const idEl = document.createElement("h5");
  const textEl = document.createElement("h4");

  imgEl.className = "nav-pokemon-image";
  idEl.className = "nav-pokemon-id";
  textEl.className = "pokemon-text";
  
  imgEl.src = pokemonData.sprites.other["official-artwork"].front_default;
  imgEl.alt = `Preview of ${pokemonData.name}`;
  idEl.textContent = `#${pokemonData.id}`;
  textEl.textContent = pokemonData.name;

  imgEl.addEventListener("click", async () => {
    try {
      const fullPokemonData = await fetchData(
        `https://pokeapi.co/api/v2/pokemon/${pokemonData.id}/`
      );
      showPokemonDetailsInOverlay(fullPokemonData);
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
    }
  });

  container.appendChild(imgEl);
  container.appendChild(idEl);
  container.appendChild(textEl);
}

displayPokemonList();
