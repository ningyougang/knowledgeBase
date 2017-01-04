function createMenu(menu,menuDiv) {
	if (menu != null && menu instanceof Array) {
		var div = $('<div>');
		for (var i in menu) {
			var h1 = $('<h1><span>' + menu[i].name + '</span></h1>');
			h1.click(function() {
						$('#'+menuDiv+" h1").next().hide();
						$(this).next().toggle('normal');
					});
			div.append(h1);
			var childDiv = $('<div>');
			var ul = createChildMenu(menu[i].children);
			if (ul) {
				div.append(childDiv.append(ul));
			}
		}
		$('#'+menuDiv).append(div);
	}
}
function createChildMenu(menu) {
	if (menu != null && menu.length > 0) {
		var ul = $('<ul>');
		for (var i in menu) {
			var li = $('<li>');
			var children = menu[i].children;
			if (children && children.length > 0) {
				var span=$('<span>' + menu[i].name + '</span>');
				span.hover(function(){
					$(this).addClass('hover');
				},function(){
					$(this).removeClass('hover');
				});
				li.append(span);
				li.addClass("folder");
				var child_ul = createChildMenu(children);
				child_ul.hide();
				li.append(child_ul);
				li.click(function() {
							var _ul = $(this).find('ul');
							if (_ul.is(':visible')) {
								_ul.hide('normal');
							} else {
								$(this).siblings().each(function(index,ele){
									$(ele).find('ul').hide('normal');
								});
								_ul.show('normal');
							}
							return false;
						});
			} else {
				var span=$('<span>' + menu[i].name + '</span>');
				li.append(span);
				li.attr('url',menu[i].url);
				span.hover(function(){
					$(this).addClass('hover');
				},function(){
					$(this).removeClass('hover');
				});
				li.click(function() {
					$('#menuNav .leaf').removeClass('current');
					$(this).addClass('current');		
					var url=$(this).attr('url');
					if (url) {
						parent.frames['mainDoc'].location=url;
					}
					return false;
				});
				li.addClass("leaf");
			}
			ul.append(li);
		}
		return ul;
	}
}
