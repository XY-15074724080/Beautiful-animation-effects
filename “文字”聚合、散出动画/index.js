function rnd(n, m)//用来获取随机数，获取的随机数的范围为 n~m
{
	return parseInt(Math.random()*(m-n)+n);
}


/*************这一部分是对元素的类名的操作，实现动画的时候并没有用到，可以不看******/
/*function addClass(ele, className) {//添加类名的事件
	var oriClass = ele.className;//获取要添加的元素本身的类名
	if(oriClass) {//当元素本身有类名的时候
		ele.className = oriClass+' '+className;//设置元素类名为"原来的类名 新加的类名"
	} else {//当元素本身没有类名
		ele.className = className;//就设置元素的类名为要添加的类名
	}
}
function removeClass (el, className) {//移除类名的事件
	var cls = el.className;//获取要移除类名的元素的全部类名，可能有这几种情况：1、元素没有类名；2、元素有一个类名 -> 例如'classA'这种形式；3、元素有多个类名 -> 例如'classA classB classC'这种形式
	if(cls.indexOf(className)>=0) {
		el.className = el.className.replace(new RegExp('(?:^|\\s)'+className+'(?=\\s|$)', 'ig'), '');//全局匹配且忽略大小写
	}
}
function replaceClass (el, cls1, cls2) {//替换类名的事件，参数说明：el(要替换类名的元素)，cls1(要替换掉的类名)，cls2(新的类名)
	removeClass(el, cls1);//先移除要替换掉的类名
	addClass(el, cls2);//再添加新的类名
}*/
/************************************************************************/


//重要的实现部分在这里
window.onload = function () {	
	var screen2 = document.getElementById('screen_2');
	var oDiv = screen2.getElementsByClassName('ctn')[0];//取得装图片的容器

	var isAudioTempPause = false;
	
	//将这个容器的宽高划分成数块
	var C=4;//划分的列数
	var R=8;//划分的行数
	
	var divCX=oDiv.offsetWidth/2;  //容器的中心点X坐标(容器的一半宽度)
  	var divCY=oDiv.offsetHeight/2; //容器的中心点Y坐标(容器的一半高度)
	var isAnimating = false;//动画的状态
	var showNodes = 0;//用来记录显示节点的数量
	var hideNodes = 0;//用来记录隐藏节点的数量

	var cur_status = -1;
	var os = {};
	
	//这里做飞走的效果
	function animateSpread (cb) {//此时说明cb=function(){animateAggregate(function(){isAnimating = false;})}
		hideNodes = 0;
		//在容器内生成C * R 个 div
		for(var i=0;i<R;i++)
		{
			for(var j=0;j<C;j++)
			{
				var oNewDiv = document.getElementById('new_'+i+'_'+j);//获取每个小块
				
				if(!oNewDiv) {//如果小块不存在
					cb('no element');//执行function(){animateAggregate(function(){isAnimating = false;})}('no element')
					return;
				}
				
				//飞走——跟中心的距离——方向
				var l=oNewDiv.offsetLeft+oNewDiv.offsetWidth/2;//小块中心与父容器的x距离
				var t=oNewDiv.offsetTop+oNewDiv.offsetHeight/2;//小块中心与父容器的y距离
				
				//这里设置飞走的方向，要使 中心点在父容器中心点左边(disX<0) 的小块往左边飞出去，使 中心点在父容器中心点右边(disX>0) 的小块往右边飞出去
				var disX=l-divCX;
				var disY=t-divCY;
				(function (oNewDiv, disX, disY){
					setTimeout(function (){
						
						//这里这是飞走时的形态变换
						oNewDiv.style.WebkitTransform='perspective(800px) translate3d('+disX+'px, '+disY+'px, 600px) rotateY('+rnd(-180, 180)+'deg) rotateX('+rnd(-180, 180)+'deg) scale(2,2)';
						//rnd(-180, 180)：选取从-180到180 中的随机数
						oNewDiv.style.opacity=0;
						
						setTimeout(function (){
							oDiv.removeChild(oNewDiv);//变换完成后删除节点
							hideNodes ++;//没删除一个节点就自加一次
							if(hideNodes == i * j && cb) cb();//当所有oNewDiv的节点都删除之后，执行animateAggregate(function(){isAnimating = false;})
						}, 600);
					}, rnd(1, 301));//rnd(1, 301)：选取从1到301 中的随机数
				})(oNewDiv, disX, disY);
			}
		}
	}
	
	//这里做飞来的效果
	function animateAggregate (cb) {//这里的cb=function(){isAnimating = false;}
		showNodes = 0;
		
		for(var i=0;i<R;i++)
		{
			for(var j=0;j<C;j++)
			{
				//创建
				var w=Math.floor(oDiv.offsetWidth/C);//获取图片的宽度除以列数之后的 宽度
				var h=Math.floor(oDiv.offsetHeight/R);//获取图片的高度除以行数之后的 高度
				var oNewDiv=document.createElement('div');
				
				//接下来给 oNewDiv 设置初始状态
				oNewDiv.id='new_'+i+'_'+j;
				oNewDiv.style.opacity=0;
				oNewDiv.style.left=j*w+'px';//小块距图片容器左边的距离 为每列的数量乘以小块的宽度
				oNewDiv.style.top=i*h+'px';//小块距图片容器上边的距离 为每列的数量乘以小块的高度
				
				oNewDiv.style.width=w+'px';//设置容器中每个小块的宽度
				oNewDiv.style.height=h+'px';//设置容器中每个小块的高度
				
						
				var offsetLeft = j*w;//小块距父容器左边的距离
				var offsetTop = i*h;//小块距距父容器上边的距离

				var l=offsetLeft+w/2;//小块中心点距父容器左边的距离
				var t=offsetTop+h/2;//小块中心点距距父容器上边的距离
				//这里设置飞来的方向，要使 中心点在父容器中心点左边(disX<0) 的小块从左边飞过来，使 中心点在父容器中心点右边(disX>0) 的小块从右边飞过来
				var disX=l-divCX;//初始的translateX值 
				var disY=t-divCY;//初始的translateY值
				oNewDiv.style.WebkitTransform='perspective(800px) translate3d('+disX+'px, '+disY+'px, 600px) rotateY('+rnd(-180, 180)+'deg) rotateX('+rnd(-180, 180)+'deg) scale(2,2)';//初始的transform值
						oNewDiv.style.opacity=0;//初始透明度为0
				oNewDiv.style.backgroundPosition = '-'+offsetLeft+'px -'+offsetTop+'px';//每个小块对于图片的背景定位
				oDiv.appendChild(oNewDiv);
				
				//飞来——跟中心的距离——方向
				(function (oNewDiv, disX, disY){
					setTimeout(function (){
						oNewDiv.style.WebkitTransform='translate3d(0,0,0)';
						oNewDiv.style.opacity=1;
						showNodes ++;//每显示一个节点就自加一次
						if(showNodes == i * j && cb) cb();//当所有的小块都显示时执行函数function(){isAnimating = false;} => 设置isAnimating = false
					}, rnd(300, 500));//rnd(300, 500)：选取从300到500 中的随机数，这是为了使每个小块的执行开始变换的时间都不一样
				})(oNewDiv, disX, disY);
			}
		}
	}
	

	
	function hideAndShow (status, isBack) {//这个函数主要用来调用animateSpread函数，使小块先飞出去，等完全飞出去了就调用animateAggregate函数，使小块一个个飞过来，到小块全部飞过来之后设置动画状态为完成(isAnimating = false)
		animateSpread(function(){			
			animateAggregate(function(){
				isAnimating = false;
			});
		});
	}
	
    function bindEvents () {
    	var ua = navigator.userAgent;
    	var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
	    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
	    var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
	    var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
	    if(android || ipad || ipod || iphone) {//如果是手机端或者ipad，绑定touchstart触屏事件
	    	$('#btn').on('touchstart', hideAndShow);//只在这里用jquery只是为了不想做兼容
	    } else {//如果是电脑端，绑定click点击事件
	    	$('#btn').on('click', hideAndShow);//只在这里用jquery只是为了不想做兼容
	    }	
		
    }
   
    function init () {//用来初始化调用函数，当调用这个函数时，浏览器首先调用animateAggregate函数执行小块飞来的效果，然后绑定事件
    	animateAggregate();
    	bindEvents();
    }
    init();//页面一加载就调用
}