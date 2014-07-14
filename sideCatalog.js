
(function() {
	//初始化页面内容显示
	function initContentView(baikeViewInfo) {
	    var str = '',
	        headlineLevel,
	        headlineClass;
	    for(var i = 0, l = baikeViewInfo.cataList.length; i < l; i++) {
	        var cata = baikeViewInfo.cataList[i];
	        if(cata.level == 1) {
	            headlineLevel = 'h2',
	            headlineClass= 'headline-1';
	        }
	        else {
	            headlineLevel = 'h3',
	            headlineClass= 'headline-2';
	        }      
	        str +=  '<' + headlineLevel + ' id="' + cata.index + '" name="' + cata.index + '" class="' + headlineClass + '">' +       
	                '<span class="headline-1-index">' + cata.index + '</span>' +
	                '<span class="headline-1-title">' + cata.title + '</span>' +
	                '</' + headlineLevel +'>';
	        str += '<div class="para">' + cata.content + '</div>';   
	    }    
	    $('#content').html(str);
	}

	//初始化sideCatalog页面显示
	function initCatalogView(baikeViewInfo) {
		var s = '<div id="sideCatalog">' +
	                '<div id="sideCatalog-sidebar">' +
	                    '<div class="sideCatalog-sidebar-top"></div>' +
	                    '<div class="sideCatalog-sidebar-bottom"></div>' +
	                '</div>' +
	                '<div id="sideCatalog-updown">' +
	                    '<div title="向上翻页" id="sideCatalog-up"></div>' +
	                    '<div title="向下翻页" id="sideCatalog-down"></div>' +
	                '</div>' +
	                '<div id="sideCatalog-catalog">' +
	                    '<dl></dl>' +
	                '</div>' +
	            '</div>' +
	            '<a id="sideToolbar-up" href="javascript:void(0)"></a>';
	    $('#sideToolbar').html(s);
		var str = '',
	        cataItemClass,
	        cataIndxClass;
	    for(var i = 0, l = baikeViewInfo.cataList.length; i < l; i++) {
	        var cata = baikeViewInfo.cataList[i];
	        if(cata.level == 1) {
	            cataItemClass = 'sideCatalog-item1';
	            cataIndxClass = 'sideCatalog-index1';
	        }
	        else {
	            cataItemClass = 'sideCatalog-item2';
	            cataIndxClass = 'sideCatalog-index2';
	        }
	        str +=  '<dd class="'+cataItemClass+'" id="sideToolbar-item-0-'+cata.index+'">'+
	                '<span class="'+cataIndxClass+'">'+cata.index+'</span>'+
	                '<a href="#'+cata.index+'" title="'+cata.title+'" onclick="return false;">'+cata.title+'</a>'+ //return false;
	                '<span class="sideCatalog-dot"></span>'+
	                '</dd>';
	    }
	    $('#sideCatalog-catalog dl').html(str);
	}


    var catalogVisible = false;
	var catalogUpDownInited = false;
	var f = false;
	

    function toolbarHideShow() {
        if (!sideToolbarReached()) {
            $("#sideToolbar").fadeOut(100); 
            catalogVisible = false;      
            $("#sideToolbar-up").css('visibility', 'hidden'); ///外层fadeOut以后内层还需设置visibility:hidden
            $("#sideCatalog").css('visibility', 'hidden');
            
        } else {        
            if (!catalogVisible) {
                if ($("#sideCatalog-catalog dd").length > 0) {                  
                    $("#sideCatalog").css('visibility', 'visible');
                }
                $("#sideToolbar-up").css('visibility', 'visible');
                $("#sideToolbar").fadeIn(100, function() {
                    if (!catalogUpDownInited) {
                            initCatalogUpDown();
                            catalogUpDownInited = true;
                        }
                });
                catalogVisible = true;
            }            
            fixSideToolbarPosition();            
        }
    }

    //判断当前滚动位置是否显示sideToolbar
    function sideToolbarReached() {
        //显示sideToolbar的最低滚动高度为400，当右边栏内容高度大于600时，高度为showtag标签的top值
        var threshold = Math.max($('#side-catalog-showtag').offset().top, 400);
        if($(document).scrollTop() + 80 < threshold) {
            return false
        } else {
            return true;
        }
    }

    function initCatalogUpDown() {
        var catalog = document.getElementById("sideCatalog-catalog");
        //目录内容很长需要滚动显示时 
        if (catalog.scrollHeight > $(catalog).height()) {

            $("#sideCatalog").mouseover(function(e) {
                $("#sideCatalog-updown").css('visibility', 'visible');
                    setUpDownClass();
                    e.stopPropagation();
                }).mouseout(function(e) {
                    $("#sideCatalog-updown").css('visibility', 'hidden');
                    e.stopPropagation();
                });
                    

            $("#sideCatalog-up").click(function() {
                scrollElement(catalog, 23 * 2, "up"); //23 ???????????
            });
            $("#sideCatalog-down").click(function() {
                scrollElement(catalog, 23 * 2, "down");
            });

           
            function handler(e) {
                var e = e || window.event;
                console.log(e.wheelDelta);
                console.log(detail);
                if(e.wheelDelta >= 0 || e.detail < 0) {
                    scrollElement(catalog, 23 * 2, "up")
                } else {
                    scrollElement(catalog, 23 * 2, "down")
                }
                e.stopPropagation();
                e.cancelBubble = true;
                e.preventDefault();
            }
            //鼠标滚轮事件在标准下和IE下是有区别的。
            //firefox是按标准实现的,事件名为"DOMMouseScroll ",IE下采用的则是"mousewheel "。
            //事件属性，IE是event.wheelDelta，Firefox是event.detail 
            //属性的方向值也不一样，IE向上滚 > 0，Firefox向下滚 > 0。  有bug
            if(window.attachEvent) {
                $("#sideCatalog-catalog dl")[0].attachEvent("onmousewheel", handler);
            }
            else if(window.addEventListener) {
                $("#sideCatalog-catalog dl")[0].addEventListener("DOMMouseScroll", handler, false);                
            }

        } else {
            $("#sideCatalog-updown").remove();
        }     
    }

    function setUpDownClass() {
        f = false;  /////////////////////////////////////////
      	var catalog = document.getElementById('sideCatalog-catalog');      	
        if ($(catalog).height() + $(catalog).scrollTop() == catalog.scrollHeight) {
            document.getElementById('sideCatalog-up').className = "sideCatalog-up-enable";
            document.getElementById('sideCatalog-down').className = "sideCatalog-down-disable";
        } else {
            if ($(catalog).scrollTop() == 0) {
                document.getElementById('sideCatalog-up').className = "sideCatalog-up-disable";
                document.getElementById('sideCatalog-down').className = "sideCatalog-down-enable";
            } else {
                document.getElementById('sideCatalog-up').className = "sideCatalog-up-enable";
                document.getElementById('sideCatalog-down').className = "sideCatalog-down-enable";                
            }
        }
    }

    function scrollElement(ele, dist, dir, dur) {
        var dur = dur || 300;
        if (!f) {/////////////////////////////////
            f = true;
            var top = ("down" === dir) ? ($(ele).scrollTop() + dist) : ($(ele).scrollTop() - dist);
            $(ele).animate({scrollTop: top}, dur, 'linear');
            setUpDownClass();
        }
    }

    //sideToolbar应为fixed定位，根据页面布局计算fixed定位时的top和left
    function fixSideToolbarPosition() {
        var left = $('#content').offset().left + $("#content").width() - $(document).scrollLeft();

        var windowBottom = $(document).scrollTop() + $(window).height();
        var contentBottom = $("#content-wrap").offset().top + $("#content-wrap").height();
        
        var bottom = (windowBottom <= contentBottom) ? 0 : windowBottom - contentBottom;
        var top = $(window).height() - bottom - $("#sideToolbar").height() - 10;

        setFixedPosition($("#sideToolbar"), {
            top: top,
            left: left
        });
    }

    function setFixedPosition(ele, style) {
        $(ele).css({"position": "fixed", top: style.top, left: style.left});                
    }

    function contentLocationByCata(index) {
        var ele = $('[name=' + index + ']');       
        var top = ele.offset().top;
        $('body, html').animate({scrollTop: top}, 300, 'linear');//不能写$('document')???
        window.location.hash = "#" + index;
    }
    function cataLocationByContent() {
        var cataList = baikeViewInfo.cataList;
        var scrollTop = $(document).scrollTop();
        for (var i = 0, len = cataList.length; i < len; i++) {
            var cata = cataList[i]; 
            var ele = document.getElementsByName(cata.ele)[0];
            //判断当前滚动位置的内容属于哪条目录或子目录
            if ($(ele).offset().top -80 <= scrollTop && ((i + 1 == len) || ((i + 1 < len) && $(document.getElementsByName(cataList[i + 1].ele)[0]).offset().top > scrollTop))) {     
                $("#sideCatalog-catalog .highlight").removeClass("highlight");
                $("#sideCatalog-catalog [href=#" + cata.index + "]").parent().addClass("highlight");
                //根据sideCatalog当前定位滚动其到合适位置以保证当前选中目录条目在目录中间位置
                cata.order = i + 1;
                if (cata.order >= 4) {
                    $("#sideCatalog-catalog").scrollTop((cata.order - 5) * 23)
                } else {
                    $("#sideCatalog-catalog").scrollTop(0)
                } 
                //break;    不能加?? 
            }
        }
    }

       
/*var baikeViewInfo ={
    titleInUrl:"北京烤鸭",
    id:"35863",
    versionId:"60094402",
    subLemmaId:"35863",
    subVersionId:"60094402",
    editable:"true",
    title:"北京烤鸭",
    expIndex:"0", 
    subLen:"1",
    isMulit:0,
    subList:[{"subLemmaDesc":"北京烤鸭","subLemmaId":35863,"subVersionId":60094402}],
    cataList:[]
};
baikeViewInfo.cataList = baikeViewInfo.cataList.concat([
    {"title":"历史缘由","charnum":924,"screennum":1,"level":1,"index":1,"display":true,"ele":"1","content":"啦啦啦啦啦"},
    {"title":"流派分类","charnum":1759,"screennum":2,"level":1,"index":2,"display":true,"ele":"2","content":"啦啦啦啦"},
    {"title":"三大美味","charnum":2412,"screennum":3,"level":1,"index":3,"display":true,"ele":"3","content":"啦啦啦啦"},
    {"title":"全聚德","charnum":708,"screennum":0,"level":2,"index":"3_1","display":true,"ele":"3_1","content":"啦啦啦"},
    {"title":"便宜坊","charnum":884,"screennum":1,"level":2,"index":"3_2","display":true,"ele":"3_2","content":"啦啦啦"},
    {"title":"大董","charnum":808,"screennum":1,"level":2,"index":"3_3","display":true,"ele":"3_3","content":"啦啦啦啦"},
    {"title":"吃法三则","charnum":430,"screennum":0,"level":1,"index":4,"display":true,"ele":"4","content":"啦啦啦啦"},
    {"title":"烹制方法","charnum":1332,"screennum":1,"level":1,"index":5,"display":true,"ele":"5","content":"啦啦啦啦"},
    {"title":"传统做法","charnum":995,"screennum":1,"level":1,"index":6,"display":true,"ele":"6","content":"啦啦啦啦"},
    {"title":"选材","charnum":334,"screennum":0,"level":2,"index":"6_1","display":true,"ele":"6_1","content":"啦啦啦啦"},
    {"title":"烤制","charnum":542,"screennum":0,"level":2,"index":"6_2","display":true,"ele":"6_2","content":"啦啦啦啦"},
    {"title":"制作程序","charnum":3715,"screennum":4,"level":1,"index":7,"display":true,"ele":"7","content":"啦啦啦啦啦"}
]);*/


	var baikeViewInfo = {};
	//获取json数据并填充页面内容
	$.ajax({
	    url: 'data.json'
	}).done(function(json) {
	    baikeViewInfo = eval(json);

	    //初始化页面内容显示
	    initContentView(baikeViewInfo);
	    //初始化目录内容显示
	    initCatalogView(baikeViewInfo);

	    //事件绑定
	    $(document).scroll(toolbarHideShow); 
	    $(document).scroll(cataLocationByContent);

	    //目录项点击事件
	    $("#sideCatalog a").click(function() {
	        var index = $(this).attr("href").replace("#", "");
	        contentLocationByCata(index);
	    })
	    $("#sideCatalog .sideCatalog-dot").click(function() {
	        var index = $(this).parent().find("a").attr("href").replace("#", "");
	        contentLocationByCata(index);
	    });
	    
	    //目录返回顶部
	    $(".sideCatalog-sidebar-top").click(function() {
	        scrollElement($("#sideCatalog-catalog"), 10000, "up", 1)
	    });
	    //目录返回底部
	    $(".sideCatalog-sidebar-bottom").click(function() {
	        scrollElement($("#sideCatalog-catalog"), 10000, "down", 1)
	    });
	    //页面返回顶部按钮
	    $("#sideToolbar-up").click(function() {
            $('body, html').animate({scrollTop: 0}, 300, 'linear');
		});
	});
})();