/*
 * asiainfo UI Combox 1.0
 * 
 * Copyright (c) 2009 AsiaInfo Holding Inc.
 * 
 * depends AI.Core.js AI.Component.js
 * 
 */
AI.Comp.Combox = AI.create();
AI.Comp.Combox.prototype = AI.extend(new AI.Component(), {
	initialize : function(_options) {
		this.params = {
			el : null,
			id:null,
			name : null,
			width : 180,
			multisel : false,
			allowfilter : false,
			ds : null,
			showico : false,
			showtips : true,
			panelwidth : 190,
			overflow : 'hidden',
			value : null,
			initload : true,
			asyn : false,
			url : '',
			showstyle : 'normal',
			submitfields : null,
			emptytxt : '---请选择---',
			cascade : null,
			callback:{
				onchange : AI.emptyFunc,
				oncascade:AI.emptyFunc,
				onfilter : AI.emptyFunc,
				onAdd : AI.emptyFunc,
				onRemove : AI.emptyFunc			
			}
		};
		AI.extend(this.params, _options || {});
		this.submitfields = ['val', 'txt', 'pid'];
		this.style = {
			normal : AI.Comp.ComboxPanel,
			group : AI.Comp.ComboxPanel,
			tree : AI.Comp.TreePanel
		}
		this.container = $('<div class="AI-Combox">').noSelect();
		this._initInputBox();
		this._initHiddenField();
		this._initPanel();
		this._render();
		
	},
	/** ********************************************私有方法************************************* */
	/** 初始化输入框panel* */
	_initInputBox : function() {
		var selectpanel = $("<div>")
				.addClass('combox-select combox-select-normal').css('width',this.params['width']);
		// ***************************************************************
		var setSelectStyle = function(_obj, style) {
			if ($('.combox-arrow', _obj).hasClass('.combox-arrow-clicked')) {
				return;
			}
			var oldStyle = (style == 'hover') ? 'normal' : 'hover';
			_obj.removeClass('combox-select-' + oldStyle)
					.addClass('combox-select-' + style);
			$('.combox-arrow', _obj).removeClass('combox-arrow-' + oldStyle)
					.addClass('combox-arrow combox-arrow-' + style);
		}
		selectpanel.hover(function() {
					setSelectStyle($(this), "hover");
				}, function() {
					setSelectStyle($(this), "normal");
				}).bind("mousedown", function(_obj) {
			return function() {
				_obj._resetComboxStyle();
				$('.combox-arrow', $(this)).removeClass()
						.addClass('combox-arrow combox-arrow-clicked');
				if (!_obj.isExpanded()) {
					_obj.panel._hideAllPanel();
					_obj.expand();
				} else {
					_obj.collapse();
				}
				return false;
			}
		}(this));
		// **************************************************************
		var selectBorder = $("<div>").addClass('combox-left-border');
		var input = $("<span>").addClass('combox-input').attr('_init', true);
		input.text(this.params['emptytxt']);
		if (AI.isTrue(this.params['showico'])) {
			input.addClass("combox-ico ico-combox-default");
		}
		var arrow = $("<span>").addClass("combox-arrow combox-arrow-normal");
		selectpanel.append(selectBorder.append(input).append(arrow));
		this.container.append(selectpanel);
	},
	/** 初始化数据列表panel* */
	_initPanel : function() {
		var style = this.params["showstyle"];
		var _params = AI.copyProps(this.params, ['allowfilter', 'name', 'ds',
						'initload', 'multisel', 'showico', 'showall', 'alltxt',
						'allval', 'asyn', 'url']);
		_params["width"]=this.params['panelwidth'];
		_params["height"]=this.params['panelheight']
		_params["onselected"] = AI.bind(this._setComboxValue, this);
		_params["onstoreload"] = AI.bind(this.showLoading, this);
		if (style) {
			var panelRef = this.style[style];
			if (style == 'group') {
				_params['isGroup'] = true;
			}
			if (panelRef) {
				this.panel = new panelRef(_params);
			} else {
				this.error('Panel类型[ AI.Comp.Panel.' + style + "Panel ]未定义!");
			}
		}
		if (!this.panel) {
			this.panel = new AI.Comp.ComboxPanel(_params);
		}
		this.panel.addClass('AI-Combox');
		this.panel.applyTo();
	},
	/** 初始化隐藏域* */
	_initHiddenField : function() {
		var _id = this.params['id']||this.params['name'], _self = this;
		var _name=this.params['name']||this.params['id'];
		var _tpl_input = "<input type='hidden' id='#id#' name='#name#' _id='#_id#'/>";
		var _strInput = AI.template(_tpl_input, {
					id : _id,
					name:_name,
					_id : 'val'
				});
		var _field = this.params['submitfields'];
		if (_field) {
			try {
				var hideField = _field.split(",");
				$.each(hideField, function(index, item) {
							var _field_ = item.split(":");
							if (_field_.length != 2 || _field_[0] == 'val')
								return;
							if ($.inArray(_field_[0], _self.submitfields) != -1) {
								_strInput += AI.template(_tpl_input, {
											id : _field_[1],
											name:_field[1],
											_id : _field_[0]
										});
							}
						});
			} catch (E) {
				AI.log(E)
			}
		}
		this.container.append(_strInput);
	},

	_setComboxValue : function() {
		var result = this.panel.getCurSel();
		if (!result)
			return;
		var input = $('.combox-input', this.container), // combox文本框
		multisel = AI.isTrue(this.params['multisel']), // 是否多选
		fields = $('input[type=hidden]', this.container), // 所有的隐藏域
		oldVal = "", newVal = "", _self = this, _resultVal = {};
		// 汇总所有返回值
		$.each(result, function(index, item) {
					for (var field in item) {
						var _tmp = _resultVal[field];
						_resultVal[field] = (AI.isUndefined(_tmp) ? "" : _tmp
								+ ",")
								+ item[field];
					}
				});
		// 设置combox文本框
		var inputVal = _resultVal['txt'] || this.params.emptytxt;
		input.text(inputVal).attr('title', inputVal);
		// 如果不是多选，则收缩
		if (!multisel) {
			if (AI.isTrue(this.params['showico'])) {
				input.removeClass().addClass('combox-input combox-ico '
						+ _resultVal['ico']);
			}
			this.collapse();
		}
		// 设置隐藏域
		fields.each(function(index, item) {
					var _item = $(item);
					var field = $(item).attr('_id');
					if (field == 'val') {
						oldVal = _item.val();
						newVal = _resultVal['val'] || '';
					}
					if ($.inArray(field, _self.submitfields) != -1) {
						_item.val(_resultVal[field] || '');
					}
				});
		if (oldVal != newVal) {
			var _val=this.getValue();
			this._cascade(_val);// 触发联动
			this.callback('onchange',_val);
		}
	},

	/** 判断选中数据项是否存在* */
	_judgeExist : function(_val) {
		var val = $(':input[name=' + this.params['name'] + ']', this.container)
				.val();
		var vals = val.split(",");
		if (!val || val == '' || $.inArray(_val, vals) == -1) {
			return false;
		} else {
			return true;
		}
	},
	/** 设置数据列表Panel显示位置* */
	_setPosition : function() {
		var _input = $('.combox-select', this.container);
		var _offset = _input.offset();
		this.panel.setPosition({
					left : _offset.left,
					top : _offset.top + _input.height()
				});
	},
	/** 重设combox样式* */
	_resetComboxStyle : function() {
		$('div.AI-Combox .combox-select').removeClass()
				.addClass('combox-select combox-select-normal');
		$('div.AI-Combox .combox-arrow').removeClass()
				.addClass('combox-arrow combox-arrow-normal');
	},
	/** 将combox对象DOM* */
	_render : function() {
		var id=this.params['id']||this.params['name'];
		this.getEl().attr("id","AI-"+id).append(this.container);
		if (this.params['value']) {
			this.selectByValue(this.params['value']);
		}
	},
	/** 下拉框联动* */
	_cascade : function(val) {
		var _cascade = this.params['cascade'];
		if (_cascade){
			if(AI.isString(_cascade)){
				_cascade=AI.getComp(_cascade);
			}
			if (_cascade instanceof AI.Comp.Combox) {
				var store = this.panel._getCascadeStore(val['val']);
				_cascade.panel.removeItem();
				_cascade._setComboxValue();
				_cascade.panel._cascadeData(val, store,this.params["callback"]["oncascade"]);
			} else {
				AI.log('联动组件设置不正确!');
			}
		}
	},
	/** ********************************************公有方法************************************* */
	/** 获取combox是否展开* */
	isExpanded : function() {
		return this.panel && this.panel.isVisible();
	},
	/** 展开下拉列表* */
	expand : function() {
		if (this.isExpanded()) {
			return;
		}
		this._setPosition();
		this.panel.show();
		$(document).bind("mousedown", {
					obj : this
				}, this.collapse);
	},
	/** 收缩下拉列表* */
	collapse : function(evt) {
		var _obj;
		if (this instanceof AI.Comp.Combox) {
			_obj = this;
		} else {
			_obj = evt.data.obj;
		}
		if (!_obj.isExpanded()) {
			return;
		}
		_obj.panel.hide();
		$(document).unbind("mousedown", this.collapse);
		_obj._resetComboxStyle();
		return false;
	},
	/** 根据索引选中* */
	selectByIndex : function(index) {
		if (this.panel.selectByIndex) {
			this.panel.selectByIndex(index);
		}
	},
	/** 根据数据项选中* */
	selectByValue : function(val) {
		if (this.panel.selectByValue) {
			this.panel.selectByValue(val);
		}
	},
	/** 添加数据项* */
	addItem : function(item) {
		this.callback('onAdd');
		if (this.panel.addItem) {
			this.panel.addItem(item);
		}
	},
	/** 删除数据项* */
	removeItem : function(item) {
		this.callback('onRemove');
		if (this.panel.removeItem) {
			this.panel.removeItem(item);
		}
		this._setComboxValue();
	},
	/** * */
	reset : function() {
		if (this.panel.clearSelect) {
			this.panel.clearSelect();
		}
		this._setComboxValue();
	},
	getValue:function(){
		var result=this.panel.getValue();
		if(AI.isTrue(this.params['multisel'])){
			return result;
		}else{
			return result[0]?result[0]:{};
		}
	},
	getVal:function(){
		var hiddens = $('input[type=hidden]', this.container);
		return hiddens.filter('[_id=val]').val()||'';
	},
	getTxt:function(){
		var hiddens = $('input[type=hidden]', this.container);
		return hiddens.filter('[_id=txt]').val()||'';
	},
	/** 获取当前选中值* */
	getHiddenValue : function() {
		var fields = this.submitfields;
		var hiddens = $('input[type=hidden]', this.container);
		var result = {};
		$.each(fields, function(index, item) {
					var _hidden = hiddens.filter('[_id=' + item + ']');
					if (_hidden.length > 0 && _hidden.val() != '') {
						result[item] = _hidden.val();
					}
				});
		return result;
	},
	/** 显示加载中* */
	showLoading : function(flag) {
		var input = $('.combox-input', this.container);
		var loading = $('.combox-input-loading', this.container);
		if (loading.length == 0) {
			loading = $("<span class='combox-input-loading'><img src='"
					+ AI.imgPath
					+ "/PIC/loading_small.gif'/>&nbsp;&nbsp;Loading...</span>");
			input.parent().append(loading);
		}
		if (flag) {
			input.hide();
			loading.show();
		} else {
			loading.hide();
			input.show();
		}
	}
});