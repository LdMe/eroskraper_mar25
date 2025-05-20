(function() {
	define(["jquery", "common/cookiesManager"], function($,cm) {
		
		function readCookie(name) {
			return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + name.replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
		}
		
		var cookieDirectAccess = function(closeBtDirectAccess){			
			$(closeBtDirectAccess).on('click', function (e) {
				if( e ){
					e.preventDefault();
				}
				
				// Leemos la cookie
				var miCookie = readCookie( "supermarket.direct_access" );
				if(miCookie){
					document.cookie = "supermarket.direct_access=false";
				}				
				
				$(".add-to-home").removeClass("active");
			});
		};
		
		var showCookieDirectAccess = function(isHome){
			// Leemos la cookie
			var miCookie = readCookie( "supermarket.direct_access" );
			var download = readCookie( "supermarket.download_da" );
			
			if(miCookie == "true" && isHome && download != "true"){
				$(".add-to-home").addClass("active");
			}
		};
		
		var _initCloseLayerEvents = function(closeBtSelector, closeBtDirectAccess){
			$(closeBtSelector).on('click', function (e) {
				if( e ){
					e.preventDefault();
				}			
				var thisLayer = $(this).closest(".layer_policy_acceptance");
				thisLayer.removeClass('visible');
				otherLayer(thisLayer).addClass('maximized');
			});
		};
		
		var _initButonLayerEvents = function(){
			$(".layer_policy_acceptance .read-more").on('click', function (e) {
				if( e ){
					e.preventDefault();
				}
				$(".layer_policy_acceptance").css('bottom', 0);
				$(this).closest(".layer_policy_acceptance").addClass('maximized');
			});
		};
		
		function _initCookies(cookies, cookieValue, exdays, layerSelector) {
			$.each(cookies, function(index, value) {
				_fnCookies(index, value, cookieValue, exdays, layerSelector);
			});
		}
		
		var _fnCookies = function (position, cookieName, cookieValue, exdays, layerSelector) {	
			var thisLayer = $($(layerSelector)[position]);
			if( !cm.getCookie(cookieName) ) {
				thisLayer.addClass('visible');
				cm.setCookie(cookieName, cookieValue, exdays, "/");
			} else {
				otherLayer(thisLayer).addClass('maximized');
			}
		};
		
		var _initLopdBottom = function(){
			$('.layer-lopd').css('bottom',$('.layer-cookies').outerHeight());
			
			$(window).on('resize', function() {
				$('.layer-lopd').css('bottom',$('.layer-cookies').outerHeight());
			});
		};
		
		function otherLayer(layer) {
			return $('.layer_policy_acceptance').not(layer);
		}
		
		var abrirAccesoDirecto = function(){
			var hideInstallPromotion = function() {
				var x = document.getElementsByClassName("add-to-home");
  				x[0].classList.remove("active");
			}
			
			$('.text-home').on('click', function() {
				  // Hide the app provided install promotion
				  hideInstallPromotion();
				  // Show the install prompt
				  deferredPrompt.prompt();
				  // Optionally, send analytics event with outcome of user choice
				  console.log(`User response to the install`);
				  // We've used the prompt, and can't use it again, throw it away
				  deferredPrompt = null;
				  //save cookie download
				  var download = "true";
				  document.cookie = "supermarket.download_da=" + encodeURIComponent( download );
				});
		};
		
		var _init = function (cookiesCookieName, dataProtectionCookieName, cookieValue, exdays, layerSelector, closeBtSelector, closeBtDirectAccess, isHome) {
			_initCloseLayerEvents(closeBtSelector);
			_initButonLayerEvents();
			var cookies = [cookiesCookieName, dataProtectionCookieName];
			_initCookies(cookies, cookieValue, exdays, layerSelector);
			_initLopdBottom();
			showCookieDirectAccess(isHome);
			cookieDirectAccess(closeBtDirectAccess);
			abrirAccesoDirecto();
		};

		return {
			init : _init
		};

	});

}).call(this);
