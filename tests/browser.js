(async function () {
  'use strict';
  var output = document.getElementById('results'), lines = [], failures = 0;
  function check(name, fn) {
    try { if (!fn()) throw new Error('Check failed'); lines.push('PASS ' + name); }
    catch (e) { failures++; lines.push('FAIL ' + name + ': ' + e.message); }
  }
  try {
    var response = await fetch('../data/recipes.json');
    if (!response.ok) throw new Error('Recipe data HTTP ' + response.status);
    var data = await response.json(), recipes = data.recipes;
    var pasta = recipes.find(function(r) { return r.id === 'lemon-pasta'; });
    check('24 unique recipes', function() { return recipes.length === 24 && new Set(recipes.map(function(r) { return r.id; })).size === 24; });
    check('Serving boundaries', function() { return RecipeLogic.validServings(1) && RecipeLogic.validServings(20); });
    [0, -1, 21, 1.5, null, '2'].forEach(function(n) {
      check('Reject serving value ' + JSON.stringify(n), function() { return !RecipeLogic.validServings(n); });
    });
    check('Scale ingredients for six people', function() { return RecipeLogic.scaleIngredients(pasta, 6)[0].quantity === 540; });
    check('Favourites discard duplicates and unknown IDs', function() { return JSON.stringify(RecipeLogic.cleanFavourites(['lemon-pasta', 'lemon-pasta', 'missing'], recipes)) === '["lemon-pasta"]'; });
    check('Unknown recipe has no invented result', function() { return RecipeChat.guide(recipes,'zzzznonexistent','en').recipeIds.length === 0; });
    check('Follow-up uses previous recipe', function() { return RecipeChat.guide(recipes,'ingredients for 6 people','en',['lemon-pasta']).answer.indexOf('540') !== -1; });
    ['en','vi','ja','zh','fr','hi'].forEach(function(code) {
      var labels = RecipeChatLocales[code];
      check(code + ' quick recipes', function() {
        var found = RecipeChat.search(recipes,labels.quick,code);
        return found.length > 0 && found.every(function(r) { return r.minutes <= 20; });
      });
      check(code + ' vegetarian recipes', function() {
        var found = RecipeChat.search(recipes,labels.veggie,code);
        return found.length > 0 && found.every(function(r) { return r.tags.includes('Vegetarian') || r.tags.includes('Vegan'); });
      });
      check(code + ' planner help', function() { return RecipeChat.guide(recipes, labels.help, code).planner; });
    });
    for (var recipe of recipes) {
      var image = await fetch('../' + recipe.image);
      check('Image ' + recipe.id, function() { return image.ok; });
    }
  } catch(e) { failures++; lines.push('FAIL ' + e.message); }
  output.textContent = lines.join('\n') + '\n\n' + (lines.length - failures) + '/' + lines.length + ' passed';
  document.body.dataset.failures = String(failures);
})();
