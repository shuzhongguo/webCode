var map5,map6;
var bflag = true;
var n =0;
var urls  = [
    {url:"http://localhost:6080/arcgis/rest/services/bd/cj20170515q/MapServer",name:"cj20170515q"},
    {url:"http://localhost:6080/arcgis/rest/services/bd/cj20170711q/MapServer",name:"cj20170711q"},
    {url:"http://localhost:6080/arcgis/rest/services/bd/cj20171103q/MapServer",name:"cj20171103q"}
    ];
var layerUrl ="http://localhost:6080/arcgis/rest/services/bd/cj20170515q/MapServer/0";
function createOption(urls){
    var  options = "";
    for(var i = 0; i < urls.length; i++){
        options += "<option value='"+urls[i].url+"'>"+urls[i].name+"</option>"
    }
    document.getElementById("left").innerHTML=options;
    document.getElementById("right").innerHTML=options;
}
var layer1;
require([
        "esri/map",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/GraphicsLayer",
        "esri/graphic",
        "esri/symbols/PictureMarkerSymbol",
        "esri/geometry/Extent",
        "esri/tasks/query",
        "esri/InfoTemplate",
        "esri/layers/FeatureLayer",
        "esri/geometry/Point",
        "esri/SpatialReference",
        "dojo/dom",
        "dojo/on",
        "dojo/domReady!"],
    function(Map, ArcGISDynamicMapServiceLayer, GraphicsLayer, Graphic, PictureMarkerSymbol,Extent, Query, InfoTemplate,
             FeatureLayer,Point,SpatialReference,dom,on) {
        var extent = new Extent({
            xmax: 110.18645613519735,
            xmin: 108.91968513519728,
            ymax: 35.0235980924342,
            ymin: 34.773577500328926,
            spatialReference:{"wkid":4326}
        });
        var extent1 = new Extent({
            spatialReference:{wkid: 4326},
            xmax:110.31438333815792,
            xmin:109.04761233815786,
            ymax:34.992345518421075,
            ymin:34.258951781578936
        });
        var point = new Point(109.3693055, 34.435633, new SpatialReference({ wkid: 4326 }))
        map5 = new Map("map5",
            {
                logo:false,
                center:[109.3693055, 34.435633],
                extent:extent
            });
        map6= new Map("map6",
            {
                logo:false,
                center:[109.3693055, 34.435633],
                extent:extent
            });
        createOption(urls);
        var infoTemplate = new InfoTemplate("${塔位号}塔位号详情",
            "<b>经度:${经度}</b><br>" +
            "<b>纬度:${纬度}</b><br>" +
            "<b>占地面积m2:${占地面积m2}</b><br>" +
            "<b>永久占地:${永久占地}</b><br>" +
            "<b>临时占地:${临时占地}</b><br>" +
            "<b>建设区面积:${建设区面积}</b><br>" +
            "<b>直接影响:\"+${直接影响}+\"</b><br>" +
            "<b>标段:${标段}</b><br>");
        var feature1 = new FeatureLayer(layerUrl,{
            mode: FeatureLayer.MODE_SNAPSHOT,
            outFields:["塔位号","经度","纬度","占地面积m2","永久占地","临时占地","建设区面积","直接影响","标段"],
            infoTemplate: infoTemplate
        });
        var feature2 = new FeatureLayer(layerUrl,{
            mode: FeatureLayer.MODE_SNAPSHOT,
            outFields:["塔位号","经度","纬度","占地面积m2","永久占地","临时占地","建设区面积","直接影响","标段"],
            infoTemplate: infoTemplate
        });

        /**
         * 添加图层，并且更改显示的名称
         * @param map
         * @param urls
         * @param id
         */
        function myAddLayers(map,urls,id) {
            var layer;
            for(var i = 0; i < urls.length; i++){
               if(i == 0 ){
                   layer = new ArcGISDynamicMapServiceLayer(urls[i].url,{
                       id:urls[i].name,
                       visible:true
                   });
                   document.getElementById(id).innerHTML = urls[i].name;
               }else{
                   layer = new ArcGISDynamicMapServiceLayer(urls[i].url,{
                       id:urls[i].name,
                       visible:false
                   });
               }
               map.addLayer(layer);
            }
        }

        /**
         * 获取所有的杆塔点
         */
        function getALLtowerId() {
            var query = new Query();
            query.where = "1=1";
            query.returnGeometry = false;
            var feature = new FeatureLayer(layerUrl,{
                outFields:["塔位号"]
            });
            feature.queryFeatures(query,function (result) {
                var features = result.features;
                var lenght = features.length;
                var options ="";
                // console.log(features);
                for(var i = 0; i < lenght; i++){
                    var attributes = features[i].attributes;
                    for(var attr in attributes){
                        options += "<option value ='"+attributes[attr]+"'>"+attributes[attr]+"</option>"
                    }
                }
                // console.log(options);
                document.getElementById("towerId").innerHTML=options;
            },function (error) {
                console.log(error);
            });
        }

        /**
         * 根据选择定位
         */
        function locationTower() {
           var value =  document.getElementById("towerId").value;
            var query = new Query();
            query.where = "塔位号='"+value+"'";
            query.returnGeometry = true;
            var feature = new FeatureLayer(layerUrl,{
                mode: FeatureLayer.MODE_SNAPSHOT,
                outFields:["*"],
                infoTemplate: infoTemplate
            });
            feature.queryFeatures(query,function (result) {
                var features = result.features;
                if( n == 0){
                    map5.centerAndZoom(features[0].geometry,0.02);
                    map6.centerAndZoom(features[0].geometry,0.02);
                    n++;
                }else{
                    map5.centerAndZoom(features[0].geometry,1);
                    map6.centerAndZoom(features[0].geometry,1);
                }
            },function (error) {
               console.log(error);
            })
        }

        /**
         * 更改imageLayer的可见性
         * @param map
         * @param idname
         * @param urls
         * @param show
         */
        function updateLayerState(map,idname,urls,show){
            var  obj = document.getElementById(idname);
            var index = obj.selectedIndex; // 选中索引
            var value = obj.options[index].text; // 选中文本
            for(var i = 0 ; i < urls.length; i++) {
                var visible = map.getLayer(urls[i].name).visible;
                if (visible) {
                    map.getLayer(urls[i].name).setVisibility(false);
                }
            }
            map.getLayer(value).setVisibility(true);
        }

        //myAddLayers来添加图层
        myAddLayers(map5,urls,"leftname");
        myAddLayers(map6,urls,"rightname");

        var mouseLayer = new GraphicsLayer();
        var mouseLayer3 = new GraphicsLayer();

        map6.addLayer(mouseLayer);
        map5.addLayer(mouseLayer3);

        map5.addLayer(feature1);
        map6.addLayer(feature2);

        //执行获取所有杆塔点，使用户可以选择杆塔点
        getALLtowerId();

        map5.setLevel(1);
        map6.setLevel(1);

        //禁用单击重新重置中心点
        map5.disableClickRecenter();
        map6.disableClickRecenter();

        map5.on("extent-change",function(){
            if(bflag==true)
            {map6.setExtent(map5.extent);}

        });

        map5.on("mouse-move",function(evt){

            bflag=true;
            mouseLayer.clear();
            mouseLayer3.clear();
            var pms = new PictureMarkerSymbol("cursor.png",22,24);
            var graphic = new Graphic(evt.mapPoint,pms);
            mouseLayer.add(graphic);
        });
        map6.on("mouse-move",function(evt){
            bflag=false;
            mouseLayer.clear();
            mouseLayer3.clear();
            var pms = new PictureMarkerSymbol("cursor.png",22,24);
            var graphic = new Graphic(evt.mapPoint,pms);
            mouseLayer3.add(graphic);
        });

        map6.on("extent-change",function(evt){
            if (bflag==false)
            {
                bflag=true;
                map5.setExtent(map6.extent);
            }
            function error(error){
                alert("error:"+ error)
            }
        });

        //监听id为left事件，如果值已经被更改就图层的可见状态
        on(dom.byId("left"),"change",function () {
            updateLayerState(map5,"left",urls,"leftname");
        });

        //监听id为right事件，如果值已经被更改就图层的可见状态
        on(dom.byId("right"),"change",function () {
            updateLayerState(map6,"right",urls,"rightname");
        });

        //监听id为towerId事件，根据towerId的变更值在图上查到指定位置
        //同时定位map5,map6
        on(dom.byId("towerId"),"change",function () {
           locationTower();
        });

        //button的点击事件，如果点击了就恢复到最初的大小
        on(dom.byId("resize"), "click",function () {
            map5.setExtent(extent1);
            map5.centerAt(point);
            map6.setExtent(extent1);
            map6.centerAt(point);
            n = 0;
        });
    });
