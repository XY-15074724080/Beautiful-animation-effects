//此效果摘自：http://www.cnblogs.com/loce/p/5666089.html
var window_width = 1440;/*页面的宽度*/
var window_height = 900;/*页面的高度*/
var radius = 8;/*小球的半径*/
var margin_top = 60;/*元素的上外边距*/
var margin_left = 30;/*元素的左外边距*/

var curShowTimeSeconds = 0;/*获取当天的秒数*/

var balls = [];/*小球的集合*/
const colors =["#33b5e5","#0099cc","#aa66cc","#9933cc","#99cc00","#669900","#ffbb33","#ff8800","#ff4444","#cc0000"];/*颜色集合*/
window.onload = function(){
	/*初始化页面*/
	window_width = document.body.clientWidth;
	window_height = document.body.clientHeight;
	
	margin_left = Math.round(window_width/10);
	radius = Math.round(window_width*4/5/108)-1;
	margin_top = Math.round(window_height/5);
	
	/*获取canvas对象*/
	var canvas = document.getElementById('canvas');
	/*判断浏览器是否支持canvas*/
	if(canvas.getContext('2d')){
		var context = canvas.getContext('2d');/*使用context绘制*/
	}else{
		alert('当前浏览器不支持Canvas，请更换浏览器后再试');
	}
	
	//设置画布大小
	canvas.width = window_width;
	canvas.height = window_height;
	
	//初始化当前时间
	curShowTimeSeconds = getCurrentShowTimeSeconds();
	
	setInterval(function(){
		render(context);
		update();
	},50);
}

function getCurrentShowTimeSeconds(){
	/*获取当天的秒数*/
	var curTime = new Date();
	var ret = curTime.getHours()*3600 + curTime.getMinutes()*60 + curTime.getSeconds();
	
	return ret;
}

function update(){/*负责数据的改变*/
	var nextShowTimeSeconds = getCurrentShowTimeSeconds();
	
	var nextHours = parseInt(nextShowTimeSeconds/3600);
	var nextMinutes = parseInt((nextShowTimeSeconds-nextHours*3600)/60);
	var nextSeconds = nextShowTimeSeconds%60;
	
	var curHours = parseInt(curShowTimeSeconds/3600);
	var curMinutes = parseInt((curShowTimeSeconds-curHours*3600)/60);
	var curSeconds = curShowTimeSeconds%60;
	
	if(nextSeconds != curSeconds){
		//当数字改变时添加跳动的小球
		if(parseInt(curHours/10) != parseInt(nextHours/10)){//第一个数字产生变动时
			addBalls(margin_left + 0,margin_top,parseInt(curHours/10));
		}
		if(parseInt(curHours%10) != parseInt(nextHours%10)){//第二个数字产生变动时
			addBalls(margin_left + 15*(radius+1),margin_top,parseInt(curHours%10));
		}
		if(parseInt(curMinutes/10) != parseInt(nextMinutes/10)){//第三个数字产生变动时
			addBalls(margin_left + 39*(radius+1),margin_top,parseInt(curMinutes/10));
		}
		if(parseInt(curMinutes%10) != parseInt(nextMinutes%10)){//第四个数字产生变动时
			addBalls(margin_left + 54*(radius+1),margin_top,parseInt(curMinutes%10));
		}
		if(parseInt(curSeconds/10) != parseInt(nextSeconds/10)){//第五个数字产生变动时
			addBalls(margin_left + 78*(radius+1),margin_top,parseInt(curSeconds/10));
		}
		if(parseInt(curSeconds%10) != parseInt(nextSeconds%10)){//第六个数字产生变动时
			addBalls(margin_left + 93*(radius+1),margin_top,parseInt(curSeconds%10));
		}
		
		curShowTimeSeconds = nextShowTimeSeconds
	}
	updateBalls();
}

function updateBalls(){/*更新小球*/
	for(var i=0;i<balls.length;i++){
		balls[i].x += balls[i].vx;//如果vx<0，则小球慢慢往左移动
		balls[i].y += balls[i].vy;//改变小球中心点y的坐标
		balls[i].vy += balls[i].g;
		
		if(balls[i].y >= window_height-radius){//当小球下落到最底部
			balls[i].y = window_height-radius;
			balls[i].vy = -balls[i].vy*0.75;//使 弹起的距离 = 此次 下落的总距离*0.75
		}
	}
	//性能优化：使balls集合内的对象不过于庞杂
	var count = 0;
	for(var i=0;i<balls.length;i++){
		if(balls[i].x+radius>0 && balls[i].x-radius<window_width){//如果是在视区内的小球
			balls[count++] = balls[i];//将现有的在视区内的小球对象 覆盖 已经跳出视区的小球对象，重写balls集合
		}
	}
	while(balls.length>Math.min(300,count)){
		/*有两种情况：
		 * 1、count<300，
		 * 	即当视区内的小球数量小于300且此时balls集合的小球对象数量大于视区内的小球数量时，删除集合里多余的小球对象
		 * 2、count>300,
		 * 	即当视区内的小球数量大于300且此时balls集合的小球对象数量也大于300时，删除集合里多余的小球对象
		 * 
		 * 这样做就可以使视区内跳动的小球数量上限为300，也就导致了当 视区内跳动的小球的数量 达到上限时数字改变时生成的 跳动的小球 的数量很少，为了改善这种情况，我们可以将小球水平方向移动的速度加快，让它早一点跳出视区；或者加大balls集合的上限(比如将300改为600，当然这种方法还是扩大了balls集合，而且使页面的小球看起来太密，影响视觉效果，所以不可取)
		 */
		balls.pop();//删除最后一个小球对象
	}
}

function addBalls(margin_left,margin_top,num){/*增加数字变化时跳动的小球*/
	for(var i=0;i<digit[num].length;i++){
		for(var j=0;j<digit[num][i].length;j++){
			if(digit[num][i][j]==1){
				var aBall = {//一个小球对象
					x : margin_left+j*2*(radius+1)+(radius+1),//小球的中心x坐标
					y : margin_top+i*2*(radius+1)+(radius+1),//小球的中心y坐标
					g : 1.5 + Math.random(),//取值范围：0-1.5，使每个小球下落的速度都不一样，每50毫秒下落的距离也不一样
					//vx : Math.pow(-1,Math.ceil(Math.random()*1000))*4,//Math.ceil(Math.random()*1000))：取-1或者1，这是为了随机设置每个小球水平移动的方向
					vx : Math.pow(-1,Math.ceil(Math.random()*1000))*8,//这里加快使小球早一点跳出视区
					vy : -5,//小球向上抛的效果
					color : colors[Math.floor(Math.random()*colors.length)]//随机生成小球的颜色
				}
				
				balls.push(aBall);
			}
		}
	}
}

function render(cxt){/*负责绘制*/
	/*对矩形空间内进行刷新操作*/
	cxt.clearRect(0,0,window_width,window_height);//首先清除画布
	
	var hours = parseInt(curShowTimeSeconds/3600);
	var minutes = parseInt((curShowTimeSeconds-hours*3600)/60);
	var seconds = curShowTimeSeconds%60;
	
	renderDigit(margin_left,margin_top,parseInt(hours/10),cxt);//操作第一个数字
	renderDigit(margin_left + 15*(radius+1),margin_top,parseInt(hours%10),cxt);//操作第二个数字
    renderDigit(margin_left + 30*(radius+1),margin_top,10,cxt);//操作时与分中间的冒号分隔符
    renderDigit(margin_left + 39*(radius+1),margin_top,parseInt(minutes/10),cxt);//操作第三个数字
    renderDigit(margin_left + 54*(radius+1),margin_top,parseInt(minutes%10),cxt);//操作第四个数字
    renderDigit(margin_left + 69*(radius+1),margin_top,10,cxt);//操作分与秒中间的冒号分隔符
    renderDigit(margin_left + 78*(radius+1),margin_top,parseInt(seconds/10),cxt);//操作第五个数字
    renderDigit(margin_left + 93*(radius+1),margin_top,parseInt(seconds%10),cxt);//操作第六个数字
    
    //这里绘制'下落'的小球
    for(var i=0;i<balls.length;i++){
    	cxt.fillStyle = balls[i].color;
    	
    	cxt.beginPath();
    	cxt.arc(balls[i].x,balls[i].y,radius,0,2*Math.PI,true);
    	/*
    	 * context.arc(x,y,r,sAngle,eAngle,counterclockwise);
    	 * x 				圆的中心的 x 坐标。
		 * y 				圆的中心的 y 坐标。
		 * r 				圆的半径。
		 * sAngle 	起始角，以弧度计。（弧的圆形的三点钟位置是 0 度）。
		 * eAngle 	结束角，以弧度计。
		 * counterclockwise 	可选。规定应该逆时针还是顺时针绘图。False = 顺时针，true = 逆时针。
    	 */
    	cxt.closePath();
    	
    	cxt.fill();
    }
}

function renderDigit(x,y,num,cxt){/*负责绘制数字，通过一点一点增加变成数字*/
	cxt.fillStyle = "rgb(0,102,153)";//设置画笔填充颜色
	
	//使用点阵图方式画小球
	for(var i=0;i<digit[num].length;i++){
		for(var j=0;j<digit[num][i].length;j++){
			if(digit[num][i][j] == 1){
				cxt.beginPath();
				cxt.arc(x+j*2*(radius+1)+(radius+1),y+i*2*(radius+1)+(radius+1),radius,0,2*Math.PI);
				cxt.closePath();
				
				cxt.fill();
			}
		}
	}
}
