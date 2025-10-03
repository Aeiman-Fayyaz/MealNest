// Navbar Toggle
document.getElementById("hamburger").onclick = function toggleMenu() {
  const navToggle = document.getElementsByClassName("toggle");
  for (let i = 0; i < navToggle.length; i++) {
    navToggle.item(i).classList.toggle("hidden");
  }
};

// Getting elements
const recipieInput = document.getElementById("recipieInput");
const recipieBtn = document.getElementById("recipieBtn");
const recipieCard = document.getElementById("recipieCard");

// Edamam API key

const appId = "ac857b9d";
const appKey = "260a2a098c06489f7a3ab82afbdd2a6d";
const baseUrl = "https://api.edamam.com/api/recipes/v2";

function saveLastRecipes(recipes) {
  try {
    localStorage.setItem("lastSearchedRecipes", JSON.stringify(recipes));
  } catch (error) {
    console.error("Error saving to local storage:", error);
  }
}

// Base URL and credentials are assumed to be defined outside this function (e.g., const baseUrl = "...")

async function fetchRecipies(ingredients) {
  const encodedIngredients = encodeURIComponent(ingredients);
  try {
    recipieCard.innerHTML = `<p class="col-span-full text-center py-10 text-lg text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Fetching recipes...</p>`;
    const response = await fetch(
      `${baseUrl}?type=public&q=${encodedIngredients}&app_id=${appId}&app_key=${appKey}`
    );
    console.log(response);
    // Convert response into JSON
    const recipies = await response.json();
    // Data Mapping
    const recipesToDisplay = recipies.hits.map((hit) => ({
      id: hit.recipe.uri.split("_").pop(),
      title: hit.recipe.label,
      image: hit.recipe.image,
      usedIngredients: hit.recipe.ingredients.map((ing) => ({
        name: ing.food,
        amount: ing.quantity,
        unit: ing.measure,
      })),
      url: hit.recipe.url,
    }));
    // Local Storage function
    saveLastRecipes(recipesToDisplay);
    // Display function
    displayRecipieCard(recipesToDisplay);
    console.log(recipies);
  } catch (error) {
    console.log("Error Fetching recipies:", error);
    recipieCard.innerHTML = `<p>Failed to fetch data</p>`;
  }
}

// Function on button search input

recipieBtn.addEventListener("click", () => {
  const ingredients = recipieInput.value.trim();
  if (ingredients) {
    fetchRecipies(ingredients);
  } else {
    alert("Please enter Ingredients");
  }
});

// Function Display Recipie Card
function displayRecipieCard(recipiesToDisplay) {
  recipieCard.className =
    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full";
  recipieCard.innerHTML = ``;
  if (recipiesToDisplay.length === 0) {
    recipieCard.innerHTML = `
            <div class="col-span-full text-center py-10">
                <i class="fas fa-search text-5xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-medium text-gray-600">No recipes found</h3>
                <p class="text-gray-500 mt-2">Try adjusting your search terms</p>
            </div>
        `;
    return;
  }
  recipiesToDisplay.forEach((recipie) => {
    let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
    const isFavourite = favourites.includes(recipie.id);

    const recipieCardElement = document.createElement("div");
    recipieCardElement.className = `bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col`;
    recipieCardElement.innerHTML = `
    <div class="relative">
        <img src="${recipie.image}" alt="${recipie.title}">
        <button onclick="toggleFavourite(event)" class="favourite-btn absolute top-3 right-3 bg-white p-2 rounded-full shadow-md
                hover:scale-110 transition-transform duration-200  
                ${isFavourite ? " text-red-600" : "text-gray-400" }" data-id="${
      recipie.id
    }">
            <i class="fas fa-heart ${
                  isFavourite ? " text-red-5600" : "text-gray-400" }"></i></button>
    </div>
    <div class="p-5 flex flex-col">
        <h3 class="text-xl font-bold text-gray-800 mb-3">${recipie.title}</h3>
        <div class="mb-4 ">
            <h4 class="font-medium text-gray-700 mb-2">Ingredients:</h4>
            <div>
                ${recipie.usedIngredients
                .map(
                (ing) => `
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">${ing.name}</span>
                    <span class="text-gray-800 font-medium">${ing.amount} ${ing.unit}</span>
                </div>`
                )
                .join("")}
            </div>
        </div>
        <div class="flex justify-between items-center pt-3 border-t border-gray-100">
            
                <button
                    class="view-recipie-btn px-4 py-2 bg-recipe-green text-white rounded-lg hover:bg-green-700 transition-colors duration-300 text-sm font-medium">
                    View Recipe
                </button>
                <button
                    class="grocery-list-btn px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 text-sm font-medium">
                    Grocery List
                </button>
            
            <span class="text-xs text-gray-500">ID: ${recipie.id}</span>
        </div>
    </div>
    
        `;
    recipieCard.appendChild(recipieCardElement);
  });
}

// Function initialize Recipie display
function initializeRecipieDisplay() {
  let lastRecipies;
  if (lastRecipies && lastRecipies.length > 0) {
    displayRecipieCard();
  } else {
    const defaultIngredients = "Chicken , Tomato";
    fetchRecipies(defaultIngredients);
  }
}
document.addEventListener("DOMContentLoaded", initializeRecipieDisplay);
//   // Favourite button add EventListener
document.querySelectorAll(".favourite-btn").forEach((btn) => {
  btn.addEventListener("click", toggleFavourite());
});
//   // For View Recipie Button
document.querySelectorAll(".view-recipie-btn").forEach((btn, index) => {
  btn.addEventListener("click", () => viewRecipie(recipiesToDisplay[index]));
});
// Function for save to favourite
function toggleFavourite(event) {
  const recipieId = parseInt(event.currentTarget.getAttribute("data-id"));
  const heartIcon = event.currentTarget.querySelector("i");
  let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
  if (favourites.includes(recipieId)) {
    // Remove from favourites if again click on heart icon
    favourites = favourites.filter((id) => id !== recipieId);
    heartIcon.classList.remove("text-red-500");
    heartIcon.classList.add("text-gray-400");
    event.currentTarget.classList.remove("active");
    console.log(`Removed ${recipieId} from fav`);
  } else {
    // Add to Favourite
    favourites.push(recipieId);
    heartIcon.classList.remove("text-gray-400");
    heartIcon.classList.add("text-red-500");
    event.currentTarget.classList.add("active");
    console.log(`Add ${recipieId} from fav`);
  }
  // Save to local Storage
  localStorage.setItem("favourites", JSON.stringify(favourites));
}

// Function for displaying favourite recipies
function displayFavouriteRecipies() {
  // Getting Id of favourite
  const fullRecipieData = JSON.parse(localStorage.getItem("favourites")) || [];
  // Create new div for save recipies
  const container = document.createElement("div");
  container.className =
    "container mx-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
  // Getting div from HTML
  const recipeResultsFav = document.getElementById("recipeResultsFav");
  // Condition
  if (!fullRecipieData.length === 0) {
    recipeResultsFav.innerHTML =
      '<p class="text-center text-xl text-gray-500 py-10">You have no favourite recipes yet. Go to Home to add some!</p>';
    return;
  }
  // Fetching data
  fullRecipieData.forEach((recipieId) => {
    const encodedIngredients = encodeURIComponent();
    `${baseUrl}?type=public&q=${encodedIngredients}&app_id=${appId}&app_key=${appKey}`;
    // Fetching required data
    const title = fullRecipieData.label;
    const image = fullRecipieData.image;
    const ingredients = fullRecipieData.ingredientLines;
    const favRecipieCard = document.createElement("div");
    favRecipieCard.className = "bg-white p-4 shadow-lg rounded-lg relative";
    favRecipieCard.innerHTML = `
    <div class = "h-20 w-20">
    <img src = "${image}" alt = "${title}">
    </div>
    <div class="p-4">
    <h2 class="text-xl font-bold mb-2">${title}</h2>
    <p class="text-gray-600 mb-4">
      <strong>Ingredients:</strong><br>${ingredients}
    </p>
    <a href="${fullRecipieData.url}" target="_blank" class="text-teal-500 hover:text-teal-700 font-semibold">View Full Recipe</a>
    </div>
    <button onclick="toggleFavourite(event)" data-id="${recipieId}" class="favourite-btn absolute top-3 right-3 bg-white p-2 rounded-full shadow-md active">
                    <i class="fas fa-heart text-red-500"></i>
                </button>
    `;
    container.appendChild(favRecipieCard);
  });
  recipeResultsFav.innerHTML = "";
  recipeResultsFav.appendChild(container);
}
document.addEventListener("DOMContentLoaded", displayFavouriteRecipies);
