$(document).ready(JT_init);
var _indi_tips_indiId;//全局变量防止重复出现提示DIV层 add by shenli
function JT_init(){
	$(".indi_tips").live("click",function(){
		if(_indi_tips_indiId == this.id){
			return;
		}
		var url=GLOAB_PATH+"/indi/loadIndiTip.action?width=400&id="+this.id;
		_indi_tips_indiId = this.id;
		JT_show(url,this.id,$(this).text());
	});
	$(".indi_tips").live("mouseout",function(){
		$('#JT').remove();
		_indi_tips_indiId = null;
	});
}
function JT_show(url, linkId, title) {
	if (title == false)
		title = "&nbsp;";
	var de = document.documentElement;
	var w = self.innerWidth || (de && de.clientWidth)
			|| document.body.clientWidth;
	var hasArea = w - getAbsoluteLeft(linkId);
	var clickElementy = getAbsoluteTop(linkId) - 3;

	var queryString = url.replace(/^[^\?]+\??/, '');
	var params = parseQuery(queryString);
	if (params['width'] === undefined) {
		params['width'] = 250
	};
	if (params['link'] !== undefined) {
		$('#' + linkId).bind('click', function() {
					window.location = params['link']
				});
		$('#' + linkId).css('cursor', 'pointer');
	}

	if (hasArea > ((params['width'] * 1) + 75)) {
		$("body")
				.append("<div id='JT' style='width:"
						+ params['width']
						* 1
						+ "px'><div id='JT_arrow_left'></div><div id='JT_close_left'>"
						+ title
						+ "</div><div id='JT_copy'><div class='JT_loader'><div></div></div>");

		var arrowOffset = getElementWidth(linkId) + 11;
		var clickElementx = getAbsoluteLeft(linkId) + arrowOffset;

	} else {
		$("body")
				.append("<div id='JT' style='width:"
						+ params['width']
						* 1
						+ "px'><div id='JT_arrow_right' style='left:"
						+ ((params['width'] * 1) + 1)
						+ "px'></div><div id='JT_close_right'>"
						+ title
						+ "</div><div id='JT_copy'><div class='JT_loader'><div></div></div>");

		var clickElementx = getAbsoluteLeft(linkId)
				- ((params['width'] * 1) + 15);
	}

	$('#JT').css({
				left : clickElementx + "px",
				top : clickElementy + "px"
			});
	$('#JT').show();
	$('#JT_copy').load(url);

}

function getElementWidth(objectId) {
	x = document.getElementById(objectId);
	return x.offsetWidth;
}

function getAbsoluteLeft(objectId) {
	return $('#'+objectId).offset().left;
}
function getAbsoluteTop(objectId) {
	return $('#'+objectId).offset().top;
}

function parseQuery(query) {
	var Params = new Object();
	if (!query)
		return Params;
	var Pairs = query.split(/[;&]/);
	for (var i = 0; i < Pairs.length; i++) {
		var KeyVal = Pairs[i].split('=');
		if (!KeyVal || KeyVal.length != 2)
			continue;
		var key = unescape(KeyVal[0]);
		var val = unescape(KeyVal[1]);
		val = val.replace(/\+/g, ' ');
		Params[key] = val;
	}
	return Params;
}

function blockEvents(evt) {
	if (evt.target) {
		evt.preventDefault();
	} else {
		evt.returnValue = false;
	}
}