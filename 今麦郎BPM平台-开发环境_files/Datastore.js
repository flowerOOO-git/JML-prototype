/*此文件提供流程设计器中数据的增删改查方法*/
function DataStore(data) {
  // 当节点被选中时 键盘事件会被触发两次，所以在此通过时间戳判断，以防键盘的重复事件
  // 添加一个时间戳变量
  this.KeyHandlerTimeStamp = null;
  // 定义总共可以撤销和重做的步数
  this.allStep = 20;
  // 撤销步数
  this.index = -1;
  // 重做步数
  this.redoIndex = 0;
  // 撤销数据
  this.stack = [];
  // 重做数据
  this.redoStackList = [];
  this.currData = data;
  this.addStack();
  // 目前是否超出定义的撤销重做总步数
  this.undoOverStep = false;
  // 操作左侧菜单数据，也会进endupdata 但是不需要，所以不给塞入数据
  this.isChangeSidebar = false;
  // 直接在画布上 对节点做配置 打开弹框后 画布不许撤销 和 恢复
  this.isNodeOpenDia = false;
}
/*左侧菜单数据*/
DataStore.prototype.isChangeSidebar = false;

/*当前流程所有的数据的长度*/
DataStore.prototype.length = null;

/*当前流程所有的数据*/
DataStore.prototype.stack = null;

/*当前数据的版本号*/
DataStore.prototype.index = null;

/*当前版本的数据*/
DataStore.prototype.currData = null;

/*入栈*/
DataStore.prototype.addStack = function () {
  this.length = this.stack.push(this.currData);
  this.index++;
  this.popVersion();
};
// yuminghao撤销处理
/*节点上的弹框 关闭处理*/
DataStore.prototype.nodeHideDia = function () {
  this.isNodeOpenDia = false;
  // 当弹框是appendbody时，弹框关闭后，鼠标对于画布是失焦状态，手动给画布焦点，不影响直接关闭画布后的撤销和反撤销动作
  let dom = document.getElementById('geDiagramContainer-driver');
  if(dom){
    dom.focus();
  }
};

DataStore.prototype.nodeMsg = null;

/**
 * @FunctionName: 撤销与重做
 * @Author: mhyu
 * @Date: 2022-06-24 10:17:43
/**
 * 做法：
 * 1.任何新动作都塞入数据到stack(可撤销)数组，新发起和老流程stack中都会有两条数据，所以我们定义默认index(撤销步数)为-1，当完成加载后stack的长度为2，index为1
 * 2.当执行撤销动作，index--,将当前的画布数据(也是stack的最后一位数据)塞入redoStackList重做数组， redoIndex(重做步数)++
 *    取stack的倒数第二位数据塞到画布，并删除stack的最后一位数据。
 * 3.当执行重做动作，redoIndex--,将redoStackList的最后一位数据塞入画布，并把redoStackList的最后一位数据还原到stack，之后删除redoStackList的最后一位数据。
 * 4.当执行撤销和重做后，又开启了新的动作，我们默认把重做清空，开始新的一轮。
 * 5.这里还有一个步数限制，当stack数据超出步数，我们前删后增。
 * 6.【stack的最后一条数据一定是当前画布数据，默认index一定比stack的长度少一位(数组从0开始，所以其实stack[index]为stack的最后一位数据)】
 *   【redoStackList是撤销的数据塞入，默认redoIndex一定比redoStackList的长度少一位】
 * 7.撤销和重做 其实只是数据在两个数组中的流转而已
 */
/** 缓存历史数据(撤销数据) */
DataStore.prototype.cacheHistory = function (isredo=false) {
  const data = this.deepClone(this.currData);
  // 如果等于定义的总步数 删除第一条后再塞入
  if(this.allStep === this.stack.length){
    this.undoOverStep = true;
    this.stack.splice(0,1);
  }
  this.stack.push(data);
  this.stack = JSON.parse(JSON.stringify(this.stack));
  // 撤销index默认比length少一位  stack的最后一位数据 是当前画布数据
  this.index = this.stack.length - 1;
  this.length = this.stack.length;
  // 如果是新的操作 重置 重做数据
  if(!isredo){
    this.redoStackList = [];
    this.redoIndex = 0;
  }
};
/** 缓存重做数据 */
DataStore.prototype.setRedoStack = function () {
  const setData = this.deepClone(this.currData);
  this.redoStackList.push(setData);
  this.redoStackList = JSON.parse(JSON.stringify(this.redoStackList));
  this.redoIndex++;
};

/*重做*/
DataStore.prototype.redoStack = function () {
  // 隐藏画布上的pop
  hidePop();
  // 直接在画布上 对节点做配置 打开弹框后 画布不许撤销 和 恢复
  if(this.isNodeOpenDia){
    FLOWINSTANCE.editorUi.editor.graph.isredo = false;
    return;
  }
  this.redoIndex--;
  if (this.redoIndex >= 0 && this.redoIndex < this.redoStackList.length) {
    // 记录ui是否可以重做
    FLOWINSTANCE.editorUi.editor.graph.isredo = true;
    const graph = FLOWINSTANCE.editorUi.editor.graph;
    graph.getModel().beginUpdate();
    try {
      const data = this.deepClone(this.redoStackList[this.redoIndex]);
      // 从重做数组中删除当前数据
      this.redoStackList.splice(this.redoIndex, 1);
      // 取消选中效果
      graph.clearSelection();
      this.setChartNodeData(data.workflow.activitysData);
      this.setCurrData(data,false);
      // 重做完成后 把当前画布数据 放入撤回数组
      this.cacheHistory(true);
      graph.view.refresh();
    }finally {
      graph.getModel().endUpdate();
      FLOWINSTANCE.$notify({
        type: 'success',
        message: window.flowI18n.$t('flowDesigner.dataStore.tip1'),
        duration:1500
      });
    }
    // return this.getCurrData();
  } else {
    this.redoIndex++;
    // 记录ui是否可以重做
    FLOWINSTANCE.editorUi.editor.graph.isredo = false;
    FLOWINSTANCE.$notify({
      type: 'warning',
      message: window.flowI18n.$t('flowDesigner.dataStore.tip2'),
      duration:1500
    });
  }
};

/*撤销*/
DataStore.prototype.undoStack = function () {
  // 隐藏画布上的pop
  hidePop();
  // 直接在画布上 对节点做配置 打开弹框后 画布不许撤销 和 恢复
  if(this.isNodeOpenDia){
    FLOWINSTANCE.editorUi.editor.graph.isundo = false;
    return;
  }
  this.index--;
  let compareValue = this.undoOverStep ? 0 : 1;
  if (this.index >= compareValue && this.index < this.stack.length) {
    const graph = FLOWINSTANCE.editorUi.editor.graph;
    // 记录ui是否可以撤销
    FLOWINSTANCE.editorUi.editor.graph.isundo = true;
    graph.getModel().beginUpdate();
    try {
      const data = this.deepClone(this.stack[this.index]);
      // 撤销前 把当前画布数据塞入到重做数组，给ctrl+Y的时候用
      this.setRedoStack();
      // 从撤回数组中删除当前数据
      this.stack.splice(this.index+1, 1);
      // 取消选中效果
      graph.clearSelection();
      this.setChartNodeData(data.workflow.activitysData);
      this.setCurrData(data,false);
      graph.view.refresh();
    }finally {
      graph.getModel().endUpdate();
        
      FLOWINSTANCE.$notify({
        type: 'success',
        message: window.flowI18n.$t('flowDesigner.dataStore.tip3'),
        duration:1500
      });
    }
  } else {
    this.index++;
    // 记录ui是否可以撤销
    FLOWINSTANCE.editorUi.editor.graph.isundo = false;
    FLOWINSTANCE.$notify({
      type: 'warning',
      message: window.flowI18n.$t('flowDesigner.dataStore.tip4'),
      duration:1500
    });
  }
};

/*出栈，redo版本后操作数据，将栈顶至数组长度的数据删除*/
DataStore.prototype.popVersion = function () {
  this.stack.splice(this.index, this.length - (this.index + 1));
};

/**
 * 新增节点数据
 * @param cell 节点数据
 * @param isEdge 是否是线
 */
DataStore.prototype.setData = function (cell,isEdge) {
  if (!cell) return;

  var nodes = [];

  if (isEdge) {
    nodes = this.currData.workflow.processData.lineRuleObjList;
  } else {
    nodes = this.currData.workflow.activitysData;
  }
  // 增加数据前，检测是否存在此条数据，如果存在则替换相应的属性
  if (nodes && nodes.length > 0) {
    for (var i = 0; i < nodes.length; i++) {
      var node = isEdge ? nodes[i] : nodes[i].activityInfo;
      var item = isEdge ? cell : cell.activityInfo;
      if (node.id === item.id) {
        for (var key in cell) {
          if (cell.hasOwnProperty(key)) {
            nodes[i][key] = cell[key];
          }
        }

        return;
      }
    }
  }
  //
  nodes.push(cell);
};

/*获取指定id的节点数据*/
DataStore.prototype.getData = function (cell) {
  if (!cell) return;

  var nodes = [];
  var returnValue = null;
  var isEdge = false;


  if (cell && cell.nodeType !== processDesignConstant.NODE_TYPE.LINE &&
    cell.nodeType !== processDesignConstant.NODE_TYPE.SELF_LINE &&
    cell.nodeType !== processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE) {
    nodes = this.currData.workflow.activitysData;
  } else {
    nodes = this.currData.workflow.processData.lineRuleObjList;
    isEdge = true;
  }

  if (nodes && nodes.length > 0) {
    for (var i = 0; i < nodes.length; i++) {
      var node = isEdge ? nodes[i] : nodes[i].activityInfo;
      if (node.id === cell.id) {
        returnValue = nodes[i];
      }
    }
  }
  //
  return returnValue;
};
/*删除数据*/
DataStore.prototype.deleteData = function (cell) {
  if (!cell) return;
  var nodes = [];
  var isEdge = false;
  if (cell && cell.nodeType !== processDesignConstant.NODE_TYPE.LINE &&
    cell.nodeType !== processDesignConstant.NODE_TYPE.SELF_LINE &&
    cell.nodeType !== processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE) {
    nodes = this.currData.workflow.activitysData || [];
  } else {
    nodes = this.currData.workflow.processData.lineRuleObjList || [];
    isEdge = true;
  }
  if (nodes.length > 0) {
    for (var i = 0; i < nodes.length; i++) {
      var node = isEdge ? nodes[i] : nodes[i].activityInfo;
      if (node.id === cell.id) {
        nodes.splice(i, 1);
        // 删除节点 同时 删除总分总 关系
        if (!isEdge && node.relationNode) {
          this.deleteRelationNode(nodes, node.relationNode.id);
        }
        break;
      }
    }
  }
};

/** 删除总分总节点对应关系 */
DataStore.prototype.deleteRelationNode = function (nodes, id) {
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i].activityInfo;
    if (node.id === id) {
      node.relationNode = null;
    }
  }
};

/*获取当前流程的数据*/
DataStore.prototype.getCurrData = function () {
  return this.stack[this.index];
};

/*设置当前流程的数据*/
DataStore.prototype.setCurrData = function (data,reset) {
  if(reset == undefined){
    reset = true;
  }
  this.currData = data;
  if(reset){
    this.index = -1;
    this.stack = [];
    this.undoOverStep = false;
    this.addStack();
  }
};
/*处理画布数据上的 nodeName 和数据匹配上*/
DataStore.prototype.setChartNodeData = function (data) {
  const graph = FLOWINSTANCE.editorUi.editor.graph;
  let cellsData = graph.model.cells;
  for (const key in cellsData) {
    if (key === '0' || key === '1') {
      continue;
    }
    if (cellsData.hasOwnProperty(key)) {
      // 节点
      if (cellsData[key].nodeType !== processDesignConstant.NODE_TYPE.LINE &&
        cellsData[key].nodeType !== processDesignConstant.NODE_TYPE.SELF_LINE &&
        cellsData[key].nodeType !== processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE) {
        let nodeId = cellsData[key].id;
        let nodeData = data.find(n=> n.activityInfo && n.activityInfo.id === nodeId);
        if(nodeData && nodeData.activityInfo.id){
          cellsData[key].nodeName = nodeData.activityInfo.activityName;
        }
      }
    }
   
  }

  
};

/*检查数据的类型*/
DataStore.prototype.checkType = function (obj, type) {
  return Object.prototype.toString.call(obj).toLowerCase().indexOf(type) > -1;
};

DataStore.prototype.checkEmpty = function (obj) {
  return JSON.stringify(obj) === '{}';
};

DataStore.prototype.newArray = function (arr) {
  var result = [];
  if (!this.checkType(arr, 'array')) {
    result.push(arr);
  } else {
    for (var i = 0; i < arr.length; i++) {
      result.push(arr[i]);
    }
  }
  return result;
};
/**
 *
 * @param data 流程属性数据
 */
DataStore.prototype.setProcessProperty = function (data) {
  var processData = this.currData.workflow.processData;

  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      processData[key] = data[key];
    }
  }
};
/**
 *
 * @returns {null} 返回流程属性
 */
DataStore.prototype.getProcessProperty = function () {
  var resultData = {};
  var processData = this.currData.workflow.processData || {};

  for (var key in processData) {
    if (processData.hasOwnProperty(key)) {
      resultData[key] = processData[key];
    }
  }

  return resultData;
};
/**
 * @param nodeType 节点类型
 * @param id 存储节点的id
 * @param data 存储的业务数据
 */
DataStore.prototype.setDataById = function (nodeType, id, data) {
  if (nodeType && id) {
    var items = [];
    var isEdge = false;

    if (nodeType === processDesignConstant.NODE_TYPE.LINE ||
      nodeType === processDesignConstant.NODE_TYPE.SELF_LINE ||
      nodeType === processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE) {
      items = this.currData.workflow.processData.lineRuleObjList || [];
      isEdge = true;
    } else {
      items = this.currData.workflow.activitysData || [];
    }

    for (var i = 0; i < items.length; i++) {
      var item = isEdge ? items[i] : items[i].activityInfo;
      if (item && item.id === id) {
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            items[i][key] = data[key];
          }
        }
      }
    }
  } else {
    alert('节点的id和nodeType为空');
  }
};
/**
 * @param nodeType 节点类型
 * @param id 要获取的节点数据的id
 */
DataStore.prototype.getDataById = function (nodeType, id) {
  var items = [];
  var result = {};
  var isEdge = false;

  if (nodeType && nodeType === processDesignConstant.NODE_TYPE.LINE ||
    nodeType === processDesignConstant.NODE_TYPE.SELF_LINE ||
    nodeType === processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE) {
    items = this.currData.workflow.processData.lineRuleObjList || [];
    isEdge = true;
  } else {
    items = this.currData.workflow.activitysData || [];
  }

  if (items.length > 0) {
    for (var i = 0; i < items.length; i++) {
      var item = isEdge ? items[i] : items[i].activityInfo;
      if (item && item.id === id) {
        for (var key in items[i]) {
          if (items[i].hasOwnProperty(key)) {
            result[key] = items[i][key];
          }
        }
        return result;
      }
    }
  } else {
    return null;
  }
};
/**
 *
 * @param key  想要获取的数据字段名
 * @returns {*} 返回字段为key的value
 */
DataStore.prototype.getDataByKey = function(key){
  var processData = this.currData.workflow.processData;
  var result = null;

  if (key && processData[key]) {
    result = processData[key];
  }

  return result;
};
/**
 *
 * @param node 当前节点
 * @param cycleType 审批的类型：循环|0，矩阵|1，自由流|3
 * @param virData 虚拟节点数据
 */
DataStore.prototype.setVirActDataById = function (node, cycleType, virData, matrixId) {
  var nodeData = this.getDataById(node.activityInfo.nodeType, node.activityInfo.id);
  var virActData = nodeData.candidates.activityDestMatrix;

  for (var j = 0; j < virActData.length; j++) {
    if (virActData[j].id === matrixId) {
      //矩阵审批的场景中虚拟节点有可能为空,增加校验
      if(null==virActData[j].virtActList) continue;

      for (var k = 0; k < virActData[j].virtActList.length; k++) {
        // 
        if (virActData[j].virtActList[k].activityInfo.virActId) {
          if(virActData[j].virtActList[k].activityInfo.virActId === virData.activityInfo.virActId){
            virActData[j].virtActList[k] = virData;
          }
        }else{
          if(virActData[j].virtActList[k].activityInfo.id && virActData[j].virtActList[k].activityInfo.id === virData.activityInfo.id){
            virActData[j].virtActList[k] = virData;
          }
        }
      }
    }
  }
};
/**
 *
 * @param node  当前节点
 * @param cycleType 审批的类型：循环|0，矩阵|1，自由流|3
 * @param virId 虚拟节点的id
 * @returns {*}
 */
DataStore.prototype.getVirActDataById = function (node, cycleType, virActId, matrixId) {
  var nodeData = this.getDataById(node.activityInfo.nodeType, node.activityInfo.id);
  var virActData = nodeData.candidates.activityDestMatrix;
  var result = null;
  var returnValue = {};

  for (var j = 0; j < virActData.length; j++) {
    if (virActData[j].id === matrixId) {
      //矩阵审批的场景中虚拟节点有可能为空,增加校验
      if(null==virActData[j].virtActList) continue;
      for (var k = 0; k < virActData[j].virtActList.length; k++) {
        if (virActData[j].virtActList[k].activityInfo.virActId === virActId) {
          result = virActData[j].virtActList[k];
          break;
        }
      }
    }
  }

  //
  for(var key in result){
    if (result.hasOwnProperty(key)) {
      returnValue[key] = result[key];
    }
  }

  return returnValue;
};
/**
 *
 * @param node 当前节点数据
 * @returns {boolean} 返回值;存在重复现象返回true，否则返回false;
 */
DataStore.prototype.checkNameIsRepeat = function (node) {
  var items = [];
  var result = false;
  var name =null;
  var isEdge = false;

  if (node.nodeType && node.nodeType === processDesignConstant.NODE_TYPE.LINE ||
    node.nodeType === processDesignConstant.NODE_TYPE.SELF_LINE ||
    node.nodeType === processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE) {
    items = this.currData.workflow.processData.lineRuleObjList;
    name = 'lineName';
    isEdge = true;
  } else {
    items = this.currData.workflow.activitysData;
    name = 'activityName';
  }

  for (var i = 0; i < items.length; i++) {
    var item = isEdge ? items[i] : items[i].activityInfo;
    if (item && node.id !== item.id) {
      if (node[name] === items[i].activityInfo[name]) {
        result = true;
        break;
      }
    }
  }

  return result;
};
// 深拷贝处理
DataStore.prototype.deepClone = function (initalObj, finalObj) {
  var obj = finalObj || {};
  for (var i in initalObj) {
    // 避免相互引用对象导致死循环，如initalObj.a = initalObj的情况
    var prop = initalObj[i];
    if(prop === obj) {
      continue;
    }
    // typeof null 也是object
    if (typeof prop === 'object' && prop !== null) {
      obj[i] = Array.isArray(prop) ? [] : {};
      this.deepClone(prop, obj[i]);
    } else {
      obj[i] = prop;
    }
  }
  return obj;
};
/**
 * @FunctionName: 节点配置的时候会有pop存在的情况，当撤销或者重做的时候，
 * 我会让节点失去选中状态。所以在此时再去点pop就会报错。所以在撤销或者重做的时候直接把pop隐藏
 * @Author: mhyu
 * @param {*}
 * @return {*}
 * @Date: 2022-06-30 17:13:48
 * @Description: 
 */
function hidePop(){
  let doms = document.getElementsByClassName('node-process-event-pop');
  for(let item of doms){
    item.style.display = 'none';
  }
}