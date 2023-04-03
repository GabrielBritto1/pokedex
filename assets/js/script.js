const pokeName = document.querySelector('.poke-name');
const pokeID = document.querySelector('.poke-number');
const pokeImage = document.querySelector('.poke-img');

const form = document.querySelector('.form');
const input = document.querySelector('.input-search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');

let searchPokemon = 1;

const fetchpokemon = async (pokemon) => {
    const APIresponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

    if (APIresponse.status === 200) {
        const data = await APIresponse.json();
        return data;
    }
}

const renderPokemon = async (pokemon) => {

    pokeName.innerHTML = 'Loading...';
    pokeID.innerHTML = '';

    const data = await fetchpokemon(pokemon);

    if (data) {
        pokeName.innerHTML = data.name;
        pokeID.innerHTML = data.id;
        pokeImage.src = data['sprites']['versions']['generation-v']['black-white']['animated']['front_default'];

        input.value = '';
        searchPokemon = data.id;
    }
    else {
        pokeImage.style.display = 'none';
        pokeID.innerHTML = '';
        pokeName.innerHTML = 'Pokemon not registered';
    }
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderPokemon(input.value.toLowerCase());
});

buttonPrev.addEventListener('click', () => {
    if (searchPokemon > 1) {
        searchPokemon -= 1;
    }
    renderPokemon(searchPokemon);
});

buttonNext.addEventListener('click', () => {
    searchPokemon += 1;
    renderPokemon(searchPokemon);
});

renderPokemon(searchPokemon);