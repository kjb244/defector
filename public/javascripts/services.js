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