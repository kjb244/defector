
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

                if (url.indexOf('signup') > -1){
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

app.directive("chatDir", function(ajaxFetch, utilityFunctions){
    return{
        restrict: "EA",
        scope: {chatGetComplete: '='},
        templateUrl: 'directive_templates/chat.html',
        link: function($scope, element, attrs) {
            var payload = {hash: window.location.hash.substr(1)};
            ajaxFetch.getData('/getchatdata', 'GET', payload).then(function(res) {
                $scope.chatarr = res.data.comments;
                $scope.user = res.data.user;
                $scope.chatGetComplete = true;
                setTimeout(function() {
                    scrollToBottom();
                },200);

            });

            socket.on('chat message', function(msg){
                $scope.chatarr.push(msg);
                scrollToBottom();
                if($scope.user === msg.user){
                    $scope.form.message = '';
                    document.getElementById('message').focus();
                }
                else{
                    utilityFunctions.sendBrowserNotification('New Chat', {body: 'From: ' + msg.user, icon: '/images/info_icon.png'});
                }
                $scope.$apply();


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

app.directive("defectStatusDir", function(ajaxFetch, utilityFunctions){
    return{
        restrict: "EA",
        scope: true,
        templateUrl: 'directive_templates/defect-status.html',
        link: function($scope, element, attrs) {
            var payload = {hash: window.location.hash.substr(1)};
            ajaxFetch.getData('/getdefects', 'GET', payload).then(function(res) {
                $scope.defects = res.data.defects;
                $scope.user = res.data.user;


            });

            socket.on('claim update', function(pl){
                var payload = pl.data;
                var touchedBy = pl.touchedBy;
                var idx = findRecordId(payload);
                $scope.defects[idx] = payload;
                if ($scope.user !== touchedBy){
                    utilityFunctions.sendBrowserNotification('New Claim',
                        {body: touchedBy + ' claimed ' + payload.name,
                        icon: '/images/info_icon.png'
                        }
                    );
                }
                $scope.$apply();


            });

            socket.on('note update', function(pl){
                var payload = pl.data;
                var touchedBy = pl.touchedBy;
                var idx = findRecordId(payload);
                $scope.defects[idx].notes = payload.notes;
                if ($scope.user !== touchedBy){
                    utilityFunctions.sendBrowserNotification('New Note',
                        {body: touchedBy + ' updated note on ' + payload.name,
                            icon: '/images/info_icon.png'
                        }
                    );
                }
                $scope.$apply();

            });

            socket.on('change status', function(pl){
                var payload = pl.data;
                var touchedBy = pl.touchedBy;
                var idx = findRecordId(payload);
                $scope.defects[idx].status = payload.status;
                $scope.defects[idx].claimedBy = payload.claimedBy;
                if ($scope.user !== touchedBy){
                    utilityFunctions.sendBrowserNotification('Status Update',
                        {body: touchedBy + ' updated status on ' + payload.name,
                            icon: '/images/info_icon.png'
                        }
                    );
                }
                $scope.$apply();

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

            $scope.showRow = function(rec){
                if ($scope.search === '') return true;

                var search = $scope.search.toLowerCase();

                return rec.name.toLowerCase().indexOf(search) > -1 ||
                        rec.description.toLowerCase().indexOf(search) > -1 ||
                        rec.notes.toLowerCase().indexOf(search) > -1 ||
                        $scope.getNameFromEmail(rec.claimedBy).toLowerCase().indexOf(search) > -1;
            }

            $scope.getNameFromEmail = function(user){
                user = user || '';
                var arr = user.split('.');
                if (arr.length > 1){
                    return arr[0].substring(0,1) + arr[1].substring(0,1);
                }
                return user.substring(0,2);
            }

            $scope.searchFilter = function(result){
                return true;
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
                var payload = {
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
                var claimedBy = user;
                if (newStatus === 'relinquish') {
                    newStatus = 'open';
                    claimedBy = '';
                }
                else {
                    claimedBy = user;
                }


                var payload = {
                    hash: window.location.hash.substring(1),
                    currRow: $scope.defects[idx],
                    status: newStatus,
                    claimedBy: claimedBy
                }
                ajaxFetch.getData('/changestatus', 'POST', payload).then(function(res) {
                    redirect(res);
                });
            }

            $scope.noteUpdate = function(rec){
                var idx = findRecordId(rec);
                var payload = {
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
        scope: {heading: '@heading', avatars: '=avatars'},
        templateUrl: 'directive_templates/header-bar.html',
        link: function(scope, element, attrs) {

        }
    };

});


