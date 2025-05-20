
//<script type="text/javascript" nonce="m73JkZqWTwzR2IoUYVOMyQ==">
if (typeof console === "undefined") {
	console = {
		log: function() { },
		debug: function() { },
		dir: function() { }
	};
}

/*indexOf to IE*/
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/)  {
        var len = this.length >>> 0;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);

        if (from < 0) from += len;
        for (; from < len; from++) {
            if (from in this && this[from] === elt)
                return from;
        }
        return -1;
    };
}

function getBaseUrl() {
	url_site = document.location.href;
	url_split = url_site.split('/');
	if (url_split.length < 5) {
		return url_split[0] + '//'  + url_split[2];
	}
	return url_split[0] + '//'  + url_split[2] + '/' + url_split[3];
}

function replaceLanguageInUrl(language, redirect) {
	console.log("replaceLanguageInUrl");
	var url = document.location.href;
	var url_base = getBaseUrl();
	url = url.replace(url_base+'/es/', url_base+'/');
	url = url.replace(url_base+'/ca/', url_base+'/');
	url = url.replace(url_base+'/eu/', url_base+'/');
	url = url.replace(url_base+'/gl/', url_base+'/');
	url = url.replace(url_base+'/en/', url_base+'/');
	url = url.replace(url_base+'/de/', url_base+'/');
	url = url.replace(url_base, url_base+'/'+language);
	if (url != document.location.href && redirect) {
		window.location.href = url;
	}
	return url;
}

function topMenuDesplCAS(e) {
	e.preventDefault();
	$(this).find('li a.despl').parents('li').toggleClass('active');
	$(this).find('li a.despl').parents('li').siblings('li').stop().slideToggle();
}
function clickTopMenuCAS(e) {
	e.preventDefault();
	if ($(this).children('.submenu,.submenuNoClub').length != 0 ) {
		$(this).children('.submenu,.submenuNoClub').slideToggle(400, function(){
			$(this).toggleClass('active');
		});
	}
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
	}
	return "";
}
function setCookie(cname, cvalue, exdays) {
	if (!!exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays*24*60*60*1000));
		var expires = "expires="+d.toGMTString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
	} else {
		document.cookie = cname + "=" + cvalue + ";";
	}
}
function deleteCookie(cname) {
	document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

/**
 * El componente CAS.
 */
var CAS = CAS || (function () {
	var sso_url = 'https://areacliente.eroski.es/areacliente/';
	var user_id = '';
// 	var user_name = '';
	var user_name = '';
	var user_fbid='';
	var user_fullname='';
	var ticket_st = '';
	var fromUrl='';
	var ticket_tgt = '';
	var service = window.location.href;
	var client_url = window.location.href;
	var onLogout = false;
	var onChangeLanguage = replaceLanguageInUrl;
	var onReadyCasScript = function(){console.log("onReadyCasScriptDefault")};
	var redirectOnChangeLanguage = true;
	var useLayer = false;
	this.checkLoggedIn = function() { };
	this.checkLoggedOut = function() { };
	var loadMenu = false;
	var loadMenuCss = true;
	var menuContainer = '#topHeader';
	var langList = ['ca','de','gl','en','es','eu'];
	var language = 'es'|'es';
	var links = {
			'compras' : false,
			'favoritos' : false,
			'listas' : false,
			'servicios' : false
		};
	
	// Configurción del método de showLogin.
	var
		REDIRECT_LOGIN = 'REDIRECT_LOGIN',
		POPUP_LOGIN = 'POPUP_LOGIN',
		AJAX_LOGIN = 'AJAX_LOGIN',
		showLoginMethod = AJAX_LOGIN,
		onBeforeAjaxLogin = null,
		onAjaxLoginOK = null,
		onAjaxLoginFail = null,
		onAjaxLoginError = null,
		
		// Función para suministrar los parámetros a showLogin cuando showLoginMethod es 
		// AJAX_LOGIN.
		getAjaxLoginParams = null,
		
		// Selector del form interno.
		formSelector = '#registro_top_form';
		
	this.link = function(linkop) {
		var _link = links[linkop];
		if (typeof _link == "function") {
			try {
				_link.call({}, user_id, user_fbid);
			} catch (e) {
				console.log(e);
			}
		} else if (typeof _link == "string") {
			location.href = _link;
		}
	}

	this.config = function(cfg) {
		console.log("--- CAS config() ---");
		if (cfg) {
			if (typeof cfg.onChangeLanguage == "function") onChangeLanguage = cfg.onChangeLanguage;
			if (typeof cfg.onTopmenuLoad == "function") onTopmenuLoad = cfg.onTopmenuLoad;
			if (typeof cfg.onLogout == "function" || typeof cfg.onLogout == "string") onLogout = cfg.onLogout;
			if (typeof cfg.redirectOnChangeLanguage == "boolean") redirectOnChangeLanguage = cfg.redirectOnChangeLanguage;
			if (typeof cfg.loadMenu == "boolean") loadMenu = cfg.loadMenu;
			if (typeof cfg.loadMenuCss == "boolean") loadMenuCss = cfg.loadMenuCss;
			if (typeof cfg.menuContainer == "string") menuContainer = cfg.menuContainer;
			if (typeof cfg.languageList == "string") {
				var langSplit = cfg.languageList.split(",");
				langList = new Array();
				for (index = 0; index < langSplit.length; ++index) {
					var language = langSplit[index].trim();
					var langPattr = /((ca|de|gl|en|es|eu)(_[A-Z]{2})?)/g;
					if (langPattr.test(language)) {
						langList.push(language.substring(0,2));
					}
				}
			}
			if (cfg.links instanceof Object) {
				links['compras'] = cfg.links['compras'];
				links['favoritos'] = cfg.links['favoritos'];
				links['listas'] = cfg.links['listas'];
				links['servicios'] = cfg.links['servicios'];
			}
			if (typeof cfg.language == "string") {
				var lang = cfg.language.substring(0,2);
				if (langList.indexOf(lang) >= 0) this.language = lang;
			}
			if (typeof cfg.service == "string") service = cfg.service;
			
			// Configuración método showLogin.
			if (cfg.showLoginMethod != null) {
				showLoginMethod = cfg.showLoginMethod;
			}
			
			this.onAjaxLoginFail = cfg.onAjaxLoginFail;
			this.onAjaxLoginError = cfg.onAjaxLoginError;
			this.onBeforeAjaxLogin = cfg.onBeforeAjaxLogin;
			this.onAjaxLoginOK = cfg.onAjaxLoginOK;
			
			if (typeof cfg.checkLoggedIn == "function" || typeof cfg.checkLoggedIn == "string") this.checkLoggedIn = cfg.checkLoggedIn;
			if (typeof cfg.checkLoggedOut == "function" || typeof cfg.checkLoggedOut == "string") this.checkLoggedOut = cfg.checkLoggedOut;

			
			if (typeof cfg.fromUrl == "string") this.fromUrl = cfg.fromUrl;
		}
		if (loadMenu && !!menuContainer) {
			if (loadMenuCss) { // load now!
				var url_css = this.getUrl("resources/css/topmenu.css?x=4815162342108");
				if (document.createStyleSheet){
					document.createStyleSheet(url_css);
				} else {
					$("head").append($("<link rel='stylesheet' href='"+url_css+"' type='text/css' media='screen' />"));
				}
			}
		}
		console.log(new Date());
		return this;
	};
	this.ready = function(_callbackReady) {
		this.onReadyCasScript = _callbackReady;
	};

	/**
	 * Retorna true si los campos del form son válidos. False en otro caso.
	 */
	this.validateFormFields = function(form) {
		return true;
	}
	
	this.init = function() {
		console.log("--- CAS init() ---");
		if (loadMenu && !!menuContainer) {
			// Mostrar el menu en la cabecera.
			//$.getScript( this.getUrl("topmenu.js") );
			this.loadTopMenu();	
			
		}
		
		// Capturar el evento submit del form interno.
		$('body').on('submit', formSelector, $.proxy(function() {
			//this.processFormSubmit($(formSelector));
			//return false;
		}, this));
		
		$(".CASLoginButton").off("click").on("click", function(){CAS.showLogin()});
		$(".CASRegisterButton").off("click").on("click", function(){CAS.showRegisterForm()});
		$(".CASUsername").text(user_fullname);
		
		if (typeof this.onReadyCasScript == "function") {
			try {
				this.onReadyCasScript.call({});
			} catch (e) {
				console.log(e);
			}
		}
	}

	/**
	 * Cargar el menu en la cabecera.
	 */
	this.loadTopMenu = function() {
		console.log('NOT logged in...'); this.checkLoggedOut();
		var tmplang=this.language;
		if (typeof tmplang == "undefined") 
			tmplang="";

		var
			url = this.getUrl(tmplang+'/topmenu.js?site=eco&language='+tmplang),
			lang = 'es';

        if ('XDomainRequest' in window && window.XDomainRequest !== null) {
            var protocol = '' == 'https' ? 'https:' : 'http:';
            var old_protocol = protocol == 'https:' ? 'http:' : 'https:';
            if(!url.indexOf(protocol) > -1) {
                url = url.replace(old_protocol, protocol);
            }
            var xdr = new XDomainRequest();
            if(xdr) {
                xdr.onload = function () {
                    var html = xdr.responseText + $(menuContainer).html();
                    $(menuContainer).html(html);
                };
                xdr.onerror = function() {
                    console.log('TOPMENU_FAILED: onerror');
                };
                xdr.ontimeout = function () {
                    console.log('TOPMENU_FAILED: ontimeout');
                };
                xdr.onprogress = function() {
                    console.log('progress');
                };
                xdr.open('get', url);
                xdr.send();
            }
        } else {
            $.ajax({
                url: url,
                data: {
                    lang: lang
                },
                dataType: 'html',
                type: 'GET'
            })
            .done(function(data) {

                var
                html = data + $(menuContainer).html();

                // Inyectar la cabecera.
                $(menuContainer).html(html);

            })
            .fail(function(data) {
                console.log('TOPMENU_FAILED');
            });
        }
	}	
	
	/**
	 * Procesa el evento submit del form interno validando email y password, y enviando la llamada
	 * ajax para realizar el login.
	 *
	 * @param form
	 */
	this.processFormSubmit = function(form) {
		if (!this.validateFormFields(form)) {
			return;
		}
		
		var 
			url = this.getUrl("signOn?service=" + encodeURIComponent(service) ),
			email = $(formSelector + ' #registro_top_form_nick').val()
			passw = $(formSelector + ' #registro_top_form_password').val();
		
		this.ajaxLoginToCAS(url, email, passw);
	}
	
	this.loginButton = function(domElement) {
		var newButtons = $(domElement);
		if (newButtons.size()>0) {
			newButtons.each(function(index) {
				if (!$(this).hasClass("CASLoginButton")) {
					$(this).addClass("CASLoginButton");
					$(this).off("click").on("click", function(){CAS.showLogin()});
				}
			});
		}
	}

	this.registerButton = function(domElement) {
		var newButtons = $(domElement);
		if (newButtons.size()>0) {
			newButtons.each(function(index) {
				if (!$(this).hasClass("CASRegisterButton")) {
					$(this).addClass("CASRegisterButton");
					$(this).off("click").on("click", function(){CAS.showRegisterForm()});
				}
			});
		}
	}

	this.isCasLoggedIn = function(){
		return ticket_tgt != null && ticket_tgt != "" && ticket_tgt != "null";
	};

	this.setTicketST = function(new_ticket_st) {
		ticket_st = new_ticket_st;
	};

	/**
	 * Si el usuario se ha autenticado en el AreaCliente, permite solicitar un TicketST para la 
	 * aplicación donde se ha cargado el script. Luego llama a la función _callback pasándole 
	 * como parámetro el TicketST.
	 *
	 * @param _callback
	 */
	this.login = function(_callback) {
		if (this.isCasLoggedIn()) {
			try {
				var 
					url = this.getUrl("getTicket.js");
				
				$.ajax({
					type: 'GET',
					url: url,
					data: {service: service},
					jsonpCallback: 'setTicketST',
					contentType: "application/json",
					dataType: 'jsonp',
					success: function(data) {
						console.log("success=" + data);
						console.log(data);
						try {
							if (!!data && data != 'null') {
								_callback.call({}, data);
							} else {
								_callback.call({}, false);
							}
						} catch (e) {
							console.log(e);
						}
					},
					error: function(e) {
						console.log("error");
						console.log(arguments);
					}
				});
			} catch(e) {
				console.log(e);
			}
		} else {
			_callback.call({}, false);
		}
	};

	/**
	 * Muestra la interfaz de login del areaCliente para que el usuario pueda loguearse contra el CAS. 
	 */
	this.showLogin = function() {
		if (!this.isCasLoggedIn()) {
			var 
				casResource = "nlrLogin?service=" + encodeURIComponent(service);
			//if (service != client_url) loginurl = loginurl + "&redirectUrl=" + encodeURIComponent(client_url);
			loadCas.call(this, casResource, true, false);
		}
	}
	/**
	 * 
	 */
	this.showRegisterForm = function() {
		var casResource = "nlrLogin?service=" + encodeURIComponent(service) + "&register=true";
		//if (service != client_url) loginurl = loginurl + "&redirectUrl=" + encodeURIComponent(client_url);
		loadCas.call(this, casResource, true, true);
	}

	this.showProfile = function() {
		if (this.isCasLoggedIn()) {
			var casResource = "misdatos?fromUrl=" + encodeURIComponent(service);
			//if (service != client_url) loginurl = loginurl + "&redirectUrl=" + encodeURIComponent(client_url);
			loadCas.call(this, casResource, true, true);
		}
	}

	/**
	 * Presenta al usuario la interfaz de areacliente para realizar el login. 
	 * 
	 * @param _resource
	 * @param _scrolling
	 * @param _close
	 */
	var loadCas = function(_resource, _scrolling, _close) {
		var 
			_url = this.getUrl(_resource );
		
		switch (showLoginMethod) {
			case REDIRECT_LOGIN:
				console.log('REDIRECT_LOGIN');
				break;
			case POPUP_LOGIN:
				console.log('POPUP_LOGIN');
				break;
			case AJAX_LOGIN:
				ajaxLoginToCAS(_url);
				break;
			default:
				console.log('NO_LOGIN_METHOD');
		}
		
		return;
		
		// Redirigir hacia el _resource.
		if (!useLayer) {
			window.location.href = _url;
			return;
		} 
		
		// Abrir popup con el _resource.
		var _height = $(window).height();
		var _width = $(window).width();
		var smallscreen = _width < 800 || _height < 600;
		if (smallscreen && parent.$.colorbox) {
			_height = $(parent.window).height();
			_width = $(parent.window).width();
			smallscreen = _width < 800 || _height < 600;
		}
		var layerparams = {
				closeButton: _close,
				escKey: _close,
				fastIframe: false,
				onLoad: function() { if(!_close) $('#cboxClose').hide(); },//*/
				width: (_width > 1100 ? 1100 : 800),
				height: (_height > 700 ? 700 : 600),
				scrolling: _scrolling,
				iframe: true,
				href: _url+'&layer=true' };
		if (!smallscreen && !!$.colorbox) {
			$.colorbox(layerparams);
		} else if (!smallscreen && !!parent.$.colorbox) {
			parent.$.colorbox(layerparams);
		} else {
			window.location.href = _url;
		}
	}

	/**
	 * Hace una llamada Ajax al CAS para logar al usuario.
	 *
	 * @param _url
	 */
	this.ajaxLoginToCAS = function(_url, email, password) {
		this.onBeforeAjaxLogin();
		$.ajax({
			url: _url,
			data: {
				email: email,
				password: password
			},
			type: 'POST',
			dataType: 'json'
		})
		.done(function(data) {
			if (!!data) {
				CAS.onAjaxLoginOK();
				window.location = window.location + '&ticket=' + data;
				window.location.reload(false);
			} else {
				CAS.onAjaxLoginFail();
			}
		})
		.fail(function() {
			CAS.onAjaxLoginError();
		});
	}
	
	this.logout = function() {
		var _link = onLogout;
		var idioma = getCookie('LocaleCookie');
		if(idioma == ''){
			idioma = 'es';
		}
		if (typeof _link == "function") {
			try {
				setTimeout(function(){
					var pagePath = window.location.pathname;
					sendNLRRegistroGTM('LOGOUT',pagePath,'web');
					window.top.location.href = this.getUrl(idioma+"/logout?fromUrl=" + encodeURIComponent(service) );
				}, 30*1000);
				_link.call({}, user_id, user_fbid);
			} catch (e) {
				window.top.location.href = this.getUrl(idioma+"/logout?fromUrl=" + encodeURIComponent(service) );
			}
		} else if (typeof _link == "string") {
			location.href = _link;
		} else {
			var pagePath = window.location.pathname;
			sendNLRRegistroGTM('LOGOUT',pagePath,'web');
			window.top.location.href = this.getUrl(idioma+"/logout?fromUrl=" + encodeURIComponent(service) );
		}
	};

	/**
	 * Crea una url que pertenece el areaCliente.
	 *
	 * @param method
	 */
	this.getUrl = function(method) {
		if (!sso_url) {
			sso_url = 'https://areacliente.eroski.es/areacliente/';
		}
		return sso_url + (!!method ? method : "");
	}
	
	this.getUserName = function() {
		return user_name;
	}

	this.changeLanguage = function(language, site) {
		console.log("changeLanguage");
		if (langList.indexOf(language)<0) return;
		var url = this.getUrl(language + "/topmenu.js?site=eco");
		var _onChangeLanguage = this.onChangeLanguage;
		var _redirect = redirectOnChangeLanguage;
		$.ajax({
			type: 'GET',
			url: url,
			jsonpCallback: 'onTopmenuLoad',
			contentType: "application/json",
			dataType: 'jsonp',
			success: function(data) {
				console.log("changeLanguage success");
				if (!!data && !!data.language) {
					// setCookie("LocaleCookie", data.language);
					if (typeof _onChangeLanguage == "function") {
						try {
							_onChangeLanguage.call({}, data.language, _redirect);
						} catch (e) {
							console.log(e);
						}
					}
				}
			},
			error: function(e) {
				console.log("error");
				console.dir(arguments);
			}
		});
	}

	this.onTopmenuLoad = function(topmenu) {
		console.log("--- CAS.onTopmenuLoad ---");
		
		language = topmenu.language;
		var 
			target = $(menuContainer).size() > 0 ? $(menuContainer) : $('body');
			
		if ($(".menu-top", target).size() > 0) {
			$(".menu-top", target).remove();
			target.prepend(topmenu.html);
		} else {
			target.prepend(topmenu.html);
		}
		
		if (!links.compras) $("#topmenulink-compras", target).parent(".submenu-2").remove();
		if (!links.favoritos) $("#topmenulink-favoritos", target).parent(".submenu-2").remove();
		if (!links.listas) $("#topmenulink-listas", target).parent(".submenu-2").remove();
		if (!links.servicios) $("#topmenulink-servicios", target).parent(".submenu-2").remove();

		/*prevent default de los links usados como titulo en los menus desplegables*/
		// $('#despl-menu>ul>li').off('click').on('click', clickTopMenuCAS);
		/* desplegables idioma y tiendas */
		$('.menu-despl', target).off('click').on('click', topMenuDesplCAS);

		// $("#oplang_" + topmenu.language).css("font-weight", "bold");
		var langOpts = $("#top-menu .language2 select", target);
		if (langOpts.length != langList.length) {
			$("option:enabled", langOpts).hide();
			for (index = 0; index < langList.length; ++index) {
				var langtmp = langList[index].trim();
				$("option[value="+langtmp+"]", langOpts).css('display', '');
			}
		}
		$("#top-menu .language2 select", target).val(topmenu.language);
		$("option:selected", langOpts).css('display', ''); // por las dudas

		$('#tab-logged a', target).off('click').on('click', function () {
			$('#tab-logged', target).children('.submenu').slideToggle(400, function(){
				$('#tab-logged', target).toggleClass('active');
			});
		});
	}
	return this;
}).call({}, window.inDapIF ? parent.window : window);

$(document).ready(function(){
	CAS.init();
});
function onTopmenuLoad(topmenu) {
	CAS.onTopmenuLoad(topmenu, arguments);
}
//</script>
