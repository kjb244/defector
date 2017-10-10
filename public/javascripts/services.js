app.service('utilityFunctions', function(){

  this.getQueryParams =  function(){
    var hash = window.location.hash;
    var matchArr = hash.match(/(\?)(.*)/);
    if (matchArr && matchArr[2]){
      return matchArr[2].split('&')
      .map(function(e){ return [e.split('=')[0], e.split('=')[1]]})
      .reduce(function(e,i,a){e[i[0]]= i[1]; return e},{});

    }
    return false;
  }

  this.getHeight = function(selector){
    var qs = document.querySelector(selector);
    if (!qs) return 0;
    var topMargin = window.getComputedStyle(qs).getPropertyValue('margin-top').replace('px', '');
    var bottomMargin = window.getComputedStyle(qs).getPropertyValue('margin-bottom').replace('px', '');
    var height = qs.clientHeight;
    return parseInt(topMargin) + parseInt(bottomMargin) + height;
  }

  this.initBrowserNotifications = function(){
      if (!("Notification" in window)) {
          alert("This browser does not support desktop notification");
      }

      // Otherwise, we need to ask the user for permission
      else if (Notification.permission !== "denied") {
          Notification.requestPermission(function (permission) {
          });
      }
  }

  this.sendBrowserNotification = function(title, options){
    title = title || '';
    options = options || {};
    if (title !== '' && options.length !== 0 ){
      var n = new Notification(title, options);
      setTimeout(n.close.bind(n), 4000);
    }
  }

});



app.service("ajaxFetch", function($http) {
  this.getData= function(endpoint, type, data){
    endpoint = endpoint;
    type = type || 'GET';
    data = data || {};

    if('GET' === type){
      return $http.get(endpoint, {params: data});
    }
    else if ('POST' === type){


      return $http.post(endpoint, { 'data': data} , { headers: { 'Content-Type': 'application/json' } } );
    }

    
  }

});