(function(window, $) {

    'use strict';

	function SideCatalog(wrapper, options) {
		var defaults = {
			content: '#content',
            width: 280,
            height: 260,
            speed: 300///////
		};

		this.settings = $.extend(defaults, options);
		this.$wrapper = $(wrapper);
        this.$content = $(this.settings.content);

        this.mouseUpDown = true;
        this.timer = null;

		this.initCatalogView();

		this.bindEvents();
	}

	SideCatalog.prototype = {
		initCatalogView: function() {
			var html,
				cataItemClass,
				cataIndxClass,
                html,
                heads;
			html = '<div id="sidebar">' +
	                    '<div class="sidebar-top"></div>' +
	                    '<div class="sidebar-bottom"></div>' +
	                '</div>' +
	                '<div id="catalog-updown">' +
	                    '<div title="向上翻页" id="catalog-up"></div>' +
	                    '<div title="向下翻页" id="catalog-down"></div>' +
	                '</div>' +
	                '<div id="catalog">' +
	                    '<dl></dl>' +
	                '</div>';
		    this.$wrapper.html(html);
            this.$wrapper.css({width: this.settings.width, height: this.settings.height});
            this.$wrapper.find('#sidebar').css({height: this.settings.height});
            this.$wrapper.find('#catalog').css({height: this.settings.height - 30});    // catalog 有上下margin各15px
            this.$wrapper.find('dl').css({width: this.settings.width - 60});

			html = '';
            // 根据 baikeViewInfo（作为参数传入） 初始化目录内容
            // for(var i = 0, l = baikeViewInfo.cataList.length; i < l; i++) {
            //     var cata = baikeViewInfo.cataList[i];
            //     if (cata.level == 1) {
            //         cataItemClass = 'catalog-item1';
            //         cataIndxClass = 'catalog-index1';
            //     }
            //     else {
            //         cataItemClass = 'catalog-item2';
            //         cataIndxClass = 'catalog-index2';
            //     }
            //     html +=  '<dd class="'+cataItemClass+'" id="sideToolbar-item-0-'+cata.index+'">'+
            //            '<span class="'+cataIndxClass+'">'+cata.index+'</span>'+
            //            '<a href="#'+cata.index+'" title="'+cata.title+'" onclick="return false;">'+cata.title+'</a>'+ //return false;
            //            '<span class="sideCatalog-dot"></span>'+
            //            '</dd>';
            // }

            // 根据 content 内容初始化目录
			heads = this.$content.find('h2, h3');
			for (var i = 0; i < heads.length; i++) {
                var $head = $(heads[i]);
                if ($head.hasClass('headline-1')) {
                    cataItemClass = 'catalog-item1';
                    cataIndxClass = 'catalog-index1';
                } else if ($head.hasClass('headline-2')){
                    cataItemClass = 'catalog-item2';
                    cataIndxClass = 'catalog-index2';
                }
                var index = $head.attr('id');
                var title = $head.find('.headline-title').text();
                html += '<dd class="' + cataItemClass+'" id="cata-headline-' + index + '">' +
                        '<span class=" '+ cataIndxClass + '">' + index + '</span>' +
                        '<a href="#' + index + '" onclick="return false;">' + title + '</a>' + //return false;
                        '<span class="sideCatalog-dot"></span>' +
                        '</dd>';
            }

            this.$wrapper.find('dl').html(html);
		},

        bindEvents: function() {
            var context = this;

            this.initCatalogUpDown();

            //文档滚动事件
            $(document).scroll(function() {
                context.cataLocationByContent();                
            });
  

            //目录项点击事件
            this.$wrapper.find('a').click(function() {
                var index = $(this).attr('href').replace('#', '');
                context.contentLocationByCata(index);
            })
            this.$wrapper.find('.sideCatalog-dot').click(function() {
                var index = $(this).parent().find('a').attr('href').replace('#', '');
                context.contentLocationByCata(index);
            });
            
            //目录返回顶部
            $('.sidebar-top').click(function() {
                context.scrollElement($('#catalog'), 100, 'up', 1); // 100 为自定义的jump长度
            });

            //目录返回底部
            $('.sidebar-bottom').click(function() {
                context.scrollElement($('#catalog'), 100, 'down', 1);
            });
        },

        initCatalogUpDown: function() {
            function handler(e) {
                e.stopPropagation();
                e.cancelBubble = true;
                e.preventDefault();

                if(!context.mouseUpDown) return false;

                context.mouseUpDown = false;
                clearTimeout(context.timer);
                context.timer = setTimeout(function() { // 防止鼠标连续滚动导致的目录滚动bug
                    context.mouseUpDown = true;
                }, 200);

                var e = e || window.event;
                console.log(e.wheelDelta);
                console.log(e.detail);
                if (e.wheelDelta >= 0 || e.detail < 0) {
                    context.scrollElement($('#catalog'), 23 * 2, 'up', 0);// 为啥是23*2？？？？
                } else {
                    context.scrollElement($('#catalog'), 23 * 2, 'down', 0);
                }
                
            }

            var context = this;
            var $catalog = $('#catalog');

            //目录内容很长需要滚动显示时 
            //if ($catalog[0].scrollHeight > $catalog.height()) 会出错 注意js函数执行顺序
            if ($('#catalog')[0].scrollHeight > $('#catalog').height()) {

                $('#sideCatalog').mouseover(function(e) {
                    $('#catalog-updown').css('visibility', 'visible');
                    context.setUpDownClass();
                    e.stopPropagation();
                }).mouseout(function(e) {
                    $('#catalog-updown').css('visibility', 'hidden');
                    e.stopPropagation();
                });
                        
                // 闭包，不能放在 bindEvents 里定义
                $('#catalog-up').click(function() {
                    context.scrollElement($catalog[0], 23 * 2, 'up'); //23 ???????????
                });
                $('#catalog-down').click(function() {
                    context.scrollElement($catalog[0], 23 * 2, 'down');
                });

                // 鼠标滚轮事件在标准下和IE下是有区别的。
                // firefox是按标准实现的,事件名为"DOMMouseScroll ",IE下采用的则是"mousewheel "。
                // 事件属性，IE是event.wheelDelta，Firefox是event.detail 
                // 属性的方向值也不一样，IE向上滚 > 0，Firefox向下滚 > 0。  有bug
                if (window.attachEvent) {
                    $('#catalog')[0].attachEvent('onmousewheel', handler);
                } else if (window.addEventListener) {
                    $('#catalog')[0].addEventListener('DOMMouseScroll', handler, false);                
                }

            } else {
                $('#catalog-updown').remove();
            }     
        },

        

        setUpDownClass: function() { 
            var $catalog = $('#catalog');
            var $catalogUp = this.$wrapper.find('#catalog-up');
            var $catalogDown = this.$wrapper.find('#catalog-down');
            if ($catalog.height() + $catalog.scrollTop() == $catalog[0].scrollHeight) {
                $catalogUp[0].className = 'catalog-up-enable';
                $catalogDown[0].className = 'catalog-down-disable';
            } else {
                if ($catalog.scrollTop() == 0) {
                    $catalogUp[0].className = 'catalog-up-disable';
                    $catalogDown[0].className = 'catalog-down-enable';
                } else {
                    $catalogUp[0].className = 'catalog-up-enable';
                    $catalogDown[0].className = 'catalog-down-enable';                
                }
            }
        },

        scrollElement: function(ele, jump, dir, dur) {
            var dur = dur || 300;
            var top = ('down' === dir) ? ($(ele).scrollTop() + jump) : ($(ele).scrollTop() - jump);
            $(ele).animate({scrollTop: top}, dur, 'linear');             
        },

        contentLocationByCata: function(index) {
            var ele = this.$content.find('[id=' + index + ']');       
            var top = ele.offset().top;
            $('body, html').animate({scrollTop: top}, 300, 'linear');//不能写$('document')???
            window.location.hash = '#' + index;
        },

        // 根据当前document显示的内容定位目录项////////？？？？？？？
        cataLocationByContent: function() {
            var cataList = this.$content.find('h2, h3');
            var scrollTop = $(document).scrollTop();
            for (var i = 0, len = cataList.length; i < len; i++) {
                var ele = cataList[i],
                    ele1 = cataList[i+1];
                // 判断当前滚动位置的内容属于哪条目录或子目录
                if ($(ele).offset().top - 20 <= scrollTop && ((i + 1 == len) || ((i + 1 < len) && $(ele1).offset().top > scrollTop))) {     
                    this.$wrapper.find('.highlight').removeClass('highlight');
                    this.$wrapper.find('[href=#' + ele.getAttribute('id') + ']').parent().addClass('highlight');
                    // 根据sideCatalog当前定位滚动其到合适位置以保证当前选中目录条目在目录中间位置
                    ele.order = i + 1;
                    if (ele.order > 4) {
                        $('#catalog').scrollTop((ele.order - 4) * 23)
                    } else {
                        $('#catalog').scrollTop(0); 
                    } 
                    //break;    不能加?? 
                }
            }
        }
	};

    window.SideCatalog = SideCatalog;

    $.fn.sideCatalog = function(options) {
        var calalog = new SideCatalog(this, options);
        return $(this);
    }

})(window, jQuery);






