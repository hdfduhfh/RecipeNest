/* Pure, framework-independent algorithms. Also loaded by Node's test runner. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RecipeLogic = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  function validServings(value) {
    return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 20;
  }
  function scaleIngredients(recipe, servings) {
    if (!validServings(servings)) throw new RangeError('Choose a whole number from 1 to 20.');
    return recipe.ingredients.map(function (item) {
      var copy = Object.assign({}, item);
      if (item.scalable !== false)
        copy.quantity =
          Math.round(((item.quantity * servings) / recipe.servings + Number.EPSILON) * 100) / 100;
      return copy;
    });
  }
  function filterRecipes(recipes, filters) {
    var query = (filters.query || '').trim().toLowerCase();
    var found = recipes.filter(function (r) {
      var haystack = [r.name, r.description].concat(r.keywords).join(' ').toLowerCase();
      return (
        (!query || haystack.indexOf(query) !== -1) &&
        (!filters.cuisine || r.cuisine === filters.cuisine) &&
        (!filters.meal || r.meal === filters.meal) &&
        (!filters.time || r.minutes <= Number(filters.time)) &&
        (!filters.diet || r.tags.indexOf(filters.diet) !== -1)
      );
    });
    return found.sort(function (a, b) {
      if (filters.sort === 'quick') return a.minutes - b.minutes || a.name.localeCompare(b.name);
      return (filters.sort === 'za' ? -1 : 1) * a.name.localeCompare(b.name);
    });
  }
  function cleanFavourites(value, recipes) {
    if (!Array.isArray(value)) return [];
    var ids = recipes.map(function (r) {
      return r.id;
    });
    return value.filter(function (id, index) {
      return typeof id === 'string' && ids.indexOf(id) !== -1 && value.indexOf(id) === index;
    });
  }
  function cleanPlan(value, recipes) {
    var clean = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return clean;
    Object.keys(value).forEach(function (key) {
      var item = value[key];
      if (
        /^[0-6]-(Breakfast|Lunch|Dinner)$/.test(key) &&
        item &&
        recipes.some(function (r) {
          return r.id === item.recipeId;
        }) &&
        validServings(item.servings)
      ) {
        clean[key] = { recipeId: item.recipeId, servings: item.servings };
      }
    });
    return clean;
  }
  function countMeals(plan) {
    var count = 0;
    Object.keys(plan).forEach(function () {
      count += 1;
    });
    return count;
  }
  return {
    validServings: validServings,
    scaleIngredients: scaleIngredients,
    filterRecipes: filterRecipes,
    cleanFavourites: cleanFavourites,
    cleanPlan: cleanPlan,
    countMeals: countMeals,
  };
});
