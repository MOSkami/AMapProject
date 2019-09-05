// 定义一组全局变量
// 地图 , 鼠标(因为轨迹是点击鼠标进行设置) , 覆盖物,速度,行驶过的折线(路),折线(路)
var map, mouseTool, marker, speed, passedPolyline, polyline;

// 保存绘制的线的数据
var overlays = [];

// 保存路线数据
var lineArr = [];

// 入口
$(function () {
    // 初始化速度
    speed = 200;
    // 设置输入框的速度默认显示为200
    $('#speedInput').val(speed);
    // 自定义方法,用于设置隐藏和显示按钮,比如开始动画,和完成等按钮
    // 为false 显示完成和清除,隐藏开始动画等
    // 为true 显示开始动画,隐藏完成和清除等
    // 程序刚开始,应该要先轨迹,再进行回放,所以这里设置为false
    changeShow(false);

    // 初始化地图
    map = new AMap.Map('showMapDiv',{
        resizeEnable: true, //是否监控地图容器尺寸变化
        rotateEnable:true,
        pitchEnable:true,
        zoom: 13,
        zooms:[3,20],
        expandZoomRange:true,
        center:[114.521648,37.978053],//其实中心位置
    });

    // 地图对象加载鼠标插件
    // 点击开始编辑之后,在地图中点击左键可以记录线,右键就结束编辑
    map.plugin(['AMap.MouseTool'], function () {
        // 在点图上移动
        mouseTool = new AMap.MouseTool(map);
        // 点击右键,完成编辑,就触发函数,设置到overlays数组中,保存编辑的路线
        mouseTool.on('draw', function (e) {
            overlays.push(e.obj);
        });
    });
});


/**
 * 设置哪些按钮显示和隐藏
 * @param  {[type]} showTrack [description]
 * @return {[type]}           [description]
 */
function changeShow(showTrack) {
    // 如果为true,就设置开始动画这些按钮显示,清空和完成按钮隐藏
    if (showTrack) {
        $('#actionContainer').show();
        $('#clear').hide();
        $('#finish').hide();
    } else {
        // 如果为false 就设置开始动画哪些按钮隐藏,清空和完成按钮显示
        $('#actionContainer').hide();
        $('#clear').show();
        $('#finish').show();
    }
}

/**
 * 鼠标绘制完成的方法,点击完成按钮触发的事件
 * @return {[type]} [description]
 */
function finish() {
    // 关闭编辑轨迹
    mouseTool.close(true);
    // 如果overays的长度大于0 说明进行了轨迹编辑
    if (overlays.length > 0) {
        // 清空路线的数组
        lineArr = [];
        // 获取绘制的行驶路线
        console.log(JSON.stringify(overlays))
        var items = overlays[0].B.path;
        console.log(overlays[0])
        for(var i = 0;i<items.length;i++){
            var item = items[i];
            // 把经纬度添加到路线数组中
            var arr = [item.lng, item.lat];
            lineArr.push(arr);
        }
    }
    // 自定义方法,获取绘制之后的地图
    // 需要在循环外面,因为就算没有绘制,点击完成,也应该显示上一次的地图
    getMap();
    // 更改按钮显示,把开始动画哪些显示出来
    changeShow(true);
}
// 获取地图(绘制后的地图)
function getMap() {
    // 绘制的路线起始路径
    var start = lineArr[0];

    // 车辆对象的覆盖物
    marker = new AMap.Marker({
        // 在指定地图上显示
        map: map,
        // 设置车辆所在位置为绘制的起始位置
        position: start,
        // 指定图片
        icon: "https://webapi.amap.com/images/car.png",
        // 设置偏移量
        offset: new AMap.Pixel(-26, -13),
        // 根据移动方向,自动旋转汽车的车头朝向
        autoRotation: true,
        // 设置默认汽车的车头朝向
        angle: -90,
    });

    // 绘制轨迹
    polyline = new AMap.Polyline({
        // 显示轨迹的地图
        map: map,
        // 轨迹经纬
        path: lineArr,
        // 是否显示方向,类似于公路上的箭头指向
        showDir: true,
        // 轨迹颜色
        strokeColor: '#28F',
        // 轨迹宽度
        strokeWeight: 6,
    });

    // 车辆运行后的路线
    passedPolyline = new AMap.Polyline({
        // 显示的地图
        map: map,
        // 移动后轨迹的颜色
        strokeColor: '#AF5',
        // 移动后轨迹的线宽
        strokeWeight: 6,
    });

    // 设置车辆的移动事件
    marker.on('moving', function (e) {
        // passedPath 获取汽车移动过的轨迹
        passedPolyline.setPath(e.passedPath);
    });
    // 在地图中显示轨迹
    map.setFitView();
}


/**
 * 开始动画按钮的事件
 * @return {[type]} [description]
 */
function startAnimation() {
    // 开始移动,传入轨迹和速度
    marker.moveAlong(lineArr, speed);
}
/**
 * 暂停动画按钮的事件
 * @return {[type]} [description]
 */
function pauseAnimation() {
    marker.pauseMove();
}
/**
 * 继续动画按钮的事件
 * @return {[type]} [description]
 */
function resumeAnimation() {
    marker.resumeMove();
}
/**
 * 停止动画按钮的事件
 * @return {[type]} [description]
 */
function stopAnimation() {
    marker.stopMove();
}
/**
 * 速度输入框发生更改的时候触发
 * @return {[type]} [description]
 */
function changeSpeed() {
    speed = $('#speedInput').val();
}


/**
 * 开始编辑轨道
 * @return {[type]} [description]
 */
function beginEdit() {
    map.setZoom(13); //设置地图层级
    // 设置开始动画等按钮不显示,显示完成和清除
    changeShow(false);
    // 判断覆盖物是否存在,如果存在就删除
    if (marker) {
        // 删除覆盖物
        map.remove(marker);
        // 车辆行驶后的线(路)
        map.remove(passedPolyline);
        // 删除折线(路)
        map.remove(polyline);
    }
    alert('开始绘制轨迹，点击右键取消绘制');
    // 删除绘制的轨迹
    map.remove(overlays);
    // 编辑轨迹的数组清空
    overlays = [];
    // 设置轨迹折线的颜色为红色,这样编辑轨迹的时候,以红色显示
    mouseTool.polyline({
        strokeColor: '#ff220f',
    });
}

/**
 * 清除编辑轨迹
 * @return {[type]} [description]
 */
function clearEdit() {
    // 清除编辑的轨迹
    map.remove(overlays);
    // 清空编辑轨迹的数组
    overlays = [];
}
