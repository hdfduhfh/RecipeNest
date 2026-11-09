/* Local, deterministic translation and locale-aware search. No network services. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RecipeI18n = factory();
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  var languages = [
    { code: 'en', label: 'English', locale: 'en' },
    { code: 'vi', label: 'Tiếng Việt', locale: 'vi' },
    { code: 'ja', label: '日本語', locale: 'ja' },
    { code: 'zh', label: '中文', locale: 'zh-CN' },
    { code: 'fr', label: 'Français', locale: 'fr' },
    { code: 'hi', label: 'हिन्दी', locale: 'hi-IN' },
  ];
  function supported(code) {
    return languages.some(function (item) {
      return item.code === code;
    });
  }
  function normalise(text) {
    return String(text == null ? '' : text)
      .replace(/\s+/g, ' ')
      .trim();
  }
  function fold(text) {
    return normalise(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  }
  function translate(dictionaries, code, source, params) {
    dictionaries = dictionaries || {};
    var key = normalise(source);
    var dictionary = dictionaries[supported(code) ? code : 'en'] || {};
    var result = dictionary[key] || (dictionaries.en || {})[key] || key;
    // Slot labels keep canonical English values in saved data.
    if (!dictionary[key] && key.indexOf(' · ') !== -1) {
      result = key
        .split(' · ')
        .map(function (part) {
          return translate(dictionaries, code, part);
        })
        .join(' · ');
    }
    return result.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, function (match, name) {
      return params && Object.prototype.hasOwnProperty.call(params, name)
        ? String(params[name])
        : match;
    });
  }
  function filterRecipes(recipes, filters, dictionaries, code, logic) {
    var baseFilters = Object.assign({}, filters, { query: '' });
    var result = logic.filterRecipes(recipes, baseFilters);
    var query = fold(filters.query || '');
    var t = function (value) {
      return translate(dictionaries, code, value);
    };
    if (query)
      result = result.filter(function (recipe) {
        var words = [recipe.name, recipe.description, recipe.cuisine, recipe.meal].concat(
          recipe.keywords
        );
        recipe.ingredients.forEach(function (ingredient) {
          words.push(ingredient.name);
        });
        var haystack = words.concat(words.map(t)).join(' ');
        return fold(haystack).indexOf(query) !== -1;
      });
    var locale = (
      languages.find(function (item) {
        return item.code === code;
      }) || languages[0]
    ).locale;
    var compare = new Intl.Collator(locale, { sensitivity: 'base' }).compare;
    return result.sort(function (a, b) {
      if (filters.sort === 'quick' && a.minutes !== b.minutes) return a.minutes - b.minutes;
      return compare(t(a.name), t(b.name)) * (filters.sort === 'za' ? -1 : 1);
    });
  }
  function restoreLanguage(storage) {
    try {
      var code = storage.getItem('recipenest.language.v1');
      return supported(code) ? code : 'en';
    } catch (error) {
      return 'en';
    }
  }
  return {
    languages: languages,
    supported: supported,
    normalise: normalise,
    fold: fold,
    translate: translate,
    filterRecipes: filterRecipes,
    restoreLanguage: restoreLanguage,
  };
});
