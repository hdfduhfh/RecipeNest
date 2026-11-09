(function () {
  'use strict';
  var app = angular.module('recipeNest');
  app.factory('I18n', [
    '$rootScope',
    '$window',
    'BrowserStorage',
    function ($rootScope, $window, BrowserStorage) {
      var dictionaries = $window.RecipeTranslations || {};
      var service = {
        language: RecipeI18n.restoreLanguage(BrowserStorage),
        languages: RecipeI18n.languages,
        storageWarning: false,
      };
      service.t = function (text, params) {
        return RecipeI18n.translate(dictionaries, service.language, text, params);
      };
      service.list = function (items) {
        return (items || [])
          .map(function (item) {
            return service.t(item);
          })
          .join(service.language === 'ja' || service.language === 'zh' ? '、' : ', ');
      };
      service.filterRecipes = function (recipes, filters) {
        return RecipeI18n.filterRecipes(
          recipes,
          filters,
          dictionaries,
          service.language,
          RecipeLogic
        );
      };
      service.setLanguage = function (code) {
        if (!RecipeI18n.supported(code)) return false;
        service.language = code;
        try {
          BrowserStorage.setItem('recipenest.language.v1', code);
          service.storageWarning = false;
        } catch (error) {
          service.storageWarning = true;
        }
        service.updateDocument();
        $rootScope.$broadcast('languageChanged', code);
        return true;
      };
      service.updateDocument = function () {
        var item = service.languages.find(function (language) {
          return language.code === service.language;
        });
        $window.document.documentElement.lang = item.locale;
        $window.document.title =
          service.t(service.title || 'A little inspiration for every meal') + ' · RecipeNest';
      };
      service.updateDocument();
      return service;
    },
  ]);
  app.filter('t', [
    'I18n',
    function (I18n) {
      var filter = function (source, params) {
        return I18n.t(source, params);
      };
      filter.$stateful = true;
      return filter;
    },
  ]);
  app.filter('tList', [
    'I18n',
    function (I18n) {
      var filter = function (items) {
        return I18n.list(items);
      };
      filter.$stateful = true;
      return filter;
    },
  ]);
})();
