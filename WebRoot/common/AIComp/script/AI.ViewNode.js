var AI = AI || {};
AI.ViewNode = function(param) {
	this.options = {
		id : '',// 节点ID
		pid : '',// 父节点ID
		dm : [],// 数据模型
		ds : {},// 数据源
		level : 1,// 节点当前层次
		index : 1,// 节点在当前层次的索引
		count : 1,// 当前层次节点数量
		children : 0,// 子节点数量
		title : '',// 节点标题
		left : 0,// 节点x坐标left
		color : '',
		width:0,
		height:0,
		top : 0,// 节点y坐标right
		bottom:0,
		type : 'NormalNode',// 节点展示类型：简单横节点、简单竖节点、数据节点、带进度条的节点
		clickFunc : null,// 节点点击回调函数
		overFunc:function(){},
		showWarn : false,// 是否显示告警
		warnStyle : '',// 告警展示样式：（border:节点边框线条颜色、bg:节点背景色、ico:告警图标、fontbg:文字背景色、font:文字）
		allowExpand : false,// 是否可展开/收缩
		expandOne : false,// 是否同时只允许一个同级节点展开
		expand:true,
		expandDir : 'bottom',// 展开方向
		expandMode : 'horizontal', // 子节点展开方式：横向0、纵向1
		confId:null,
		childLevel:0,
		totalH:0,
		totalW:0,
		warn:false,
		initExpand:false,
		more:null,
		visible:true,
		judgeSize:true
	}
	this.options = $.extend(this.options, param || {});
	if(this.options.dm.length==0){
		this.options.dm=this.options.ds.dm;
	}
	this._init();
}
AI.ViewNode.prototype = {
	// 初始化配置
	_init : function() {
		if(this.options.type.indexOf('DataNode')!=-1&&this.options.judgeSize==true){
			this.options.type='DataNode';
			if(this.options.dm){
				var ln=this.options.dm.length;
				if(ln>5){
					this.options.type+='3';
				}else if(ln>4){
					this.options.type+='4';			
				}else if(ln>3){
					this.options.type+='2';			
				}else if(ln>2){
					this.options.type+='5';
				}
			}
		}
		if(this.options.ds['simple']=='true'){
			this.options.type='NormalNode';
		}
		var _nodeStyle = AI.ViewNode.nodeStyle[this.options.type]||'NormalNode';
		this.nodeStyle=_nodeStyle;
		this.options.width=parseFloat(this.nodeStyle.width);
		this.options.height=parseFloat(this.nodeStyle.height);
	},
	onExpand:function(){},
	// 是否是同级最后一个节点
	isLastNode : function() {
		return (this.options.index == this.options.count) ? true : false;
	},
	allowClick : function() {
		var _clickfunc = eval(this.options.ds.clickfunc);
		return ((this.options.clickFunc != null&&_clickfunc==null)||
			(this.options.clickFunc !=null&&_clickfunc==true)) ? true : false;
	},
	// 根据位置参数，获取各边框中心点坐标
	getPivotCoord : function(position) {
	},
	// 生成节点收缩按钮DOM对象
	_createExpandBtnDOM : function() {
		if(this.options.expandDir){
			var expand=this.options.expand;
			var _div = $('<div>').addClass('node_btn').addClass(expand==true?'expand':'shrink')
					.addClass('btn_' + this.options.expandDir);
			var obj=this;
			_div.click(function(){
				obj.onExpand.call({},obj.options,obj.options.id,$(this));
			});
		}
		return _div;
	},
	// 生成节点进度条区域DOM对象
	_createProgressBarDOM : function() {
		var _val=this.options.ds['guage'];
		if(_val==null|| ! _val){
			return null;
		}else{
			var _progressBar = $('<div>').addClass('progressBar');
			_progressBar.append($('<span>').text(this.options.ds['prgtitle']));
			var _guageBar = $('<div>').addClass('guageBar');
			var _guage = $('<div>').addClass('guage');
			var color='#fff';
			if(_val<=30){
				color='#000';
			}
			var _width=0;
			if(_val>100){
				_width=100;
			}else{
				_width=_val;
			}
			_guage.css('width', _width+'%').text(_val+'%');
			_guage.css('color',color);
			_progressBar.attr('title',_val+'%');
			_guageBar.append(_guage);
			_progressBar.append(_guageBar);
			return _progressBar;
		}
		
	},
	// 生成节点数据区域DOM对象
	_createDataDOM : function() {
		var _title = this.options.title;
		var _obj=this;
		if(this.options.ds&&this.options.ds['title']){
			_title=this.options.ds['title'];
		}
		var _type = this.options.type;
		if (_type.indexOf('NormalNode')!=-1||_type=='MiniNode'||_type=='LongNode'||_type=='LongNode2') {
			var _titleDiv = $('<div>').addClass('data').addClass('title');
			if(_type=='LongNode2'&&_titleDiv){
				_titleDiv.attr('title',_title);
			}
			_titleDiv.append(_title);
			if (this.allowClick()) {
				_titleDiv.addClass((_type == 'SimpleNode_V')
						? 'vertical'
						: 'center');
			}
			_titleDiv.mouseover(function(evt){
				_obj.options.overFunc.call({},_obj.options.id,this,evt);
			});	
			return _titleDiv;
		} else if (_type.indexOf('DataNode')!=-1 || _type == 'ProgressNode') {
			var _dl = $('<dl>').addClass('dataList');
			var more=this.options.ds['more'];
			if (this.options.more!=null){
				if(more==null||(more!=null&&more==true)){
					_dl.append($('<div>').addClass('more_ico').click(function(){
						_obj.options.more.call({},_obj.options.id,_title,this);				
					}));
				}
			}
			if (this.allowClick()) {
				_dl.append($('<div>').addClass('click_ico'));
			}
			var _dt = $('<dt>').text(_title).addClass('title');
			_dt.mouseover(function(evt){
				_obj.options.overFunc.call({},_obj.options.id,this);
			});
			_dl.append(_dt);
			if(this.options.dm){
				$.each(this.options.dm, function(index, item) {
							var rgExp=/\#\w*\#/;
							var txt=item.txt;
							var val=item.val;
							var fields=txt.match(rgExp);
							if(fields){
								for(var i=0;i<fields.length;i++){
									var field=fields[i].substring(1,fields[i].length-1).toLowerCase();
									var _val=_obj.options.ds[field];
									txt=txt.replace(fields[i],_val);
								}
							}
							fields=val.match(rgExp);
							if(fields){
								for(var i=0;i<fields.length;i++){
									var field=fields[i].substring(1,fields[i].length-1).toLowerCase();
									var _val=_obj.options.ds[field];
									val=val.replace(fields[i],_val);
								}
							}
							var _dd = $('<dd>');
							var _label = $('<span>').html(txt);
							var _valSpan = $('<span>').html(val);
							if(item.isWarn){
								_valSpan.addClass((parseFloat(val)>0)?'upArrow':'downArrow');
							}
							_dd.append(_label);
							_dd.append(_valSpan);
							_dl.append(_dd);
						});
			}
			return _dl;
		} else {
			alert('节点样式[' + _type + ']设置不正确!');
			return null;
		}
	},
	// 生成节点DOM对象
	buildNodeDOM : function() {
		var _color = this.options.ds['color']||this.options.color;
		if(this.options.warn)_color='red';
		var _left=this.options.left;
		var _top=this.options.top;
		var _outerDiv = $('<div>').addClass('node')
				.addClass(this.nodeStyle.className + "_" + _color).css({
							left : _left+'px',
							top : _top+'px',
							width:this.nodeStyle.width+'px',
							height:this.nodeStyle.height+'px'
						});
		var _innerDiv = $('<div>').addClass('node_lbg')
				.addClass(this.nodeStyle.className + "_" + _color+"_lbg");
		var _dataDiv=this._createDataDOM();
		var obj=this;
		if(this.allowClick()){
			_dataDiv.click(function(){
				var func=obj.options.clickFunc;
				if(!func){
					func=obj.options.ds.clickFunc;
				}
				if(!func){
					func=function(){};
				}
				obj.options.clickFunc.call({},obj.options.id,obj.options.level,obj.options.pid);
			});
		}
		_innerDiv.append(_dataDiv);
		// 添加进度条
		if (this.options.type == 'ProgressNode') {
			_innerDiv.append(this._createProgressBarDOM());
		}
		if(this.options.initExpand){
			_outerDiv.attr('expanded',true);
		}
		if(this.options.expandOne){
			_outerDiv.attr('expandOne',true);
		}
		// 添加展开/收缩按钮
		if(this.options.allowExpand){
			_innerDiv.append(this._createExpandBtnDOM());
		}
		_outerDiv.append(_innerDiv);
		this.cacheDescInfo(_outerDiv);
		this.cacheDataInfo(_outerDiv);
		_outerDiv.attr('id',this.options.id).attr('pid',this.options.pid).attr('level',this.options.level);
		if(!this.options.visible){
			_outerDiv.hide();
		}
		return _outerDiv.noSelect();
	},
	updatePosition:function(position){
		this.options.left=position.left||this.options.left;
		this.options.top=position.top||this.options.top;
	},
	cacheDescInfo:function(div){
		if(this.options.ds){
			for(var item in this.options.ds){
				if(item.indexOf('desc')!=-1){
					div.attr(item,this.options.ds[item]);
				}
			}
		}
	},
	cacheDataInfo:function(div){
		var _obj=this;
		if((this.options.type=='LongNode'||this.options.type=='LongNode2'||this.options.type=='MiniNode')&&this.options.dm){
			$.each(this.options.dm, function(index, item) {
				if(typeof item=='string'){
					div.attr(item,_obj.options.ds[item.toLowerCase()]);
				}
			});
		}
	}
}
AI.ViewNode.nodeStyle = {
	NormalNode : {
		width : 120,
		height : 32,
		className : 'small'
	},
	MiniNode:{
		width : 70,
		height : 32,
		className : 'small'
	},
	LongNode:{
		width:160,
		height:32,
		className:'small'
	},
	LongNode2:{
		width:180,
		height:32,
		className:'small'
	},
	NormalNode_V : {
		width : 120,
		height : 32,
		className : 'small_v'
	},
	DataNode : {
		width : 180,
		height : 81,
		className : 'middle'
	},
	DataNode2:{
		width:200,
		height:112,
		className:'middle2'
	},
	DataNode3:{
		width:200,
		height:150,
		className:'middle3'
	},
	DataNode4:{
		width:200,
		height:130,
		className:'middle4'
	},
	DataNode5:{
		width:200,
		height:95,
		className:'middle5'
	},
	ProgressNode : {
		width : 200,
		height : 130,
		className : 'middle4'
	}
}