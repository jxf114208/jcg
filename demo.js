jsPlumb.ready(function () {
	
	//数据类型
	var idIndex = 0;
	var $container = $("#flowchart-demo");
	
	//窗口对象
	var $window = $(window);
	//窗口高度
	var winHeight = $window.height();
	
	//左边区域对象
	var $left= $("#component");
	//左边区域对象
	var $right= $("#tabs");
	
	var instance = jsPlumb.getInstance({
		// default drag options
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays: [
            [ "Arrow", { location: 1 } ]
        ],
        Container: $container
    });
	
	var basicType = {
        connector: "StateMachine",
        paintStyle: { strokeStyle: "red", lineWidth: 2 },
        hoverPaintStyle: { strokeStyle: "blue" },
        overlays: [
            "Arrow"
        ]
    };
    instance.registerConnectionType("basic", basicType);

    // this is the paint style for the connecting lines..
    var connectorPaintStyle = {
            lineWidth: 2,
            strokeStyle: "#61B7CF",
            joinstyle: "round",
            outlineColor: "white",
            outlineWidth: 2
        },
        
        // .. and this is the hover style.
        connectorHoverStyle = {
            lineWidth: 2,
            strokeStyle: "#216477",
            outlineWidth: 2,
            outlineColor: "white"
        },
        
        endpointHoverStyle = {
            fillStyle: "#216477",
            strokeStyle: "#216477"
        },
        
        // the definition of source endpoints (the small blue ones)
        sourceEndpoint = {
            endpoint: "Dot",
            paintStyle: {
                strokeStyle: "#7AB02C",
                fillStyle: "transparent",
                radius: 5,
                lineWidth: 2
            },
            isSource: true,
            connector: [ "Flowchart"],
            connectorStyle: connectorPaintStyle,
            hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle: connectorHoverStyle,
            dragOptions: {}
        },
        
        // the definition of target endpoints (will appear when the user drags a connection)
        targetEndpoint = {
            endpoint: "Dot",
            paintStyle: { fillStyle: "#7AB02C", radius: 6 },
            hoverPaintStyle: endpointHoverStyle,
            maxConnections: 1,
            dropOptions: { hoverClass: "hover", activeClass: "active" },
            isTarget: true,
        };
    
	var $start = $("<div>",{"class":"window flow start",data:{"type":"start"}});
    // suspend drawing and initialise.
    instance.batch(function () {
    	
	    $container.append($start.css({"top":"10px","left":$container.width()/2 - 32  + "px"}));
    	instance.draggable($start,{containment: "parent"});
    	//追加起始点
	    instance.addEndpoint($start, sourceEndpoint, {anchor: "Bottom",uuid: "start"});
	    
	    // listen for new connections; initialise them the same way we initialise the connections at startup.
        instance.bind("connection", function (connInfo, originalEvent) {
        	//针对if元素，给连接设置connType参数
        	var connType = connInfo.sourceEndpoint.getParameter("connType");
        	if(connType){
        		connInfo.connection.setParameter("connType",connType);
        	}
            //connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
        });
        
        //
        // listen for clicks on connections, and offer to delete connections on click.
        //
        instance.bind("click", function (conn, originalEvent) {
           // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
        	 //   instance.detach(conn);
            conn.toggleType("basic");
        });
        
        /*
     	instance.bind("connectionDrag", function (connection) {
            console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
        });

        instance.bind("connectionDragStop", function (connection) {
            console.log("connection " + connection.id + " was dragged");
        });

        instance.bind("connectionMoved", function (params) {
            console.log("connection " + params.connection.id + " was moved");
        });
        */
    });
    
    
  var $accordion = $( "#accordion" );
	/**初始化左边的控件*/
  var $methodTemp = $("#methodTemp");
  //加载并初始化函数分类
	$(methods).each(function(){
		var $cat = this;
		//创建容器
		var $div = $("<div>");
		$accordion.append($("<h3>",{text:$cat.name})).append($div);
		
		//构件方法模块，并填充到容器$div中
		$($cat.methods).each(function(){
			var $m = this;
			var $c = $methodTemp.clone();
			var icon = {"background-image" : "url('" + $m.icon + "')"};
			$c.removeAttr("id").show();
			$c.css(icon);
			$c.find(".window").css(icon);
			$c.find("h4").text($m.comment);
			$c.find("i").text($m.comment);
			$div.append($c);
			$c.data("json",$m);
		});
	});
    
	$accordion.accordion({
		collapsible: true,
		//heightStyle: "fill",
		icons:null
  });
	
//	$( "#accordion-resizer" ).resizable({
//	  minHeight: 140,
//	  Width: 165,
//	  resize: function() {
//		  $accordion.accordion( "refresh" );
//	  }
//	});
	
	//生成uuid
	var getuid =  function() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	      .toString(16)
	      .substring(1);
	  }
	  
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	    s4() + '-' + s4() + s4() + s4();
	};
	
	/**初始化右边的控件*/
	 $( "#tabs" ).tabs();
    
    //初始化元素拖动
    $("#component .comp").draggable({
	  revert: "invalid", // when not dropped, the item will revert back to its initial position
      helper: "clone",
      cursor: "move"
    });
	
    //初始化元素的放置功能
    $container.droppable({
      greedy: true,
      accept: "#component .comp",
      drop: function( event, ui ) {
    	
    	//设置id索引标识，保证移除一个，另一个也移除
    	idIndex++;
		
		var $helper = ui.helper;
		var offset = $container.offset();
		//获得元素的相对css信息
		var pos = $helper.position();
		var top = pos.top - offset.top;
		var left = pos.left - offset.left;
		
		//取得对应的元素
		var $els = $helper.children("div");
		$els.each(function(){
			//取得单个元素对象
			var $el = $(this);
			
			//设置唯一标识
			$el.attr("data-id",idIndex);
			$el.data("type",$helper.data("type"));
			
			//如果是方法
			if($el.hasClass("method"))
			{
				var json = ui.draggable.data("json");
				$el.data("json",JSON.parse(JSON.stringify(json)));
			}
			
			//判断是否为if begin元素
			var isIfBegin = $el.hasClass("if begin");
			
			//设置坐标信息
			$el.offset({top: top,left: left});
			top = top + 100;
			//追加到容器中
			$container.append($el);
			//元素可拖动
			instance.draggable($el,{containment: "parent"});
			
			//取得对应的EndPoint信息
			var $epInfos = $( $el.data("epInfos") );
			$epInfos.each(function(){
				//单个EndPoint的信息
				var $epInfo = this;
				//基于信息给元素增加相应的EndPoint
				var $ep = instance.addEndpoint($el, $epInfo.type === "source" ? sourceEndpoint : targetEndpoint, {anchors: $epInfo.anchor, uuid: getuid()});
				
				//设置if begin 元素对应source的endPoint的参数connType
				if(isIfBegin && $epInfo.type === "source")
				{
					$ep.setParameter("connType",$epInfo.connType);
				}
			});
		});
	  }
    });

    //绑定元素的移除事件
	$container.on({
		click: function(){
			//取得当前对象对应的标识
			var id = $(this).parent().data("id");
			//移除具有当前标识的元素
			$("[data-id=" + id + "]").each(function(){
				instance.remove(this);
				$("#tabs-1").empty();
			});
		}
	},".dl");
	
	//高亮元素对应元素的事件，点击事件
	$container.on({
		mouseenter: function(){
			//取得当前对象对应的标识
			var id = $(this).data("id");
			$("[data-id=" + id + "]").addClass("hover");
		},
		mouseleave: function(){
			var id = $(this).data("id");
			$("[data-id=" + id + "]").removeClass("hover");
		},
		click: function(event){
			var $this = $(this);
			var $right = $("#tabs-1").empty();
			$(".window.active").removeClass("active");
			$this.addClass("active");
			
			//在右侧增加条件输入或者代码输入控件
			var $condition = $this.find(".condition");
			if($condition.length == 1)
			{
				var $lbl;
				var $txt;
				if($this.data("type") === "code")
				{
					$lbl = $("<b>",{text:"代码编写："});
					$txt = $("<textarea>",{css:{"margin-top": "10px","width": "230px","height":  winHeight - 95 + "px","background-color":"rgb(255, 255, 146)","border-color": "rgb(169, 169, 169)"}});
				}else
				{
					$lbl = $("<b>",{text:"条件表达式设置："});
					$txt = $("<input>",{"type":"text",css: {"margin-top":"10px","width": "230px","background-color":"rgb(255, 255, 146)","border": "1px solid rgb(169, 169, 169)"}});
				}
				$right.append($lbl).append($txt);
				$txt.val($condition.find("i").text());
			}
		}
	},".window.flow");
	
	//方法模块的点击事件
	$container.on({
		click: function(event){
			var $this = $(this);
			var $right = $("#tabs-1").empty();
			$(".window.active").removeClass("active");
			$this.addClass("active");
			
			var json = $this.data("json");
			//参数
			$(json.parameters).each(function(i){
				var $table = $("<table cellspacing=0>").append($("<caption>",{text:"参数" + i,css:{"text-align":"left","font-size":"14px","font-weight":"bolder"}}));
				
				$table.append($("<tr>").append($("<td>",{text:"参数名"})).append($("<td>",{text:this.name})));
				$table.append($("<tr>").append($("<td>",{text:"参数类型"})).append($("<td>",{text:this.type})));
				$table.append($("<tr>").append($("<td>",{text:"参数值"})).append($("<td>").append($("<input>",{"class":"p",val:this.val,"data-index":i}))));
				$table.append($("<tr>").append($("<td>",{text:"说明"})).append($("<td>",{text:this.comment})));
				
				$("#tabs-1").append($table);
			});
			
			//返回信息
			var $return = json.returnInfo;
			
			var $table = $("<table cellspacing=0>").append($("<caption>",{text:"返回",css:{"text-align":"left","font-size":"14px","font-weight":"bolder"}}));
				
			$table.append($("<tr>").append($("<td>",{text:"返回类型"})).append($("<td>",{text:$return.type})));
			if($return.type !== "void")
			{
				$table.append($("<tr>").append($("<td>",{text:"返回变量名"})).append($("<td>").append($("<input>",{"class":"r",val:$return["var"]}))));
			}
			
			$("#tabs-1").append($table);
		}
	},".window.method");
	
	//容器的点击事件
	$container.on({
		click: function(event){
			if(event.target == this)
			{
				$(".window.active").removeClass("active");
				//移除右侧条件输入或者代码输入控件
				$("#tabs-1").empty();
			}
		}
	});
	
	//条件设置的keyup事件
	$(".right").on({
		keyup: function(event){
			//取得当前激活元素对象
			var $el = $(".window.active");
			if($el.hasClass("flow"))
			{
				var $condition = $el.find(".condition");
				if($el.length == 1 && $condition.length == 1)
				{
					var value = $.trim($(this).val());
					$el.data("condition",value);
					$condition.find("i").text(value);
				}
			}
			else if($el.hasClass("method"))
			{
				var $this = $(this);
				var $json = $el.data("json");
				//如果是参数
				if($this.hasClass("p"))
				{
					$json.parameters[$this.data("index")].val = $this.val();
				}
				//如果是返回
				else if($this.hasClass("r"))
				{
					$json.returnInfo["var"] = $this.val();
				}
			}
		}
	},"textarea,input");
	
	//解析元素对象，生成json数据
	var parseEL = function(jsonArray, $target){
		//目标元素的type
		var type = $target.data("type");
		//目标元素的condition，只有条件或者代码元素才有
		var condition = $target.data("condition");
		condition = condition ? condition : "";
		
		//声明jsonObject对象
		var jsonObject = {};
		
		//查询连接对象
		var conns = instance.getConnections({ source: $target });
		
		//起始节点
		if(type !== "start")
		{
			jsonObject.type = type;
			//成对元素
			if(type === "if" || type === "while" || type === "for")
			{
				jsonObject.id = $target.data("id");
				//如果是条件开始
				if($target.hasClass("begin")){
					jsonObject.subType = "begin";
					jsonObject.condition = condition;
					
					//存在两条连接，肯定有else，则给对应的end节点增加back样式，标注返回，重新解析else
					if(type === "if" && conns.length === 2){
						
						var conn;
						//判断是否标注已经返回样式
						if(!$target.hasClass("backed")){
							//标注end节点为back
							$(".if.end[data-id=" + jsonObject.id + "]").addClass("back");
							//选择走参数connType为if的conn
							conn = conns[0];
							if(conn.getParameter("connType") !== "if")
							{
								conn = conns[1];
							}
						}else
						{
							//移除backed样式
							$target.removeClass("backed");
							//type设置为else
							jsonObject.type = "else";
							delete jsonObject.condition;
							//选择走参数connType为else的conn
							conn = conns[0];
							if(conn.getParameter("connType") !== "else")
							{
								conn = conns[1];
							}
							
							//标注已经返回
							$(".if.end[data-id=" + jsonObject.id + "]").addClass("backed");
						}
						
						//放入jsonArray中
						jsonArray.push(jsonObject);
						
						//直接解析conn连接对应的目标元素
						parseEL(jsonArray, $(conn.target));
						return;
					}
				}else
				{
					jsonObject.subType = "end";
					
					//判断if end 节点是否有back样式
					if(type === "if")
					{
						//判断是否要返回begin
						if($target.hasClass("back"))
						{
							//放入jsonArray中
							jsonArray.push(jsonObject);
							
							//移除back样式
							$target.removeClass("back");
							//给对应begin节点增加backed样式，标注已经返回
							var $begin = $(".if.begin[data-id=" + jsonObject.id + "]").addClass("backed");
							//重新解析if begin,
							parseEL(jsonArray, $begin);
							return;
						}
						//判断是否已经返回
						else if($target.hasClass("backed")){
							//移除backed样式
							$target.removeClass("backed");
							//type设置为else
							jsonObject.type = "else";
						}
					}
				}
			}
			//单独元素
			else
			{
				//有条件元素
				if(type === "calculate" || type === "return")
				{
					jsonObject.condition = condition;
				}
				//有代码元素
				else if(type === "code")
				{
					jsonObject.code = condition;
				}
				//方法元素
				else if(type === "method")
				{
					jsonObject = $target.data("json");
				}
			}
			
			//放入jsonArray中
			jsonArray.push(jsonObject);
		}
		
		if(conns.length == 0){
			return;
		}
		
		$(conns).each(function(){
			parseEL(jsonArray, $(this.target));
		});
	};
	
	//变量模板对象
	var $varTemp = $("#varTemp");
	//左侧全局变量的增加按钮点击事件
	var gIndex = 0;
	$("#tabs-2 .add").click(function(){
		var $vars = $(this).next();
		var $c = $varTemp.clone();
		$c.removeAttr("id").show();
		$c.find(".varN").val("g_" + gIndex++);
		$c.find(".delete").click(function(){
			$c.remove();
		});
		$vars.append($c);
	});
	//左侧局部变量的增加按钮点击事件
	var lIndex = 0;
	$("#tabs-3 .add").click(function(){
		var $vars = $(this).next();
		var $c = $varTemp.clone();
		$c.removeAttr("id").show();
		$c.find(".varN").val("v_" + lIndex++);
		$c.find(".delete").click(function(){
			$c.remove();
		});
		$vars.append($c);
	});
	//左侧全局变量的解析方法,返回JSONArray
	var parseGVars = function(){
		var jsonArray = [];
		//解析全局变量
		$("#tabs-2 .vars table").each(function(){
			var $t = $(this);
			var json = {};
			json.name = $t.find(".varN").val();
			json.type = $t.find(".varT").val();
			json.val = $t.find(".varV").val();
			json.comment = $t.find(".varC").val();
			jsonArray.push(json);
		});
		return jsonArray;
	};
	//左侧局部变量的解析方法,返回JSONArray
	var parseLVars = function(){
		var jsonArray = [];
		$("#tabs-3 .vars table").each(function(){
			var $t = $(this);
			var json = {};
			json.name = $t.find(".varN").val();
			json.type = $t.find(".varT").val();
			json.val = $t.find(".varV").val();
			json.comment = $t.find(".varC").val();
			jsonArray.push(json);
		});
		return jsonArray;
	};
	//手动增加变量
	var manualAddVar = function(type, json){
		var $vars;
		if(type === "g"){
			//全局变量
			$vars = $("#tabs-2 .vars");
		}else
		{
			//局部变量
			$vars = $("#tabs-3 .vars");
		}
		
		//生成html元素
		var $c = $varTemp.clone();
		$c.removeAttr("id").show();
		$c.find(".delete").click(function(){
			$c.remove();
		});
		$vars.append($c);
		
		//赋值
		$c.find(".varN").val(json.name);
		$c.find(".varT").val(json.type);
		$c.find(".varV").val(json.val);
		$c.find(".varC").val(json.comment);
	}
	
	/**
	 * =============================================
	 *
	 * 数据的保存和重新载入功能
	 *
	 * =============================================
	 */
	
	//清空容器中的元素、属性、全局变量、局部变量
	var clearAll = function() {
		//清空容器元素,并重置id索引
		instance.empty($container);
		idIndex = 0;
		
		//属性区域
		$("#tabs-1").empty();
		
		//全局变量、局部变量
		$("#tabs-2,#tabs-3").find(".vars").empty();
		//重置变量索引
		gIndex = 0,lIndex = 0;
	}
	
	//把页面数据保存成为一个JSON数据
	var saveData = function(){
		var jsonData = {};
		
		//全局索引
		jsonData.idIndex = idIndex;
		jsonData.gIndex = gIndex;
		jsonData.lIndex = lIndex;
		
		/**组件信息*/
		var comps = [];
		//遍历容器对象中所有的组件
		$container.children(".window").each(function(){
			//单个组件对象
			var comp = {};
			
			var $el = $(this);
			comp.id = $el.attr("id");//id
			comp.class = $el.attr("class").replace("ui-draggable ui-draggable-handle","");//class值
			comp.position = $el.position();//坐标
			comp.data = $.extend({}, $el.data());//data属性
			delete comp.data.uiDraggable;//移除无用属性
			comp.data_id = $el.attr("data-id");//data-id值
			comp.html = $el.html();//innerHtml
			
			var endpoints = [];
			//组件的Endpoints
			$(instance.getEndpoints($el)).each(function(){
				var ep = {};
				ep.id = this.id;//id
				ep.uuid = this.getUuid();//uuid
				ep.isSource = this.isSource;//是否为source
				ep.params = this.getParameters();//扩展参数
				ep.anchor = this.anchor.type;//anchor类型
				endpoints.push(ep);
			});
			comp.endpoints = endpoints;
			
			comps.push(comp);
		});
		jsonData.comps = comps;
		
		/**连接信息*/
		var conns = [];
		$(instance.getAllConnections()).each(function(){
			var conn = {};
			var eps = this.endpoints;
			conn.sourceId = eps[0].getUuid();//连接源
			conn.targetId = eps[1].getUuid();//目标源
			conn.params = this.getParameters();//扩展参数
			conns.push(conn);
		});
		jsonData.conns = conns;
		
		/**全局，局部变量*/
		jsonData.gvars = parseGVars();
		jsonData.lvars = parseLVars();
		
		//测试代码
		//console.info(jsonData);
		//$("body").data("saveData",jsonData);
		
		return JSON.stringify(jsonData);
	};
	
	//重新导入一个保存好的页面数据
	var importData = function(jsonStr){
		//解析成JSON对象
		var jsonData = JSON.parse(jsonStr);
		
		//测试代码
		//var jsonData = $("body").data("saveData");
		//console.info(jsonData);

		//清空
		clearAll();
		
		//同步索引
		idIndex = jsonData.idIndex;
		gIndex = jsonData.gIndex;
		lIndex = jsonData.lIndex;
		
		/**组件*/
		//追加组件到容器中
		$(jsonData.comps).each(function(){
			//单个组件对象
			var comp = this;
			console.info(this);
			
			//创建div对象
			var $el = $("<div>", {
				"id": comp.id,
				"class": comp.class,
				"data-id": comp.data_id,
				data: comp.data,
				css: comp.position,
				html: comp.html
			});
			
			//追加到容器中
			$container.append($el);
			//元素可拖动
			instance.draggable($el,{containment: "parent"});
			
			//追加Endpoint
			$(comp.endpoints).each(function(){
				//单个endpoint
				var ep = this;
				
				//追加到当前元素
				var $ep = instance.addEndpoint($el, ep.isSource ? sourceEndpoint : targetEndpoint, {anchors: ep.anchor, uuid: ep.uuid});
				$ep.setParameters(ep.params);
			});
		});
		
		/**连接*/
		//重新建立连接
		$(jsonData.conns).each(function(){
			//单个连接对象
			var conn = this;
			//建立连接
			var $conn =  instance.connect({uuids: [conn.sourceId, conn.targetId],  editable: true});
			$conn.setParameters(conn.params);
		});
		
		/**全局，局部变量*/
		$(jsonData.gvars).each(function(){
			manualAddVar("g", this);
		});
		$(jsonData.lvars).each(function(){
			manualAddVar("l", this);
		});
	};
	
	
	/**绑定全局自适应大小事件*/
	//table对象
	var $tbl = $("#tbl");
	//设置table高度
	$tbl.height(winHeight);
	
	//变量区域对象
	var $vars = $(".ui-tabs .vars");
	//设置右边区域的高度
	$right.height(winHeight - 10);
	//设置右边变量区域的高度
	$vars.height(winHeight - 90);
	//设置画图区域的高度
	$container.height(winHeight - 10);
	//设置左边区域的高度
	$left.height(winHeight - 10);
	
	$window.resize(function(e) {
	  setFrameHeight($window.height());
  });
  
  //设置元素高度
  function setFrameHeight(height){
    winHeight = height;
    $tbl.height(winHeight);
	  $vars.height(winHeight - 90);
	  $container.height(winHeight - 10);
	  $left.height(winHeight - 10);
	  $right.height(winHeight - 10);
	  //多行文本框的高度
	  $(".right textarea").height(winHeight - 95);
  }
	
	
	/** =============================================
	 *
	 * 对外提供的API
	 *
	  =============================================*/
	
	window.test = function(id){
//		$(instance.getEndpoints(id)).each(function(){
//			console.info(this.getUuid());
//		});
		
//		$(instance.getAllConnections()).each(function(){
//			console.info(this);
//		});
	};
	
	//设置元素高度
	window.setFrameHeight = function(height){
		setFrameHeight(height);
	};
	
	//清空页面元素信息，包括容器中的元素、属性、全局变量、局部变量
	window.clearAll = function(){
		clearAll();
	};
	
	//清空页面元素信息，包括容器中的元素、属性、全局变量、局部变量
	window.saveData = function(){
		return saveData();
	};
	
	//清空页面元素信息，包括容器中的元素、属性、全局变量、局部变量
	window.importData = function(jsonStr){
		importData(jsonStr);
	};
	
	//声明一个函数，返回生成的json
	window.getCodeJSON = function(){
		//数据对象
		var data = {};
		
		//解析全局变量
		data.globalVars = parseGVars();
		
		//解析局部变量
		data.localVars = parseLVars();
		
		//解析代码逻辑
		var jsonArray = [];
		parseEL(jsonArray,$start);
		data.codeLogic = jsonArray;
		
		//返回结果
		return JSON.stringify(data);
	};
});