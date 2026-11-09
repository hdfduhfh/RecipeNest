/* Presentation effects only; route and form behaviour remains in AngularJS. */
(function () {
  'use strict';
  angular.module('recipeNest').directive('rnPageMotion', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    return {
      restrict: 'A',
      link: function (scope, element) {
        var observer, mutations, timer, routeTimer;
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        var view = element[0];
        function reveal() {
          if (reduced.matches || !window.IntersectionObserver) return;
          if (!observer) observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('rn-visible');
                observer.unobserve(entry.target);
              }
            });
          }, { threshold: 0.06 });
          view.querySelectorAll('.recipe-card, .collection-tile, .profile-card, .planner-promo, .kitchen-note').forEach(function (card) {
            if (card.classList.contains('rn-reveal')) return;
            // Content already on screen remains visible, including keyboard targets.
            if (card.getBoundingClientRect().top < window.innerHeight) return;
            card.classList.add('rn-reveal');
            observer.observe(card);
          });
        }
        function ready() {
          document.body.classList.remove('rn-routing');
          $timeout.cancel(routeTimer);
          view.classList.remove('rn-route-enter');
          void view.offsetWidth;
          view.classList.add('rn-route-enter');
          if (observer) observer.disconnect();
          if (mutations) mutations.disconnect();
          reveal();
          mutations = new MutationObserver(function () {
            $timeout.cancel(timer);
            timer = $timeout(reveal, 40, false);
          });
          mutations.observe(view, { childList: true, subtree: true });
        }
        var stopStart = $rootScope.$on('$routeChangeStart', function () {
          document.body.classList.add('rn-routing');
          $timeout.cancel(routeTimer);
          routeTimer = $timeout(function () { document.body.classList.remove('rn-routing'); }, 8000, false);
        });
        var stopView = scope.$on('$viewContentLoaded', ready);
        var stopError = $rootScope.$on('$routeChangeError', function () { document.body.classList.remove('rn-routing'); });
        function focus(event) {
          var card = event.target.closest('.rn-reveal');
          if (card) card.classList.add('rn-visible');
        }
        function click(event) {
          var button = event.target.closest('button, .button');
          if (!button || button.disabled || reduced.matches) return;
          button.classList.remove('rn-click-pulse');
          void button.offsetWidth;
          button.classList.add('rn-click-pulse');
        }
        function ended(event) { event.target.classList.remove('rn-click-pulse'); }
        document.addEventListener('click', click);
        document.addEventListener('animationend', ended);
        view.addEventListener('focusin', focus);
        scope.$on('$destroy', function () {
          stopStart(); stopView(); stopError();
          $timeout.cancel(timer); $timeout.cancel(routeTimer);
          if (observer) observer.disconnect();
          if (mutations) mutations.disconnect();
          document.body.classList.remove('rn-routing');
          document.removeEventListener('click', click);
          document.removeEventListener('animationend', ended);
          view.removeEventListener('focusin', focus);
        });
      }
    };
  }]);
})();
