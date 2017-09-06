
app.directive("signupLoginDir", function(ajaxFetch){
  return{
    restrict: "EA",
    scope: true,
    templateUrl: 'directive_templates/signup-login.html',
    link: function(scope, element, attrs) {

    },
    controller: function($scope, $window){
        $scope.clickSubmit = function(url, form){
            url = 'post' + url;
            form = form || {};

            ajaxFetch.getData(url, 'POST', form).then(function(res){

                if (url.includes('signup')){
                    $scope.signupmessage = res.data.status;
                }
                // login
                else{
                    if (res.data.status === 'valid'){

                        //$window.location.href = 'http://' + $window.location.host + '/createselectproject';
                    }
                    else{
                        $scope.loginmessage = res.data.status;
                    }


                }

            });
        }
    }
  };

});

app.directive("getProjectsDir", function(ajaxFetch){
    return{
        restrict: "EA",
        scope: true,
        templateUrl: 'directive_templates/get-projects.html',
        link: function($scope, element, attrs) {
            $scope.projectnames = [];
            ajaxFetch.getData('/getprojects', 'GET').then(function(res) {
                $scope.projectnames = res.data;

            });

        },
        controller: function($scope, $window){



            $scope.createProject= function(form){
                ajaxFetch.getData('/createproject', 'POST', form).then(function(res) {
                takeToSplash(res.data.project);

                });
            }
            $scope.selectOption = function(project){
                takeToSplash(project);
            }

            function takeToSplash(project){
                $window.location.href = 'http://' + $window.location.host + '/splash' + '#' + project;

            }

        }
    };

});

app.directive("headerBarDir", function(){
    return{
        restrict: "EA",
        scope: {
        },
        templateUrl: 'directive_templates/header-bar.html',
        link: function(scope, element, attrs) {

        }
    };

});


