(function(){
	//地图决定方块初始位置
	var Map = window.Map = function(){
		this.code = [
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5),_.random(0,5)],
			[]
		];
		//存放真实方块
		this.diamonds = [[],[],[],[],[],[],[]];

		//一共有14种类型的方块，每次开局时，需要从14个方块中选择其中的六个
		this.imageSrc = ["i0","i1","i2","i3","i4","i5","i6","i7","i8","i9","i10","i11","i12","i13"];
		this.imageNameSrc = _.sample(this.imageSrc,6).concat("bird");
		//0-5行的方块，各自需要掉落的行数
		this.needToDropdown = [[],[],[],[],[],[]];

		//创建方块数组
		this.createDiamondsByCode();		

	}
	Map.prototype.createDiamondsByCode = function(){
		for(let i = 0 ; i < 7 ; i ++){			
			for(let j = 0 ; j < 7 ; j ++){
				this.diamonds[i][j] = new Diamonds(i,j,this.imageNameSrc[this.code[i][j]],"normal");
			}
		}
	}
	Map.prototype.matchDiamondsByCode = function(){
		let type = "normal";
		for(let i = 0 ; i < 7 ; i ++){			
			for(let j = 0 ; j < 7 ; j ++){
				if(this.diamonds[i][j].imageName == "bird"){
					this.diamonds[i][j] = new Diamonds(i,j,this.imageNameSrc[this.code[i][j]],"bird");
				}else if(this.diamonds[i][j].type == "row" || this.diamonds[i][j].type == "col"){
					this.diamonds[i][j] = new Diamonds(i,j,this.imageNameSrc[this.code[i][j]],this.diamonds[i][j].type);
				}else{
					this.diamonds[i][j] = new Diamonds(i,j,this.imageNameSrc[this.code[i][j]],"normal");
				}
			}
		}
	}
	Map.prototype.createSpecialDiamonds = function(arr,codeArr){
		if(arr.length != 0){
			let diamondsTemp = arr[0];
			let diamondsX = diamondsTemp.row;
			let diamondsY = diamondsTemp.col;
	
			let diamondsType = "normal";

			
			if(arr.length == 4){
				diamondsType = _.sample(["row","col"]);
			}else if(arr.length >= 5){
				diamondsType = "bird";
			}
			
			if(diamondsType == "row" || diamondsType == "col"){
				this.code[diamondsX][diamondsY] = codeArr[diamondsX][diamondsY];
				this.diamonds[diamondsX][diamondsY].type = diamondsType;
			}else if(diamondsType == "bird"){
				this.code[diamondsX][diamondsY] = 6;
				this.diamonds[diamondsX][diamondsY].type = diamondsType;
			}
		}
	}
	//消除
	Map.prototype.clear = function(){
		//验证是否combo，如果这一次的消除和上一次消除在250帧内，就是combo
		if(game.FNO - game.lastclear <= 250 && game.FNO - game.lastclear > 0){
			game.combo ++;		
		} else {
			game.combo = 1;
		}
		
		game.score += this.check().length * game.combo * 5;
		game.lastclear = game.FNO;


		_.each(this.check(),(item)=>{
			if(item.type == "row"){
				this.clearRow(item.row);
			}else if(item.type == "col"){
				this.clearCol(item.col);
			}else{
				this.diamonds[item.row][item.col].bomb();
				//更新地图矩阵
				this.code[item.row][item.col] = -1;
			}
		});
		
	}
	Map.prototype.clearRow = function(row){
		for (let i = 0; i < 7; i++) {
			this.diamonds[row][i].bomb();
			this.diamonds[row][i].type = "normal";	
			this.code[row][i] = -1;
		}
	}
	Map.prototype.clearCol = function(col){
		for (let i = 0; i < 7; i++) {
			this.diamonds[i][col].bomb();	
			this.diamonds[i][col].type = "normal";	
			this.code[i][col] = -1;
		}
	}
	Map.prototype.clearAll = function(imageName,row,col){
		for (let i = 0; i < 7; i++) {
			for (let j = 0; j < 7; j++){
				if(this.diamonds[i][j].imageName == imageName || (this.diamonds[i][j].imageName == "bird" && i == row && j == col)){
					this.diamonds[i][j].bomb();
					this.diamonds[i][j].type = "normal";	
					this.code[i][j] = -1;
				}
			}
			
		}
	}
	//下落方法
	Map.prototype.dropdown = function(){
		for(let row = 0 ; row <= 5 ; row ++){
			for(let col = 0 ; col <= 6 ; col ++){
				if(this.code[row][col] === -1){
					this.needToDropdown[row][col] = 0;
				} else {
					//统计这个方块下面有多少个空位
					let count = 0;
					for(let i = row + 1 ; i <= 6 ; i ++){
						if(this.code[i][col] === -1){
							count ++;
						}
					}
					this.needToDropdown[row][col] = count;
				}
			}
		}
		//让方块下落
		for(let row = 5 ; row >= 0 ; row --){
			for(let col = 0 ; col <= 6 ; col ++){
				this.diamonds[row][col].moveTo(row + this.needToDropdown[row][col] , col , 20);
				//更新数字矩阵
				this.code[row + this.needToDropdown[row][col]][col] = this.code[row][col];

				this.diamonds[row + this.needToDropdown[row][col]][col].type = this.diamonds[row][col].type;

				if(this.needToDropdown[row][col] != 0)
					this.code[row][col] = -1;
			}
		}
	}
	//统计需要每列需要补齐多少个
	Map.prototype.supply = function(){
		let supply = [0,0,0,0,0,0,0];
		for(let col = 0 ; col < 7 ; col ++){
			for(let row = 0 ; row < 7 ; row ++){
				if(this.code[row][col] === -1){
					supply[col] ++;
					//补足code矩阵
					this.code[row][col] = _.random(0,5);
					this.diamonds[row][col].type = "normal";
				}
			}
		}
		//根据矩阵生成方块
		this.matchDiamondsByCode();
		//生成方块后，将新生成的方块放到上空，然后下落到指定位置
		for(let i = 0 ; i < 7 ; i ++){
			for(let j = 0 ; j < supply[i] ; j ++){
				this.diamonds[j][i].DiamondY = 10;
				this.diamonds[j][i].moveTo(j,i,25);
			}
		}
	}
	//交换元素
	Map.prototype.exchange = function(startrow,startcol,endrow,endcol) {
		//命令运动
		this.diamonds[startrow][startcol].moveTo(endrow,endcol,10);
		this.diamonds[endrow][endcol].moveTo(startrow,startcol,10);

		game.fsm = "交换运动中请等待";

		game.registCallback(10 , ()=>{
			let t1 = this.code[startrow][startcol];
			this.code[startrow][startcol] = this.code[endrow][endcol];
			this.code[endrow][endcol] = t1;
			
			//检查是否能消除
			if(this.diamonds[startrow][startcol].type != "bird" && this.diamonds[startrow][startcol].type != "bird"){
				let t2 = this.diamonds[startrow][startcol].type;
				this.diamonds[startrow][startcol].type = this.diamonds[endrow][endcol].type;
				this.diamonds[endrow][endcol].type = t2;
				if(this.check().length == 0){
					//再次交换回来，因为不能消除，所以刚刚的交换数组矩阵要再次交换回来。
					let t1 = this.code[startrow][startcol];
					this.code[startrow][startcol] = this.code[endrow][endcol];
					this.code[endrow][endcol] = t1;

					let t2 = this.diamonds[startrow][startcol].type;
					this.diamonds[startrow][startcol].type = this.diamonds[endrow][endcol].type;
					this.diamonds[endrow][endcol].type = t2;
					//如果不能消除，那么10帧之后执行返回动画
					this.diamonds[startrow][startcol].moveTo(startrow,startcol,10);
					this.diamonds[endrow][endcol].moveTo(endrow,endcol,10);
					game.registCallback(10 , function(){
						game.fsm = "A";
					});		
				}else{
					//让两个矩阵进行匹配
					this.matchDiamondsByCode();  //重新根据code矩阵来生成一个diamonds的矩阵
					game.fsm = "B";
				}
			}else{
				if(this.diamonds[startrow][startcol].type == "bird"){
					this.clearAll(this.diamonds[endrow][endcol].imageName,startrow,startcol);
					game.fsm = "动画状态";
					this.render();
					game.registCallback(14,function(){
						game.fsm = "D";
					})
				}
				if(this.diamonds[endrow][endcol].type == "bird"){
					this.clearAll(this.diamonds[startrow][startcol].imageName,endrow,endcol);
					game.fsm = "动画状态";
					this.render();
					game.registCallback(14,function(){
						game.fsm = "D";
					})
				}
				
			}
		 });
		
	}
	//检测地图中，哪些是需要消除的方块
	Map.prototype.check = function(){
		let results = [];
		//横向
		for(let row = 0 ; row < 7 ; row ++){
			let i = 0;
			let j = 1;
			while(i < 7){
				if(this.code[row][i] != this.code[row][j]){
					if(j - i >= 3){
						for(let m = i ; m < j ; m++){
							results.push(this.diamonds[row][m]);
						}
					}
					i = j;
				}
				j ++;
			}
		}

		//纵向
		for(let col = 0 ; col < 7 ; col ++){
			let i = 0;
			let j = 1;
			while(i < 7){
				if(this.code[i][col] != this.code[j][col]){
					if(j - i >= 3){
						for(let m = i ; m < j ; m++){
							results.push(this.diamonds[m][col]);
						}
					}
					i = j;
				}
				j ++;
			}
		}
		results = _.uniq(results);
		return results;
	}
	
	Map.prototype.render = function(){
		for(let i = 0 ; i < 7 ; i ++){
			for(let j = 0 ; j < 7 ; j ++){
				this.diamonds[i][j].update();
				this.diamonds[i][j].render();				
			}
		}
	}
})()