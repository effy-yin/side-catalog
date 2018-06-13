(function(window, $) {

    'use strict';

	function SideCatalog(wrapper, options) {
		var defaults = {			
            width: 280,
            height: 260,
            speed: 300,
            cataList: null,     // 目录数据
            isFromContent: true,// 是否从页面标题获取目录数据
            content: '#content'   
		};

		this.settings = $.extend(defaults, options);
        this.$wrapper = $(wrapper);
        
        this.mouseUpDown = true;
        this.timer = null;

		this.initCatalogView();

		this.bindEvents();
	}

	SideCatalog.prototype = {
		initCatalogView: function() {
			var html = '<div id="sidebar">' +
	                    '<div class="sidebar-top"></div>' +
                        '<div class="sidebar-bottom"></div>' +
                    '</div>' +                    
	                '<div id="catalog">' +
                        '<dl><a class="arrow" href="javascript:void(0);"></a></dl>' +
                    '</div>' +
                    '<div id="catalog-updown">' +
                        '<div id="catalog-up"></div>' +
                        '<div id="catalog-down"></div>' +
                    '</div>';
             
		    this.$wrapper.html(html);
            this.$wrapper.css({width: this.settings.width, height: this.settings.height});
            this.$wrapper.find('#sidebar').css({height: this.settings.height});
            this.$wrapper.find('#catalog').css({height: this.settings.height - 30});    // catalog 有上下margin各15px
            this.$wrapper.find('dl').css({width: this.settings.width - 60});

            this.initCatalogContent();
        },

        initCatalogContent: function() {
            var html = '',
                cataItemClass,
                tagName,
                dotHtml;

            if (this.settings.isFromContent) {
                this.$content = $(this.settings.content);
                var heads = this.$content.find('h2, h3');
                for (var i = 0; i < heads.length; i++) {
                    var $head = $(heads[i]);
                    if ($head.hasClass('headline-1')) {
                        tagName = 'dt';
                        cataItemClass = 'level1';
                        dotHtml = '<em class="dot"></em>';
                    } else if ($head.hasClass('headline-2')){
                        tagName = 'dd';
                        cataItemClass = 'level2';
                        dotHtml = '';
                    }
                    var index = $head.attr('id');
                    var title = $head.find('.headline-title').text();
                    html += '<'+tagName+' class="catalog-title ' + cataItemClass+'">' + dotHtml +                   
                            '<a href="#' + index + '" onclick="return false;">' +
                            '<span class="title-index">' + index + '</span><span class="title-text">' + title + '</span></a></'+tagName+'>';
                }
            } else {
                var cataList = this.settings.cataList;              
                for(var i = 0, l = cataList.length; i < l; i++) {
                    var cata = cataList[i];
                    if (cata.level == 1) {
                        tagName = 'dt';
                        cataItemClass = 'level1';
                        dotHtml = '<em class="dot"></em>';
                    }
                    else {
                        tagName = 'dd';
                        cataItemClass = 'level2';
                        dotHtml = '';
                    }
                    var index = cata.index;
                    var title = cata.title;
                    html += '<'+tagName+' class="catalog-title ' + cataItemClass+'">' + dotHtml +                      
                            '<a href="#' + index + '" onclick="return false;">' +
                            '<span class="title-index">' + index + '</span><span class="title-text">' + title + '</span></a></'+tagName+'>';
                }
            }
        
            this.$wrapper.find('dl').prepend(html);    
		},

        bindEvents: function() {
            var _this = this;

            this.initCatalogUpDown();

            //文档滚动事件
            $(document).scroll(function() {
                _this.locateCataByContent();                
            });
  

            //目录项点击事件
            this.$wrapper.find('a').click(function() {
                var index = $(this).attr('href').replace('#', '');
                _this.locataContentByCata(index);
            })
            this.$wrapper.find('.sideCatalog-dot').click(function() {
                var index = $(this).siblings('a').attr('href').replace('#', '');
                _this.locataContentByCata(index);
            });
            
            //目录返回顶部
            $('.sidebar-top').click(function() {
                _this.scrollElement($('#catalog'), 100, 'up', 1); // 100 为自定义的jump长度
            });

            //目录返回底部
            $('.sidebar-bottom').click(function() {
                _this.scrollElement($('#catalog'), 100, 'down', 1);
            });
        },

        initCatalogUpDown: function() {
            function mouseScrollhandler(e) {
                e.stopPropagation();
                e.cancelBubble = true;
                e.preventDefault();

                if(!_this.mouseUpDown) return false;

                _this.mouseUpDown = false;
                clearTimeout(_this.timer);
                _this.timer = setTimeout(function() { // 防止鼠标连续滚动导致的目录滚动bug
                    _this.mouseUpDown = true;
                }, 200);

                var e = e || window.event;
                // console.log(e.wheelDelta);
                // console.log(e.detail);
                if (e.wheelDelta >= 0 || e.detail < 0) {
                    _this.scrollElement($('#catalog'), 26 * 4, 'up', 0);// 为啥是26*2？？？？
                } else {
                    _this.scrollElement($('#catalog'), 26 * 4, 'down', 0);
                }                
            }

            var _this = this;
            var $catalog = $('#catalog');
            var catalog = $catalog.find('dl').get(0);

            // 目录内容很长需要滚动显示时 
            // 如果不放在setTimeout里dl的height取值总为0 why？？？        
            setTimeout(() => {
               var listHeight = $('#catalog').find('dl').height();
               if (listHeight > $('#catalog').height()) {
                    $('#sideCatalog').mouseover(function(e) {
                        _this.setUpDownClass();
                        $('#catalog-updown').css('visibility', 'visible');                        
                        e.stopPropagation();
                    }).mouseout(function(e) {
                        $('#catalog-updown').css('visibility', 'hidden');
                        e.stopPropagation();
                    });
                            
                    // 闭包，不能放在 bindEvents 里定义
                    $('#catalog-up').click(function() {
                        _this.scrollElement($catalog[0], 26 * 2, 'up'); //26 ???????????
                    });
                    $('#catalog-down').click(function() {
                        _this.scrollElement($catalog[0], 26 * 2, 'down');
                    });

                    // 鼠标滚轮事件在标准下和IE下是有区别的。
                    // firefox是按标准实现的,事件名为"DOMMouseScroll",IE下采用的则是"mousewheel"。
                    // 事件属性，IE是event.wheelDelta，Firefox是event.detail 
                    // 属性的方向值也不一样，IE向上滚 > 0，Firefox向下滚 > 0。
                    // Firefox
                    if (document.addEventListener) { 
                        document.getElementById('catalog').addEventListener('DOMMouseScroll', mouseScrollhandler, false);
                    }
                    // IE/Chrome/Safari/Opera
                    document.getElementById('catalog').onmousewheel = mouseScrollhandler;
                } else {
                   $('#catalog-updown').remove();
                }    
            }, 0);

        },
        
        setUpDownClass: function() { 
            var $catalog = $('#catalog');
            var $catalogUp = this.$wrapper.find('#catalog-up');
            var $catalogDown = this.$wrapper.find('#catalog-down');//console.log($catalog.scrollTop())
            if ($catalog.height() + $catalog.scrollTop() > $catalog[0].scrollHeight - 5) {
                $catalogUp[0].className = 'catalog-up-enable';
                $catalogDown[0].className = 'catalog-down-disable';
            } else {
                if ($catalog.scrollTop() < 5) {
                    $catalogUp[0].className = 'catalog-up-disable';
                    $catalogDown[0].className = 'catalog-down-enable';
                } else {
                    $catalogUp[0].className = 'catalog-up-enable';
                    $catalogDown[0].className = 'catalog-down-enable';                
                }
            }
        },

        scrollElement: function(ele, jump, dir, dur) {
            var _this = this;
            var dur = dur || 300;
            var top = ('down' === dir) ? ($(ele).scrollTop() + jump) : ($(ele).scrollTop() - jump);
            $(ele).animate({scrollTop: top}, dur, 'linear', function() {
                _this.setUpDownClass();
            });               
        },

        locataContentByCata: function(index) {
            var ele = this.$content.find('[id="' + index + '"]');       
            var top = ele.offset().top;
            $('body, html').animate({scrollTop: top}, 300, 'linear');//不能写$('document')
            window.location.hash = '#' + index;
        },

        // 根据当前document显示的内容定位目录项
        locateCataByContent: function() {
            var cataList = this.$content.find('h2, h3');
            var scrollTop = $(document).scrollTop();
            for (var i = 0, len = cataList.length; i < len; i++) {
                var ele = cataList[i],
                    ele1 = cataList[i+1];
                // 判断当前滚动位置的内容属于哪条目录或子目录
                if ($(ele).offset().top - 20 <= scrollTop && ((i + 1 == len) || ((i + 1 < len) && $(ele1).offset().top > scrollTop))) {
                   // console.log('current index:', i+1)
                    this.$wrapper.find('.highlight').removeClass('highlight');
                    this.$wrapper.find('[href="#' + ele.getAttribute('id') + '"]').parent().addClass('highlight');

                    var top = 6 + i * $('.catalog-title').height();
                    top = top > $('#catalog dl').height() ? $('#catalog dl').height(): top;

                    $('#catalog .arrow').stop().animate({'top': top+'px'}, 100);

                    // 根据sideCatalog当前定位滚动其到合适位置以保证当前选中目录条目在目录中间位置
                    ele.order = i + 1;
                    if (ele.order > 5) {
                        $('#catalog').stop().animate({'scrollTop': (ele.order - 5) * 26}, 100);
                    } else {
                        $('#catalog').stop().animate({'scrollTop': 0}, 100);
                    }
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