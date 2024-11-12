const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());

const readRecipes = () => {
  const data = fs.readFileSync('recipes.json');
  return JSON.parse(data);
};

const writeRecipes = (recipes) => {
  fs.writeFileSync('recipes.json', JSON.stringify(recipes, null, 2));
};

app.get('/recipes', (req, res) => {
  const recipes = readRecipes();
  const { ingredient, name } = req.query;

  let filteredRecipes = recipes;

  if (ingredient) {
    filteredRecipes = filteredRecipes.filter((recipe) =>
      recipe.ingredients.includes(ingredient.toLowerCase())
    );
  }

  if (name) {
    filteredRecipes = filteredRecipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  res.json(filteredRecipes);
});

app.post('/recipes', (req, res) => {
  const recipes = readRecipes();
  const newRecipe = { id: recipes.length + 1, ...req.body };
  recipes.push(newRecipe);
  writeRecipes(recipes);
  res.status(201).json(newRecipe);
});

app.put('/recipes/:id', (req, res) => {
  const recipes = readRecipes();
  const recipeId = parseInt(req.params.id, 10);
  const recipeIndex = recipes.findIndex((recipe) => recipe.id === recipeId);

  if (recipeIndex === -1) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  recipes[recipeIndex] = { id: recipeId, ...req.body };
  writeRecipes(recipes);
  res.json(recipes[recipeIndex]);
});

app.delete('/recipes/:id', (req, res) => {
  const recipes = readRecipes();
  const recipeId = parseInt(req.params.id, 10);
  const updatedRecipes = recipes.filter((recipe) => recipe.id !== recipeId);

  if (updatedRecipes.length === recipes.length) {
    return res.status(404).json({ error: 'Recipe not found' });
  }

  writeRecipes(updatedRecipes);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
