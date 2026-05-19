/*
 * @Description: 重写mxGraph EditorUi.js 基类
 * @Author: 忆达夫
 * @Date: 2018/11/20
 * @Last Modified by: 忆达夫
 * @Last Modified time: 11:05
 */

/**
 * Creates the required containers.
 */

/**
 * Specifies the size of the split bar.
 */
EditorUi.prototype.splitSize = 0;

/**
 * "Installs" menus in EditorUi.
 */
EditorUi.prototype.createMenus = function () {
  return new Menus(this);
};

EditorUi.prototype.createUi = function () {
  // Creates menubar
  // this.menubar = (this.editor.chromeless) ? null : this.menus.createMenubar(this.createDiv('geMenubar'));

  // 生成头部菜单
  //this.menubar = (this.editor.chromeless) ? null : this.menus.createNavMenu(this.createDiv('geMenubar'), false);

  if (this.menubar != null) {
    this.menubarContainer.appendChild(this.menubar.container);
  }
  //
  if (this.navMenu != null) {
    this.menubarContainer.appendChild(this.navMenu.container);
  }

  // Adds status bar in menubar
  if (this.menubar != null) {
    this.statusContainer = this.createStatusContainer();

    // Connects the status bar to the editor status
    this.editor.addListener('statusChanged', mxUtils.bind(this, function () {
      this.setStatusText(this.editor.getStatus());
    }));

    this.setStatusText(this.editor.getStatus());
    this.menubar.container.appendChild(this.statusContainer);

    // Inserts into DOM
    document.body.appendChild(this.menubarContainer);
  }

  // Creates the sidebar
  this.sidebar = (this.editor.chromeless) ? null : this.createSidebar(this.sidebarContainer);

  if (this.sidebar != null && !window.isHideSidebar) {
    this.container.appendChild(this.sidebarContainer);
  }

  // Creates the format sidebar
  this.format = (this.editor.chromeless || !this.formatEnabled) ? null : this.createFormat(this.formatContainer);

  // if (this.format != null) {
  //     this.container.appendChild(this.formatContainer);
  // }

  // Creates the footer
  var footer = (this.editor.chromeless) ? null : this.createFooter();

  if (footer != null) {
    // 新增一个导出xml按钮
    var graph = this.editor.graph;
    // 设置不能重复连接
    //graph.setMultigraph(false);
    var viewXml = mxUtils.button('View XML', function () {
      var encoder = new mxCodec();

      var node = encoder.encode(graph.getModel());
      // 获得表单上的图形数据，类型为字符串
      var xmlnode = mxUtils.getPrettyXml(node);
      // 将字符串展示
      mxUtils.popup(xmlnode, true);
      // mxWindow(title, content, x, y, width, height, minimizable, movable, replaceNode, style)
    });
    // 添加导入按钮
    var importXml = mxUtils.button('import xml', function () {
      function read(graph, filename) {
        var req = mxUtils.load(filename);
        var root = req.getDocumentElement();
        var dec = new mxCodec(root.ownerDocument);
        dec.decode(root, graph.getModel());

      }

      // Load cells and layouts the graph
      graph.getModel().beginUpdate();
      try {
        // Loads the mxGraph file format (XML file)
        read(graph, 'js/xmlToJson/demo.xml');
        // read(graph, 'js/xmlToJson/demo.xml');
        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        // 获得默认的父元素。
        var parent = graph.getDefaultParent();
        // 布局到父元素
        // Executes the layout
        new mxFastOrganicLayout(graph).execute(parent);
      }
      finally {
        // Updates the display
        graph.getModel().endUpdate();
      }
    });
    // 新增欢迎页面
    var homeContent =  this.createDiv('home-content');
    var createContainer = this.createDiv('create-container');
    var openFileContainer = this.createDiv('open-file-container');
    var createBtn = this.createDiv('icon-font icon-create');
    var openFileBtn = this.createDiv('icon-font icon-open');
    var viewshow=document.getElementById('process-viewshow');
    // var openProcess=document.getElementById('openProcess');
    // var createProcess=document.getElementById('createProcess');
    var proccesBtn=document.getElementById('procces-btn');

    var createText = this.createDiv('text');
    createText.innerText = window.flowI18n.$t('flowDesigner.createbtn');

    var openFileText = this.createDiv('text');
    openFileText.innerText = window.flowI18n.$t('flowDesigner.openbtn');

    var testText = this.createDiv('button');
    testText.type = 'button';
    if(!window.NODE_TYPE_STYLE){
      homeContent.appendChild(testText);
    }


    createContainer.appendChild(createBtn);
    createContainer.appendChild(createText);

    openFileContainer.appendChild(openFileBtn);
    openFileContainer.appendChild(openFileText);
    
    if(!window.NODE_TYPE_STYLE){
      // homeContent.appendChild(createContainer);
      // homeContent.appendChild(openFileContainer);
      if(document.getElementById('process-viewshow')!=null){
        homeContent.appendChild(viewshow);
      }
    }

    // 添加事件
    /*createContainer.onclick = mxUtils.bind(this.menus, this.menus.handlers['create']);
    openFileContainer.onclick = mxUtils.bind(this.menus, this.menus.handlers['open']);*/
    if(proccesBtn!=null){
      proccesBtn.onclick = function () {
        FLOWINSTANCE.createNewFlow();
      };
    }

    // openProcess.onclick = function () {
    //   FLOWINSTANCE.open();
    // };
    if (!window.isHideHomeContainer) {
      this.homeContainer.appendChild(homeContent);
      this.container.appendChild(this.homeContainer);
    }
  }

  if (this.sidebar != null && this.sidebarFooterContainer && !window.isHideSidebar) {
    this.container.appendChild(this.sidebarFooterContainer);
  }

  this.container.appendChild(this.diagramContainer);

  if (this.container != null && this.tabContainer != null) {
    this.container.appendChild(this.tabContainer);
  }

  // Creates toolbar
  // 隐藏toolbar
  this.toolbar = (this.editor.chromeless) ? null : this.createToolbar(this.createDiv('geToolbar'));

  // if (this.toolbar != null) {
  //     this.toolbarContainer.appendChild(this.toolbar.container);
  //     this.container.appendChild(this.toolbarContainer);
  // }

  // HSplit
  if (this.sidebar != null && !window.isHideSidebar) {
    this.container.appendChild(this.hsplit);

    this.addSplitHandler(this.hsplit, true, 0, mxUtils.bind(this, function (value) {
      this.hsplitPosition = value;
      this.refresh();
    }));
  }
};


/**
 * 创建默认存在的节点
 */
EditorUi.prototype.createDefaultNode = function () {
  var graph = this.editor.graph;
  var parent = graph.getDefaultParent();

  graph.getModel().beginUpdate();
  try {
    // 开始节点
    var startStyle = 'shadow=0;fillColor=#1DCC8F;strokeColor=white;fontColor=' + processColor.$nblColor05 + ';rounded=1;arcSize=50;fontSize=14;fontFamily=Microsoft YaHei;right;html=1;';
    // 结束结束
    var endStyle = 'shadow=0;fillColor=#F14D5F;strokeColor=white;fontColor=' + processColor.$nblColor05 + ';rounded=1;arcSize=50;fontSize=14;fontFamily=Microsoft YaHei;right;html=1;';
    // 节点
    var nodeStyle = 'shadow=0;rounded=1;arcSize=20;rotatable=1;arcSize=20;verticalAlign=top;align=left;overflow=fill;fontSize=16;strokeColor=white;fontFamily=Microsoft YaHei;html=1;';
    // 节点样式
    // var style = 'rotatable=0;verticalAlign=top;align=left;overflow=fill;fontSize=16;strokeColor=#bababa;fontFamily=Microsoft YaHei;html=1;';
    // var style1 = 'rotatable=0;whiteSpace=nowrap;overflow=hidden;fillColor=#003865;fontSize=16;strokeColor=transparent;fontColor=' + processColor.$nblColor05 + ';fontFamily=Microsoft YaHei;right;html=1;';
    var lineStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;';
    //
    // var styleValue01 = 'background:#003865;margin:0;padding:0;text-align: center;height:24px;line-height: 24px;';

    var startNodeValue = '<p style="margin:0;padding:0 0 0 18px;background:url(' + processDesignConstant.NODE_ICON[processDesignConstant.NODE_TYPE.START] + ') no-repeat left center;background-size: 14px 14px;">Start</p>';
    var endNodeValue = '<p style="margin:0;padding:0 0 0 18px;background:url(' + processDesignConstant.NODE_ICON[processDesignConstant.NODE_TYPE.END] + ') no-repeat left center;background-size: 14px 14px;">'+window.flowI18n.$t('flowDesigner.activityName.end')+'</p>';
    var initNodeValue = '<p class="k2-node-title"><span style="background:transparent url(' + processDesignConstant.NODE_ICON[processDesignConstant.NODE_TYPE.INIT] + ') no-repeat left center;">'+window.flowI18n.$t('flowDesigner.activityName.start')+'<</span></p>' + processDesignUtils.generateElement([{'name': window.flowI18n.$t('flowDesigner.activityName.start')}]);
    var recallNodeValue = '<p class="k2-node-title"><span style="background:transparent url(' + processDesignConstant.NODE_ICON[processDesignConstant.NODE_TYPE.RECALL] + ') no-repeat left center;">重新提交</span></p>' + processDesignUtils.generateElement([{'name': window.flowI18n.$t('flowDesigner.activityName.recall')}]);
    var pigeonholeNodeValue = '<p class="k2-node-title"><span style="background:transparent url(' + processDesignConstant.NODE_ICON[processDesignConstant.NODE_TYPE.PIGEONHOLE] + ') no-repeat left center;">'+window.flowI18n.$t('flowDesigner.activityName.pigeonhole')+'</span></p>' + processDesignUtils.generateElement([{'name': window.flowI18n.$t('flowDesigner.activityName.pigeonhole')}]);
    var clientNodeValue = '<p class="k2-node-title"><span style="background:transparent url(' + processDesignConstant.NODE_ICON[processDesignConstant.NODE_TYPE.CLIENT] + ') no-repeat left center;">client</span></p>' + processDesignUtils.generateElement([{'name': 'client'}]);
    // 开始节点 左 上 宽 高
    graph.insertVertex(parent, 'start', startNodeValue, 300, 20, 150, 40, startStyle, null, processDesignConstant.NODE_TYPE.START, 'Start');
    // 初始化节点
    graph.insertVertex(parent, 'init', initNodeValue, 300, 150, 150, 110, nodeStyle, null, processDesignConstant.NODE_TYPE.INIT, '流程初始化');
    // 重新提交 有下面footer 所以高度更高
    graph.insertVertex(parent, 'recall', recallNodeValue, 500, 150, 150, 142, nodeStyle, null, processDesignConstant.NODE_TYPE.RECALL, '重新提交');
    // 用户节点 有下面footer 所以高度更高
    graph.insertVertex(parent, 'client', clientNodeValue, 300, 300, 150, 142, nodeStyle, null, processDesignConstant.NODE_TYPE.CLIENT, window.flowI18n.$t('flowDesigner.activityName.client'));
    // 归档
    graph.insertVertex(parent, 'pigeonhole', pigeonholeNodeValue, 300, 470, 150, 110, nodeStyle, null, processDesignConstant.NODE_TYPE.PIGEONHOLE, '归档');
    // 结束节点
    graph.insertVertex(parent, 'end', endNodeValue, 300, 620, 150, 40, endStyle, null, processDesignConstant.NODE_TYPE.END, '流程结束');
    var cells = graph.getModel().cells;

    graph.insertEdge(parent, 'startToInit', null, cells['start'], cells['init'], lineStyle);
    
    graph.insertEdge(parent, 'initToClient', null, cells['init'], cells['client'], lineStyle);
    // yuminghao 复写初始化到重新提交的默认线规则 false
    graph.insertEdge(parent, 'initToRecall', 'false', cells['init'], cells['recall'], lineStyle);
    // yuminghao 复写重新提交到用户节点的默认线规则 重新提交
    graph.insertEdge(parent, 'recallToClient', 'reSubmit', cells['recall'], cells['client'], lineStyle);

    graph.insertEdge(parent, 'clientToPigeonhole', null, cells['client'], cells['pigeonhole'], lineStyle);
    graph.insertEdge(parent, 'pigeonholeToEnd', null, cells['pigeonhole'], cells['end'], lineStyle);

    for (var j in cells) {
      if (cells.hasOwnProperty(j) && cells[j].edge) {
        var geo = cells[j].geometry, startPt, middlePt, endPt, pt;

        if (cells[j].id === 'recallToClient') {
          if (!geo.points) {
            geo.points = [];
          }

          pt = new mxPoint(cells[j].source.geometry.x + (cells[j].source.geometry.width / 2), cells[j].target.geometry.y + (cells[j].target.geometry.height / 2));
          geo.points.push(pt);
        } else if (cells[j].id === 'initToRecall') {
          startPt = new mxPoint(cells[j].source.geometry.x + cells[j].source.geometry.width, cells[j].source.geometry.y + (cells[j].source.geometry.height / 2));
          middlePt = new mxPoint((cells[j].source.geometry.x + cells[j].source.geometry.width) + (cells[j].target.geometry.x - cells[j].source.geometry.x - cells[j].source.geometry.width) / 2, cells[j].target.geometry.y + (cells[j].target.geometry.height / 2));
          endPt = new mxPoint(cells[j].target.geometry.x, cells[j].target.geometry.y + (cells[j].target.geometry.height / 2));
          if (!geo.abspoints) {
            geo.abspoints = [];
          }
          geo.abspoints.push(startPt);
          geo.abspoints.push(middlePt);
          geo.abspoints.push(endPt);
        } else {
          startPt = new mxPoint(cells[j].source.geometry.x + (cells[j].source.geometry.width / 2), cells[j].source.geometry.y + cells[j].source.geometry.height);
          middlePt = new mxPoint(cells[j].source.geometry.x + (cells[j].source.geometry.width / 2), (cells[j].source.geometry.y + cells[j].source.geometry.height) + (cells[j].target.geometry.y - cells[j].source.geometry.y - cells[j].source.geometry.height) / 2);
          endPt = new mxPoint(cells[j].target.geometry.x + (cells[j].target.geometry.width / 2), cells[j].target.geometry.y);
          if (!geo.abspoints) {
            geo.abspoints = [];
          }
          geo.abspoints.push(startPt);
          geo.abspoints.push(middlePt);
          geo.abspoints.push(endPt);
        }
      }
    }
    // yuminghao 复写初始化到重新提交的默认线规则
    FLOWSTOREDATA.setData({
      lineLabel: 'false',
      lineName: 'false',
      id:'initToRecall',
      lineCondition : '1d75fb35-4e5e-4245-8ed7-38e82baee759',
      lineConditionCode : null,
      lineConditionDesc : { zh_CN: '默认false', en: '默认false' },
      lineConditionJson : { 'block': [{ 'num': 4, 'type': 'rule_main', 'id': '2K-$kMvo[Je*HsPvgR:m', 'children': [{ 'type': 'statement', 'name': 'STACK', 'block': { 'type': 'rule_return_boolean', 'id': '-I6@imLmXd6pNqo%0AvW', 'fields': [{ 'name': 'RETURN', 'value': 'false' }] } }], 'x': 12.000000000000014, 'y': 12.5 }] }
    },true);
    // yuminghao 复写重新提交到用户节点的默认线规则 重新提交
    FLOWSTOREDATA.setData({
      lineLabel: 'reSubmit',
      lineName: 'reSubmit',
      id:'recallToClient',
      actionResult : 'reSubmit',
    },true);
    for (let i = 0; i < processDesignConstant.INIT_DATA.length; i++) {
      const node = processDesignConstant.INIT_DATA[i];
      node.activityInfo.activityName = window.flowI18n.handerlNodeLabel(node.activityInfo.activityName);
      // 保存节点业务数据;
      FLOWSTOREDATA.setData(node);
      //
      if (node.activityInfo.nodeType === processDesignConstant.NODE_TYPE.INIT ||
        node.activityInfo.nodeType === processDesignConstant.NODE_TYPE.RECALL ||
        node.activityInfo.nodeType === processDesignConstant.NODE_TYPE.CLIENT) {
        cells[node.activityInfo.id].value = processDesign.updateCellValue({
          eventConfigurationList: node.eventConfigurationList,
          activityInfo: {
            activityName: node.activityInfo.activityName
          },
          nodeType: node.activityInfo.nodeType
        });
      }
    }
  }
  finally {
    // Updates the display
    graph.getModel().endUpdate();
  }
};

EditorUi.prototype.eventsOporates = function () {
  var _UIEVENTS = this._UIEVENTS;
  var that = this;
  FLOWINSTANCE.EditorUi = this;

  return {
    systemParams: {
      //子级菜单10倍数
      numBigSize: 10,
      numIndex: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      includeEdges: false,
      popParams: {
        0: window.flowI18n.$t('flowDesigner.menuBtn.copy'),
        1: window.flowI18n.$t('flowDesigner.menuBtn.paste'),
        2: window.flowI18n.$t('flowDesigner.menuBtn.delete'),
        /*3: '图标',
        4: '样式',
        40: '背景',//子级菜单10倍数
        400: '填充色',
        401: '渐变色',*/
        5: window.flowI18n.$t('flowDesigner.menuBtn.attr')
      },
      titles: {
        0: '未知'
      },
      editUiTools: {
        addEditUiBottomBar: {
          0: '设计',
          1: '源'
        }
      }
    },
    copy: function (data) {
      _UIEVENTS.bind(that)().NODES.copy();
    },
    paste: function (data) {
      _UIEVENTS.bind(that)().NODES.paste();
    },
    delete: function (data) {
      _UIEVENTS.bind(that)().NODES.delete(this.systemParams.includeEdges);
    },
    icon: function (data) {
      alert(data);
    },
    style: function (data) {
      alert(data);
    },
    //填充色
    styleFillColor: function (data) {
      alert(data);
    },
    //渐变色
    styleGradientColor: function (data) {
      alert(data);
    },
    attribute: function (data) {
      const nodeType = data.nodeType;
      if (nodeType) {
        const biz = FLOWSTOREDATA.getDataById(nodeType, data.id);
        let userOption = 'node';
        //
        if (nodeType === processDesignConstant.NODE_TYPE.LINE ||
          nodeType === processDesignConstant.NODE_TYPE.SELF_LINE ||
          nodeType === processDesignConstant.NODE_TYPE.FROM_LOOP_NODE_LINE) {
          userOption = 'line';
        }
        //
        const propData = {
          biz: biz,
          model: data,
          nodeType: nodeType,
          // node:流程 line: 线 process: 流程
          userOption: userOption
        };
        // 打开节点的属性面板
        processDesign.showCellPropertyWin(propData);
      } else {
        // TODO 需要换成vue的提示框
        alert('节点类型不存在');
      }
    }
  };
};

/**
 * 自定义右键菜单
 * **/
EditorUi.prototype.createCumstomerPopupMenu = function (menu, cell, evt) {
  var graph = this.editor.graph;
  var selectionCells = graph.getSelectionCells();
  if (cell != null) {
    // 流程挂起节点和线不允许编辑
    if (cell.nodeType === 15 || cell.id === 'pigeonholeToProcessHangUp') {
      return;
    }
    if(window.NODE_TYPE_STYLE && cell.nodeType !== 6 && cell.nodeType !== 13 && cell.nodeType !== 10 && cell.nodeType !== 98 && cell.nodeType !== 99 && cell.nodeType !== 100){
      return;
    }
    var _CREATECUMSTOMER_POPUP_MENU = this._CREATECUMSTOMER_POPUP_MENU();
    if (_CREATECUMSTOMER_POPUP_MENU != null) {
      if (graph.getSelectionCells()[0].nodeType !== processDesignConstant.NODE_TYPE.START && graph.getSelectionCells()[0].nodeType !== processDesignConstant.NODE_TYPE.END) {
        var menuObj = _CREATECUMSTOMER_POPUP_MENU;
        for (var _menuItem in menuObj) {
          // 如果同时选中多个节点，右键菜单的属性不能点击
          if (selectionCells.length > 1 && _menuItem === '5') {
            var _menu1 = menu.addItem(menuObj[_menuItem].name, menuObj[_menuItem].bgImages, menuObj[_menuItem]._popEvents, null, null, false);
          } else {
            var _menu1 = menu.addItem(menuObj[_menuItem].name, menuObj[_menuItem].bgImages, menuObj[_menuItem]._popEvents);
          }

          menu.addSeparator();

          // 去掉mxPopup中的占位节点 tr ;
          for (var i = 0; i < menu.tbody.children.length; i++) {
            if (!menu.tbody.children[i].getAttribute('class')) {
              menu.tbody.removeChild(menu.tbody.children[i]);
            }
          }

          if (typeof(menuObj[_menuItem].subItems) !== undefined && menuObj[_menuItem].subItems != null) {
            for (var _menuSub in menuObj[_menuItem].subItems) {
              var _menu2 = menu.addItem(menuObj[_menuItem].subItems[_menuSub].name, menuObj[_menuItem].subItems[_menuSub].bgImages, null, _menu1);
              if (typeof(menuObj[_menuItem].subItems[_menuSub].subItems) !== undefined && menuObj[_menuItem].subItems[_menuSub].subItems != null) {
                for (var _menusub3 in menuObj[_menuItem].subItems[_menuSub].subItems) {
                  menu.addItem(menuObj[_menuItem].subItems[_menuSub].subItems[_menusub3].name, menuObj[_menuItem].subItems[_menuSub].subItems[_menusub3].bgImages, menuObj[_menuItem].subItems[_menuSub].subItems[_menusub3]._popEvents, _menu2);
                }
              }
            }
          }
        }
      }
    }
  }
};

EditorUi.prototype._UIEVENTS = function () {
  var graph = this.editor.graph;
  var eventsOporates = this.eventsOporates();
  return {
    NODES: {
      //节点操作
      copy: function () {
        mxClipboard.copy(graph);
        FLOWINSTANCE['copyCell'] = graph.getSelectionCell();
      },
      paste: function () {
        if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent())) {
          mxClipboard.paste(graph);
        }
      },
      delete: function (includeEdges) {
        graph.escape();
        var cells = graph.getDeletableCells(graph.getSelectionCells());
        if (cells != null && cells.length > 0) {
          var parents = graph.model.getParents(cells);
          graph.removeCells(cells, includeEdges);
          // Selects parents for easier editing of groups
          if (parents != null) {
            var select = [];
            for (var i = 0; i < parents.length; i++) {
              if (graph.model.contains(parents[i]) &&
                (graph.model.isVertex(parents[i]) ||
                  graph.model.isEdge(parents[i]))) {
                select.push(parents[i]);
              }
            }
            graph.setSelectionCells(select);
          }
        }
      },
      _selectionModel: function () {
        return graph.selectionModel;
      },
      _selectModelName: function () {
        var _result = eventsOporates.systemParams.titles[eventsOporates.systemParams.numIndex[0]];
        if (graph.selectionModel != null) {
          if (graph.selectionModel.cells != null && graph.selectionModel.cells.length > 0) {
            _result = graph.selectionModel.cells[0].value;
          }
        }
        return _result;
      }
    },
    editUiTools: {//编辑器工具
      addEditUiBottomBar: function (graph) {
        var buttons = document.createElement('div');
        buttons.style.position = 'absolute';
        buttons.style.overflow = 'visible';
        var bs = graph.getBorderSizes();
        buttons.style.top = (graph.container.offsetTop + bs.y + graph.container.clientHeight) + 'px';
        buttons.style.left = (graph.container.offsetLeft + bs.x) + 'px';
        var left = 0;
        var bw = 32;
        var bh = 16;
        if (mxClient.IS_QUIRKS) {
          bw -= 1;
          bh -= 1;
        }

        function addButton(label, funct) {
          var btn = document.createElement('div');
          mxUtils.write(btn, label);
          btn.style.position = 'absolute';
          btn.style.backgroundColor = 'transparent';
          btn.style.border = '1px solid gray';
          btn.style.textAlign = 'center';
          btn.style.fontSize = '10px';
          btn.style.cursor = 'hand';
          btn.style.width = bw + 'px';
          btn.style.height = bh + 'px';
          btn.style.left = left + 'px';
          btn.style.top = '0px';

          mxEvent.addListener(btn, 'click', function (evt) {
            funct();
            mxEvent.consume(evt);
          });
          left += bw;
          buttons.appendChild(btn);
        }

        addButton(eventsOporates.systemParams.editUiTools.addEditUiBottomBar[eventsOporates.systemParams.numIndex[0]], function () {
          alert(eventsOporates.systemParams.editUiTools.addEditUiBottomBar[eventsOporates.systemParams.numIndex[0]]);
        });

        addButton(eventsOporates.systemParams.editUiTools.addEditUiBottomBar[eventsOporates.systemParams.numIndex[1]], function () {
          var encoder = new mxCodec();
          var node = encoder.encode(graph.getModel());
          mxUtils.popup(mxUtils.getPrettyXml(node), true);
        });

        if (graph.container.nextSibling != null) {
          graph.container.parentNode.insertBefore(buttons, graph.container.nextSibling);
        } else {
          graph.container.appendChild(buttons);
        }
      }
    }
  };
};
// 配置右击菜单
EditorUi.prototype._CREATECUMSTOMER_POPUP_MENU = function () {
  var graph = this.editor.graph;
  var eventsOporates = this.eventsOporates();
  if(window.NODE_TYPE_STYLE){
    return {
      '2': {
        name: eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[2]],
        bgImages: IMAGE_PATH + '/deletestyle.png',
        _popEvents: function () {
          eventsOporates.delete(eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[2]]);
        }
      },
      '5': {
        name: eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[5]],
        bgImages: IMAGE_PATH + '/properties.png',
        _popEvents: function () {
          // eventsOporates.attribute(eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[5]]);
          eventsOporates.attribute(graph.getSelectionCells()[0]);
        }
      }
    };
  }else{
    return {
      '0': {
        name: eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[0]],
        bgImages: IMAGE_PATH + '/copy.png',
        _popEvents: function () {
          eventsOporates.copy(eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[0]]);
        }
      },
      '1': {
        name: eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[1]],
        bgImages: IMAGE_PATH + '/pastetyle.png',
        _popEvents: function () {
          eventsOporates.paste(eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[1]]);
        }
      },
      '2': {
        name: eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[2]],
        bgImages: IMAGE_PATH + '/deletestyle.png',
        _popEvents: function () {
          eventsOporates.delete(eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[2]]);
        }
      },
      /*'4': {
              'name': eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[4]],
              'bgImages': 'images/designstyle.png',
              _popEvents: function () {
                  eventsOporates.style(eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[4]]);
              },
              subItems: {
                  '0': {
                      'name': eventsOporates.systemParams.popParams[4 * eventsOporates.systemParams.numBigSize],
                      'bgImages': 'editors/images/image.gif',
                      _popEvents: function () {
                          eventsOporates.style(eventsOporates.systemParams.popParams[4 * eventsOporates.systemParams.numBigSize]);
                      }
                  }
              }
          },*/
      '5': {
        name: eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[5]],
        bgImages: IMAGE_PATH + '/properties.png',
        _popEvents: function () {
          // eventsOporates.attribute(eventsOporates.systemParams.popParams[eventsOporates.systemParams.numIndex[5]]);
          eventsOporates.attribute(graph.getSelectionCells()[0]);
        }
      }
    };
  }
};
/**
 * Refreshes the viewport.
 */
EditorUi.prototype.refresh = function (sizeDidChange) {
  sizeDidChange = (sizeDidChange != null) ? sizeDidChange : true;

  var quirks = mxClient.IS_IE && (document.documentMode == null || document.documentMode == 5);
  var w = this.container.clientWidth;
  var h = this.container.clientHeight;

  if (this.container == document.body) {
    w = document.body.clientWidth || document.documentElement.clientWidth;
    h = (quirks) ? document.body.clientHeight || document.documentElement.clientHeight : document.documentElement.clientHeight;
  }

  // Workaround for bug on iOS see
  // http://stackoverflow.com/questions/19012135/ios-7-ipad-safari-landscape-innerheight-outerheight-layout-issue
  // FIXME: Fix if footer visible
  var off = 0;

  if (mxClient.IS_IOS && !window.navigator.standalone) {
    if (window.innerHeight != document.documentElement.clientHeight) {
      off = document.documentElement.clientHeight - window.innerHeight;
      window.scrollTo(0, 0);
    }
  }

  // var effHsplitPosition = Math.max(0, Math.min(this.hsplitPosition, w - this.splitSize - 20));
  var effHsplitPosition = 230;

  var tmp = 0;

  if (this.menubar != null) {
    this.menubarContainer.style.height = this.menubarHeight + 'px';
    tmp += this.menubarHeight;
  }

  // if (this.toolbar != null) {
  //     this.toolbarContainer.style.top = this.menubarHeight + 'px';
  //     this.toolbarContainer.style.height = this.toolbarHeight + 'px';
  //     tmp += this.toolbarHeight;
  // }

  if (tmp > 0 && !mxClient.IS_QUIRKS) {
    tmp += 1;
  }

  var sidebarFooterHeight = 0;

  if (this.sidebarFooterContainer != null) {
    var bottom = this.footerHeight + off;
    sidebarFooterHeight = Math.max(0, Math.min(h - tmp - bottom, this.sidebarFooterHeight));
    this.sidebarFooterContainer.style.width = effHsplitPosition + 'px';
    this.sidebarFooterContainer.style.height = sidebarFooterHeight + 'px';
    this.sidebarFooterContainer.style.bottom = bottom + 'px';
  }

  // var fw = (this.format != null) ? this.formatWidth : 0;
  var fw = 0;
  this.sidebarContainer.style.top = tmp + 'px';
  this.sidebarContainer.style.width = effHsplitPosition + 'px';
  this.formatContainer.style.top = tmp + 'px';
  this.formatContainer.style.width = fw + 'px';
  this.formatContainer.style.display = (this.format != null) ? '' : 'none';

  this.diagramContainer.style.left = (this.hsplit.parentNode != null) ? (effHsplitPosition + this.splitSize) + 'px' : '0px';
  this.diagramContainer.style.top = this.sidebarContainer.style.top;
  this.footerContainer.style.height = this.footerHeight + 'px';
  this.hsplit.style.top = this.sidebarContainer.style.top;
  this.hsplit.style.bottom = (this.footerHeight + off) + 'px';
  this.hsplit.style.left = effHsplitPosition + 'px';

  if (this.tabContainer != null) {
    this.tabContainer.style.left = this.diagramContainer.style.left;
  }

  if (quirks) {
    this.menubarContainer.style.width = w + 'px';
    this.toolbarContainer.style.width = this.menubarContainer.style.width;
    var sidebarHeight = Math.max(0, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);
    this.sidebarContainer.style.height = (sidebarHeight - sidebarFooterHeight) + 'px';
    this.formatContainer.style.height = sidebarHeight + 'px';
    this.diagramContainer.style.width = (this.hsplit.parentNode != null) ? Math.max(0, w - effHsplitPosition - this.splitSize - fw) + 'px' : w + 'px';
    this.footerContainer.style.width = this.menubarContainer.style.width;
    var diagramHeight = Math.max(0, h - this.footerHeight - this.menubarHeight - this.toolbarHeight);

    if (this.tabContainer != null) {
      this.tabContainer.style.width = this.diagramContainer.style.width;
      this.tabContainer.style.bottom = (this.footerHeight + off) + 'px';
      diagramHeight -= this.tabContainer.clientHeight;
    }

    this.diagramContainer.style.height = diagramHeight + 'px';
    this.hsplit.style.height = diagramHeight + 'px';
  }
  else {
    if (this.footerHeight > 0) {
      this.footerContainer.style.bottom = off + 'px';
    }

    this.diagramContainer.style.right = fw + 'px';
    var th = 0;

    if (this.tabContainer != null) {
      this.tabContainer.style.bottom = (this.footerHeight + off) + 'px';
      this.tabContainer.style.right = this.diagramContainer.style.right;
      th = this.tabContainer.clientHeight;
    }

    this.sidebarContainer.style.bottom = (this.footerHeight + sidebarFooterHeight + off) + 'px';
    this.formatContainer.style.bottom = (this.footerHeight + off) + 'px';
    this.diagramContainer.style.bottom = (this.footerHeight + off + th) + 'px';
  }

  if (sizeDidChange) {
    this.editor.graph.sizeDidChange();
  }
};


/**
 * Creates the keyboard event handler for the current graph and history.
 */
EditorUi.prototype.createKeyHandler = function (editor) {
  var editorUi = this;
  var graph = this.editor.graph;
  var keyHandler = new mxKeyHandler(graph);

  var isEventIgnored = keyHandler.isEventIgnored;
  keyHandler.isEventIgnored = function (evt) {
    // Handles undo/redo/ctrl+./,/u via action and allows ctrl+b/i only if editing value is HTML (except for FF and Safari)
    return (!this.isControlDown(evt) || mxEvent.isShiftDown(evt) || (evt.keyCode != 90 && evt.keyCode != 89 &&
      evt.keyCode != 188 && evt.keyCode != 190 && evt.keyCode != 85)) && ((evt.keyCode != 66 && evt.keyCode != 73) ||
      !this.isControlDown(evt) || (this.graph.cellEditor.isContentEditing() && !mxClient.IS_FF && !mxClient.IS_SF)) &&
      isEventIgnored.apply(this, arguments);
  };

  // Ignores graph enabled state but not chromeless state
  keyHandler.isEnabledForEvent = function (evt) {
    return (!mxEvent.isConsumed(evt) && this.isGraphEvent(evt) && this.isEnabled());
  };

  // Routes command-key to control-key on Mac
  // keyHandler.isControlDown = function (evt) {
  //   return mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey);
  // };

  var queue = [];
  var thread = null;

  // Helper function to move cells with the cursor keys
  function nudge(keyCode, stepSize, resize) {
    queue.push(function () {
      if (!graph.isSelectionEmpty() && graph.isEnabled()) {
        stepSize = (stepSize != null) ? stepSize : 1;

        if (resize) {
          // Resizes all selected vertices
          graph.getModel().beginUpdate();
          try {
            var cells = graph.getSelectionCells();

            for (var i = 0; i < cells.length; i++) {
              if (graph.getModel().isVertex(cells[i]) && graph.isCellResizable(cells[i])) {
                var geo = graph.getCellGeometry(cells[i]);

                if (geo != null) {
                  geo = geo.clone();

                  if (keyCode == 37) {
                    geo.width = Math.max(0, geo.width - stepSize);
                  }
                  else if (keyCode == 38) {
                    geo.height = Math.max(0, geo.height - stepSize);
                  }
                  else if (keyCode == 39) {
                    geo.width += stepSize;
                  }
                  else if (keyCode == 40) {
                    geo.height += stepSize;
                  }

                  graph.getModel().setGeometry(cells[i], geo);
                }
              }
            }
          }
          finally {
            graph.getModel().endUpdate();
          }
        }
        else {
          // Moves vertices up/down in a stack layout
          var cell = graph.getSelectionCell();
          var parent = graph.model.getParent(cell);
          var layout = null;

          if (graph.getSelectionCount() == 1 && graph.model.isVertex(cell) &&
            graph.layoutManager != null && !graph.isCellLocked(cell)) {
            layout = graph.layoutManager.getLayout(parent);
          }

          if (layout != null && layout.constructor == mxStackLayout) {
            var index = parent.getIndex(cell);

            if (keyCode == 37 || keyCode == 38) {
              graph.model.add(parent, cell, Math.max(0, index - 1));
            }
            else if (keyCode == 39 || keyCode == 40) {
              graph.model.add(parent, cell, Math.min(graph.model.getChildCount(parent), index + 1));
            }
          }
          else {
            var dx = 0;
            var dy = 0;

            if (keyCode == 37) {
              dx = -stepSize;
            }
            else if (keyCode == 38) {
              dy = -stepSize;
            }
            else if (keyCode == 39) {
              dx = stepSize;
            }
            else if (keyCode == 40) {
              dy = stepSize;
            }

            graph.moveCells(graph.getMovableCells(graph.getSelectionCells()), dx, dy);
          }
        }
      }
    });

    if (thread != null) {
      window.clearTimeout(thread);
    }

    thread = window.setTimeout(function () {
      if (queue.length > 0) {
        graph.getModel().beginUpdate();
        try {
          for (var i = 0; i < queue.length; i++) {
            queue[i]();
          }

          queue = [];
        }
        finally {
          graph.getModel().endUpdate();
        }
        graph.scrollCellToVisible(graph.getSelectionCell());
      }
    }, 200);
  }

  // Overridden to handle special alt+shift+cursor keyboard shortcuts
  var directions = {
    37: mxConstants.DIRECTION_WEST, 38: mxConstants.DIRECTION_NORTH,
    39: mxConstants.DIRECTION_EAST, 40: mxConstants.DIRECTION_SOUTH
  };

  var keyHandlerGetFunction = keyHandler.getFunction;

  // Alt+Shift+Keycode mapping to action
  var altShiftActions = {
    67: this.actions.get('clearWaypoints'), // Alt+Shift+C
    65: this.actions.get('connectionArrows'), // Alt+Shift+A
    80: this.actions.get('connectionPoints') // Alt+Shift+P
  };

  mxKeyHandler.prototype.getFunction = function (evt) {
    //yuminghao复写键盘操作,如果存在v-modal则表示有弹窗等二级页面,不进行画布键盘操作
    let modalDom = document.getElementsByClassName('v-modal');
    if (modalDom && modalDom.length > 0) {
      return;
    }
    if (graph.isEnabled()) {
      // TODO: Add alt modified state in core API, here are some specific cases
      if (mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt)) {
        var action = altShiftActions[evt.keyCode];

        if (action != null) {
          return action.funct;
        }
      }

      if (evt.keyCode == 9 && mxEvent.isAltDown(evt)) {
        if (mxEvent.isShiftDown(evt)) {
          // Alt+Shift+Tab
          return function () {
            graph.selectParentCell();
          };
        }
        else {
          // Alt+Tab
          return function () {
            graph.selectChildCell();
          };
        }
      }
      else if (directions[evt.keyCode] != null && !graph.isSelectionEmpty()) {
        if (mxEvent.isShiftDown(evt) && mxEvent.isAltDown(evt)) {
          if (graph.model.isVertex(graph.getSelectionCell())) {
            return function () {
              var cells = graph.connectVertex(graph.getSelectionCell(), directions[evt.keyCode],
                graph.defaultEdgeLength, evt, true);

              if (cells != null && cells.length > 0) {
                if (cells.length == 1 && graph.model.isEdge(cells[0])) {
                  graph.setSelectionCell(graph.model.getTerminal(cells[0], false));
                }
                else {
                  graph.setSelectionCell(cells[cells.length - 1]);
                }

                graph.scrollCellToVisible(graph.getSelectionCell());

                if (editorUi.hoverIcons != null) {
                  editorUi.hoverIcons.update(graph.view.getState(graph.getSelectionCell()));
                }
              }
            };
          }
        }
        else {
          // Avoids consuming event if no vertex is selected by returning null below
          // Cursor keys move and resize (ctrl) cells
          if (this.isControlDown(evt)) {
            return function () {
              nudge(evt.keyCode, (mxEvent.isShiftDown(evt)) ? graph.gridSize : null, true);
            };
          }
          else {
            return function () {
              nudge(evt.keyCode, (mxEvent.isShiftDown(evt)) ? graph.gridSize : null);
            };
          }
        }
      }
      // 2021-03-01 zzy 调用重写流程数据方法
      this.rewriteGetFunction(this, arguments);
    }

    return keyHandlerGetFunction.apply(this, arguments);
  };

  // Binds keystrokes to actions
  keyHandler.bindAction = mxUtils.bind(this, function (code, control, key, shift) {
    var action = this.actions.get(key);

    if (action != null) {
      var f = function () {
        if (action.isEnabled()) {
          action.funct();
        }
      };

      if (control) {
        if (shift) {
          keyHandler.bindControlShiftKey(code, f);
        }
        else {
          keyHandler.bindControlKey(code, f);
        }
      }
      else {
        if (shift) {
          keyHandler.bindShiftKey(code, f);
        }
        else {
          keyHandler.bindKey(code, f);
        }
      }
    }
  });

  var ui = this;
  var keyHandlerEscape = keyHandler.escape;
  keyHandler.escape = function (evt) {
    keyHandlerEscape.apply(this, arguments);
  };

  // Ignores enter keystroke. Remove this line if you want the
  // enter keystroke to stop editing. N, W, T are reserved.
  keyHandler.enter = function () {
  };

  keyHandler.bindControlShiftKey(36, function () {
    graph.exitGroup();
  }); // Ctrl+Shift+Home
  keyHandler.bindControlShiftKey(35, function () {
    graph.enterGroup();
  }); // Ctrl+Shift+End
  keyHandler.bindKey(36, function () {
    graph.home();
  }); // Home
  keyHandler.bindKey(35, function () {
    graph.refresh();
  }); // End
  keyHandler.bindAction(107, true, 'zoomIn'); // Ctrl+Plus
  keyHandler.bindAction(109, true, 'zoomOut'); // Ctrl+Minus
  keyHandler.bindAction(80, true, 'print'); // Ctrl+P
  keyHandler.bindAction(79, true, 'outline', true); // Ctrl+Shift+O
  keyHandler.bindAction(112, false, 'about'); // F1

  if (!this.editor.chromeless || this.editor.editable) {
    keyHandler.bindControlKey(36, function () {
      if (graph.isEnabled()) {
        graph.foldCells(true);
      }
    }); // Ctrl+Home
    keyHandler.bindControlKey(35, function () {
      if (graph.isEnabled()) {
        graph.foldCells(false);
      }
    }); // Ctrl+End
    keyHandler.bindControlKey(13, function () {
      if (graph.isEnabled()) {
        graph.setSelectionCells(graph.duplicateCells(graph.getSelectionCells(), false));
      }
    }); // Ctrl+Enter
    keyHandler.bindAction(8, false, 'delete'); // Backspace
    keyHandler.bindAction(8, true, 'deleteAll'); // Backspace
    keyHandler.bindAction(46, false, 'delete'); // Delete
    keyHandler.bindAction(46, true, 'deleteAll'); // Ctrl+Delete
    keyHandler.bindAction(72, true, 'resetView'); // Ctrl+H
    keyHandler.bindAction(72, true, 'fitWindow', true); // Ctrl+Shift+H
    keyHandler.bindAction(74, true, 'fitPage'); // Ctrl+J
    keyHandler.bindAction(74, true, 'fitTwoPages', true); // Ctrl+Shift+J
    keyHandler.bindAction(48, true, 'customZoom'); // Ctrl+0
    keyHandler.bindAction(82, true, 'turn'); // Ctrl+R
    keyHandler.bindAction(82, true, 'clearDefaultStyle', true); // Ctrl+Shift+R
    keyHandler.bindAction(83, true, 'save'); // Ctrl+S
    keyHandler.bindAction(83, true, 'saveAs', true); // Ctrl+Shift+S
    keyHandler.bindAction(65, true, 'selectAll'); // Ctrl+A
    keyHandler.bindAction(65, true, 'selectNone', true); // Ctrl+A
    keyHandler.bindAction(73, true, 'selectVertices', true); // Ctrl+Shift+I
    keyHandler.bindAction(69, true, 'selectEdges', true); // Ctrl+Shift+E
    keyHandler.bindAction(69, true, 'editStyle'); // Ctrl+E
    keyHandler.bindAction(66, true, 'bold'); // Ctrl+B
    keyHandler.bindAction(66, true, 'toBack', true); // Ctrl+Shift+B
    keyHandler.bindAction(70, true, 'toFront', true); // Ctrl+Shift+F
    keyHandler.bindAction(68, true, 'duplicate'); // Ctrl+D
    keyHandler.bindAction(68, true, 'setAsDefaultStyle', true); // Ctrl+Shift+D
    /* 2021-10-20 注释撤销  */
    // yuminghao 撤销功能 Ctrl+Z
    keyHandler.bindAction(90, true, 'undo'); // Ctrl+Z
    // keyHandler.bindAction(89, true, 'autosize', true); // Ctrl+Shift+Y
    keyHandler.bindAction(88, true, 'cut'); // Ctrl+X
    keyHandler.bindAction(67, true, 'copy'); // Ctrl+C
    keyHandler.bindAction(86, true, 'paste'); // Ctrl+V
    keyHandler.bindAction(71, true, 'group'); // Ctrl+G
    keyHandler.bindAction(77, true, 'editData'); // Ctrl+M
    keyHandler.bindAction(71, true, 'grid', true); // Ctrl+Shift+G
    keyHandler.bindAction(73, true, 'italic'); // Ctrl+I
    keyHandler.bindAction(76, true, 'lockUnlock'); // Ctrl+L
    keyHandler.bindAction(76, true, 'layers', true); // Ctrl+Shift+L
    keyHandler.bindAction(80, true, 'formatPanel', true); // Ctrl+Shift+P
    // keyHandler.bindAction(85, true, 'underline'); // Ctrl+U
    // keyHandler.bindAction(85, true, 'ungroup', true); // Ctrl+Shift+U
    keyHandler.bindAction(190, true, 'superscript'); // Ctrl+.
    keyHandler.bindAction(188, true, 'subscript'); // Ctrl+,
    keyHandler.bindKey(13, function () {
      if (graph.isEnabled()) {
        graph.startEditingAtCell();
      }
    }); // Enter
    keyHandler.bindKey(113, function () {
      if (graph.isEnabled()) {
        graph.startEditingAtCell();
      }
    }); // F2
  }

  // if (!mxClient.IS_WIN) {
  //   keyHandler.bindAction(90, true, 'redo', true); // Ctrl+Shift+Z
  // }
  // else {
  // yuminghao 重做功能 Ctrl+y
  keyHandler.bindAction(89, true, 'redo'); // Ctrl+Y
  // }

  return keyHandler;
};
