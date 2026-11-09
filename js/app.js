(function () {
  'use strict';
  var app = angular.module('recipeNest', ['ngRoute']);
  app.config([
    '$routeProvider',
    '$locationProvider',
    function ($routeProvider, $locationProvider) {
      $locationProvider.hashPrefix('!');
      $routeProvider
        .when('/', {
          templateUrl: 'templates/home.html',
          controller: 'HomeController',
          controllerAs: 'home',
          title: 'A little inspiration for every meal',
        })
        .when('/recipes', {
          templateUrl: 'templates/catalogue.html',
          controller: 'CatalogueController',
          controllerAs: 'catalogue',
          title: 'Recipe catalogue',
        })
        .when('/recipe/:id', {
          templateUrl: 'templates/detail.html',
          controller: 'DetailController',
          controllerAs: 'detail',
          title: 'Recipe details',
        })
        .when('/collections', {
          templateUrl: 'templates/collections.html',
          controller: 'CollectionsController',
          controllerAs: 'collections',
          title: 'Collections',
        })
        .when('/favourites', {
          templateUrl: 'templates/favourites.html',
          controller: 'FavouritesController',
          controllerAs: 'favourites',
          title: 'Your favourites',
        })
        .when('/planner', {
          templateUrl: 'templates/planner.html',
          controller: 'PlannerController',
          controllerAs: 'planner',
          title: 'Weekly meal planner',
          reloadOnSearch: false,
        })
        .when('/contributors', {
          templateUrl: 'templates/contributors.html',
          title: 'Meet our contributors',
        })
        .when('/contributor/:id', {
          templateUrl: 'templates/profile.html',
          controller: 'ProfileController',
          controllerAs: 'profile',
          title: 'Contributor profile',
        })
        .when('/gallery', {
          templateUrl: 'templates/gallery.html',
          controller: 'GalleryController',
          controllerAs: 'gallery',
          title: 'From our kitchen',
        })
        .when('/about', { templateUrl: 'templates/about.html', title: 'About RecipeNest' })
        .when('/contact', {
          templateUrl: 'templates/contact.html',
          controller: 'ContactController',
          controllerAs: 'contact',
          title: 'Say hello',
        })
        .otherwise({ templateUrl: 'templates/not-found.html', title: 'Page not found' });
    },
  ]);
  app.factory('Catalogue', [
    '$http',
    function ($http) {
      var service = { recipes: [], contributors: [], collections: [], filters: { sort: 'az' } };
      service.ready = $http.get('data/recipes.json').then(function (response) {
        angular.extend(service, response.data);
        return service;
      });
      service.find = function (id) {
        return service.recipes.find(function (r) {
          return r.id === id;
        });
      };
      return service;
    },
  ]);
  app.factory('BrowserStorage', [
    '$window',
    function ($window) {
      return {
        getItem: function (key) {
          return $window.localStorage.getItem(key);
        },
        setItem: function (key, value) {
          $window.localStorage.setItem(key, value);
        },
      };
    },
  ]);
  app.factory('SavedData', [
    'Catalogue',
    'BrowserStorage',
    function (Catalogue, BrowserStorage) {
      var service = { favourites: [], plan: {}, warnings: [] };
      function warn() {
        if (!service.warnings.length)
          service.warnings.push(
            'Browser storage is unavailable or saved data could not be read. You can keep using RecipeNest in this tab; changes may not survive a reload.'
          );
      }
      function read(key, fallback) {
        try {
          var value = BrowserStorage.getItem(key);
          return value === null ? fallback : JSON.parse(value);
        } catch (error) {
          warn();
          return fallback;
        }
      }
      function write(key, value) {
        try {
          BrowserStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          warn();
        }
      }
      service.ready = Catalogue.ready.then(function () {
        var favourites = read('recipenest.favourites.v1', []);
        var plan = read('recipenest.plan.v1', {});
        service.favourites = RecipeLogic.cleanFavourites(favourites, Catalogue.recipes);
        service.plan = RecipeLogic.cleanPlan(plan, Catalogue.recipes);
        if (
          !angular.equals(favourites, service.favourites) ||
          !angular.equals(plan, service.plan)
        ) {
          service.warnings.push(
            'Some saved entries were invalid and were ignored. Your valid favourites and meals are still available.'
          );
        }
      });
      service.has = function (id) {
        return service.favourites.indexOf(id) !== -1;
      };
      service.toggle = function (id) {
        if (!Catalogue.find(id)) return;
        var index = service.favourites.indexOf(id);
        if (index === -1) service.favourites.push(id);
        else service.favourites.splice(index, 1);
        write('recipenest.favourites.v1', service.favourites);
      };
      service.setMeal = function (key, recipeId, servings) {
        if (
          !/^[0-6]-(Breakfast|Lunch|Dinner)$/.test(key) ||
          !Catalogue.find(recipeId) ||
          !RecipeLogic.validServings(servings)
        )
          return false;
        service.plan[key] = { recipeId: recipeId, servings: servings };
        write('recipenest.plan.v1', service.plan);
        return true;
      };
      service.removeMeal = function (key) {
        delete service.plan[key];
        write('recipenest.plan.v1', service.plan);
      };
      return service;
    },
  ]);
  app.controller('ShellController', [
    '$scope',
    '$location',
    '$timeout',
    'Catalogue',
    'SavedData',
    'I18n',
    function ($scope, $location, $timeout, Catalogue, SavedData, I18n) {
      var vm = this;
      vm.data = Catalogue;
      vm.i18n = I18n;
      vm.saved = SavedData;
      vm.menuOpen = false;
      vm.loading = true;
      vm.active = function (path) {
        return path === '/' ? $location.path() === '/' : $location.path().indexOf(path) === 0;
      };
      vm.announce = function (message) {
        vm.message = message;
      };
      vm.toggle = function (recipe) {
        SavedData.toggle(recipe.id);
        vm.messageRecipe = recipe.name;
        vm.announce(
          SavedData.has(recipe.id)
            ? '{recipe} saved to favourites.'
            : '{recipe} removed from favourites.'
        );
      };
      vm.search = function (query) {
        angular.copy({ sort: 'az', query: query || '' }, Catalogue.filters);
        $location.path('/recipes');
      };
      vm.category = function (meal) {
        angular.copy({ sort: 'az', meal: meal }, Catalogue.filters);
      };
      Catalogue.ready.then(
        function () {
          vm.loading = false;
        },
        function () {
          vm.loading = false;
          vm.error =
            'The recipe catalogue could not be loaded. Start the local HTTP server and reload this page.';
        }
      );
      $scope.$on('$routeChangeSuccess', function (event, current) {
        vm.menuOpen = false;
        I18n.title = current.title || 'RecipeNest';
        I18n.updateDocument();
        window.scrollTo(0, 0);
        $timeout(function () {
          var heading = document.querySelector('main h1');
          if (heading) {
            heading.setAttribute('tabindex', '-1');
            heading.focus({ preventScroll: true });
          }
        }, 100);
      });
    },
  ]);
  app.controller('HomeController', [
    'Catalogue',
    function (Catalogue) {
      var vm = this;
      Catalogue.ready.then(function () {
        vm.featured = ['lemon-pasta', 'rainbow-bowl', 'tomato-toast', 'chicken-rice'].map(
          Catalogue.find
        );
      });
    },
  ]);
  app.controller('CatalogueController', [
    '$scope',
    'Catalogue',
    'I18n',
    function ($scope, Catalogue, I18n) {
      var vm = this;
      vm.filters = Catalogue.filters;
      $scope.$on('languageChanged', function () {
        vm.results = I18n.filterRecipes(Catalogue.recipes, vm.filters);
      });
      vm.clear = function () {
        angular.copy({ sort: 'az' }, vm.filters);
      };
      Catalogue.ready.then(function () {
        vm.cuisines = Array.from(
          new Set(
            Catalogue.recipes.map(function (r) {
              return r.cuisine;
            })
          )
        ).sort();
        vm.tags = Array.from(
          new Set(
            [].concat.apply(
              [],
              Catalogue.recipes.map(function (r) {
                return r.tags;
              })
            )
          )
        ).sort();
        $scope.$watch(
          'catalogue.filters',
          function () {
            vm.results = I18n.filterRecipes(Catalogue.recipes, vm.filters);
          },
          true
        );
      });
    },
  ]);
  app.controller('DetailController', [
    '$routeParams',
    'Catalogue',
    'I18n',
    function ($routeParams, Catalogue, I18n) {
      var vm = this;
      Catalogue.ready.then(function () {
        vm.recipe = Catalogue.find($routeParams.id);
        if (!vm.recipe) return;
        vm.servings = vm.recipe.servings;
        vm.calculate();
        vm.author = Catalogue.contributors.find(function (p) {
          return p.id === vm.recipe.contributorId;
        });
        vm.related = Catalogue.recipes
          .filter(function (r) {
            return (
              r.id !== vm.recipe.id &&
              (r.cuisine === vm.recipe.cuisine || r.meal === vm.recipe.meal)
            );
          })
          .slice(0, 3);
        I18n.title = vm.recipe.name;
        I18n.updateDocument();
      });
      vm.calculate = function () {
        vm.calculatorError = '';
        if (!RecipeLogic.validServings(vm.servings)) {
          vm.scaled = [];
          vm.calculatorError = 'Enter a whole number of servings from 1 to 20.';
          return;
        }
        vm.scaled = RecipeLogic.scaleIngredients(vm.recipe, vm.servings);
      };
    },
  ]);
  app.controller('FavouritesController', [
    '$scope',
    'Catalogue',
    'SavedData',
    function ($scope, Catalogue, SavedData) {
      var vm = this;
      SavedData.ready.then(function () {
        $scope.$watchCollection(
          function () {
            return SavedData.favourites;
          },
          function () {
            vm.recipes = Catalogue.recipes.filter(function (r) {
              return SavedData.has(r.id);
            });
          }
        );
      });
    },
  ]);
  app.controller('CollectionsController', [
    'Catalogue',
    function (Catalogue) {
      this.recipesFor = function (collection) {
        return Catalogue.recipes.filter(function (r) {
          return collection.recipeIds.indexOf(r.id) !== -1;
        });
      };
    },
  ]);
  app.controller('ProfileController', [
    '$routeParams',
    'Catalogue',
    function ($routeParams, Catalogue) {
      var vm = this;
      Catalogue.ready.then(function () {
        vm.person = Catalogue.contributors.find(function (p) {
          return p.id === $routeParams.id;
        });
        vm.recipes = Catalogue.recipes.filter(function (r) {
          return r.contributorId === $routeParams.id;
        });
      });
    },
  ]);
  app.controller('PlannerController', [
    '$location',
    '$timeout',
    'Catalogue',
    'SavedData',
    function ($location, $timeout, Catalogue, SavedData) {
      var vm = this;
      vm.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      vm.meals = ['Breakfast', 'Lunch', 'Dinner'];
      vm.saved = SavedData;
      vm.count = function () {
        return RecipeLogic.countMeals(SavedData.plan);
      };
      vm.lookup = Catalogue.find;
      vm.close = function () {
        vm.editing = null;
        $timeout(function () {
          if (vm.trigger && document.contains(vm.trigger)) vm.trigger.focus();
        });
      };
      vm.edit = function (day, meal, event) {
        vm.trigger = event && event.currentTarget;
        vm.editing = day + '-' + meal;
        vm.slotLabel = vm.days[day] + ' · ' + meal;
        var item = SavedData.plan[vm.editing];
        vm.draft = item ? angular.copy(item) : { recipeId: '', servings: 2 };
        vm.error = '';
        vm.notice = '';
        $timeout(function () {
          var el = document.getElementById('plan-recipe');
          if (el) el.focus();
        });
      };
      vm.save = function (form) {
        if (form.$invalid || !SavedData.setMeal(vm.editing, vm.draft.recipeId, vm.draft.servings)) {
          vm.error = 'Choose a recipe and a whole number of servings from 1 to 20.';
          return;
        }
        vm.notice = 'Meal saved to {slot}.';
        vm.close();
      };
      vm.remove = function (key) {
        SavedData.removeMeal(key);
        vm.notice = 'Meal removed. Other planned meals are unchanged.';
      };
      SavedData.ready.then(function () {
        var id = $location.search().recipe;
        var requested = Number($location.search().servings);
        if (Catalogue.find(id)) {
          vm.edit(0, 'Dinner');
          vm.draft.recipeId = id;
          vm.draft.servings = RecipeLogic.validServings(requested)
            ? requested
            : Catalogue.find(id).servings;
        }
        $location.search('recipe', null).search('servings', null);
      });
    },
  ]);
  app.controller('GalleryController', [
    '$timeout',
    'Catalogue',
    function ($timeout, Catalogue) {
      var vm = this;
      vm.items = Catalogue.recipes;
      vm.index = null;
      Catalogue.ready.then(function () {
        vm.items = Catalogue.recipes;
      });
      vm.open = function (index, event) {
        vm.trigger = event.currentTarget;
        vm.index = index;
        $timeout(function () {
          document.getElementById('gallery-close').focus();
        });
      };
      vm.next = function (offset) {
        vm.index = (vm.index + offset + vm.items.length) % vm.items.length;
      };
      vm.close = function () {
        vm.index = null;
        $timeout(function () {
          if (vm.trigger) vm.trigger.focus();
        });
      };
    },
  ]);
  app.controller('ContactController', function () {
    var vm = this;
    vm.fields = {};
    vm.submit = function (form) {
      vm.sent = false;
      if (form.$valid) {
        vm.sent = true;
      }
    };
    vm.reset = function (form) {
      vm.fields = {};
      vm.sent = false;
      form.$setPristine();
      form.$setUntouched();
    };
  });
  app.directive('recipeCard', function () {
    return {
      restrict: 'E',
      scope: { recipe: '=' },
      templateUrl: 'templates/card.html',
      controller: [
        '$scope',
        'SavedData',
        function ($scope, SavedData) {
          $scope.saved = SavedData;
          $scope.toggle = function () {
            SavedData.toggle($scope.recipe.id);
            $scope.$emit('recipeSaved', $scope.recipe);
          };
        },
      ],
    };
  });
  app.run([
    '$rootScope',
    'SavedData',
    function ($rootScope, SavedData) {
      $rootScope.$on('recipeSaved', function (event, recipe) {
        $rootScope.saveRecipeName = recipe.name;
        $rootScope.saveMessage = SavedData.has(recipe.id)
          ? '{recipe} saved to favourites.'
          : '{recipe} removed from favourites.';
      });
    },
  ]);
  // Focus stays inside previews and editors; Escape dismisses, gallery arrow keys move.
  app.directive('modalKeys', [
    '$document',
    function ($document) {
      return {
        link: function (scope, element, attrs) {
          function keydown(event) {
            if (event.key === 'Escape') {
              event.preventDefault();
              scope.$apply(function () {
                scope.$eval(attrs.modalKeys);
              });
            }
            if (attrs.galleryKeys && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
              event.preventDefault();
              scope.$apply(function () {
                scope.$eval(attrs.galleryKeys, { offset: event.key === 'ArrowRight' ? 1 : -1 });
              });
            }
            if (event.key === 'Tab') {
              var nodes = Array.from(
                element[0].querySelectorAll(
                  'a[href], button, input, select, textarea, [tabindex="0"]'
                )
              ).filter(function (el) {
                return !el.disabled && el.offsetParent !== null;
              });
              var first = nodes[0],
                last = nodes[nodes.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }
          }
          var previous = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
          $document.on('keydown', keydown);
          scope.$on('$destroy', function () {
            $document.off('keydown', keydown);
            document.body.style.overflow = previous;
          });
        },
      };
    },
  ]);
})();
