/* Sweet Bakery's round flag disclosure, wired to RecipeNest's existing I18n service. */
(function () {
  'use strict';
  angular.module('recipeNest').directive('languagePicker', [
    '$document',
    function ($document) {
      return {
        restrict: 'E',
        scope: {},
        bindToController: true,
        controllerAs: 'picker',
        require: 'languagePicker',
        templateUrl: 'templates/language-picker.html',
        controller: [
          'I18n',
          function (I18n) {
            this.i18n = I18n;
            this.open = false;
            this.current = function () {
              return I18n.languages.find(function (item) {
                return item.code === I18n.language;
              });
            };
          },
        ],
        link: function (scope, element, attrs, picker) {
          var host = element[0];
          var details = host.querySelector('details');
          var trigger = host.querySelector('summary');
          function choices() {
            return Array.from(host.querySelectorAll('[data-language-code]'));
          }
          function close(returnFocus) {
            details.open = false;
            picker.open = false;
            if (returnFocus) trigger.focus({ preventScroll: true });
          }
          picker.select = function (code) {
            if (picker.i18n.setLanguage(code)) close(true);
          };
          function toggle() {
            scope.$evalAsync(function () {
              picker.open = details.open;
            });
          }
          function outside(event) {
            if (details.open && !host.contains(event.target))
              scope.$evalAsync(function () {
                close(false);
              });
          }
          function keydown(event) {
            if (event.key === 'Escape' && details.open) {
              event.preventDefault();
              scope.$evalAsync(function () {
                close(host.contains(document.activeElement));
              });
              return;
            }
            if (!host.contains(event.target)) return;
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              var buttons = choices();
              var index = buttons.indexOf(document.activeElement);
              var delta = event.key === 'ArrowDown' ? 1 : -1;
              details.open = true;
              scope.$evalAsync(function () {
                picker.open = true;
              });
              if (index === -1) index = delta === 1 ? -1 : 0;
              buttons[(index + delta + buttons.length) % buttons.length].focus();
            } else if (
              details.open &&
              (event.key === 'Home' || event.key === 'End') &&
              !event.ctrlKey &&
              !event.metaKey
            ) {
              event.preventDefault();
              var buttons = choices();
              buttons[event.key === 'Home' ? 0 : buttons.length - 1].focus();
            }
          }
          details.addEventListener('toggle', toggle);
          $document.on('click', outside);
          $document.on('keydown', keydown);
          var removeRouteListener = scope.$on('$routeChangeSuccess', function () {
            close(false);
          });
          scope.$on('$destroy', function () {
            details.removeEventListener('toggle', toggle);
            $document.off('click', outside);
            $document.off('keydown', keydown);
            removeRouteListener();
          });
        },
      };
    },
  ]);
})();
