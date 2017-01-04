$(document).ready(function() {
	var compType = {
		combox : AI.Comp.Combox,
		calendar : AI.Comp.Calendar,
		tab : null,
		grid : null,
		dialog : null
	}
	var comps = $('.AI-Comp');
	$.each(AI.keys(compType), function(index, type) {
		var filterComps = comps.filter("[type="+type+"]");
		$.each(filterComps, function(idx, comp) {
			var _comp = $(comp), attr = comp.attributes, attrAry = {};
			var objAttr = ['ds'];
			$.each(attr, function(i, attribute) {
						if (attribute.specified) {
							var _attr_ = attribute.nodeName.toLowerCase();
							var _val_ = attribute.nodeValue;
							if(_attr_=='type'||_attr_=='class')return;
							if ($.inArray(_attr_, objAttr)!=-1) {
								try {
									_val_ = eval(_val_);
									attrAry[_attr_] = _val_;
									window[_val_]=null;
								} catch (E) {
									AI.log('---');
								}
							}else{
								attrAry[_attr_] = _val_;							
							}
						}
					})
			attrAry['el'] = _comp;
			var compFunc = compType[type];
			if (AI.isFunction(compFunc)) {
				try{	
					var obj=new compFunc(attrAry);
					_comp.data('_AI_COMP_OBJ',obj);
				}catch(E){
					AI.log(E);
				}
			}
		})
	});
});