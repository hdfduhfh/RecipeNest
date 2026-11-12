/* Deterministic site search, shared by the browser guide and the recipe guide. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports)
    module.exports = factory(
      require('./i18n-core'),
      require('./translations'),
      require('./chat-locales'),
      require('./logic')
    );
  else
    root.RecipeChat = factory(
      root.RecipeI18n,
      root.RecipeTranslations,
      root.RecipeChatLocales,
      root.RecipeLogic
    );
})(typeof window !== 'undefined' ? window : this, function (i18n, dictionaries, labels, logic) {
  'use strict';
  function text(code, key, params) {
    return ((labels[code] || labels.en)[key] || labels.en[key] || key).replace(
      /\{(\w+)\}/g,
      function (_, k) {
        return params && params[k] !== undefined ? String(params[k]) : '{' + k + '}';
      }
    );
  }
  function translate(code, value) {
    return i18n.translate(dictionaries, code, value);
  }
  function folded(value) {
    return i18n.fold(String(value || ''));
  }
  var stop = new Set(
    (
      'a an the and or for to in of with me i my can could please what is are how do make recipe recipes dish dishes suggest some show find want cook cooking ingredients steps under less than minutes min ' +
      'tui toi ba minh cho giup mon an nau cong thuc nguyen lieu cach nao muon co cac voi duoi phut trong la va mot goi y ' +
      'je tu le la les des un une de du en et avec pour recette recettes comment faire moins minutes plats ' +
      'は を の が に で と です ます'
    ).split(/\s+/)
  );
  function has(query, values) {
    return values.some(function (value) {
      return query.indexOf(folded(value)) !== -1;
    });
  }
  function search(recipes, query, code, previousIds) {
    var q = folded(query);
    var tokens = q.split(/[^\p{L}\p{N}]+/u).filter(function (word) {
      return word.length > 1 && !stop.has(word);
    });
    var time = q.match(/(\d{1,3})\s*(?:min(?:ute)?s?|phut|分钟|分|मिनट)/);
    var maxTime = time ? Number(time[1]) : null;
    var vegan = has(q, ['vegan', 'thuan chay', 'ヴィーガン', '纯素', 'vegetalien', 'वीगन']);
    var vegetarian =
      !vegan &&
      has(q, [
        'vegetarian',
        'vegetarien',
        'mon chay',
        'an chay',
        'ベジタリアン',
        '素食',
        'शाकाहारी',
      ]);
    var cuisines = [
      ['Italian', ['italian', 'italien', 'mon y', 'kieu y', 'イタリア', '意大利', 'इतालवी']],
      ['Vietnamese', ['vietnam', 'viet nam', 'mon viet', 'ベトナム', '越南', 'वियतनामी']],
      ['Japanese', ['japan', 'japon', 'mon nhat', 'nhat ban', '日本', '和食', 'जापानी']],
      ['Indian', ['indian', 'indien', 'an do', 'インド', '印度', 'भारतीय']],
      ['Mexican', ['mexic', 'メキシコ', '墨西哥', 'मैक्सिकन']],
      ['Mediterranean', ['mediterr', 'dia trung hai', '地中海', 'भूमध्य']],
    ];
    var cuisine = cuisines.find(function (item) {
      return has(q, item[1]);
    });
    var meals = [
      ['Breakfast', ['breakfast', 'bua sang', 'petit dejeuner', '朝食', '早餐', 'नाश्ता']],
      ['Lunch', ['lunch', 'bua trua', 'dejeuner', '昼食', '午餐', 'दोपहर']],
      ['Dinner', ['dinner', 'bua toi', 'diner', '夕食', '晚餐', 'रात का']],
    ];
    var meal = meals.find(function (item) {
      return has(q, item[1]);
    });
    var constrained = !!(maxTime || vegan || vegetarian || cuisine || meal);
    var generic =
      !tokens.length ||
      has(q, ['recommend', 'goi y', 'suggest', 'ideas', 'idee', 'おすすめ', '推荐', 'सुझाव']);
    var followUp = has(q, [
      'ingredients',
      'nguyen lieu',
      'steps',
      'cach nau',
      'cach lam',
      'servings',
      'khau phan',
      'portions',
      '材料',
      '作り方',
      '食材',
      '步骤',
      'सामग्री',
      'चरण',
    ]);
    var scored = recipes
      .map(function (r) {
        var name = folded(r.name + ' ' + translate(code, r.name));
        var full = folded(
          [r.name, r.cuisine, r.meal, r.description, translate(code, r.description)]
            .concat(
              r.tags,
              r.keywords || [],
              r.ingredients.map(function (i) {
                return i.name + ' ' + translate(code, i.name);
              })
            )
            .join(' ')
        );
        var exact =
          q.indexOf(folded(r.name)) !== -1 ||
          q.indexOf(folded(translate(code, r.name))) !== -1 ||
          q.indexOf(r.id) !== -1;
        var score = exact ? 100 : 0;
        tokens.forEach(function (token) {
          if (name.indexOf(token) !== -1) score += 8;
          else if (full.indexOf(token) !== -1) score += 2;
        });
        if (
          !exact &&
          ((maxTime && r.minutes > maxTime) ||
            (cuisine && r.cuisine !== cuisine[0]) ||
            (meal && r.meal !== meal[0]) ||
            (vegan && r.tags.indexOf('Vegan') === -1) ||
            (vegetarian && r.tags.indexOf('Vegetarian') === -1 && r.tags.indexOf('Vegan') === -1))
        )
          return null;
        if (followUp && !exact && previousIds && previousIds.indexOf(r.id) !== -1) score += 20;
        if (!score && !constrained && !generic) return null;
        return { recipe: r, score: score, exact: exact };
      })
      .filter(Boolean);
    scored.sort(function (a, b) {
      return (
        b.score - a.score ||
        a.recipe.minutes - b.recipe.minutes ||
        a.recipe.id.localeCompare(b.recipe.id)
      );
    });
    // An explicitly named recipe takes precedence over incidental ingredient matches.
    if (
      scored.some(function (item) {
        return item.exact;
      })
    )
      scored = scored.filter(function (item) {
        return item.exact;
      });
    else if (
      followUp &&
      previousIds &&
      previousIds.length &&
      scored.length &&
      previousIds.indexOf(scored[0].recipe.id) !== -1
    )
      scored = scored.filter(function (item) {
        return previousIds.indexOf(item.recipe.id) !== -1;
      });
    return scored.slice(0, 6).map(function (item) {
      return item.recipe;
    });
  }
  function guide(recipes, query, code, previousIds) {
    var q = folded(query),
      result = { answer: '', recipeIds: [], planner: false, mode: 'local' };
    if (
      /^(hi|hello|hey|chao( ba)?|xin chao|bonjour|salut|こんにちは|你好|नमस्ते)[!.\s]*$/.test(q)
    ) {
      result.answer = text(code, 'welcome');
      return result;
    }
    if (has(q, ['thank', 'cam on', 'merci', 'ありがとう', '谢谢', 'धन्यवाद'])) {
      result.answer = text(code, 'thanks');
      return result;
    }
    if (
      has(q, [
        'planner',
        'plan my',
        'planifier',
        'planning',
        'lich an',
        'lich bua',
        'lich bu',
        'ke hoach',
        '食事プラン',
        '用餐计划',
        'भोजन की योजना',
      ])
    ) {
      result.answer = text(code, 'plan');
      result.planner = true;
      return result;
    }
    var found = search(recipes, query, code, previousIds);
    result.recipeIds = found.map(function (r) {
      return r.id;
    });
    if (!found.length) {
      result.answer = text(code, 'none');
      return result;
    }
    var ingredients = has(q, [
      'ingredients',
      'ingredient',
      'nguyen lieu',
      '材料',
      '食材',
      'सामग्री',
    ]);
    var steps = has(q, [
      'steps',
      'how to cook',
      'cach nau',
      'cach lam',
      'preparation',
      '作り方',
      '步骤',
      'चरण',
    ]);
    var amount = q.match(/(\d+)\s*(?:servings?|people|portions?|nguoi|khau phan|人|लोग)/);
    if (found.length === 1 && (ingredients || steps || amount)) {
      var recipe = found[0];
      result.answer = translate(code, recipe.name) + '\n';
      if (ingredients || amount) {
        var servings = amount ? Number(amount[1]) : recipe.servings;
        if (!logic.validServings(servings)) {
          result.answer += translate(code, 'Choose a whole number from 1 to 20.');
          return result;
        }
        result.answer +=
          text(code, 'ingredients') + ' · ' + text(code, 'servings', { n: servings }) + '\n';
        result.answer += logic
          .scaleIngredients(recipe, servings)
          .map(function (i) {
            return (
              '• ' +
              (i.quantity ? i.quantity + ' ' + translate(code, i.unit) + ' ' : '') +
              translate(code, i.name) +
              (i.note ? ' (' + translate(code, i.note) + ')' : '')
            );
          })
          .join('\n');
      }
      if (steps)
        result.answer +=
          '\n' +
          text(code, 'steps') +
          '\n' +
          recipe.steps
            .map(function (step, i) {
              return i + 1 + '. ' + translate(code, step);
            })
            .join('\n');
      result.answer += '\n\n' + text(code, 'notes') + ': ' + translate(code, recipe.notes);
    } else result.answer = text(code, 'found') + '\n\n' + text(code, 'choose');
    return result;
  }
  return { text: text, translate: translate, search: search, guide: guide };
});
