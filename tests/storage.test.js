/* Test the actual SavedData factory with injected catalogue/storage, without a browser. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const L = require('../js/logic');
const data = JSON.parse(
  fs.readFileSync(require('node:path').join(__dirname, '../data/recipes.json'), 'utf8')
);
const factories = {};
const registration = {
  config() {
    return this;
  },
  factory(name, arr) {
    factories[name] = arr;
    return this;
  },
  controller() {
    return this;
  },
  directive() {
    return this;
  },
  run() {
    return this;
  },
};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname, '../js/app.js'), 'utf8'), {
  angular: {
    module() {
      return registration;
    },
    equals(a, b) {
      return JSON.stringify(a) === JSON.stringify(b);
    },
  },
  RecipeLogic: L,
});
function factory(storage) {
  const catalogue = {
    recipes: data.recipes,
    ready: Promise.resolve(),
    find: (id) => data.recipes.find((r) => r.id === id),
  };
  return factories.SavedData.at(-1)(catalogue, storage);
}
function memory(values = {}) {
  return {
    values,
    getItem(key) {
      return key in values ? values[key] : null;
    },
    setItem(key, value) {
      values[key] = value;
    },
  };
}
test('actual service: favourite save, uniqueness, unsave, and reload persistence', async () => {
  const storage = memory();
  const a = factory(storage);
  await a.ready;
  a.toggle('lemon-pasta');
  assert.equal(a.favourites.length, 1);
  a.toggle('not-a-recipe');
  assert.equal(a.favourites.length, 1);
  const b = factory(storage);
  await b.ready;
  assert.equal(b.has('lemon-pasta'), true);
  b.toggle('lemon-pasta');
  assert.equal(b.favourites.length, 0);
  storage.values['recipenest.favourites.v1'] = '["lemon-pasta","lemon-pasta","bad"]';
  const c = factory(storage);
  await c.ready;
  assert.equal(c.favourites.length, 1);
  assert.ok(c.warnings.length);
});
test('actual service: planner rejects invalid entries, replaces slots, survives reload and removes', async () => {
  const storage = memory();
  const a = factory(storage);
  await a.ready;
  assert.equal(a.setMeal('0-Dinner', 'lemon-pasta', 3), true);
  assert.equal(a.setMeal('0-Dinner', 'rainbow-bowl', 1), true);
  assert.equal(a.setMeal('9-Dinner', 'lemon-pasta', 2), false);
  assert.equal(a.setMeal('1-Lunch', 'bad', 2), false);
  assert.equal(a.setMeal('1-Lunch', 'lemon-pasta', 1.5), false);
  const b = factory(storage);
  await b.ready;
  assert.equal(b.plan['0-Dinner'].recipeId, 'rainbow-bowl');
  assert.equal(L.countMeals(b.plan), 1);
  b.removeMeal('0-Dinner');
  const c = factory(storage);
  await c.ready;
  assert.equal(L.countMeals(c.plan), 0);
});
test('actual service: malformed JSON is handled with a warning and usable defaults', async () => {
  const storage = memory({
    'recipenest.favourites.v1': '{broken',
    'recipenest.plan.v1': '[invalid',
  });
  const a = factory(storage);
  await a.ready;
  assert.equal(a.favourites.length, 0);
  assert.equal(L.countMeals(a.plan), 0);
  assert.ok(a.warnings.length);
  a.toggle('lemon-pasta');
  assert.equal(a.has('lemon-pasta'), true);
});
test('actual service: blocked storage uses memory and reports failure', async () => {
  const blocked = {
    getItem() {
      throw new Error('Storage denied');
    },
    setItem() {
      throw new Error('Quota or permission');
    },
  };
  const a = factory(blocked);
  await a.ready;
  a.toggle('lemon-pasta');
  assert.equal(a.has('lemon-pasta'), true);
  assert.equal(a.setMeal('6-Dinner', 'lemon-pasta', 20), true);
  assert.equal(L.countMeals(a.plan), 1);
  a.removeMeal('6-Dinner');
  assert.equal(L.countMeals(a.plan), 0);
  assert.ok(a.warnings.length);
});
