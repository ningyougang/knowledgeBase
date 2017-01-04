if (typeof AI == "undefined") {
	var AI = {}
}
if (typeof AI.Comp == "undefined") {
	AI.Comp = {}
}
if (typeof AI.Comp.Panel == "undefined") {
	AI.Comp.Panel = {}
}
AI.extend = function(a, c) {
	for (var b in c) {
		a[b] = c[b]
	}
	return a
};
String.prototype.lTrim = function() {
	return this.replace(/^\s+/, "")
};
String.prototype.rTrim = function() {
	return this.replace(/\s+$/, "")
};
String.prototype.trim = function() {
	return this.lTrim().rTrim()
};
AI.extend(AI, {
	imgPath : "../images",
	emptyFunc : function() {
	},
	create : function() {
		return function() {
			this.initialize.apply(this, arguments)
		}
	},
	clone : function(a) {
		return AI.extend({}, a)
	},
	keys : function(c) {
		var a = [];
		for (var b in c) {
			a.push(b)
		}
		return a
	},
	values : function(c) {
		var a = [];
		for (var b in c) {
			a.push(c[b])
		}
		return a
	}, 
	 /*公共方法-begin*/ 
	isFunction : function(a) {
		return typeof a == "function"
	},
	isString : function(a) {
		return typeof a == "string"
	},
	isTrue : function(a) {
		return (a && a.toString() == "true") ? true : false
	},
	isNumber : function(a) {
		return typeof a == "number"
	},
	isUndefined : function(a) {
		return typeof a == "undefined"
	}, 
	/*js特殊字符校驗(^、?、"、')*/ 
	isSpecailChar:function(v,reg)  
	{  
	    var reg = (reg==null||reg==''||reg=='undefined')? /^[^^?"']+$/i:reg;  
	    if(!reg.test(v))  
	        return true;  // 校验成功(含有特殊字符)   
	    else  
	        return false; // 校验失败(不含有特殊字符)   
	}, 
	isMail:function(v)
  { 
  	  var reg =  /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
	    if(reg.test(v))  
	        return true;  // 校验成功   
	    else  
	        return false; // 校验失败  
  },  
  /*手机号码验证,验证13系列和150-159、180、185、186、187、188、189几种号码，长度11位*/
  isMobile:function(v)
	{
		if(/^13\d{9}$/g.test(v)||(/^15[0-9]\d{8}$/g.test(v))||   
		(/^18[05-9]\d{8}$/g.test(v))){     
		       return true;   
		}else{   
		       return false;   
		}  
 	},   
 	 /*设置cookie,默认有效期1年*/ 
 	setCookie:function(name,value,days)
	{
	    var Days = (days==null||days==''||days=='undefined'||!AI.isNumber(days))?360:days; 
	    var exp  = new Date(); 
	    exp.setTime(exp.getTime() + Days*24*60*60*1000);//过期时间为1年
	    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
	}, 
	getCookie:function(name)
	{
	    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
	        if(arr=document.cookie.match(reg)) return unescape(arr[2]);
	    else return null;
	}, 
	delCookie:function(name)
	{
	    var exp = new Date();
	    exp.setTime(exp.getTime() - 1);
	    var cval=AI.getCookie(name);
	    if(cval!=null) document.cookie= name + "="+cval+";expires="+exp.toGMTString();
	},
   /*公共方法-end*/   
	bind : function() {
		var b = AI.convertArgToArray(arguments);
		var a = b.shift(), c = b.shift();
		return function() {
			var d = AI.convertArgToArray(arguments);
			return a.apply(c, b.concat(d))
		}
	},
	log : function(a) {
		if (!(typeof console == "undefined")) {
			console.log(a)
		} else {
		}
	},
	bindEvent : function() {
		var b = AI.convertArgToArray(arguments);
		var a = b.shift(), c = b.shift();
		return function(d) {
			return a.apply(c, [d || window.event].concat(b))
		}
	},
	copyProps : function(c, b) {
		var a = {};
		$.each(b, function(d, e) {
					if (!AI.isUndefined(c[e])) {
						a[e] = c[e]
					}
				});
		return a
	},
	template : function(f, e) {
		var c = /\#\w*\#/g;
		var a = f.match(c);
		for (var b = 0; b < a.length; b++) {
			var d = a[b].substring(1, a[b].length - 1);
			var g = e[d];
			f = f.replace(a[b], g)
		}
		return f
	},
	convertArgToArray : function(a) {
		var c = a.length, b = [];
		while (c--) {
			b[c] = a[c]
		}
		return b
	},
	getComp : function(a) {
		var b;
		if (AI.isString(a) || AI.isNumber(a)) {
			b = $("#AI-" + a)
		} else {
			if (typeof a == "object" && !(a instanceof $)) {
				b = $(a)
			} else {
				b = a
			}
		}
		if (!b) {
			return
		}
		var c = b.data("_AI_COMP_OBJ");
		return (c instanceof AI.Component) ? c : null
	},
	_initDialog : function() {
		var a = AI.getComp("Dialog-MSG");
		if (!a) {
			a = new AI.Comp.Dialog({
						width : 300,
						height : 120,
						modal : true,
						id : "Dialog-MSG",
						allowDrag : true,
						allowResize : false
					})
		}
		return a
	},
	message : function(d, c, b) {
		var a = AI._initDialog();
		b = b || "info";
		a.setTitle(d);
		a.setMsg(c, b);
		a.addButton("确 定", function() {
					a.hide()
				});
		a.show()
	},
	confirm : function(e, d, c, a) {
		var b = AI._initDialog();
		b.setTitle(e);
		b.setMsg(d, "help");
		b.addButton("确 定", function() {
					b.hide();
					if (c) {
						c.call(null)
					}
				});
		b.addButton("取 消", function() {
					b.hide();
					if (a) {
						a.call(null)
					}
				});
		b.show()
	},
	prompt : function(c, b) {
		var a = AI._initDialog();
		a.setTitle(c);
		a
				.setMsg('<fieldset class="prompt"><legend>'
						+ c
						+ '</legend><input type="text" class="AI-input" style="width:90%" id="_dialog_prompt_input_"/></fieldset>');
		a.addButton("确 定", function() {
					a.hide();
					if (b) {
						b.call(null, $("#_dialog_prompt_input_").val())
					}
				});
		a.addButton("取 消", function() {
					a.hide()
				});
		a.show()
	},
	showDialog : function(a) {
		if (!a.id && !a.el) {
			console.log("必须给dialog设置唯一的ID")
		}
		var b = AI.getComp(a.el || a.id);
		if (!b) {
			b = new AI.Comp.Dialog(a);
			b._load()
		}
		b.show();
		return b
	},
	getPageArea : function() {
		if (document.compatMode == "BackCompat") {
			return {
				width : Math.max(document.body.scrollWidth,
						document.body.clientWidth),
				height : Math.max(document.body.scrollHeight,
						document.body.clientHeight)
			}
		} else {
			return {
				width : Math.max(document.documentElement.scrollWidth,
						document.documentElement.clientWidth),
				height : Math.max(document.documentElement.scrollHeight,
						document.documentElement.clientHeight)
			}
		}
	}
});
$.fn.noSelect = function(a) {
	if (a == null) {
		prevent = true
	} else {
		prevent = a
	}
	if (prevent) {
		return this.each(function() {
					if ($.browser.msie || $.browser.safari) {
						$(this).bind("selectstart", function() {
									return false
								})
					} else {
						if ($.browser.mozilla) {
							$(this).css("MozUserSelect", "none");
							$("body").trigger("focus")
						} else {
							if ($.browser.opera) {
								$(this).bind("mousedown", function() {
											return false
										})
							} else {
								$(this).attr("unselectable", "on")
							}
						}
					}
				})
	} else {
		return this.each(function() {
					if ($.browser.msie || $.browser.safari) {
						$(this).unbind("selectstart")
					} else {
						if ($.browser.mozilla) {
							$(this).css("MozUserSelect", "inherit")
						} else {
							if ($.browser.opera) {
								$(this).unbind("mousedown")
							} else {
								$(this).removeAttr("unselectable", "on")
							}
						}
					}
				})
	}
};
AI.Component = AI.create();
AI.Component.prototype = {
	initialize : function(a) {
		this.params = {}
	},
	log : function(a) {
		this._recordLog(a, "INFO ")
	},
	error : function(a) {
		this._recordLog(a, "ERROR")
	},
	warn : function(a) {
		this._recordLog(a, "WARN ")
	},
	_recordLog : function(d, c) {
		var a = this.params.id;
		var b = "[ " + c + " ]  ";
		if (a && a != "") {
			b += "组件ID为[ " + a + " ]===:"
		}
		b += d;
		AI.log(b)
	},
	getEl : function() {
		var b = this.params.el, a = null;
		if (!b) {
			a = $("<div>");
			$("body").append(a)
		}
		if (AI.isString(b) || AI.isNumber(b)) {
			a = $("#" + b)
		} else {
			if (typeof b == "object" && !(b instanceof $)) {
				a = $(comp)
			} else {
				a = b
			}
		}
		if (!a.hasClass("AI-Comp")) {
			a.addClass("AI-Comp")
		}
		if (!a.attr("id")) {
			a.attr("id", this.params.name)
		}
		return a
	},
	callback : function() {
		var a = AI.convertArgToArray(arguments);
		var c = a.shift();
		var b = this.params.callback[c];
		if (AI.isFunction(b)) {
			b.apply(null, a)
		}
	},
	bind : function(b, a) {
		if (!b || !AI.isFunction(a)) {
			return
		}
		var c = this.params.callback;
		if (!c) {
			return
		}
		c[b] = a;
		return this
	}
};
AI.Comp.Panel = AI.create();
AI.Comp.Panel.prototype = AI.extend(new AI.Component, {
	initialize : function(b) {
		this.params = {
			width : 190,
			overflow : "hidden",
			shadow : false,
			show : false
		};
		AI.extend(this.params, b || {});
		this.loaded = true;
		var a = this.params.width;
		a = (AI.isTrue(this.params.shadow)) ? a : a - 10;
		this.panelBorder = $("<div>").addClass("AI-Panel").css({
					width : a
				});
		this._initShadow()
	},
	_initShadow : function() {
		var c = this.params.height;
		if (AI.isTrue(this.params.shadow)) {
			var d = '<div class="panel_top"><div class="panel_top_right"/></div>';
			var a = $('<div class="panel_bottom"/>')
					.append('<div class="panel_bottom_left"/>')
					.append('<div class="panel_bottom_right"/>');
			a.css("height", c);
			this.content = $("<div class='panel_content'>");
			var b = $('<div class="panel_bottom_middle"/>');
			a.append(b.append(this.content));
			this.panelBorder.append(d).append(a).addClass("AI-Panel-bg")
		} else {
			this.content = $("<div class='panel_content'>").css("padding",
					"5px");
			this.content.css({
						height : c
					});
			this.panelBorder.append(this.content)
		}
	},
	_hideAllPanel : function() {
		$("#AI_Panel_Container").children(":visible").hide()
	},
	getContentPanel : function() {
		return this.content
	},
	addClass : function(a) {
		this.panelBorder.addClass(a)
	},
	applyTo : function(b) {
		if (b) {
			b = (AI.isString(b)) ? $("#" + b) : b;
			b.append(this.panelBorder)
		} else {
			var a = $("#AI_Panel_Container");
			if (a.length == 0) {
				a = $('<div id="AI_Panel_Container"/>').appendTo("body")
			}
			this.panelBorder.appendTo(a)
		}
	},
	judgeHeight : function(a) {
		if (AI.isTrue(this.params.shadow)) {
			this.panelBorder.find(".panel_bottom").css({
						height : a
					})
		} else {
			this.content.css("height", a)
		}
	},
	setDisplay : function() {
		this.panelBorder.css("position", "relative");
		this.panelBorder.show()
	},
	show : function() {
		this.panelBorder.slideDown("fast");
		this.panelBorder.css("z-index", "9999");
		this.content.show();
		if (!this.loaded) {
			this.showLoading(true)
		}
	},
	hide : function() {
		this.panelBorder.slideUp("fast");
		this.content.hide()
	},
	setPosition : function(a) {
		this.panelBorder.css({
					top : a.top,
					left : a.left
				})
	},
	showLoading : function(a) {
		var b = this.content.css("display");
		if (b != "none" || (b == "none" && this.loaded)) {
			var c = this.content.parent().find(".panel-loading");
			if (c.length == 0) {
				c = $("<div class='panel-loading'><p><img src='"
						+ AI.imgPath
						+ "/PIC/loading_small.gif'/></p><p style='margin-top:5px;'>数据加载中...</p></div>");
				this.content.parent().append(c)
			}
			if (a) {
				this.content.hide();
				c.show()
			} else {
				c.hide();
				this.content.show()
			}
		}
	},
	destory : function() {
	},
	isVisible : function() {
		return this.panelBorder.css("display") == "none" ? false : true
	}
});
AI.Comp.FilterPanel = AI.create();
AI.Comp.FilterPanel.prototype = AI.extend(new AI.Comp.Panel(), {
			initialize : function(a) {
				this.params = {
					allowfilter : false
				};
				AI.Comp.Panel.prototype.initialize.call(this, a);
				AI.extend(this.params, a || {});
				if (AI.isTrue(this.params.allowfilter)) {
					this._initFilterPanel()
				}
			},
			_initFilterPanel : function() {
				var d = this.getContentPanel().parent();
				var a = $("<div>").addClass("panel-filter");
				var c = $("<span>").addClass("panel-search");
				var b = $('<input type="text" maxlength="18"/>')
						.addClass("input-filter-normal").bind("mousedown",
								function(e) {
									$(this).removeClass()
											.addClass("input-filter-hover");
									e.stopPropagation()
								}).blur(function() {
							$(this).removeClass()
									.addClass("input-filter-normal")
						});
				b.bind("keyup", AI.bindEvent(this.doFilter, this));
				d.prepend(a.append(b).append(c))
			}
		});
AI.Comp.ComboxPanel = AI.create();
AI.Comp.ComboxPanel.prototype = AI.extend(new AI.Comp.FilterPanel(), {
	initialize : function(a) {
		AI.Comp.FilterPanel.prototype.initialize.call(this, a);
		this.params = {
			multisel : false,
			ds : [],
			name : "",
			showico : false,
			showtips : true,
			asyn : false,
			url : "",
			el : null,
			isGroup : false,
			showall : false,
			alltxt : "全部选项",
			allval : "-999",
			initload : true,
			width : 190,
			onselected : AI.emptyFunc,
			onbeforeload : AI.emptyFunc,
			onafterload : AI.emptyFunc,
			maxheight : 200,
			liheight : 18
		};
		AI.extend(this.params, a || {});
		if (AI.isTrue(this.params.asyn) && AI.isTrue(this.params.initload)) {
			this._getStore()
		} else {
			this._fillData()
		}
		if (this.params.el) {
			this._render()
		}
	},
	_getStore : function() {
		var b = this.params.url;
		var a = this;
		this._onload();
		$.getJSON(b, function(c) {
					a._fillData(c)
				})
	},
	_render : function() {
		var a = this.params.el;
		a = (AI.isString(a)) ? $("#" + a) : a;
		this.applyTo(a);
		this.panelBorder.addClass("AI-Combox");
		this.setDisplay()
	},
	_afterLoad : function() {
		var a = this.params.onafterload;
		if (AI.isFunction(a)) {
			a.call({})
		}
		this.showLoading(false)
	},
	_fillData : function(a) {
		var b = a || this.params.ds || [];
		if (b.length == 0) {
			return
		}
		var c = this._fillDataByStore(b);
		delete this.params.ds;
		this.getContentPanel().append(c).bind("mousedown", function() {
					return false
				});
		this._afterLoad()
	},
	_fillDataByStore : function(b) {
		var a = this, c = null;
		if (b) {
			c = $(".combox-listData", this.getContentPanel());
			if (c.length == 0) {
				c = $("<ul>").addClass("combox-listData");
				this.getContentPanel().append(c).bind("mousedown", function() {
							return false
						})
			}
			if (AI.isTrue(this.params.showall)) {
				c.append(this._createDataDom({
							val : this.params.allval,
							txt : this.params.alltxt,
							all : 1
						}).attr("_all", 1))
			}
			$.each(b, function(d, f) {
						var e;
						if (AI.isTrue(a.params.isGroup)) {
							e = a._createGroupDataDom(f)
						} else {
							e = a._createDataDom(f)
						}
						if (e) {
							if (e instanceof Array) {
								$.each(e, function(h, g) {
											c.append(g)
										})
							} else {
								c.append(e)
							}
						}
					})
		}
		if (!this.params.height) {
			this.judgeHeight(this._calHeight(c.find("li").length))
		}
		return c
	},
	_cascadeData : function(f, c, b) {
		var e = f.val;
		if (AI.isTrue(this.params.asyn)) {
			var d = this.params.url, a = this;
			this._onload();
			$.getJSON(d, {
						val : e
					}, function(g) {
						a._fillDataByStore(g);
						b.call(null, f)
					})
		} else {
			this._fillDataByStore(c);
			b.call(null, f)
		}
		this._afterLoad()
	},
	_createGroupDataDom : function(d) {
		if (!d) {
			return
		}
		var c = $("<li>").attr("val", d.val).text(d.txt)
				.addClass("combox-li-group");
		var b = d.children, a = this, e = [c];
		if (b && (b instanceof Array)) {
			$.each(b, function(f, g) {
						g.pid = d.val;
						e.push(a._createDataDom(g))
					})
		}
		return e
	},
	_getAttr : function(c) {
		var b = {};
		var a = ["val", "ico", "pid", "txt", "desc", "children"];
		$.each(AI.keys(c), function(d, e) {
					if ($.inArray(e, a) == -1) {
						b[e] = c[e] || ""
					}
				});
		return b
	},
	_createDataDom : function(d) {
		if (!d) {
			return
		}
		if (d.val && d.val != "") {
			var c = $("<li>").attr("val", d.val);
			if (d.pid) {
				c.attr("pid", d.pid)
			}
			if (AI.isTrue(this.params.multisel) && !d.all == 1) {
				c.append(this._appendCheckBox(c, d.val))
			}
			if (AI.isTrue(this.params.showico) && !d.all == 1) {
				var e = d.ico || "combox-default";
				c.append(this._appendICO(e))
			}
			c.append(d.txt);
			c.attr("title", (d.desc && d.desc != "") ? d.desc : d.txt);
			c.data("_attr", this._getAttr(d));
			var a = d.enable;
			if (a + "" == "0") {
				c.addClass("combox-li-disable")
			} else {
				c.bind("mousedown", {
							obj : this
						}, this._selectItem);
				c.hover(function() {
							$(this).addClass("combox-li-hover");
							var f = $(".checkbox", this);
							if (!f.hasClass("checkbox-checked")) {
								f.removeClass()
										.addClass("checkbox checkbox-hover")
							}
						}, function() {
							$(this).removeClass();
							var f = $(".checkbox", this);
							if (!f.hasClass("checkbox-checked")) {
								f.removeClass()
										.addClass("checkbox checkbox-normal")
							}
						})
			}
			var b = d.children;
			if (b && b.length > 0) {
				c.data("_items", b)
			}
			return c
		}
		return null
	},
	_selItem : function(e) {
		var b = this;
		var c = this.params.onselected;
		if (!e || e.length == 0) {
			return
		}
		if (AI.isTrue(this.params.multisel)) {
			var d = [];
			if (!(e instanceof Array)) {
				d.push(e)
			} else {
				d = e
			}
			$.each(d, function(g, i) {
						var h = $(i);
						var f = h.attr("_sel");
						var j = $(".checkbox", h);
						h.attr("_sel", (f && f == 1) ? 0 : 1);
						j.toggleClass("checkbox-checked")
					})
		} else {
			var a = $("ul>li", this.getContentPanel()).attr("_sel", 0);
			e.attr("_sel", 1)
		}
		if (AI.isFunction(c)) {
			c.call({})
		}
	},
	_selectItem : function(a) {
		var b = a.data.obj;
		if (b) {
			b._selItem($(this))
		}
		return false
	},
	_appendCheckBox : function(a) {
		return '<span class="checkbox checkbox-normal"/>'
	},
	_appendICO : function(a) {
		return '<span class="combox-list-ico ico-' + a + '"/>'
	},
	_onload : function() {
		if (!AI.isTrue(this.params.asyn)) {
			return
		}
		var a = this.params.onbeforeload;
		this.showLoading(true);
		if (AI.isFunction(a)) {
			a.call({})
		}
	},
	_judgeExist : function(c) {
		var b = $("ul>li", this.getContentPanel());
		var a = false;
		b.each(function(d, f) {
					var e = $(f);
					if (e.attr("val") == c) {
						a = true;
						return true
					}
				});
		return a
	},
	_getCascadeStore : function(a) {
		var b = $("ul>li", this.getContentPanel()), d = [];
		if (a == this.params.allval) {
		} else {
			var c = b.filter("[val=" + a + "]");
			if (c.length > 0) {
				d = c.data("_items") || []
			}
		}
		return d
	},
	_calHeight : function(d) {
		var b = parseInt(this.params.maxheight), a = parseInt(this.params.liheight);
		var c = a * d + 40;
		return (c > b) ? b : c
	},
	selectByIndex : function(b) {
		var a = $("ul>li", this.getContentPanel()).eq(b).filter("[_sel!=1]");
		this._selItem(a.eq(0))
	},
	selectByValue : function(e) {
		if (e == undefined) {
			return
		}
		e = e + "";
		var b = $("ul>li", this.getContentPanel()), d = e.split(","), a = this, c = [];
		$.each(d, function(g, h) {
					var f = b.filter("[val=" + h + "]").filter("[_sel!=1]");
					if (f.length > 0) {
						c.push(f.eq(0))
					}
				});
		a._selItem(AI.isTrue(this.params.multisel) ? c : c.pop())
	},
	addItem : function(d) {
		var c = [], a = this;
		if (!(d instanceof Array)) {
			c.push(d)
		} else {
			c = d
		}
		var b = $("ul", a.getContentPanel());
		$.each(c, function(f, g) {
					if (a._judgeExist(g.val)) {
						return
					}
					var e = a._createDataDom(g);
					b.append(e)
				});
		if (!this.params.height) {
			this.judgeHeight(this._calHeight(b.find("li").length))
		}
	},
	removeItem : function(d) {
		var c = $("ul", this.getContentPanel()), b = [];
		if (d) {
			if (!(d instanceof Array)) {
				b.push(d)
			} else {
				b = d
			}
			var a = $("li", c);
			$.each(b, function(e, f) {
						a.remove("[val=" + f.val + "]")
					})
		} else {
			c.empty();
			this.clearSelect()
		}
		if (!this.params.height) {
			this.judgeHeight(this._calHeight(c.find("li").length))
		}
	},
	getValue : function() {
		var d = $("ul>li", this.getContentPanel()), c = d.filter("[_sel=1]"), b = [], a = this;
		$.each(c, function(g, j) {
					var h = $(j);
					var f = {
						val : h.attr("val"),
						pid : h.attr("pid") || -1,
						txt : h.text()
					};
					var i = h.data("_attr");
					if (i) {
						$.each(AI.keys(i), function(l, m) {
									f[m] = i[m]
								})
					}
					if (AI.isTrue(a.params.showico)
							&& !AI.isTrue(a.params.multisel)) {
						var k = h.find("span.combox-list-ico");
						f.ico = "ico-combox-default";
						if (k.length > 0) {
							var e = k.get(0).className;
							var g = e.indexOf("ico-");
							f.ico = (g == -1) ? "" : e.substring(g)
						}
					}
					b.push(f)
				});
		return b
	},
	clearSelect : function() {
		var a = $("ul>li", this.getContentPanel()).attr("_sel", 0);
		if (AI.isTrue(this.params.multisel)) {
			a.find("span.checkbox-checked").removeClass()
					.addClass("checkbox checkbox-normal")
		}
	},
	doFilter : function(e) {
		var a = e.target, d;
		if (a) {
			d = a.value;
			var b = $("ul>li", this.getContentPanel()).filter(function() {
						return !$(this).hasClass("combox-li-group")
					});
			if (d == "") {
				b.show();
				return
			}
			var c = 0;
			b.filter(function(f) {
						var h = $(this).text();
						var g = new RegExp(d, "gi");
						c++;
						return !g.test(h)
					}).hide()
		}
	}
});
AI.Comp.TreePanel = AI.create();
AI.Comp.TreePanel.prototype = AI.extend(new AI.Comp.FilterPanel, {
	initialize : function(a) {
		AI.Comp.FilterPanel.prototype.initialize.call(this, a);
		this.params = {
			name : "",
			multisel : false,
			ds : [],
			showico : false,
			showTips : true,
			asyn : false,
			url : "",
			el : null,
			isGroup : false,
			showAll : false,
			initload : true,
			maxheight : 250,
			onselected : AI.emptyFunc,
			onbeforeload : AI.emptyFunc,
			onafterload : AI.emptyFunc
		};
		AI.extend(this.params, a || {});
		this._fillData();
		if (this.params.el) {
			this._render()
		}
	},
	_initTreeConfig : function(e) {
		var d = {}, f = {}, b = this;
		d.selected = "Array";
		d.data = {
			type : "json",
			opts : f
		};
		var a = {};
		a.onchange = function(k, h) {
			var i = $(k);
			var j = b.params.onselected;
			if (j) {
				j.call(null)
			}
		};
		if (AI.isTrue(this.params.asyn)) {
			f.asyn = true;
			f.async_data = function(h) {
				return {
					_pid : $(h).attr("val") || -999
				}
			};
			f.lang = {
				loading : "\u6570\u636e\u52a0\u8f7d\u4e2d......"
			};
			f.url = this.params.url;
			f.method = "post";
			var g = b.params.onbeforeload;
			var c = b.params.onafterload;
			if (AI.isFunction(g)) {
				a.beforedata = function() {
					g.call({})
				}
			}
			a.onload = function() {
				c.call({})
			};
			a.ondata = function(j, i) {
				var h = b._convertJSONStore(j);
				return h
			}
		} else {
			f["static"] = b._convertJSONStore(e)
		}
		d.callback = a;
		d.ui = {
			animation : 200
		};
		if (AI.isTrue(this.params.multisel)) {
			d.plugins = {
				checkbox : {}
			};
			d.ui["theme_name"] = "checkbox"
		}
		return d
	},
	_render : function() {
		var a = this.params.el;
		a = (AI.isString(a)) ? $("#" + a) : a;
		this.addClass("AI-Comp");
		this.applyTo();
		this.setDisplay()
	},
	_fillData : function() {
		var a = this.params.ds || [];
		var b = $('<div class="_AI_TREE_">');
		this.tree = jQuery.tree.create();
		this.tree.init(b.get(0), this._initTreeConfig(a));
		delete this.params.ds;
		this.getContentPanel().append(b).bind("mousedown", function() {
					return false
				})
	},
	_convertJSONStore : function(a) {
		data = [], _self = this;
		$.each(a, function(c, e) {
					var d = b(e, -1);
					data.push(d)
				});
		function b(f, c) {
			var j = {};
			var e = f.children, h = [];
			var d = AI.keys(f);
			var i = ["children", "txt", "ico", "asyn", "url"];
			j.attributes = {};
			$.each(d, function(k, l) {
						if ($.inArray(l, i) == -1) {
							j.attributes[l] = f[l] || ""
						}
					});
			j.attributes["pid"] = c;
			var g = {
				title : f.txt
			};
			if (AI.isTrue(_self.params.showico)) {
				g.icon = f.ico
			}
			j.data = g;
			if (e && e instanceof Array && e.length > 0) {
				$.each(e, function(k, m) {
							var l = b(m, f.val);
							h.push(l)
						})
			}
			if (h.length > 0) {
				j.children = h
			}
			return j
		}
		return data
	},
	selectByValue : function(c) {
		if (!c) {
			return
		}
		var b = (c + "").split(","), a = this;
		$.each(b, function(d, e) {
					var f = $("li[val=" + e + "]", a.tree.container);
					a.tree.select_branch(f)
				})
	},
	addItem : function() {
	},
	removeItem : function() {
	},
	clearSelect : function() {
	},
	getValue : function() {
		var b, a = [];
		if (AI.isTrue(this.params.multisel)) {
			b = this.tree.container.find("a.checked").parent()
		} else {
			b = this.tree.selected
		}
		if (b) {
			$.each(b, function(d, f) {
				var e = $(f), c = f.attributes, g = {};
				$.each(c, function(i, h) {
					if (h.specified) {
						var k = h.nodeName.toLowerCase();
						var j = h.nodeValue;
						if (k != "class" && k != "style" && k != "sizcache"
								&& k != "sizset" && (k.indexOf("jquery") == -1)) {
							g[k] = j
						}
					}
				});
				g.txt = $(f).children("a").text();
				a.push(g)
			})
		}
		return a
	},
	doFilter : function(c) {
		var a = c.target, b;
		if (a) {
			b = a.value;
			this.tree.search(b)
		}
	}
});
AI.Comp.Combox = AI.create();
AI.Comp.Combox.prototype = AI.extend(new AI.Component(), {
	initialize : function(a) {
		this.params = {
			el : null,
			id : null,
			name : null,
			width : 180,
			multisel : false,
			allowfilter : false,
			ds : null,
			showico : false,
			showtips : true,
			panelwidth : 190,
			overflow : "hidden",
			value : null,
			shadow : false,
			initload : true,
			asyn : false,
			url : "",
			showstyle : "normal",
			submitfields : null,
			emptytxt : "---请选择---",
			cascade : null,
			callback : {
				onchange : AI.emptyFunc,
				oncascade : AI.emptyFunc,
				onfilter : AI.emptyFunc,
				onAdd : AI.emptyFunc,
				onRemove : AI.emptyFunc
			}
		};
		AI.extend(this.params, a || {});
		this.style = {
			normal : AI.Comp.ComboxPanel,
			group : AI.Comp.ComboxPanel,
			tree : AI.Comp.TreePanel
		};
		this.container = $('<div class="AI-Combox">').noSelect();
		this.cascadeInit = true;
		this._initInputBox();
		this._initHiddenField();
		this._initPanel();
		this._render()
	},
	_initInputBox : function() {
		var b = $("<div>").addClass("combox-select combox-select-normal").css(
				"width", this.params.width);
		var d = function(h, g) {
			if ($(".combox-arrow", h).hasClass(".combox-arrow-clicked")) {
				return
			}
			var f = (g == "hover") ? "normal" : "hover";
			h.removeClass("combox-select-" + f).addClass("combox-select-" + g);
			$(".combox-arrow", h).removeClass("combox-arrow-" + f)
					.addClass("combox-arrow combox-arrow-" + g)
		};
		b.hover(function() {
					d($(this), "hover")
				}, function() {
					d($(this), "normal")
				}).bind("mousedown", function(f) {
			return function() {
				f._resetComboxStyle();
				$(".combox-arrow", $(this)).removeClass()
						.addClass("combox-arrow combox-arrow-clicked");
				if (!f.isExpanded()) {
					f.panel._hideAllPanel();
					f.expand()
				} else {
					f.collapse()
				}
				return false
			}
		}(this));
		var e = $("<div>").addClass("combox-left-border");
		var a = $("<span>").addClass("combox-input").attr("_init", true);
		a.text(this.params.emptytxt);
		if (AI.isTrue(this.params.showico)) {
			a.addClass("combox-ico ico-combox-default")
		}
		var c = $("<span>").addClass("combox-arrow combox-arrow-normal");
		b.append(e.append(a).append(c));
		this.container.append(b)
	},
	_onbeforeload : function() {
		this.showLoading(true)
	},
	_onafterload : function() {
		if (this.params.value != null) {
			this.selectByValue(this.params.value)
		}
		this.showLoading(false)
	},
	_initPanel : function() {
		var e = this.params.showstyle;
		var c = AI.copyProps(this.params, ["allowfilter", "name", "ds",
						"initload", "multisel", "showico", "showall", "alltxt",
						"allval", "asyn", "url", "shadow", "maxheight"]);
		c.width = this.params.panelwidth;
		c.height = this.params.panelheight;
		c.onselected = AI.bind(this._setComboxValue, this);
		var d = this.params.value, a = this;
		if (AI.isTrue(this.params.asyn)) {
			c.onbeforeload = AI.bind(this._onbeforeload, this);
			c.onafterload = AI.bind(this._onafterload, this)
		}
		if (e) {
			var b = this.style[e];
			if (e == "group") {
				c.isGroup = true
			}
			if (b) {
				this.panel = new b(c)
			} else {
				this.error("Panel类型[ AI.Comp.Panel." + e + "Panel ]未定义!")
			}
		}
		if (!this.panel) {
			this.panel = new AI.Comp.ComboxPanel(c)
		}
		this.panel.addClass("AI-Combox");
		if (d != null && !AI.isTrue(this.params.asyn)) {
			this.selectByValue(d)
		}
		this.panel.applyTo()
	},
	_initHiddenField : function() {
		var d = this.params.id || this.params.name, a = this;
		var b = this.params.name || this.params.id;
		var e = "<input type='hidden' id='#id#' name='#name#' _id='#_id#'/>";
		var c = this._getHiddenFileds(b), f = "";
		$.each(AI.keys(c), function(g, h) {
					f += AI.template(e, {
								id : c[h],
								name : c[h],
								_id : h
							})
				});
		this.container.append(f)
	},
	_getHiddenFileds : function(b) {
		var c = {
			val : b
		};
		var a = this.params.submitfields;
		if (!a) {
			return c
		}
		var d = (a + "").split(",");
		$.each(d, function(f, h) {
					var e = (h + "").split(":");
					if (e.length > 0 && e.length < 3) {
						if (e[0] == "val") {
							return
						}
						var g = e[0].substring(0, 1).toUpperCase()
								+ e[0].substring(1);
						c[e[0]] = ((e.length == 1)) ? b + g : e[1]
					}
				});
		return c
	},
	_setComboxValue : function(j) {
		var j = j || this.panel.getValue();
		if (!j) {
			return
		}
		var g = $(".combox-input", this.container), h = AI
				.isTrue(this.params.multisel), e = $("input[type=hidden]",
				this.container), i = "", c = "", f = this, b = {};
		$.each(j, function(k, m) {
					for (var n in m) {
						var l = b[n];
						b[n] = (AI.isUndefined(l) ? "" : l + ",") + m[n]
					}
				});
		var a = b.txt || this.params.emptytxt;
		g.text(a).attr("title", a);
		if (!h) {
			if (AI.isTrue(this.params.showico)) {
				g.removeClass().addClass("combox-input combox-ico "
						+ (b.ico || "ico-combox-default"))
			}
			this.collapse()
		}
		e.each(function(k, m) {
					var l = $(m);
					var n = $(m).attr("_id");
					if (n == "val") {
						i = l.val();
						c = b.val || ""
					}
					l.val(b[n] || "")
				});
		if (i != c) {
			var d = this.getValue(j);
			this._cascade(d);
			this.callback("onchange", d)
		}
	},
	_judgeExist : function(c) {
		var b = $(":input[name=" + this.params.name + "]", this.container)
				.val();
		var a = (b + "").split(",");
		if (!b || b == "" || $.inArray(c, a) == -1) {
			return false
		} else {
			return true
		}
	},
	_setPosition : function() {
		var c = $(".combox-select", this.container);
		var a = c.offset();
		var b = (AI.isTrue(this.params.shadow)) ? (a.left - 5) : a.left;
		this.panel.setPosition({
					left : b,
					top : a.top + c.height()
				})
	},
	_resetComboxStyle : function() {
		$("div.AI-Combox .combox-select").removeClass()
				.addClass("combox-select combox-select-normal");
		$("div.AI-Combox .combox-arrow").removeClass()
				.addClass("combox-arrow combox-arrow-normal")
	},
	_render : function() {
		var a = this.params.id || this.params.name;
		this.container.attr("id", "AI-" + a).data("_AI_COMP_OBJ", this);
		this.getEl().removeAttr("id").append(this.container)
	},
	_cascade : function(c) {
		var d = this.params.cascade;
		if (d) {
			if (AI.isString(d)) {
				d = AI.getComp(d)
			}
			if (d instanceof AI.Comp.Combox) {
				var a = this.panel._getCascadeStore(c.val);
				var b = this.params.callback["oncascade"];
				d.panel.removeItem();
				d._setComboxValue();
				d.panel._cascadeData(c, a, function(e) {
							if (d.cascadeInit == true) {
								d.selectByValue(d.params.value);
								d.cascadeInit = false
							}
							b.call(null, e)
						})
			} else {
				AI.log("联动组件设置不正确!")
			}
		}
	},
	isExpanded : function() {
		return this.panel && this.panel.isVisible()
	},
	expand : function() {
		if (this.isExpanded()) {
			return
		}
		this._setPosition();
		this.panel.show();
		$(document).bind("mousedown", {
					obj : this
				}, this.collapse)
	},
	collapse : function(a) {
		var b;
		if (this instanceof AI.Comp.Combox) {
			b = this
		} else {
			b = a.data.obj
		}
		if (!b.isExpanded()) {
			return
		}
		b.panel.hide();
		$(document).unbind("mousedown", this.collapse);
		b._resetComboxStyle();
		return false
	},
	selectByIndex : function(a) {
		if (this.panel.selectByIndex) {
			this.panel.selectByIndex(a)
		}
	},
	selectByValue : function(a) {
		if (this.panel.selectByValue) {
			this.panel.selectByValue(a)
		}
	},
	addItem : function(a) {
		this.callback("onAdd");
		if (this.panel.addItem) {
			this.panel.addItem(a)
		}
	},
	removeItem : function(a) {
		this.callback("onRemove");
		if (this.panel.removeItem) {
			this.panel.removeItem(a)
		}
		this._setComboxValue()
	},
	reset : function() {
		if (this.panel.clearSelect) {
			this.panel.clearSelect()
		}
		this._setComboxValue()
	},
	getValue : function(a) {
		var b = a || this.panel.getValue();
		if (AI.isTrue(this.params.multisel)) {
			return b
		} else {
			return b[0] ? b[0] : {}
		}
	},
	getVal : function() {
		var a = $("input[type=hidden]", this.container);
		return a.filter("[_id=val]").val() || ""
	},
	getTxt : function() {
		var a = $("input[type=hidden]", this.container);
		return a.filter("[_id=txt]").val() || ""
	},
	getHiddenValue : function() {
		var b = $("input[type=hidden]", this.container);
		var a = {};
		$.each(b, function(d, c) {
					a[c.attr._id] = c.val()
				});
		return a
	},
	show : function() {
		this.container.show()
	},
	showLoading : function(a) {
		var b = $(".combox-input", this.container);
		var c = $(".combox-input-loading", this.container);
		if (c.length == 0) {
			c = $("<span class='combox-input-loading'><img src='" + AI.imgPath
					+ "/PIC/loading_small.gif'/>&nbsp;&nbsp;Loading...</span>");
			b.parent().append(c)
		}
		if (a) {
			b.hide();
			c.show()
		} else {
			c.hide();
			b.show()
		}
	}
});
AI.Comp.Calendar = AI.create();
AI.Comp.Calendar.prototype = AI.extend(new AI.Component, {
	initialize : function(a) {
		this.params = {
			el : null,
			name : null,
			displayformat : null,
			format : "yyyy-MM-dd",
			readonly : true,
			showtype : "day",
			width : 180,
			value : null,
			mindate : null,
			maxdate : null,
			selother : true,
			showweek : false,
			allowclear : false,
			value : "",
			cascade : null,
			defaultfmt : {
				day : "yyyy-MM-dd",
				month : "yyyyMM",
				time : "HH:mm:ss",
				timestamp : "yyyy-MM-dd HH:mm:ss"
			}
		};
		AI.extend(this.params, a || {});
		this._render()
	},
	_initInputBox : function() {
		var c = $("<div class='AI-Calendar calendar-border'/>");
		var o = $("<span class='calendar-input'/>");
		var l = this.params.id || this.params.name;
		var m = $("<input type='hidden'/>").attr("name", this.params.name)
				.attr("id", l);
		var n = this.params.format, f = this.params.showtype, d = this.params.mindate, a = this.params.maxdate, k = this.params.selother, g = AI
				.isTrue(this.params.readonly), j = this.params.cascade, h = this.params.showweek, e = this.params.allowclear;
		displayFormat = this.params.displayformat;
		if (!displayFormat) {
			displayFormat = this.params.defaultfmt[f]
		}
		c.hover(function() {
					$(this).removeClass("calendar-border")
							.addClass("calendar-border-hover")
				}, function() {
					$(this).removeClass("calendar-border-hover")
							.addClass("calendar-border")
				});
		var i = {
			skin : "ext",
			readOnly : g,
			highLineWeekDay : k,
			isShowOthers : true,
			dateFmt : displayFormat,
			startDate : "%y%M%d",
			isShowWeek : h,
			isShowClear : e,
			vel : l
		};
		if (d) {
			i.minDate = d
		}
		if (a) {
			i.maxDate = a
		}
		if (n) {
			i.realDateFmt = n
		}
		if (j && (j instanceof AI.Comp.Calendar)) {
		}
		var b = this.params.value;
		if (b && b.trim != "") {
			o.text(b);
			m.val(b)
		}
		c.append(o).append(m).bind("click", function() {
					WdatePicker(i)
				});
		return c
	},
	_render : function() {
		this.container = this._initInputBox();
		var a = this.params.id || this.params.name;
		this.container.attr("id", "AI-" + a).data("_AI_COMP_OBJ", this);
		this.getEl().removeAttr("id").append(this.container)
	},
	setValue : function(b) {
		this.container.find(".calendar-input").text(b);
		var a = this.params.id || this.params.name;
		this.container.find("#" + a).val(b)
	}
});
AI.Comp.Dialog = AI.create();
AI.Comp.Dialog.zIndex = 9000;
AI.Comp.Dialog.prototype = AI.extend(new AI.Component, {
	initialize : function(a) {
		this.params = {
			width : 450,
			height : 300,
			title : "",
			allowDrag : true,
			iframe : false,
			allowResize : true,
			modal : false
		};
		AI.extend(this.params, a || {});
		this._initDialog()
	},
	_initDialog : function() {
		var a = ['<div class="AI-Dialog">', '<div class="dialog_left_bottom">',
				'<div class="dialog_left_top">',
				'<div class="dialog_right_bottom">',
				'<div class="dialog_right_top">',
				'<div class="dialog_title"/>', '<div class="dialog_content"/>',
				'<div class="dialog_bottom"></div>',
				"</div></div></div></div></div>"];
		this.$dialog = $(a.join(""));
		this._initTitleBtn();
		this._initEvent();
		this._render();
		this.resetSize(this.params.width || 300, this.params.height || 200)
	},
	_initTitleBtn : function() {
		var b = $(".dialog_title", this.$dialog), a = this;
		var c = $('<a href="#" class="icon_dialog_close" title="关闭"/>').click(
				function() {
					a.hide()
				});
		b.append(c)
	},
	_initEvent : function() {
		if (AI.isTrue(this.params.allowDrag)) {
			$(".dialog_title", this.$dialog).css("cursor", "move");
			var b = this;
			this.$dialog.draggable({
						handle : ".dialog_title"
					})
		}
		if (AI.isTrue(this.params.allowResize)) {
			var a = $(".dialog_bottom", this.$dialog);
			a.append('<span class="dialog_resizeIco">');
			$(".dialog_left_bottom", this.$dialog).resizable({
				minHeight : this.params.height,
				minWidth : this.params.width,
				onResize : function() {
					var c = $(".dialog_left_bottom", this.$dialog)
							.outerHeight();
					$(".dialog_content", this.$dialog).height(parseInt(c) - 25
							- 40 - 5)
				}
			})
		}
	},
	_render : function() {
		var a = this.params.id || this.params.el;
		this.$dialog.attr("id", "AI-" + a).data("_AI_COMP_OBJ", this);
		$("body").append(this.$dialog)
	},
	_load : function() {
		this.setTitle(this.params.title);
		var d = this.params.url, f = this.params.iframe, g = this.params.el, c = $(
				".dialog_content", this.$dialog), a = this;
		if (d) {
			a.showLoading(true);
			if (AI.isTrue(f)) {
				var e = $('<iframe allowTransparency="true" width="100%" height="100%" frameborder="0" scrolling="no"/>')
						.css({
									display : "none"
								});
				e.appendTo(c);
				e.attr("src", d);
				e.bind("load", function() {
							e.css("display", "block");
							var h = e.contents().find("body");
							if (h.height() == 0) {
								h = e.contents().find("html")
							}
							e.parent(".dialog_content").css("overflow-x",
									"auto");
							e.css({
										width : h.width(),
										height : h.height()
									});
							a.showLoading(false)
						})
			} else {
				c.load(d, null, function() {
							a.showLoading(false)
						})
			}
			return
		}
		if (g) {
			var b = $("#" + g);
			if (b.length > 0) {
				c.append(b.show())
			}
		}
	},
	addButton : function(b, e, f) {
		var d = $(".dialog_bottom", this.$dialog);
		var a = d.find("p");
		if (a.length == 0) {
			a = $("<p/>");
			d.append(a)
		}
		var c = $('<a class="dialog_button" href="javascript:void(0);"><input type="button" value="'
				+ b + '"/></a>');
		c.bind("click", function() {
					e.apply(null, f || [])
				});
		a.append(c)
	},
	setMsg : function(c, b) {
		if ($.inArray(b, ["info", "help", "warn", "error"]) == -1) {
			b = ""
		} else {
			b = "dialog_" + b.toLowerCase()
		}
		var a = $(".dialog_content", this.$dialog).empty();
		var d = '<div class="dialog_msg ' + b + '">' + c + "</div>";
		a.append(d);
		this.resetButton()
	},
	resetButton : function(a) {
		$(".dialog_bottom", this.$dialog).find("p").empty()
	},
	setTitle : function(c) {
		var b = $(".dialog_title", this.$dialog);
		var a = b.find("span");
		if (a.length == 0) {
			a = $("<span/>");
			b.append(a)
		}
		a.html(c)
	},
	resetSize : function(a, b) {
		$(".dialog_left_bottom", this.$dialog).width(a);
		$(".dialog_content", this.$dialog).height(b)
	},
	applyTo : function(a) {
	},
	show : function() {
		if (AI.isTrue(this.params.modal)) {
			var a = $("#AI_dialog_mask");
			if (a.length == 0) {
				a = $('<div class="AI-dialog-mask" id="AI_dialog_mask"></div>')
						.css({
									zIndex : AI.Comp.Dialog.zIndex++,
									width : AI.getPageArea().width,
									height : AI.getPageArea().height
								}).appendTo($(document.body))
			}
			a.css("display", "block")
		}
		this.center()
	},
	hide : function() {
		mask = $("#AI_dialog_mask").css("display", "none");
		this.$dialog.hide()
	},
	setPosition : function(a) {
	},
	center : function() {
		alert($(document).width() + "---" + this.$dialog.get(0))
	},
	showLoading : function(a) {
		var b = $(".dialog_content", this.$dialog);
		var c = b.find("div.dialog_loading");
		if (c.length == 0) {
			c = $("<div class='dialog_loading'><img src='" + AI.imgPath
					+ "/PIC/loading_small.gif'/><span>Loading...</span></div>");
			b.append(c)
		}
		b.children().css("display", a == true ? "none" : "block");
		c.css("display", a == true ? "block" : "none")
	},
	destory : function() {
	}
});
$(document).ready(function() {
	var compType = {
		combox : AI.Comp.Combox,
		calendar : AI.Comp.Calendar,
		tab : null,
		grid : null,
		dialog : null
	};
	var comps = $(".AI-Comp");
	$.each(AI.keys(compType), function(index, type) {
				var filterComps = comps.filter("[type=" + type + "]");
				createComp(type, filterComps, true)
			});
	function createComp(type, compAry, judge) {
		var stack = [];
		$.each(compAry, function(idx, comp) {
					var _comp = $(comp), attr = comp.attributes, attrAry = {};
					var objAttr = ["ds"];
					var _cascade = _comp.attr("cascade");
					if (judge == true && _cascade) {
						stack.push(comp);
						return
					}
					$.each(attr, function(i, attribute) {
								if (attribute.specified) {
									var _attr_ = attribute.nodeName
											.toLowerCase();
									var _val_ = attribute.nodeValue;
									if (_attr_ == "type" || _attr_ == "class") {
										return
									}
									if ($.inArray(_attr_, objAttr) != -1) {
										try {
											_val_ = eval(_val_);
											attrAry[_attr_] = _val_;
											window[_val_] = null
										} catch (E) {
											AI.log("---")
										}
									} else {
										attrAry[_attr_] = _val_
									}
								}
							});
					attrAry.el = _comp;
					var compFunc = compType[type];
					if (AI.isFunction(compFunc)) {
						try {
							var obj = new compFunc(attrAry);
							_comp.data("_AI_COMP_OBJ", obj)
						} catch (E) {
							AI.log(E)
						}
					}
				});
		if (stack.length > 0) {
			stack.reverse();
			createComp(type, stack, false)
		}
	}
});