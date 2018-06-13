(function() {
	'use strict';

	function SideToolbar(wrapper, options) {
		var defaults = {
			width: 260,
			height: 300,
			right: 10,
			bottom: 10,
			speed: 300,
			showHeight: 600
		};

		this.settings = $.extend(defaults, options);

		this.$wrapper = $(wrapper);

		this.isVisible = false;
		this.$wrapper.css({display: 'none'});

		this.initView();

		this.bindEvents();
	}

	SideToolbar.prototype = {
		initView: function() {
			var btn = '<a id="sideToolbar-btn" href="javascript:void(0);"></a>'
			var up = '<a id="sideToolbar-up" href="javascript:void(0)"></a>';
			this.$wrapper.append(btn).append(up);
			
			this.fixPosition();
		},

		fixPosition: function() {

			this.$wrapper.css({
				width: this.settings.width, 
				height: this.settings.height, 
				right: this.settings.right,
				bottom: this.settings.bottom
			});
		},

		bindEvents: function() {
			var _this = this;

			$(document).scroll(function() {
				if ($(document).scrollTop() > _this.settings.showHeight) {
					if (_this.isVisible == false) {
						_this.isVisible = true;
						_this.show();
					}					
				} else {
					if (_this.isVisible == true) {
						_this.isVisible = false;
						_this.hide();
					}
				}				
			});

			// 必须在绑定document的scroll事件处理函数之后才能手动触发该事件
			$(document).trigger('scroll');

			$('#sideToolbar-btn').click(function() {
				if ($(this).hasClass('disable')) {
					$(this).removeClass('disable');
					_this.$wrapper.find(':first-child').css({visibility: 'visible'});
				} else {
					$(this).addClass('disable');
					_this.$wrapper.find(':first-child').css({visibility: 'hidden'});
				}
			});

			$('#sideToolbar-up').click(function() {
				// $(document).animate({scrollTop: ..}) 会出错
				// $(document).scrollTop() 可以
				$('body, html').animate({
					scrollTop: 0
				}, _this.settings.speed, 'linear');
			});
		},

		show: function() {
			// fadeIn、fadeOut 操作的是 display 属性，不能跟 visibility 同时使用
			this.$wrapper.fadeIn(this.settings.speed);
		},

		hide: function() {
			this.$wrapper.fadeOut(this.settings.speed);
		}
		
	};
 	

 	window.SideToolbar = SideToolbar;

 	$.fn.sideToolbar = function(options) {
 		var sideToolbar = new SideToolbar(this, options);
 		return $(this);
 	};

})(jQuery);