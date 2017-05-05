;(()=> {'use strict';

/*
Socket event flow: lhs = backend, rhs = frontend
0. normal: > force back to normal state
1. slide: > home updates slide image
2. shoot: > prepares the camera, preview.jpg is now ready.
3. capture: < takes a still shot
4. shot: > photo is captured
5. print: < start printing
5. printing: > print job is sent to queue
6. printed: > print job is finished
*/

let app = angular.module('photobox', [
  'ngRoute',
  'ngWebsocket'
]);

let wsConfig = {
  url: 'ws://127.0.0.1/ws',
  enqueue: true
};

app.config(($routeProvider)=> {
  $routeProvider
    .when('/home', {
      /**
       * Play slideshow of printed photos and waits for button push.
       */
      controller: function HomeController($websocket, $scope) {
        let socket = $websocket.$new(wsConfig);

        socket.$on('slide', v => {ctx.slideUrl = v.url});
        socket.$on('press', ()=> {
          location.hash = '!/shoot';
          socket.$un('press');
        });
      },
      controllerAs: '$controller',
      templateUrl: 'home.html'
    })
    .when('/shoot', {
      /**
       * Display countdown and tell users to smile.
       */
      controller: function ShootController($websocket, $timeout) {
        let socket = $websocket.$new(wsConfig);
        let ctx = this;

        ctx.counter = 5;
        $timeout(function countdown() {
          if (--ctx.counter) {
            $timeout(countdown, 1000);
          }
          else {
            delete ctx.counter;
            socket.$emit('capture');
          }
        }, 1000);
      },
      controllerAs: '$controller',
      templateUrl: 'shoot.html'
    })
    .when('/preview', {
      /**
       * User previews the photo captured, then either
       * 1. pushes the physical button to print, or
       * 2. tab the back button on screen to retake.
       */
      controller: function($websocket, $scope) {
        let socket = $websocket.$new(wsConfig);

        this.timestamp = Date().now();

        socket.$on('press', ()=> {
          socket.$emit('print');
          socket.$un('press');
        });
        // $scope.$on('$destroy', ()=> {socket.$un('press')});
      },
      controllerAs: '$controller',
      templateUrl: 'preview.html'
    })
    .when('/printing', {
      /**
       * Photobox applies overlay and sends the job to printer.
       */
      templateUrl: 'printing.html'
    })
    .when('/done', {
      /**
       * Tells the user to grab their printed photo
       */
      controller: function DoneController($timeout, $scope) {
        let timeout = $timeout(()=> {location.hash = '!/home'}, 10000);

        $scope.$on('$destroy', ()=> {$timeout.cancel(timeout)});
      },
      templateUrl: 'done.html'
    })
    .otherwise({ redirectTo: '/home' });
});

app.run(($websocket, $window)=> {
  let socket = $websocket.$new(wsConfig);

  socket.$on('normal', ()=> {location.hash = '!/home'});
  socket.$on('shoot', ()=> {location.hash = '!/shoot'});
  socket.$on('shot', ()=> {location.hash = '!/preview'});
  socket.$on('printing', ()=> {location.hash = '!/printing'});
  socket.$on('printed', ()=> {location.hash = '!/done'});
});

})();
