var map,imageLayer,ontourMap,legend

//legendLayer是作为一个显示图例的服务数组。
var legendLayers = new Array();
var urls=[
    {name:"basic_map", url:"http://localhost:6080/arcgis/rest/services/gp/ditu0329/MapServer"},
    {name:"rainfall", url:"http://localhost:6080/arcgis/rest/services/gp/cj20170515yl/MapServer/0"},
    {name:"insertvalueGPService", url:"http://localhost:6080/arcgis/rest/services/gp/insert_value/GPServer/insert_value"},
    {name:"insertvalueMPService", url:"http://localhost:6080/arcgis/rest/services/gp/insert_value/MapServer/jobs"}
    ];
require([
        "esri/map",
        "esri/dijit/Legend",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/FeatureLayer",
        "esri/InfoTemplate",
        "esri/tasks/query",
        "esri/tasks/Geoprocessor",
        "esri/config",
        "dojo/dom",
        "dojo/on",
        "dojo/domReady!"],
    function(Map, Legend, ArcGISDynamicMapServiceLayer,  FeatureLayer, InfoTemplate, Query, Geoprocessor, esriConfig, config, dom, on){
        esriConfig.defaults.io.alwaysUseProxy = false;
        esriConfig.defaults.io.proxyUrl="http://localhost/proxy.ashx";
        map =  new Map("mapid",{
            logo:false
        });
        //创建一个动态服务层
        imageLayer = new ArcGISDynamicMapServiceLayer(urls[0].url,{
            id:urls[0].name
        });
        //展示信息模板的创建
        var infoTemplate = new InfoTemplate("${F1}站降雨量",
            "<b>经度：${x}</b><br>" +
            "<b>纬度：${y}</b><br>" +
            "<b>降雨量：${yl}</b>");

        //创建一个查询并设置查询参数
        var  query = new Query();
        query.where="1=1";
        query.returnGeometry = true;

        //创建一个要素层
        var featureLayer = new FeatureLayer(urls[1].url,{
            outFields:["*"],
            mode:FeatureLayer.MODE_SNAPSHOT,
            id:urls[1].name,
            infoTemplate:infoTemplate,
        });
        //创建一个地图处理服务
        var gp = new Geoprocessor(urls[2].url);

        //添加图层
        map.addLayer(featureLayer);
        // legendLayers.push({title:"底图",hideLayers:[0,1]})
        map.addLayer(imageLayer);

        //执行查询
        featureLayer.queryFeatures(query,
            function (result) {
            //查询的结果作为gp服务的参数
            gp.submitJob({
                field:"yl",
                rain:result
            },function (message) {
                console.log("信息");
                console.log(message);
                console.log("url = "+urls[3].url+"/"+message.jobId);
                //如果执行成功，我们就new一个动态的地图服务的实例，并且添加到map中。
                contourMap = new ArcGISDynamicMapServiceLayer(urls[3].url+"/"+message.jobId,{
                    id:"legendLayer_id",
                    opacity:0.5
                });
                console.log("contourMap");
                console.log(contourMap);
                //添加legendLayer数组中去。
                legendLayers.push({title:"图例", layer:contourMap});
                map.addLayer(contourMap);
            },function (state) {
                console.log("状态");
                console.log(state);
            },function (error) {
                console.log("错误");
                console.log(error);
            });
        }),
            function (error) {
            console.log(error)
        }
        //在图层加载完成之后，触发加载图例
        map.on("layer-add-result",function (layer) {
            //如果返回值的图层中ID以为legendLayer_id
            if(layer.layer.id == "legendLayer_id"){
                //new一个Legend的实例
                legend = new Legend({
                    map: map,
                    layerInfos:legendLayers,
                }, "legendDiv");
                //启动legend实例
                legend.startup();
            }
        });
    });