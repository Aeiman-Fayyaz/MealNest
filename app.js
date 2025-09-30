// Navbar Toggle 
document.getElementById("hamburger").onclick = function toggleMenu() {
  const navToggle = document.getElementsByClassName("toggle");
  for (let i = 0; i < navToggle.length; i++) {
    navToggle.item(i).classList.toggle("hidden");
  }
};

// Getting elements 
const recipieInput = document.getElementById("recipieInput")
const recipieBtn = document.getElementById("recipieBtn")
const recipieCard = document.getElementById("recipieCard")
// API Key
const apiKey = "8d94083a3159430b82d58df4c63edd16"

const url = "https://api.spoonacular.com/recipes/findByIngredients"

// Create function and fetching data
