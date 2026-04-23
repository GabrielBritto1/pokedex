const pokeName = document.querySelector('.poke-name');
const pokeID = document.querySelector('.poke-number');
const pokeTypes = document.querySelector('.poke-types');
const pokeHeight = document.querySelector('.poke-height');
const pokeWeight = document.querySelector('.poke-weight');
const pokeImage = document.querySelector('.poke-img');
const pokeWeaknesses = document.querySelector('.poke-weaknesses');
const pokeStats = document.querySelector('.poke-stats');
const pokeAbilities = document.querySelector('.poke-abilities');

const form = document.querySelector('.form');
const input = document.querySelector('.input-search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');
const blueTabs = document.querySelectorAll('.blue-tab');
const bluePanels = document.querySelectorAll('.blue-tab-panel');

let searchPokemon = 1;
let currentPokemonRequest = 0;
const typeCache = {};

const fetchpokemon = async (pokemon) => {
   const APIresponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);

   if (APIresponse.status === 200) {
      const data = await APIresponse.json();
      return data;
   }
}

const formatTypeName = (name) => name.charAt(0).toUpperCase() + name.slice(1);

const renderTypeIcon = (name) => {
   const formattedName = formatTypeName(name);

   return `
      <span class="type-chip">
         <img
            src="./assets/img/pokemon-types-card/${formattedName}.svg"
            alt="${name}"
            class="type-icon"
         >
      </span>
   `;
};

const renderTypes = (types) => {
   return types.map((type) => {
      const nome = type.type.name;
      return `
         ${renderTypeIcon(nome)}
      `;
   }).join('');
};

const fetchType = async (type) => {
   if (typeCache[type.name]) {
      return typeCache[type.name];
   }

   const APIresponse = await fetch(type.url);
   if (!APIresponse.ok) {
      throw new Error('Could not fetch type data');
   }

   const data = await APIresponse.json();
   typeCache[type.name] = data;
   return data;
};

const calculateWeaknesses = async (types) => {
   const multipliers = {};
   const typeData = await Promise.all(types.map(({ type }) => fetchType(type)));

   typeData.forEach(({ damage_relations }) => {
      damage_relations.double_damage_from.forEach(({ name }) => {
         multipliers[name] = (multipliers[name] || 1) * 2;
      });

      damage_relations.half_damage_from.forEach(({ name }) => {
         multipliers[name] = (multipliers[name] || 1) * 0.5;
      });

      damage_relations.no_damage_from.forEach(({ name }) => {
         multipliers[name] = 0;
      });
   });

   return Object.entries(multipliers)
      .filter(([, multiplier]) => multiplier > 1)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, multiplier]) => ({ name, multiplier }));
};

const renderWeaknesses = (weaknesses) => {
   if (!weaknesses.length) {
      return '<span class="screen-empty">Sem fraquezas</span>';
   }

   return weaknesses
      .map(({ name, multiplier }) => renderTypeIcon(name, multiplier))
      .join('');
};

const statLabels = {
   hp: 'HP',
   attack: 'ATK',
   defense: 'DEF',
   'special-attack': 'SP.ATK',
   'special-defense': 'SP.DEF',
   speed: 'SPD',
};

const renderStats = (stats) => {
   return stats.map(({ base_stat, stat }) => {
      const label = statLabels[stat.name] || stat.name;
      const percent = Math.min((base_stat / 180) * 100, 100);

      return `
         <div class="stat-row">
            <span class="stat-name">${label}</span>
            <div class="stat-bar" aria-label="${label}: ${base_stat}">
               <span style="width: ${percent}%"></span>
            </div>
            <span class="stat-value">${base_stat}</span>
         </div>
      `;
   }).join('');
};

const formatAbilityName = (name) => {
   return name
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
};

const renderAbilities = (abilities) => {
   if (!abilities.length) {
      return '<span class="screen-empty">Sem habilidades</span>';
   }

   return abilities.map(({ ability, is_hidden }) => {
      return `
         <div class="ability-item">
            <span>${formatAbilityName(ability.name)}</span>
            ${is_hidden ? '<small>Hidden</small>' : ''}
         </div>
      `;
   }).join('');
};

const renderPokemon = async (pokemon) => {
   const requestId = ++currentPokemonRequest;

   pokeName.innerHTML = 'Loading...';
   pokeID.innerHTML = '';
   pokeWeaknesses.innerHTML = '<span class="screen-empty">Loading...</span>';
   pokeStats.innerHTML = '<span class="screen-empty">Loading...</span>';
   pokeAbilities.innerHTML = '<span class="screen-empty">Loading...</span>';

   let data;

   try {
      data = await fetchpokemon(pokemon);
   }
   catch (error) {
      data = null;
   }

   if (requestId !== currentPokemonRequest) {
      return;
   }

   if (data) {
      pokeName.innerHTML = data.name;
      pokeID.innerHTML = data.id;
      pokeTypes.innerHTML = renderTypes(data.types);
      pokeHeight.innerHTML = `${data.height / 10} m`;
      pokeWeight.innerHTML = `${data.weight / 10} kg`;
      pokeStats.innerHTML = renderStats(data.stats);
      pokeAbilities.innerHTML = renderAbilities(data.abilities);
      // pokeImage.src = data['sprites']['versions']['generation-v']['black-white']['animated']['front_default'];
      pokeImage.src = data['sprites']['other']['showdown']['front_default'];
      // pokeImage.src = data['sprites']['other']['dream_world']['front_default'];
      // pokeImage.src = data['sprites']['front_default'];
      pokeImage.style.display = 'block';

      input.value = '';
      searchPokemon = data.id;

      try {
         const weaknesses = await calculateWeaknesses(data.types);

         if (requestId === currentPokemonRequest) {
            pokeWeaknesses.innerHTML = renderWeaknesses(weaknesses);
         }
      }
      catch (error) {
         if (requestId === currentPokemonRequest) {
            pokeWeaknesses.innerHTML = '<span class="screen-empty">Fraquezas indisponíveis</span>';
         }
      }
   }
   else {
      pokeImage.style.display = 'none';
      pokeID.innerHTML = '';
      pokeTypes.innerHTML = '';
      pokeName.innerHTML = 'Pokemon not registered';
      pokeWeaknesses.innerHTML = '<span class="screen-empty">Pokemon not registered</span>';
      pokeStats.innerHTML = '<span class="screen-empty">Pokemon not registered</span>';
      pokeAbilities.innerHTML = '<span class="screen-empty">Pokemon not registered</span>';
   }
}

blueTabs.forEach((tab) => {
   tab.addEventListener('click', () => {
      const selectedTab = tab.dataset.tab;

      blueTabs.forEach((button) => {
         button.classList.toggle('is-active', button.dataset.tab === selectedTab);
      });

      bluePanels.forEach((panel) => {
         panel.classList.toggle('is-active', panel.dataset.panel === selectedTab);
      });
   });
});

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
