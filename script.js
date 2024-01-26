const typeGradients = {
  normal: "linear-gradient(#A8A77A, #B8B8A8)",
  fire: "linear-gradient(#EE8130, #FFA07A)",
  water: "linear-gradient(#6390F0, #7198F5)",
  electric: "linear-gradient(#F7D02C, #F7E07C)",
  grass: "linear-gradient(#7AC74C, #84D96C)",
  ice: "linear-gradient(#96D9D6, #A6E9E6)",
  fighting: "linear-gradient(#C22E28, #D24E3E)",
  poison: "linear-gradient(#A33EA1, #B35EB1)",
  ground: "linear-gradient( #E2BF65, #E2CF85)",
  flying: "linear-gradient(#3dc7ef 50%, #bdb9b8 50%)",
  psychic: "linear-gradient( #F95587, #FA75A3)",
  bug: "linear-gradient( #A6B91A, #B6C92A)",
  rock: "linear-gradient( #B6A136, #C6B146)",
  ghost: "linear-gradient( #735797, #8376A7)",
  dragon: "linear-gradient( #53a4cf, #f16e57)",
  dark: "linear-gradient(#705746, #806766)",
  steel: "linear-gradient( #B7B7CE, #C7C7DE)",
  fairy: "linear-gradient( #D685AD, #E695BD)",
};

const typeTextColors = {
  normal: "black",
  fire: "white",
  water: "white",
  electric: "black",
  grass: "black",
  ice: "black",
  fighting: "white",
  poison: "white",
  ground: "black",
  flying: "black",
  psychic: "white",
  bug: "black",
  rock: "black",
  ghost: "white",
  dragon: "white",
  dark: "white",
  steel: "black",
  fairy: "black",
};

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
    const pokemonExtraData = await fetchData(pokemon.url);
    // console.log(pokemonExtraData);

    const containerEl = document.createElement("div");
    containerEl.className = "pokemonContainer";

    const imageEl = document.createElement("img");
    imageEl.className = "pokeImage";
    imageEl.src =
      pokemonExtraData.sprites.other["official-artwork"].front_default;
    imageEl.alt = `Image of ${pokemon.name}`;

    const shinyCheckbox = document.createElement("input");
    shinyCheckbox.type = "checkbox";
    shinyCheckbox.className = "shiny-toggle";
    shinyCheckbox.id = `shiny-toggle-${pokemon.id}`;

    const labelForShiny = document.createElement("label");
    labelForShiny.textContent = "Shiny";

    shinyCheckbox.addEventListener("change", () => {
      if (shinyCheckbox.checked) {
        imageEl.src =
          pokemonExtraData.sprites.other["official-artwork"].front_shiny;
      } else {
        imageEl.src =
          pokemonExtraData.sprites.other["official-artwork"].front_default;
      }
    });

    const pokemonId = document.createElement("h3");
    pokemonId.textContent = `#${pokemonExtraData.id}`;

    const titleEl = document.createElement("h2");
    titleEl.textContent = pokemon.name;

    containerEl.append(
      imageEl,
      pokemonId,
      shinyCheckbox,
      labelForShiny,
      titleEl
    );
    mainContainer.append(containerEl);

    pokemonExtraData.types.forEach((typeInfo) => {
      const typeEl = document.createElement("span");
      typeEl.textContent = typeInfo.type.name;
      typeEl.className = `pokemon-type type-${typeInfo.type.name}`;
      typeEl.style.backgroundImage =
        typeGradients[typeInfo.type.name] || "gray";
      typeEl.style.color = typeTextColors[typeInfo.type.name] || "black";
      containerEl.append(typeEl);
    });
  }
}

async function searchPokemon() {
  errorMsgEl.textContent = "";
  const searchInput = searchBar.value.toLowerCase().trim();

  mainContainer.innerHTML = "";

  const searchUrl = `https://pokeapi.co/api/v2/pokemon/${searchInput}`;

  try {
    const pokemonData = await fetchData(searchUrl);
    if (pokemonData) {
      displayPokemon(pokemonData);
    }
  } catch (error) {
    console.error("Pokemon not found", error);
    errorMsgEl.textContent = "Pokemon not found. Please try another name.";

    setTimeout(() => {
      errorMsgEl.textContent = "";
    }, 3000);
  }
}

async function displayPokemon(pokemonData) {
  const searchContainerEl = document.createElement("div");
  searchContainerEl.className = "searchPokemonContainer";

  const imageEl = document.createElement("img");
  imageEl.src = pokemonData.sprites.other["official-artwork"].front_default;
  imageEl.alt = `Image of ${pokemonData.name}`;
  imageEl.className = "searchedPokeImage";

  const pokemonId = document.createElement("h3");
  pokemonId.textContent = `#${pokemonData.id}`;

  const titleEl = document.createElement("h2");
  titleEl.className = "pokemon-title";
  titleEl.textContent = pokemonData.name;

  const shinyCheckbox = document.createElement("input");
  shinyCheckbox.type = "checkbox";
  shinyCheckbox.className = "shiny-toggle";
  shinyCheckbox.id = `shiny-toggle-${pokemonData.id}`;

  const labelForShiny = document.createElement("label");
  labelForShiny.textContent = "Shiny";

  shinyCheckbox.addEventListener("change", () => {
    if (shinyCheckbox.checked) {
      imageEl.src =
        pokemonData.sprites.other["official-artwork"].front_shiny;
    } else {
      imageEl.src =
        pokemonData.sprites.other["official-artwork"].front_default;
    }
  });

  searchContainerEl.append(imageEl, pokemonId, shinyCheckbox, labelForShiny, titleEl);
  mainContainer.append(searchContainerEl);

  pokemonData.types.forEach((typeInfo) => {
    const typeEl = document.createElement("span");
    typeEl.textContent = typeInfo.type.name;
    typeEl.className = `pokemon-type type-${typeInfo.type.name}`;
    typeEl.style.backgroundImage = typeGradients[typeInfo.type.name] || "gray";
    typeEl.style.color = typeTextColors[typeInfo.type.name] || "black";
    searchContainerEl.append(typeEl);
  });
}

// document.addEventListener("DOMContentLoaded", () => {
//   fetchGenerations();

//   const dropdown = document.getElementById("generation-select");
//   dropdown.addEventListener("change", async (e) => {
//     console.log("Generation selected:", e.target.value);
//     const genUrl = e.target.value;
//     const genDetails = await fetchData(genUrl);
//     const pokedexUrl = genDetails.main_generation.url;
//     displayPokemonList(pokedexUrl);
//   });
// });

// async function fetchGenerations() {
//   const url = "https://pokeapi.co/api/v2/generation/";
//   const response = await fetch(url);
//   const data = await response.json();
//   generationDropdown(data.results);
// }

// function generationDropdown(generations) {
//   const dropdown = document.getElementById("generation-select");

//   generations.forEach((gen) => {
//     const option = document.createElement("option");
//     option.value = gen.url;
//     option.textContent = gen.name.toUpperCase();
//     dropdown.append(option);
//   });
// }

displayPokemonList();
