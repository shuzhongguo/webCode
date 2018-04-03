var map,imageLayer;
var urls=[
    {name:"basic_map", url:"http://localhost:6080/arcgis/rest/services/gp/ditu0329/MapServer"},
    {name:"rainfall", url:"http://localhost:6080/arcgis/rest/services/gp/cj20170515yl/MapServer/0"},
    {name:"insertvalueGPService", url:"http://localhost:6080/arcgis/rest/services/gp/insert_value/GPServer/insert_value"},
    {name:"insertvalueMPService", url:"http://localhost:6080/arcgis/rest/services/gp/insert_value/MapServer/jobs"}
    ];
require([
        "esri/map",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/FeatureLayer",
        "esri/InfoTemplate",
        "esri/tasks/query",
        "esri/tasks/Geoprocessor",
        "dojo/dom",
        "dojo/on",
        "dojo/domReady!"],
    function(Map, ArcGISDynamicMapServiceLayer,  FeatureLayer, InfoTemplate, Query, Geoprocessor, dom, on){
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
        map.addLayer(imageLayer);

        //执行查询，并把查询的数据交给地图处理服务处理

        featureLayer.queryFeatures(query,
            function (result) {
            var features = result.features
            console.log(result);
            gp.submitJob({
                field:"yl",
                rain:result
            },function (message) {
                console.log("信息");
                console.log(message);
                var rlt = new ArcGISDynamicMapServiceLayer(urls[3].url+"/"+message.jobId,{
                    id:message.jobId
                })
                map.addLayer(rlt);
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

    });