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

// API Key
const apiKey = "ab8a40fe315f48509cf82c763471a258";

// Create function and fetching data
async function fetchRecipies(ingredients) {
  try {
    // Create var and save fetching response
    const response = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=10&apiKey=${apiKey}`
    );
    console.log(response);
    // Convert response into JSON and save into new var
    const recipies = await response.json();
    displayRecipieCard(recipies);
    console.log(recipies);
  } catch (error) {
    console.log("Error Fetching recipies:", error);
    recipieCard.innerHTML = `<p>Failed to fetch data</p>`;
  }
}

// Function fo search button
recipieBtn.addEventListener("click", () => {
  const ingredients = recipieInput.value.trim();
  if (ingredients) {
    fetchRecipies(ingredients);
  } else {
    alert("Please enter Ingredients");
  }
});

// Function to display recipie card
function displayRecipieCard(recipiesToDisplay) {
  recipieCard.className =
    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full";
  // const recipieMiniCard = document.getElementById("recipieMiniCard");
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
    // Var for recipie saved in favourite
    // Var for favourite to save in localstorage
    let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
    const isFavourite = favourites.includes(recipie.id);
    // Element create in favourite
    const recipieCardElement = document.createElement("div");
    // Set styling
    recipieCardElement.className = `flex flex-col h-full bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300`;
    recipieCardElement.innerHTML = `
    <div class="relative">
    <img src="${recipie.image}" alt="${
      recipie.title
    }" class="w-full  object-cover">
    <button class="favourite-btn absolute top-3 right-3 bg-white p-2 rounded-full shadow-md ${
      isFavourite ? "active" : ""
    }" data-id="${recipie.id}"><i
            class="fas fa-heart ${
              isFavourite ? "text-red-500" : "text-gray-400"
            }"></i></button>
</div>
<div class="p-5">
    <h3 class="text-xl font-bold text-gray-800 mb-3">${recipie.title}</h3>
    <div class="mb-4">
        <h4 class="font-medium text-gray-700 mb-2">Ingredients:</h4>
        <div class="space-y-1">
            ${recipie.usedIngredients
              .map(
                (ing) => `
              
<div class="flex justify-between text-sm">
    <span class="text-gray-600">${ing.name}</span>
    <span class="text-gray-800 font-medium">${ing.amount} ${ing.unit}</span>
</div>
              `
              )
              .join("")}
              
<div class="flex justify-between items-center">
    <button class="view-recipie-btn px-4 py-2 bg-green-600 text-white rounded-lg hove:bg-green-700 transition-colors duration-300 text-sm font-medium">
        View Recipie
    </button>
    <span class="text-xs text-gray-500">ID: ${recipie.id}</span>
</div>
        </div>
    </div>
    
</div>
    `;
    recipieCard.appendChild(recipieCardElement);
  });
  // Favourite button add EventListener
  document.querySelectorAll(".favourite-btn").forEach((btn) => {
    btn.addEventListener("click", toggleFavourite);
  });
  // For VIew Recipie Button
  document.querySelectorAll(".view-recipie-btn").forEach((btn, index) => {
    btn.addEventListener("click", () => viewRecipie(recipiesToDisplay[index]));
  });
}

// Function for Toggle Favourite

function toggleFavourite(e) {
  const recipieId = parseInt(e.currentTarget.getAttribute("data-id"));
  const heartIcon = e.currentTarget.querySelector("i");
  let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
  if (favourites.includes(recipieId)) {
    // Remove from favourites if again click on heart icon
    favourites = favourites.filter((id) => id !== recipieId);
    heartIcon.classList.remove("text-red-500");
    heartIcon.classList.add("text-gray-400");
    e.currentTarget.classList.remove("active");
    console.log(`Removed ${recipieId} from fav`);
  } else {
    // Add to Favourite
    favourites.push(recipieId);
    heartIcon.classList.remove("text-gray-400");
    heartIcon.classList.add("text-red-500");
    e.currentTarget.classList.add("active");
    console.log(`Add ${recipieId} from fav`);
  }
  // Save to local Storage
  localStorage.setItem("favourites", JSON.stringify(favourites));
}

// Function for view complete recipie
// function viewRecipie(recipie) {
//   Swal.fire({
//     imageUrl: "https://placeholder.pics/svg/300x1500",
//     imageHeight: 1500,
//     imageAlt: "A tall image",
//     title:`Recipie: ${recipie.title}` ,
//   });
// }
