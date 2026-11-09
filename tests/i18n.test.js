'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const locale = require('../js/i18n-core');
const dictionaries = require('../js/translations');
const logic = require('../js/logic');
const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/recipes.json'), 'utf8'));
const codes = ['vi', 'ja', 'zh', 'fr', 'hi'];
const t = (code, text, params) => locale.translate(dictionaries, code, text, params);

test('six supported languages, with English first and no automatic browser-language selection', () => {
  assert.deepEqual(
    locale.languages.map((item) => item.code),
    ['en', ...codes]
  );
  assert.equal(locale.restoreLanguage({ getItem: () => null }), 'en');
  assert.equal(locale.restoreLanguage({ getItem: () => 'xx' }), 'en');
  assert.equal(locale.restoreLanguage({ getItem: () => '{broken' }), 'en');
  assert.equal(
    locale.restoreLanguage({
      getItem: () => {
        throw new Error('blocked');
      },
    }),
    'en'
  );
  for (const code of ['en', ...codes])
    assert.equal(locale.restoreLanguage({ getItem: () => code }), code);
});
test('unknown translation keys and languages fall back safely to English', () => {
  assert.equal(t('xx', 'Recipes'), 'Recipes');
  assert.equal(t('vi', 'An unknown message'), 'An unknown message');
  assert.equal(t('en', 'Recipes'), 'Recipes');
  const key = Object.keys(dictionaries.en)[0];
  assert.equal(locale.translate({ en: dictionaries.en, vi: {} }, 'vi', key), dictionaries.en[key]);
  assert.equal(locale.translate(null, 'en', 'Recipes'), 'Recipes');
});
test('all dictionaries have the same complete set of keys and placeholder names', () => {
  const keys = Object.keys(dictionaries.vi).sort();
  assert.ok(keys.length >= 580);
  for (const code of codes) {
    assert.deepEqual(Object.keys(dictionaries[code]).sort(), keys);
    for (const key of keys) {
      assert.ok(typeof dictionaries[code][key] === 'string' && dictionaries[code][key].trim());
      const params = (text) => (text.match(/\{[a-zA-Z][a-zA-Z0-9]*\}/g) || []).sort();
      assert.deepEqual(
        params(dictionaries[code][key]),
        params(dictionaries.en[key] || key),
        `${code}: ${key}`
      );
    }
  }
});
test('every recipe name, description, step, note, image alt, ingredient, diet and allergen is translated', () => {
  const texts = [];
  for (const r of data.recipes) {
    for (const key of ['name', 'description', 'notes', 'imageAlt', 'cuisine', 'meal'])
      texts.push(r[key]);
    texts.push(...r.steps, ...r.tags, ...r.allergens);
    for (const ingredient of r.ingredients) {
      texts.push(ingredient.name);
      if (ingredient.unit) texts.push(ingredient.unit);
      if (ingredient.note) texts.push(ingredient.note);
    }
  }
  for (const r of data.contributors) texts.push(r.speciality, r.background, r.bio, ...r.interests);
  for (const r of data.collections) texts.push(r.name, r.description);
  for (const code of codes)
    for (const text of texts) assert.ok(dictionaries[code][text], `${code}: ${text}`);
});
test('every static translation binding in live templates has all added translations', () => {
  for (const file of [
    'index.html',
    ...fs.readdirSync(path.join(root, 'templates')).map((name) => 'templates/' + name),
  ]) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of source.matchAll(/('(?:\\.|[^'\\])*')\s*\|\s*t\b/g)) {
      const key = vm.runInNewContext(match[1]);
      for (const code of codes) assert.ok(dictionaries[code][key], `${file}: ${key} (${code})`);
    }
  }
});
test('translated placeholders preserve user-entered content as data', () => {
  const name = '<img src=x onerror=alert(1)>';
  const output = t(
    'vi',
    'Thanks, {name}! Your input is valid. This demonstration has not sent or saved your message.',
    { name }
  );
  assert.ok(output.includes(name));
  assert.ok(output.startsWith('Cảm ơn '));
  // AngularJS interpolation/ng-bind renders this string as text; no ng-bind-html is used.
  for (const name of fs.readdirSync(path.join(root, 'templates')))
    assert.ok(
      !fs.readFileSync(path.join(root, 'templates', name), 'utf8').includes('ng-bind-html')
    );
});
test('search accepts translated recipe names and ingredients in every added language', () => {
  const pasta = data.recipes.find((r) => r.id === 'lemon-pasta');
  for (const code of codes) {
    const byName = locale.filterRecipes(
      data.recipes,
      { query: t(code, pasta.name) },
      dictionaries,
      code,
      logic
    );
    assert.ok(
      byName.some((r) => r.id === pasta.id),
      code
    );
    const byIngredient = locale.filterRecipes(
      data.recipes,
      { query: t(code, 'Fresh basil') },
      dictionaries,
      code,
      logic
    );
    assert.ok(
      byIngredient.some((r) => r.id === pasta.id),
      code
    );
  }
  assert.ok(
    locale
      .filterRecipes(data.recipes, { query: 'dau hu' }, dictionaries, 'vi', logic)
      .some((r) => r.id === 'banh-mi')
  );
});

test('Hindi preserves Devanagari vowel signs, translates UI and supports ingredient search', () => {
  assert.equal(locale.fold('पालक'), 'पालक');
  assert.equal(t('hi', 'Recipes'), 'रेसिपी');
  assert.equal(t('hi', 'Language'), 'भाषा');
  assert.equal(t('hi', 'Monday · Dinner'), 'सोमवार · रात का खाना');
  const found = locale.filterRecipes(data.recipes, { query: 'बेसिल' }, dictionaries, 'hi', logic);
  assert.ok(found.some((recipe) => recipe.id === 'lemon-pasta'));
  const alias = Object.keys(dictionaries.en).find((key) => dictionaries.en[key] === 'Recipes');
  assert.equal(t('hi', alias), 'रेसिपी');
});
test('English keywords, combined canonical filters and IDs keep working in every language', () => {
  const template = fs.readFileSync(path.join(root, 'templates/catalogue.html'), 'utf8');
  assert.match(template, /value="{{\s*c\s*}}"/);
  assert.match(template, /value="{{\s*tag\s*}}"/);
  assert.ok(!/value="[^"\n]*\|\s*t\b/.test(template), 'Filter option values must remain canonical');
  for (const code of ['en', ...codes]) {
    const result = locale.filterRecipes(
      data.recipes,
      { query: 'basil', cuisine: 'Italian', meal: 'Breakfast', time: '15', diet: 'Vegan' },
      dictionaries,
      code,
      logic
    );
    assert.deepEqual(
      result.map((r) => r.id),
      ['tomato-toast']
    );
  }
});
test('locale-aware sorting, empty results, and original data immutability', () => {
  const original = JSON.stringify(data);
  for (const code of ['en', ...codes]) {
    const asc = locale.filterRecipes(data.recipes, { sort: 'az' }, dictionaries, code, logic);
    const desc = locale.filterRecipes(data.recipes, { sort: 'za' }, dictionaries, code, logic);
    assert.deepEqual(
      desc.map((r) => r.id),
      asc.map((r) => r.id).reverse()
    );
    assert.equal(
      locale.filterRecipes(
        data.recipes,
        { query: 'zz-no-such-recipe-987' },
        dictionaries,
        code,
        logic
      ).length,
      0
    );
  }
  assert.equal(JSON.stringify(data), original);
});
test('slot labels translate without changing the canonical saved-plan key', () => {
  assert.equal(t('vi', 'Monday · Dinner'), 'Thứ Hai · Bữa tối');
  const plan = logic.cleanPlan(
    { '0-Dinner': { recipeId: 'lemon-pasta', servings: 6 } },
    data.recipes
  );
  for (const code of codes) t(code, 'Monday · Dinner');
  assert.equal(plan['0-Dinner'].servings, 6);
});
test('AngularJS language service persists choice, updates lang/title, handles storage failures', () => {
  const factories = {};
  const registration = {
    factory(name, value) {
      factories[name] = value;
      return this;
    },
    filter() {
      return this;
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/i18n-angular.js'), 'utf8'), {
    angular: { module: () => registration },
    RecipeI18n: locale,
    RecipeLogic: logic,
  });
  let stored = null;
  const storage = {
    getItem: () => stored,
    setItem: (key, value) => {
      assert.equal(key, 'recipenest.language.v1');
      stored = value;
    },
  };
  const document = { documentElement: {}, title: '' };
  const window = { document, RecipeTranslations: dictionaries };
  const events = [];
  const service = factories.I18n.at(-1)(
    { $broadcast: (...event) => events.push(event) },
    window,
    storage
  );
  assert.equal(service.language, 'en');
  service.title = 'Recipe catalogue';
  service.setLanguage('vi');
  assert.equal(stored, 'vi');
  assert.equal(document.documentElement.lang, 'vi');
  assert.equal(document.title, 'Danh sách công thức · RecipeNest');
  service.setLanguage('zh');
  assert.equal(document.documentElement.lang, 'zh-CN');
  assert.equal(service.setLanguage('bad'), false);
  assert.equal(service.language, 'zh');
  storage.setItem = () => {
    throw new Error('quota');
  };
  assert.equal(service.setLanguage('fr'), true);
  assert.equal(service.storageWarning, true);
  assert.equal(service.t('Home'), 'Accueil');
  assert.equal(events.length, 3);
});
