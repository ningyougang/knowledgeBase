AI.Comp.Calendar = AI.create();
AI.Comp.Calendar.prototype = AI.extend(new AI.Component, {
	initialize : function(_options) {
		this.params = {
			el : null,
			name : null,
			displayformat : null,
			format:null,
			readonly : true,
			showtype : 'day',
			width : 180,
			value : null,
			mindate : null,
			maxdate : null,
			selother : true,
			showweek:false,
			allowclear:false,
			value:'',
			cascade:null,
			defaultfmt : {
				day : 'yyyy年MM月dd日',
				month : 'yyyy年MM月',
				time : 'HH:mm:ss',
				timestamp : 'yyyy-MM-dd HH:mm:ss'
			}
		};
		AI.extend(this.params, _options || {});
		this._render();
	},
	/** 初始化输入框panel* */
	_initInputBox : function() {
		var border = $("<div class='AI-Calendar calendar-border'/>");
		var span = $("<span class='calendar-input'/>");
		var _id=this.params['id']||this.params['name'];
		var input=$("<input type='hidden'/>").attr('name',this.params['name']).attr('id',_id);
		var format = this.params['format'], showType = this.params['showtype'], minDate = this.params['mindate'], maxDate = this.params['maxdate'], selOther = this.params['selother'], readonly = AI
				.isTrue(this.params['readonly']),cascade=this.params['cascade'],showweek=this.params['showweek'],allowclear=this.params['allowclear'];
				displayFormat = this.params['displayformat']
		if (!displayFormat) {
			displayFormat = this.params['defaultfmt'][showType];
		}
		border.hover(function() {
					$(this).removeClass('calendar-border')
							.addClass('calendar-border-hover');
				}, function() {
					$(this).removeClass('calendar-border-hover')
							.addClass('calendar-border');
				});
		var conf = {
			skin : 'ext',
			readOnly : readonly,
			highLineWeekDay : selOther,
			isShowOthers : true,
			dateFmt : displayFormat,
			startDate:'%y%M%d',
			isShowWeek:showweek,
			isShowClear:allowclear,
			vel:_id
		}
		if (minDate)
			conf['minDate'] = minDate;
		if (maxDate)
			conf['maxDate'] = maxDate;
		if(format)
			conf['realDateFmt']=format;
		if(cascade&&(cascade instanceof AI.Comp.Calendar)){

		}
		border.append(span).append(input).bind('click', function() {
					WdatePicker(conf);
				});
		return border;
	},
	_render : function() {
		this.container=this._initInputBox();
		var _id=this.params['id']||this.params['name'];
		this.getEl().append(this.container).attr('id',"AI-"+_id);
	},
	setValue:function(str){
		this.container.find('.calendar-input').text(str);
		var _id=this.params['id']||this.params['name'];
		this.container.find('#'+_id).val(str);
	}
});