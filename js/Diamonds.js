(function(){
	//row:0-6 行号;col:0-6列号;type:方块类型
	var Diamonds = window.Diamonds = function(row,col,imageName,type){
		this.row = row;
		this.col = col;
		this.imageName = imageName;
		this.isMove = false;//方块是否在运动
		this.moveNo = 0; //判断运动是否要停止
		this.isBomb = false;//判断方块是否爆炸
		this.bombStep = 8; //爆炸步骤，一共8张图片
		this.isHide = false;//方块是否隐藏，一般爆炸后，就要隐藏
		this.type = type;
		this.isSpecial = false;
		this.change = 1;
		this.diamondwh = calXYByRowCol(this.row,this.col).diamondwh;
		//方块的左侧位置
		this.diamondX = calXYByRowCol(this.row,this.col).diamondX;
		//距离顶部距离
		this.diamondY = calXYByRowCol(this.row,this.col).diamondY;
		
	}
	Diamonds.prototype.update = function() {
		if(this.isHide)
			return;
		if(this.isMove && this.moveNo > 0){
			this.diamondX += this.dx;
			this.diamondY += this.dy;

			this.moveNo --;
		}
		if(this.isBomb){
			if(this.bombStep <= 0){
				this.isBomb = false;
				this.isHide = true;
			}
			game.FNO % 2 == 0 && this.bombStep --;
		}
		if(this.moveNo <= 0){
			this.isMove = false;
		}

	}
	Diamonds.prototype.render = function(){
		//如果需要隐藏，则什么都不渲染
		if(this.isHide){
			return;
		}
		if(game.fsm == "failed" || game.fsm == "succeed"){
			this.change = 0;
		}
		if(!this.isBomb){
			let x = calXYByRowCol(this.row,this.col).diamondX;
			let y = calXYByRowCol(this.row,this.col).diamondY;
			if(game.fsm != "failed" && game.fsm != "succeed"){
				if(this.type == "row"){
					if(this.diamondX < x-4 || this.diamondX > x+4){
						this.change *= -1;
					}
					this.diamondX += this.change;
				}else if(this.type == "col"){
					if(this.diamondY < y-4 || this.diamondY > y+4){
						this.change *= -1;
					}
					this.diamondY += this.change;
				}
			}
			game.ctx.drawImage(game.Images[this.imageName],this.diamondX,this.diamondY, this.diamondwh , this.diamondwh);
		} else {
			game.ctx.drawImage(game.Images["bomb"],(8-this.bombStep) * 200,0,200,200,this.diamondX,this.diamondY, this.diamondwh , this.diamondwh);
		}
		
	}

	//运动
	Diamonds.prototype.moveTo = function(targetRow,targetCol,duringFrames){
		this.isMove = true;
		this.moveNo = duringFrames;
		//计算每次移动的距离
		let targetX = calXYByRowCol(targetRow,targetCol).diamondX;
		let targetY = calXYByRowCol(targetRow,targetCol).diamondY;

		let distanceX = targetX - this.diamondX;
		let distanceY = targetY - this.diamondY;

		this.dx = distanceX / duringFrames;
		this.dy = distanceY / duringFrames;
	}
	//爆炸
	Diamonds.prototype.bomb = function(callback){
		this.isBomb = true;
	}

	//根据行号、列号，计算x 和 y
	function calXYByRowCol(row,col){
		diamondwh = (game.canvas.width - game.leftPadding * 2) / 7 - 4;
		//方块的左侧位置
		diamondX = game.leftPadding + (game.diamondwh + 4) * col;
		//距离顶部距离
		diamondY = game.canvas.height - game.bottom - (game.diamondwh + 2) * (7 - row);

		return {
			diamondX : diamondX,
			diamondY : diamondY,
			diamondwh : diamondwh
		}
	}
})()