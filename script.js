import { typeGradients, typeTextColors } from "./styles.js";

const buttonHome = document.getElementById("btn-home");
const buttonPrev = document.getElementById("btn-prev");
const buttonNext = document.getElementById("btn-next");
const errorMsgEl = document.getElementById("error-msg");
const mainContainer = document.getElementById("main-container");
const searchBar = document.getElementById("pokemon-search");
const searchBtn = document.getElementById("search-btn");

const pokedexUrl = "https://pokeapi.co/api/v2/pokemon?offset=5&limit=8";

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

  imageEl.addEventListener("click", () => {
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
    }, 80000);
  }
}

async function showPokemonDetailsInOverlay(pokemonData) {
  // Selecting existing elements
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

  // Populate the container with type elements
  pokemonData.types.forEach((typeInfo) => {
    const typeEl = createTypeElement(typeInfo);
    typesContainer.appendChild(typeEl);
  });

  // Append the types container to an appropriate place in the overlay
  pokemonInfo.appendChild(typesContainer);

  // Updating main Pokémon info
  pokemonName.textContent = `${pokemonData.name}`;
  pokemonId.textContent = `#${pokemonData.id}`;
  // pokemonImage.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonData.id}.gif`;

  // Clear previous content in navigation containers
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
    let imgKey = "frontMale"; // Start with the default image
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
    // Fetch and display previous Pokémon
    try {
      const prevPokemonData = await fetchData(
        `https://pokeapi.co/api/v2/pokemon/${prevPokemonId}/`
      );
      displayPokemonPreview(prevPokemonData, prevPokemonContainer);
    } catch (error) {
      console.error("Error fetching previous Pokémon:", error);
    }
  }

  // Handling Next Pokémon
  const nextPokemonId = pokemonData.id + 1;
  try {
    const nextPokemonData = await fetchData(
      `https://pokeapi.co/api/v2/pokemon/${nextPokemonId}/`
    );
    displayPokemonPreview(nextPokemonData, nextPokemonContainer);
  } catch (error) {
    console.error("Error fetching next Pokémon:", error);
  }

  // Display the overlay
  document.getElementById("pokemonOverlay").style.display = "block";
  document.body.classList.add("active-overlay");
}

function displayPokemonPreview(pokemonData, container) {
  const imgEl = document.createElement("img");
  const idEl = document.createElement("h5");
  const textEl = document.createElement("h4");
  imgEl.className = "nav-pokemon-image";
  idEl.className = "nav-pokemon-id";
  textEl.className = "pokemon-text";
  imgEl.src = pokemonData.sprites.other["official-artwork"].front_default;
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
