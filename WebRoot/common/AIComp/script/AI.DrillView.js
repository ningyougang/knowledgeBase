var GLOAB_PATH="";
/**
 * 业务运营视图组件AI.operView
 */
(function($) {
	$.AI = $.AI || {};
	$.fn.extend({
				drillView : function(options) {
					var args = Array.prototype.slice.call(arguments, 1);
					return this.each(function() {
								new $.AI.DrillView(this, options);
							});
				}
			});
	$.AI.NodeConfig = null;
	$.AI.DrillView = function(container, options) {
		this.options = options = $.extend({}, $.AI.DrillView.defaults, options);
		$.AI.NodeConfig = this.options;
		
		this.element = container;
		this.nodeCollection = [];
		this.linkLineCache = [];
		this.linkLineTemp = [];
		this.curDrillLevel=0;
		this.linkLineMap=new AI.SimpleMap();
		var _obj=this;
		this.init(function(){
			_obj.getData(_obj.options['url'], _obj.options['params']);
		});
		return this;
	};
	$.AI.DrillView.prototype = {
		// 初始化获取节点数据
		getData : function(url, param, pNode) {
			$.ajax({
				type : 'get',
				url : url,
				data : param,
				success : new function(obj, _pNode) {
					return function(_json) {
						var json = eval(_json);
						if (!json)
							return;
						if (_pNode) {
							var count = json.length;
							var _tWidth = $.AI.NodeConfig.width * count
									+ $.AI.NodeConfig.lSpace * (count - 1);
							var _left = _pNode.left + $.AI.NodeConfig.width / 2
									- _tWidth / 2;
							if (_left < 5) {
								_left = 5;
							}
							var linkLine = {};
							if (count > 0) {
								var poleLine = {};
								poleLine.startX = _pNode.left
										+ $.AI.NodeConfig.width / 2;
								poleLine.endX = poleLine.startX;
								poleLine.startY = _pNode.top
										+ $.AI.NodeConfig.height;
								poleLine.endY = poleLine.startY
										+ $.AI.NodeConfig.bSpace / 2;
								obj.linkLineTemp.push(poleLine);
							}
							for (var i = 0; i < count; i++) {
								var node = obj.createViewNodeByParentNode(
										_pNode, json[i], i, count, _left);
								if(!node.allowDrill){
									$('.viewNode[id=' + node.id + ']').live(
											'click', new function(tmp) {
												return function() {
													var id = $(this).attr('id');
													var pid = $(this).attr('pid');
													var _title=$(this).attr('title');
													tmp.options.drillFunc.apply(
															null, [id,_title,pid]);
												}
											}(obj));
								}
								_left += node.width + $.AI.NodeConfig.lSpace;
								if (i == 0) {
									linkLine.startX = node.getLinkLineCoord().x;
									linkLine.startY = node.getLinkLineCoord().y;
								}
								if (i == count - 1) {
									linkLine.endX = node.getLinkLineCoord().x;
									linkLine.endY = node.getLinkLineCoord().y;
								}
							}
							obj.linkLineTemp.push(linkLine);
							obj.buildView();
						} else {
							//第二层钻取到营业厅
							var node=obj.createViewNodeByParentNode(null, json[0], 1, 1,
									5);
							if(json[0].id!=-999){
								$('.viewNode[pid=' + node.id + ']').live(
										'click', new function(tmp) {
											return function() {
												var id = $(this).attr('id');
												var pid = $(this).attr('pid');
												tmp.options.drillFunc.apply(
														null, [id, pid]);
											}
										}(obj));
							}
							obj.buildView();
						}
					}
				}(this, pNode)
			})
		},
		initCtx:function(callBack){
			if(!this.ctx){
				if(!$('#canvas').get(0).getContext){
					setTimeout(new function(obj_){
						return function(){
							obj_.initCtx(callBack);
						}
					}(this),50);
					return;
				}
				this.ctx = $('#canvas').get(0).getContext('2d');// 初始化画板
				this.ctx.strokeStyle = 'blue';
				this.ctx.lineWidth = 1.2;
				callBack.call(null);
			}
		},		// 初始化配置信息
		init : function(callBack) {
			this.initEvent();
			this.initCtx(callBack);
		},
		initEvent : function() {
			$(".expand_Btn[allowdrill=1]").live('click', new function(obj) {
				return function() {
					if(obj.loading)return;
					var div = $(this).offsetParent();
					if (!div)
						return;
					var id = div.attr('id');
					var level = div.attr('level');
					var top = div.css('top');
					var left = div.css('left');
					var params = obj.options['params'];
					obj.showLoading(parseInt(left) + $.AI.NodeConfig.width / 2, parseInt(top)
									+ $.AI.NodeConfig.height);
					obj.removeNodes(level);
					setTimeout(function(){
						obj.curDrillLevel=parseInt(level)+1;
						var url=obj.options['drillUrl'];
						if(level==3){
							url+='drill'+level+'_'+id+'.json';
						}
						if(level==4){
							url+='drill'+level+'.json';
						}
						obj.getData(GLOAB_PATH + url, params, {
									id : id,
									level : parseInt(level),
									top : parseInt(top),
									left : parseInt(left)
								});
					},500);
				}
			}(this));
		},
		// 生成视图
		buildView : function() {
			var poleLineTemp=[];
			for (var i = 0; i < this.nodeCollection.length; i++) {
				var item = this.nodeCollection[i];
				var $dom = item.buildDom();
				$(this.element).append($dom);
				var pole = item.getPoleLine();
				var pid = item.pid;
				var pNode = $('.viewNode[id=' + pid + ']');
				var allowdrill=0;
				if (pNode) {
					if(pNode.length>0){
						allowdrill= pNode.attr('allowdrill');
					}
					if (pNode.length==0||allowdrill != 1) {
						$.merge(this.linkLineCache, pole);
					}
				}
				if (pole && pole.length > 0) {
					var obj=this;
					$.each(pole,function(_idx_,_item_){
						if(allowdrill==1&&item.allowDrill==1){
							poleLineTemp.push(_item_);
						}	
						drawLine(obj.ctx,_item_.startX,_item_.startY,_item_.endX,_item_.endY);
					});
				}
			}
			this.reDrawLine(true);
			for (var i in this.linkLineTemp) {
				var link = this.linkLineTemp[i];
				drawLine(this.ctx, link.startX, link.startY, link.endX,
						link.endY);
			}
			if(this.linkLineTemp.length>0){
				$.merge(poleLineTemp,this.linkLineTemp);
				this.linkLineMap.put(this.curDrillLevel,poleLineTemp);
			}
			this.linkLineTemp = [];
			this.nodeCollection = [];
			this.hideLoading();
		},
		removeNodes : function(level) {
			this.ctx.clearRect(0, 0, 10000, 10000);
			level++;
			var pNodes = $('.viewNode[level=' + level + ']');
			var _obj=this;
			$.each(pNodes,function(index,item){
				$(item).remove();
				if($(item).attr("allowdrill")==1){
					_obj.removeNodes(level);
				}
			});
			this.reDrawLine();
		},
		reDrawLine : function(flag) {
			for (var i in this.linkLineCache) {
				var link = this.linkLineCache[i];
				drawLine(this.ctx, link.startX, link.startY, link.endX,
						link.endY);
			}
			if(flag!=true)return;
			for(var i=this.curDrillLevel-1;i>=1;i--){
				var links=this.linkLineMap.get(i);
				if(links==null)continue;
				for(var j in links){
					var link=links[j];
					//console.log(j+"--"+link.startX+"----"+link.startY+'---'+link.endX+"---"+link.endY);
					drawLine(this.ctx, link.startX, link.startY, link.endX,
							link.endY);
				}
			}
		},
		showLoading : function(x, y) {
			this.loading=true;
			var div = $('<div class="loadingGIF">');
			div.width(32);
			div.height(32);
			div.css('top', y + 20);
			div.css('left', x - 16);
			var img = $('<img>');
			//img.attr('src', GLOAB_PATH + 'images/loading.gif');  
			img.attr('src', GLOAB_PATH + '../../common/AIComp/images/loading.gif');
			div.append(img);
			$(this.element).append(div);
		},
		hideLoading : function() {
			$('.loadingGIF').remove();
			this.loading=false;
		},
		createViewNodeByParentNode : function(pNode, json, index, count, left) {
			var level = (pNode) ? (pNode.level + 1) : 1;
			var pid = (pNode) ? pNode.id : -1;
			var top = (pNode) ? pNode.top : 5;
			var left = (left) ? left : 5;
			var _children = 0;
//			if(level==2){
//				left+=$.AI.NodeConfig.width+$.AI.NodeConfig.lSpace;
//			}
			if (json['children'] && $.isArray(json['children'])) {
				_children = json['children'].length;
			}
			var _data = {
				value : json['value'],
				cycle : json['cycle'],
				same : json['same']
			}
			if (pNode) {
				top += $.AI.NodeConfig.height + $.AI.NodeConfig.bSpace;
			}
			var viewNode = new $.AI.ViewNode(json['id'], json['type'],
					json['title'], json['desc'], pid, index, _children, level,
					count, top, left, _data, json['allowdrill']);
			if (pid == -1) {
				viewNode.left += this.element.offsetParent.offsetWidth / 2
						- $.AI.NodeConfig.width / 2;
			}
			this.nodeCollection.push(viewNode);
			//console.log(viewNode.title+"-------------LEFT:"+viewNode.left+"-----------TOP:"+viewNode.top);
			if (_children > 0) {
				var _left = 5;
				var _tWidth = $.AI.NodeConfig.width * _children
						+ $.AI.NodeConfig.lSpace * (_children - 1);
				var _pWidth = this.element.offsetParent.offsetWidth;
				if (_tWidth <= _pWidth) {
					_left += _pWidth / 2 - _tWidth / 2;
				}
				if (_left > viewNode.left) {
					_left = 5;
				}
				var linkLine = {};
				top += viewNode.height + $.AI.NodeConfig.bSpace;
				for (var i = 0; i < _children; i++) {
					var child = json['children'][i];
					var node = this.createViewNodeByParentNode(viewNode, child,
							i, _children, _left);
					_left += node.width + $.AI.NodeConfig.lSpace;
					if (i == 0) {
						linkLine.startX = node.getLinkLineCoord().x;
						linkLine.startY = node.getLinkLineCoord().y;
					}
					if (i == _children - 1) {
						linkLine.endX = node.getLinkLineCoord().x;
						linkLine.endY = node.getLinkLineCoord().y;
					}
				}
				this.linkLineCache.push(linkLine);
			}
			return viewNode;
		}
	};
	// 默认参数
	$.extend($.AI.DrillView, {
				defaults : {
					url : GLOAB_PATH + 'common/AIComp/data/drill.json',
					drillUrl : GLOAB_PATH + 'common/AIComp/data/drill2.json',
					params : '',
					lSpace : 10,
					bSpace : 30,
					width : 160,
					height : 115,
					maxLevel : -1,
					minLevel : -1,
					drillFunc : function() {
						alert('请设置回调函数!')
					}
				}
			});
	// 画父节点与子节点间的连接线
	function drawLine(ctx, beginX, beginY, endX, endY, bb) {
		if (beginX != null && beginY != null && endX != null && endY != null) {
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(beginX, beginY);
			ctx.lineTo(endX, endY);
			ctx.closePath();
			ctx.stroke();
			ctx.restore();
		}
	}
	
	//格式化数据
	
function formatnumber(fnumber,fdivide,fpoint,fround){
    var fnum = fnumber + '';
    var revalue="";
    fnum=fnum.replace(/,/g,"");
    if(fround){
        var temp = "0.";
        for(var i=0;i<fpoint;i++)
		  temp+="0";
          temp += "5";
         fnum = Number(fnum) + Number(temp);
         fnum += '';
    }

    var arrayf=fnum.split(".");
    if(fdivide){
        if(arrayf[0].length>3){
            while(arrayf[0].length>3){
                revalue=","+arrayf[0].substring(arrayf[0].length-3,arrayf[0].length)+revalue;
                arrayf[0]=arrayf[0].substring(0,arrayf[0].length-3);
            }
        }
    }
    revalue=arrayf[0]+revalue;
    if(arrayf.length==2&&fpoint!=0){
        arrayf[1]=arrayf[1].substring(0,(arrayf[1].length<=fpoint)?arrayf[1].length:fpoint);
        if(arrayf[1].length<fpoint)
            for(var i=0;i<fpoint-arrayf[1].length;i++)
			revalue+=","+arrayf[1];
    }else if(arrayf.length==1&&fpoint!=0){
        revalue+=",";
        for(var i=0;i<fpoint;i++)
			revalue+="0";
    }

    return revalue;
}

	
	
	// 业务视图节点类
	$.AI.ViewNode = function(id, type, title, desc, pid, index, children,
			level, count, top, left, data, allowDrill) {
		this.id = id;
		this.title = title;
		this.desc = desc;
		this.children = children;
		this.data = data;
		this.count = count;
		this.left = left;
		this.top = top;
		this.pid = pid;
		this.level = level;
		this.index = index;
		this.width = 0;
		this.height = 0;
		this.totalHeight = 0;
		this.poleLine = [];
		this.allowDrill = allowDrill;
		this.init();
	}
	$.AI.ViewNode.prototype = {
		init : function() {
			this.width = $.AI.NodeConfig.width;
			this.height = $.AI.NodeConfig.height;
		},
		getLinkLineCoord : function() {
			var nodeLT = $.AI.NodeConfig.bSpace / 2;
			return {
				x : this.getPivot('top').x,
				y : this.getPivot('top').y - nodeLT
			}
		},
		// 添加左右两端线条
		getPoleLine : function() {
			var nodeLT = $.AI.NodeConfig.bSpace / 2;
			var poleLine = [];
			var topLine = {
				startX : this.getPivot('top').x,
				startY : this.getPivot('top').y - nodeLT,
				endX : this.getPivot('top').x,
				endY : this.getPivot('top').y
			}
			var bottomLine = {
				startX : this.getPivot('bottom').x,
				startY : this.getPivot('bottom').y,
				endX : this.getPivot('bottom').x,
				endY : this.getPivot('bottom').y + nodeLT
			}
			if (this.level > 1) {
				poleLine.push(topLine);
			}
			if (this.children > 0) {
				poleLine.push(bottomLine);
			}
			return poleLine;
		},
		hasChildren : function() {
			if (this.children > 0 || this.allowDrill == 1) {
				return true;
			}
			return false;
		},
		isLastNode : function() {
			if (this.index == this.count) {
				return true;
			} else {
				return false;
			}
		},
		/**
		 * 获取四个边的中心点 position: left、right、top、bottom
		 */
		getPivot : function(position) {
			var _top = this.top;
			if (this.totalHeight > 0) {
				_top += this.totalHeight / 2 - this.height / 2;
			}
			var pivot = {
				left : {
					x : this.left,
					y : _top + this.height / 2
				},
				right : {
					x : this.left + this.width,
					y : _top + this.height / 2
				},
				top : {
					x : this.left + this.width / 2,
					y : _top
				},
				bottom : {
					x : this.left + this.width / 2,
					y : _top + this.height
				}
			};
			return pivot[position];
		},
		createDataDOM : function() {
			var ul = $('<ul>').addClass('data_list');
			
			var value = this.data['value'], cycle = this.data['cycle'], same = this.data['same'];
			value = (value == undefined) ? "N/A" : formatnumber(value, true, 2, true);
			//value = (value == undefined) ? "N/A" : value;
			var cycleArrow='',sameArrow='';
			if(cycle == undefined){
				cycle = "N/A";
			}else{
				cycleArrow=(cycle>=0)?"upArrow":"downArrow";
				cycle=Math.round(cycle*10000)/100;
				cycle = cycle + " %";
			}
			if(same == undefined){
				same = "N/A";
			}else{
				sameArrow=(same>=0)?"upArrow":"downArrow";
				same=Math.round(same*10000)/100;
				same = same + " %";
			}
			var valueLi=$('<li>');
			valueLi.append($('<span>').text('日指标值：' + value));
			valueLi.append($('<span>').text('  '));
			var cycleLi=$('<li>');
			cycleLi.append($('<span>').text('环比增长：' + cycle));
			cycleLi.append($('<span>').html('&nbsp;&nbsp;&nbsp;&nbsp;').addClass(cycleArrow));
			var sameLi=$('<li>');
			sameLi.append($('<span>').text('同比增长：' + same));
			sameLi.append($('<span>').html('&nbsp;&nbsp;&nbsp;&nbsp;').addClass(sameArrow));
			ul.append(valueLi).append(cycleLi).append(sameLi);
			return ul;
		},
		// 创建收缩按钮
		createExpandBtn : function(position) {
			var div = $('<div>').addClass('expand_Btn').addClass(position
					+ "Btn");
			div.attr('position', position);
			return div;
		},
		// 缓存节点信息
		cacheNodeInfo : function(obj) {

		},
		createTitle : function() {
			var div = $('<div>').addClass('title');
			var span = $('<span>').text(this.title);
			div.append(span);
			if (this.pid == -1) {
				span.css('float', 'left').css('padding-left', '90px');
				div.append($('<span>').attr('id', 'filter')
						.html('&nbsp;&nbsp;'));
			}
			return div;
		},
		// 生成节点DOM对象
		buildDom : function() {
			var div = $('<div>').addClass('viewNode');
			div.css('left', this.left).css('top', this.top);
			div.attr('id', this.id).attr('pid', this.pid).attr('level',
					this.level).attr('title',this.title);
			//console.log(this.title+"-------------"+this.allowDrill);
			if (this.allowDrill) {
				div.attr('allowdrill', 1);
			}
			var rightBg = $('<div>').addClass('right_bg').addClass('rbg'
					+ this.level);
			rightBg.css('width', $.AI.NodeConfig.width).css('height',
					$.AI.NodeConfig.height);
			var leftBg = $('<div>').addClass('left_bg').addClass('lbg'
					+ this.level);
			leftBg.append(this.createTitle());
			leftBg.append(this.createDataDOM());
			rightBg.append(leftBg);
			div.append(rightBg);
			if (this.hasChildren()) {
				var btn = this.createExpandBtn('bottom');
				if (this.allowDrill) {
					btn.attr('allowdrill', 1);
				}
				div.append(btn);
			}
			return div;
		}
	}
})(jQuery);

var AI=new Object();
AI.SimpleMap=function Map() {  
    this.keys = [];  
    this.data = new Object();
    this.put = function(key, value) {  
        if(this.data[key] == null){  
            this.keys.push(key);  
        }  
        this.data[key] = value;  
    };  
    this.get = function(key) {  
        return this.data[key];  
    };  
    this.remove = function(key) {
    	for(var i=0;i<this.keys.length;i++){
    		if(key==this.keys[i]){
    			this.keys.splice(i,1);
    		}
    	}
        this.data[key] = null;  
    };  
    this.each = function(fn){  
        if(typeof fn != 'function'){  
            return;  
        }  
        var len = this.keys.length;  
        for(var i=0;i<len;i++){  
            var k = this.keys[i];  
            fn(k,this.data[k],i);  
        }  
    };  
    this.entrys = function() {  
        var len = this.keys.length;  
        var entrys = new Array(len);  
        for (var i = 0; i < len; i++) {  
            entrys[i] = {  
                key : this.keys[i],  
                value : this.data[i]  
            };  
        }  
        return entrys;  
    };  
    this.isEmpty = function() {  
        return this.keys.length == 0;  
    };  
    this.size = function(){  
        return this.keys.length;  
    };  
    this.toString = function(){  
        var s = "{";  
        for(var i=0;i<this.keys.length;i++,s+=','){  
            var k = this.keys[i];  
            s += k+"="+this.data[k];  
        }  
        s+="}";  
        return s;  
    };  
}  