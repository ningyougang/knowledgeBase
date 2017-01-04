if (typeof AI == "undefined")
	var AI = {};
if (typeof AI.Comp == "undefined")
	AI.Comp = {};
if (typeof AI.Comp.Panel == "undefined")
	AI.Comp.Panel = {};
AI.extend = function(destination, source) {
	for (var property in source)
		destination[property] = source[property];
	return destination;
};
String.prototype.lTrim = function() {
	return this.replace(/^\s+/, '');
};
String.prototype.rTrim = function() {
	return this.replace(/\s+$/, '');
};
String.prototype.trim = function() {
	return this.lTrim().rTrim();
};
AI.extend(AI, {
			imgPath : 'common/AIComp/images',
			emptyFunc : function() {
			},
			create : function() {
				return function() {
					this.initialize.apply(this, arguments);
				}
			},
			clone : function(obj) {
				return AI.extend({}, obj);
			},
			keys : function(obj) {
				var keys = [];
				for (var property in obj)
					keys.push(property);
				return keys;
			},
			values : function(obj) {
				var values = [];
				for (var property in obj)
					values.push(obj[property]);
				return values;
			},
			isFunction : function(obj) {
				return typeof obj == "function";
			},
			isString : function(obj) {
				return typeof obj == "string";
			},
			isTrue : function(flag) {
				return (flag && flag.toString() == 'true') ? true : false;
			},
			isNumber : function(obj) {
				return typeof obj == "number";
			},

			isUndefined : function(obj) {
				return typeof obj == "undefined";
			},
			bind : function() {
				var args = AI.convertArgToArray(arguments);
				var __method = args.shift(), obj = args.shift();
				return function() {
					var _args = AI.convertArgToArray(arguments);
					return __method.apply(obj, args.concat(_args));
				}
			},
			log : function(info) {
				if (!(typeof console == "undefined")) {
					console.log(info);
				} else {
					// var debug = $('#AI_Debug').show();
					// if (debug.length != 0) {
					// debug.html(debug.html() + "</br>" + info)
					// .scrollTop(debug.get(0).offsetTop);
					// }
				}
			},
			bindEvent : function() {
				var args = AI.convertArgToArray(arguments);
				var __method = args.shift(), obj = args.shift();
				return function(event) {
					return __method.apply(obj, [event || window.event]
									.concat(args));
				}
			},
			copyProps : function(obj, props) {
				var result = {};
				$.each(props, function(index, item) {
							if (!AI.isUndefined(obj[item])) {
								result[item] = obj[item];
							}
						});
				return result;
			},
			template : function(str, obj) {
				var rgExp = /\#\w*\#/g;
				var items = str.match(rgExp);
				for (var i = 0; i < items.length; i++) {
					var field = items[i].substring(1, items[i].length - 1);
					var _val = obj[field];
					str = str.replace(items[i], _val);
				}
				return str;
			},
			convertArgToArray : function(_args) {
				var length = _args.length, args = [];
				while (length--)
					args[length] = _args[length];
				return args;
			},
			getComp : function(comp) {
				var obj;
				if (AI.isString(comp) || AI.isNumber(comp)) {
					obj = $('#AI-' + comp);
				} else if (typeof comp == 'object' && !(comp instanceof $)) {
					obj = $(comp);
				} else {
					obj = comp;
				}
				if (!obj)
					return;
				var compObj = obj.data('_AI_COMP_OBJ');
				return (compObj instanceof AI.Component) ? compObj : null;
			}
		});
/** 控制页面元素不能被选取； */
$.fn.noSelect = function(p) {
	if (p == null)
		prevent = true;
	else
		prevent = p;
	if (prevent) {
		return this.each(function() {
					if ($.browser.msie || $.browser.safari)
						$(this).bind('selectstart', function() {
									return false;
								});
					else if ($.browser.mozilla) {
						$(this).css('MozUserSelect', 'none');
						$('body').trigger('focus');
					} else if ($.browser.opera)
						$(this).bind('mousedown', function() {
									return false;
								});
					else
						$(this).attr('unselectable', 'on');
				});
	} else {
		return this.each(function() {
					if ($.browser.msie || $.browser.safari)
						$(this).unbind('selectstart');
					else if ($.browser.mozilla)
						$(this).css('MozUserSelect', 'inherit');
					else if ($.browser.opera)
						$(this).unbind('mousedown');
					else
						$(this).removeAttr('unselectable', 'on');
				});
	}

};