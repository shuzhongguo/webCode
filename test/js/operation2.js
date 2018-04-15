var map,imageLayer,ontourMap,legend

//legendLayer是作为一个显示图例的服务数组。
var legendLayers = new Array();
var legend;
var urls=[
    {name:"basic_map", url:"http://localhost:6080/arcgis/rest/services/gp/ditu0329/MapServer"},
    {name:"rainfall", url:"http://localhost:6080/arcgis/rest/services/gp/cj20170515yl/MapServer/0"},
    {name:"isosurfaceGPService", url:"http://localhost:6080/arcgis/rest/services/gp/isosurface_service/GPServer/isosurface_model"},
    {name:"isosurfaceMPService", url:"http://localhost:6080/arcgis/rest/services/gp/isosurface_service/MapServer/jobs"}
    ];
require([
        "esri/map",
        "esri/dijit/Legend",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/FeatureLayer",
        "esri/urlUtils",
        "esri/InfoTemplate",
        "esri/tasks/query",
        "esri/tasks/Geoprocessor",
        "esri/config",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/renderers/UniqueValueRenderer",
        "esri/Color",
        "esri/layers/GraphicsLayer",
        "esri/renderers/ClassBreaksRenderer",
        "esri/tasks/JobInfo",
        "dojo/dom",
        "dojo/on",
        "dojo/domReady!"],
    function(Map, Legend, ArcGISDynamicMapServiceLayer,  FeatureLayer, urlUtils, InfoTemplate, Query,
             Geoprocessor, esriConfig, SimpleFillSymbol, SimpleLineSymbol, UniqueValueRenderer, Color, GraphicsLayer, ClassBreaksRenderer, JobInfo, dom, on){
        esriConfig.defaults.io.alwaysUseProxy = false;
        esriConfig.defaults.io.proxyUrl="http://localhost/proxy.ashx";
        urlUtils.addProxyRule({
            proxyUrl: "/proxy",
            urlPrefix: "earthquake.usgs.gov"
        });
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

        //执行查询
        featureLayer.queryFeatures(query,
            function (result) {
            //查询的结果作为gp服务的参数
            gp.submitJob({
                field:"yl",
                rain:result
            },function (message) {
                console.log("信息");
                var mianGraphicLayer = new GraphicsLayer({id:"dengzhimian"});
                //定义线符号
                var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new Color([255, 0, 0]), 3);
                //定义面符号
                var fill=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color("#FFFFCC"));
                //定义唯一值渲染器，对字段alias进行渲染，fill是默认的渲染符号
                var renderer = new UniqueValueRenderer(fill, "GRIDCODE");
                //设置渲染的方式
                renderer.addValue(0, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([0, 255, 255, 0.5])));
                renderer.addValue(1, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([180, 255, 180, 0.5])));
                renderer.addValue(6, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([100, 255, 100, 0.5])));
                renderer.addValue(11, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([0, 255, 255, 0.5])));
                renderer.addValue(26, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([0, 150, 255, 0.5])));
                renderer.addValue(51, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([0, 100, 255, 0.5])));
                renderer.addValue(101, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([0, 0, 255, 0.5])));
                renderer.addValue(251, new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, lineSymbol,new Color([255, 0, 255, 0.5])));
                mianGraphicLayer.setRenderer(renderer);
                var jobId = message.jobId;
                var status = message.jobStatus;
                if(status == JobInfo.STATUS_SUCCEEDED) {
                    //成功之后，将其中的结果取出来，当然这也是参数名字。
                    //在模型中，想要取出中间结果，需要设置为模型参数
                    gp.getResultData(jobId, "output", function(jobInfo){
                        var features = jobInfo.value.features;
                        dojo.forEach(features,function(graphic){
                            mianGraphicLayer.add(graphic);
                        });
                        map.addLayer(mianGraphicLayer);
                    },function (error) {
                        console.log("错误");
                        console.log(error);
                    });
                }
            },function (state) {
                // console.log("状态");
                // console.log(state);
            },function (error) {
                console.log("错误");
                console.log(error);
            });
        }),
            function (error) {
            console.log(error)
        }
        console.log("数组内容");
        console.log(legendLayers);
        map.on("layer-add-result",function (layer) {
            console.log(layer.layer.id);
            if(layer.layer.id == "dengzhimian"){
                legendLayers.push({layer:layer.layer, title:"降雨量"});
                legend = new Legend({
                    map:map,
                    layerInfos:legendLayers
                },"legendDiv");
                //启动legend实例
                legend.startup();
                console.log(legend);
            }
        });
    });