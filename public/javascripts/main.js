var app = angular.module("myApp", ["ngAnimate"], function($interpolateProvider){
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});



app.controller("ctrlSignupLoginPage", function($scope, ajaxFetch) {


});

app.controller("ctrlCreateSelectProjectPage", function($scope, ajaxFetch) {


});

app.controller("ctrlSplashPage", function($scope, ajaxFetch) {


});

//controller for section
app.controller("ctrlSection", function($scope, ajaxFetch, utilityFunctions ) {
  //current route = false on load
  $scope.currRoute = false;


  //get route info from server
  ajaxFetch.getData('/getRoutes').then(function(res){
    $scope.routesObj = res.data;
    $scope.currRoute = $scope.routesObj.default;
    $scope.house = {};
    $scope.house.fillPercent = $scope.routesObj.progress;


  });


  //pressing either click or back on directive form
  $scope.clickSubmit = function(typ, form) {
    typ = typ || 'submit';
    form = form || {};


    if (typ === 'submit'){
      ajaxFetch.getData($scope.currRoute.submit, 'POST', form).then(function(res){
        if (res.data.isValid){
          $scope.currRoute = $scope.routesObj[res.data.nextRoute];
          $scope.house.fillPercent = $scope.currRoute.progress;
        }
      });
    }
    else if (typ === 'back'){
      ajaxFetch.getData($scope.currRoute.back, 'POST', form).then(function(res){
        if (res.data.isValid){
          $scope.currRoute = $scope.routesObj[res.data.prevRoute];
          $scope.house.fillPercent = $scope.currRoute.progress;
        }
      });
    }
  
  };




   
});


