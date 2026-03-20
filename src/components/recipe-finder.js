import React, { useState, useEffect } from 'react';
import './recipe-finder.css';

function RecipeFinder() {
  const [searchTerm, setSearchTerm] = useState('chicken');
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVegetarianOnly, setShowVegetarianOnly] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!searchTerm.trim()) {
        setRecipes([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`
        );
        const data = await response.json();

        if (data.meals) {
          setRecipes(data.meals);
        } else {
          setRecipes([]);
        }
      } catch (err) {
        setError('Failed to fetch recipes. Please try again.');
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const ingredient = formData.get('ingredient');
    if (ingredient && ingredient.trim()) {
      setSearchTerm(ingredient.trim());
    }
  };

  const toggleDetails = (recipeId) => {
    setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId);
  };

  const toggleFavorite = (recipeId) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(recipeId)) {
        return prevFavorites.filter((id) => id !== recipeId);
      } else {
        return [...prevFavorites, recipeId];
      }
    });
  };

  const isFavorite = (recipeId) => favorites.includes(recipeId);

  const getIngredients = (recipe) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(`${measure} ${ingredient}`);
      }
    }
    return ingredients;
  };

  const isVegetarian = (recipe) => {
    const meatKeywords = [
      'chicken', 'beef', 'pork', 'lamb', 'fish',
      'salmon', 'tuna', 'turkey', 'duck', 'meat'
    ];
    const recipeName = recipe.strMeal.toLowerCase();
    const category = recipe.strCategory ? recipe.strCategory.toLowerCase() : '';

    return !meatKeywords.some(
      (keyword) => recipeName.includes(keyword) || category.includes(keyword)
    );
  };

  const filteredRecipes = showVegetarianOnly
    ? recipes.filter(isVegetarian)
    : recipes;

  return (
    <div className="recipe-finder">
      <header className="header">
        <h1>🍲 Recipe Finder</h1>
        <p>Discover delicious recipes based on ingredients</p>
      </header>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          name="ingredient"
          placeholder="Enter ingredient (e.g., chicken, pasta, beef)..."
          defaultValue={searchTerm}
          className="search-input"
        />
        <button type="submit" className="search-button">
          🔍 Search
        </button>
      </form>

      <div className="controls">
        <div className="favorites-counter">
          ❤️ Favorites: <strong>{favorites.length}</strong>
        </div>
        <label className="vegetarian-filter">
          <input
            type="checkbox"
            checked={showVegetarianOnly}
            onChange={(e) => setShowVegetarianOnly(e.target.checked)}
          />
          🥗 Show Vegetarian Only
        </label>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading delicious recipes...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && filteredRecipes.length === 0 && searchTerm && (
        <div className="empty-state">
          <p>🔍 No recipes found for "{searchTerm}"</p>
          <p>Try searching for another ingredient!</p>
        </div>
      )}

      {!loading && filteredRecipes.length > 0 && (
        <div className="recipes-grid">
          {filteredRecipes.map((recipe) => (
            <div key={recipe.idMeal} className="recipe-card">
              <div className="recipe-image-container">
                <img
                  src={recipe.strMealThumb}
                  alt={recipe.strMeal}
                  className="recipe-image"
                />
                {isVegetarian(recipe) && (
                  <span className="vegetarian-badge">🥗 Vegetarian</span>
                )}
              </div>

              <div className="recipe-header">
                <h3 className="recipe-title">{recipe.strMeal}</h3>
                <button
                  onClick={() => toggleFavorite(recipe.idMeal)}
                  className={`favorite-button ${
                    isFavorite(recipe.idMeal) ? 'active' : ''
                  }`}
                >
                  {isFavorite(recipe.idMeal) ? '❤️' : '🤍'}
                </button>
              </div>

              <div className="recipe-meta">
                <span className="badge">{recipe.strCategory}</span>
                <span className="badge">{recipe.strArea}</span>
              </div>

              <button
                onClick={() => toggleDetails(recipe.idMeal)}
                className="details-button"
              >
                {expandedRecipeId === recipe.idMeal
                  ? '▲ Hide Details'
                  : '▼ Show Details'}
              </button>

              {expandedRecipeId === recipe.idMeal && (
                <div className="recipe-details">
                  <div className="ingredients-section">
                    <h4>📝 Ingredients</h4>
                    <ul className="ingredients-list">
                      {getIngredients(recipe).map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="instructions-section">
                    <h4>👨‍🍳 Instructions</h4>
                    <p className="instructions">{recipe.strInstructions}</p>
                  </div>

                  {recipe.strYoutube && (
                    <a
                      href={recipe.strYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="video-link"
                    >
                      📺 Watch Video Tutorial
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecipeFinder;