AI.Comp.FilterPanel = AI.create();
AI.Comp.FilterPanel.prototype = AI.extend(new AI.Comp.Panel(), {
			initialize : function(_options) {
				this.params={
					allowfilter:false
				}
				AI.Comp.Panel.prototype.initialize.call(this, _options);
				AI.extend(this.params, _options || {});
				if(AI.isTrue(this.params["allowfilter"])){
					this._initFilterPanel();
				}
			},
			_initFilterPanel : function() {
				var content = this.getContentPanel();
				var filterDiv = $('<div>').addClass('panel-filter');
				var search = $('<span>').addClass('panel-search');
				var input = $('<input type="text" maxlength="18">')
						.addClass('input-filter-normal').bind('mousedown',
								function(event) {
									$(this).removeClass()
											.addClass('input-filter-hover');
									 event.stopPropagation();
								}).blur(function() {
							$(this).removeClass()
									.addClass('input-filter-normal');
						});
				input.bind('keyup',AI.bindEvent(this.doFilter,this));
				content.append(filterDiv.append(input).append(search));
			}
		});