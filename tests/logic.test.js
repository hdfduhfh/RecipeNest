'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../js/logic');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/recipes.json'), 'utf8'));
const recipes = data.recipes;
const pasta = recipes.find((r) => r.id === 'lemon-pasta');

test('24 unique, fully linked sample records, local assets and collections', () => {
  assert.equal(recipes.length, 24);
  assert.equal(new Set(recipes.map((r) => r.id)).size, 24);
  assert.equal(new Set(recipes.map((r) => r.cuisine)).size, 6);
  for (const r of recipes) {
    assert.match(r.id, /^[a-z0-9-]+$/);
    assert.ok(data.contributors.some((p) => p.id === r.contributorId));
    assert.ok(L.validServings(r.servings));
    assert.ok(r.minutes > 0 && r.steps.length >= 4 && r.ingredients.length >= 5);
    assert.ok(r.imageAlt && r.imageCredit && r.imageSource);
    assert.ok(fs.statSync(path.join(root, r.image)).size > 5000);
    for (const i of r.ingredients)
      if (i.scalable) assert.ok(Number.isFinite(i.quantity) && i.quantity > 0 && i.unit);
  }
  for (const c of data.collections)
    for (const id of c.recipeIds) assert.ok(recipes.some((r) => r.id === id));
});
test('serving boundaries 1 and 20 are accepted', () => {
  assert.equal(L.validServings(1), true);
  assert.equal(L.validServings(20), true);
});
for (const value of [0, -1, 21, 1.5, NaN, Infinity, undefined, null, '2', '', {}, true]) {
  test(`reject invalid serving count ${String(value)}`, () => {
    assert.equal(L.validServings(value), false);
    assert.throws(() => L.scaleIngredients(pasta, value), RangeError);
  });
}
test('one serving: 180 g pasta at base 2 becomes 90 g', () =>
  assert.equal(L.scaleIngredients(pasta, 1)[0].quantity, 90));
test('six servings: 180 g pasta becomes 540 g; original data unchanged', () => {
  const original = JSON.stringify(pasta);
  assert.equal(L.scaleIngredients(pasta, 6)[0].quantity, 540);
  assert.equal(JSON.stringify(pasta), original);
});
test('twenty servings: 180 g pasta becomes 1800 g', () =>
  assert.equal(L.scaleIngredients(pasta, 20)[0].quantity, 1800));
test('round to two decimal places without changing units', () => {
  const result = L.scaleIngredients(
    { servings: 3, ingredients: [{ name: 'Spice', quantity: 1, unit: 'tsp', scalable: true }] },
    2
  );
  assert.equal(result[0].quantity, 0.67);
  assert.equal(result[0].unit, 'tsp');
});
test('non-scalable salt retains the to-taste note', () => {
  const r = L.scaleIngredients(pasta, 20).at(-1);
  assert.equal(r.note, 'To taste');
  assert.equal(r.scalable, false);
  assert.equal(r.quantity, 0);
});
test('search is case-insensitive with trimmed keyword matching', () => {
  assert.ok(
    L.filterRecipes(recipes, { query: '  LEMON & BASIL  ' }).some((r) => r.id === 'lemon-pasta')
  );
  assert.ok(L.filterRecipes(recipes, { query: 'tahini' }).some((r) => r.id === 'rainbow-bowl'));
});
test('all four filters and query combine with AND; exact expected record', () => {
  const found = L.filterRecipes(recipes, {
    query: 'basil',
    cuisine: 'Italian',
    meal: 'Breakfast',
    time: '15',
    diet: 'Vegan',
  });
  assert.deepEqual(
    found.map((r) => r.id),
    ['tomato-toast']
  );
});
test('time limit includes exact boundary', () =>
  assert.ok(L.filterRecipes(recipes, { time: 15 }).some((r) => r.id === 'tomato-toast')));
test('no match yields empty list', () =>
  assert.deepEqual(L.filterRecipes(recipes, { query: 'not-a-real-ingredient' }), []));
test('sorting and filtering do not reorder original catalogue', () => {
  const ids = recipes.map((r) => r.id);
  const asc = L.filterRecipes(recipes, { sort: 'az' });
  const desc = L.filterRecipes(recipes, { sort: 'za' });
  assert.deepEqual(
    desc.map((r) => r.name),
    asc.map((r) => r.name).reverse()
  );
  assert.deepEqual(
    recipes.map((r) => r.id),
    ids
  );
  const quick = L.filterRecipes(recipes, { sort: 'quick' });
  assert.ok(quick.every((r, i) => i === 0 || r.minutes >= quick[i - 1].minutes));
});
test('deduplicate saved IDs and reject unknown or malformed entries', () => {
  assert.deepEqual(L.cleanFavourites(['lemon-pasta', 'lemon-pasta', 'bad', null, 1], recipes), [
    'lemon-pasta',
  ]);
  for (const value of [null, {}, 1, 'bad']) assert.deepEqual(L.cleanFavourites(value, recipes), []);
});
test('planner restore only accepts valid slots, recipe IDs and serving counts', () => {
  const input = {
    '0-Breakfast': { recipeId: 'lemon-pasta', servings: 1 },
    '6-Dinner': { recipeId: 'rainbow-bowl', servings: 20 },
    '7-Lunch': { recipeId: 'lemon-pasta', servings: 2 },
    '1-Lunch': { recipeId: 'bad', servings: 2 },
    '2-Lunch': { recipeId: 'lemon-pasta', servings: 0 },
    '3-Lunch': { recipeId: 'lemon-pasta', servings: 1.5 },
  };
  const clean = L.cleanPlan(input, recipes);
  assert.deepEqual(Object.keys(clean), ['0-Breakfast', '6-Dinner']);
  assert.equal(L.countMeals(clean), 2);
});
test('empty or malformed plan restores as empty', () => {
  for (const value of [null, [], 1, 'bad', undefined])
    assert.deepEqual(L.cleanPlan(value, recipes), {});
  assert.equal(L.countMeals({}), 0);
});
test('removing a favourite does not remove an independent planner entry', () => {
  const plan = L.cleanPlan({ '0-Dinner': { recipeId: 'lemon-pasta', servings: 2 } }, recipes);
  const fav = L.cleanFavourites([], recipes);
  assert.equal(fav.length, 0);
  assert.equal(L.countMeals(plan), 1);
});
test('all Angular templates exist and all script files are local', () => {
  const app = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  for (const match of app.matchAll(/templateUrl: '([^']+)'/g))
    assert.ok(fs.existsSync(path.join(root, match[1])));
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const match of html.matchAll(/src="([^"]+)"/g)) {
    assert.ok(!match[1].startsWith('http'));
    assert.ok(fs.existsSync(path.join(root, match[1])));
  }
});
