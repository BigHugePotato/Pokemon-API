const typeGradients = {
  normal: "linear-gradient(blue, white)",
  fire: "red",
  water: "blue",
  electric: "linear-gradient(180deg, #F7D02C 50%, #F7D02C 50%)",
  grass: "linear-gradient(180deg, #7AC74C 50%, #7AC74C 50%)",
  ice: "linear-gradient(180deg, #96D9D6 50%, #96D9D6 50%)",
  fighting: "linear-gradient(180deg, #C22E28 50%, #C22E28 50%)",
  poison: "linear-gradient(180deg, #A33EA1 50%, #A33EA1 50%)",
  ground: "linear-gradient(180deg, #E2BF65 50%, #E2BF65 50%)",
  flying: "linear-gradient(180deg, #A98FF3 50%, #A98FF3 50%)",
  psychic: "linear-gradient(180deg, #F95587 50%, #F95587 50%)",
  bug: "linear-gradient(180deg, #A6B91A 50%, #A6B91A 50%)",
  rock: "linear-gradient(180deg, #B6A136 50%, #B6A136 50%)",
  ghost: "linear-gradient(180deg, #735797 50%, #735797 50%)",
  dragon: "linear-gradient(180deg, #6F35FC 50%, #6F35FC 50%)",
  dark: "linear-gradient(180deg, #705746 50%, #705746 50%)",
  steel: "linear-gradient(180deg, #B7B7CE 50%, #B7B7CE 50%)",
  fairy: "linear-gradient(180deg, #D685AD 50%, #D685AD 50%)",
};

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
      typeEl.style.backgroundColor = typeGradients[typeInfo.type.name] || "gray";
      containerEl.append(typeEl);
    });
  }
}

buttonHome.addEventListener("click", () => {
  displayPokemonList();
});

buttonNext.addEventListener("click", () => {
  if (pokemonList.next) displayPokemonList(pokemonList.next);
  else displayPokemonList();
});

buttonPrev.addEventListener("click", () => {
  if (pokemonList.previous) displayPokemonList(pokemonList.previous);
  else
    displayPokemonList(
      `https://pokeapi.co/api/v2/pokemon?offset=${pokemonList.lastPage}&limit=20`
    );
});

displayPokemonList();
