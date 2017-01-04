/*
 * asiainfo UI abstract panel 1.0
 * 
 * Copyright (c) 2009 AsiaInfo Holding Inc.
 * 
 * depends AI.Core.js AI.Component.js
 */
AI.Comp.Panel = AI.create();
AI.Comp.Panel.prototype = AI.extend(new AI.Component, {
	initialize : function(_options) {
		this.params = {
			width : 190,
			overflow : 'hidden',
			show : false
		}
		AI.extend(this.params, _options || {});
		this.loaded=true;
		this.panelBorder = $("<div>").addClass('AI-Panel').css({width:this.params['width']});
		this._initShadow();
	},
	_initShadow : function() {
		var panel_top = '<div class="panel_top"><div class="panel_top_right"/></div>';
		var panel_bottom = $('<div class="panel_bottom"/>')
				.append('<div class="panel_bottom_left"/>')
				.append('<div class="panel_bottom_right"/>');
		var _height=this.params['height'];
		panel_bottom.css('height',_height);
		this.content = $("<div class='panel_content'>");		
		var panel_middle=$('<div class="panel_bottom_middle"/>');
		panel_bottom.append(panel_middle.append(this.content));
		this.panelBorder.append(panel_top).append(panel_bottom);
	},
	_hideAllPanel:function(){
		$('#AI_Panel_Container').children(':visible').hide();	
	},
	getContentPanel : function() {
		return this.content
	},
	addClass:function(cls){
		this.panelBorder.addClass(cls);
	},
	applyTo : function(obj) {
		if(obj){
			obj = (AI.isString(obj)) ? $('#' + obj) : obj;
			obj.append(this.panelBorder);
		}else{
			var panelC=$('#AI_Panel_Container');
			if(panelC.length==0){
				panelC=$('<div id="AI_Panel_Container"/>').appendTo('body');	
			}
			this.panelBorder.appendTo(panelC);
		}
	},
	judgeHeight:function(height){
		this.panelBorder.find('.panel_bottom').css({'height':height});
	},
	setDisplay:function(){
		this.panelBorder.css('position','relative');
		this.panelBorder.show();
	},
	/** 展示panel* */
	show : function() {
		this.panelBorder.slideDown('fast');
		this.panelBorder.css('z-index','99999');
		this.content.show();
		if(!this.loaded){
			this.showLoading(true);		
		}
	},
	/** 隐藏panel* */
	hide : function() {
		this.panelBorder.slideUp('fast');
		this.content.hide();
	},
	setPosition : function(param) {
		this.panelBorder.css({
					top : param.top,
					left : param.left
				});
	},
	/** 显示panel数据加载中* */
	showLoading : function(flag) {
		var display=this.content.css('display');
		if(display!='none'||(display=='none'&&this.loaded)){
			var loading=this.content.parent().find('.panel-loading');
			if(loading.length==0){
				loading=$("<div class='panel-loading'><p><img src='"+AI.imgPath+"/PIC/loading_small.gif'/></p><p style='margin-top:5px;'>数据加载中...</p></div>");
				this.content.parent().append(loading);
			}
			if(flag){
				this.content.hide();
				loading.show();
			}else{
				loading.hide();
				this.content.show();
			}
		}
	},
	
	/** 销毁panel* */
	destory : function() {
		
	},
	isVisible : function() {
		return this.panelBorder.css('display') == 'none' ? false : true;
	}
});