(function(){
    var Scene=window.Scene=function(){
        this.clickEvent();
    };

    Scene.prototype.enter = function(number){
        game.scene = number;

        switch (game.scene) {
            case 0:
                this.buttonX = (game.canvas.width - 182) / 2;
				this.buttonY = 2 * game.canvas.height / 3;
                break;
            case 1:
                this.buttonX = (game.canvas.width - 140) / 2;
				this.buttonY = game.canvas.height / 2 + 50;
                break;
        }
    }

    Scene.prototype.render = function(){
        switch (game.scene) {
            case 0:
                game.ctx.clearRect(0,0,game.canvas.width,game.canvas.height);
                game.ctx.drawImage(game.Images["bg3"],0,0,game.canvas.width,game.canvas.height);
                game.ctx.drawImage(game.Images["logo"],(game.canvas.width - 531 / 2) / 2,0,531 / 2,392 / 2);
                game.ctx.drawImage(game.Images["button"],(game.canvas.width - 182) / 2 ,2 * game.canvas.height / 3 , 182 , 60);
                game.ctx.font = "30px consolas";
                game.ctx.fillStyle = "rgb(244, 255, 163)";
                game.ctx.fillText("开始游戏",(game.canvas.width) / 2 ,2*game.canvas.height / 3 + 40);
                break;
            case 1:
                game.ctx.clearRect(0,0,game.canvas.width,game.canvas.height);
                //画背景
                game.ctx.drawImage(game.Images["bg1"],0,0,game.canvas.width,game.canvas.height);
                //打印标题
                game.ctx.drawImage(game.Images["logo"],(game.canvas.width - 531 / 2) / 2,30,531 / 2,392 / 2);
                game.ctx.drawImage(game.Images["infotip"],0,0);
                
                game.ctx.font = "16px consolas";
                game.ctx.fillStyle = "rgb(244, 255, 163)";
                game.ctx.fillText("关卡",105,25);
                game.ctx.fillText(game.level,105,40);
                game.ctx.fillText("时间",220,20);
                game.ctx.fillText(game.time,220,35);
                game.ctx.fillText("分数",325,22);
                game.ctx.fillText(game.score,325,37);

                
                game.ctx.fillStyle = "rgba(0,0,0,0.3)";
                game.ctx.fillRect(game.leftPadding,game.top,(game.diamondwh + 4) * 7,(game.diamondwh + 4) * 7);
            
                //画方块
                game.map.render();
                
                //检查帧编号是否符合回调中的帧，如果有，就执行里面的函数
                if(game.callbacks.hasOwnProperty(game.FNO.toString())){
                    //执行里面的函数
                    typeof game.callbacks[game.FNO.toString()] === "function" && game.callbacks[game.FNO.toString()]();
                    //清除这条函数
                    delete game.callbacks[game.FNO.toString()];
                }
                //根据状态机状态决定做什么事情
                switch(game.fsm){
                    case "A":
                        break;
                    case "B":
                        //检查是否能够消除，能，则进入状态C，不能则进入状态A                     
                        if(game.map.check().length > 0){
                            game.fsm = "C";
                        } else {
                            game.fsm = "A";
                        }
                        break;
                    case "C":
                        let codeArr = [[],[],[],[],[],[],[]];
                        for (let i = 0; i < 7; i++) {
                            for (let j = 0; j < 7; j++) {
                                codeArr[i][j] = game.map.code[i][j];                               
                            }
                            
                        }
                        let arr = game.map.check();
                        game.map.clear();
                        game.fsm = "动画状态";
                        game.map.createSpecialDiamonds(arr,codeArr);
                        game.fsm = "动画状态";
                        game.registCallback(14,function(){
                            game.fsm = "D";
                        })
                        break;
                    case "D":                     
                        game.map.dropdown();
                        game.fsm = "动画状态";
                        game.registCallback(20,function(){
                            game.fsm = "E";
                        })
                        break;
                    case "E":
                        game.map.supply();
                        game.fsm = "动画状态";
                        game.map.matchDiamondsByCode();
                        game.registCallback(25,function(){
                            game.fsm = "B";
                        })
                        break;
                }
                
                if(game.time == 0){
                    game.fsm = "failed";
                    game.ctx.drawImage(game.Images["failed"],(game.canvas.width - 310) / 2,(game.canvas.height - 231) / 2);
                    game.ctx.font = "20px consolas bolder";
                    game.ctx.fillStyle = "rgb(244, 255, 163)";
                    game.ctx.textAlign = "center";
                    game.ctx.fillText("时间耗尽，需要重新挑战吗？",game.canvas.width / 2 + 10,game.canvas.height / 2 - 10);
                    game.ctx.drawImage(game.Images["button"],(game.canvas.width - 140) / 2,game.canvas.height / 2 + 50);
                    game.ctx.fillText("重新挑战",game.canvas.width / 2,game.canvas.height / 2 + 80);
                    return;
                }else if(game.score > 750){
                    game.fsm = "succeed";
                    game.ctx.drawImage(game.Images["succeed"],(game.canvas.width - 310) / 2,(game.canvas.height - 231) / 2);
                    game.ctx.font = "25px consolas bolder";
                    game.ctx.fillStyle = "rgb(244, 255, 163)";
                    game.ctx.textAlign = "center";
                    game.ctx.fillText("本关完成！",game.canvas.width / 2 + 10,game.canvas.height / 2 - 50);
                    game.ctx.font = "20px consolas bolder";
                    game.ctx.fillText("清除分数："+game.score,game.canvas.width / 2 + 10,game.canvas.height / 2 - 25);
                    game.ctx.fillText("时间奖励："+game.time*3,game.canvas.width / 2 + 10,game.canvas.height / 2 );
                    game.ctx.fillText("总分："+(game.score+game.time*3),game.canvas.width / 2 + 10,game.canvas.height / 2 + 25);
                    game.ctx.drawImage(game.Images["button"],(game.canvas.width - 140) / 2,game.canvas.height / 2 + 50);
                    game.ctx.fillText("确定",game.canvas.width / 2,game.canvas.height / 2 + 80);
                    return;
                }
                //剩余时间
                game.time = 60 - parseInt(game.FNO / 60);
                break;
            case 2:
                if(game.fsm == "failed"){
                    game.ctx.drawImage(game.Images["failed"],(game.canvas.width - 310) / 2,(game.canvas.height - 231) / 2);
                }else if(game.fsm == "succeed"){

                }
                break;
        }
    }
    Scene.prototype.clickEvent = function(){
        game.canvas.onclick = (e)=>{
            let x = e.offsetX;
            let y = e.offsetY;
            switch(game.scene){
				case 0:
					//判断是否点击在了按钮身上
					if(x > this.buttonX && y > this.buttonY && x < this.buttonX + 182 && y < this.buttonY + 60){
						this.enter(1);
					}
					break;
				case 1:
                    if(game.fsm == "failed" || game.fsm == "succeed"){
                        if(x > this.buttonX && y > this.buttonY && x < this.buttonX + 140 && y < this.buttonY + 46){
                            game.map = new Map();
                            game.score = 0;
                            game.FNO = 0;
                            game.time = 60;
                            if(game.fsm == "failed"){
                                game.level = 1;
                            }else if(game.fsm == "succeed"){
                                game.level++;
                            }
                            game.fsm = "B";
                        }
                    }
					break;
			}
        }
    }
})();