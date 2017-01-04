/*
 * asiainfo UI abstract panel 1.0
 * 
 * Copyright (c) 2009 AsiaInfo Holding Inc.
 * 
 * depends AI.Core.js AI.Component.js
 */
AI.Comp.ComboxPanel = AI.create();
AI.Comp.ComboxPanel.prototype = AI.extend(new AI.Comp.FilterPanel(), {
	initialize : function(_options) {
		AI.Comp.FilterPanel.prototype.initialize.call(this, _options);
		this.params = {
			multisel : false,
			ds : [],
			name:'',
			showico : false,
			showtips : true,
			asyn : false,
			url : '',
			el : null,
			isGroup : false,
			showall : false,
			alltxt : '全部选项',
			allval : '-999',
			initload : true,
			width:190,
			onselected : AI.emptyFunc,
			onstoreload : AI.emptyFunc,
			maxheight:250,
			liheight:18
		}
		AI.extend(this.params, _options || {});
		if (AI.isTrue(this.params['asyn'])
				&& AI.isTrue(this.params['initload'])) {
			this._getStore();
		} else {
			this._fillData();
		}
		if (this.params['el']) {
			this._render();
		}
	},
	/** *********************************私有方法**************************************** */
	_getStore : function() {
		var url = this.params['url'];
		var _self = this;
		this._onload(true);
		$.getJSON(url, function(data) {
					_self._fillData(data);
				});
	},
	_render : function() {
		var obj =this.params['el'];
		obj=(AI.isString(obj)) ? $('#' + obj) : obj;
		this.applyTo(obj);
		this.panelBorder.addClass('AI-Combox');
		this.setDisplay();
	},
	_fillData : function(data) {
		var _store = data || this.params['ds'] || {};
		var _ul = this._fillDataByStore(_store);
		delete this.params['ds'];
		this.getContentPanel().append(_ul).bind('mousedown', function() {
					return false
				});
	},
	_fillDataByStore : function(store) {
		var _self = this, _ul = null;
		if (store) {
			_ul = $('.combox-listData', this.getContentPanel());
			if (_ul.length == 0) {
				_ul = $('<ul>').addClass('combox-listData');
			}
			if (AI.isTrue(this.params['showall'])) {
				_ul.append(this._createDataDom({
							val : this.params['allval'],
							txt : this.params['alltxt'],
							all : 1
						}).attr('_all', 1));
			}
			$.each(store, function(index, item) {
						var _li;
						if (AI.isTrue(_self.params['isGroup'])) {
							_li = _self._createGroupDataDom(item);
						} else {
							_li = _self._createDataDom(item);
						}
						if (_li) {
							if (_li instanceof Array) {
								$.each(_li, function(_index, _item) {
											_ul.append(_item);
										});
							} else {
								_ul.append(_li);
							}
						}
					});
		}
		if(!this.params['height']){
			this.judgeHeight(this._calHeight(_ul.find('li').length));
		}
		this._onload(false);
		return _ul
	},
	_cascadeData : function(val, store,_callback) {
		var value=val['val'];
		if (AI.isTrue(this.params['asyn'])) {
			var url = this.params['url'], _self = this;
			this._onload(true);
			$.getJSON(url, {
						val : value
					}, function(data) {
						_self._fillDataByStore(data);
						_callback.call(null);
					});
		} else {
			this._fillDataByStore(store);
			_callback.call(null,val);
		}
	},
	_createGroupDataDom : function(item) {
		if (!item)
			return;
		var _li = $('<li>').attr('val', item['val']).text(item['txt'])
				.addClass('combox-li-group');
		var items = item['children'], _self = this, _liAry = [_li];
		if (items && (items instanceof Array)) {
			$.each(items, function(index, _item) {
						_item['pid'] = item['val'];
						_liAry.push(_self._createDataDom(_item));
					});
		}
		return _liAry;
	},
	_getAttr:function(item){
		var attrs={};
		var fields=['val','ico','pid','txt','desc','children'];
		$.each(AI.keys(item),function(index,it){
			if($.inArray(it,fields)==-1){
				attrs[it]=item[it]||'';
			}		
		});
		return attrs;
	},
	_createDataDom : function(item) {
		if (!item)
			return;
		if (item['val'] && item['val'] != '') {
			var _li = $('<li>').attr('val', item['val']);
			if (item['pid']) {
				_li.attr('pid', item['pid']);
			}
			if (AI.isTrue(this.params['multisel']) && !item['all'] == 1) {
				_li.append(this._appendCheckBox(_li, item['val']));
			}
			if (AI.isTrue(this.params['showico']) && !item['all'] == 1) {
				var ico = item['ico'] || 'combox-default';
				_li.append(this._appendICO(ico));
			}
			_li.append(item['txt']);
			_li.attr('title', (item['desc'] && item['desc'] != '')
							? item['desc']
							: item['txt']);
			_li.data('_attr',this._getAttr(item));
			_li.hover(function() {
						$(this).addClass('combox-li-hover');
					}, function() {
						$(this).removeClass();
					});
			_li.bind('mousedown', {
						obj : this
					}, this._selectItem);
			_li.hover(function() {
						$(this).addClass('combox-li-hover');
						var tmp = $('.checkbox', this);
						if (!tmp.hasClass('checkbox-checked')) {
							tmp.removeClass()
									.addClass('checkbox checkbox-hover');
						}
					}, function() {
						$(this).removeClass();
						var tmp = $('.checkbox', this);
						if (!tmp.hasClass('checkbox-checked')) {
							tmp.removeClass()
									.addClass('checkbox checkbox-normal');
						}
					});
			var _children = item['children'];
			if (_children && _children.length > 0) {
				_li.data('_items', _children);
			}
			return _li;
		}
		return null;
	},
	_selItem : function(target) {
		var _self = this;
		var _func = this.params['onselected'];
		if (!target || target.length == 0)
			return;
		if (AI.isTrue(this.params['multisel'])) {
			var _ary = [];
			if (!(target instanceof Array)) {
				_ary.push(target);
			}else{
				_ary=target;
			}
			$.each(_ary, function(index, item) {
						var _item = $(item);
						var isSel = _item.attr('_sel');
						var checkbox = $('.checkbox', _item);
						_item.attr('_sel', (isSel && isSel == 1) ? 0 : 1);
						checkbox.toggleClass('checkbox-checked');
					});
		} else {
			var li = $('ul>li', this.getContentPanel()).attr('_sel', 0);
			target.attr('_sel', 1);
		}
		if (AI.isFunction(_func)) {
			_func.call({});
		}
	},
	_selectItem : function(event) {
		var _obj = event.data.obj;
		if (_obj) {
			_obj._selItem($(this));
		}
		return false;
	},
	_appendCheckBox : function(val) {
		return '<span class="checkbox checkbox-normal"/>';
	},
	_appendICO : function(ico) {
		return '<span class="combox-list-ico ico-' + ico + '"/>';
	},
	_onload : function(flag) {
		if (!AI.isTrue(this.params['asyn']))
			return;
		var func = this.params['onstoreload'];
		this.loaded = !flag;
		this.showLoading(flag);
		if (AI.isFunction(func)) {
			func.call({}, flag);
		}
	},
	_judgeExist : function(val) {
		var lis = $('ul>li', this.getContentPanel());
		var _exist = false;
		lis.each(function(index, item) {
					var _item = $(item);
					if (_item.attr('val') == val) {
						_exist = true;
						return true;
					}
				});
		return _exist;
	},
	_getCascadeStore : function(pid) {
		var lis = $('ul>li', this.getContentPanel()), ary = [];
		if (pid == this.params['allval']) {
			// $.each(lis,function(index,item){
			// var _item=$(item);
			// if(_item.length>0){
			// var data=_item.data('_items');
			// ary=$.merge(ary,data||[]);
			// }
			// });
		} else {
			var _lis = lis.filter('[val="' + pid + '"]');
			if (_lis.length > 0) {
				ary = _lis.data('_items') || [];
			}
		}
		return ary;
	},
	_calHeight:function(count){
		var maxh=parseInt(this.params['maxheight']),
			lih=parseInt(this.params['liheight']);
		var totalh=lih*count+40;
		return (totalh>maxh)?maxh:totalh;
	},
	/** ******************************************************************************* */
	/** 根据数据索引选中数据项* */
	selectByIndex : function(index) {
		var lis = $('ul>li', this.getContentPanel()).eq(index)
				.filter('[_sel!=1]');
		this._selItem(lis.eq(0));
	},
	/** 选中传入的数据项* */
	selectByValue : function(val) {
		if(val==undefined)return;
		val=val+'';
		var lis = $('ul>li', this.getContentPanel()), vals = val.split(","), _self = this, ary = [];
		$.each(vals, function(index, item) {
					var li = lis.filter('[val=' + item + ']')
							.filter('[_sel!=1]');
					if (li.length > 0)
						ary.push(li.eq(0));
				});
		_self._selItem(AI.isTrue(this.params['multisel']) ? ary : ary.pop());
	},
	/** 添加一个数据项* */
	addItem : function(item) {
		var ary=[],_self=this;
		if(!(item instanceof Array)){
			ary.push(item);
		}else{
			ary=item;
		}
		var ul=$('ul', _self.getContentPanel());
		$.each(ary,function(index,obj){
			if (_self._judgeExist(obj['val'])) return;
			var li = _self._createDataDom(obj);
			ul.append(li);
		});
		if(!this.params['height']){
			this.judgeHeight(this._calHeight(ul.find('li').length));
		}		
	},
	/** 删除数据项* */
	removeItem : function(item) {
		var ul = $('ul', this.getContentPanel()),ary=[];
		if (item) {
			if(!(item instanceof Array)){
				ary.push(item);
			}else{
				ary=item;
			}
			var li=$('li', ul);
			$.each(ary,function(index,obj){
				li.remove('[val=' + obj["val"] + ']');
			});
		} else {
			ul.empty();
			this.clearSelect();
		}
		if(!this.params['height']){
			this.judgeHeight(this._calHeight(ul.find('li').length));
		}		
	},
	/** 获取当前选中值* */
	getCurSel : function() {
		var lis = $('ul>li', this.getContentPanel()), selLis = lis
				.filter('[_sel=1]'), result = [], _self = this;
		$.each(selLis, function(index, item) {
					var _item = $(item);
					var _selResult = {
						val : _item.attr('val'),
						pid : _item.attr('pid') || null,
						txt : _item.text()
					};
					var _data=_item.data('_attr');
					if(_data){
						_selResult['attr']=	_data;		
					}
					if (AI.isTrue(_self.params['showico'])
							&& !AI.isTrue(_self.params['multisel'])) {
						var ico = _item.find('span.combox-list-ico');
						_selResult['ico'] = "ico-combox-default";
						if (ico.length > 0) {
							var cls = ico.get(0).className;
							var index = cls.indexOf('ico-');
							_selResult['ico'] = (index == -1) ? "" : cls
									.substring(index);
						}
					}
					result.push(_selResult);
				})
		return result;
	},
	getValue:function(){
		return this.getCurSel();
	},
	/** 清除所有当前选择项* */
	clearSelect : function() {
		var lis = $('ul>li', this.getContentPanel()).attr('_sel', 0);
		if (AI.isTrue(this.params['multisel'])) {
			lis.find('span.checkbox-checked').removeClass()
					.addClass('checkbox checkbox-normal');
		}
	},
	/** 根据传入字符串,过滤数据列表* */
	doFilter : function(event) {
		var input = event.target, key;
		if (input) {
			key = input.value;
			var lis = $('ul>li', this.getContentPanel()).filter(function() {
						return !$(this).hasClass('combox-li-group');
					});
			if (key == "") {
				lis.show();
				return;
			}
			var i = 0;
			lis.filter(function(index) {
						var val = $(this).text();
						var pattern = new RegExp(key, "gi");
						i++
						return !pattern.test(val);
					}).hide();
		}
	}
});