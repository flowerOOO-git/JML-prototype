mxConstants.DEFAULT_IMAGESIZE = '10';
mxConstants.STYLE_SPACING = '20';
// 重写mxGraph的moveCells方法；新增节点时会触发
mxGraph.prototype.moveCells = function (cells, dx, dy, clone, target, evt, mapping) {
  // 存复制节点数据
  let nodeObj = null;
  var mxModel = this.model;
  if (clone === true && target) {
    let modelCell = FLOWINSTANCE.editorUi.editor.graph.selectionModel.cells.length ? FLOWINSTANCE.editorUi.editor.graph.selectionModel.cells[0] : FLOWINSTANCE['copyCell'];
    if (modelCell) {
      nodeObj = window.FLOWSTOREDATA.getDataById(cells[0].nodeType, modelCell.id);
      nodeObj = JSON.parse(JSON.stringify(nodeObj));
    }
  }
  // clone = true 新增|复制 节点, target=null 新增 target 有值 复制节点
  // clone = false  移动节点
  dx = (dx != null) ? dx : 0;
  dy = (dy != null) ? dy : 0;
  clone = (clone != null) ? clone : false;
  // 如果移动的是线，则不让移动
  if (cells !== null) {
    // FROM_LOOP_NODE_LINE=98(以循环节点为起始点的线类型)
    // LINE=99(普通的线类型）
    // SELF_LINE=100(循环节点，TOA节点自带的自循环线类型)
    // for (let k = 0; k < cells.length; k++) {
    //   if (cells[k].nodeType === processDesignConstant.NODE_TYPE.SELF_LINE ||
    //     cells[k].nodeType === processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE ||
    //     cells[k].nodeType === processDesignConstant.NODE_TYPE.LINE) {
    //     return;
    //   }
    // }
    // 审批节点 6
    if (window.NODE_TYPE_STYLE) {
      for (let j = 0; j < cells.length; j++) {
        // 审批节点
        if (cells[j].nodeType === 6 && (cells[j].nodeName == '客户端' || cells[j].nodeName == 'Client')) {
          cells[j].nodeName = window.flowI18n.$t('flowDesigner.activityName.approval');
        }
      }
    }
  }

  if (cells != null && (dx != 0 || dy != 0 || clone || target != null)) {
    // Removes descandants with ancestors in cells to avoid multiple moving
    cells = this.model.getTopmostCells(cells);
    this.model.beginUpdate();
    try {
      // Faster cell lookups to remove relative edge labels with selected
      // terminals to avoid explicit and implicit move at same time
      var dict = new mxDictionary();
      for (var i = 0; i < cells.length; i++) {
        dict.put(cells[i], true);
      }
      var isSelected = mxUtils.bind(this, function (cell) {
        while (cell != null) {
          if (dict.get(cell)) {
            return true;
          }

          cell = this.model.getParent(cell);
        }

        return false;
      });

      // Removes relative edge labels with selected terminals
      var checked = [];

      for (var i = 0; i < cells.length; i++) {
        var geo = this.getCellGeometry(cells[i]);
        var parent = this.model.getParent(cells[i]);

        if ((geo == null || !geo.relative) || !this.model.isEdge(parent) ||
          (!isSelected(this.model.getTerminal(parent, true)) &&
            !isSelected(this.model.getTerminal(parent, false)))) {
          checked.push(cells[i]);
        }
      }

      cells = checked;

      if (clone) {
        cells = this.cloneCells(cells, this.isCloneInvalidEdges(), mapping);

        if (target == null) {
          target = this.getDefaultParent();
        }
      }

      // FIXME:单元格应该总是在任何其他编辑之前插入
      // 避免会话中的前向引用。
      // 如果目标不为空，需要禁用allownegativcoordinates
      // 允许临时的负数，直到cellsAdded被调用。
      var previous = this.isAllowNegativeCoordinates();

      if (target != null) {
        this.setAllowNegativeCoordinates(true);
      }

      this.cellsMoved(cells, dx, dy, !clone && this.isDisconnectOnMove()
        && this.isAllowDanglingEdges(), target == null, this.isExtendParentsOnMove() && target == null);

      this.setAllowNegativeCoordinates(previous);

      if (target != null) {
        var index = this.model.getChildCount(target);
        for (var j = 0; j < cells.length; j++) {
          // 检查是否有重名的cell
          var name = processDesignUtils.getDuplicateNameOfNode(cells[j].nodeName);

          if (name) {
            cells[j].value = cells[j].value.replace(cells[j].nodeName, name);
            cells[j].nodeName = name;
          }
        }

        this.cellsAdded(cells, target, index, null, null, true);

        // 新增的节点如果是自循、TOA、迭代、瀑布节点，添加循环线
        for (var k = 0; k < cells.length; k++) {
          if (cells[k].nodeType === processDesignConstant.NODE_TYPE.TOA
            || cells[k].nodeType === processDesignConstant.NODE_TYPE.SELF_LOOP
            || cells[k].nodeType === processDesignConstant.NODE_TYPE.ITERATION
            || cells[k].nodeType === processDesignConstant.NODE_TYPE.WATERFALL) {
            this.getModel().beginUpdate();
            try {
              var style = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#979AA3;entryX=1;entryY=0.5;entryPerimeter=0;jettySize=auto;orthogonalLoop=1;';
              var edge = this.insertEdge(this.getDefaultParent(), cells[k].nodeName, '', cells[k], cells[k], style);
              var startPt, pt1, pt2, pt3, endPt, geo = edge.geometry;
              startPt = new mxPoint(edge.source.geometry.x + edge.source.geometry.width, edge.source.geometry.y + (edge.source.geometry.height / 2));
              pt1 = new mxPoint(edge.source.geometry.x + edge.source.geometry.width + 20, edge.source.geometry.y + (edge.source.geometry.height / 2));
              pt2 = new mxPoint(edge.source.geometry.x + edge.source.geometry.width + 20, edge.source.geometry.y - 20);
              pt3 = new mxPoint(edge.source.geometry.x + (edge.source.geometry.width / 2), edge.source.geometry.y - 20);
              endPt = new mxPoint(edge.target.geometry.x + (edge.target.geometry.width / 2), edge.target.geometry.y);
              if (!geo.abspoints) {
                geo.abspoints = [];
              }
              geo.abspoints.push(startPt);
              geo.abspoints.push(pt1);
              geo.abspoints.push(pt2);
              geo.abspoints.push(pt3);
              geo.abspoints.push(endPt);
            } finally {
              // Updates the display
              setTimeout(function () {
                mxModel.endUpdate();
              });
            }
          }
        }
      }

      // Dispatches a move event
      this.fireEvent(new mxEventObject(mxEvent.MOVE_CELLS, 'cells', cells,
        'dx', dx, 'dy', dy, 'clone', clone, 'target', target, 'event', evt));
    } finally {
      setTimeout(function () {
        mxModel.endUpdate();
      });
    }
  }
  for (var h = 0; h < cells.length; h++) {
    const cell = cells[h];
    cell.nodeName = window.flowI18n.handerlNodeLabel(cell.nodeName);
    // 如果FLOWSTOREDATA没有这个cell则添加进去，如果存在则不处理;
    // 判断不是线：  
    // FROM_LOOP_NODE_LINE=98(以循环节点为起始点的线类型)
    // LINE=99(普通的线类型）
    // SELF_LINE=100(循环节点，TOA节点自带的自循环线类型)
    if (window.FLOWSTOREDATA && !window.FLOWSTOREDATA.getData(cell)
      && cell.nodeType !== processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE
      && cell.nodeType !== processDesignConstant.NODE_TYPE.LINE
      && cell.nodeType !== processDesignConstant.NODE_TYPE.SELF_LINE) {
      let eventConfigurationList = [];
      let nodeData = {};
      if (cell.nodeType === processDesignConstant.NODE_TYPE.CLIENT ||
        cell.nodeType === processDesignConstant.NODE_TYPE.SELF_LOOP ||
        cell.nodeType === processDesignConstant.NODE_TYPE.ITERATION ||
        cell.nodeType === processDesignConstant.NODE_TYPE.WATERFALL ||
        cell.nodeType === processDesignConstant.NODE_TYPE.TOA) {
        if (cell.eventConfigurationList && cell.eventConfigurationList.length) {
          eventConfigurationList = cell.eventConfigurationList;
        } else {
          eventConfigurationList.push({
            serverEvent: {
              eventName: '节点初始化',
            },
            eventName: '节点初始化',
            orderIndex: 0,
            serverEventOrder: 'Before',
            type: 'serverEvent'
          });
          eventConfigurationList.push({
            clientEvent: {
              eventName: 'clientEvent',
              // 是否启用邮件审批
              enableEmailApprove: 0,
              // 邮件模板名称
              templateName: '邮件审批默认模板',
              // 邮件模板Id
              noticeTemplateId: 'b2aa2055-4b34-4d14-ba64-9aa6ec4416a9',
            },
            eventName: 'clientEvent',
            orderIndex: 1,
            type: 'clientEvent'
          });
          eventConfigurationList.push({
            serverEvent: {
              eventName: '节点结束',
            },
            eventName: '节点结束',
            orderIndex: 2,
            serverEventOrder: 'After',
            type: 'serverEvent'
          });
        }
        let candidates = {
          activityCycleRule: {},
          activityDestMatrix: [],
          activityDestination: {},
        };
        let activityActionObjList = [{
          actionCode: null,
          actionDisplayName: 'Accept',
          actionId: '',
          actionName: 'Accept',
          actionType: 'Finish',
          defaultAction: null,
          displayName: { en: 'Accept', zh_CN: '审核通过' },
          enable: 1,
          functionId: null,
          functionRelId: null,
          mapperMethod: null,
          objectPId: null,
          orderIndex: null,
          pid: null,
          type: '标准',
        }];
        let outComeObjList = [{
          basicRule: 'All',
          displayName: { en: 'Accept', zh_CN: '审核通过' },
          objectPId: null,
          outComeName: 'Accept',
          outComeRule: null,
          outComeRuleCode: null,
          outComeRuleDesc: null,
          outComeRuleJson: '',
          outComeRuleType: null,
          pid: '',
        }];
        let activityInfo = {
          id: cell.id,
          nodeType: cell.nodeType,
          activityName: cell.nodeName,
          'displayName': {
            'en': cell.nodeName,
            'zh_CN': cell.nodeName,
          },
          // 审批方式: 0|同时, 1|一次一个
          activityApprovalMode:'0',
          // 是否启用待办提醒
          enableDotransaApprove: '0',
          // 待办提醒  模板名称
          doTransactTmpName: '待办提醒默认提醒模板',
          // 待办提醒  模板Id
          doTransactTmpId: 'b255d9d8-3b48-48ef-80d4-b29973b70ffe',
          activityType: cell.nodeType === processDesignConstant.NODE_TYPE.SELF_LOOP || cell.nodeType === processDesignConstant.NODE_TYPE.ITERATION || cell.nodeType === processDesignConstant.NODE_TYPE.WATERFALL || cell.nodeType === processDesignConstant.NODE_TYPE.TOA ? processDesignConstant.ACTIVITY_TYPE.SELF_LOOP : processDesignConstant.ACTIVITY_TYPE.STANDARD,
          activityCycleType: cell.nodeType === processDesignConstant.NODE_TYPE.SELF_LOOP || cell.nodeType === processDesignConstant.NODE_TYPE.ITERATION || cell.nodeType === processDesignConstant.NODE_TYPE.WATERFALL || cell.nodeType === processDesignConstant.NODE_TYPE.TOA ? processDesignConstant.ACTIVITY_TYPE.SELF_LOOP : processDesignConstant.ACTIVITY_TYPE.STANDARD
        };
        // window.NODE_TYPE_STYLE 判断金茂的流程设计器
        if (window.NODE_TYPE_STYLE && window.NODE_TYPE_TITLE) {
          // 金茂流程设计器 1、添加 用户节点默认 选人规则，2、只有 独立节点跟循环节点
          if (cell.nodeType === processDesignConstant.NODE_TYPE.CLIENT || cell.nodeType === processDesignConstant.NODE_TYPE.SELF_LOOP) {
            activityInfo = {
              id: cell.id,
              nodeType: cell.nodeType,
              activityName: cell.nodeName,
              'displayName': {
                'en': cell.nodeName,
                'zh_CN': cell.nodeName,
              },
              activityType: cell.nodeType === processDesignConstant.NODE_TYPE.SELF_LOOP ?
                processDesignConstant.ACTIVITY_TYPE.SELF_LOOP :
                processDesignConstant.ACTIVITY_TYPE.STANDARD,
              activityCycleType: cell.nodeType === processDesignConstant.NODE_TYPE.SELF_LOOP ?
                processDesignConstant.ACTIVITY_TYPE.SELF_LOOP :
                processDesignConstant.ACTIVITY_TYPE.STANDARD,
              approvalForm: null,
              approvalFormDesignerId: window.FLOWSTOREDATA.currData.workflow.processData.processConfigurationF04RespS01.approvalFormDesignerId,
              approvalFormDesignerInfoId: window.FLOWSTOREDATA.currData.workflow.processData.processConfigurationF04RespS01.approvalFormDesignerInfoId,
              approvalFormModel: 'approval',
              approvalFormType: '0',
              approvalLatestForm: window.FLOWSTOREDATA.currData.workflow.processData.processConfigurationF04RespS01.printLatestForm,
              printFormDesignerId: window.FLOWSTOREDATA.currData.workflow.processData.processConfigurationF04RespS01.printFormDesignerId,
              printFormDesignerInfoId: window.FLOWSTOREDATA.currData.workflow.processData.processConfigurationF04RespS01.printFormDesignerInfoId,
              printFormModel: 'print',
              printFormType: '0',
              printFormUrl: null,
              viewForm: null,
              viewFormDesignerId: window.FLOWSTOREDATA.currData.workflow.processData.processConfigurationF04RespS01.viewFormDesignerId,
              viewFormDesignerInfoId: window.FLOWSTOREDATA.currData.workflow.processData.processConfigurationF04RespS01.viewFormDesignerInfoId,
              viewFormModel: 'view',
              viewFormType: '0',
              displayName: { en: 'Approval Node', zh_CN: cell.nodeName }
            };
            candidates = {
              activityCycleRule: {
                /* 简易流程图 循环节点 cycleType 类型为3 */
                cycleType: cell.nodeType === processDesignConstant.NODE_TYPE.SELF_LOOP ? 3 : 0,
              },
              activityDestMatrix: [{
                'id': '',
                'description': {
                  'en': 'Default Scene',
                  'zh_CN': '默认场景'
                },
                'enable': 1,
                'startDate': '',
                'endDate': '',
                'orderIndex': 999,
                'sceneRule': null,
                'sceneRuleDesc': null,
                'sceneRuleJson': null,
                'escalationAction': null,
                'defaultMatrix': 1,
                'virtActList': []
              }],
              activityDestination: {
                activityApprovalMode: 0,
                activityManualChoice: 0,
                activityMultipleChoice: 0,
                candidateRule: null,
                candidateRuleDesc: {},
                candidateRuleJson: {},
                cycleToActivity: 0,
                destinationCommon: null,
                destinationRule: '40c07c48-e571-4c9d-be6b-270d9115f8c0',
                destinationRuleType: '2',
                destinationRuleDesc: { 'en': 'approvalEmp', 'zh_CN': 'rest获取审批人' },
                destinationRuleJson: { 'block': [{ 'num': 101, 'type': 'rule_main', 'id': ',v:]dW:5NJVwKHjZnlf(', 'children': [{ 'type': 'statement', 'name': 'STACK', 'block': { 'num': 105, 'type': 'rule_rest', 'id': '^R~4BuuW!@Muc-dbOee)', 'fields': [{ 'name': 'NAME', 'value': '{"methodType":"0","reqParameters":[{"LiteDestinationRuleReqtM01":[{"name":"activityObjId","type":"string","description":"节点Id","displayName":"activityObjId"},{"name":"processInstanceId","type":"string","description":"流程实例id","displayName":"processInstanceId"}]}],"apiUrl":"/api/liteDestinationRule/employeeIds","apiDetail":{"apiUrl":"/api/liteDestinationRule/employeeIds","httpMethod":"POST","methodName":"employeeIds","objectName":"liteDestinationRule","description":"根据liteDestinationRuleReqtM01审批选人","allReqParameters":[{"LiteDestinationRuleReqtM01":[{"name":"activityObjId","type":"string","isShow":true,"description":"节点Id","displayName":"activityObjId"},{"name":"processInstanceId","type":"string","isShow":true,"description":"流程实例id","displayName":"processInstanceId"}]}],"allRspParameters":[{"LiteDestinationRuleRespM01":[{"name":"employeeIds","type":"string","isShow":true,"description":"人员ids","displayName":"employeeIds"},{"name":"logId","type":"string","isShow":true,"description":"日志id","displayName":"logId"},{"name":"messageList","type":"array","items":{"SystemMessage":{"type":"object","properties":{"key":{"type":"string","description":"消息key"},"message":{"type":"string","description":"消息内容"}}}},"isShow":true,"description":"返回的消息list","displayName":"messageList"},{"name":"responseCode","type":"string","isShow":true,"description":"返回的消息code，100--正常，300--异常","displayName":"responseCode"},{"name":"version","type":"string","isShow":true,"description":"版本号","displayName":"version"}]}]},"displayName":"审批选人","service":"user-service","rspParameters":[{"LiteDestinationRuleRespM01":[{"name":"employeeIds","type":"string","description":"人员ids","displayName":"employeeIds"},{"name":"logId","type":"string","description":"日志id","displayName":"logId"},{"name":"messageList","type":"array","items":{"SystemMessage":{"type":"object","properties":{"key":{"type":"string","description":"消息key"},"message":{"type":"string","description":"消息内容"}}}},"description":"返回的消息list","displayName":"messageList"},{"name":"responseCode","type":"string","description":"返回的消息code，100--正常，300--异常","displayName":"responseCode"},{"name":"version","type":"string","description":"版本号","displayName":"version"}]}],"description":"审批选人","id":"d39cc57d-d620-48e1-81df-b99711a94aea","nameSpace":"com.paasit.pai.core","methodFlag":"chooseEmployeeClass;"}' }, { 'name': 'returnName', 'value': 'response_105' }], 'children': [{ 'type': 'value', 'name': 'ARG0', 'block': { 'type': 'rule_typeChange', 'id': '*YTy*X],0R?.r,`_|i.O', 'fields': [{ 'name': 'TYPE', 'value': 'String' }], 'children': [{ 'type': 'value', 'name': 'IN', 'block': { 'type': 'rule_map', 'id': '6`$v1.@F{i3}y^Z21BIR', 'fields': [{ 'name': 'ARG', 'value': 'activityObjId' }] } }], 'inline': true } }, { 'type': 'value', 'name': 'ARG1', 'block': { 'type': 'rule_typeChange', 'id': 'u)~?*:+]A+]8}O)acQ.o', 'fields': [{ 'name': 'TYPE', 'value': 'String' }], 'children': [{ 'type': 'value', 'name': 'IN', 'block': { 'type': 'rule_map', 'id': 'O@z;x4fBd.~af,WA2G#]', 'fields': [{ 'name': 'ARG', 'value': 'processInstanceId' }] } }], 'inline': true } }], 'inline': false, 'next': { 'type': 'rule_returnArg', 'id': 'pg[wVeJ1~UJAm+I|cXa8', 'fields': [{ 'name': 'NAME', 'value': '{"text":"response_105","res":"rest","description":"请求rest:审批选人的返回值","value":[{"LiteDestinationRuleRespM01":[{"name":"employeeIds","type":"string","description":"人员ids","displayName":"employeeIds"},{"name":"logId","type":"string","description":"日志id","displayName":"logId"},{"name":"messageList","type":"array","items":{"SystemMessage":{"type":"object","properties":{"key":{"type":"string","description":"消息key"},"message":{"type":"string","description":"消息内容"}}}},"description":"返回的消息list","displayName":"messageList"},{"name":"responseCode","type":"string","description":"返回的消息code，100--正常，300--异常","displayName":"responseCode"},{"name":"version","type":"string","description":"版本号","displayName":"version"}]}],"sign":"service"}' }, { 'name': 'ARG', 'value': '{"name":"employeeIds","type":"string","description":"人员ids","displayName":"employeeIds"}' }] } } }], 'x': 37.99999237060534, 'y': 112.4999694824218 }] },
                mutiDestinationsRule: null,
                mutiDestinationsRuleType: '',
                mutiDestinationsRuleDesc: null,
                mutiDestinationsRuleJson: null,
                selectActivityIds: null,
              }
            };
            activityActionObjList = [{
              actionCode: null,
              actionDisplayName: 'Accept',
              actionId: '',
              actionName: 'Accept',
              actionType: 'Finish',
              defaultAction: null,
              displayName: { en: 'Accept', zh_CN: '审核通过' },
              enable: 0,
              functionId: null,
              functionRelId: null,
              mapperMethod: null,
              objectPId: null,
              orderIndex: null,
              pid: null,
              type: '标准',
            }];
            outComeObjList = [{
              basicRule: 'All',
              displayName: { en: 'Accept', zh_CN: '审核通过' },
              id: '',
              objectPId: null,
              outComeName: 'Accept',
              outComeRule: null,
              outComeRuleCode: null,
              outComeRuleDesc: null,
              outComeRuleJson: '',
              outComeRuleType: null,
              pid: '',
            }];
          }
        } else {
          // 迭代节点类型 ITERATION: 11
          if (cell.nodeType === processDesignConstant.NODE_TYPE.ITERATION) {
            candidates.activityCycleRule['cycleType'] = processDesignConstant.ACTIVITY_CYCLE_TYPE.ORDER;
            // 瀑布节点类型 WATERFALL: 12
          } else if (cell.nodeType === processDesignConstant.NODE_TYPE.WATERFALL) {
            candidates.activityCycleRule['cycleType'] = processDesignConstant.ACTIVITY_CYCLE_TYPE.CUSTOM;
            // 矩陣节点类型 TOA: 8
          } else if (cell.nodeType === processDesignConstant.NODE_TYPE.TOA) {
            candidates.activityCycleRule['cycleType'] = processDesignConstant.ACTIVITY_CYCLE_TYPE.MATRIX;
            // yuminghao复写 自循环节点 默认循环审批类型是 迭代审批
            // 自循环节点类型 SELF_LOOP: 10
          } else if (cell.nodeType === processDesignConstant.NODE_TYPE.SELF_LOOP) {
            candidates.activityCycleRule['cycleType'] = processDesignConstant.ACTIVITY_CYCLE_TYPE.ORDER;
          }
        }
        nodeData = {
          activityInfo: activityInfo,
          approvalBehaviorAndResults: {
            clientEventObj: {
              clientEvent: {
                eventName: 'clientEvent'
              },
              // 是否启用邮件审批
              enableEmailApprove: 0,
              // 邮件模板名称
              templateName: '邮件审批默认模板',
              // 邮件模板Id
              noticeTemplateId: 'b2aa2055-4b34-4d14-ba64-9aa6ec4416a9',
              clientEventName: 'clientEvent',
              orderIndex: 1,
              type: 'clientEvent'
            },
            activityActionObjList: activityActionObjList,
            outComeObjList: outComeObjList,
          },
          candidates: candidates,
          eventConfigurationList: eventConfigurationList
        };
      } else if (cell.nodeType === processDesignConstant.NODE_TYPE.SERVICE) {
        if (cell.eventConfigurationList && cell.eventConfigurationList.length) {
          eventConfigurationList = cell.eventConfigurationList;
        } else {
          eventConfigurationList.push({
            serverEvent: {
              eventName: 'service',
            },
            eventName: 'service',
            orderIndex: 0,
            type: 'serverEvent'
          });
        }
        nodeData = {
          activityInfo: {
            id: cell.id,
            nodeType: cell.nodeType,
            activityName: cell.nodeName,
            'displayName': {
              'en': cell.nodeName,
              'zh_CN': cell.nodeName,
            },
            activityType: processDesignConstant.ACTIVITY_TYPE.SERVICE,
            activityCycleType: processDesignConstant.ACTIVITY_TYPE.SERVICE
          },
          approvalBehaviorAndResults: {},
          candidates: {},
          eventConfigurationList: eventConfigurationList
        };
      } else if (cell.nodeType === processDesignConstant.NODE_TYPE.SUB_PROCESS) {
        if (cell.eventConfigurationList && cell.eventConfigurationList.length) {
          eventConfigurationList = cell.eventConfigurationList;
        } else {
          /* eventConfigurationList.push({
            serverEvent: {
              eventName: '节点初始化',
            },
            eventName: '节点初始化',
            orderIndex: 0,
            serverEventOrder: 'Before',
            type: 'serverEvent'
          }); */
          eventConfigurationList.push({
            ipcEvent: {
              eventName: cell.nodeName,
              isSynchronization: 1
            },
            eventName: cell.nodeName,
            orderIndex: 1,
            type: 'ipcEvent'
          });
          /* eventConfigurationList.push({
            serverEvent: {
              eventName: '节点结束',
            },
            eventName: '节点结束',
            orderIndex: 2,
            serverEventOrder: 'After',
            type: 'serverEvent'
          }); */
        }
        nodeData = {
          activityInfo: {
            id: cell.id,
            nodeType: cell.nodeType,
            activityName: cell.nodeName,
            'displayName': {
              'en': cell.nodeName,
              'zh_CN': cell.nodeName,
            },
            activityType: processDesignConstant.ACTIVITY_TYPE.SERVICE,
            activityCycleType: processDesignConstant.ACTIVITY_TYPE.SERVICE
          },
          approvalBehaviorAndResults: {},
          candidates: {},
          eventConfigurationList: eventConfigurationList
        };
      } else if (cell.nodeType === processDesignConstant.NODE_TYPE.GATEWAY) {
        nodeData = {
          activityInfo: {
            id: cell.id,
            nodeType: cell.nodeType,
            activityName: cell.nodeName,
            'displayName': {
              'en': cell.nodeName,
              'zh_CN': cell.nodeName,
            },
            // 网关的类型，1:并行网关, 2:排他网关 3:包容网关
            priority: '1',
            activityType: processDesignConstant.ACTIVITY_TYPE.GATEWAY,
            activityCycleType: processDesignConstant.ACTIVITY_TYPE.GATEWAY,
          }
        };
      } else if (cell.nodeType === processDesignConstant.NODE_TYPE.FLOWABLE_END) {
        nodeData = {
          activityInfo: {
            id: cell.id,
            nodeType: cell.nodeType,
            activityName: cell.nodeName,
            'displayName': {
              'en': cell.nodeName,
              'zh_CN': cell.nodeName,
            },
            activityType: processDesignConstant.ACTIVITY_TYPE.FLOWABLE_END,
            activityCycleType: processDesignConstant.ACTIVITY_TYPE.FLOWABLE_END,
          }
        };
        // 总分总开始、总分总结束
      } else if (cell.nodeType === processDesignConstant.NODE_TYPE.TOTAL_GROSS_START ||
        cell.nodeType === processDesignConstant.NODE_TYPE.TOTAL_GROSS_END) {
        if (cell.eventConfigurationList && cell.eventConfigurationList.length) {
          eventConfigurationList = cell.eventConfigurationList;
        } else {
          eventConfigurationList.push({
            serverEvent: {
              eventName: 'service',
            },
            eventName: 'service',
            orderIndex: 0,
            type: 'serverEvent'
          });
        }
        let activityType = null;
        if (cell.nodeType === processDesignConstant.NODE_TYPE.TOTAL_GROSS_START) {
          activityType = processDesignConstant.ACTIVITY_TYPE.TOTAL_GROSS_START;
        } else if (cell.nodeType === processDesignConstant.NODE_TYPE.TOTAL_GROSS_END) {
          activityType = processDesignConstant.ACTIVITY_TYPE.TOTAL_GROSS_END;
        }
        nodeData = {
          activityInfo: {
            id: cell.id,
            nodeType: cell.nodeType,
            activityName: cell.nodeName,
            'displayName': {
              'en': cell.nodeName,
              'zh_CN': cell.nodeName,
            },
            activityType: activityType,
            activityCycleType: activityType
          },
          approvalBehaviorAndResults: {},
          candidates: {},
          eventConfigurationList: eventConfigurationList
        };
        // 其它类型节点 
      } else {
        if (cell.eventConfigurationList && cell.eventConfigurationList.length) {
          eventConfigurationList = cell.eventConfigurationList;
        } else {
          eventConfigurationList.push({
            serverEvent: {
              eventName: cell.nodeName,
            },
            eventName: cell.nodeName,
            orderIndex: 0,
            type: 'serverEvent'
          });
        }
        nodeData = {
          activityInfo: {
            id: cell.id,
            nodeType: cell.nodeType,
            activityName: cell.nodeName,
            'displayName': {
              'en': cell.nodeName,
              'zh_CN': cell.nodeName,
            },
            activityType: processDesignConstant.ACTIVITY_TYPE.STANDARD,
            activityCycleType: processDesignConstant.ACTIVITY_TYPE.STANDARD
          },
          approvalBehaviorAndResults: {},
          candidates: {},
          eventConfigurationList: eventConfigurationList
        };
      }
      // 存在 nodeObj 则赋值  复制节点的配置数据
      if (nodeObj) {
        nodeObj.activityInfo.id = nodeData.activityInfo.id;
        nodeObj.activityInfo.activityName = window.flowI18n.handerlNodeLabel(nodeData.activityInfo.activityName);
        nodeObj.activityInfo.activityId = '';
        nodeObj.activityInfo.displayName = {
          'en': nodeObj.activityInfo.activityName,
          'zh_CN': nodeObj.activityInfo.activityName,
        };
        window.FLOWSTOREDATA.setData(nodeObj);
      } else {
        window.FLOWSTOREDATA.setData(nodeData);
      }
    }
    // 审批节点
    if (window.NODE_TYPE_STYLE && cell && (cell.nodeType === 6 || cell.nodeType === 10)) {
      let nodeName = cell.nodeName;
      const valueStr = '<p class="k2-node-title" style="background:#003865;margin:0;padding:0;text-align: center;height:24px;line-height: 24px;">' +
        '<span style="background:transparent url(' + window.processDesignConstant.NODE_ICON[cell.nodeType] + ') no-repeat left center;background-size: 14px 14px;">' + nodeName + '</span>' +
        '</p>' +
        '<ul class="k2-node-container" style="margin:0;padding:0;list-style: none;border-radius:0 0 3px 3px;height:61px;overflow: auto;border-top:none;">' +
        '<li class="k2-node-item" style="background:#FFFFFF;text-align: center;color:#003865;margin:0;padding:0;list-style: none; height: 20px; line-height: 20px; overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + nodeName + '">' + nodeName + '</li>' +
        '</ul>';
      cell.value = valueStr;
    }
    // 复制节点 矩阵节点判断是否有场景及虚拟节点
    if (nodeObj) {
      let isHasVirAct = false;
      if ((cell.nodeType === 8 || cell.nodeType === 10) &&
        nodeObj.candidates && nodeObj.candidates.activityDestMatrix.length > 0) {
        for (let i = 0; i < nodeObj.candidates.activityDestMatrix.length; i++) {
          //矩阵审批的场景中虚拟节点有可能为空,增加校验
          if (nodeObj.candidates.activityDestMatrix[i].virtActList && nodeObj.candidates.activityDestMatrix[i].virtActList.length > 0) {
            isHasVirAct = true;
            break;
          }
        }
      }
      // 处理复制线
      // FROM_LOOP_NODE_LINE=98(以循环节点为起始点的线类型)
      // LINE=99(普通的线类型）
      // SELF_LINE=100(循环节点，TOA节点自带的自循环线类型)
      if (cell.nodeType === processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE
        || cell.nodeType === processDesignConstant.NODE_TYPE.LINE) {
        nodeObj.id = cell.id;
        nodeObj.lineName = '';
        window.FLOWSTOREDATA.setData(nodeObj, true);
      }

      if (isHasVirAct) {
        cell.value = cell.value.replace('</p><ul class="k2-node-container"', '<span class="k2-node-arrow" id="' + cell.id + '"></span></p><ul class="k2-node-container"');
      }
    }
  }
  return cells;
};

// 重写mxGraph的addCells方法，在画布上连线时会触发
mxGraph.prototype.addCells = function (cells, parent, index, source, target) {
  if (parent == null) {
    parent = this.getDefaultParent();
  }

  if (index == null) {
    index = this.model.getChildCount(parent);
  }

  this.model.beginUpdate();
  try {
    this.cellsAdded(cells, parent, index, source, target, false, true);
    this.fireEvent(new mxEventObject(mxEvent.ADD_CELLS, 'cells', cells,
      'parent', parent, 'index', index, 'source', source, 'target', target));
  } finally {
    this.model.endUpdate();
  }

  for (var h = 0; h < cells.length; h++) {
    var cell = cells[h];
    // 判断线是否以循环节点为起始点，若是，则修改线的nodeType = 98;
    // FROM_LOOP_NODE_LINE=98(以循环节点为起始点的线类型)
    // LINE=99(普通的线类型）
    // SELF_LINE=100(循环节点，TOA节点自带的自循环线类型)
    if (cell.edge) {
      if (cell.source.nodeType === processDesignConstant.NODE_TYPE.SELF_LOOP ||
        cell.source.nodeType === processDesignConstant.NODE_TYPE.ITERATION ||
        cell.source.nodeType === processDesignConstant.NODE_TYPE.WATERFALL ||
        cell.source.nodeType === processDesignConstant.NODE_TYPE.TOA) {
        if (cell.source && cell.target && cell.source.id === cell.target.id) {
          // 判断当前循环节点是否已经存在循环线
          let linList = cell.source.edges.filter(item => item.nodeType && item.nodeType === 100 && item.id !== cell.id);
          if (linList && linList.length > 0) {
            // 非循环线 98
            cell.nodeType = processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE;
          } else {
            // 循环线100
            cell.nodeType = processDesignConstant.NODE_TYPE.SELF_LINE;
          }
        } else {
          cell.nodeType = processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE;
        }
      } else {
        // 普通线 99
        cell.nodeType = processDesignConstant.NODE_TYPE.LINE;
      }
      // 如果FLOWSTOREDATA没有这个cell则添加进去，如果存在则不处理;
      if (window.FLOWSTOREDATA && !window.FLOWSTOREDATA.getData(cell)) {
        let actionResult = '';
        let activityName = '';
        if (cell.nodeType === 100) {
          activityName = cell.id + window.flowI18n.$t('flowDesigner.line_name100');
          actionResult = 'Accept';
          cell.value = activityName;
        }
        window.FLOWSTOREDATA.setData({
          id: cell.id,
          nodeType: cell.nodeType,
          activityName: activityName,
          'lineName': activityName,
          'lineLabel': '',
          'actionResult': actionResult,
          'lineCondition': null,
          'lineConditionCode': null,
          'lineConditionDesc': null,
          'lineConditionJson': null,
        }, true);
      }
      // 判断 连接的节点是否是 总分总结束
      if (target && target.nodeType === processDesignConstant.NODE_TYPE.TOTAL_GROSS_END) {
        // 获取总分总的节点数据  
        let nodeObj = window.FLOWSTOREDATA.getDataById(target.nodeType, target.id);
        if (!nodeObj.checkLines) {
          nodeObj.checkLines = [];
        }
        // 获取线数据
        let lineObj = window.FLOWSTOREDATA.getData(cell);
        if (lineObj) {
          // 自动生成线名称
          if (!cell.value) {
            let lineName = `${source.nodeName}TO${target.nodeName}`;
            cell.value = lineName;
            lineObj.lineLabel = lineName;
            lineObj.lineName = lineName;
          }
          // 给总分总结束 添加配置，连接的线
          let obj = nodeObj.checkLines.find(item => item.lineId === lineObj.id);
          if (!obj) {
            lineObj.lineId = lineObj.id;
            nodeObj.checkLines.push(lineObj);
            window.FLOWSTOREDATA.setDataById(target.nodeType, target.id, nodeObj);
          }
        }
      }
    }
  }
  return cells;
};

// 重写mxGraph的removeCells方法;  删除时触发
mxGraph.prototype.removeCells = function (cells, includeEdges, isResetGraph) {
  const _this = this;
  // 判断 线 或者是 用户节点
  // 普通的线类型｜99,
  // 循环节点，TOA节点自带的自循环线类型 ｜100
  // 以循环节点为起始点的线类型｜ 98
  // client节点类型｜6
  if (window.removeLineTips && (cells[0].nodeType == 98 || cells[0].nodeType == 99 || cells[0].nodeType == 100 || cells[0].nodeType == 6)) {
    let tips = '';
    if (cells[0].nodeType == 98 || cells[0].nodeType == 99 || cells[0].nodeType == 100) {
      tips = window.flowI18n.$t('flowDesigner.msg1');
    } else if (cells[0].nodeType == 6) {
      tips = window.flowI18n.$t('flowDesigner.msg2', [cells[0].nodeName]);
    }
    window.removeLineTips.$confirm(tips, window.flowI18n.$t('flowDesigner.tips'), {
      cancelButtonText: window.flowI18n.$t('flowDesigner.cancelbtn'),
      confirmButtonText: window.flowI18n.$t('flowDesigner.confirmbtn'),
      type: 'warning'
    }).then(function () {
      if (!isResetGraph) {
        // 过滤该元素是否可以删除
        for (var k = 0; k < cells.length; k++) {
          var id = cells[k] ? cells[k].id : '';
          for (var h = 0; h < processDesignConstant.REMOVE_WHITE_LIST.length; h++) {
            // 通过RegExp使用变量
            var reg = new RegExp('^' + processDesignConstant.REMOVE_WHITE_LIST[h] + '$', 'i');
            if (id && reg.test(id)) {
              FLOWINSTANCE.$notify({
                type: 'warning',
                message: FLOWINSTANCE.langs.mxGraph.deleteNode,
                duration: 1500
              });
              cells.splice(k--, 1);
            }
          }

          if (cells.length === 1 && cells[k] && cells[k].nodeType === processDesignConstant.NODE_TYPE.SELF_LINE && cells[k].source && cells[k].target && cells[k].source && cells[k].target.id === cells[k].source.id) {
            cells.splice(k--, 1);
          }
        }

        // 检查节点是否存在自循环线，如果有则一并删除，没有则不删
        if (cells && cells.length > 0) {
          for (var key in _this.model.cells) {
            if (_this.model.cells.hasOwnProperty(key)) {
              var cell = _this.model.cells[key];
              if (cell && cell.nodeType === processDesignConstant.NODE_TYPE.SELF_LINE) {
                if (cell.target && cell.source && cell.target.id === cell.source.id) {
                  for (var j = 0; j < cells.length; j++) {
                    if (cells[j].id === cell.target.id) {
                      cells.push(cell);
                    }
                  }
                }
              }
            }
          }
        }
      }
      /* 删除节点 */
      for (var i = 0; i < cells.length; i++) {
        window.FLOWSTOREDATA.deleteData(cells[i]);
      }

      includeEdges = (includeEdges != null) ? includeEdges : true;

      if (cells == null) {
        cells = _this.getDeletableCells(_this.getSelectionCells());
      }

      // Adds all edges to the cells
      if (includeEdges) {
        // FIXME: Remove duplicate cells in result or do not add if
        // in cells or descendant of cells
        cells = _this.getDeletableCells(_this.addAllEdges(cells));
      }

      _this.model.beginUpdate();
      try {
        _this.cellsRemoved(cells);
        _this.fireEvent(new mxEventObject(mxEvent.REMOVE_CELLS,
          'cells', cells, 'includeEdges', includeEdges));
      } finally {
        _this.model.endUpdate();
      }
      return cells;
    }).catch(function (err) {
      return cells;
    });
  } else {
    if (!isResetGraph) {
      // 过滤该元素是否可以删除
      for (var k = 0; k < cells.length; k++) {
        var id = cells[k] ? cells[k].id : '';
        // 页面初始化固定不能删除的节点name
        for (var h = 0; h < processDesignConstant.REMOVE_WHITE_LIST.length; h++) {
          // 通过RegExp使用变量
          var reg = new RegExp('^' + processDesignConstant.REMOVE_WHITE_LIST[h] + '$', 'i');
          if (id && reg.test(id)) {
            FLOWINSTANCE.$notify({
              type: 'warning',
              message: FLOWINSTANCE.langs.mxGraph.deleteNode,
              duration: 1500
            });
            cells.splice(k--, 1);
          }
        }
        // 判断  循环节点，TOA节点自带的自循环线类型
        if (cells.length === 1 && cells[k] &&
          cells[k].nodeType === processDesignConstant.NODE_TYPE.SELF_LINE &&
          cells[k].source && cells[k].target && cells[k].source &&
          cells[k].target.id === cells[k].source.id) {
          cells.splice(k--, 1);
        }
      }
      // 检查节点是否存在自循环线，如果有则一并删除，没有则不删
      if (cells && cells.length > 0) {
        for (var key in _this.model.cells) {
          if (this.model.cells.hasOwnProperty(key)) {
            var cell = this.model.cells[key];
            if (cell && cell.nodeType === processDesignConstant.NODE_TYPE.SELF_LINE) {
              if (cell.target && cell.source && cell.target.id === cell.source.id) {
                for (var j = 0; j < cells.length; j++) {
                  if (cells[j].id === cell.target.id) {
                    cells.push(cell);
                  }
                }
              }
            }
          }
        }
      }
      // 判断是否是 总分总结束的线
      if (cells[0] && cells[0].target && cells[0].target.nodeType === 17) {
        // 获取总分总的节点数据  
        let nodeObj = window.FLOWSTOREDATA.getDataById(cells[0].target.nodeType, cells[0].target.id);
        if (nodeObj) {
          // 删除也没下拉选择显示数据
          if (nodeObj.checkLines) {
            nodeObj.checkLines = nodeObj.checkLines.filter(item => item.lineId !== cells[0].id);
          }
          // 删除已选数据
          if (nodeObj.activityInfo.targetLineList) {
            nodeObj.activityInfo.targetLineList = nodeObj.activityInfo.targetLineList.filter(item => item.lineId !== cells[0].id);
          }
          window.FLOWSTOREDATA.setDataById(cells[0].target.nodeType, cells[0].target.id, nodeObj);
        }
      }
      // 判断是否是总分总节点
      if (cells && cells.length > 0) {
        if (cells[0].nodeType == 16 || cells[0].nodeType == 17) {
          let nodeType = cells[0].nodeType;
          // 获取总分总的节点数据  
          let nodeObj = window.FLOWSTOREDATA.getDataById(nodeType, cells[0].id);
          if (nodeObj && nodeObj.activityInfo && nodeObj.activityInfo.relationNode) {
            if (nodeType === 16) {
              nodeType = 17;
            } else {
              nodeType = 16;
            }
            // 获取当前节点对应关系
            let relNodeObj = window.FLOWSTOREDATA.getDataById(nodeType, nodeObj.activityInfo.relationNode.flowDesignerId);
            if (relNodeObj) {
              relNodeObj.activityInfo.relationNode = null;
              window.FLOWSTOREDATA.setDataById(nodeType, relNodeObj.activityInfo.id, relNodeObj);
            }
          }
        }
      }
    }
    /* 删除节点 */
    for (var i = 0; i < cells.length; i++) {
      window.FLOWSTOREDATA.deleteData(cells[i]);
    }

    includeEdges = (includeEdges != null) ? includeEdges : true;

    if (cells == null) {
      cells = this.getDeletableCells(this.getSelectionCells());
    }

    // Adds all edges to the cells
    if (includeEdges) {
      // FIXME: Remove duplicate cells in result or do not add if
      // in cells or descendant of cells
      cells = this.getDeletableCells(this.addAllEdges(cells));
    }

    this.model.beginUpdate();
    try {
      this.cellsRemoved(cells);
      this.fireEvent(new mxEventObject(mxEvent.REMOVE_CELLS, 'cells', cells, 'includeEdges', includeEdges));
    } finally {
      this.model.endUpdate();
    }
    return cells;
  }
};

// 重写mxGraph中插入节点方法  insertVertex
mxGraph.prototype.insertVertex = function (parent, id, value, x, y, width, height, style, relative, nodeType, nodeName) {
  // var vertex = this.createVertex(parent, id, value, x, y, width, height, style, relative, nodeType, nodeName);
  var geometry = new mxGeometry(x, y, width, height);
  geometry.relative = (relative != null) ? relative : false;

  // Creates the vertex
  var vertex = new mxCell(value, geometry, style, nodeType, nodeName);
  vertex.nodeType = nodeType;
  vertex.nodeName = nodeName;
  vertex.setId(id);
  vertex.setVertex(true);
  vertex.setConnectable(true);
  return this.addCell(vertex, parent);
};

mxGraph.prototype.createVertex = function (parent, id, value, x, y, width, height, style, relative, nodeType, nodeName) {
  // Creates the geometry for the vertex
  var geometry = new mxGeometry(x, y, width, height);
  geometry.relative = (relative != null) ? relative : false;

  // Creates the vertex
  var vertex = new mxCell(value, geometry, style, nodeType, nodeName);
  vertex.nodeType = nodeType;
  vertex.nodeType = nodeName;
  vertex.setId(id);
  vertex.setVertex(true);
  vertex.setConnectable(true);

  return vertex;
};

// 重写mxGraph中插入线方法  insertVertex
mxGraph.prototype.insertEdge = function (parent, id, value, source, target, style, isOutCome, index) {
  var edge = this.createEdge(parent, id, value, source, target, style, isOutCome, index);
  return this.addEdge(edge, parent, source, target);
};

mxGraph.prototype.createEdge = function (parent, id, value, source, target, style, isOutCome, index) {
  // Creates the edge
  var newStyle;

  if (style.indexOf('strokeColor=') > -1) {
    newStyle = style;
  } else {
    newStyle = style + 'strokeColor=#979AA3';
  }

  var edge = new mxCell(value, new mxGeometry(), newStyle, processDesignConstant.NODE_TYPE.LINE);

  edge.setId(id);
  edge.setEdge(true);
  edge.geometry.relative = true;

  return edge;
};

mxPrintPreview.prototype.generateImage = function (css, targetWindow, forcePageBreaks, keepOpen) {
  // Closing the window while the page is being rendered may cause an
  // exception in IE. This and any other exceptions are simply ignored.
  var previousInitializeOverlay = this.graph.cellRenderer.initializeOverlay;
  var div = null;

  try {
    // Temporarily overrides the method to redirect rendering of overlays
    // to the draw pane so that they are visible in the printout
    if (this.printOverlays) {
      this.graph.cellRenderer.initializeOverlay = function (state, overlay) {
        overlay.init(state.view.getDrawPane());
      };
    }

    if (this.printControls) {
      this.graph.cellRenderer.initControl = function (state, control, handleEvents, clickHandler) {
        control.dialect = state.view.graph.dialect;
        control.init(state.view.getDrawPane());
      };
    }

    this.wnd = (targetWindow != null) ? targetWindow : this.wnd;
    var isNewWindow = false;

    if (this.wnd == null) {
      isNewWindow = true;
      this.wnd = window.open();
    }

    var doc = this.wnd.document;

    if (isNewWindow) {
      var dt = this.getDoctype();

      if (dt != null && dt.length > 0) {
        doc.writeln(dt);
      }

      if (mxClient.IS_VML) {
        doc.writeln('<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">');
      } else {
        if (document.compatMode === 'CSS1Compat') {
          doc.writeln('<!DOCTYPE html>');
        }

        doc.writeln('<html>');
      }

      doc.writeln('<head>');
      this.writeHead(doc, css);
      doc.writeln('</head>');
      doc.writeln('<body class="mxPage">');
    }

    // Computes the horizontal and vertical page count
    var bounds = this.graph.getGraphBounds().clone();
    var currentScale = this.graph.getView().getScale();
    var sc = currentScale / this.scale;
    var tr = this.graph.getView().getTranslate();

    // Uses the absolute origin with no offset for all printing
    if (!this.autoOrigin) {
      this.x0 -= tr.x * this.scale;
      this.y0 -= tr.y * this.scale;
      bounds.width += bounds.x;
      bounds.height += bounds.y;
      bounds.x = 0;
      bounds.y = 0;
      this.border = 0;
    }

    // Store the available page area
    var availableWidth = this.pageFormat.width - (this.border * 2);
    var availableHeight = this.pageFormat.height - (this.border * 2);

    // Adds margins to page format
    this.pageFormat.height += this.marginTop + this.marginBottom;

    // Compute the unscaled, untranslated bounds to find
    // the number of vertical and horizontal pages
    bounds.width /= sc;
    bounds.height /= sc;

    var hpages = Math.max(1, Math.ceil((bounds.width + this.x0) / availableWidth));
    var vpages = Math.max(1, Math.ceil((bounds.height + this.y0) / availableHeight));
    this.pageCount = hpages * vpages;

    var writePageSelector = mxUtils.bind(this, function () {
      if (this.pageSelector && (vpages > 1 || hpages > 1)) {
        var table = this.createPageSelector(vpages, hpages);
        doc.body.appendChild(table);

        // Implements position: fixed in IE quirks mode
        if (mxClient.IS_IE && doc.documentMode == null || doc.documentMode == 5 || doc.documentMode == 8 || doc.documentMode == 7) {
          table.style.position = 'absolute';

          var update = function () {
            table.style.top = ((doc.body.scrollTop || doc.documentElement.scrollTop) + 10) + 'px';
          };

          mxEvent.addListener(this.wnd, 'scroll', function (evt) {
            update();
          });

          mxEvent.addListener(this.wnd, 'resize', function (evt) {
            update();
          });
        }
      }
    });

    var addPage = mxUtils.bind(this, function (div, addBreak) {
      // Border of the DIV (aka page) inside the document
      if (this.borderColor != null) {
        div.style.borderColor = this.borderColor;
        div.style.borderStyle = 'solid';
        div.style.borderWidth = '1px';
      }

      // Needs to be assigned directly because IE doesn't support
      // child selectors, eg. body > div { background: white; }
      div.style.background = this.backgroundColor;

      if (forcePageBreaks || addBreak) {
        div.style.pageBreakAfter = 'always';
      }

      // NOTE: We are dealing with cross-window DOM here, which
      // is a problem in IE, so we copy the HTML markup instead.
      // The underlying problem is that the graph display markup
      // creation (in mxShape, mxGraphView) is hardwired to using
      // document.createElement and hence we must use this document
      // to create the complete page and then copy it over to the
      // new window.document. This can be fixed later by using the
      // ownerDocument of the container in mxShape and mxGraphView.
      if (isNewWindow && (mxClient.IS_IE || document.documentMode >= 11 || mxClient.IS_EDGE)) {
        // For some obscure reason, removing the DIV from the
        // parent before fetching its outerHTML has missing
        // fillcolor properties and fill children, so the div
        // must be removed afterwards to keep the fillcolors.
        doc.writeln(div.outerHTML);
        div.parentNode.removeChild(div);
      } else {
        div.parentNode.removeChild(div);
        doc.body.appendChild(div);
      }

      if (forcePageBreaks || addBreak) {
        this.addPageBreak(doc);
      }
    });

    var cov = this.getCoverPages(this.pageFormat.width, this.pageFormat.height);

    if (cov != null) {
      for (var i = 0; i < cov.length; i++) {
        addPage(cov[i], true);
      }
    }

    var apx = this.getAppendices(this.pageFormat.width, this.pageFormat.height);

    // Appends each page to the page output for printing, making
    // sure there will be a page break after each page (ie. div)
    for (var i = 0; i < vpages; i++) {
      var dy = i * availableHeight / this.scale - this.y0 / this.scale +
        (bounds.y - tr.y * currentScale) / currentScale;

      for (var j = 0; j < hpages; j++) {
        if (this.wnd == null) {
          return null;
        }

        var dx = j * availableWidth / this.scale - this.x0 / this.scale +
          (bounds.x - tr.x * currentScale) / currentScale;
        var pageNum = i * hpages + j + 1;
        var clip = new mxRectangle(dx, dy, availableWidth, availableHeight);
        div = this.renderPage(this.pageFormat.width, this.pageFormat.height, 0, 0, mxUtils.bind(this, function (div) {
          this.addGraphFragment(-dx, -dy, this.scale, pageNum, div, clip);

          if (this.printBackgroundImage) {
            this.insertBackgroundImage(div, -dx, -dy);
          }
        }), pageNum);

        // Gives the page a unique ID for later accessing the page
        div.setAttribute('id', 'mxPage-' + pageNum);
        // 使用三方库html2canvas
        //直接选择要截图的dom，就能截图，但是因为canvas的原因，生成的图片模糊,所以调整为2倍
        var svgImage = div.children[0];
        //  var svgImage = div.children[0];
        //  svgImage.setAttribute('id', 'svgImage');
        svgImage.style.background = '#ffffff';
        //  div渲染会在调用转化函数之后,所以需要延迟转化操作
        var timer = setTimeout(function () {
          // eslint-disable-next-line no-undef
          html2canvas(svgImage, {
            // 是否允许跨域
            allowTaint: true,
            // 是否在渲染前测试图片
            taintTest: false,

            // 将上边设置的canvas赋给canvas
            // canvas: canvas,
            onrendered: function (canvas) {
              // 设置ie调试,似乎没效果
              //取得浏览器的userAgent字符串
              var userAgent = navigator.userAgent;
              var isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1; //判断是否IE<11浏览器
              //判断是否IE的Edge浏览器
              var isEdge = userAgent.indexOf('Edge') > -1 && !isIE;
              var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1;
              if (isIE || isIE11 || isEdge) {
                var blob = canvas.msToBlob();
                navigator.msSaveBlob(blob, 'filename');
                return;
              }

              var img = new Image();
              img.src = canvas.toDataURL('image/png');
              div.children[0].style.display = 'none';
              div.appendChild(img);
            }
          });
          clearTimeout(timer);
          timer = null;
        }, 20);

        addPage(div, apx != null || i < vpages - 1 || j < hpages - 1);
      }
    }

    if (apx != null) {
      for (var i = 0; i < apx.length; i++) {
        addPage(apx[i], i < apx.length - 1);
      }
    }

    if (isNewWindow && !keepOpen) {
      this.closeDocument();
      writePageSelector();
    }

    this.wnd.focus();
  } catch (e) {
    // Removes the DIV from the document in case of an error
    if (div != null && div.parentNode != null) {
      div.parentNode.removeChild(div);
    }
  } finally {
    this.graph.cellRenderer.initializeOverlay = previousInitializeOverlay;
  }
  return this.wnd;
};

/** 加载画布数据 触发 */
mxGraphModel.prototype.endUpdate = function (isUpdataAttr = false) {
  // 禁止节点移动负坐标区域
  if (this.currentEdit && this.currentEdit.changes) {
    for (var i = 0; i < this.currentEdit.changes.length; i++) {
      if (this.currentEdit.changes[i].geometry && this.currentEdit.changes[i].geometry.x < 0) {
        this.currentEdit.changes[i].geometry.x = 0;
      }

      if (this.currentEdit.changes[i].geometry && this.currentEdit.changes[i].geometry.y < 0) {
        this.currentEdit.changes[i].geometry.y = 0;
      }
      // 处理线的坐标
      if (this.currentEdit.changes[i].cell && this.currentEdit.changes[i].cell.edge && this.currentEdit.changes[i].cell.geometry && this.currentEdit.changes[i].cell.geometry.points && this.currentEdit.changes[i].cell.geometry.points.length) {
        this.currentEdit.changes[i].cell.geometry.points = changePoint(this.currentEdit.changes[i].cell.geometry.points);
      }
    }
  }
  // 校验连线
  for (let k in this.cells) {
    if (this.cells[k].edge) {
      // 验证不合格没连节点的线 变成红色 非正常连线
      if (!this.cells[k].source || !this.cells[k].target) {
        if (this.cells[k].style.indexOf('strokeColor=' + '#979AA3' + '') > -1) {
          const cellStyle = this.cells[k].style.replace('strokeColor=' + '#979AA3' + '', 'strokeColor=red');
          this.setStyle(this.cells[k], cellStyle);
        }
      } else {
        // 开始节点 == 结束节点  自己链接自己 && 不是循环线
        if (this.cells[k].source.id === this.cells[k].target.id && this.cells[k].nodeType !== processDesignConstant.NODE_TYPE.SELF_LINE) {
          // 不是 用户节点 && 不是 服务节点 爆红
          if (this.cells[k].source.nodeType != processDesignConstant.NODE_TYPE.CLIENT &&
            this.cells[k].source.nodeType != processDesignConstant.NODE_TYPE.SERVICE ) {
            const cellStyle = this.cells[k].style.replace('strokeColor=' + '#979AA3' + '', 'strokeColor=red');
            this.setStyle(this.cells[k], cellStyle);
          } else {
            // 判断是否配置线规则
            let lineObj = window.FLOWSTOREDATA.getData(this.cells[k]);
            let lineShow = true;
            if (lineObj != null) {
              if (lineObj.actionResult.length === 0 && lineObj.lineConditionDesc === null) {
                lineShow = false;
              } else {
                lineShow = true;
              }
            }
            if (this.cells[k].style) {
              if (this.cells[k].style.indexOf('strokeColor=' + '#979AA3' + '') > -1 && !lineShow) {
                const cellStyle = this.cells[k].style.replace('strokeColor=' + '#979AA3' + '', 'strokeColor=red');
                this.setStyle(this.cells[k], cellStyle);
              } else if (this.cells[k].style.indexOf('strokeColor=' + 'red' + '') > -1 && lineShow) {
                const cellStyle = this.cells[k].style.replace('strokeColor=' + 'red' + '', 'strokeColor=#979AA3');
                this.setStyle(this.cells[k], cellStyle);
              }
            }
          }
        } else {
          // 不是自己链接自己  红色变灰色
          if (this.cells[k].style && this.cells[k].style.indexOf('strokeColor=' + 'red' + '') > -1) {
            const cellStyle = this.cells[k].style.replace('strokeColor=' + 'red' + '', 'strokeColor=#979AA3');
            this.setStyle(this.cells[k], cellStyle);
          }
        }
      }

      // 判断 连接的节点是否是 总分总结束
      if (this.cells[k].target && this.cells[k].target.nodeType === processDesignConstant.NODE_TYPE.TOTAL_GROSS_END) {
        // 获取总分总的节点数据  
        let nodeObj = window.FLOWSTOREDATA.getDataById(this.cells[k].target.nodeType, this.cells[k].target.id);
        if (nodeObj) {
          if (!nodeObj.checkLines) {
            nodeObj.checkLines = [];
          }
          // 获取线数据
          let lineObj = window.FLOWSTOREDATA.getData(this.cells[k]);
          if (lineObj) {
            let obj = nodeObj.checkLines.find(item => item.id === lineObj.id);
            if (!obj) {
              // 给总分总结束 添加配置，连接的线
              lineObj.lineId = lineObj.id;
              nodeObj.checkLines.push(lineObj);
              window.FLOWSTOREDATA.setDataById(this.cells[k].target.nodeType, this.cells[k].target.id, nodeObj);
            }
          }
        }
      }
    }
  }

  this.updateLevel--;

  if (this.updateLevel == 0) {
    this.fireEvent(new mxEventObject(mxEvent.END_EDIT));
  }
  // yuminghao ctrl+z 撤销操作
  // 操作左侧菜单数据，也会进endupdata 但是不需要，所以不给塞入数据
  // 添加 window.FLOWSTOREDATA.isChangeSidebar 作为是操作左侧菜单数据 进入endupdate的标识
  if (!this.endingUpdate && (!window.FLOWSTOREDATA || !window.FLOWSTOREDATA.isChangeSidebar)) {
    this.endingUpdate = this.updateLevel == 0;
    this.fireEvent(new mxEventObject(mxEvent.END_UPDATE, 'edit', this.currentEdit));

    try {
      // yuminghao 撤销功能 如果是节点的属性修改 不会触发画布的change 手动处理
      if (isUpdataAttr && this.currentEdit.isEmpty()) {
        this.currentEdit.changes = this.cells;
      }
      if (this.endingUpdate && !this.currentEdit.isEmpty()) {
        this.fireEvent(new mxEventObject(mxEvent.BEFORE_UNDO, 'edit', this.currentEdit));
        var tmp = this.currentEdit;
        this.currentEdit = this.createUndoableEdit();
        tmp.notify();
        // zzy 2021-03-08 缓存历史
        window.FLOWSTOREDATA.cacheHistory();
        this.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', tmp));
      }
    } finally {
      this.endingUpdate = false;
    }
  }
  //
  if (FLOWINSTANCE && FLOWINSTANCE.getSidebarStatus && FLOWINSTANCE.getSidebarStatus()) {
    if (document.getElementsByClassName('geDiagramContainer')[0]) {
      document.getElementsByClassName('geDiagramContainer')[0].setAttribute('class', 'geDiagramContainer');
    }
  } else {
    if (document.getElementsByClassName('geDiagramContainer')[0]) {
      document.getElementsByClassName('geDiagramContainer')[0].setAttribute('class', 'geDiagramContainer');
    }
  }
};
/** 拖动 触发 */
mxConnectionHandler.prototype.connect = function (source, target, evt, dropTarget) {
  if (target != null || this.isCreateTarget(evt) || this.graph.allowDanglingEdges) {
    // Uses the common parent of source and target or
    // the default parent to insert the edge
    var model = this.graph.getModel();
    var terminalInserted = false;
    var edge = null;

    model.beginUpdate();
    try {
      if (source != null && target == null && !this.graph.isIgnoreTerminalEvent(evt) && this.isCreateTarget(evt)) {
        target = this.createTargetVertex(evt, source);

        if (target != null) {
          dropTarget = this.graph.getDropTarget([target], evt, dropTarget);
          terminalInserted = true;

          // Disables edges as drop targets if the target cell was created
          // FIXME: Should not shift if vertex was aligned (same in Java)
          if (dropTarget == null || !this.graph.getModel().isEdge(dropTarget)) {
            var pstate = this.graph.getView().getState(dropTarget);

            if (pstate != null) {
              var tmp = model.getGeometry(target);
              tmp.x -= pstate.origin.x;
              tmp.y -= pstate.origin.y;
            }
          } else {
            dropTarget = this.graph.getDefaultParent();
          }

          this.graph.addCell(target, dropTarget);
        }
      }

      var parent = this.graph.getDefaultParent();

      if (source != null && target != null &&
        model.getParent(source) == model.getParent(target) &&
        model.getParent(model.getParent(source)) != model.getRoot()) {
        parent = model.getParent(source);

        if ((source.geometry != null && source.geometry.relative) &&
          (target.geometry != null && target.geometry.relative)) {
          parent = model.getParent(parent);
        }
      }

      // Uses the value of the preview edge state for inserting
      // the new edge into the graph
      var value = null;
      var style = null;
      if (this.edgeState != null) {
        value = this.edgeState.cell.value;
        style = this.edgeState.cell.style;
        // 如果没有连接节点 线的颜色为红色
        if (target === null) {
          style = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=red';
        }
      }

      edge = this.insertEdge(parent, null, value, source, target, style);

      if (edge != null) {
        // Updates the connection constraints
        this.graph.setConnectionConstraint(edge, source, true, this.sourceConstraint);
        this.graph.setConnectionConstraint(edge, target, false, this.constraintHandler.currentConstraint);

        // Uses geometry of the preview edge state
        if (this.edgeState != null) {
          model.setGeometry(edge, this.edgeState.cell.geometry);

          //
          if (!this.edgeState.cell.geometry.points) {

            this.edgeState.cell.geometry.abspoints = this.edgeState.absolutePoints;
          }
        }

        var parent = model.getParent(source);

        // Inserts edge before source
        if (this.isInsertBefore(edge, source, target, evt, dropTarget)) {
          var index = null;
          var tmp = source;

          while (tmp.parent != null && tmp.geometry != null &&
            tmp.geometry.relative && tmp.parent != edge.parent) {
            tmp = this.graph.model.getParent(tmp);
          }

          if (tmp != null && tmp.parent != null && tmp.parent == edge.parent) {
            var index = tmp.parent.getIndex(tmp);
            tmp.parent.insert(edge, index);
          }
        }

        // Makes sure the edge has a non-null, relative geometry
        var geo = model.getGeometry(edge);

        if (geo == null) {
          geo = new mxGeometry();
          geo.relative = true;

          model.setGeometry(edge, geo);
        }

        // Uses scaled waypoints in geometry
        if (this.waypoints != null && this.waypoints.length > 0) {
          var s = this.graph.view.scale;
          var tr = this.graph.view.translate;
          geo.points = [];

          for (var i = 0; i < this.waypoints.length; i++) {
            var pt = this.waypoints[i];
            geo.points.push(new mxPoint(pt.x / s - tr.x, pt.y / s - tr.y));
          }
        }

        if (target == null) {
          var t = this.graph.view.translate;
          var s = this.graph.view.scale;
          var pt = (this.originalPoint != null) ?
            new mxPoint(this.originalPoint.x / s - t.x, this.originalPoint.y / s - t.y) :
            new mxPoint(this.currentPoint.x / s - t.x, this.currentPoint.y / s - t.y);
          pt.x -= this.graph.panDx / this.graph.view.scale;
          pt.y -= this.graph.panDy / this.graph.view.scale;
          geo.setTerminalPoint(pt, false);
        }

        this.fireEvent(new mxEventObject(mxEvent.CONNECT, 'cell', edge, 'terminal', target,
          'event', evt, 'target', dropTarget, 'terminalInserted', terminalInserted));
      }
    } catch (e) {
      mxLog.show();
      mxLog.debug(e.message);
    } finally {
      model.endUpdate();
    }

    if (this.select) {
      this.selectCells(edge, (terminalInserted) ? target : null);
    }
  }
};

const processDesign = {
  // 流程图使用的引擎,默认为K2
  engineType: 'K2',
  // 是否开发流程挂起功能，默认不开启
  processHangUp: false,
  //graph中的cell是否可编辑;
  cellIsEditor: false,
  // 画布点击事件listener
  graphClickListener: null,
  // 画布move事件listener
  graphMoveListener: null,
  //
  addSourceAndEndPoints: function (edge) {
    var startPoint = {},
      endPoint = {};

    if (edge && edge.geometry && edge.geometry.points && edge.geometry.points.length > 0) {
      // 区分从source出发的第一个转折点是在节点的上下还是左右
      if (edge.geometry.points[0].x >= edge.source.geometry.x && edge.geometry.points[0].x <= (edge.source.geometry.x + edge.source.geometry.width)) {
        // 在上下;
        startPoint.x = edge.geometry.points[0].x;

        if (edge.geometry.points[0].y < edge.source.geometry.y) {
          //上
          startPoint.y = edge.source.geometry.y;
        } else {
          // 下
          startPoint.y = edge.source.geometry.y + edge.source.geometry.height;
        }

      } else {
        // 在左右;
        if (edge.geometry.points[0].x > edge.source.geometry.x) {
          // 右
          startPoint.x = edge.source.geometry.x + edge.source.geometry.width;
        } else {
          // 左
          startPoint.x = edge.source.geometry.x;
        }

        startPoint.y = edge.geometry.points[0].y;
      }

      // 区分到target节点的第一个转折点是在节点的上下还是左右
      if (edge.geometry.points[edge.geometry.points.length - 1].x >= edge.target.geometry.x && edge.geometry.points[edge.geometry.points.length - 1].x <= (edge.target.geometry.x + edge.target.geometry.width)) {
        endPoint.x = edge.geometry.points[edge.geometry.points.length - 1].x;

        if (edge.geometry.points[0].y < edge.source.geometry.y) {
          //上
          endPoint.y = edge.target.geometry.y;
        } else {
          // 下
          endPoint.y = edge.target.geometry.y + edge.target.geometry.height;
        }
      } else {
        if (edge.geometry.points[0].x > edge.target.geometry.x) {
          // 右
          endPoint.x = edge.target.geometry.x + edge.target.geometry.width;
        } else {
          // 左
          endPoint.x = edge.target.geometry.x;
        }
        endPoint.y = edge.geometry.points[edge.geometry.points.length - 1].y;
      }

    }

    return {
      start: startPoint,
      end: endPoint
    };
  },
  fixCell: function (cell) {
    var node;
    if (cell.nodeType === processDesignConstant.NODE_TYPE.RECALL) {
      cell.style = 'rotatable=0;verticalAlign=top;align=left;overflow=fill;fontSize=16;strokeColor=#979AA3;fontFamily=Microsoft YaHei;html=1;';
      cell.geometry.height = 86;

      node = window.FLOWSTOREDATA.getDataById(cell.nodeType, cell.id);
      if (!node.activityServerEvents) {
        node.activityServerEvents = [{
          eventName: '节点初始化',
          serverEventOrder: 'Before'
        }, {
          eventName: '节点结束',
          serverEventOrder: 'After'
        }];
      }
      node.nodeType = cell.nodeType;
      cell.value = processDesign.updateCellValue(node);
    } else if (cell.nodeType === processDesignConstant.NODE_TYPE.INIT || cell.nodeType === processDesignConstant.NODE_TYPE.PIGEONHOLE) {
      cell.style = 'rotatable=0;verticalAlign=top;align=left;overflow=fill;fontSize=16;strokeColor=#979AA3;fontFamily=Microsoft YaHei;html=1;';
      cell.value = '<p class="k2-node-title"><span style="background:transparent url(' + processDesignConstant.NODE_ICON[processDesignConstant.NODE_TYPE.INIT] + ') no-repeat left center;background-size: 14px 14px;">' + cell.nodeName + '</span></p>' + processDesignUtils.generateElement([{ 'name': 'service' }]);
      cell.geometry.height = 86;
    } else if (cell.nodeType === processDesignConstant.NODE_TYPE.SUB_PROCESS) {
      cell.style = 'rotatable=0;verticalAlign=top;align=left;overflow=fill;fontSize=16;strokeColor=#979AA3;fontFamily=Microsoft YaHei;html=1;';
      cell.geometry.height = 86;

      node = window.FLOWSTOREDATA.getDataById(cell.nodeType, cell.id);
      if (!node.activityServerEvents) {
        node.activityServerEvents = [{
          eventName: '节点初始化',
          serverEventOrder: 'Before'
        }, {
          eventName: '节点结束',
          serverEventOrder: 'After'
        }];
      }

      if (!node.ipcEvent) {
        node.ipcEvent = {
          isSynchronization: 1
        };
      }
      node.nodeType = cell.nodeType;
      cell.value = processDesign.updateCellValue(node);
    }
  },
  updateCellValue: function (node) {
    const nodeItems = [];
    let value;

    if (node && node.eventConfigurationList) {
      for (let j = 0; j < node.eventConfigurationList.length; j++) {
        let nodeName = node.eventConfigurationList[j].eventName;
        nodeName = window.flowI18n.handerlNodeLabel(nodeName);
        nodeItems.push({ name: nodeName });
      }
    }
    //
    let activityName = node.activityInfo ? node.activityInfo.activityName : '';
    activityName = window.flowI18n.handerlNodeLabel(activityName);
    let className = 'k2-node-title';
    // 服务端
    if (node.nodeType === 9) {
      className = 'k2-node-title k2-node-title-server';
      // 子流程
    } else if (node.nodeType === 7) {
      className = 'k2-node-title k2-node-title-subprocess';
    }
    value = '<p class="' + className + '" ><span style="background:transparent url(' + processDesignConstant.NODE_ICON[node.nodeType] + ') no-repeat left center;background-size: 14px 14px;">' + activityName + '</span></p>' + processDesignUtils.generateElement(nodeItems);
    return value;
  },
  showCellPropertyWin: function (data) {
    //
    FLOWINSTANCE.propertyVisible = true;
    FLOWINSTANCE.$set(FLOWINSTANCE, 'propData', data);

  }
};

/**
 * 重写 HoverIcons.createArrow 方法 点击三角箭头触发
 */
HoverIcons.prototype.createArrow = function (img, tooltip) {
  var arrow = null;

  if (mxClient.IS_IE && !mxClient.IS_SVG) {
    // Workaround for PNG images in IE6
    if (mxClient.IS_IE6 && document.compatMode != 'CSS1Compat') {
      arrow = document.createElement(mxClient.VML_PREFIX + ':image');
      arrow.setAttribute('src', img.src);
      arrow.style.borderStyle = 'none';
    }
    else {
      arrow = document.createElement('div');
      arrow.style.backgroundImage = 'url(' + img.src + ')';
      arrow.style.backgroundPosition = 'center';
      arrow.style.backgroundRepeat = 'no-repeat';
    }

    arrow.style.width = (img.width + 4) + 'px';
    arrow.style.height = (img.height + 4) + 'px';
    arrow.style.display = (mxClient.IS_QUIRKS) ? 'inline' : 'inline-block';
  }
  else {
    arrow = mxUtils.createImage(img.src);
    arrow.style.width = img.width + 'px';
    arrow.style.height = img.height + 'px';
    arrow.style.padding = this.tolerance + 'px';
  }

  if (tooltip != null) {
    arrow.setAttribute('title', tooltip);
  }

  arrow.style.position = 'absolute';
  arrow.style.cursor = this.cssCursor;

  mxEvent.addGestureListeners(arrow, mxUtils.bind(this, function (evt) {
    if (this.currentState != null && !this.isResetEvent(evt)) {
      // this.mouseDownPoint = mxUtils.convertPoint(this.graph.container,
      //     mxEvent.getClientX(evt), mxEvent.getClientY(evt));
      // this.drag(evt, this.mouseDownPoint.x, this.mouseDownPoint.y);
      this.drag(evt, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
      this.activeArrow = arrow;
      this.setDisplay('none');
      mxEvent.consume(evt);
    }
  }));

  // Captures mouse events as events on graph
  mxEvent.redirectMouseEvents(arrow, this.graph, this.currentState);

  mxEvent.addListener(arrow, 'mouseenter', mxUtils.bind(this, function (evt) {
    // Workaround for Firefox firing mouseenter on touchend
    if (mxEvent.isMouseEvent(evt)) {
      if (this.activeArrow != null && this.activeArrow != arrow) {
        mxUtils.setOpacity(this.activeArrow, this.inactiveOpacity);
      }

      this.graph.connectionHandler.constraintHandler.reset();
      mxUtils.setOpacity(arrow, 100);
      this.activeArrow = arrow;
    }
  }));

  mxEvent.addListener(arrow, 'mouseleave', mxUtils.bind(this, function (evt) {
    // Workaround for IE11 firing this event on touch
    if (!this.graph.isMouseDown) {
      this.resetActiveArrow();
    }
  }));

  return arrow;
};

/**
 * @FunctionName: 重写键盘事件 调用
 * @param {*} evt
 * @return {*}
 * @Author: zhuzhaoyang
 * @Date: 2021-03-01 11:15:10
 * @Modification history: 
 * @Description: 
 */
mxKeyHandler.prototype.rewriteGetFunction = function (evt, val) {
  val = val[0];
  if (val.ctrlKey) {
    // yuminghao复写
    // 当节点被选中时 键盘事件会被触发两次，所以在此通过时间戳判断，以防键盘的重复事件
    if (val.timeStamp === window.FLOWSTOREDATA.KeyHandlerTimeStamp) {
      return;
    }
    window.FLOWSTOREDATA.KeyHandlerTimeStamp = val.timeStamp;

    const eventsOporates = FLOWINSTANCE.editorUi.eventsOporates();
    // 复制
    if (val.keyCode === 67) {
      // actionCtrlC(eventsOporates);
      FLOWINSTANCE['copyCell'] = this.graph.getSelectionCell();
      // 粘贴
    } else if (val.keyCode === 86) {
      // actionCtrlV(eventsOporates);
      // 撤销
      // yuminghao 撤销功能 Ctrl+Z
    } else if (val.keyCode === 90) {
      actionCtrlZ(eventsOporates);
      // 反撤销
      // yuminghao 重做功能 Ctrl+y
    } else if (val.keyCode === 89) {
      actionCtrlY(eventsOporates);
      // 删除
    } else if (val.keyCode === 46) {
      actionDelete(eventsOporates);
    }
  }
};
/**
 * @FunctionName: 复制
 * @param {*}
 * @return {*}
 * @Author: zhuzhaoyang
 * @Date: 2021-03-02 13:14:56
 * @Modification history: 
 * @Description: 
 */
function actionCtrlC(eventsOporates) {
  eventsOporates.copy(eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[0]]);
}
/**
 * @FunctionName: 粘贴
 * @param {*}
 * @return {*}
 * @Author: zhuzhaoyang
 * @Date: 2021-03-02 13:15:04
 * @Modification history: 
 * @Description: 
 */
function actionCtrlV(eventsOporates) {
  eventsOporates.paste(eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[1]]);
}
/**
 * @FunctionName: 撤销
 * @param {*}
 * @return {*}
 * @Author: zhuzhaoyang
 * @Date: 2021-03-02 13:15:17
 * @Modification history: 
 * @Description: 
 */
function actionCtrlZ(eventsOporates) {
  window.FLOWSTOREDATA.undoStack();
}
/**
 * @FunctionName: 反撤销
 * @Author: mhyu
 * @param {*} eventsOporates
 * @return {*}
 * @Date: 2022-06-21 11:03:45
 * @Description: 
 */
function actionCtrlY(eventsOporates) {
  window.FLOWSTOREDATA.redoStack();
}
/**
 * @FunctionName: 删除
 * @param {*}
 * @return {*}
 * @Author: zhuzhaoyang
 * @Date: 2021-03-02 13:15:25
 * @Modification history: 
 * @Description: 
 */
function actionDelete(eventsOporates) {
  eventsOporates.delete(eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[2]]);
}
/**
 * Function: redrawHtmlShape
 *
 * Updates the HTML node(s) to reflect the latest bounds and scale.
 */
mxText.prototype.redrawHtmlShape = function () {
  var style = this.node.style;

  // Resets CSS styles
  style.whiteSpace = 'normal';
  style.overflow = '';
  style.width = '';
  style.height = '';
  //  yuminghao 复写部分
  //  加一小段延时，保证页面有生成 节点可挂载的dom
  setTimeout(() => {
    this.updateValue();
  });
  this.updateFont(this.node);
  this.updateSize(this.node, (this.state == null || this.state.view.textDiv == null));

  this.offsetWidth = null;
  this.offsetHeight = null;

  if (mxClient.IS_IE && (document.documentMode == null || document.documentMode <= 8)) {
    this.updateHtmlFilter();
  } else {
    this.updateHtmlTransform();
  }
};
/**
 * Function: updateValue
 *
 * Updates the HTML node(s) to reflect the latest bounds and scale.
 */
mxText.prototype.updateValue = function () {
  if (mxUtils.isNode(this.value)) {
    this.node.innerHTML = '';
    this.node.appendChild(this.value);
  } else {
    var val = this.value;

    if (this.dialect != mxConstants.DIALECT_STRICTHTML) {
      val = mxUtils.htmlEntities(val, false);
    }

    // Handles trailing newlines to make sure they are visible in rendering output
    val = mxUtils.replaceTrailingNewlines(val, '<div><br></div>');
    val = (this.replaceLinefeeds) ? val.replace(/\n/g, '<br/>') : val;
    var bg = (this.background != null && this.background != mxConstants.NONE) ? this.background : null;
    var bd = (this.border != null && this.border != mxConstants.NONE) ? this.border : null;

    if (this.overflow == 'fill' || this.overflow == 'width') {
      if (bg != null) {
        this.node.style.backgroundColor = bg;
      }

      if (bd != null) {
        this.node.style.border = '1px solid ' + bd;
      }
    } else {
      var css = '';

      if (bg != null) {
        css += 'background-color:' + bg + ';';
      }

      if (bd != null) {
        css += 'border:1px solid ' + bd + ';';
      }

      // Wrapper DIV for background, zoom needed for inline in quirks
      // and to measure wrapped font sizes in all browsers
      // FIXME: Background size in quirks mode for wrapped text
      var lh = (mxConstants.ABSOLUTE_LINE_HEIGHT) ? (this.size * mxConstants.LINE_HEIGHT) + 'px' :
        mxConstants.LINE_HEIGHT;
      val = '<div style="zoom:1;' + css + 'display:inline-block;_display:inline;text-decoration:inherit;' +
        'padding-bottom:1px;padding-right:1px;line-height:' + lh + '">' + val + '</div>';
    }
    // yuminghao 复写部分
    // 因为每个流程有 start init等节点是固定的id 所以通过processSetId 生成该流程的唯一id
    let idUUid = window.FLOWINSTANCE.idUUid;
    var id = idUUid + this.state.cell.id;

    var dom = document.getElementById(id);
    if (dom) {
      this.node.appendChild(dom);
    } else {
      this.node.innerHTML = val;
    }
    // Sets text direction
    var divs = this.node.getElementsByTagName('div');

    if (divs.length > 0) {
      var dir = this.textDirection;

      if (dir == mxConstants.TEXT_DIRECTION_AUTO && this.dialect != mxConstants.DIALECT_STRICTHTML) {
        dir = this.getAutoDirection();
      }

      if (dir == mxConstants.TEXT_DIRECTION_LTR || dir == mxConstants.TEXT_DIRECTION_RTL) {
        divs[divs.length - 1].setAttribute('dir', dir);
      } else {
        divs[divs.length - 1].removeAttribute('dir');
      }
    }
  }
};
/**
 * @FunctionName: 处理线的坐标数据
 * @param {*}
 * @return {*}
 * @Author: mhyu
 * @Date: 2022-05-10 16:30:59
 * @Description: 
 */
function changePoint(list) {
  if (list.length >= 3) {
    let index = null;
    for (let i in list) {
      i = parseInt(i);
      // X轴相同说明是折弯
      if (list[i] && list[i + 1] && list[i + 2] && (list[i].x === list[i + 1].x) && (parseInt(Math.abs(list[i].y - list[i + 1].y)) <= 50)) {
        index = i;
        break;
      }
    }
    if (index !== null) {
      list[index].x = list[index + 2].x;
      list.splice(index + 1, 1);
    }
  }
  return list;
}