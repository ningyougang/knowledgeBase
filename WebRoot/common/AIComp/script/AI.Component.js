/*
 * asiainfo UI abstract panel 1.0
 * 
 * Copyright (c) 2009 AsiaInfo Holding Inc.
 * 
 */
AI.Component = AI.create();
AI.Component.prototype = {
	initialize : function(_options) {
		this.params={}
	},
	log:function(info){
		this._recordLog(info,"INFO ");
	},
	error:function(info){
		this._recordLog(info,"ERROR");
	},
	warn:function(info){
		this._recordLog(info,"WARN ");
	},
	_recordLog:function(info,type){
		var _id=this.params['id'];
		var log="[ "+type+" ]  ";
		if(_id&&_id!=""){
			log+="组件ID为[ "+_id+" ]===:"			
		}
		log+=info;
		AI.log(log);
	},
	getEl:function(){
		var el=this.params['el'],elObj=null;
		if(!el){
			elObj=$('<div>');
			$('body').append(elObj);
		}
		if(AI.isString(el)||AI.isNumber(el)){
			elObj=$('#'+el);
		}else if(typeof el=='object'&&!(el instanceof $)){
			elObj=$(comp);
		}else{
			elObj=el;
		}
		if(!elObj.hasClass('AI-Comp'))elObj.addClass('AI-Comp');
		if(!elObj.attr('id')){
			elObj.attr('id',this.params['name']);
		}
		return elObj;
	},
	callback:function(){
		var args=AI.convertArgToArray(arguments);
		var evtType=args.shift();
		var func=this.params['callback'][evtType];
		if(AI.isFunction(func)){
			func.apply(null,args);
		}
	},
	bind:function(event,func){
		if(!event||!AI.isFunction(func))return;
		var callback=this.params['callback'];
		if(!callback)return;
		callback[event]=func;
		return this;
	}
}