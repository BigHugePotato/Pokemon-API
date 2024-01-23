// get the html elements:
const buttonHome = document.getElementById("btn-home");
const buttonPrev = document.getElementById("btn-prev");
const buttonNext = document.getElementById("btn-next");
const errorMsgEl = document.getElementById("error-msg");
const mainContainer = document.getElementById("main-container");

const pokedexUrl = "https://pokeapi.co/api/v2/pokemon?offset=0&limit=20";

let pokemonList = [];

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
  }
}

/**
 *
 * @param {*} url
 * Waits for data from the API via fetchData.
 *
 * If success, stores the data in the data const
 */
async function updatePokemonList(url) {
  const data = await fetchData(url);
  if (data && data.results) {
    pokemonList = data.results;
  }
}

async function displayPokemonList() {
  await updatePokemonList(pokedexUrl);

  mainContainer.innerHTML = "";

  for (const pokemon of pokemonList) {

    const pokemonExtraData = await fetchData(pokemon.url);
    console.log(pokemonExtraData);

    const containerEl = document.createElement("div");
    const titleEl = document.createElement("h2");
    titleEl.textContent = pokemon.name;
    const imageEl = document.createElement("img");

    imageEl.src = pokemonExtraData.sprites.other["official-artwork"].front_default
    imageEl.alt = `Image of ${pokemon.name}`;

    containerEl.append(titleEl, imageEl)
    mainContainer.append(containerEl)
  };
}

buttonHome.addEventListener("click", () => {
    displayPokemonList()
  })
  
  buttonNext.addEventListener("click", () => {
    
    if (pokemonList.next) displayPokemonList(pokemonList.next)
    else displayPokemonList()
  })
  
  buttonPrev.addEventListener("click", () => {
  
    if (pokemonList.previous) displayPokemonList(pokemonList.previous)
    else displayPokemonList(`https://pokeapi.co/api/v2/pokemon?offset=${pokemonList.lastPage}&limit=20`)
  })

displayPokemonList();


