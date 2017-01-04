AI.Comp.TreePanel = AI.create();
AI.Comp.TreePanel.prototype = AI.extend(new AI.Comp.FilterPanel, {
			initialize : function(_options) {
				AI.Comp.FilterPanel.prototype.initialize.call(this, _options);
				this.params = {
					name:'',
					multisel : false,
					ds : [],
					showico : false,
					showTips : true,
					asyn : false,
					url : '',
					el : null,
					isGroup : false,
					showAll : false,
					initload : true,
					onselected : AI.emptyFunc,
					onstoreload : AI.emptyFunc
				}
				AI.extend(this.params, _options || {});
				this._fillData();
				if (this.params['el']) {
					this._render();
				}	
			},
			_initTreeConfig:function(store){
				var _conf={},_opts={},_self=this;
				_conf['data'] = {
					type : "json",
					opts : _opts
				};
				if (AI.isTrue(this.params['asyn'])) {
					_opts['asyn'] = true;
					_opts['url'] = this.params['url'];
					_opts['method'] = 'post';
					var _callback={};
					_callback['ondata']=function(data,treeObj){
						var _data=_self._convertJSONStore(data);
						return _data;
					};
					_conf['callback']=_callback;
				} else {
					_opts['static'] = convertJSONStore(store);
				}
				_conf['ui']={animation:200};
				if(AI.isTrue(this.params['multisel'])){
					_conf['plugins']={checkbox : {}};
					_conf['ui']['theme_name']= "checkbox";
					_conf['ui']['selected_parent_close']=false;
				}
				return _conf;
			},
			_render:function(){
				var obj =this.params['el'];
				obj=(AI.isString(obj)) ? $('#' + obj) : obj;
				this.addClass('AI-Comp');
				this.applyTo();
				this.setDisplay();
			},
			_fillData:function(){
				var store=this.params['ds']||[];
				var div=$('<div>');
				div.tree(this._initTreeConfig(store));
				delete this.params['ds'];
				this.getContentPanel().append(div).bind('mousedown', function() {
					return false
				});
			},
			_convertJSONStore : function(store) {
				data = [], _self = this;
				$.each(store, function(index, item) {
							var _tmp = createJSONData(item, -1);
							data.push(_tmp);
						});
				function createJSONData(_item, pid) {
					var obj = {};
					var children = _item['children'], childAry = [];
					var attrs = AI.keys(_item);
					var _filterAttr = ['children','txt', 'ico', 'asyn', 'url'];
					obj['attributes']={};
					$.each(attrs, function(index, _attr) {
								if ($.inArray(_attr, _filterAttr) == -1) {
									obj['attributes'][_attr] = _item[_attr] || '';
								}
							})
					obj['attributes']['pid'] = pid;
					var _data = {
						title : _item['txt']
					}
					if (AI.isTrue(_self.params['showico'])) {
						_data['icon'] = _item['ico'];
					}
					obj['data'] = _data;
					if (children && children instanceof Array
							&& children.length > 0) {
						$.each(children, function(index, child) {
									var _child = createJSONData(child,
											_item['val']);
									childAry.push(_child);
								});
					}
					if (childAry.length > 0) {
						obj['children'] = childAry;
					}
					return obj;
				}
				return data;
			}
		});