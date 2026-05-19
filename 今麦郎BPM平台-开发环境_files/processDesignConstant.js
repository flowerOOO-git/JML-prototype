const processDesignConstant = {
  ENGINE_TYPE: {
    K2: 'K2',
    FLOWABLE: 'Flowable'
  },
  iconBaseUrl: 'static/flowDesigner/',
  NODE_TYPE: {
    // 开始节点类型
    START: 1,
    // 初始化节点类型
    INIT: 2,
    // 归档节点类型
    PIGEONHOLE: 3,
    // 重新提交节点类型
    RECALL: 4,
    // 结束节点类型
    END: 5,
    // client节点类型
    CLIENT: 6,
    // 子流程节点类型
    SUB_PROCESS: 7,
    // 矩陣节点类型
    TOA: 8,
    // service节点类型
    SERVICE: 9,
    // 自循环节点类型
    SELF_LOOP: 10,
    // 普通的线类型
    LINE: 99,
    // 循环节点，TOA节点自带的自循环线类型
    SELF_LINE: 100,
    // 以循环节点为起始点的线类型
    FROM_LOOP_NODE_LINE: 98,
    // 迭代节点类型
    ITERATION: 11,
    // 瀑布节点类型
    WATERFALL: 12,
    // 网关节点类型
    GATEWAY: 13,
    // flowable引擎下的结束节点的类型
    FLOWABLE_END: 14,
    // 流程挂起节点
    HANG_UP: 15,
    // 总分总开始
    TOTAL_GROSS_START: 16,
    // 总分总结束
    TOTAL_GROSS_END: 17,
  },
  // 节点对应的初始化nodeName
  NODE_NAME: {
    6: window.flowI18n.$t('flowDesigner.node_name6'),
    7: window.flowI18n.$t('flowDesigner.node_name7'),
    8: window.flowI18n.$t('flowDesigner.node_name8'),
    9: window.flowI18n.$t('flowDesigner.node_name9'),
    10: window.flowI18n.$t('flowDesigner.node_name10'),
    11: window.flowI18n.$t('flowDesigner.node_name11'),
    12: window.flowI18n.$t('flowDesigner.node_name12'),
    13: window.flowI18n.$t('flowDesigner.node_name13'),
    14: window.flowI18n.$t('flowDesigner.node_name14'),
    16: window.flowI18n.$t('flowDesigner.node_name16'),
    17: window.flowI18n.$t('flowDesigner.node_name17'),
  },
  // 节点的类型
  ACTIVITY_TYPE: {
    // 标准独立节点
    STANDARD: '0',
    // 循环节点
    SELF_LOOP: '1',
    // 虚拟节点
    VIRTUAL: '2',
    // service节点
    SERVICE: '3',
    // flowable引擎下的结束节点
    FLOWABLE_END: '4',
    // 网关节点
    GATEWAY: '5',
    // 总分总开始
    TOTAL_GROSS_START: '6',
    // 总分总结束
    TOTAL_GROSS_END: '7'
  },
  // 循环审批类型
  ACTIVITY_CYCLE_TYPE: {
    // 迭代审批
    ORDER: 0,
    // 矩阵审批
    MATRIX: 1,
    // 瀑布审批
    CUSTOM: 2,
    // 自由流审批
    FREE: 3
  },
  // 节点的形状
  NODE_SHAPE: {
    STANDARD: 'standard',
    SCROLL: 'scroll',
    // 菱形：判断类节点
    JUDGE: 'judge'
  },
  NODE_BACKGROUND_IMAGE: {
    default: 'images/properties.png',
    service: 'images/services.png'
  },
  // 页面初始化固定不能删除的节点name
  REMOVE_WHITE_LIST: [
    'start',
    'init',
    'recall',
    'pigeonhole',
    'end'
  ],
  // 节点图标
  NODE_THUMB_ICON: {
    6: STENCIL_PATH + '/clipart/client_activity1.png',
    7: STENCIL_PATH + '/clipart/ipc_activity1.png',
    8: STENCIL_PATH + '/clipart/toa_activity1.png',
    9: STENCIL_PATH + '/clipart/server_activity1.png',
    10: STENCIL_PATH + '/clipart/cycle_activity1.png',
    13: STENCIL_PATH + '/clipart/server_activity1.png',
    14: STENCIL_PATH + '/clipart/end_activity.png',
    16: STENCIL_PATH + '/clipart/ipc_activity1.png',
    17: STENCIL_PATH + '/clipart/ipc_activity1.png'
  },
  NODE_THUMB_CLASS_NAME: {
    // 客户端
    6: 'paifont pai-wodeyiban process-icon',
    // 子流程节点
    7: 'paifont pai-zuzhijiagou2 process-icon',
    // 矩阵
    8: 'paifont pai-juzhen process-icon',
    // 服务端
    9: 'paifont pai-shitu process-icon',
    // 自循环
    10: 'paifont pai-xunhuan1 process-icon',
    11: 'paifont pai-xunhuan1 process-icon',
    12: 'paifont pai-xunhuan1 process-icon',
    13: 'paifont pai-wangguan1 process-icon',
    // 结束
    14: 'icon-font icon-end',
    // 并行开始
    16: 'paifont pai-zongfenzongkaishi process-icon',
    // 并行结束
    17: 'paifont pai-zongfenzongjieshu process-icon',
  },
  NODE_DRAWER_BACKGROUD:{
    // 客户端
    6: 'bgl',
    // 子流程节点
    7: 'bgq',
    // 矩阵
    8: 'bgl',
    // 服务端
    9: 'bgh',
    // 自循环
    10: 'bgl',
    // 重新提交
    4: 'bgl',
    // 归档
    3: 'bgh',
    // 流程初始化
    2: 'bgh',
  },
  NODE_ICON: {
    1: STENCIL_PATH + '/clipart/start.png',
    2: STENCIL_PATH + '/clipart/init.png',
    3: STENCIL_PATH + '/clipart/pigeonhole.png',
    4: STENCIL_PATH + '/clipart/recall.png',
    5: STENCIL_PATH + '/clipart/end.png',
    6: STENCIL_PATH + '/clipart/user_white.png',
    7: STENCIL_PATH + '/clipart/sub_process.png',
    8: STENCIL_PATH + '/clipart/toa_white.png',
    9: STENCIL_PATH + '/clipart/server.png',
    10: STENCIL_PATH + '/clipart/cycle.png',
    11: STENCIL_PATH + '/clipart/cycle.png',
    12: STENCIL_PATH + '/clipart/cycle.png',
    13: STENCIL_PATH + '/clipart/server.png',
    14: STENCIL_PATH + '/clipart/stop.png',
    16: STENCIL_PATH + '/clipart/sub_process.png',
    17: STENCIL_PATH + '/clipart/sub_process.png'
  },
  // 流程图初始化各节点相关数据
  INIT_DATA: [
    {
      activityInfo: {
        id: 'start',
        nodeType: 1,
        activityName: 'Start'
      },
      approvalBehaviorAndResults: {},
    },
    {
      activityInfo: {
        id: 'init',
        nodeType: 2,
        activityName: '流程初始化',
        activityType: '3',
        activityCycleType: '3',
        displayName:{
          en: 'Process Initialization',
          zh_CN: '流程初始化'
        }
      },
      approvalBehaviorAndResults: {},
      eventConfigurationList: [{
        serverEvent: {
          eventName: '流程初始化',
        },
        eventName: '流程初始化',
        orderIndex: 0,
        serverEventOrder:'Before',
        type: 'serverEvent'
      }]
    },
    {
      activityInfo: {
        id: 'recall',
        nodeType: 4,
        activityName: '重新提交',
        activityType: '0',
        activityCycleType: '0',
        displayName:{
          en: 'reSubmit',
          zh_CN: '重新提交'
        },
        // 审批方式: 0|同时, 1|一次一个
        activityApprovalMode:'0'
      },
      approvalBehaviorAndResults: {
        clientEventObj: {
          clientEvent: {
            eventName: '重新提交',
          },
          clientEventName: '重新提交',
          orderIndex: 1,
          type: 'clientEvent'
        },
        activityActionObjList:[{
          actionCode:null,
          actionDisplayName:'reSubmit',
          actionId:'',
          actionName:'reSubmit',
          actionType: 'Finish',
          defaultAction:null,
          displayName:{en: 'reSubmit', zh_CN: '重新提交'},
          enable: 1,
          functionId:null,
          functionRelId:null,
          mapperMethod:null,
          objectPId:null,
          orderIndex:null,
          pid:null,
          type:'标准'
        }],
        outComeObjList:[{
          basicRule:'All',
          displayName:{en: 'reSubmit', zh_CN: '重新提交'},
          objectPId:null,
          outComeName:'reSubmit',
          outComeRule:null,
          outComeRuleCode:null,
          outComeRuleDesc:null,
          outComeRuleJson:'',
          outComeRuleType:null,
          pid:'',
        }],
      },
      candidates: {
        activityDestination:{
          // yuminghao复写 重新提交 规则配置为 创建人本人
          destinationRule: '40c07c48-e571-4c9d-be6b-270d9115f8c0',
          destinationRuleType:'0',
          destinationRuleDesc: {
            en: 'Person selection rules configured',
            zh_CN: '已配置选人规则'
          },
          destinationRuleJson:[{
            autoSkip: '',
            ccEmailFlag: 0,
            ccFlag: 0,
            ccNoticeTemplateId: '',
            dynamicRuleJson: null,
            id: '',
            matrixCompanyFormIdPath: '',
            matrixFied: '',
            matrixFiedDisplayNames: '',
            matrixId: '',
            matrixObjectName: '',
            matrixOrgFormIdPath: '',
            matrixRuleDesc: '',
            matrixRuleId: '',
            matrixRuleJson: '',
            matrixTableName: '',
            orderIndex: 0,
            processObjId: '',
            processSetId: '',
            ruleDisplayNames: '',
            ruleIds: '',
            ruleName: null,
            ruleType: 3,
            templateName: '',
            triggerRuleDesc: null,
            triggerRuleId: 'f5cf7dd9-b23b-4953-8281-a00b9a498b0c',
            triggerRuleJson: null,
            uuid: '2f0f8c70-87e8-4d64-96d0-9c24728a63a8',
          }]
        }
      },
      eventConfigurationList: [
        {
          serverEvent: {
            eventName: '节点初始化',
          },
          eventName: '节点初始化',
          orderIndex: 0,
          serverEventOrder:'Before',
          type: 'serverEvent'
        },
        {
          clientEvent: {
            eventName: '重新提交',
          },
          eventName: '重新提交',
          orderIndex: 1,
          type: 'clientEvent'
        },
        {
          serverEvent: {
            eventName: '节点结束',
          },
          eventName: '节点结束',
          orderIndex: 2,
          serverEventOrder:'After',
          type: 'serverEvent'
        }
      ]
    },
    {
      activityInfo: {
        id: 'client',
        nodeType: 6,
        activityName: window.flowI18n.$t('flowDesigner.activityName.client'),
        activityType: '0',
        activityCycleType: '0',
        displayName:{
          en: 'client',
          zh_CN: '用户节点'
        },
        // 审批方式: 0|同时, 1|一次一个
        activityApprovalMode:'0'
      },
      approvalBehaviorAndResults: {
        clientEventObj: {
          clientEvent: {
            eventName: 'clientEvent'
          },
          clientEventName: 'clientEvent',
          orderIndex: 1,
          type: 'clientEvent'
        },
        activityActionObjList:[{
          actionCode:null,
          actionDisplayName:'Accept',
          actionId:'',
          actionName:'Accept',
          actionType: 'Finish',
          defaultAction:null,
          displayName:{en: 'Accept', zh_CN: '审核通过'},
          enable: 1,
          functionId:null,
          functionRelId:null,
          mapperMethod:null,
          objectPId:null,
          orderIndex:null,
          pid:null,
          type:'标准'
        }],
        outComeObjList:[{
          basicRule:'All',
          displayName:{en: 'Accept', zh_CN: '审核通过'},
          objectPId:null,
          outComeName:'Accept',
          outComeRule:null,
          outComeRuleCode:null,
          outComeRuleDesc:null,
          outComeRuleJson:'',
          outComeRuleType:null,
          pid:'',
        }],
      },
      candidates: {},
      eventConfigurationList: [
        {
          serverEvent: {
            eventName: '节点初始化',
          },
          eventName: '节点初始化',
          orderIndex: 0,
          serverEventOrder:'Before',
          type: 'serverEvent'
        },
        {
          clientEvent: {
            eventName: 'clientEvent'
          },
          eventName: 'clientEvent',
          orderIndex: 1,
          type: 'clientEvent'
        },
        {
          serverEvent: {
            eventName: '节点结束',
          },
          eventName: '节点结束',
          orderIndex: 2,
          serverEventOrder:'After',
          type: 'serverEvent'
        }
      ]
    },
    {
      activityInfo: {
        id: 'pigeonhole',
        nodeType: 3,
        activityName: window.flowI18n.$t('flowDesigner.activityName.pigeonhole'),
        activityType: '3',
        activityCycleType: '3',
        displayName:{
          en: 'Place File',
          zh_CN: '归档'
        }
      },
      approvalBehaviorAndResults: {},
      eventConfigurationList: [
        {
          serverEvent: {
            eventName: '归档',
          },
          eventName: '归档',
          orderIndex: 0,
          type: 'serverEvent'
        }
      ]
    },
    {
      activityInfo: {
        id: 'end',
        nodeType: 5,
        activityName: window.flowI18n.$t('flowDesigner.activityName.end'),
      },
      approvalBehaviorAndResults: {},
      eventConfigurationList: [
        {
          serverEvent: {
            eventName:'流程结束',
          },
          eventName: '流程结束',
          orderIndex: 0,
          serverEventOrder:'After',
          type: 'serverEvent'
        }
      ]
    }
  ],
  initData: {
    workflow: {
      '_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
      processData: {
        lineRuleObjList: []
      },
      activitysData: []
    }
  },
  // 矩阵 自由流 初始化节点 数据做判断用，不配置多语言
  FREE_FALL_START_NAME:'初始化',
  // 矩阵 自由流 场景结束 数据做判断用，不配置多语言
  FREE_FALL_END_NAME:'场景结束',
};
// 颜色表
const processColor = {
  $nblColor01: '#003865',
  $nblColor02: '#F2F6F9',
  $nblColor03: '#7693A5',
  $nblColor04: '#404040',
  $nblColor05: '#FFFFFF',
  $nblColor06: '#C6C6C6',
  $nblColor07: '#70B9EB',
  $nblColor08: '#007548',
  $nblColor09: '#F0AD4E',
  // 警告色
  $nblColor10: '#E0403B',
  $nblColor11: '#EEEEEE',
  // 已执行
  $completedColor: '#1DCC8F',
  // 当前
  $activeColor: '#4469EC',
  // 等待
  $waitingColor: 'FFAA10',
  // 未执行
  $defaultColor: '#CACFD3',
  // 出错
  $errorColor: '#E03144',
  $defaultFontColor: '#979AA3'
};
window.processDesignConstant = processDesignConstant;
window.processColor = processColor;
