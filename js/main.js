const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
const inputBusqueda = document.querySelector("#busqueda");

const URL = "https://pokeapi.co/api/v2/pokemon/";

let todosLosPokemon = [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
let filtroTipoActual = "ver-todos";

// Carga inicial y ordenamiento numérico
async function cargarPokemones() {
    listaPokemon.innerHTML = `<p class="no-resultados">Cargando Pokédex...</p>`;
    
    const promesas = [];
    for (let i = 1; i <= 151; i++) {
        promesas.push(fetch(URL + i).then(res => res.json()));
    }

    const pokemonesNoOrdenados = await Promise.all(promesas);
    todosLosPokemon = pokemonesNoOrdenados.sort((a, b) => a.id - b.id);
    
    aplicarFiltros();
}

cargarPokemones();

function mostrarLista(lista) {
    listaPokemon.innerHTML = "";

    if (lista.length === 0) {
        listaPokemon.innerHTML = `<p class="no-resultados">No se encontraron Pokémon.</p>`;
        return;
    }

    lista.sort((a, b) => a.id - b.id);
    lista.forEach(poke => mostrarPokemon(poke));
}

function mostrarPokemon(poke) {
    let tipos = poke.types.map((type) => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join('');
    let pokeId = poke.id.toString().padStart(3, "0");
    const esFavorito = favoritos.includes(poke.id);

    const div = document.createElement("div");
    div.classList.add("pokemon");
    div.innerHTML = `
        <button class="btn-fav" data-id="${poke.id}">
            ${esFavorito ? '❤️' : '🤍'}
        </button>
        <p class="pokemon-id-back">#${pokeId}</p>
        <div class="pokemon-imagen">
            <img src="${poke.sprites.other['official-artwork'].front_default}" alt="${poke.name}">
        </div>
        <div class="pokemon-info">
            <div class="nombre-contenedor">
                <span class="pokemon-id">#${pokeId}</span>
                <h2 class="pokemon-nombre">${poke.name}</h2>
            </div>
            <div class="pokemon-tipos">
                ${tipos}
            </div>
            <div class="pokemon-stats">
                <p class="stat">${poke.height / 10}M</p>
                <p class="stat">${poke.weight / 10}KG</p>
            </div>
        </div>
    `;

    const btnFav = div.querySelector(".btn-fav");
    btnFav.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorito(poke.id);
    });

    listaPokemon.append(div);
}

function toggleFavorito(id) {
    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(favId => favId !== id);
    } else {
        favoritos.push(id);
    }
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    aplicarFiltros();
}

function aplicarFiltros() {
    const texto = inputBusqueda.value.toLowerCase().trim();

    let resultado = todosLosPokemon.filter(poke => {
        const coincideNombre = poke.name.toLowerCase().includes(texto);
        const coincideId = poke.id.toString() === texto || poke.id.toString().padStart(3, "0") === texto;
        return coincideNombre || coincideId;
    });

    if (filtroTipoActual === "favoritos") {
        resultado = resultado.filter(poke => favoritos.includes(poke.id));
    } else if (filtroTipoActual !== "ver-todos") {
        resultado = resultado.filter(poke => 
            poke.types.some(t => t.type.name === filtroTipoActual)
        );
    }

    mostrarLista(resultado);
}

inputBusqueda.addEventListener("input", aplicarFiltros);

botonesHeader.forEach(boton => {
    boton.addEventListener("click", (e) => {
        filtroTipoActual = e.currentTarget.id;
        aplicarFiltros();
    });
});

// Desplazamiento suave al inicio al presionar la flecha
const btnVolverArriba = document.querySelector("#btn-volver-arriba");
if (btnVolverArriba) {
    btnVolverArriba.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}