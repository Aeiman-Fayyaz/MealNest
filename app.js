//  Navbar Toggle
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

// Edamam API credentials
const appId = "ac857b9d";
const appKey = "260a2a098c06489f7a3ab82afbdd2a6d";
const baseUrl = "https://api.edamam.com/api/recipes/v2";

// Save recipes to localStorage
function saveLastRecipes(recipes) {
  localStorage.setItem("lastSearchedRecipes", JSON.stringify(recipes));
}

// Fetch recipes
async function fetchRecipies(ingredients) {
  const encodedIngredients = encodeURIComponent(ingredients);
  try {
    recipieCard.innerHTML = `<p class="col-span-full text-center py-10 text-lg text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Fetching recipes...</p>;`;
    const response = await fetch(
      `${baseUrl}?type=public&q=${encodedIngredients}&app_id=${appId}&app_key=${appKey}`
    );
    const recipies = await response.json();
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

    saveLastRecipes(recipesToDisplay);
    displayRecipieCard(recipesToDisplay);
  } catch (error) {
    recipieCard.innerHTML = `<p>Failed to fetch data</p>`;
  }
}

// Search button
recipieBtn?.addEventListener("click", () => {
  const ingredients = recipieInput.value.trim();
  if (ingredients) {
    fetchRecipies(ingredients);
  } else {
    Swal.fire({
      icon: "warning",
      title: "Oops!",
      text: "Please enter some ingredients!",
    });
  }
});

// Display recipe cards
function displayRecipieCard(recipesToDisplay) {
  recipieCard.innerHTML = "";

  if (recipesToDisplay.length === 0) {
    recipieCard.innerHTML = `
      <div class="col-span-full text-center py-10">
        <i class="fas fa-search text-5xl text-gray-400 mb-4"></i>
        <h3 class="text-xl font-medium text-gray-600">No recipes found</h3>
        <p class="text-gray-500 mt-2">Try adjusting your search terms</p>
      </div>`;
    return;
  }

  recipesToDisplay.forEach((recipe , index) => {
    let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
    const isFavourite = favourites.some((fav) => fav.id === recipe.id);

    const recipieCardElement = document.createElement("div");
    // --- AOS Animation Addition ---
    recipieCardElement.setAttribute("data-aos", "fade-up");
    recipieCardElement.setAttribute("data-aos-delay", `${index * 100}`);
    recipieCardElement.setAttribute("data-aos-duration", "300");
    recipieCardElement.setAttribute("data-aos-once", "true");
    recipieCardElement.className =
      "bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col";
    recipieCardElement.innerHTML = `
      <div class="relative" >
        <img src="${recipe.image}" alt="${recipe.title}">
        <button class="favourite-btn absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200"
          data-id="${recipe.id}">
          <i class="fas fa-heart ${
            isFavourite ? "text-red-500" : "text-gray-400"
          }"></i>
        </button>
      </div>
      <div class="p-5 flex flex-col">
        <h3 class="text-xl font-bold text-gray-800 mb-3">${recipe.title}</h3>
        <div class="mb-4">
          <h4 class="font-medium text-gray-700 mb-2">Ingredients:</h4>
          <div>
            ${recipe.usedIngredients
              .map(
                (ing) => `
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">${ing.name}</span>
                <span class="text-gray-800 font-medium">${ing.amount || ""} ${
                  ing.unit || ""
                }</span>
              </div>`
              )
              .join("")}
          </div>
        </div>
        <div class="flex justify-between items-center pt-3 border-t border-gray-100">
          <a href="${recipe.url}" target="_blank">
            <button class="view-recipie-btn px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">View Recipe</button>
          </a>
          <button class="grocery-list-btn px-4 py-2 accent rounded-lg hover:bg-blue-600 transition"
            data-id="${recipe.id}">Grocery List</button>
        </div>
      </div>
    `;
    recipieCard.appendChild(recipieCardElement);
  });
}

// Add/Remove Favourites
document.addEventListener("click", function (event) {
  const btn = event.target.closest(".favourite-btn");
  if (!btn) return;

  const recipeId = btn.getAttribute("data-id");
  const heartIcon = btn.querySelector("i");
  const lastSearched =
    JSON.parse(localStorage.getItem("lastSearchedRecipes")) || [];
  const recipeData = lastSearched.find((r) => r.id === recipeId);

  if (!recipeData) return;

  let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
  const isAlreadyFav = favourites.some((fav) => fav.id === recipeId);

  if (isAlreadyFav) {
    favourites = favourites.filter((fav) => fav.id !== recipeId);
    localStorage.setItem("favourites", JSON.stringify(favourites));
    heartIcon.classList.remove("text-red-500");
    heartIcon.classList.add("text-gray-400");

    Swal.fire({
      icon: "info",
      title: "Removed!",
      text: "Recipe removed from favourites.",
      timer: 1200,
      showConfirmButton: false,
    });
  } else {
    favourites.push(recipeData);
    localStorage.setItem("favourites", JSON.stringify(favourites));
    heartIcon.classList.remove("text-gray-400");
    heartIcon.classList.add("text-red-500");

    Swal.fire({
      icon: "success",
      title: "Added!",
      text: "Recipe added to your favourites.",
      timer: 1200,
      showConfirmButton: false,
    });
  }
});

// Add to Grocery List (Updated)
document.addEventListener("click", function (event) {
  const groceryBtn = event.target.closest(".grocery-list-btn");
  if (!groceryBtn) return;

  const recipeId = groceryBtn.getAttribute("data-id");
  const lastSearched =
    JSON.parse(localStorage.getItem("lastSearchedRecipes")) || [];
  const recipeData = lastSearched.find((r) => r.id === recipeId);

  if (!recipeData) return;

  recipeData.usedIngredients = recipeData.usedIngredients || [];

  let groceryList = JSON.parse(localStorage.getItem("groceryList")) || [];
  const alreadyExists = groceryList.some((item) => item.id === recipeData.id);

  if (!alreadyExists) {
    groceryList.push(recipeData);
    localStorage.setItem("groceryList", JSON.stringify(groceryList));

    Swal.fire({
      icon: "success",
      title: "Added to Grocery!",
      text: "This recipe has been added to your grocery list.",
      timer: 1500,
      showConfirmButton: false,
    });

    displayGroceryList();
  } else {
    Swal.fire({
      icon: "info",
      title: "Already Added!",
      text: "This recipe is already in your grocery list.",
      timer: 1200,
      showConfirmButton: false,
    });
  }
});

// Initialize Recipe Display
function initializeRecipieDisplay() {
  const lastRecipies = JSON.parse(localStorage.getItem("lastSearchedRecipes"));
  if (lastRecipies && lastRecipies.length > 0) {
    displayRecipieCard(lastRecipies);
  } else {
    fetchRecipies("Chicken, Tomato");
  }
}
document.addEventListener("DOMContentLoaded", initializeRecipieDisplay);

// Favourite Page Loader
function displayFavouriteRecipies() {
  const favourites = JSON.parse(localStorage.getItem("favourites")) || [];
  const recipeResultsFav = document.getElementById("recipeResultsFav");
  if (!recipeResultsFav) return;

  if (favourites.length === 0) {
    recipeResultsFav.innerHTML = `<p class="text-center text-xl text-gray-500 py-10">No favourite recipes yet! ❤</p>`;
    return;
  }

  const container = document.createElement("div");
  container.className =
    "container mx-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";

  favourites.forEach((recipe) => {
    const favRecipieCard = document.createElement("div");
    favRecipieCard.className =
      "bg-white p-4 shadow-lg rounded-lg relative hover:shadow-xl transition";
    favRecipieCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" class="w-full h-48 object-cover rounded-md mb-3">
      <h2 class="text-xl font-bold mb-2">${recipe.title}</h2>
      <a href="${recipe.url}" target="_blank" class="text-teal-500 hover:text-teal-700 font-semibold">View Full Recipe</a>
    `;
    container.appendChild(favRecipieCard);
  });

  recipeResultsFav.innerHTML = "";
  recipeResultsFav.appendChild(container);
}
document.addEventListener("DOMContentLoaded", displayFavouriteRecipies);

// Grocery Page Loader (Updated)
function displayGroceryList() {
  const groceryContainer = document.getElementById("groceryContainer");
  if (!groceryContainer) return;

  const groceryList = JSON.parse(localStorage.getItem("groceryList")) || [];

  if (groceryList.length === 0) {
    groceryContainer.innerHTML = `<p class="text-center text-lg text-gray-500 py-10">No grocery items added yet 🛒</p>`;
    return;
  }

  groceryContainer.innerHTML = "";
  groceryList.forEach((recipe) => {
    const groceryCard = document.createElement("div");
    groceryCard.className =
      "bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition";
    groceryCard.innerHTML = `
      <img src="${
        recipe.image
      }" class="w-full h-40 object-cover rounded-md mb-3">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">${recipe.title}</h3>
      <ul class="text-sm text-gray-600 mb-3 list-disc pl-5">
        ${
          recipe.usedIngredients && recipe.usedIngredients.length > 0
            ? recipe.usedIngredients
                .map(
                  (ing) =>
                    `<li>${ing.name} - ${ing.amount || ""} ${
                      ing.unit || ""
                    }</li>`
                )
                .join("")
            : "<li>No ingredient details available</li>"
        }
      </ul>
      <button class="remove-grocery-btn bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition" data-id="${
        recipe.id
      }">
        Remove
      </button>
    `;
    groceryContainer.appendChild(groceryCard);
  });
}

// Remove grocery item
document.addEventListener("click", function (event) {
  const removeBtn = event.target.closest(".remove-grocery-btn");
  if (!removeBtn) return;

  const recipeId = removeBtn.getAttribute("data-id");
  let groceryList = JSON.parse(localStorage.getItem("groceryList")) || [];
  groceryList = groceryList.filter((item) => item.id !== recipeId);
  localStorage.setItem("groceryList", JSON.stringify(groceryList));

  Swal.fire({
    icon: "info",
    title: "Removed!",
    text: "Item removed from grocery list.",
    timer: 1200,
    showConfirmButton: false,
  });

  displayGroceryList();
});

document.addEventListener("DOMContentLoaded", displayGroceryList);
