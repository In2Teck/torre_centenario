$(document).on("ready", onReady);

function onReady() {
  if (isIECompatible()) {
    loadFB();
  }
  else {
    window.location = '/ie8.html';
  }
}

function isIECompatible() {
  var compatible = true;
  var browser = (function() {
    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
      var ua = navigator.userAgent;
      var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
      if (re.exec(ua) != null)
        rv = parseFloat( RegExp.$1 );
   }
   return rv;
  })();

  if (browser > -1) {
    if (browser < 9) {
      compatible = false;
    }
  }
  return compatible
}

function loadFB() {
  window.fbAsyncInit = function() {
    // init the FB JS SDK
    FB.init({
      appId      : '132164533632870', // App ID from the App Dashboard
      channelUrl : 'http://apps.t2omedia.com.mx/channel.html', // Channel File for x-domain communication
      status     : true, // check the login status upon init?
      cookie     : true, // set sessions cookies to allow your server to access the session?
      xfbml      : true  // parse XFBML tags on this page?
    });

    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        if ($('#ruby-session').data("session")) {
          $(document).trigger('fbLoaded');
        }
        else {
          $.ajax({
            beforeSend: function( xhr ) {
              var token = $('meta[name="csrf-token"]').attr('content');
              if (token) xhr.setRequestHeader('X-CSRF-Token', token);
            }, 
            type: "GET",
            url: "/users/auth/facebook/callback?signed_request=" + $('#ruby-values').data("signed-request"),
            success: function(data, textStatus, jqXHR) {
              $(document).trigger('updateData', data);   
            },
            error: function() {
            } 
          });
          //window.location.href = '/users/auth/facebook/callback?signed_request=' + $('#ruby-values').data("signed-request");
        }
      } else if (response.status === 'not_authorized') {
        login();
      } else {
        login();
      }
     });
    };

  // Load the SDK's source Asynchronously
  // Note that the debug version is being actively developed and might 
  // contain some type checks that are overly strict. 
  // Please report such bugs using the bugs tool.
  (function(d, debug){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/es_LA/all" + (debug ? "/debug" : "") + ".js";
     ref.parentNode.insertBefore(js, ref);
   }(document, /*debug*/ false));
}

function login() {
 FB.login(function(response) {
    if (response.authResponse) {
      FB.api('/me/feed', 'post', 
        {name: 'MÁS CERCA DEL CIELO', 
        message: 'Mi camino para estar MÁS CERCA DEL CIELO ha comenzado y puedo ser 1 de los asistentes al concierto de FUN y MARTIN SOLVEIG',
        link: 'http://boletos.centenario.com/',
        description: ' ',
        picture: 'http://boletos.centenario.com/assets/web/75x75.png'
      });

      $.ajax({
        type: "GET",
        url: "/users/auth/facebook/callback?signed_request=" + response.authResponse.signedRequest,
        success: function(data, textStatus, jqXHR) {
          $(document).trigger('updateData', data);   
        },
        error: function() {
        } 
      });
    } else {
      // cancelled
    }
  }, {scope: 'email,user_likes,publish_actions'});
  
}
