(function () {
  'use strict';
  angular.module('recipeNest').directive('recipeChat', function () {
    return {
      restrict: 'E',
      scope: {},
      bindToController: true,
      controllerAs: 'chat',
      templateUrl: 'templates/chat.html',
      controller: [
        '$timeout',
        '$element',
        '$scope',
        'Catalogue',
        'I18n',
        function ($timeout, $element, $scope, Catalogue, I18n) {
          var vm = this,
            generation = 0,
            lastRequest = null;
          vm.i18n = I18n;
          vm.messages = [];
          vm.draft = '';
          vm.isOpen = false;
          vm.busy = false;
          vm.connected = false;
          vm.t = function (key, params) {
            return RecipeChat.text(I18n.language, key, params);
          };
          vm.recipeText = function (value) {
            return I18n.t(value);
          };
          vm.quickKeys = ['quick', 'veggie', 'help'];
          function focusInput() {
            $timeout(function () {
              var input = $element[0].querySelector('textarea');
              if (vm.isOpen && input) input.focus();
            });
          }
          function scroll() {
            $timeout(function () {
              var log = $element[0].querySelector('.nest-chat-log');
              if (log) log.scrollTop = log.scrollHeight;
            });
          }
          vm.toggle = function () {
            vm.isOpen = !vm.isOpen;
            if (vm.isOpen) focusInput();
            else
              $timeout(function () {
                $element[0].querySelector('.nest-chat-launcher').focus();
              });
          };
          vm.followRecipe = function () {
            vm.isOpen = false;
          };
          vm.clear = function () {
            generation += 1;
            vm.messages = [];
            vm.draft = '';
            vm.busy = false;
            vm.error = '';
            lastRequest = null;
            focusInput();
          };
          function append(response) {
            var validIds = Array.isArray(response.recipeIds) ? response.recipeIds : [];
            vm.messages.push({
              role: 'assistant',
              text: response.answer,
              mode: response.mode,
              recipes: validIds
                .map(function (id) {
                  return Catalogue.find(id);
                })
                .filter(Boolean),
              planner: response.planner === true,
            });
            scroll();
          }
          function run(request) {
            vm.busy = true;
            vm.error = '';
            var token = generation;
            Catalogue.ready.then(
              function () {
                if (token !== generation) return;
                append(
                  RecipeChat.guide(
                    Catalogue.recipes,
                    request.message,
                    request.language,
                    request.previousIds
                  )
                );
                vm.busy = false;
                focusInput();
              },
              function () {
                if (token === generation) {
                  vm.busy = false;
                  vm.error = vm.t('unavailable');
                }
              }
            );
          }
          vm.send = function (suggestion) {
            if (vm.busy) return;
            var message = (suggestion || vm.draft).trim();
            if (!message) return;
            if (message.length > 2000) {
              vm.error = vm.t('tooLong');
              return;
            }
            var previous = vm.messages
              .filter(function (m) {
                return m.role === 'assistant' && m.recipes && m.recipes.length;
              })
              .slice(-1)[0];
            lastRequest = {
              message: message,
              language: I18n.language,
              history: vm.messages.slice(-8).map(function (m) {
                return { role: m.role, content: m.text.slice(0, 6000) };
              }),
              previousIds: previous
                ? previous.recipes.map(function (r) {
                    return r.id;
                  })
                : [],
            };
            vm.messages.push({ role: 'user', text: message });
            vm.draft = '';
            scroll();
            run(lastRequest);
          };
          vm.retry = function () {
            if (lastRequest && !vm.busy) run(lastRequest);
          };
          vm.keydown = function (event) {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.isComposing &&
              event.keyCode !== 229
            ) {
              event.preventDefault();
              vm.send();
            }
          };
          function escape(event) {
            if (event.key === 'Escape' && vm.isOpen && $element[0].contains(event.target))
              $scope.$apply(function () {
                vm.toggle();
              });
          }
          $element[0].addEventListener('keydown', escape);
          $scope.$on('$destroy', function () {
            generation += 1;
            $element[0].removeEventListener('keydown', escape);
          });
        },
      ],
    };
  });
})();
