(function(){
	var Game = window.Game = function(){
		this.canvas = document.getElementById("mycanvas");
		this.ctx = this.canvas.getContext("2d");
		//帧
		this.FNO = 0;
		//关卡
		this.level = 1;
		//combo数值
		this.combo = 0;
		//最后一次消除的帧编号
		this.lastclear = 0;
		//分数
		this.score = 0;
		//状态机
		this.fsm = "B"; // A--静稳状态  B--检查是否能够消除 C--消除 D--下落  E--补充新的
		this.level = 1; //关卡
		this.time; //时间
		this.scene = 1; //场景
		this.callbacks = {
			
		};//回调函数jSON，每个key都是帧编号，代表在这个帧需要执行的函数
		this.init();

		this.loadAllResources(()=>{
			this.start();
			this.bindEvent();
		});
	}
	Game.prototype.start = function(){
		this.sc = new Scene();
        this.sc.enter(this.scene);
		//实例化方块
		this.map = new Map();
		this.loop();
	}
	Game.prototype.loop = function(){
		requestAnimationFrame(()=>{
			this.sc.render();

			if(game.scene == 1){
				this.FNO ++;
			}
			this.loop();
		})
	}
	//初始化，设置画布的宽度和高度
	Game.prototype.init = function(){
		//读取视口的宽度和高度，
		let windowW = document.documentElement.clientWidth;
		let windowH = document.documentElement.clientHeight;
		//让canvas匹配视口
		this.canvas.width = windowW>420?420:windowW;
		this.canvas.height = windowH>750?750:windowH;

		this.leftPadding = 20;
		this.bottom = 100;
		this.diamondwh = (this.canvas.width - this.leftPadding * 2) / 7 - 4;
		this.top = this.canvas.height - this.bottom - (this.diamondwh + 4) * 7;
	}
	//注册回调函数,frame帧后，才执行该函数
	Game.prototype.registCallback = function(frame,fn){
		this.callbacks[this.FNO + frame] = fn;
	}
	//读取资源
	Game.prototype.loadAllResources = function(callback) {
		//图片资源
		this.Images = {};
		let allReadyNum = 0; //已经加载好的资源数量
		let Res = {
			"images" : [
				{"name" : "bg1" , "url" : "images/bg1.png"},
				{"name" : "bg2" , "url" : "images/bg2.png"},
				{"name" : "bg3" , "url" : "images/bg3.png"},
				{"name" : "i0" , "url" : "images/i0.png"},
				{"name" : "i1" , "url" : "images/i1.png"},
				{"name" : "i2" , "url" : "images/i2.png"},
				{"name" : "i3" , "url" : "images/i3.png"},
				{"name" : "i4" , "url" : "images/i4.png"},
				{"name" : "i5" , "url" : "images/i5.png"},
				{"name" : "i6" , "url" : "images/i6.png"},
				{"name" : "i7" , "url" : "images/i7.png"},
				{"name" : "i8" , "url" : "images/i8.png"},
				{"name" : "i9" , "url" : "images/i9.png"},
				{"name" : "i10" , "url" : "images/i10.png"},
				{"name" : "i11" , "url" : "images/i11.png"},
				{"name" : "i12" , "url" : "images/i12.png"},
				{"name" : "i13" , "url" : "images/i13.png"},
				{"name" : "i14" , "url" : "images/i14.png"},
				{"name" : "bird" , "url" : "images/bird.png"},
				{"name" : "bomb" , "url" : "images/bomb.png"},
				{"name" : "button" , "url" : "images/button.png"},
				{"name" : "logo" , "url" : "images/logo.png"},
				{"name" : "infotip" , "url" : "images/infotip.png"},
				{"name" : "succeed" , "url" : "images/succeed.png"},
				{"name" : "failed" , "url" : "images/failed.png"}
			]
		};
		for(let i = 0 ; i < Res["images"].length ; i ++){
			this.Images[Res["images"][i]["name"]] = new Image();
			this.Images[Res["images"][i]["name"]].src = Res["images"][i].url;
			//加载图片资源
			this.Images[Res["images"][i]["name"]].onload = ()=>{
				allReadyNum ++;
				//清屏
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				//提示文字
				let txt = "正在加载资源" + allReadyNum + "/" + Res.images.length + "请稍后";
				//放置居中的位置，屏幕的黄金分割点
				this.ctx.textAlign = "center";
				this.ctx.font = "20px 微软雅黑";
				this.ctx.fillText(txt, this.canvas.width / 2 ,this.canvas.height * (1 - 0.618));
				if(allReadyNum == Res["images"].length){
					//图片文件读取完毕
					callback && callback();
				}
			}
		}
	};
	Game.prototype.bindEvent = function(){
		let self = this;
		let startrow , startcol;

        const moveHandler = function(event){
            let endcol = parseInt(event.offsetX / (self.diamondwh + 4));
			let endrow = parseInt((event.offsetY - self.top) /  (self.diamondwh + 4));

            //验收
            if(endcol < 0 || endrow < 0 || endcol > 6 || endrow > 6) {
                this.removeEventListener("mousemove",moveHandler , false);
                return;
            }


            if(
                startrow == endrow && Math.abs(startcol - endcol) == 1
                ||
                startcol == endcol && Math.abs(startrow - endrow) == 1
            ){
				
				self.map.exchange(startrow,startcol,endrow,endcol);
                //剥夺事件，否则事件会再一次触发
                this.removeEventListener("mousemove",moveHandler , false);
            }
        }

        //绑定事件
        this.canvas.addEventListener("mousedown", function(event){
            //在静稳状态
            if(self.fsm == "A"){

                startcol = parseInt(event.offsetX / (self.diamondwh + 4));
				startrow = parseInt((event.offsetY - self.top) /  (self.diamondwh + 4));

                if(startcol < 0 || startrow < 0 || startcol > 6 || startrow > 6) {
                	this.removeEventListener("mousemove",moveHandler , false);
                	return;
                }

                //注册一个事件
                this.addEventListener("mousemove" , moveHandler , false);
            }
        },false);
    }	
})();