const typeGradients = {
    normal: 'linear-gradient(180deg, #A8A77A 50%, #B8B8A8 50%)',
    fire: 'linear-gradient(180deg, #EE8130 50%, #FFA07A 50%)',
    water: 'linear-gradient(180deg, #6390F0 50%, #7198F5 50%)',
    electric: 'linear-gradient(180deg, #F7D02C 50%, #F7E07C 50%)',
    grass: 'linear-gradient(180deg, #7AC74C 50%, #84D96C 50%)',
    ice: 'linear-gradient(180deg, #96D9D6 50%, #A6E9E6 50%)',
    fighting: 'linear-gradient(180deg, #C22E28 50%, #D24E3E 50%)',
    poison: 'linear-gradient(180deg, #A33EA1 50%, #B35EB1 50%)',
    ground: 'linear-gradient(180deg, #E2BF65 50%, #E2CF85 50%)',
    flying: 'linear-gradient(180deg, #3dc7ef 50%, #bdb9b8 50%)',
    psychic: 'linear-gradient(180deg, #F95587 50%, #FA75A3 50%)',
    bug: 'linear-gradient(180deg, #A6B91A 50%, #B6C92A 50%)',
    rock: 'linear-gradient(180deg, #B6A136 50%, #C6B146 50%)',
    ghost: 'linear-gradient(180deg, #735797 50%, #8376A7 50%)',
    dragon: 'linear-gradient(180deg, #53a4cf 50%, #f16e57 50%)',
    dark: 'linear-gradient(180deg, #705746 50%, #806766 50%)',
    steel: 'linear-gradient(180deg, #B7B7CE 50%, #C7C7DE 50%)',
    fairy: 'linear-gradient(180deg, #D685AD 50%, #E695BD 50%)'
  };
  
  const typeTextColors = {
    normal: 'black',
    fire: 'white',
    water: 'white',
    electric: 'black',
    grass: 'black',
    ice: 'black',
    fighting: 'white',
    poison: 'white',
    ground: 'black',
    flying: 'black',
    psychic: 'white',
    bug: 'black',
    rock: 'black',
    ghost: 'white',
    dragon: 'white',
    dark: 'white',
    steel: 'black',
    fairy: 'black'
  };
  
const buttonHome = document.getElementById("btn-home");
const buttonPrev = document.getElementById("btn-prev");
const buttonNext = document.getElementById("btn-next");
const errorMsgEl = document.getElementById("error-msg");
const mainContainer = document.getElementById("main-container");
const searchBar = document.getElementById("pokemon-search")
const searchBtn = document.getElementById("search-btn")

const pokedexUrl = "https://pokeapi.co/api/v2/pokemon?offset=0&limit=20";

let pokemonList = [];


searchBtn.addEventListener('click', searchPokemon);

searchBar.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
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
    console.log(pokemonExtraData);

    const containerEl = document.createElement("div");
    containerEl.className = "pokemonContainer";

    const imageEl = document.createElement("img");
    imageEl.src =
      pokemonExtraData.sprites.other["official-artwork"].front_default;
    imageEl.alt = `Image of ${pokemon.name}`;

    const pokemonId = document.createElement("h3");
    pokemonId.textContent = `#${pokemonExtraData.id}`;

    const titleEl = document.createElement("h2");
    titleEl.textContent = pokemon.name;

    containerEl.append(imageEl, pokemonId, titleEl);
    mainContainer.append(containerEl);

    pokemonExtraData.types.forEach((typeInfo) => {
      const typeEl = document.createElement("span");
      typeEl.textContent = typeInfo.type.name;
      typeEl.className = `pokemon-type type-${typeInfo.type.name}`;
      typeEl.style.backgroundImage = typeGradients[typeInfo.type.name] || "gray";
      typeEl.style.color = typeTextColors[typeInfo.type.name] || 'black';
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
            displayPokemon(pokemonData)
        }
    } catch (error) {
        console.error("Pokemon not found", error);
        errorMsgEl.textContent = "Pokemon not found. Please try another name."

        setTimeout(() => {
            errorMsgEl.textContent = "";
        }, 3000)
    }
    console.log(searchInput)
}



async function displayPokemon(pokemonData) {
    const containerEl = document.createElement("div");

    const imageEl = document.createElement("img");
    imageEl.src =
      pokemonData.sprites.other["official-artwork"].front_default;
    imageEl.alt = `Image of ${pokemonData.name}`;

    const pokemonId = document.createElement("h3");
    pokemonId.textContent = `#${pokemonData.id}`;

    const titleEl = document.createElement("h2");
    titleEl.textContent = pokemonData.name;

    containerEl.append(imageEl, pokemonId, titleEl);
    mainContainer.append(containerEl);

    pokemonData.types.forEach((typeInfo) => {
      const typeEl = document.createElement("span");
      typeEl.textContent = typeInfo.type.name;
      typeEl.className = `pokemon-type type-${typeInfo.type.name}`;
      typeEl.style.backgroundImage = typeGradients[typeInfo.type.name] || "gray";
      typeEl.style.color = typeTextColors[typeInfo.type.name] || 'black';
      containerEl.append(typeEl);
});

    mainContainer.append(containerEl);
}





displayPokemonList();
