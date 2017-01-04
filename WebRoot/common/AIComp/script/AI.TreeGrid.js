var AI = AI || {};
(function($) {
	$.fn.extend({
				AI_TreeGrid : function(params) {
					var args = Array.prototype.slice.call(arguments, 1);
					return this.each(function() {
								if (typeof params == "string") {
									var _treeGrid = $.data(this,
											"$AI_TreeGrid$");
									_treeGrid[params].apply(_treeGrid, args);
								} else {
									new AI.TreeGrid(this, params);
								}
							});
				}
			});
	AI.TreeGrid = function(el, params) {
		this.el = $(el);
		this.options = $.extend({}, AI.TreeGrid.defaults, params);
		this._init();
		$.data(el, "$AI_TreeGrid$", this);
		this.options.onLoad.call({});
		return this;
	}
	AI.TreeGrid.defaults = {
		height : 500,  //默认表格高度
		width : 'auto', //默认表格宽度
		initState : "collapsed",// 初始化折叠expand,collapsed
		initExpandLevel : 1,// 初始化展开层次,为零时不展开
		ds : {}, //表格数据源
		colModel : [], //表格列模型
		hoverCol : true, //是否高亮显示表格列
		hoverRow :true,//是否高亮显示表格行
		cols : 8, //表格显示列控制
		moveCol : true, //是否允许列移动
		indent : 20,// 缩进间距
		asynLoad : true,// 是否异步加载
		dataUrl : null,//异步加载数据URL
		padding : 5, //表格单元格左边空白
		rootId : -1, //根节点
		firstCol : 250, //第一列标题列宽度
		onRowSelected:function(){},
		onLoad:function(){},
		moveColLast:false
	}
	AI.TreeGrid.prototype = {
		/**初始化**/
		_init : function() {
			this.el.addClass("AITreeGrid");
			var $thead = this._createTheadDOM();
			var $tbody = this._createTBodyDOM();
			var $tfooter = this._createTFooterDom();
			$thead.noSelect();//表头禁止选取
			this.el.append($thead);
			this.el.append($tbody);
			this.el.append($tfooter);
			this.options.ds={};
		    this._moveColLast();
		},
		
		/**从右向左显示列**/
		_moveColLast:function(){
			var _colLength= this.options.colModel.length;
			if(this.options.moveColLast&&_colLength>0){
				for(var i=0;i<_colLength;i++){
					this._moveCol('right');
				}
			}
		},
		
		/**创建表头区域DOM对象**/
		_createTheadDOM : function() {
			var _headDiv = $('<div>').addClass('headDiv');
			var _headTable = $('<div>').addClass('headTable');
			var _table = document.createElement('table');
			_table.cellPadding = 0;
			_table.cellSpacing = 0;
			var _thead = document.createElement('thead');
			var _tr = document.createElement('tr');
			var _colModel = this.options.colModel;
			if (_colModel.length == 0) {
				// 未指定表格列模型时，待完善
			}
			var _firstCol = this.options.firstCol;
			var _padding = this.options.padding;
			var _obj = this;
			$.each(_colModel, function(i, item) {
						if (!item) return false;
						var $th = $('<th/>').css('padding-left',
								_padding + "px");
						$th.attr('_index', i);
						if (i == 0) {
							if (_obj.options.moveCol) {//如果设置为列可移动
								var _moveL = $('<span>&nbsp;</span>')
										.addClass('moveLeft').click(function() {
													_obj._moveCol('left');
												});
								var _moveR2 = $('<span>&nbsp;</span>')
										.addClass('moveRight2').click(
												function() {
													_obj._moveCol('right');
												});
								var _moveR = $('<span>&nbsp;</span>')
										.addClass('moveRight').click(
												function() {
													_obj._moveCol('right');
												});
								$th.append(_moveR);
								$th.append(_moveL);
								$th.append(_moveR2);
							}
						} else {
							var _hoverCol = _obj.options.hoverCol;
							var _cols = _obj.options.cols;
							if (_hoverCol) {//如果设置为列可高亮显示
								$th.css('cursor', 'pointer').hover(function() {
											_obj._selCol(i, true);
										}, function() {
											_obj._selCol(i, false);
										});
							}
							if (i > _cols) {//设置初始列显示
								$th.hide();
							}
						}
						if (item.width) {
							$th.attr('width', item.width);
						} else {
							if (i == 0) {
								$th.attr('width', _firstCol).append('');
							}
						}
						$(_tr).append($th.append(item.desc));
					});
			$(_thead).append(_tr);
			$(_table).prepend(_thead);
			_headTable.append($(_table));
			_headDiv.append(_headTable);
			return _headDiv;
		},
		/**创建数据区域DOM对象*/
		_createTBodyDOM : function() {
			var _$dataDiv = $('<div>').addClass('dataDiv');
			_$dataDiv.height(this.options.height);
			var _$dataTable = $('<div>').addClass('dataTable');
			var _table = document.createElement('table');
			_table.cellPadding = 0;
			_table.cellSpacing = 0;
			var _tbody = document.createElement('tbody');
			var ds = this.options.ds;
			var _pid = this.options.rootId;
			if(ds!=null){
				if ($.isArray(ds)) {
					for (var i = 0; i < ds.length; i++) {
						this._createDataDOM(_tbody, ds[i], i, 1, _pid, false);
					}
				} else {
					this._createDataDOM(_tbody, ds, 0, 1, _pid, false);
				}
			}
			$(_table).append(_tbody);
			_$dataTable.append(_table);
			_$dataDiv.append(_$dataTable);
			return _$dataDiv;
		},
		/**创建数据DOM对象*/
		_createDataDOM : function(tbody, ds, index, level, pid, hide) {
			var $tr = $('<tr>');
			var _obj = this;
			$tr.addClass(((index) % 2 == 0) ? "even" : "odd");
			if (hide) {
				$tr.hide();
				$tr.attr('hide', true);
			}
			if(this.options.hoverRow==true){
				$tr.hover(function() {
							$(this).addClass('over');
						}, function() {
							$(this).removeClass('over');
						});
			}
			$tr.click(function() {
						$('tr', this.el).removeClass('selected');
						$(this).addClass('selected');
						_obj.options.onRowSelected.call({},$(this).attr('_id'),$(this).attr('_pid'),$(this).attr('level'));
					});
			var _colModel = this.options.colModel;
			var _firstCol = this.options.firstCol;
			var _padding = this.options.padding;
			var _indent = this.options.indent;
			var _initState = this.options.initState;
			var _initExpandLevel = this.options.initExpandLevel;
			var _cols = _obj.options.cols;
			var _hideChildren = false;
			var _class;
			if (_initState == 'collapsed' && level > _initExpandLevel) {
				_class = 'shrinker';
				_hideChildren = true;
			} else {
				_class = 'expander';
			}
			
			var _ths = $('.headTable  th', this.el);
			$.each(_colModel, function(i, item) {
						if (!item) return false;
						var $td = $('<td>');
						var th_hide=_ths.eq(i).css('display');
						if(th_hide=='none'){
							$td.hide();
						}
						$td.css('padding-left', _padding + "px");
						if (item.width) {
							$td.attr('width', item.width);
						} else {
							if (i == 0) {
								$td.attr('width', _firstCol)
							}
						}
						var _span = $('<span>&nbsp;</span>');
						var _children = ds['children'];
						if (i == 0) {
							if (($.isArray(_children) && _children.length > 0)
									|| !ds['leaf']) {
								if ((!_children || _children.length == 0)
										&& !ds['leaf']) {
									_class = "shrinker";
									$tr.attr('_asyn', true);
								}
								_span.addClass(_class);
								_span.click(function() {
											var expand = (this.className == 'expander')
													? false
													: true;
											_obj
													.expand(ds['id'], expand,
															false);
										});
							} else {
								_span.addClass('leaf');
							}
							$td.append(_span);
						}
						$td.append(ds[item.col]);
						if (i == 0) {
							$tr.attr('_id', ds['id']);
							$tr.attr('_pid', pid);
							$tr.attr('level', level);
							$td
									.css(
											'padding-left',
											(_padding + ((level - 1) * _indent))
													+ 'px');
						}
						$tr.append($td);
					});
			$(tbody).append($tr);
			if ($.isArray(ds['children']) && ds['children'].length > 0) {
				$.each(ds['children'], function(j, it) {
							_obj._createDataDOM(tbody, it, j, level + 1,
									ds['id'], _hideChildren);
						});
			}
		},
		/**创建表格底部**/
		_createTFooterDom : function() {
			var _div = $('<div>').addClass('bottomBar');
			_div.append('<span/>');
			return _div;
		},
		/**折叠所有节点*/
		collapseAll : function() {

		},
		/**展开所有节点*/
		expandAll : function() {

		},
		/**展开子节点**/
		expand : function(id, expand, reload) {
			var tr = $('tr[_id=' + id + ']', this.el);
			if(tr.length<1)return;
			if(expand&&tr.css('display')=='none'){
				this.expand(tr.attr('_pid'),true,false);
			}
			var _level = parseInt(tr.attr('level'));
			var _asyn = tr.attr('_asyn');
			var _loaded=tr.attr('_loaded');
			var loading = null;
			if (tr.next().find('.loading').length > 0) {
				loading = tr.next();
			}
			//如果需要异步加载，显示加载提示条，异步获取数据；
			if (_asyn == 'true' && loading == null&&_loaded!='true') {
				loading = this._showLoading(tr, $('td:first', tr)
								.css('padding-left')
								|| 0);
				var _pid = tr.attr('_id');
				if (this.options.dataUrl) {
					
					var _obj=this;
					$.getJSON(this.options.dataUrl,{
							id : _pid,
							level:_level
						}, function(ds) {
							var _tbody=$('<tbody>');
							if($.isArray(ds)){
								for(var i=0;i<ds.length;i++){
									var item=ds[i];
									_obj._createDataDOM(_tbody, ds[i], i, _level+1, _pid, false);
								}
							}else{
								_obj._createDataDOM(_tbody, ds, 0, _level+1, _pid, false);
							}
							loading.remove();
							tr.after($('tr',_tbody));
							tr.attr('_loaded',true);
							_tbody=null;
					});
				}
			} else {//展开下一级子节点，记录子节点的展开状态
				if (_level && !isNaN(_level)) {
					var _trs = tr.nextAll('tr');
					$.each(_trs, function(i, item) {
								var _lvl = parseInt($(item).attr('level'));
								if (_lvl && _lvl <= _level) {
									return false;
								}
								if (expand) {
									if (loading != null) {
										loading.css('display', '');
									}
									if (_level + 1 == _lvl) {
										$(item).css('display', '');
									} else if ($(item).attr('hide') == 'false') {
									}
								} else {
									$(item).hide();
								}
							});
				};
			}
			//修改节点展开图标样式
			if (expand) {
				var _span = $('span.shrinker', tr);
				_span.removeClass().addClass('expander');
			} else {
				var _span = $('span.expander', tr);
				_span.removeClass().addClass('shrinker');
			}
		},
		/**高亮显示某行数据,是否展开*/
		highLightShow : function(id,isExpand,reload) {
			var _trs=$('.dataTable tr', this.el).removeClass('selected');
			var _tr=$('.dataTable tr[_id='+id+']', this.el)
			if(isExpand&&_tr.length>0){
				this.expand(id,isExpand,reload);
			}
			if(_tr.length>0){
				_tr.addClass('selected');
				$('.dataDiv',this.el).get(0).scrollTop=_tr.get(0).offsetTop;
			}
			this.options.onRowSelected.call({},_tr.attr('_id'),_tr.attr('_pid'),_tr.attr('level'));
		},
		/**显示数据加载中进度条*/
		_showLoading : function(tr, padding) {
			var $tr = $('<tr>');
			var _ths = $('.headTable  th', this.el).filter(':visible');
			var $td = $('<td colspan=' + _ths.length + '>')
					.addClass('loading').css('padding-left', padding);
			var $div = $('<div>').html('数据加载中...... 请稍后!');
			$td.append($div);
			$tr.append($td);
			tr.after($tr);
			return $tr;
		},
		/**高亮显示某列*/
		_selCol : function(index, flag) {
			var _trs = $('.dataTable tr', this.el);
			if (!flag) {
				_trs.find('td').removeClass('sel');
			} else {
				_trs.each(function(i, item) {
							var td = $(item).find('td').eq(index);
							td.addClass('sel');
						});
			}
		},
		/**左移、右移列，控制列的显示范围*/
		_moveCol : function(dir) {
			var _cols = this.options.cols;
			var _ths = $('.headTable  th', this.el);
			var _dir = (dir == 'left') ? ':gt(0)' : ':last';
			var _hiddenCol = _ths.filter(':visible').filter(_dir);
			var _hiddenColIndex = parseInt(_hiddenCol.attr('_index')) || 0;
			if (_hiddenColIndex <= 1 && dir == "left")
				return;
			if (_hiddenColIndex >= _ths.length - 1 && dir == "right")
				return;
			var _hideCol = (dir == 'left')
					? _hiddenColIndex + _cols - 1
					: _hiddenColIndex - _cols + 1;
			var _showCol = (dir == 'left')
					? _hiddenColIndex - 1
					: _hiddenColIndex + 1;
			_ths.eq(_hideCol).hide();
			_ths.eq(_showCol).show();
			var _trs = $('.dataTable tr', this.el);
			_trs.each(function(i, item) {
						var td = $(item).find('td').eq(_hideCol);
						td.hide();
						td = $(item).find('td').eq(_showCol);
						td.show();
					});
		}
	};
	/**控制页面元素不能被选取；*/
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
})(jQuery);