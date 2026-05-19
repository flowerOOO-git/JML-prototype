var jssonData;
function xml_2_json(data) {
  var space = ($('#pretty_json').is(':checked')) ? '  ' : '';
  var xotree = new XML.ObjTree();
  // 获得xml数据。
  var tree = xotree.parseXML(data);
  if (!tree.html) {
    var output = $('#output').val(JSON.stringify(tree, null, space));
    var json = JSON.stringify(tree, null, space);
    var node = JSON.parse(json).workflow.processData.activitys;
    var direction = JSON.parse(json).workflow.processData.directions;

    var cellData = [];
    // 遍历节点
    for (var i = 0; i < node.length; i++) {
      var cellNode = {};
      if (node[i].id == '1') {

        cellNode['-id'] = 'flowStart';
        cellNode['-value'] = 'start';
      }
      if (node[i].id == '2') {
        cellNode['-id'] = 'flowEnd';
        cellNode['-value'] = 'end';
      }
      var ali = node[i].layoutInfo.split(',');
      cellNode['-parent'] = '1';
      cellNode['-vertex'] = '1';
      cellNode['-value'] = node[i].name;
      cellNode['mxGeometry'] = {
        '-x': ali[0],
        '-y': ali[1],
        '-width': '100',
        '-height': '30',
        '-as': 'geometry'
      };
      cellData.push(cellNode);
    }
    // 遍历线
    for (var j = 0; j < direction.length; j++) {
      var cell = {};
      if (direction[j].id) {
        direction[j].id = direction[j].id + 'd';
      }
      cell['-id'] = direction[j].id;
      cell['-parent'] = '1';
      cell['-source'] = direction[j].prevNodeID;
      cell['-target'] = direction[j].nextNodeID;
      cell['-edge'] = '1';
      cell['-style'] = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;jettySize=auto;orthogonalLoop=1;';
      cell['mxGeometry'] = {
        '-relative': '1',
        '-as': 'geometry'
      };
      cellData.push(cell);
    }
    var head = [{'-id': '0'}, {'-id': '1', '-parent': '0'}];
    var cellDatas = head.concat(cellData);
    var jsonData = {
      'mxGraphModel': {
        'root': {
          'mxCell': cellDatas
        }
      }
    };
    jssonData = jsonData;
  } else {
    console.log('XML格式错误');
  }
}

function json_to_xml(data) {
  try {
    var xotree = new XML.ObjTree();
    var dataString = JSON.stringify(data);
    return xotree.writeXML(JSON.parse(dataString));
  } catch (e) {
    console.log('JSON格式错误');
  }
}

function createXml(str) {
  if (document.all) {
    var xmlDom = new ActiveXObject('Microsoft.XMLDOM');
    xmlDom.loadXML(str);
    return xmlDom;
  } else {
    return new DOMParser().parseFromString(str, 'text/xml');
  }
}

function Empty() {
  document.getElementById('input').value = '';
  document.getElementById('output').value = '';
  document.getElementById('input').select();
}

function parseJson(node,type=null,activitysData=null) {
  var cellData = [];

  for (var key in node) {
    if (key === '0' || key === '1') {
      continue;
    }
    if (node.hasOwnProperty(key)) {
      if (node[key].nodeType !== processDesignConstant.NODE_TYPE.LINE &&
        node[key].nodeType !== processDesignConstant.NODE_TYPE.SELF_LINE &&
        node[key].nodeType !== processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE) {
        var cellNode = {};
        cellNode['-id'] = node[key].id ? node[key].id : '';

        cellNode['-parent'] = '1';
        cellNode['-vertex'] = node[key].vertex;

        // 兼容老数据 处理样式
        let value = node[key].value;
        // 更新为最新样式 非开始结束和线 改变外边框
        if(node[key].nodeType && node[key].nodeType !== 5 && node[key].nodeType !== 1 && node[key].nodeType !== 99 && node[key].style){
          let nodeStyle = 'shadow=0;rounded=1;arcSize=20;rotatable=1;arcSize=20;verticalAlign=top;align=left;overflow=fill;fontSize=16;strokeColor=white;fontFamily=Microsoft YaHei;html=1;';
          node[key].style = nodeStyle;
          node[key].geometry.height = 110;
        }
        // 开始节点
        if(node[key].nodeType && node[key].nodeType === 1 && node[key].style){
          // 创建一个临时的 DOM 元素来解析 HTML 字符串
          let tempDiv = document.createElement('div');
          tempDiv.innerHTML = value;
          // 获取 <p> 元素
          let pElement = tempDiv.querySelector('p');
          // 如果找到了 <p> 元素
          if (pElement) {
            // 替换 span 元素中的文本内容
            pElement.textContent = window.flowI18n.$t('flowDesigner.activityName.processStart');
          }
          // 将修改后的 DOM 转回 HTML 字符串
          value = tempDiv.innerHTML;
          let startStyle = 'shadow=0;fillColor=#1DCC8F;strokeColor=white;fontColor=' + processColor.$nblColor05 + ';rounded=1;arcSize=50;fontSize=14;fontFamily=Microsoft YaHei;right;html=1;';
          node[key].style = startStyle;
          if(value && value.indexOf('padding:0 0 0 14px') >= 0){
            value = value.replace('padding:0 0 0 14px','padding:0 0 0 18px');
          }
          if(value && value.indexOf('background-size: 10px 12px') >= 0){
            value = value.replace('background-size: 10px 12px','background-size: 14px 14px');
          }
        }
        // 结束节点
        if(node[key].nodeType && node[key].nodeType === 5 && node[key].style){
          // 创建一个临时的 DOM 元素来解析 HTML 字符串
          let tempDiv = document.createElement('div');
          tempDiv.innerHTML = value;
          // 获取 <p> 元素
          let pElement = tempDiv.querySelector('p');
          // 如果找到了 <p> 元素
          if (pElement) {
            // 替换 span 元素中的文本内容
            pElement.textContent = window.flowI18n.$t('flowDesigner.activityName.processEnd');
          }
          // 将修改后的 DOM 转回 HTML 字符串
          value = tempDiv.innerHTML;
          let endStyle = 'shadow=0;fillColor=#F14D5F;strokeColor=white;fontColor=' + processColor.$nblColor05 + ';rounded=1;arcSize=50;fontSize=14;fontFamily=Microsoft YaHei;right;html=1;';
          node[key].style = endStyle;
        }

        // 处理以前数据中value含有#6a9cf4颜色的节点
        if (value && value.indexOf('#6a9cf4') >= 0) {
          value = value.replace(/#6a9cf4/g, '#003865');
        }
       
        // 处理以前数据中style中没有边框的数据
        if (value && value.indexOf('border:1px solid #bababa') >= 0) {
          value = value.replace(/border:1px solid #bababa/g, 'border:none');
        }

        // 修复icon图标路经
        if (value && value.indexOf('url(stencils') > 0) {
          value = value.replace(/url\(stencils/g, 'url(static/flowDesigner/stencils');
        }
        
        // 创建一个临时的 DOM 元素来解析 HTML 字符串
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = value;
        // 获取包含特定类名的 <p> 元素
        let pElement = tempDiv.querySelector('p.k2-node-title');
        // 如果找到了对应的 <p> 元素
        if (pElement) {
          // 获取 <span> 元素
          let spanElement = pElement.querySelector('span');
          // 如果找到了 <span> 元素
          if (spanElement && activitysData && activitysData.length) {
            let filteredItems = activitysData.filter(item => item.activityInfo.activityName === node[key].nodeName);
            // 替换 span 元素中的文本内容
            spanElement.textContent = filteredItems && filteredItems.length ? filteredItems[0].activityInfo.displayName[window.flowI18n.lang] : '';
          }
        }
        // 将修改后的 DOM 转回 HTML 字符串
        value = tempDiv.innerHTML;

        cellNode['-value'] = value;
        // 网关节点
        if(node[key].nodeType && node[key].nodeType === 13 && node[key].style){
          let filteredItems = null;
          if (activitysData && activitysData.length) {
            filteredItems = activitysData.filter(function (item) {
              return item.activityInfo.activityName === node[key].nodeName;
            });
          }
          // 替换 span 元素中的文本内容
          let textContent = filteredItems && filteredItems.length ? filteredItems[0].activityInfo.displayName[window.flowI18n.lang] : '';
          const valueStr = '<div class="k2-node-gateway"><div class="gateway-title"><span class="gateway-font-area">'+ textContent +'</span></div></div>';
          cellNode['-value'] = valueStr;
        }
        // 其它流程  分支 节点
        if( node[key].nodeType === 18){
          const valueStr = '<div class="k2-node-gateway other-node-branch"><div class="gateway-title"><span class="gateway-font-area">'+ node[key].nodeName + '</span></div></div>';
          cellNode['-value'] = valueStr;
        }
        // 特殊显示
        if(window.NODE_TYPE_STYLE && window.NODE_TYPE_TITLE && node[key].nodeType != 1 && node[key].nodeType != 5){
          var nodeName = window.NODE_TYPE_TITLE[node[key].nodeType];
          nodeName =  window.flowI18n.handerlNodeLabel(nodeName);
          const valueStr = '<p class="k2-node-title">'+
              '<span style="background:transparent url('+ window.processDesignConstant.NODE_ICON[node[key].nodeType] + ') no-repeat left center;">'+nodeName+'</span>'+
          '</p>'+
          '<ul class="k2-node-container">'+
            '<li class="k2-node-item" title="'+node[key].nodeName+'">'+node[key].nodeName+'</li>'+
          '</ul>';
          cellNode['-value'] = valueStr;
        }

        // 特殊处理 流程图模块 显示规则配置的节点 下面多一块同意的dom 所以高度要增高32px
        // 矩阵节点下面多一个 新增场景
        if(type && type === 'flowDesigner' && node[key].nodeType && (node[key].nodeType === 6 || node[key].nodeType === 10 || node[key].nodeType === 4 || node[key].nodeType === 8)){
          node[key].geometry.height = 142;
        }
        //
        if (node[key].style && node[key].style.indexOf('shape=mxgraph.flowchart.process;') >= 0) {
          cellNode['-style'] = node[key].style.replace('shape=mxgraph.flowchart.process;', '');
        } else {
          cellNode['-style'] = node[key].style;
        }

        //  处理以前数据中style含有#6a9cf4颜色的节点
        if (node[key].style && node[key].style.indexOf('#6a9cf4') >= 0) {
          cellNode['-style'] = node[key].style.replace(/#6a9cf4/g, '#003865');
        }else{
          cellNode['-style'] = node[key].style;
        }
        // 处理以前数据中style中没有边框的数据
        if (node[key].style && node[key].style.indexOf('strokeColor=transparent') >= 0) {
          cellNode['-style'] = node[key].style.replace(/strokeColor=transparent/g, 'strokeColor=#bababa');
        } else {
          cellNode['-style'] = node[key].style;
        }

        cellNode['-nodeType'] = node[key].nodeType;
        cellNode['-nodeName'] = node[key].nodeName;
        cellNode['-connectable'] = node[key].connectable;
        cellNode['mxGeometry'] = {
          '-x': node[key].geometry && node[key].geometry.x ? node[key].geometry.x : 0,
          '-y': node[key].geometry && node[key].geometry.y ? node[key].geometry.y : 0,
          '-width': node[key].geometry && node[key].geometry.width ? node[key].geometry.width : 0,
          '-height': node[key].geometry && node[key].geometry.height ? node[key].geometry.height : 0,
          '-as': 'geometry',
          '-TRANSLATE_CONTROL_POINTS': node[key].geometry.TRANSLATE_CONTROL_POINTS || true
        };
        cellData.push(cellNode);
      } else {
        var cell = {};

        cell['-id'] = node[key].id;
        cell['-parent'] = '1';
        cell['-value'] = getLineValueByKey(key,node[key].value);
        cell['-source'] = node[key].source ? node[key].source.id : null;
        cell['-target'] = node[key].target ? node[key].target.id : null;
        cell['-edge'] = true;
        // yuminghao 复写处理以前数据 线的颜色
        if (node[key].style && node[key].style.indexOf('#bababa') >= 0) {
          node[key].style = node[key].style.replace(/#bababa/g, '#979AA3');
        }
        if (node[key].style && node[key].style.indexOf('edgeStyle') === -1) {
          cell['-style'] = 'edgeStyle=orthogonalEdgeStyle;rounded=0;' + node[key].style;
        } else {
          cell['-style'] = node[key].style;
        }

        cell['-nodeType'] = node[key].nodeType;
        cell['mxGeometry'] = {
          '-as': 'geometry',
          '-relative': '1',
          'Array': []
        };

        if (node[key].geometry.points) {
          var points = {
            '-as': 'points',
            'mxPoint': []
          };

          for (var j = 0; j < node[key].geometry.points.length; j++) {
            points.mxPoint.push({
              '-x': node[key].geometry.points[j].x,
              '-y': node[key].geometry.points[j].y
            });
          }

          cell['mxGeometry']['Array'].push(points);
        }

        if (node[key].geometry.abspoints) {
          var abspoints = {
            '-as': 'abspoints',
            'mxPoint': []
          };

          for (var i = 0; i < node[key].geometry.abspoints.length; i++) {
            if (!node[key].geometry.abspoints[i]) {
              continue;
            }
            abspoints.mxPoint.push({
              '-x': node[key].geometry.abspoints[i].x,
              '-y': node[key].geometry.abspoints[i].y
            });
          }

          cell['mxGeometry']['Array'].push(abspoints);
        }

        cellData.push(cell);
      }
    }
  }

  var head = [{'-id': '0'}, {'-id': '1', '-parent': '0'}];
  var cells = head.concat(cellData);

  return {
    'mxGraphModel': {
      'root': {
        'mxCell': cells
      }
    }
  };
}
/**
 * @FunctionName: 在lineRuleObjList找线的显示值
 * @Author: mhyu
 * @param {*} key
 * @param {*} value
 * @return {*}
 * @Date: 2024-05-23 16:18:12
 * @Description: 
 */
function getLineValueByKey(key,value) {
  let newVal = value ? value : '';
  let returnValue = '';
  // DOA流程查看流程图 没有lineRuleObjList
  if(FLOWSTOREDATA.currData.workflow.processData && FLOWSTOREDATA.currData.workflow.processData.lineRuleObjList){
    const lineRuleObjList = FLOWSTOREDATA.currData.workflow.processData.lineRuleObjList;
    let findLine = lineRuleObjList.find(n => n.id === key);
    if (findLine) {
      returnValue = findLine.lineLabel || findLine.lineName || newVal;
    }
  }else{
    returnValue = newVal
  }
  return returnValue;
}

function destStatusFun(status) {
  let actInstDestStatus = null;
  switch (status) {
  case 0:
    actInstDestStatus = '已激活';
    break;
  case 1:
  case 10:
    actInstDestStatus = '已过期';
    break;
  case 2:
    actInstDestStatus = '已完成';
    break;
  case 3:
    actInstDestStatus = '待激活';
    break;
  default:
    actInstDestStatus = '';
  }
  return actInstDestStatus;
}

function curNodePeople(curKey, approvalData) {
  let curNodeData = null;
  const curMessage_y = approvalData.find(item => item.activityName === curKey);
  if(curMessage_y) {
    if(curMessage_y.actInstDestStatus !== null) {
      const destStatus = destStatusFun(curMessage_y.actInstDestStatus);
      curNodeData = '<li>审批人：'+ curMessage_y.desLastName + curMessage_y.desFirstName + '</li>';
      curNodeData += '<li>审批状态：'+ destStatus + '</li>';
      return curNodeData;
    } else {
      return '<li class="ta">' + curKey + '</li>';
    }
  }
  else{
    return '<li class="ta">' + curKey + '</li>';
  }

}

function json_2_xml(data) {
  try {
    var xotree = new XML.ObjTree();
    var dataChange = JSON.stringify(data);
    var xmlData = xotree.writeXML(JSON.parse(dataChange));
    return xmlData;
  } catch (e) {
    console.log('JSON格式错误');
  }
}

// 流程图展示渲染
function parseFlowChartJson (node, ViewProcess, approvalData) {
  var cellData = [];
  var title = '';
  if (ViewProcess.Error == undefined) {
    title = ' ViewFlow - ' + ViewProcess.ViewProcess.Process.Name + '(' + ViewProcess.ViewProcess.ProcessInstance.Folio + ')';
  } else {
    title = ViewProcess.Error;
  }
  /**
   * 绿色#8CC43F|已执行的节点颜色
   * 绿色#70ad47已执行的节点颜色（华润）
   * 蓝色#23ACE2|当前节点颜色
   * 黄色#ffc000|当前节点颜色（华润）
   * 红色#C7232C
   * 黄色#F8B00E
   * 灰色#D7D7D7|未执行节点的颜色
   * 灰色#e7e6e6|未执行节点的颜色（华润）
   */
  var color ={
    notPass: '#e7e6e6',
    current: '#ffc000',
    pass: '#70ad47'
  };
  var connectorPaintStyle = {
      strokeWidth: 2,
      stroke: 'rgba(30, 83, 39, 1)',
      joinstyle: 'round',
      outlineStroke: 'transparent',
      outlineWidth: 2
    },
    passConnectorPaintStyle = {
      strokeWidth: 2,
      stroke: 'rgba(138, 201, 37, 1)',
      joinstyle: 'round',
      outlineStroke: 'transparent',
      outlineWidth: 2
    },
    notPassConnectorPaintStyle = {
      strokeWidth: 2,
      stroke: 'red',
      joinstyle: 'round',
      outlineStroke: 'transparent',
      outlineWidth: 2
    };
  // 需要把标题修改为系统节点的节点类型(9,3,2,1,5,13)
  var systemNodeType = [
    processDesignConstant.NODE_TYPE.SERVICE,
    processDesignConstant.NODE_TYPE.PIGEONHOLE,
    processDesignConstant.NODE_TYPE.INIT
  ];
  var fixNodeType = [
    processDesignConstant.NODE_TYPE.START,
    processDesignConstant.NODE_TYPE.END,
    processDesignConstant.NODE_TYPE.GATEWAY
  ];

  for (var key in node) {
    if (key === '0' || key === '1') {
      continue;
    }
    if (node.hasOwnProperty(key)) {
      if (node[key].nodeType !== processDesignConstant.NODE_TYPE.LINE &&
        node[key].nodeType !== processDesignConstant.NODE_TYPE.SELF_LINE &&
        node[key].nodeType !== processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE) {
        var cellNode = {};
        cellNode['-id'] = node[key].id ? node[key].id : '';
        cellNode['-parent'] = '1';
        cellNode['-vertex'] = node[key].vertex;
        // 去掉所有的节点title属性
        if (node[key].value.indexOf('title=') > 0) {
          node[key].value = node[key].value.replace(/title=/g, '');
        }
        // 节点直角改为圆角
        if (node[key].style.includes('rounded=0') > 0) {
          node[key].style = node[key].style.replace('rounded=0', 'rounded=1;arcSize=5;shadow=0;');
        } else {
          node[key].style =  node[key].style + 'rounded=1;arcSize=5;shadow=0;';
        }
        // 获取getviewprocess中节点的displayname
        let actNameMessage = getCurName(ViewProcess, node[key].nodeName);
        actNameMessage = window.flowI18n.handerlNodeLabel(actNameMessage);
        // 设置节点显示的审批人
        const nodeaValueHtm = curNodePeople(node[key].nodeName, approvalData);
        // 把符合条件的节点标题改为系统节点
        if (systemNodeType.includes(node[key].nodeType) && node[key].value) {
          var nodeValue = node[key].value.substring(0, node[key].value.indexOf('class="k2-node-container"'));
          nodeValue = nodeValue.replace(node[key].nodeName, '系统节点') + 'class="k2-node-container">' + nodeaValueHtm;
          node[key].value = nodeValue;
        } else {
          if (!fixNodeType.includes(node[key].nodeType)&& node[key].value) {
            // 特殊显示（华润：除去系统节点（开始，结束，网关，其他的节点显示displayname））
            const valueStr = '<p class="k2-node-title" id=' + node[key].nodeName + '>'+
                  '<span style="background:transparent url('+ window.processDesignConstant.NODE_ICON[node[key].nodeType] + ') no-repeat left center;">'+ 
                  actNameMessage + '</span>'+
                  '</p>'+
                  '<ul class="k2-node-container">'+ nodeaValueHtm +'</ul>';
            node[key].value = valueStr;
          }
        }
        // 处理以前数据中value含有#6a9cf4颜色的节点
        if (node[key].value && node[key].value.indexOf('#6a9cf4') >= 0) {
          cellNode['-value'] = node[key].value.replace(/#6a9cf4/g, '#003865');
        }else{
          cellNode['-value'] = node[key].value;
        }
        // 修复重新提交节点icon丢失的问题
        if(node[key].value && node[key].value.indexOf('url(undefined)') >= 0){
          node[key].value = node[key].value.replace('url(undefined)', 'url(stencils/clipart/recall.png)');
        }
        //
        if (node[key].style && node[key].style.indexOf('shape=mxgraph.flowchart.process;') >= 0) {
          cellNode['-style'] = node[key].style.replace('shape=mxgraph.flowchart.process;', '');
        } else {
          cellNode['-style'] = node[key].style;
        }
        //  处理以前数据中style含有#6a9cf4颜色的节点
        if (node[key].style && node[key].style.indexOf('#6a9cf4') >= 0) {
          cellNode['-style'] = node[key].style.replace(/#6a9cf4/g, '#003865');
        }else{
          cellNode['-style'] = node[key].style;
        }
        // 处理以前数据中style中没有边框的数据
        if (node[key].style && node[key].style.indexOf('strokeColor=transparent') >= 0) {
          cellNode['-style'] = node[key].style.replace(/strokeColor=transparent/g, 'strokeColor=#bababa');
        } else {
          cellNode['-style'] = node[key].style;
        }
        // 去掉边框
        if (cellNode['-style'].includes('strokeColor=#bababa') > 0) {
          cellNode['-style'] = cellNode['-style'].replace('strokeColor=#bababa', 'strokeColor=transparent');
        }
        // 默认都为未执行的颜色
        cellNode['-value'] = node[key].value.replace(/#003865/g, color.notPass);
        cellNode['-value'] = cellNode['-value'].slice(0, cellNode['-value'].indexOf('style=')) + 'id=\''+ node[key].nodeName + '\' '+ cellNode['-value'].slice(cellNode['-value'].indexOf('style='));
        // 修改流程结束和Start节点的文本
        if(node[key].id === 'start') {
          node[key].value = node[key].value.replace('Start', '开始');
        }
        if (node[key].id === 'end') {
          node[key].value = node[key].value.replace('流程结束', '结束');
        }
        // 与K2返回的数据做合并，标识节点的颜色
        for(var k = 0; k < ViewProcess.ViewProcess.Process.Acts.Act.length; k++){
          var activity = passActivity(ViewProcess, node[key].nodeName);
          if (activity != null) {
            if (activity.Status == 2) {
              //当前环节颜色
              if (node[key].id === 'start' || node[key].id === 'end') {
                if (node[key].id === 'end') {
                  node[key].value = node[key].value.replace('padding:0 0 0 18px', 'padding:0;height:39px;line-height:39px;color:#fff;text-align:center;width:150px;margin-top:-4px');
                  node[key].value = node[key].value.replace('left', '20px');
                } else {
                  node[key].value = node[key].value.replace('padding:0 0 0 14px', 'padding:0;height:39px;line-height:39px;color:#fff;text-align:center;width:150px;margin-top:-4px');
                  node[key].value = node[key].value.replace('left', '30px');
                }
                cellNode['-value'] = node[key].value.slice(0, node[key].value.indexOf('url(')) + color.current + ' ' +  node[key].value.slice(node[key].value.indexOf('url('));
                cellNode['-style'] = node[key].style.replace(/#003865/g, color.current);
              } else {
                cellNode['-value'] = node[key].value.replace(/#003865/g, color.current);
              }
              //
              cellNode['-value'] = cellNode['-value'].slice(0, cellNode['-value'].indexOf('style=')) + 'id=\''+ node[key].nodeName + '\' '+ cellNode['-value'].slice(cellNode['-value'].indexOf('style='));
              cellNode['-style'] = cellNode['-style'].replace('#bababa', color.current);
            } else if (activity.Status == 6) {
              //错误样式
              cellNode['-value'] = node[key].value.replace(/#003865/g, color.current);
              cellNode['-value'] = cellNode['-value'].slice(0, cellNode['-value'].indexOf('style=')) + 'id=\''+ node[key].nodeName + '\' '+ cellNode['-value'].slice(cellNode['-value'].indexOf('style='));
              cellNode['-style'] = cellNode['-style'].replace('#bababa', color.current);
            } else {
              //执行完毕的颜色
              if (node[key].id === 'start' || node[key].id === 'end') {
                if (node[key].id === 'end') {
                  node[key].value = node[key].value.replace('padding:0 0 0 18px', 'padding:0;height:39px;line-height:39px;color:#fff;text-align:center;width:150px;margin-top:-4px');
                  node[key].value = node[key].value.replace('left', '20px');
                } else {
                  node[key].value = node[key].value.replace('padding:0 0 0 14px', 'padding:0;height:39px;line-height:39px;color:#fff;text-align:center;width:150px;margin-top:-4px');
                  node[key].value = node[key].value.replace('left', '30px');
                }
                cellNode['-value'] = node[key].value.slice(0, node[key].value.indexOf('url(')) + color.pass + ' ' +  node[key].value.slice(node[key].value.indexOf('url('));
                cellNode['-style'] = node[key].style.replace(/#003865/g, color.pass);
              } else {
                cellNode['-value'] = node[key].value.replace(/#003865/g, color.pass);
              }
              //
              cellNode['-value'] = cellNode['-value'].slice(0, cellNode['-value'].indexOf('style=')) + 'id=\''+ node[key].nodeName + '\' '+ cellNode['-value'].slice(cellNode['-value'].indexOf('style='));
              cellNode['-style'] = cellNode['-style'].replace('#bababa', color.pass);
            }
            break;
          } else {
            if (node[key].id === 'start' || node[key].id === 'end') {
              if (node[key].id === 'end') {
                node[key].value = node[key].value.replace('padding:0 0 0 18px', 'padding:0;height:39px;line-height:39px;color:#fff;text-align:center;width:150px;margin-top:-4px');
                node[key].value = node[key].value.replace('left', '20px');
              } else {
                node[key].value = node[key].value.replace('padding:0 0 0 14px', 'padding:0;height:39px;line-height:39px;color:#fff;text-align:center;width:150px;margin-top:-4px');
                node[key].value = node[key].value.replace('left', '30px');
              }
              cellNode['-value'] = node[key].value.slice(0, node[key].value.indexOf('url(')) + color.notPass + ' ' +  node[key].value.slice(node[key].value.indexOf('url('));
              cellNode['-style'] = node[key].style.replace(/#003865/g, color.notPass);
            }
          }
        }
        cellNode['-nodeType'] = node[key].nodeType;
        cellNode['-nodeName'] = node[key].nodeName;
        cellNode['-connectable'] = node[key].connectable;
        cellNode['mxGeometry'] = {
          '-x': node[key].geometry && node[key].geometry.x ? node[key].geometry.x : 0,
          '-y': node[key].geometry && node[key].geometry.y ? node[key].geometry.y : 0,
          '-width': node[key].geometry && node[key].geometry.width ? node[key].geometry.width : 0,
          '-height': node[key].geometry && node[key].geometry.height ? node[key].geometry.height : 0,
          '-as': 'geometry',
          '-TRANSLATE_CONTROL_POINTS': node[key].geometry.TRANSLATE_CONTROL_POINTS || true
        };
        //
        cellData.push(cellNode);
      } else {
        var cell = {};
        cell['-id'] = node[key].id;
        cell['-parent'] = '1';
        // 去掉线标签
        cell['-value'] = getLineValueByKey(key,node[key].value);
        cell['-source'] = node[key].source ? node[key].source.id : null;
        cell['-target'] = node[key].target ? node[key].target.id : null;
        cell['-edge'] = true;
        if (node[key].style && node[key].style.indexOf('edgeStyle') === -1) {
          cell['-style'] = 'edgeStyle=orthogonalEdgeStyle;rounded=0;' + node[key].style;
        } else {
          cell['-style'] = node[key].style;
        }
        cell['-style'] = cell['-style'].replace('strokeColor=#bababa','strokeColor=' + connectorPaintStyle.stroke);
        // 线定位与label 定位
        var lineInst = null;
        for (var k = 0; k < ViewProcess.ViewProcess.Process.Lines.Line.length; k++) {
          var name = ViewProcess.ViewProcess.Process.Lines.Line[k].Name;
          var id = name.slice(name.indexOf('_') + 1);
          if (id === node[key].id) {
            lineInst = passLine(ViewProcess, name);
            break;
          }
        }

        if (lineInst != null) {
          if (lineInst.Result === '2') {
            // _sourceEndpoint.connectorStyle = notPassConnectorPaintStyle;
            cell['-style'] = cell['-style'].replace('strokeColor=rgba(30, 83, 39, 1)','strokeColor=' + notPassConnectorPaintStyle.stroke);
          } else {
            // _sourceEndpoint.connectorStyle = passConnectorPaintStyle;
            cell['-style'] = cell['-style'].replace('strokeColor=rgba(30, 83, 39, 1)','strokeColor=' + passConnectorPaintStyle.stroke);
          }
        }

        cell['-nodeType'] = node[key].nodeType;
        cell['mxGeometry'] = {
          '-as': 'geometry',
          '-relative': '1',
          'Array': []
        };

        if (node[key].geometry.points) {
          var points = {
            '-as': 'points',
            'mxPoint': []
          };

          for (var j = 0; j < node[key].geometry.points.length; j++) {
            points.mxPoint.push({
              '-x': node[key].geometry.points[j] ? node[key].geometry.points[j].x : '',
              '-y': node[key].geometry.points[j] ? node[key].geometry.points[j].y : ''
            });
          }

          cell['mxGeometry']['Array'].push(points);
        }

        if (node[key].geometry.abspoints) {
          var abspoints = {
            '-as': 'abspoints',
            'mxPoint': []
          };

          for (var i = 0; i < node[key].geometry.abspoints.length; i++) {
            abspoints.mxPoint.push({
              '-x': node[key].geometry.abspoints[i] ? node[key].geometry.abspoints[i].x : '',
              '-y': node[key].geometry.abspoints[i] ?  node[key].geometry.abspoints[i].y : ''
            });
          }

          cell['mxGeometry']['Array'].push(abspoints);
        }
        //
        cellData.push(cell);
      }
    }
  }
  var head = [{'-id': '0'}, {'-id': '1', '-parent': '0'}];
  var cells = head.concat(cellData);

  return {
    'mxGraphModel': {
      'root': {
        'mxCell': cells
      }
    }
  };
}
// 获取节点的dispalyname
function getCurName (viewProcess, activityName) {
  var curNodeName = '';
  viewProcess.ViewProcess.Process.Acts.Act.forEach((item, i) => {
    if (item.Act == activityName) {
      curNodeName = item.DisplayName;
    }
  });
  return curNodeName;
}
// 是否走过该环节
function passActivity (viewProcess, activityName) {
  var activtiy = [];
  viewProcess.ViewProcess.ActInsts.ActInst.forEach((act, i) => {
    if (act.ActName == activityName && (act.Status == '4' || act.Status == '2' || act.Status == '6')) {
      activtiy.push(act);
    }
  });
  // 取时间在后面的一个
  activtiy.sort(function(a,b) {
    var aStartDate = new Date(a.StartDate).getTime();
    var bStartDate = new Date(b.StartDate).getTime();
    return aStartDate - bStartDate;
  });
  return activtiy.pop();
}
function passLine (viewProcess, lineName) {
  var lineInst = [];
  viewProcess.ViewProcess.LineInsts.LineInst.forEach((line, i) => {
    if (line.LineName == lineName) {
      lineInst.push(line);
    }
  });
  // 取时间在后面的一个
  lineInst.sort(function(a,b) {
    var aInstId = parseInt(a.LineInstID);
    var bInstId  = parseInt(b.LineInstID);

    return aInstId - bInstId;
  });
  return lineInst.pop();
}
export{
  parseJson,
  parseFlowChartJson,
  createXml,
  json_to_xml
};
