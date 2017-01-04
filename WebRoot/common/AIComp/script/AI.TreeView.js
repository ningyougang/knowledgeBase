var AI = AI || {};
(function($) {
	$.fn.extend({
				AI_TreeView : function(params) {
					var args = Array.prototype.slice.call(arguments, 1);
					return this.each(function() {
								if (typeof params == "string") {
									var _treeView = $.data(this,
											"$AI.TreeView$");
									_treeView[params].apply(_treeView, args);
								} else {
									new AI.TreeView(this, params);
								}
							});
				}
			});
	$.extend(AI.TreeView, {});
	AI.TreeView = function(el, params) {
		this.el = $(el).css({top:0,left:'-500px'});
		this.options = $.extend({}, AI.TreeView.defaults, params);
		this.dm=this.options.dm;
		this.conf=this.options.config;
		this._init();
		$.data(el, "$AI.TreeView$", this);
		return this;
	};
	AI.TreeView.defaults = {
		config:{},//节点配置信息
		dm:{},  //节点数据模型定义
		params:{}
	}	
	AI.TreeView.prototype = {
		_init:function(){
			this.el.noSelect();
			var _docFrag=document.createDocumentFragment();
			if(!this.conf.expandUrl){
				this._createViewByConf(this.conf,_docFrag);
			}else{
				this._createViewByConf(this.conf,_docFrag);
			}
			this.el.append(_docFrag);
			this.drawLinkLine();
		},
		_createViewByConf:function(conf,docFrag,param){
			var _node,_level=1;
			var _pivot=this.el.get(0).offsetParent.offsetWidth/2;
			if(!param||param.level==1){
				_node=this._createNodeByConf(conf,{pivot:_pivot,warn:(conf.ds)?conf.ds.warn||false:false});
			}else{
				_node=this._createNodeByConf(conf,param);
			}
			if(!conf.children&&conf.expandUrl){
				_node.options.expandUrl=conf.expandUrl;
				_node.options.allowExpand=true;
				_node.onExpand=this.expandFunc(this);
				if(conf.initExpand!=true){
					_node.options.expand=false;
				}else{
					this._createViewByData(_node.options);
				}
			}
			docFrag.appendChild(_node.buildNodeDOM().get(0));
			if(conf.children){
				var _top=_node.options.top+_node.options.height;
				//以下代码未判断根节点展开方向为bottom的情况
				if(conf.expandDir=='bottom'){
					_top+=_node.options.space;
				}
				var _obj=this;
				var _left=0;
				var _childAlign=conf.childAlign;
				var _margin=conf.childMargin||10;
				var _count=(conf.children)?conf.children.length:0;
				var _totalWidth=0,_width=0;
				$.each(conf.children,function(index,item){
					if(index==0){
						_width=AI.ViewNode.nodeStyle[item.nodeType].width;
						_totalWidth=_count*_width+(_count-1)*_margin;
						if(_childAlign=='center'){
							_left=_pivot-_totalWidth/2+500;
							_left=(_left<=0)?0:_left;
						}
					}
					var _params={
						top:_top,
						left:_left,
						count:_count,
						index:index+1,
						pid:_node.options.id,
						level:_level+1,
						clickFunc:conf.clickFunc,
						overFunc:conf.overFunc,
						more:conf.more,
						judgeSize:conf.judgeSize
					};
					_obj._createViewByConf(item,docFrag,_params);
					_left+=_width+_margin;
				});
			}
		},
		_getCurExpandConf:function(options,conf){
			var confId=options.confId;
			var _conf=conf||this.options.config;
			var obj=this;
			if(_conf.nodeId!=options.confId){
				if(_conf.children){
					for(var i=0,j=_conf.children.length;i<j;i++){
						var item=_conf.children[i];
						var result=obj._getCurExpandConf(options,item);
						if(result)return result;
					}
				}
			}else{
				var expConf=_conf.expandConfig;
				var curConf={};
				curConf=this._fillExpandConf(curConf,_conf);
				if(expConf){
					var defConf=expConf._default||{};
					curConf=expConf['level'+options.childLevel]||defConf;
					curConf=this._fillExpandConf(curConf,defConf);
				}
				return curConf;
			}
		},
		_fillExpandConf:function(conf,conf2){
			var _conf=['nodeType','more','clickFunc','color','overFunc','expandUrl','expandOne','space','expandDir','align','expandType','dm','margin','judgeSize'];
			$.each(_conf,function(index,item){
				if(conf[item]==null){
					conf[item]=conf2[item];
				}
			});
			return conf;
		},
		//根据数据创建子节点视图
		_createViewByData:function(options){
			var x=options.left+options.width/2;
			var y=options.top+options.height/2;;
			if(options.expandDir=='left'){
				x=options.left-50;
			}
			if(options.expandDir=='right'){
				x=options.left+options.width+50;
			}
			if(options.expandDir=='bottom'){
				y=options.top+options.height+50;
			}
			this.showLoading(options.id,x,y);
			var _parms=$.extend(this.options.params, {id:options.id,level:options.level});
			var _obj_=this;
			setTimeout(function(){
				$.getJSON(options.expandUrl,_parms,new function(_obj,_param){
					return function(ds){
						var _docFrag=document.createDocumentFragment();
						_obj._createNodeByDS(ds,_param,_docFrag);
						_obj.hideLoading(_param.id);
						_obj.el.append(_docFrag);
						_obj.drawLinkLine();
					}
				}(_obj_,options));
			},500);
		},		
		//根据异步返回的数据源生成节点树
		_createNodeByDS:function(ds,options,_docFrag,_top_,_left_){
			var _obj=this,left=0,top=0,count=ds.length||0;
			var _exConf=this._getCurExpandConf(options);
			var margin=_exConf.margin||10;
			var _width=AI.ViewNode.nodeStyle[_exConf.nodeType].width;
			var _height=AI.ViewNode.nodeStyle[_exConf.nodeType].height;
			if(options.expandDir=='left'){
				left=options.left-_width-options.space;
			}
			if(options.expandDir=='right'){
				left=options.left+options.width+options.space;
			}
			if(options.expandDir=='bottom'){
				var _totalWidth=_width*count+margin*(count-1);
				if(options.expandMode=='horizontal'){
					top=options.top+options.space;
					if(_exConf.align=='center'){
						left=(options.left+options.width/2)-_totalWidth/2;
						left=(left<=0)?0:left;
					}
				}else{
					left=options.left+options.width/2+options.space;
					top=options.top+options.height+options.space;
				}
			}else{
				top=_top_||options.top;
				if(options.id=='dept'||options.id=='brand'){
					var _totalHeight=_height*count+margin*(count-1);
					if(_exConf.align=='center'){
						top=(options.top+options.height/2)-_totalHeight/2;
						top=(top<=5)?5:top;
					}
				}
			}
			var _totalH=0,_totalW=0;
			if($.isArray(ds)){
				$.each(ds,function(index,item){
					var node=_obj._createNodeByData(index,count,item,options,_exConf,left,top);
					if(item.children&&item.children.length!=0){
						var _tmp_=_totalH+node.options.top;
						var coord=_obj._createNodeByDS(item.children,node.options,_docFrag,_tmp_);
						if(index==0){
							node.options.top+=(coord.height-margin)/2-node.options.height/2;
						}else{
							node.options.top+=_totalH+(coord.height-margin)/2-node.options.height/2;
						}
						_totalH+=(coord.height||node.options.height)+margin;
					}else{
						if(options.expandDir=='bottom'){
							if(options.expandMode=='horizontal'){
								left+=node.options.width+margin;
							}else{
								node.options.top+=_totalH;
								/****/
								_totalH+=node.options.height+margin;
							}
						}else{
							_totalH+=node.options.height+margin;
							top+=node.options.height+margin;
						}
					}
					_docFrag.appendChild(node.buildNodeDOM().get(0));
				});
			}else{
				var node=this._createNodeByData(0,0,ds,options,_exConf,0,0);
				if(ds.children){
					this._createNodeByDS(ds.children,node.options,_docFrag);
				}
				_docFrag.appendChild(node.buildNodeDOM().get(0));
			}
			return {left:left,top:top,height:_totalH,width:_totalW};
		},
		//根据数据创建节点
		_createNodeByData:function(index,count,item,options,_exConf,left,top){
			var margin=_exConf.margin||10;
			var _width=AI.ViewNode.nodeStyle[_exConf.nodeType].width;
			var _height=AI.ViewNode.nodeStyle[_exConf.nodeType].height;	
			var _param={
				id:item.id,
				pid:options.id,
				title:item.title,
				level:options.level+1,
				index:index+1,
				count:count,
				children:(item.children)?item.children.length:0,
				top:top,
				dm:_exConf.dm,
				ds:item,
				left:left,
				expandMode:_exConf.expandMode,
				expandUrl:_exConf.expandUrl,
				confId:options.confId,
				childLevel:options.childLevel+1,
				type:_exConf.nodeType,
				expandOne:_exConf.expandOne,
				clickFunc:_exConf.clickFunc,
				overFunc:_exConf.overFunc,
				warn:eval(item.warn)||false,
				more:_exConf.more,
				color:_exConf.color,
				space:_exConf.space,
				judgeSize:_exConf.judgeSize
			};
			if(!item.leaf){
				_param.expandDir=_exConf.expandDir;
				if(_param.children==0){
					_param.expand=false;
				}
			}
			var node=this._createNodeByConf({},_param);
			if(!item.leaf&&_param.children==0){//如果节点可展开，增加展开事件
				node.options.allowExpand=true;
				node.onExpand=new this.expandFunc(this);
			}
			return node;
		},
		expandFunc:function(_objView){
			return function(nodeOption,nodeId,evtSrc){
				_objView.ctx.clearRect(0, 0, 3500, 3000);
				var _node=$('#'+nodeId,this.el);
				var expandOne=_node.attr('expandOne');
				var curExpand;
				if(expandOne=='true'){
					var pNode=$('div[pid='+_node.attr('pid')+']',this.el);
					$.each(pNode,function(index,item){
						if($(item).attr('expanded')=='true'){
							curExpand=$(item);
							_objView.removeChildrenNode($(item).attr('id'));
							$(item).attr('expanded','false');
							$('.expand',$(item)).removeClass('expand').addClass('shrink');
							return;
						}
					})
				}else{
					var _expanded=_node.attr('expanded');
					if(_expanded=='true'){
						_objView.removeChildrenNode(nodeId);
						_node.attr('expanded','false');
						$('.expand',_node).removeClass('expand').addClass('shrink');
						curExpand=_node;
					}
				}
				if(curExpand&&curExpand.attr('id')==nodeId){
					_objView.drawLinkLine();
					return;	
				}
				_node.attr('expanded','true');
				_objView._createViewByData(nodeOption);
				evtSrc.removeClass('shrink').addClass('expand');
				_objView.drawLinkLine();
			}
		},
		//根据配置/参数创建节点
		_createNodeByConf:function(conf,param){
			var _nodeStyle=null;
			_nodeStyle=AI.ViewNode.nodeStyle[conf.nodeType||param.type]
			if(!_nodeStyle){
				alert('节点样式['+conf.nodeType+']设置不正确!');
				return;
			}
			if(!conf)conf={};
			if(!param)param={};
			var _prop={
				id : conf.nodeId||param.id,
				pid : conf.pid||param.pid||null,
				level : param.level||1,
				index :param.index||1,
				count :param.count||1,
				dm:this.options.dm[conf.dm||param.dm]||[],
				color:conf.color||param.color||'green',
				space:conf.space||param.space||50,
				children : (conf.children)?conf.children.length:null||param.children||0,
				title : conf.nodeTitle||param.title||'',
				left : parseFloat(param.left||(param.pivot-_nodeStyle.width/2+500)||0),
				top : parseFloat(conf.top||param.top||0),
				type : conf.nodeType||param.type||'NormalNode',
				expandMode : conf.expandMode||param.expandMode||'horizontal',
				expand:eval(param.expand),
				expandOne:eval(conf.expandOne)||eval(param.expandOne)||false,
				expandDir:conf.expandDir||param.expandDir||null,
				clickFunc:conf.clickFunc||param.clickFunc||null,
				overFunc:conf.overFunc||param.overFunc||function(){},
				expandUrl:conf.expandUrl||param.expandUrl||null,
				confId:conf.nodeId||param.confId||null,
				childLevel:param.childLevel||1,
				initExpand:eval(conf.initExpand)||eval(param.initExpand)||false,
				ds:conf.ds||param.ds||{},
				warn:eval(conf.warn)||eval(param.warn)||false,
				more:conf.more||param.more,
				judgeSize:conf.judgeSize||param.judgeSize,
				visible:(conf.visible==null)?true:conf.visible				
			}
			return new AI.ViewNode(_prop);
		},
		showLoading:function(id,x,y){
			var div = $('<div id="loading_'+id+'" class="loadingGIF">');
			div.width(32).height(32).css('top', y-16).css('left', x - 16);
			var img = $('<img>').attr('src', GLOAB_PATH + 'common/AIComp/images/loading_big.gif'); 
			div.append(img);
			this.el.append(div);
		},
		hideLoading:function(id){
			$("#loading_"+id,this.el).remove();
		},
		removeChildrenNode:function(pNode){
			var children=$('div[pid='+pNode+']',this.el);
			var obj=this;
			$.each(children,function(index,item){
				obj.removeChildrenNode(item.id);
				$(item).remove();
			});
		},
		drawLine : function(beginX, beginY, endX, endY) {
			if (beginX != null && beginY != null && endX != null && endY != null) {
				this.ctx.save();
				this.ctx.beginPath();
				this.ctx.moveTo(beginX, beginY);
				this.ctx.lineTo(endX, endY);
				this.ctx.closePath();
				this.ctx.stroke();
				this.ctx.restore();
			}
		},
		drawPoleLine:function(children,startX,startY,endX,endY){
			var obj=this;
			$.each(children,function(index,item){
				var child=$(item);
				var top=parseInt(child.css('top'));
				var left=parseInt(child.css('left'));
				var width=parseInt(child.css('width'));
				var height=parseInt(child.css('height'));
				if(!startX){
					obj.drawLine(left+width/2,startY,left+width/2,endY);
				}if(!startY){
					obj.drawLine(startX,top+height/2,endX,top+height/2);
				}
			});
		},
		drawLinkLine:function(pid){
			if(!this.ctx){
				if(!$('#canvas').get(0).getContext){
					setTimeout(new function(obj_){
						return function(){
							obj_.drawLinkLine();
						}
					}(this),500);
					return;
				}
				this.ctx = $('#canvas').get(0).getContext('2d');// 初始化画板
				this.ctx.strokeStyle = '#99CC66';
				this.ctx.lineWidth = 1.2;
			}
			if(!pid){
				this.ctx.clearRect(0, 0, 3500, 3000);
			}
			var _pid=pid||this.options.config.nodeId;
			var pNode=$('#'+_pid,this.el);
			var children=$('div[pid="'+_pid+'"]',this.el);
			var parentW=parseInt(pNode.css('width'));
			var parentH=parseInt(pNode.css('height'));
			var parentL=parseInt(pNode.css('left'));
			var parentT=parseInt(pNode.css('top'));
			var obj=this;
			var topS=0,topE=0,leftS=0,leftE=0,childW=0,childH=0;
			if(children.length==0)return;
			$.each(children,function(index,item){
				var child=$(item);
				obj.drawLinkLine(child.attr('id'));
				if(index==0){
					topS=parseInt(child.css('top'));
					leftS=parseInt(child.css('left'));
					childW=parseInt(child.css('width'));
					childH=parseInt(child.css('height'));
				}
				if(index==children.length-1){
					topE=parseInt(child.css('top'));
					leftE=parseInt(child.css('left'));
				}
			});
			var startX=0,startY=0,endX=0,endY=0;
			if(topS==topE&&children.length!=1){
				startX=leftS+childW/2;
				endX=leftE+childW/2;
				startY=endY=(parentT+parentH)+(topS-(parentT+parentH))/2;
				this.drawLine(parentL+parentW/2,parentT+parentH,parentL+parentW/2,endY);
				this.drawPoleLine(children,null,endY,null,topS);
			}
			if(leftS==leftE){
				var down=(pNode.find('.btn_bottom').length==0)?false:true;
				if(down){
					startX=endX=(parentL+parentW/2)+(leftS-(parentL+parentW/2))/2;
					var lineH=(topE+childH/2)-(topS+childH/2);
					var tmp=(topE+childH/2)-lineH/2;
					this.drawLine((parentL+parentW/2),(parentT+parentH),(parentL+parentW/2),tmp);
					this.drawLine((parentL+parentW/2),tmp,startX,tmp);
					this.drawPoleLine(children,leftS+childW,null,startX,null);
				}else{
					if(parentL>leftS){
						startX=endX=(leftS+childW)+(parentL-(leftS+childW))/2;
						this.drawLine(parentL,parentT+parentH/2,startX,parentT+parentH/2);
						this.drawPoleLine(children,leftS+childW,null,startX,null);
					}else{
						startX=endX=parentL+parentW+(leftS-(parentL+parentW))/2;	
						this.drawLine(parentL+parentW,parentT+parentH/2,startX,parentT+parentH/2);
						if((topS+childH/2)>(parentT+parentH/2)){
							this.drawLine(startX,parentT+parentH/2,startX,(topS+childH/2));
						}
						this.drawPoleLine(children,startX,null,leftS,null);
					}
				}
				startY=topS+childH/2;
				endY=topE+childH/2;
			}
			this.drawLine(startX,startY,endX,endY);
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