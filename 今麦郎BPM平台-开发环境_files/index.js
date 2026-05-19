// 动态加载js 样式文件
var FLOW_MODULE_PATH = 'static/flowDesigner';
var STENCIL_PATH = FLOW_MODULE_PATH + '/stencils';
var IMAGE_PATH = FLOW_MODULE_PATH + '/images';
var STYLE_PATH = FLOW_MODULE_PATH + '/styles';
var mxLoadResources = false;
// 当前窗口组件vue 实例
var FLOWINSTANCE = null;

// 获取多语言对象
function getLangMsg(lang){
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', './static/flowDesigner/lang/'+lang+'.json', false);
    var msgTXt = null;
    xhr.send(null);
    if(xhr.responseText){
      msgTXt = JSON.parse(xhr.responseText);
    }
    return msgTXt;
  } catch(error) {
    var xhr1 = new XMLHttpRequest();
    xhr1.open('GET', './static/flowDesigner/lang/zh-CN.json', false);
    var msgTXt1 = null;
    xhr1.send(null);
    if(xhr1.responseText){
      msgTXt1 = JSON.parse(xhr1.responseText);
    }  
    console.log(msgTXt1);
    return msgTXt1;
  }
}
/**
 *
 *仅供后端，因为后端需要使用zh_CN,而前端使用标准的zh-CN.
 * @export {string} lang 语言代码
 */
function getLang() {
  // const langKey = 'lang';
  let langForCGI = localStorage.getItem('lang') || 'zh_CN';
  if (langForCGI === 'zh-CN' || langForCGI === 'zh-TW') {
    langForCGI = langForCGI.replace('-', '_');
  }
  return langForCGI;
}
// 多语言配置
function flowI18n(){
  // var that = this;
  // this.messsage = {
  //   'en': getLangMsg('en'),
  //   'zh_CN': getLangMsg('zh-CN')
  // };
  // 当前默认取PAI-language，没有则默认 zh_CN
  this.lang = getLang();
  var langFile = getLangMsg(getLang());
  this.$t = function (str, arr) {
    if(!arr){
      arr = [];
    }
    if (!str) { return; }
    // 获取当前语言
    // var msg = that.messsage[that.lang];
    var msg = langFile;
    try {
      if(msg){
        let keys = str.split('.');
        // 获取配置
        for(var i=0; i < keys.length; i++) {
          if(msg[keys[i]]){
            msg = msg[keys[i]];
          }else{
            msg = '';
          }
        }
        if(typeof msg === 'string'){
          // 处理多语言占位符
          for(var j=0; j<arr.length; j++){
            msg = msg.replace(new RegExp('\\{'+j+'\\}','g'), arr[j]);
          }
        }else{
          msg = '';
        }
      }
    } catch (error) {
      console.info(error);
    }
    return msg;
  }; 
  // 处理画布显示的 节点名称
  this.handerlNodeLabel = function(name){
    if(name ==='流程初始化'){
      name =this.$t('flowDesigner.activityName.start');
    }else if(name ==='节点初始化'){
      name = this.$t('flowDesigner.activityName.startNode');
    }else if(name ==='重新提交'){
      name = '重新提交';
    }else if(name ==='节点结束'){
      name = this.$t('flowDesigner.activityName.endNode');
    }else if(name ==='用户节点'){
      name = this.$t('flowDesigner.activityName.client');
    }else if(name ==='归档'){
      name = this.$t('flowDesigner.activityName.pigeonhole');
    }
    return name;
  };
}
try {
  window.flowI18n = new flowI18n();
} catch (error) {
  throw error;
}


function vUtil () {
  this.alias = [
    FLOW_MODULE_PATH + '/ux/processDesignConstant.js',
    FLOW_MODULE_PATH + '/ux/processDesignUtil.js',
    FLOW_MODULE_PATH + '/js/Datastore.js',
    FLOW_MODULE_PATH + '/js/Api.js',
    FLOW_MODULE_PATH + '/js/Init.js',
    FLOW_MODULE_PATH + '/deflate/pako.min.js',
    FLOW_MODULE_PATH + '/deflate/base64.js',
    FLOW_MODULE_PATH + '/jscolor/jscolor.js',
    FLOW_MODULE_PATH + '/sanitizer/sanitizer.min.js',
    FLOW_MODULE_PATH + '/mxClient.min.js',
    FLOW_MODULE_PATH + '/js/EditorUi.js',
    FLOW_MODULE_PATH + '/js/Editor.js',
    FLOW_MODULE_PATH + '/js/Sidebar.js',
    FLOW_MODULE_PATH + '/js/Graph.js',
    FLOW_MODULE_PATH + '/js/Format.js',
    FLOW_MODULE_PATH + '/js/Shapes.js',
    FLOW_MODULE_PATH + '/js/Actions.js',
    FLOW_MODULE_PATH + '/js/Menus.js',
    FLOW_MODULE_PATH + '/js/Toolbar.js',
    FLOW_MODULE_PATH + '/js/Dialogs.js',
    FLOW_MODULE_PATH + '/js/xmlToJson/xmljson.js',
    FLOW_MODULE_PATH + '/js/xmlToJson/xmltojson.js',
    FLOW_MODULE_PATH + '/js/html2canvas/html2canvas.js',
    FLOW_MODULE_PATH + '/js/html2canvas/canvg.js',
    FLOW_MODULE_PATH + '/js/html2canvas/saveSvgAsPng.js',
    // 重写mxGraph的js 类js文件
    FLOW_MODULE_PATH + '/js/reCover/Menus.js',
    FLOW_MODULE_PATH + '/js/reCover/EditorUi.js',
    FLOW_MODULE_PATH + '/ux/processDesign.js',
  ];
  this.links = [
    STYLE_PATH + '/grapheditor.css',
    STYLE_PATH + '/processDesigner.css',
    FLOW_MODULE_PATH + '/graph/css/common.css'
  ];
}

// 开始加载流程设计器对应的js 以及css 文件
vUtil.prototype.init = function () {
  for (var i = 0, len = this.alias.length; i < len; i++) {
    this.include(this.alias[i]);
  }
  for (var j = 0, len1 = this.links.length; j < len1; j++) {
    this.link('stylesheet', this.links[j]);
  }
};

// 异步加载script
vUtil.prototype.include = function (src) {
  if (src === FLOW_MODULE_PATH + '/js/xmlToJson/xmltojson.js') {
    document.write('<script src="' + src + '" type="module">\x3c/script>');
  } else {
    document.write('<script src="' + src + '">\x3c/script>');
  }
};

// 异步加载css
vUtil.prototype.link = function(a, b, c) {
  c = c || document;
  var d = c.createElement('link');
  d.setAttribute('rel', a);
  d.setAttribute('href', b);
  d.setAttribute('charset', 'UTF-8');
  d.setAttribute('type', 'text/css');
  c.getElementsByTagName('head')[0].appendChild(d);
};

// 获取url 参数值
vUtil.prototype.urlParams = function (url) {
  var result = new Object();
  var idx = url.lastIndexOf('?');

  if (idx > 0)
  {
    var params = url.substring(idx + 1).split('&');

    for (var i = 0; i < params.length; i++)
    {
      idx = params[i].indexOf('=');

      if (idx > 0)
      {
        result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
      }
    }
  }
  return result;
};

var flowInstance = new vUtil();
flowInstance.init();
var urlParams = flowInstance.urlParams(window.location.href);

