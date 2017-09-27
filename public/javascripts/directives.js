
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

                        $window.location.href = 'http://' + $window.location.host + '/createselectproject';
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

app.directive("chatDir", function(ajaxFetch){
    return{
        restrict: "EA",
        scope: true,
        templateUrl: 'directive_templates/chat.html',
        link: function($scope, element, attrs) {
            let payload = {hash: window.location.hash.substr(1)};
            ajaxFetch.getData('/getchatdata', 'GET', payload).then(function(res) {
                $scope.chatarr = res.data;
                setTimeout(function() {
                    scrollToBottom();
                },200);

            });

            socket.on('chat message', function(msg){
                $scope.chatarr.push(msg);
                scrollToBottom();
                $scope.form.message = '';
                document.getElementById('message').focus();

            })

            function scrollToBottom(){
                setTimeout(function(){
                    var chatDiv = document.getElementsByClassName('chats')[0];
                    chatDiv.scrollTop = chatDiv.scrollHeight;
                },100);

            }


        },
        controller: function($scope, $window){
            $scope.submitMessage = function(form){
                form.hash = window.location.hash.substring(1);
                ajaxFetch.getData('/submitmessage', 'POST', form).then(function(res) {


                });
            }

        }
    };

});

app.directive("defectStatusDir", function(ajaxFetch){
    return{
        restrict: "EA",
        scope: true,
        templateUrl: 'directive_templates/defect-status.html',
        link: function($scope, element, attrs) {
            let payload = {hash: window.location.hash.substr(1)};
            ajaxFetch.getData('/getdefects', 'GET', payload).then(function(res) {
                $scope.defects = res.data.defects;
                console.log($scope.defects);
                $scope.user = res.data.user;


            });

            socket.on('claim update', function(payload){
                var idx = findRecordId(payload);
                $scope.defects[idx] = payload;


            });

            socket.on('note update', function(payload){
                var idx = findRecordId(payload);
                $scope.defects[idx].notes = payload.notes;

            });

            socket.on('change status', function(payload){
                var idx = findRecordId(payload);
                $scope.defects[idx].status = payload.status;
                $scope.defects[idx].claimedBy = payload.claimedBy;

            });

            function findRecordId(details){
                return $scope.defects.findIndex(function(e){ return e.name === details.name &&
                    e.description === details.description});

            }


        },
        controller: function($scope, $window){

            function findRecordId(details){
                return $scope.defects.findIndex(function(e){ return e.name === details.name &&
                    e.description === details.description});

            }

            function redirect(payload){
                if (payload.data.redirectUrl){
                    window.location = payload.data.redirectUrl;
                }
            }


            $scope.orderUserStatus= function(rec){
                if (rec.claimedBy === $scope.user){
                    switch(rec.status){
                        case 'open':
                            return 1;
                        case 'claimed':
                            return 2;
                        case 'completed':
                            return 5;
                    }
                }
                switch(rec.status){
                    case 'open':
                        return 3;
                    case 'claimed':
                        return 4;
                    case 'completed':
                        return 6;
                }

            }

            $scope.claimItem = function(rec){
                let payload = {
                    hash: window.location.hash.substring(1),
                    claimed: $scope.user,
                    currRow: rec
                }
                ajaxFetch.getData('/claimchange', 'POST', payload).then(function(res) {
                    redirect(res);

                });
            }

            $scope.changeStatus = function(rec, status){
                var idx = findRecordId(rec);
                var user = $scope.user;
                var newStatus = status;
                if (newStatus === 'relinquish') {
                    user = '';
                    if ($scope.defects[idx].claimedBy !== ''){
                        newStatus = 'claimed';
                    }
                    else{
                        newStatus = 'open';
                    }
                }


                let payload = {
                    hash: window.location.hash.substring(1),
                    currRow: $scope.defects[idx],
                    status: newStatus,
                    user: user
                }
                ajaxFetch.getData('/changestatus', 'POST', payload).then(function(res) {
                    redirect(res);
                });
            }

            $scope.noteUpdate = function(rec){
                var idx = findRecordId(rec);
                let payload = {
                    hash: window.location.hash.substring(1),
                    currRow: $scope.defects[idx]
                }
                ajaxFetch.getData('/notechange', 'POST', payload).then(function(res) {
                    redirect(res);
                });
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


