
var map;
$(function(){
    console.log("Loading AMap......");
    map = new AMap.Map('showMapDiv',{
        resizeEnable: true, //是否监控地图容器尺寸变化
        rotateEnable:true,
        pitchEnable:true,
        zoom: 13,
        zooms:[3,20],
        expandZoomRange:true,
        center:[114.521648,37.978053],//其实中心位置
    });

});
var  marker, speed, polygon, polyEditor;
// 定义好车辆运行路线的经纬度数据
var lineArr = [[114.513813, 37.976117]
    , [114.513754, 37.977609]
    , [114.513598, 37.983182]
    , [114.513453, 37.986928]
    , [114.513298, 37.9916]
    , [114.513277, 37.992699]
    , [114.51297, 38.000923]
    , [114.51297, 38.001037]
    , [114.513828, 38.00105]
    , [114.516151, 38.001079]
    , [114.517079, 38.001083]
    , [114.517792, 38.001092]
    , [114.519793, 38.001134]
    , [114.521269, 38.001181]
    , [114.523484, 38.001223]
    , [114.52608, 38.001244]
    , [114.529342, 38.001354]
    , [114.529495, 37.993139]
    , [114.529861, 37.983306]
    , [114.529989, 37.97656]
    , [114.52948, 37.976535]
    , [114.529281, 37.976497]
    , [114.528917, 37.976497]
    , [114.528868, 37.976576]
    , [114.528819, 37.976614]
    , [114.528546, 37.976661]
    , [114.528192, 37.976754]
    , [114.526513, 37.976737]
    , [114.526475, 37.97721]
    , [114.526416, 37.977477]
    , [114.52633, 37.977764]
    , [114.526008, 37.978606]
    , [114.52588, 37.978927]
    , [114.525311, 37.979989]
    , [114.519968, 37.97987]
    , [114.519771, 37.979858]
    , [114.519524, 37.979846]
    , [114.51939, 37.979816]
    , [114.519336, 37.979803]
    , [114.519207, 37.979744]
    , [114.519116, 37.979672]
    , [114.519041, 37.979613]
    , [114.518987, 37.97955]
    , [114.518902, 37.979461]
    , [114.518843, 37.979364]
    , [114.518843, 37.979262]
    , [114.518826, 37.979177]
    , [114.518944, 37.975845]
    , [114.51623, 37.97582]
    , [114.515163, 37.975803]
    , [114.515157, 37.97623]
    , [114.51417, 37.976188]
    , [114.513795, 37.976154]];

// 电子围栏各个顶点路径
var path = [[114.511956, 38.001929], [114.531553, 38.002452], [114.529964, 37.972813], [114.513936, 37.970674]];

// 车辆信息
var carMonitors = [{
    code: 'car1',
    // 经纬度
    longitude: '114.513766',
    latitude: '37.976922',
    // 速度
    speed: 80,
    // 车牌
    licenseNum: '冀 abc23',
}];

// 入口
$(function () {
    // 初始化速度
    speed = 200;
    // 设置输入框的速度默认显示200
    $('#speedInput').val(speed);

    // 起点
    var start = lineArr[0];

    // 车辆
    marker = new AMap.Marker({
        // 设置汽车显示的地图
        map: map,
        // 汽车的经纬度
        position: [start[0], start[1]],
        // 汽车的图标
        icon: "https://webapi.amap.com/images/car.png",
        // 偏移量
        offset: new AMap.Pixel(-26, -13),
        // 根据移动方向,自动旋转汽车的车头朝向
        autoRotation: true,
        // 设置默认汽车的车头朝向
        angle: -90,
    });

    // 绘制运行轨迹
    var polyline = new AMap.Polyline({
        // 显示轨迹的地图
        map: map,
        // 轨迹经纬
        path: lineArr,
        // 是否显示方向,类似于公路上的箭头指向
        showDir: true,
        // 轨迹颜色
        strokeColor: "#28F",
        // 轨迹宽度
        strokeWeight: 6
    });

    // 车辆移动后显示通过后的轨迹
    var passedPolyline = new AMap.Polyline({
        // 显示的地图
        map: map,
        // 移动后轨迹的颜色
        strokeColor: "#AF5",
        // 移动后轨迹的线宽
        strokeWeight: 6,
    });

    // 汽车移动的事件
    // 移动之后,设置汽车已经行驶的路线轨迹
    marker.on('moving', function (e) {
        // passedPath 获取汽车移动过的轨迹
        passedPolyline.setPath(e.passedPath);
    });

    // 在地图中显示轨迹
    map.setFitView();

    // 电子围栏
    polygon = new AMap.Polygon({
        // 围栏的经纬度
        path: path,
        // 围栏边框颜色
        strokeColor: "#FF33FF",
        // 围栏边框厚度
        strokeWeight: 6,
        // 围栏边框透明度
        strokeOpacity: 0.2,
        // 填充背景的透明度
        fillOpacity: 0.4,
        // 填充背景的颜色
        fillColor: '#1791fc'
    });

    // 设置显示电子围栏
    polygon.setMap(map);
    /*  编辑电子围栏 */
    polyEditor = new AMap.PolyEditor(map, polygon);

    // 编辑结束之后触发,获取路径
    polyEditor.on('end', function (event) {
        // 清除之前的电子围栏的经纬度
        path = [];
        // 获取更改之后的电子围栏,是数组,数组中是json格式
        var items = event.target.getPath();
        // 遍历电子围栏,把里面的经纬度取出来
        for(var i = 0 ; i< items.length;i++){
            // 把数据封装成数组
            var str = [items[i].lng,items[i].lat];
            // 把数组添加到path数组中
            path.push(str);
        }
    });

});

/**
 * 开始编辑按钮的事件
 * @return {[type]} [description]
 */
function edit() {
    // 缩放地图到合适的视野级别
    map.setFitView([polygon]);
    // 开始编辑
    polyEditor.open();
}
/**
 * 结束编辑按钮的事件
 * @return {[type]} [description]
 */
function closeEdit() {
    // 结束编辑
    polyEditor.close();
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