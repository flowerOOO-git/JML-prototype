/**
 * Created by Administrator on 2017/10/24.
 */
/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Helper functions for generating Drools for blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';
//定义全局 baseurl变量
var BaseUrlData = [];
Blockly.Drools.BaseText = '选择器';
Blockly.Drools.javaquote_ = function(string) {
  string = string.replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\\n')
    .replace(/'/g, '\\\'');
  return '"' + string + '"';
};

Blockly.Drools.isNumber = function (val) {
  // isNaN()函数 把空串 空格 以及NUll 按照0来处理 所以先去除
  if(val === '' || val ==null || val === '' || val === undefined){
    return false;
  }
  if (!isNaN(val)){
    return true;
  } else {
    return false;
  }
};

Blockly.Drools.createImport = function (arg) {
  if (arg && arg.name) {
    var importString = 'import ' + arg.namespace + '.' + arg.name;
    return importString;
  } else {
    return '';
  }
};

Blockly.Drools.createImportByDto = function (obj, id) {

  if (obj) {
    var name = Blockly.Drools.lawArgFirstName(obj.name);
    var objType = obj.ref;
    var ver = obj.version;

    if (!name || !objType) {
      return '';
    }

    var s = '';
    // if (!ver) {
    //     s = '.last.'
    // } else {
    //     s = '.'+ver+'.';
    // }
    // var str = 'import com.paasit.pai.core.blogic.dto.'+name+s+objType+';';
    var imp = {};
    if (ver) {
      imp.ver = ver.toLowerCase().replace('v', '').replace('_', '.');
    }
    var str = '${' + objType + '_import};';
    imp.importString = str;
    imp.objectName = objType;
    Blockly.Drools.ruleObject.impormtObject.push(imp);
    Blockly.Drools.impObj[id] = str;
  }
};

Blockly.Drools.createGlobal = function (arg) {
  if (arg && arg.name) {
    var stringGlobal = 'global ' + arg.name + ' $' + arg.name;
    return stringGlobal;
  } else {
    return '';
  }
};

Blockly.Drools.droolName = function (name) {
  var re = name;
  return re;
};

Blockly.Drools.checkBaseName = function (data) {
  var arr = Blockly.Drools.getAllItemName();
  if (data.startsWith('apiClient')) {
    return true;
  }
  for (var i = 0; i < arr.length; i++) {
    if (data === arr[i]) {
      return true;
    } else if (data === ('arg_' + arr[i])) {
      return true;
    }
  }
  return false;
};

Blockly.Drools.getBaseItem = function () {
  var retArr = [];
  var myBlocks = Blockly.mainWorkspace.getAllBlocks();
  for (var i = 0; i < myBlocks.length; i++) {
    var b = myBlocks[i];
    if (b.getRuleVarName && b.getRuleVarName('String')) {
      var re = b.getRuleVarName('String');
      var arrChild = [];
      arrChild.push(re);
      arrChild.push(re);
      retArr.push(arrChild);
    } else if (b.getRuleVarName && b.getRuleVarName('int')) {
      var re = b.getRuleVarName('int');
      var arrChild = [];
      arrChild.push(re);
      arrChild.push(re);
      retArr.push(arrChild);
    } else if (b.getRuleVarName && b.getRuleVarName('arr')) {
      var re = b.getRuleVarName('arr');
      var arrChild = [];
      arrChild.push(re);
      arrChild.push(re);
      retArr.push(arrChild);
    } else if (b.getRuleVarName && b.getRuleVarName('JsonNode')) {
      var re = b.getRuleVarName('JsonNode');
      var arrChild = [];
      arrChild.push(re);
      arrChild.push(re);
      retArr.push(arrChild);
    }
  }
  if (retArr.length > 0) {
    return retArr;
  } else {
    return [['', '']];
  }
};

Blockly.Drools.getAllItemName = function () {
  var ret = [];
  var myBlocks = Blockly.mainWorkspace.getAllBlocks();
  for (var i = 0; i < myBlocks.length; i++) {
    var b = myBlocks[i];
    if (b.getRuleVarName && b.getRuleVarName('String')) {
      var re = b.getRuleVarName('String');
      ret.push(re);
    } else if (b.getRuleVarName && b.getRuleVarName('int')) {
      var re = b.getRuleVarName('int');
      ret.push(re);
    } else if (b.getReturn && b.getReturn()) {
      var re = b.getReturn();
      ret.push(re.name);
    }
  }
  return ret;
};

Blockly.Drools.createApiName = function (res) {
  var ress = res.split('-');
  var returnStr = '';
  if (ress && ress.length > 0) {
    for (var i = 0; i < ress.length; i++) {
      if (i == 0) {
        returnStr = returnStr + Blockly.Drools.lawArgFirstName(ress[i]);
      } else {
        if (!(i == (ress.length - 1) && ress[i] === 'resource')) {
          returnStr = returnStr + Blockly.Drools.upArgFirstName(ress[i]);
        }
      }
    }
  }
  return returnStr;
};

// Blockly.Drools.addReturnsType = function (obj, type) {
//     for (var i = 0; i < Blockly.Drools.ruleObject.mainInfo.length; i++) {
//         if (obj.value.api === Blockly.Drools.ruleObject.mainInfo[i].api) {
//             if (Blockly.Drools.ruleObject.mainInfo[i].returns) {
//                 Blockly.Drools.ruleObject.mainInfo[i].returns = Blockly.Drools.ruleObject.mainInfo[i].returns + ',' + type;
//             } else {
//                 Blockly.Drools.ruleObject.mainInfo[i].returns = type;
//             }
//         }
//     }
// }

Blockly.Drools.upArgFirstName = function (argname) {
  var re = argname.substring(0, 1).toUpperCase() + argname.substring(1, argname.length);
  return re;
};

Blockly.Drools.lawArgFirstName = function (argname) {
  var re = argname.substring(0, 1).toLowerCase() + argname.substring(1, argname.length);
  return re;
};
Blockly.Drools.createSelectWin = function (sign, callbacck) {
  if (!sign) {
    sign = 'all';
  }
};

Blockly.Xml.domToField_ = function(a, b, c) {
  var d = a.getField(b);
  var ws = a.workspace;
  var val = c.textContent;
  var bool = false;
  if (a.setFieldValue) {
    bool = true;
  }
  d ? (d.referencesVariables() ? Blockly.Xml.domToFieldVariable_(ws, c, val, d) : (bool ? a.setFieldValue(val,b):d.setValue(val))) : console.warn('Ignoring non-existent field ' + b + ' in block ' + a.type);
}
;

Blockly.Drools.initData = function () {
  Blockly.Blocks.rule.errorMsg = [];
  Blockly.Drools.ruleObject = {};
  Blockly.Drools.ruleObject.mainInfo = [];
  Blockly.Drools.ruleObject.impormtObject = [];
  Blockly.Drools.ruleObject.droolsGlobalVOList = [];
  Blockly.Drools.sign_getCode = {};
  Blockly.Drools.sign_isHave = {};
  Blockly.Drools.sign_return = [];
  Blockly.Drools.setDataFields = [];
  Blockly.Drools.droolsData = {};
  Blockly.Drools.count = 0;
};

Blockly.Drools.getDFTOresult = function() {
  if (Blockly.Drools.setDataFields && Blockly.Drools.setDataFields.length > 0) {
    var res = '[';
    for (var i=0; i < Blockly.Drools.setDataFields.length; i++) {
      var o = Blockly.Drools.setDataFields[i];
      res = res + '{\\"dataName\\":\\"'+o.dataName + '\\",\\"dataValue\\":\\""+'+o.dataValue+'+"\\",\\"association\\":\\"'+o.association+'\\"}';
      if (i < (Blockly.Drools.setDataFields.length-1)) {
        res = res + ',';
      }
    }
    res = res + ']';
    return res;
  } else {
    return '';
  }
};

Blockly.Drools.getParentNode = function (val, item) {
  if (item.parentNode) {
    val.pointStr = item.parentNode.name.en + '.' + (val.pointStr || item.name.en);
    val.objName = item.parentNode.name.en;
    val.getStr = '.get' + Blockly.Drools.upArgFirstName(item.name.en) + '()' + (val.getStr || '');
    Blockly.Drools.getParentNode(val, item.parentNode);
  }
  else if(item.length >0 && item[0].way){
    val.getStr = item[0].way;
    val.objName = item[0].objName;
    val.pointStr = item[0].path;
    val.type = '1';
  }
};


Blockly.Drools.createWin = function (value, callback) {
  Blockly.Drools.id = '';
  Blockly.Drools.processId = '';
  Blockly.Drools.formDataId = '';
  Blockly.Drools.ruleType = '';
  Blockly.Drools.langArr = [
    ['简体中文', 'zh_CN'],
    ['英文', 'en']
  ];
  Blockly.Drools.typeArr = [
    // ['类型', ''],
    ['字符串', 'String'],
    ['数字', 'int'],
    ['JsonNode', 'JsonNode'],
    ['小数Double', 'double'],
    ['布尔型', 'boolean'],
    ['小数Float', 'float']
  ];
  Blockly.Drools.jsonMethodArr = [
    // ['类型', ''],
    ['.toString()', '.toString()'],
    ['.asText()', '.asText()'],
    ['.asInt()', '.asInt()'],
    ['.asDouble()', '.asDouble()'],
    ['.asBoolean()', '.asBoolean()']
  ];
  Blockly.Drools.jsonDoArr = [
    // ['类型', ''],
    ['.get', '.get'],
    ['.findPath', '.findPath']
  ];

  if (!value) {
    return;
  }
  // if (!value.processId && value.ruleType === 'rule') {
  //   Blockly.vue_.$notify({
  //     type: 'error',
  //     message: '没有传入流程id'
  //   });
  //   return;
  // }
  // if (!value.formDataId && value.ruleType === 'rule') {
  //   Blockly.vue_.$notify({
  //     type: 'error',
  //     message: '没有传入表单id'
  //   });
  //   return;
  // }

  Blockly.Drools.id = value.id;
  Blockly.Drools.processId = value.processId;
  Blockly.Drools.formDataId = value.formDataId;

  Blockly.Blocks.rule = {};

  Blockly.Blocks.processDataFields = [];
  for (var key in value.processDataFields) {
    var temp = {};
    temp.name = key;
    if (typeof value.processDataFields[key] === 'object') {
      temp = value.processDataFields[key];
    }
    Blockly.Blocks.processDataFields.push(temp);
  }
  // Blockly.Blocks.processDataFields = value.processDataFields || [];
  // Blockly.Blocks.activityDataFields = value.activityDataFields || [];
  Blockly.Blocks.activityDataFields = [];
  if (!value.activityDataFields) {
    value.activityDataFields = {
      'Action Result': {
        dataFieldType: 'Destination',
        name: 'Action Result',
        dataType: 'String'
      },
      'Outcome': 'Outcome',
      'ActBusinessData': 'ActBusinessData'
    };
  }
  for (var key in value.activityDataFields) {
    var temp = {};
    temp.name = key;
    temp.scope = 'Activity';
    if (typeof value.activityDataFields[key] === 'object') {
      temp = value.activityDataFields[key];
    }
    Blockly.Blocks.activityDataFields.push(temp);
  }
  Blockly.Drools.initData();

  Blockly.Blocks.rule.panelArgs = {};
  Blockly.Blocks.rule.panelArgs.object = {};
  Blockly.Blocks.rule.datas = {};
  Blockly.Blocks.rule.grid_ = {
    reference: 'objectGrid',
    sortableColumns: false, //禁止所有列排序
    enableColumnHide: false, //禁止所有列隐藏
    enableColumnMove: false, //禁止所有列移动
    enableColumnResize: false, //禁止所有列宽修改
    width: 400,
    height: 300,
    desc: '对象选择',
    store: {
      fields: ['id', 'name', 'namespace', 'projectName', 'owner'],
      data: []
    },
    columns: [{
      text: '名称',
      dataIndex: 'name',
      flex: 2
    }, {
      text: '命名空间',
      dataIndex: 'namespace',
      flex: 2
    }, {
      text: '项目名称',
      dataIndex: 'projectName',
      flex: 2
    }, {
      text: '拥有者',
      dataIndex: 'owner',
      flex: 2
    }]
  };

  Blockly.Blocks.rule.servicegrid_ = {
    reference: 'serviceGrid',
    sortableColumns: false, //禁止所有列排序
    enableColumnHide: false, //禁止所有列隐藏
    enableColumnMove: false, //禁止所有列移动
    enableColumnResize: false, //禁止所有列宽修改
    width: 800,
    height: 300,
    desc: '服务选择',
    columns: [{
      text: '服务名',
      dataIndex: 'serviceName',
      flex: 1
    }, {
      text: '概要',
      dataIndex: 'summary',
      flex: 3
    }, {
      text: '描述',
      dataIndex: 'description',
      flex: 4
    }, {
      text: '方法名',
      dataIndex: 'name',
      flex: 2
    }, {
      text: 'resourceName',
      dataIndex: 'resourceName',
      flex: 2
    }, {
      text: 'api地址',
      dataIndex: 'api',
      flex: 3
    }, {
      text: '请求类别',
      dataIndex: 'httpMethod',
      flex: 1
    }, {
      text: '参数',
      dataIndex: 'args',
      flex: 1
    }, {
      text: '依赖',
      dataIndex: 'refs',
      flex: 1
    }, {
      text: '返回值',
      dataIndex: 'returns',
      flex: 1
    }]
  };
  Blockly.Drools.defPackage = 'org.drools.examples';
  Blockly.Drools.defLang = 'zh_CN';
  Blockly.Drools.nameLang = 'en';
  Blockly.Drools.placeholder = '${import}';
  Blockly.Drools.globalholder = '${global}';
  Blockly.Drools.staticUrl = Blockly.vue_;
  Blockly.Drools.dicObjects = {};
  Blockly.Drools.dicObjects.mainInfo = [];
  Blockly.Drools.importString = '';
  Blockly.Drools.allrefs = {};
  Blockly.Drools.strObj = [];
  Blockly.Drools.numObj = [];
  Blockly.Drools.queryString = '';
  Blockly.Drools.queryObj = {};
  Blockly.Drools.impObj = {};
  Blockly.Drools.winId = '';

  value.blocklyData = [];
  if (!value.ruleType) {
    value.ruleType = 'rule';
  }
  Blockly.Drools.ruleType = value.ruleType;
  if (value.xmlCode ) {
    if(value.xmlCode.block) {
      value.blocklyData = value.xmlCode.block;
    }else {
      var json = JSON.parse(value.xmlCode);
      value.blocklyData = json.block;
    }
  }
};

Blockly.Drools.setQueryString = function (ret, str) {
  // Blockly.Drools.queryString = str + '\n';
  Blockly.Drools.ruleObject.returnMthod = ret;
};

Blockly.Drools.removeUsing = function (name) {
  // Blockly.Drools.queryString = str + '\n';
  if (name && name.indexOf('Using') > -1) {
    return name.substr(0, name.indexOf('Using'));
  } else {
    return name;
  }
};

Blockly.Drools.log = function (rulename, blockname, content) {
  var logStr = 'com.paasit.pai.core.drools.DroolsLogHelper.log("' + rulename + '","' + blockname + '","' + content + '");\n';
  return logStr;
};

Blockly.Drools.getVarNames = function (type) {
  var ret = [];
  var myBlocks = Blockly.mainWorkspace.getAllBlocks();
  for (var i = 0; i < myBlocks.length; i++) {
    var b = myBlocks[i];
    if (b.getRuleVarName && b.getRuleVarName(type)) {
      var re = b.getRuleVarName(type);
      var arr = [];
      arr.push(re);
      arr.push(re);
      ret.push(arr);
    }
  }
  return ret;
};

Blockly.Drools.getPanelArgs = function () {

  var ret = [];
  // var map = {};
  // map.varname = '$formData';
  // map.text = '$formData';
  // map.name = 'map';
  // map.res = '固定的输入参数Map';
  // map.description = '固定输入参数';
  // map.type = 'Map';
  // map.sign = 'object';
  // ret.push(map);
  // for (var key in Blockly.Blocks.rule.datas) {
  //     var json = {};
  //     json.varname = '$' + Blockly.Blocks.rule.datas[key].name;
  //     json.text = Blockly.Blocks.rule.datas[key].nameDesc || '';
  //     json.name = Blockly.Blocks.rule.datas[key].name;
  //     json.res = '使用规则时输入的对象'+json.name;
  //     json.description = Blockly.Blocks.rule.datas[key].description || '';
  //     json.type = Blockly.Blocks.rule.datas[key].type || '';
  //     json.sign = 'object';
  //
  //     ret.push(json);
  // }
  //
  // for (var key in Blockly.Blocks.rule.panelArgs.object) {
  //     //ret.push([Blockly.Blocks.rule.panelArgs.object[key].text,Blockly.Blocks.rule.panelArgs.object[key].value])
  //     var json = {};
  //     json.varname = Blockly.Blocks.rule.panelArgs.object[key].name;
  //     json.text = Blockly.Blocks.rule.panelArgs.object[key].name;
  //     json.name = Blockly.Blocks.rule.panelArgs.object[key].value.returns.name;
  //     json.res = Blockly.Blocks.rule.panelArgs.object[key].res;
  //     json.description = Blockly.Blocks.rule.panelArgs.object[key].value.returns.description || '';
  //     json.type = Blockly.Blocks.rule.panelArgs.object[key].value.returns.type || '';
  //     json.sign = 'service';
  //     json.value = Blockly.Blocks.rule.panelArgs.object[key].value;
  //     ret.push(json);
  // }
  var myBlocks = Blockly.mainWorkspace.getAllBlocks();
  for (var i = 0; i < myBlocks.length; i++) {
    var b = myBlocks[i];
    if (b.getReturn && b.getReturn()) {
      var re = b.getReturn();
      var json = {};
      json.text = re.name;
      json.res = re.res;
      json.description = re.description;
      json.value = re.value;
      json.sign = 'service';
      json.methodType = re.methodType;
      ret.push(json);
    }
  }
  return ret;
  // var grid = {
  //     reference: 'panelArgsGrid',
  //     sortableColumns: false, //禁止所有列排序
  //     enableColumnHide: false, //禁止所有列隐藏
  //     enableColumnMove: false, //禁止所有列移动
  //     enableColumnResize: false, //禁止所有列宽修改
  //     width: 800,
  //     height: 300,
  //     desc: '对象选择',
  //     store: {
  //         fields: ['res','text','name','value','varname','description','type', 'methodType'],
  //         data : ret
  //     },
  //     columns: [{
  //         text: '来源',
  //         dataIndex: 'res',
  //         flex: 2
  //     }, {
  //         text: '变量名',
  //         dataIndex: 'text',
  //         flex: 2
  //     }, {
  //         text: '描述',
  //         dataIndex: 'description',
  //         flex: 2
  //     }]
  // }
  // return grid;
};

Blockly.Drools.getAttrs = function (ret, sign) {

  if (!ret) {
    ret = [];
  }
  var grid;
  if (sign === 'service') {
    grid = {
      reference: 'panelAttrsGrid',
      sortableColumns: false, //禁止所有列排序
      enableColumnHide: false, //禁止所有列隐藏
      enableColumnMove: false, //禁止所有列移动
      enableColumnResize: false, //禁止所有列宽修改
      width: 800,
      height: 300,
      desc: '属性选择',
      store: {
        fields: ['name','description','dataType','type','ref'],
        data : ret
      },
      columns: [{
        text: '属性名',
        dataIndex: 'name',
        flex: 2
      }, {
        text: '描述',
        dataIndex: 'description',
        flex: 2
      }, {
        text: '类型',
        dataIndex: 'type',
        flex: 2
      }]
    };
  }

  return grid;
};

Blockly.Drools.refUtil = function (re, attrs) {
  var pro = re.properties;
  for (var k in pro) {
    if (k.toLocaleLowerCase() === 'messagelist' || k.toLocaleLowerCase() === 'pagecontrollerinfo' || k.toLocaleLowerCase() === 'responsecode') {
      continue;
    }
    var json = {};
    json.name = k;
    json.dataType = pro[k].dataType || pro[k].type || '';
    json.description = pro[k].description || '';

    if (pro[k].items) {
      var strRef = pro[k].items.$ref;
      var refstrs = strRef.split('/');
      var last = refstrs[refstrs.length - 1];
      json.ref = last;
    }
    if (pro[k].$ref) {
      var strRef = pro[k].$ref;
      var refstrs = strRef.split('/');
      var last = refstrs[refstrs.length - 1];
      json.ref = last;
    }
    attrs.push(json);
  }
};

Blockly.Drools.selectObj = function (obj, comp, callback) {

  if (obj.sign === 'service') {
    var re = Blockly.Drools.allrefs[obj.value.returns.ref];
    if (re) {
      var attrs = [];
      Blockly.Drools.refUtil(re, attrs);
      callback(attrs, comp);
    }
  }
};


