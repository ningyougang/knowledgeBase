		/*tabPanel主类 */
		TabPanel= function(config){
			this.init(config);
		};
		
		TabPanel.prototype = {
		  //初始化
		  init : function(config){
			  	//将tabPanel放置的位置
			  this.renderTo = config.renderTo || $(document.body);
			  this.render = typeof this.renderTo == 'string' ? $('#'+this.renderTo) : this.renderTo;
			      
			  //tabPanel的边线宽度
			  this.border = config.border;
	
			  //宽度是否可改变
			  this.widthResizable = config.widthResizable;
			  
			  //高度是否可以改变
			  this.heightResizable = config.heightResizable;
			 
			  //自动改变宽度和高度
			  this.autoResizable = config.autoResizable;
			  
			  //宽度
			  this.width = config.width || '100%';
			  
			  //高度
			  this.height = config.height || '100%';
			  
			  //每个tab的宽度
			  this.tabWidth = config.tabWidth||114;
			  
			  //tab元素
			  this.items = config.items;
			  
			  //活动的索引值
			  this.active = config.active || 0;
			  
			  //初始化的tab元素列表
			  this.tabs = [];
			  
			  //是否需要滚动，滚动的意思是tab元素过多，导致上面的tab条目放不了
			  this.scrolled = false;
			
				//调整值
			  this.fixNum = 2;
			  
			  //滚动结束标示
			  this.scrollFinish = true;
			  
			  //可添加的tab元素的最大个数
			  this.maxLength = config.maxLength || -1;
			  
			  //最少添加的tab元素个数
			  this.minLength=config.minLength || 2;

				//this变量
		    var tabEntity = this;
				
				//如果配置autoResizable为true，则宽度和高度的可变标示都为true
		    if(this.autoResizable){
		      this.widthResizable = this.heightResizable = true;
		      //超过则隐藏
		  	  this.render.css('overflow', 'hidden');
		  	  //窗口变化，则tab的容器跟着变化
		  	  $(window).resize(function(){
		        window.setTimeout(function(){
		          tabEntity.resize();
		        }, 200);
		  	  });
		    }
		  
		  	//设置tabPanel容器的宽度和高度
		    this.render.width(this.width);
		    this.render.height(this.height);
		
				//调整值
			  var hwFix = this.border!='none'?2:0;
				
				//整体的tab容器
		    this.tabpanel = $('<DIV></DIV>');
		    this.tabpanel.addClass('tabpanel');
		    this.tabpanel.width(this.render.width()-hwFix);
		    this.tabpanel.height(this.render.height()-hwFix);
		    this.render.append(this.tabpanel);
		    
		    //顶上面的标签容器
		    this.tabpanel_tab_content = $('<DIV></DIV>');
		    this.tabpanel_tab_content.addClass('tabpanel_tab_content');
		    this.tabpanel_tab_content.appendTo(this.tabpanel);
		    
		    //左箭头div
		    this.tabpanel_left_scroll = $('<DIV></DIV>');
		    //点击后左移一个tab宽度
		    this.tabpanel_left_scroll.bind('click',function(){tabEntity.moveLeft();});
		    //设置样式
		    this.tabpanel_left_scroll.addClass('tabpanel_left_scroll');
		    this.tabpanel_left_scroll.addClass('display_none');
		    //mouseover事件
		    this.tabpanel_left_scroll.bind('mouseover', function(){
		      var l = $(this);
		      l.addClass('tabpanel_scroll_over');
		      l.bind('mouseout', function(){
		        l.unbind('mouseout');
		        l.removeClass('tabpanel_scroll_over');
		      });
		    })
		    this.tabpanel_left_scroll.appendTo(this.tabpanel_tab_content);
		    
		    //右箭头div
		    this.tabpanel_right_scroll = $('<DIV></DIV>');
		     //点击后右移一个tab宽度
		    this.tabpanel_right_scroll.bind('click',function(){tabEntity.moveRight();});
		    //设置样式
		    this.tabpanel_right_scroll.addClass('tabpanel_right_scroll');
		    this.tabpanel_right_scroll.addClass('display_none');
		    //mouseover事件
		    this.tabpanel_right_scroll.bind('mouseover', function(){
		      var r = $(this);
		      r.addClass('tabpanel_scroll_over');
		      r.bind('mouseout', function(){
		        r.unbind('mouseout');
		        r.removeClass('tabpanel_scroll_over');
		      });
		    })
		    this.tabpanel_right_scroll.appendTo(this.tabpanel_tab_content);
		    
		    //存放顶上tab标签的div
		    this.tabpanel_move_content = $('<DIV></DIV>');
		    this.tabpanel_move_content.addClass('tabpanel_move_content');
		    this.tabpanel_move_content.appendTo(this.tabpanel_tab_content);
		    
		    //标签放在这个ul中，设置其中的li样式
		    this.tabpanel_mover = $('<UL></UL>');
		    this.tabpanel_mover.addClass('tabpanel_mover');
		    this.tabpanel_mover.appendTo(this.tabpanel_move_content);
		    //空格
		    this.tabpanel_tab_spacer = $('<DIV></DIV>');
		    this.tabpanel_tab_spacer.addClass('tabpanel_tab_spacer');
		    this.tabpanel_tab_spacer.appendTo(this.tabpanel_tab_content);
		    
		    //存放tab内容的div
		    this.tabpanel_content = $('<DIV></DIV>');
		    this.tabpanel_content.addClass('tabpanel_content');
		    this.tabpanel_content.appendTo(this.tabpanel);
		    
		    var t_w = this.tabpanel.width();
		    var t_h = this.tabpanel.height();
		
		    if(this.border=='none')
		    {
			  	this.tabpanel.css('border','none');
		    }
				
				//存放顶上tab标签的div宽度
			  this.tabpanel_tab_content.width(t_w);
			  //设置存放tab内容的div宽度
		    this.tabpanel_content.width(t_w);
		    //设置存放tab内容的div高度
			  this.tabpanel_content.height(t_h-this.tabpanel_tab_content.get(0).offsetHeight);
		    
				//根据配置添加标签
		    for(var i=0; i<this.items.length; i++){
		      this.addTab(this.items[i]);
		    }
		    //如果有活动tab的顺序号
		    if(this.active>=0)
		      this.show(this.tabs[this.active], true);
		  },
		  //向左移动
		  moveLeft : function(){
		  	
		  	//如果滚动结束了
		    if(this.scrollFinish){
		    	
		    	//设置this
					var me=this;
					
					//左右箭头暂时失效
		      this.disableScroll();
		      
		      //原来marginLeft
		      var oldMl=this.tabpanel_mover.css("marginLeft");
		      
		      //新的marginLeft
		      var newMl=parseInt(oldMl)+this.tabWidth;
		      
		      //最大值为0
		      if(newMl>0){
		      	newMl=0;
		    	}
		    	
		    	//滚动结束标示置为false
		    	this.scrollFinish = false;
		    	
		    	//动画滚动
		      this.tabpanel_mover.animate(
						{"marginLeft": newMl+'px'}, 
						300, 
						"linear",
						function(){
							//左右箭头可用
							me.useableScroll(); 
						} );
		    }
		  },
		  //向右移动
		  moveRight : function(){
		  	
		  	//如果滚动结束了
		    if(this.scrollFinish){
		    	
		    	//设置this
		    	var me=this;
		    	
		    	//左右箭头暂时失效
		      this.disableScroll();
		      
		      //原来marginLeft
		      var oldMl=this.tabpanel_mover.css("marginLeft");
		      
		      //新的marginLeft
		      var newMl=parseInt(oldMl)-this.tabWidth;
		      
		      //最小值为this.maxMove*(-1)
		      if(newMl*(-1)>this.maxMove){
		      	newMl=this.maxMove*(-1);
		      }
		      
		      //滚动结束标示置为false
					this.scrollFinish = false;
							
		    	//动画滚动
		      this.tabpanel_mover.animate(
						{"marginLeft": newMl+'px'}, 
						300, 
						"linear",
						function(){
							//左右箭头可用
							me.useableScroll(); 
						} 
					);
		    }
		  },
		  //在关闭tab后，tab数量不够，不需要箭头时，移动到最左边
		  moveToLeft : function(){
		  	
		  	//如果滚动结束了
		  	if(this.scrollFinish){
		  		
		  		//左右箭头暂时失效
		      this.disableScroll();
		      
		      //设置this
		      var me=this;
		      
		      //滚动结束标示置为false
					this.scrollFinish = false;
							
		      //动画滚动
		      this.tabpanel_mover.animate(
						{"marginLeft":'0px'}
					, 300, "linear", function(){
							//左右箭头可用
							me.useableScroll(); 
							});
				}
					
		  },
		  //移动到最右边
		  moveToRight : function(){
		  	
		  	//如果滚动结束了
		    if(this.scrolled && this.scrollFinish){
		    	
		    	//左右箭头暂时失效
		      this.disableScroll();
		      
		      //原marginLeft
		      var marginLeft = parseInt(this.tabpanel_mover.css('marginLeft'))*-1;
		      
		      //所有tab加起来的总宽度
		      var liWidth = this.tabs.length*this.tabWidth;
		      
		      //tab标签的容器宽度
		      var cWidth = this.tabpanel_move_content.width();
		      
		      //新的marginLeft
		      var newMarginLeft = (liWidth - cWidth - marginLeft + this.fixNum)*-1;
		      
		      //设置this
		      var me=this;
		      
		      //滚动结束标示置为false
					this.scrollFinish = false;
							
		      //动画滚动
		      this.tabpanel_mover.animate(
						{"marginLeft":'+='+newMarginLeft+'px'}
					, 300, "linear", function(){
							//左右箭头可用
							me.useableScroll(); 
						} );
		    }
		  },
		  //把该标签移动到可视区域
		  moveToSee : function(tabitem){
		  	
		  	//得到该标签的位置
		   var position = this.getTabPosition(tabitem);
		   
		   //如果需要滚动了
		    if(this.scrolled){
		    	
		    	//到该tab标签的左边的距离
		      var liWhere = this.tabWidth * position;
		      //marginLeft值
		      var ulWhere = parseInt(this.tabpanel_mover.css('marginLeft'));
		      //需要移动的值
		      var moveNum= (ulWhere + liWhere)*-1;
		
					//需要移动的距离超过最大数
		      if(((moveNum+ulWhere)*-1) >= this.maxMove){
		      	
		        	//移动到最右边
		          this.moveToRight();
		      }else{
		      
		        	//左右箭头暂时失效
		          this.disableScroll();
		          
		          //滚动结束标示置为false
		          this.scrollFinish = false;
		          
		          //设置this
		          var me=this;
							//动画滚动
				      this.tabpanel_mover.animate(
								{"marginLeft":liWhere*(-1)+'px'}
							, 300, "linear", function(){
								//左右箭头可用
								me.useableScroll();
								} );
		        }
		    }
		  },
		  //左右箭头失效
		  disableScroll : function(){
		    this.tabpanel_left_scroll.addClass('tabpanel_left_scroll_disabled');
		    this.tabpanel_left_scroll.attr('disabled',true);
		    this.tabpanel_right_scroll.addClass('tabpanel_right_scroll_disabled');
		    this.tabpanel_right_scroll.attr('disabled', true);
		  },
		  //左右箭头有效
		  useableScroll : function(){
		  	
		  	//设置this
		    var tabEntity = this;
		    
		    //可以滚动了
		    if(this.scrolled){
		    	
		      //最左边
		      if(parseInt(tabEntity.tabpanel_mover.css('marginLeft')) == 0){
		      	
		        //左箭头失效
		        tabEntity.tabpanel_left_scroll.addClass('tabpanel_left_scroll_disabled');
		        tabEntity.tabpanel_left_scroll.attr('disabled',true);
		        
		        //右箭头有效
		        tabEntity.tabpanel_right_scroll.removeClass('tabpanel_right_scroll_disabled');
		        tabEntity.tabpanel_right_scroll.removeAttr('disabled');
		      }else if(parseInt(tabEntity.tabpanel_mover.css('marginLeft'))*-1 >= tabEntity.maxMove){
		      	
		      	//最右边
		      	//左箭头有效
		        tabEntity.tabpanel_left_scroll.removeClass('tabpanel_left_scroll_disabled');
		        tabEntity.tabpanel_left_scroll.removeAttr('disabled',true);
		        
		        //右箭头失效
		        tabEntity.tabpanel_right_scroll.addClass('tabpanel_right_scroll_disabled');
		        tabEntity.tabpanel_right_scroll.attr('disabled');
		      }else{
		      	
		      	//既非最左边，也非最右边
		      	//左右箭头都有效
		        tabEntity.tabpanel_left_scroll.removeClass('tabpanel_left_scroll_disabled');
		        tabEntity.tabpanel_left_scroll.removeAttr('disabled',true);
		        tabEntity.tabpanel_right_scroll.removeClass('tabpanel_right_scroll_disabled');
		        tabEntity.tabpanel_right_scroll.removeAttr('disabled');
		      }
		    }
		    //滚动结束标示为true
		    tabEntity.scrollFinish = true;
		  },
		  //显示滚动
		  showScroll : function(){
		  	
		  	//所有tab标签的总宽度
		    var liWidth = this.tabs.length*this.tabWidth;
		    
		    //存放tab标签的div的宽度
		    var tabContentWidth = this.tabpanel_tab_content.width();
		    
		    //如果所有tab标签的总宽度大于存放tab标签的div的宽度，而且还没出现左右箭头，则显示左右箭头
		    if(liWidth > tabContentWidth && !this.scrolled){
		    	//显示左右箭头
		      this.tabpanel_move_content.addClass('tabpanel_move_content_scroll');
		      this.tabpanel_left_scroll.removeClass('display_none');
		      this.tabpanel_right_scroll.removeClass('display_none');
		      
		      //滚动标示为true
		      this.scrolled = true;
		    }else if(liWidth < tabContentWidth && this.scrolled){
		    	
		    	//如果所有tab标签的总宽度小于存放tab标签的div的宽度
		    	
		    	//移动到最左边
			    this.moveToLeft();
			    //不显示左右箭头div
		      this.tabpanel_move_content.removeClass('tabpanel_move_content_scroll');
		      this.tabpanel_left_scroll.addClass('display_none');
		      this.tabpanel_right_scroll.addClass('display_none');
		      
		      //滚动标示为false
		      this.scrolled = false;
			    this.scrollFinish = true;
		    }
		    
		    //更新存放tab标签的div的宽度以及可移动的最大宽度
		    
		    
				//如果可移动,则存放tab标签的div的宽度要减去左右箭头的div的宽度
		    if(this.scrolled)
		      tabContentWidth -= (this.tabpanel_left_scroll.width()+this.tabpanel_right_scroll.width());
		    //设置宽度
		    this.tabpanel_move_content.width(tabContentWidth);
		    //设置最大宽度
		    this.maxMove = (this.tabs.length*this.tabWidth) - tabContentWidth + this.fixNum;
		    
		  },
		//添加标签
		  addTab : function(tabitem){
		  	
		//判断是否设置了最大可添加的标签数，如果超过了，则返回
		    if(this.maxLength!=-1 && this.maxLength<=this.tabs.length){
		    	alert('最多只能添加'+this.maxLength+'个标签!');
			    return false;
		    }
		    
		  //设置id
		    if(!tabitem.id) {
		    	tabitem.id = Math.uuid();
		  	}
		  	
		    //如果已有该标签则显示
		    if($('#'+tabitem.id).length>0){
		      this.show(this.getTabById(tabitem.id), true);
		    }else if(this.scrollFinish){
		      var tabEntity = this;
		  		//tab标签为li元素
		      var tab = $('<LI></LI>');
		      //设置id
		      tab.attr('id', tabitem.id);
		      //设置宽度
					tab.width(this.tabWidth-4);
		      tab.appendTo(this.tabpanel_mover);
		  		
		  		//存放标签文字的div
		      var titleDiv = $('<DIV></DIV>');
		      titleDiv.text(tabitem.title);
		      titleDiv.appendTo(tab);
		
					//调整值
			    var wFix = !tabitem.closable? 0 : 5;
			    
			    //如果有背景图片要存放
		      if(tabitem.icon) {
		        titleDiv.addClass('icon_title');
		        titleDiv.addClass(tabitem.icon);
		        
		        //如果文字太长，则以...结尾
		        if(titleDiv.width()>(this.tabWidth-35-wFix)) {
		          titleDiv.width((this.tabWidth-50-wFix));
		          titleDiv.attr('title', tabitem.title);
		          tab.append('<DIV>...</DIV>');
		        }
		      } else {
		      	//没有背景图片要存放
		        titleDiv.addClass('title');
		        
		        //如果文字太长，则以...结尾
		        if(titleDiv.width()>(this.tabWidth-19-wFix)) {
		          titleDiv.width((this.tabWidth-30-wFix));
		          titleDiv.attr('title', tabitem.title);
		          tab.append('<DIV>...</DIV>');
		        }
		      }
		      
		      //关闭按钮
		      var closer = $('<DIV></DIV>');
		      closer.addClass('closer');
		      closer.attr('title', 'Close tab');
		      closer.appendTo(tab);
		      
		      //存放标签内容的div
		      var content = $('<DIV></DIV>');
		      content.addClass('html_content');
		      content.appendTo(this.tabpanel_content);
					content.hide();
		
		      //设置单个标签的对象
		      tabitem.tab = tab;
		      tabitem.titleDiv = titleDiv;
		      tabitem.closer = closer;
		      tabitem.content = content;
		      
		      //隐藏关闭按钮
		      if(!tabitem.closable)
		        closer.addClass('display_none');
		      
		      //如果不可用
		      if(tabitem.disabled==true) {
		        tab.attr('disabled', true);
		        titleDiv.addClass('.disabled');
		      }
		  
		      this.tabs.push(tabitem);
		     
		     //tab标签li的click事件
		      tab.bind('click', function(){
		      	
		      	//如果设置标签的disabled为true
		      	if(tabitem.disabled){
		      		return false;
		      	}
		          tabEntity.show(tabitem, true);
		      });
		      
					//关闭按钮的click事件
		      closer.bind('click', function(){
		          tabEntity.kill(tabitem);
		      });
		      
		      //如果可关闭，tab标签li的dbclick事件
		      if(tabitem.closable){
		        tab.bind('dblclick', function(){
		            tabEntity.kill(tabitem);
		        });
		      }
		      
		     	//显示滚动条
		      this.showScroll();
		      
		      //如果立即显示内容,将tab移动到可视状态
		      if(tabitem.loadnow){
		      	 this.show(tabitem, true);
		      }else if(tabitem.elementId||tabitem.disabled) {
		      	
		      	//elementId或disabled配置，则立即显示内容，但不将tab移动到可视状态
		        this.show(tabitem, false);
		      }
		    }
		  },
		  //取得tab的位置
		  getTabPosition:function(tabitem){
		  	var tabIndex = -1;
		  	for(var i=0;i<this.tabs.length;i++){
		  		if(this.tabs[i].id==tabitem.id){
		  			return i;
		  			}
		  	}
		  	return tabIndex;
		  },
		  //显示标签，executeMoveSee为是否移动到可视区域
		  show : function(tabitem, executeMoveSee){
		   
		   //得到标签的位置
		   var position = this.getTabPosition(tabitem);
		   
		//得到活动的标签位置
		    var activedTabIndex = this.getActiveIndex();
		    
		    //点击的tab为活动的，则返回
		    if(position==activedTabIndex){
		    	return;
		    }
		    
		    //滚动结束了
		    if(this.scrollFinish){
		    	//当前点击的tab标签不是活动的
		      if(!tabitem.tab.hasClass('active')){
		        //没有加载内容
		        if(tabitem.content.html()=='') {
		        	//html配置
		          if(tabitem.html){
		          	tabitem.content.html(tabitem.html);
		        	}else if(tabitem.elementId){
		        		//elementId配置
		        		tabitem.content.html($("#"+tabitem.elementId).show().remove());
		        	}
		        }
		        if(tabitem.loader){
		        	if(!tabitem.loader.iframeFlag&&(tabitem.content.html()==''||tabitem.loader.activateFresh)){
			        	//要求刷新页面
			        	this.refresh(tabitem);
							}else if(tabitem.loader.iframeFlag){
								//iframe设置
								
								//没有加载过页面
								 if(tabitem.content.html()==''){
								 		var tempHtml='<iframe id="'+tabitem.id+'Frame" name="'+tabitem.id+'Frame" src="'+tabitem.loader.url+'" width="100%" height="100%" frameborder="0"></iframe>';
								 		tabitem.content.html(tempHtml);
								 }else if(tabitem.loader.activateFresh){
								 	//加载过页面，刷新
								 		this.refresh(tabitem);
								 }
							}
		        }
		      }
		    }

		    //要求移动到活动的tab标签
		    if(executeMoveSee){

		    	//显示内容
		      tabitem.content.show();
		      //隐藏原来的标签的内容
		      if(activedTabIndex>=0){
		      	this.tabs[activedTabIndex].content.hide();
		      }
					//把原来的活动的tab标签设为非活动状态
	        this.tabpanel_mover.find('.active').removeClass('active');
	        //添加新点击的标签风样式为活动状态
	        tabitem.tab.addClass('active');
	        //移动到可视状态
		      this.moveToSee(tabitem);
		      
		      //有活动状态设置后的事件配置
			    if(tabitem.activate){
			    	tabitem.activate(tabitem);
			    }
		    }
		  },
		  //刷新iframe
		  refresh:function(tabitem){
		  	//iframe参数配置
		  	if(tabitem.loader.iframeFlag){
			  	var iframeName=tabitem.id+'Frame';
			  	eval(iframeName+".window.location.reload();");
		  	}else{
		  				  var param={};
			        	if(tabitem.loader.param){
			        		param=tabitem.loader.param;
			        	}
			        	
			        	$.ajax({
									type: 'post',//ajax提交方式
									url: tabitem.loader.url,//提交的url
									data: param,//参数
									dataType: 'text',//数据返回的形式，默认为text即文本
									cache:false,
									success: function(msg) {
										tabitem.content.empty().html(msg);
									},
									error: function(XMLHttpRequest, textStatus, errorThrown) {
										alert('data error');
									}
								});
					}
		  },
		  //删除标签
		  kill : function(tabitem){
		    //标签个数小于等于最小个数或者为不可用状态，则返回
		  	if(this.tabs.length<=this.minLength){
		  		alert('最少保留'+this.minLength+'个tab标签!');
		  		return;
		  	}
		  	
		  	if(tabitem.disabled){
		  		return;
		  	}
		  	
		  	//设置this
		    var tabEntity = this;
		    //得到标签位置
		    var position = this.getTabPosition(tabitem);
		    //得到活动标签位置
		    var activedTabIndex = this.getActiveIndex();
		    
		    //移除相应dom对象
		    tabitem.closer.remove();
		    tabitem.titleDiv.remove();
		    tabitem.tab.remove();
		    tabitem.content.remove();
		    //从tabs中移除数据
		    this.tabs.splice(position,1);
		   
		   //显示滚动的左右箭头
		    this.showScroll(); 
		
		//如果关闭的标签为活动的标签
				if(activedTabIndex==position){
					//如果位置大于0，则将其前一个标签设为活动状态
					if(position>0){
						this.show(this.tabs[position-1], true);
					}else{
						//若为第一个，则继续将第一个标签设为活动状态
						this.show(this.tabs[0], true);
					}
		    }else{
		    	//如果活动的标签的位置大于被关闭的标签的位置,把其前一个标签移动到可视状态
		    	if(activedTabIndex>position){
		    		this.moveToSee(this.tabs[activedTabIndex-1]);
		    	}else{
		    		//如果活动的标签的位置小于被关闭的标签的位置,把该标签移动到可视状态
		    		this.moveToSee(this.tabs[activedTabIndex]);
		    	}
		    }
		  },
		  //得到标签总数
		  getTabsCount : function(){
		    return this.tabs.length;
		  },
		  //设置标签的标题
		  setTitle : function(tabitem,title){
		      tabitem.titleDiv.text(title);
		  },
		  //得到标签的标题
		  getTitle : function(tabitem){
		    return tabitem.titleDiv.text();
		  },
		  //设置标签的内容
		  setContent : function(tabitem,content){
		      tabitem.content.html(content);
		  },
		  //得到标签的内容
		  getContent : function(tabitem){
		    return tabitem.content.html();
		  },
		  //将标签设为不可用状态
		  setDisable : function(tabitem,disable){
		      tabitem.disable = disable;
		      if(disable){
		        tabitem.tab.attr('disabled',true);
		        tabitem.titleDiv.addClass('.disabled');
		      }else{
		        tabitem.tab.removeAttr('disabled');
		        tabitem.titleDiv.removeClass('.disabled');
		      }
		  },
		  //得到标签的diabled状态
		  getDisable : function(tabitem){
		    return tabitem.disable;
		  },
		  //设置标签的关闭状态
		  setClosable : function(tabitem,closable){
		      tabitem.closable = closable;
		      if(closable){
		        tabitem.closer.addClass('display_none');
		      }else{
		        tabitem.closer.addClass('closer');
		        tabitem.closer.removeClass('display_none');
		      }
		  },
		  //得到标签的关闭状态
		  getClosable : function(tabitem){
		    return tabitem.closable;
		  },
			//得到活动标签的位置
			getActiveIndex : function(){
				var activedTabIndex = -1;
		    var activeTab=this.tabpanel_mover.find('.active')[0];
		    if(activeTab){
		     		activedTabIndex=this.tabpanel_mover.children().index(activeTab);
		    }
				return activedTabIndex;	
			},
			//根据tab的id得到tab
			getTabById:function(Id){
				for(var i=0;i<this.tabs.length;i++){
					if(this.tabs[i].id==Id){
						return this.tabs[i];
					}
				}
			},
		  //得到活动标签对象
		  getActiveTab : function(){
		    var activeTabIndex = this.getActiveIndex();
		    if(activeTabIndex> 0)
		      return this.tabs[activeTabIndex];
		    else
		      return null;
		  },
		  //改变整个tab容器的大小
		  resize : function(){
		  	var hwFix = this.border == 'none' ? 0 : 2;
		
				//如果可改变宽度
		  	if(this.widthResizable) {
				
		  	  this.width = this.render.width();
		  	  this.tabpanel.width(this.width-hwFix);
		  	  this.tabpanel_tab_content.width(this.width-hwFix);
		  	  this.tabpanel_content.width(this.width-hwFix);
		  	}
		  	//如果可改变高度
		  	if(this.heightResizable) {
		      this.height = this.render.height();
		  	  this.tabpanel.height(this.height-hwFix);
		  	  this.tabpanel_content.height(this.height-this.tabpanel_tab_content.get(0).offsetHeight-hwFix);
		  	}
		  
		  //显示滚动
		  	this.showScroll();
		  		//左右箭头可用
		  	this.useableScroll();
			
			//将活动标签移动到可视状态
		  	var entity = this;
		  	setTimeout(function(){entity.moveToSee(entity.getActiveTab());}, 200);
				
		  },
		  //设置整个tab标签容器的宽度和高度
		  setRenderWH : function(wh) {
		    if(wh) {
		      if(wh.width!=undefined) {
		        this.render.width(wh.width);
		      }
		      if(wh.height!=undefined) {
		        this.render.height(wh.height);
		      }
		      this.resize();
		    }
		  }
		};
		