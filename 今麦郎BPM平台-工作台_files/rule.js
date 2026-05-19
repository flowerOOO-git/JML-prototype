/**
 * Created by apple on 17/10/18.
 */
'use strict';

function toJson (obj) {
  if (obj === Blockly.Drools.BaseText) {
    obj = '';
  }
  if (!obj) {
    return obj;
  }
  if (typeof obj === 'string') {
    try {
      var json = JSON.parse(obj);
      return json;
    } catch (e) {
      return obj;
    }
  }
  return obj;
}
function toStr (obj) {
  if (obj === Blockly.Drools.BaseText) {
    obj = '';
  }
  if (!obj) {
    return obj;
  }
  if (typeof obj === 'string') {
    return obj;
  }
  try {
    var str = JSON.stringify(obj);
    return str;
  } catch (e) {
    return obj;
  }
}

Blockly.Blocks['rule_main'] = {
  init: function () {
    this.num = Blockly.Drools.count++;
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setColour(290);
    this.appendDummyInput()
      .appendField(MSG.rule)
      .appendField('', 'PARAMS');
    this.appendStatementInput('STACK');
    this.contextMenu = true;
    this.setTooltip(MSG.definitionRule);
    this.arguments_ = [];
    // this.setCommentText('11112222');
  }
};

Blockly.Blocks['drools_number'] = {
  init: function () {
    this.setHelpUrl(Blockly.Msg.TEXT_TEXT_HELPURL);
    this.setColour(160);
    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput(''), 'NUM');
    this.setOutput(true);
    this.setTooltip('非字符串');
  }
};

Blockly.Blocks['drools_chooseObj'] = {
  init: function () {
    this.setColour(160);
    this.appendDummyInput()
      .appendField('从上下文中选择')
      .appendField(new Blockly.SelectWin('doSelectWin', function (data, win) {
        if (data) {
          var val = {};
          Blockly.Drools.getParentNode(val, data);
          win.setValue(toStr(val));
          win.setText(val.pointStr);
        } else {
          // alert('请选择子节点');
          Blockly.vue_.$notify({
            type: 'warn',
            message: '请选择子节点',
            duration:1500
          });
        }
      }, 'processContext'), 'OBJ');
    this.setOutput(true);
  },
  setFieldValue: function(newValue, name) {
    var field = this.getField(name);
    if (field) {
      field.setValue(toStr(newValue));
      if (name === 'OBJ') {
        //解决积木undefined问题 2020年4月21日13:47:07 yl
        if (toJson(newValue).pointStr) {
          field.setText(toJson(newValue).pointStr);
        }
        else{
          field.setText(newValue);
        }
      }
    }
  }
};

Blockly.Blocks['rule_return_percentage'] = {
  init: function () {
    var me = this;
    this.num = Blockly.Drools.count++;
    this.setColour(160);
    this.appendDummyInput('input')
      .appendField('返回审批人的百分比')
      .appendField(new Blockly.FieldTextInput(''), 'ARG')
      .appendField('%');
    this.setPreviousStatement(true);
  }
};

Blockly.Blocks['drools_easyChoose'] = {
  init: function () {
    var me = this;
    this.setColour(160);
    this.appendDummyInput('input')
      .appendField('返回 所选')
      .appendField(new Blockly.SelectWin('doSelectWin', function (data, win) {
        win.setValue(toStr(data));
        // 函数选择
        if (data.value && data.key === 'functionBrowser') {
          // TODO 函数选择
          // 组织关系
        } else if (data.value && data.key === 'org') {
          // 组织关系
          win.setText(data.value.length + '个组织');
          if (data.value && data.value.length > 0) {
            const org = data.value[0].basic || data.value[0];
            me.appendChildArg(org);
          }
          // 岗位
        } else if (data.value && data.key === 'station') {
          // 岗位选择
          win.setText(data.value.length + '个岗位');
          if (data.value && data.value.length > 0) {
            me.appendChildArg(data.value[0]);
          }
          // 人员选择
        } else if (data.value && data.key === 'emp') {
          // 人员选择
          win.setText(data.value.length + '人');
          if (data.value && data.value.length > 0) {
            me.appendChildArg(data.value[0]);
          }
        }
      }, 'easy'), 'OBJ');
    this.setPreviousStatement(true);
  },
  appendChildArg: function (obj) {
    if (!obj) {
      return;
    }
    var input = this.getInput('input');
    if (!input) {
      return;
    }
    if (this.getField('desc')) {
      input.removeField('desc');
    }
    if (this.getField('ARG')) {
      input.removeField('ARG');
    }
    if (this.getField('desc_1')) {
      input.removeField('desc_1');
    }
    input.appendField('的属性：', 'desc');
    var items = [];
    for (var key in obj) {
      var arr = [];
      arr.push(key);
      arr.push(key);
      items.push(arr);
    }
    var me = this;
    input.appendField(new Blockly.FieldDropdown(items, function (data) {
      this.setValue(data);
      if (obj[data] && typeof obj[data] == 'object') {
        me.appendValueInput('Lang');
        me.setInputsInline(true);
      }
    }), 'ARG');
  },
  setFieldValue: function(value, name) {
    var field = this.getField(name);
    if (field) {
      field.setValue(toStr(value));
      if (name === 'OBJ') {
        var newValue = toJson(value);
        // 函数选择
        if (newValue.value && newValue.key === 'functionBrowser') {
          // TODO 函数选择
          // 组织关系
        } else if (newValue.value && newValue.key === 'org') {
          // 组织关系
          field.setText('已选'+ newValue.value.length + '个组织');
          if (newValue.value && newValue.value.length > 0) {
            this.appendChildArg(newValue.value[0].basic);
          }
          // 岗位
        } else if (newValue.value && newValue.key === 'station') {
          // 岗位选择
          field.setText('已选'+ newValue.value.length + '个岗位');
          if (newValue.value && newValue.value.length > 0) {
            this.appendChildArg(newValue.value[0]);
          }
          // 人员选择
        } else if (newValue.value && newValue.key === 'emp') {
          // 人员选择
          field.setText('已选'+ newValue.value.length + '人');
          if (newValue.value && newValue.value.length > 0) {
            this.appendChildArg(newValue.value[0]);
          }
        } else if(value){
          field.setText(value);
        }
      }
    }
  }
};

Blockly.Blocks['drools_org'] = {
  init: function () {
    this.setColour(160);
    this.appendDummyInput()
      .appendField('返回 岗位组织')
      .appendField(new Blockly.SelectWin('doSelectWin', function (data, win) {
        if (data) {
          var val = {};
          // Blockly.Drools.getParentNode(val, data);
          win.setValue(toStr(data[0]));
          win.setText(data[0].name);
        } else {
          // alert('请选择子节点');
          Blockly.vue_.$notify({
            type: 'warn',
            message: '请选择子节点',
            duration:1500
          });
        }
      }, 'org'), 'OBJ')
      .appendField('下面的所有人员作为审批人');
    this.setPreviousStatement(true);
    // this.setNextStatement(true);
    // this.setOutput(true);
  },
  setFieldValue: function(newValue, name) {
    var field = this.getField(name);
    if (field) {
      field.setValue(toStr(newValue));
      if (name === 'OBJ') {
        if(toJson(newValue).pointStr){
          field.setText(toJson(newValue).pointStr);
        }
        else if(toJson(newValue).name){
          field.setText(toJson(newValue).name);
        } else if(newValue){
          field.setText(newValue);
        }
      }
    }
  }
};

Blockly.Blocks['drools_localChoose'] = {
  init: function () {
    var me = this;
    this.setColour(160);
    this.appendDummyInput('input')
      .appendField('获取')
      .appendField(new Blockly.SelectWin('doSelectWin', function (data, win) {
        win.setValue(toStr(data));
        if (data.value && data.value.length > 1) {
          me.isArr = true;
          // 函数选择
          if (data.key === 'functionBrowser') {
            // TODO 函数选择
            // 组织关系
          } else if (data.key === 'org') {
            // 组织关系
            win.setText(data.value.length + '个组织关系');
            const org = data.value[0].basic || data.value[0];
            me.appendChildArg(org);
            // 岗位
          } else if (data.key === 'station') {
            // 岗位选择
            win.setText(data.value.length + '个岗位');
            me.appendChildArg(data.value[0]);
            // 人员选择
          } else if (data.key === 'emp') {
            // 人员选择
            win.setText(data.value.length + '人');
            me.appendChildArg(data.value[0]);
          }
        } else if (data.value && data.value.length === 1) {
          me.isArr = false;
          // 函数选择
          if (data.key === 'functionBrowser') {
            // TODO 函数选择
            // 组织关系
          } else if (data.key === 'org') {
            // 组织关系
            const org = data.value[0].basic || data.value[0];
            win.setText('组织关系:' +org.displayName[Blockly.Drools.defLang]);
            me.appendChildArg(org);
            // 岗位
          } else if (data.key === 'station') {
            // 岗位选择
            win.setText('岗位:' + data.value[0].displayName[Blockly.Drools.defLang]);
            me.appendChildArg(data.value[0]);
            // 人员选择
          } else if (data.key === 'emp') {
            // 人员选择
            win.setText('人员:' + data.value[0].name);
            me.appendChildArg(data.value[0]);
          }
        }
      }, 'easy'), 'OBJ');
    this.setOutput(true);
  },
  appendChildArg: function (obj) {
    if (!obj) {
      return;
    }
    var input = this.getInput('input');
    if (!input) {
      return;
    }
    if (this.getField('desc')) {
      input.removeField('desc');
    }
    if (this.getField('ARG')) {
      input.removeField('ARG');
    }
    if (this.getField('desc_1')) {
      input.removeField('desc_1');
    }
    if (this.getInput('Lang')) {
      this.removeInput('Lang');
    }
    input.appendField('的属性：', 'desc');
    var items = [];
    for (var key in obj) {
      var arr = [];
      arr.push(key);
      arr.push(key);
      items.push(arr);
    }
    var me = this;
    input.appendField(new Blockly.FieldDropdown(items, function (data) {
      this.setValue(data);
      if (obj[data] && typeof obj[data] == 'object') {
        me.appendValueInput('Lang');
        me.setInputsInline(true);
      }
    }), 'ARG');
    if (this.isArr) {
      input.appendField(' 拼接成的字符串', 'desc_1');
    }
  },
  setFieldValue: function(value, name) {
    var field = this.getField(name);
    if (field) {
      field.setValue(toStr(value));
      var data = '';
      if (name === 'OBJ') {
        if (toJson(value)) {
          data = toJson(value);
        }
        else{
          data = value;
        }
        if (data.value && data.value.length > 1) {
          this.isArr = true;
          // 函数选择
          if (data.key === 'functionBrowser') {
            // TODO 函数选择
            // 组织关系
          } else if (data.key === 'org') {
            // 组织关系
            field.setText(data.value.length + '个组织关系');
            const org = data.value[0].basic || data.value[0];
            this.appendChildArg(org);
            // 岗位
          } else if (data.key === 'station') {
            // 岗位选择
            field.setText(data.value.length + '个岗位');
            this.appendChildArg(data.value[0]);
            // 人员选择
          } else if (data.key === 'emp') {
            // 人员选择
            field.setText(data.value.length + '人');
            this.appendChildArg(data.value[0]);
          }
        } else if (data.value && data.value.length === 1) {
          this.isArr = false;
          // 函数选择
          if (data.key === 'functionBrowser') {
            // TODO 函数选择
            // 组织关系
          } else if (data.key === 'org') {
            // 组织关系
            const org = data.value[0].basic || data.value[0];
            field.setText('组织关系:' + org.displayName[Blockly.Drools.defLang]);
            this.appendChildArg(org);
            // 岗位
          } else if (data.key === 'station') {
            // 岗位选择
            field.setText('岗位:' + data.value[0].displayName[Blockly.Drools.defLang]);
            this.appendChildArg(data.value[0]);
            // 人员选择
          } else if (data.key === 'emp') {
            // 人员选择
            field.setText('人员:' + data.value[0].name);
            this.appendChildArg(data.value[0]);
          }
        } else if(data){
          field.setText(data);
        }
      }
    }
  }
};

Blockly.Blocks['drools_formData'] = {
  init: function () {
    this.setColour(160);
    this.appendDummyInput()
      .appendField('选择表单数据')
      .appendField(new Blockly.SelectWin('doSelectWin', function (data, win) {
        if (data && data.path) {
          win.setValue(toStr(data));
          win.setText(data.path);
        }
      }, 'form'), 'OBJ');
    this.setOutput(true);
  },
  setFieldValue: function(data, name) {
    var field = this.getField(name);
    if (field) {
      field.setValue(toStr(data));
      if (name === 'OBJ') {
        //解决积木undefined问题 2020年4月21日13:47:07 yl
        if (toJson(data).path) {
          field.setText(toJson(data).path);
        }
        else{
          field.setText(data);
        }
      }
    }
  }
};

Blockly.Blocks['drools_formDataWithType'] = {
  init: function () {
    var items = [['String', 'String'], ['Integer', 'Integer'], ['Float', 'Float'], ['Double', 'Double']];
    this.setColour(160);
    this.appendDummyInput()
      .appendField('类型')
      .appendField(new Blockly.FieldDropdown(items), 'TYPE')
      .appendField('的表单数据')
      .appendField(new Blockly.SelectWin('doSelectWin', function (data, win) {
        //新版复合选择器 传的是数组 所有取第一个
        // data = data[0];
        if (data && data.path) {
          win.setValue(toStr(data));
          win.setText(data.path);
        }
      }, 'form'), 'OBJ');
    this.setOutput(true);
  },
  setFieldValue: function(data, name) {
    var field = this.getField(name);
    if (field) {
      field.setValue(toStr(data));
      if (name === 'OBJ') {
        //解决积木undefined问题 2020年4月21日13:47:07 yl
        if (toJson(data).path) {
          field.setText(toJson(data).path);
        }
        else{
          field.setText(data);
        }
      }
    }
  }
};

Blockly.Blocks['rule_sum'] = {
  init: function () {
    var me = this;
    this.num = Blockly.Drools.count++;
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setColour(290);
    this.appendDummyInput('sum_dummy')
      .appendField('合计')
      .appendField(new Blockly.SelectWin('showObjGridWin', function (data, win) {
        win.setValue(toStr(data));
        win.setText(data.text);
      },Blockly.Drools.getPanelArgs()), 'NAME')
      .appendField('的集合')
      .appendField(new Blockly.SelectWin('showArgGridWin', function (data, win) {
        if (data) {
          win.setValue(toStr(data));
          if (data.nameDesc) {
            win.setText(data.nameDesc[Blockly.Drools.defLang]);
          } else if (data.description) {
            win.setText(data.description);
          } else if (data.name) {
            win.setText(data.name);
          }
          if (data.type && data.type.toLocaleLowerCase() === 'array') {
            me.setWarningText(null);
            me.appendChildArg(data.items);
          } else {
            me.setWarningText('不是array类型的数据无法合计！');
          }
        }
      }, function () {
        var obj = toJson(me.getFieldValue('NAME')) || {};
        var ret = [];
        if (obj.value && obj.value[0]) {
          var val = obj.value[0];
          for (var key in val) {
            ret = val[key];
          }
        }
        return ret;
      }), 'ARG');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = true;
    this.setTooltip('合计函数');
  },
  appendChildArg : function (obj, signNum) {
    if (!obj || 'object' !== obj.type) {
      this.setWarningText('array数据下面没有元素信息！或数据存在异常！');
      return;
    } else {
      this.setWarningText(null);
    }
    var input = this.getInput('sum_dummy');
    if (input) {
      if (this.getField('desc')) {
        input.removeField('desc');
      }
      if (this.getField('childArg')) {
        input.removeField('childArg');
      }
      if (this.getField('varName')) {
        input.removeField('varName');
      }
      this.varName = 'sum_' + this.num;
      var me = this;
      input.appendField('的属性', 'desc')
        .appendField(new Blockly.SelectWin('showArgGridWin', function (data, win) {
          if (data) {
            win.setValue(toStr(data));
            if (data.nameDesc) {
              win.setText(data.nameDesc[Blockly.Drools.defLang]);
            } else if (data.description) {
              win.setText(data.description);
            } else if (data.name) {
              win.setText(data.name);
            }
            input.appendField('  之和是: '+ me.varName, 'varName');
          }
        }, function () {
          var val = obj.properties || {};
          var ret = [];
          for (var key in val) {
            var child = {};
            child.name = key;
            child.description = val[key].description;
            child.type = val[key].type;
            ret.push(child);
          }
          return ret;
        },'childArg'));
    }
  },
  getRuleVarName : function (type) {
    if (type === 'int' && this.getField('varName')) {
      return this.varName;
    }
  },
  setFieldValue: function(data, name) {
    var field = this.getField(name);
    if (field) {
      field.setValue(toStr(data));
      var value  = '';
      if (toJson(data)) {
        value = toJson(data);
      }
      else{
        value = data;
      }

      if (name === 'NAME') {
        if (value.text) {
          field.setText(value.text);
        }
        else{
          field.setText(value);
        }
      } else if (name === 'ARG') {
        if (value.nameDesc) {
          field.setText(value.nameDesc[Blockly.Drools.defLang]);
        } else if (value.description) {
          field.setText(value.description);
        } else if (value.name) {
          field.setText(value.name);
        } else if(value){
          field.setText(value);
        }
        if (value.type && value.type.toLocaleLowerCase() === 'array') {
          this.setWarningText(null);
          this.appendChildArg(value.items);
        } else {
          this.setWarningText('不是array类型的数据无法合计！');
        }
      } else if (name === 'childArg') {
        if (value.nameDesc) {
          field.setText(value.nameDesc[Blockly.Drools.defLang]);
        } else if (value.description) {
          field.setText(value.description);
        } else if (value.name) {
          field.setText(value.name);
        }
      }
    }
  }
};

Blockly.Blocks['rule_rest'] = {
  init: function () {
    var me = this;
    this.num = Blockly.Drools.count++;
    this.respName = 'response_'+ this.num;
    this.setColour(290);
    this.appendDummyInput()
      .appendField('访问服务端rest接口')
      .appendField(new Blockly.SelectWin('doSelectWin', function (data, win) {
        if (data) {
          win.setValue(toStr(data));
          win.setText((typeof data.displayName === 'string') ? data.displayName : (data.displayName[Blockly.Drools.defLang] || ''));
          me.appendArgInput(data.reqParameters, data.rspParameters, me.respName);
        }
      }, 'rest'), 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = true;
    this.setTooltip('通过系统服务获取相关数据');
    this.arguments_ = [];
  },
  appendArgInput: function (args, returns, respName) {
    if (this.getInput('NOARG')) {
      this.removeInput('NOARG');
    }
    if (this.argNums && this.argNums > 0) {
      for (var i = 0; i < this.argNums; i++) {
        this.removeInput('ARG'+i);
      }
    }
    this.argNums = 0;
    if (args && args[0]) {
      for (var key in args[0]) {
        var argObj = args[0][key];
        if (argObj && argObj.length > 0) {
          for (var i = 0; i < argObj.length; i++) {
            if (argObj[i].isHidden) {
              continue;
            }
            this.argNums ++;

            this.appendValueInput('ARG'+i)
              .appendField('参数' + this.argNums + ':'+ argObj[i].name +  (argObj[i].description ? '【'+argObj[i].description+'】' : '' ) + ', 类型:'+ (argObj[i].type || '未知'))
              .appendField('是')
              .setAlign(1);
            this.setInputsInline(false);
          }
        } else {
          this.appendDummyInput('NOARG')
            .appendField('不需要传入参数');
        }
      }

    } else {
      this.appendDummyInput('NOARG')
        .appendField('不需要传入参数');
    }


    if (this.getInput('NORETURNS')) {
      this.removeInput('NORETURNS');
    }
    if (this.getInput('RETURNS')) {
      this.removeInput('RETURNS');
    }

    if (returns && returns[0]) {
      this.returns = returns;
      this.appendDummyInput('RETURNS')
        .appendField('返回数据是:')
        .appendField(new Blockly.FieldTextInput(this.respName), 'returnName');
    } else {
      this.appendDummyInput('NORETURNS')
        .appendField('没有返回值');
    }
  },
  getReturn: function () {
    if (this.getField('NAME') && this.returns) {
      var response = {};
      response.name = this.respName;
      response.res = 'rest';
      response.description = '请求rest:'+this.getField('NAME').getText()+'的返回值';
      response.value = this.returns;
      var retval = toJson(this.getFieldValue('NAME'));
      if (retval && retval.methodType === '1') {
        response.methodType = '1';
      }
      else{
        response.methodType = retval.methodType;
      }
      return response;
    } else {
      return null;
    }
  },
  setFieldValue: function(data, name) {
    var field = this.getField(name);
    if ('returnName' === name) {
      this.respName = toStr(data);
    }
    if (field) {
      field.setValue(toStr(data));
      if (name === 'NAME') {
        if (toJson(data).displayName ? (toJson(data).displayName[Blockly.Drools.defLang] || toJson(data).displayName) : '') {
          field.setText(toJson(data).displayName ? (toJson(data).displayName[Blockly.Drools.defLang] || toJson(data).displayName) : '');
        }
        else{
          field.setText(data);
        }
        this.appendArgInput(toJson(data).reqParameters, toJson(data).rspParameters);
      }
    }
  }
};
Blockly.Blocks['rule_restAuth'] = {
  init: function () {
    var me = this;
    this.num = Blockly.Drools.count++;
    this.respName = 'response_'+ this.num;
    this.setColour(290);
    this.appendDummyInput()
      .appendField('请求外部接口url(no auth)')
      .appendField(new Blockly.SelectWin('doSelectWin', function (data, win) {
        if (data) {
          win.setValue(toStr(data));
          win.setText(data.methodNo);
          me.appendArgInput(data.reqParameters, data.rspParameters, me.respName);
        }
      }, 'restAuth'), 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = true;
    this.setTooltip('通过系统服务获取相关数据');
    this.arguments_ = [];
  },
  appendArgInput: function (args, returns, respName) {
    if (this.getInput('NOARG')) {
      this.removeInput('NOARG');
    }
    if (this.argNums && this.argNums > 0) {
      for (var i = 0; i < this.argNums; i++) {
        this.removeInput('ARG'+i);
      }
    }
    this.argNums = 0;
    if (args && args[0]) {
      for (var key in args[0]) {
        var argObj = args[0][key];
        if (argObj && argObj.length > 0) {
          for (var i = 0; i < argObj.length; i++) {
            if (argObj[i].isHidden) {
              continue;
            }
            this.argNums ++;

            this.appendValueInput('ARG'+i)
              .appendField('参数' + this.argNums + ':'+ argObj[i].name +  (argObj[i].description ? '【'+argObj[i].description+'】' : '' ) + ', 类型:'+ (argObj[i].type || '未知'))
              .appendField('是')
              .setAlign(1);
            this.setInputsInline(false);
          }
        } else {
          this.appendDummyInput('NOARG')
            .appendField('不需要传入参数');
        }
      }

    } else {
      this.appendDummyInput('NOARG')
        .appendField('不需要传入参数');
    }


    if (this.getInput('NORETURNS')) {
      this.removeInput('NORETURNS');
    }
    if (this.getInput('RETURNS')) {
      this.removeInput('RETURNS');
    }

    if (returns && returns[0]) {
      this.returns = returns;
      this.appendDummyInput('RETURNS')
        .appendField('返回数据是:')
        .appendField(new Blockly.FieldTextInput(this.respName), 'returnName');
    } else {
      this.appendDummyInput('NORETURNS')
        .appendField('没有返回值');
    }
  },
  getReturn: function () {
    if (this.getField('NAME') && this.returns) {
      var response = {};
      response.name = this.respName;
      response.res = 'rest';
      response.description = '请求rest:'+this.getField('NAME').getText()+'的返回值';
      response.value = this.returns;
      var retval = toJson(this.getFieldValue('NAME'));
      if (retval && retval.methodType === '1') {
        response.methodType = '1';
      }
      else{
        response.methodType = retval.methodType;
        response.returnType =retval.apiDetail.returnType;
      }
      return response;
    } else {
      return null;
    }
  },
  setFieldValue: function(data, name) {
    var field = this.getField(name);
    if ('returnName' === name) {
      this.respName = toStr(data);
    }
    if (field) {
      field.setValue(toStr(data));
      if (name === 'NAME') {
        field.setText(toJson(data).displayName ? (toJson(data).displayName[Blockly.Drools.defLang] || toJson(data).displayName) : '');
        this.appendArgInput(toJson(data).reqParameters, toJson(data).rspParameters);
      }
    }
  }
};

Blockly.Blocks['rule_get'] = {
  init: function () {
    var me = this;
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setColour(290);
    this.appendDummyInput('get_dummy')
      .appendField('取得对象:')
      .appendField(new Blockly.SelectWin('showObjGridWin', function (data, win) {
        win.setValue(toStr(data));
        win.setText(data.text);
      },Blockly.Drools.getPanelArgs()), 'NAME')
      .appendField('的属性：')
      .appendField(new Blockly.SelectWin('showArgGridWin', function (data, win) {
        if (data) {
          win.setValue(toStr(data));
          if (me.getInput('get_dummy')) {
            if (me.getField('argType')) {
              me.getInput('get_dummy').removeField('argType');
            }
            me.getInput('get_dummy').appendField('('+data.type+')', 'argType');
          }
          if (data.nameDesc) {
            win.setText(data.nameDesc[Blockly.Drools.defLang]);
          } else if (data.description) {
            win.setText(data.description);
          } else if (data.name) {
            win.setText(data.name);
          }
          if (data.type && data.type.toLocaleLowerCase() === 'array') {
            me.appendChildArg(data.items);
          }
        }
        //2020年4月7日09:52:09
        if(data.attrs){
          //定义二维数据 积木需要
          var arr = new Array();
          var datas = new Array();
          datas.push('请选择','请选择');
          arr.push(datas);
          for(var i=0; i< data.attrs.length;i++){
            var item = data.attrs[i];
            datas = [];
            datas.push(item.name,toStr(item));
            arr.push(datas);
          }
          for (var index = 0; index <= me.dropSum; index++) {
            if(me.getInput('get_dummy')){
              if(me.getField('jsonData' +index)){
                me.getInput('get_dummy').removeField('jsonData' + index);
              }
            }
          }
          me.getInput('get_dummy')
            .appendField(new Blockly.FieldDropdown(arr,function (data) {
              this.sourceBlock_.addDDropdown(this,data);
            }),'jsonData0');
        }
      },function () {
        var obj = toJson(me.getFieldValue('NAME')) || {};
        var ret = [];
        if (obj.value && obj.value[0]) {
          var val = obj.value[0];
          for (var key in val) {
            ret = val[key];
          }
        }
        return ret;
      }), 'ARG');
    this.setOutput(true);
    this.contextMenu = true;
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
    this.arguments_ = [];
  },
  appendChildArg : function (obj) {
    if (!obj || 'object' !== obj.type) {
      this.setWarningText('array数据下面没有元素信息！或数据存在异常！');
      return;
    } else {
      this.setWarningText(null);
    }
    var methods = [['.size()', '.size()'],['.get', '.get']];
    var input = this.getInput('get_dummy');
    if (input) {
      if (this.getField('desc')) {
        input.removeField('desc');
      }
      if (this.getField('method')) {
        input.removeField('method');
      }
      if (this.getField('index')) {
        input.removeField('index');
      }
      if (this.getField('desc_1')) {
        input.removeField('desc_1');
      }
      if (this.getField('desc_2')) {
        input.removeField('desc_2');
      }
      this.varName = 'sum_' + this.num;
      var me = this;
      input.appendField('的方法', 'desc')
        .appendField(new Blockly.FieldDropdown(methods, function (data) {
          this.setValue(data);
          if (data === '.get') {
            input.appendField('(', 'desc_1');
            input.appendField(new Blockly.FieldTextInput(), 'index');
            input.appendField(')', 'desc_2');
          }
        }), 'method');
    }
  },
  setFieldValue: function(data, name) {
    var field = this.getField(name);
    if (field) {
      //解决积木undefined 问题
      var value ='';
      if (toStr(data)) {
        field.setValue(toStr(data));
        value = toJson(data);
      }
      else{
        field.setValue(data);
        value = data;
      }
      if (name === 'NAME') {
        if (value.text) {
          field.setText(value.text);
        }
        else{
          field.setText(value);
        }
      } else if (name === 'ARG') {
        if (this.getInput('get_dummy')) {
          if (this.getField('argType')) {
            this.getInput('get_dummy').removeField('argType');
          }
          if(value.type){
            this.getInput('get_dummy').appendField('('+value.type+')', 'argType');
          }
        }
        if (value.nameDesc) {
          field.setText(value.nameDesc[Blockly.Drools.defLang]);
        } else if (value.description) {
          field.setText(value.description);
        } else if (value.name) {
          field.setText(value.name);
        } else if(value){
          field.setText(value);
        }
        if (value.type && value.type.toLocaleLowerCase() === 'array') {
          this.appendChildArg(value.items);
        }
      }
    }
  },
  addDDropdown:function (me,data) {
    //移除后面add的积木
    var sum = parseInt(me.name.replace('jsonData',''))+1;
    for (var index = sum; index <= this.dropSum; index++) {
      if(this.getInput('get_dummy')){
        if(this.getField('jsonData' +index)){
          this.getInput('get_dummy').removeField('jsonData' + index);
        }
      }
    }
    this.dropSum = sum;
    data = toJson(data);
    var Dropname = 'jsonData' + this.dropSum;
    if(data.type === 'Json' && data.attrs.length > 0){
      var arr = new Array();
      var datas = new Array();
      datas.push('请选择','请选择');
      arr.push(datas);
      for(var i=0; i< data.attrs.length;i++){
        var item = data.attrs[i];
        datas = [];
        datas.push(item.name,toStr(item));
        arr.push(datas);
      }
      this.getInput('get_dummy')
        .appendField(new Blockly.FieldDropdown(arr,function name(data) {
          this.sourceBlock_.addDDropdown(this,data);
        }),Dropname);
      this.dropSum++;
    }
  },
  dropSum :1,
};
Blockly.Blocks['rule_returnArg'] = {
  init: function () {
    var me = this;
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setColour(290);
    this.appendDummyInput('returnArg_dummy')
      .appendField('返回 对象:')
      .appendField(new Blockly.SelectWin('showObjGridWin', function (data, win) {
        win.setValue(toStr(data));
        win.setText(data.text);
      },Blockly.Drools.getPanelArgs()), 'NAME')
      .appendField('的属性（类型：String）：')
      .appendField(new Blockly.SelectWin('showArgGridWin', function (data, win) {
        if (data) {
          win.setValue(toStr(data));
          if (data.nameDesc) {
            win.setText(data.nameDesc[Blockly.Drools.defLang]);
          } else if (data.description) {
            win.setText(data.description);
          } else if (data.name) {
            win.setText(data.name);
          }
        }
      },function () {
        var obj = toJson(me.getFieldValue('NAME'));
        var ret = [];
        if (obj.value && obj.value[0]) {
          var val = obj.value[0];
          for (var key in val) {
            ret = val[key];
          }
        }

        var strs = [];
        for (var i = 0; i < ret.length; i++) {
          var arg = ret[i];
          if (arg.type && 'string' === arg.type.toLowerCase()) {
            strs.push(arg);
          }
        }
        return strs;
      }), 'ARG');
    this.setPreviousStatement(true);
    this.contextMenu = true;
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
    this.arguments_ = [];
  },
  setFieldValue: function(value, name) {
    var field = this.getField(name);
    if (field) {
      field.setValue(toStr(value));
      if (name === 'NAME') {
        field.setText(toJson(value).text);
      } else if (name === 'ARG') {
        if (toJson(value).nameDesc) {
          field.setText(toJson(value)[Blockly.Drools.defLang]);
        } else if (toJson(value).description) {
          field.setText(toJson(value).description);
        } else if (toJson(value).name) {
          field.setText(toJson(value).name);
        } else if(value){
          field.setText(value);
        }
      }
    }
  }
};

Blockly.Blocks['rule_return_string'] = {
  init: function () {
    var items = Blockly.Drools.getVarNames('String');
    this.setHelpUrl('返回字符串');
    this.setColour(210);
    this.appendDummyInput()
      .appendField('返回')
      .appendField(new Blockly.FieldDropdown(items.length > 0 ?
        items : [['String','String']], function (value) {
        this.setValue(value);
      }), 'NAME');
    this.setPreviousStatement(true);
    this.contextMenu = true;
    this.setTooltip('返回字符串');
    this.arguments_ = [];
  }
};

Blockly.Blocks['rule_return_number'] = {
  init: function () {
    var items = Blockly.Drools.getVarNames('int');
    this.setHelpUrl('返回数值');
    this.setColour(210);
    this.appendDummyInput()
      .appendField('返回')
      .appendField(new Blockly.FieldDropdown(items.length > 0 ?
        items : [['Number','Number']], function (value) {
        this.setValue(value);
      }), 'NAME');
    this.setPreviousStatement(true);
    this.contextMenu = true;
    this.setTooltip('返回数值');
    this.arguments_ = [];
  }
};

Blockly.Blocks['rule_return_boolean'] = {
  init: function () {

    var bool = [['false', 'false'],['true', 'true']];

    this.setHelpUrl('返回true或false');
    this.setColour(210);
    this.appendDummyInput()
      .appendField('返回')
      .appendField(new Blockly.FieldDropdown(bool), 'RETURN');
    this.setPreviousStatement(true);
    this.contextMenu = true;
    this.setTooltip('返回true或false');
    this.arguments_ = [];
  },
  setFieldValue: function(data, name) {
    var field = this.getField(name);
    if (field) {
      if (data === true) {
        field.setValue('true');
      } else if (data === false) {
        field.setValue('false');
      } else {
        field.setValue(data);
      }
    }
  }
};

Blockly.Blocks['rule_splice'] = {
  init: function () {
    var me = this;
    this.num = Blockly.Drools.count++;
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setColour(290);
    this.appendDummyInput('splice_dummy')
      .appendField('拼接')
      .appendField(new Blockly.SelectWin('showObjGridWin', function (data, win) {
        win.setValue(toStr(data));
        win.setText(data.text);
      },Blockly.Drools.getPanelArgs()), 'NAME')
      .appendField('的集合')
      .appendField(new Blockly.SelectWin('showArgGridWin', function (data, win) {
        if (data) {
          win.setValue(toStr(data));
          if (data.nameDesc) {
            win.setText(data.nameDesc[Blockly.Drools.defLang]);
          } else if (data.description) {
            win.setText(data.description);
          } else if (data.name) {
            win.setText(data.name);
          }
          if (data.type && data.type.toLocaleLowerCase() === 'array') {
            me.setWarningText(null);
            me.appendChildArg(data.items);
          } else {
            me.setWarningText('不是array类型的数据无法合计！');
          }
        }
      }, function () {
        var obj = toJson(me.getFieldValue('NAME')) || {};
        var ret = [];
        if (obj.value && obj.value[0]) {
          var val = obj.value[0];
          for (var key in val) {
            ret = val[key];
          }
        }
        return ret;
      }), 'ARG');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = true;
    this.setTooltip('拼接文字');
    this.arguments_ = [];
  },

  appendChildArg : function (obj, signNum) {
    if (!obj || 'object' !== obj.type) {
      this.setWarningText('array数据下面没有元素信息！或数据存在异常！');
      return;
    } else {
      this.setWarningText(null);
    }
    var input = this.getInput('splice_dummy');
    if (input) {
      if (this.getField('desc')) {
        input.removeField('desc');
      }
      if (this.getField('childArg')) {
        input.removeField('childArg');
      }
      if (this.getField('varName')) {
        input.removeField('varName');
      }
      this.varName = 'splice_' + this.num;
      var me = this;
      input.appendField('的属性', 'desc')
        .appendField(new Blockly.SelectWin('showArgGridWin', function (data, win) {
          if (data) {
            win.setValue(data);
            if (data.nameDesc) {
              win.setText(data.nameDesc[Blockly.Drools.defLang]);
            } else if (data.description) {
              win.setText(data.description);
            } else if (data.name) {
              win.setText(data.name);
            }
            input.appendField('  为字符(String): '+ me.varName, 'varName');
          }
        }, function () {
          var val = obj.properties || {};
          var ret = [];
          for (var key in val) {
            var child = {};
            child.name = key;
            child.description = val[key].description;
            child.type = val[key].type;
            ret.push(child);
          }
          return ret;
        },'childArg'));
    }
  },
  getRuleVarName : function (type) {
    if (type === 'String' && this.getField('varName')) {
      return this.varName;
    }
  },
  setFieldValue: function(data, name) {
    var field = this.getField(name);
    if (field) {
      field.setValue(toStr(data));
      var value  = '';
      if (toJson(data)) {
        value = toJson(data);
      }
      else{
        value = data;
      }
      if (name === 'NAME') {
        if (value.text) {
          field.setText(value.text);
        }
        else{
          field.setText(value);
        }

      } else if (name === 'ARG') {
        if (value.nameDesc) {
          field.setText(value.nameDesc[Blockly.Drools.defLang]);
        } else if (value.description) {
          field.setText(value.description);
        } else if (value.name) {
          field.setText(value.name);
        } else if(value){
          field.setText(value);
        }
        if (value.type && value.type.toLocaleLowerCase() === 'array') {
          this.setWarningText(null);
          this.appendChildArg(value.items);
        } else {
          this.setWarningText('不是array类型的数据无法拼接属性！');
        }
      } else if (name === 'childArg') {
        if (value.nameDesc) {
          field.setText(value.nameDesc[Blockly.Drools.defLang]);
        } else if (value.description) {
          field.setText(value.description);
        } else if (value.name) {
          field.setText(value.name);
        }
      }
    }
  }
};

Blockly.Blocks['rule_map'] = {
  init: function () {
    var me = this;
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setColour(290);
    this.appendDummyInput()
      .appendField('取得上一节点的')
      .appendField(new Blockly.FieldTextInput(''), 'ARG');
    this.setOutput(true);
    this.contextMenu = true;
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
    this.arguments_ = [];
  }
};

Blockly.Blocks['rule_getdatafield'] = {
  processDataFields : [],
  activityDataFields : [],
  destinationDataFields : [],
  dataFields: [['','']],
  init: function () {
    var scopes = [['流程','process'],['节点', 'activity'],['目标', 'destination']];
    this.processDataFields = [];
    this.activityDataFields = [];
    this.destinationDataFields = [];
    for (var i = 0; i < Blockly.Blocks.processDataFields.length; i++) {
      var dfs = [];
      dfs.push(Blockly.Blocks.processDataFields[i].name);
      dfs.push(Blockly.Blocks.processDataFields[i].name);
      this.processDataFields.push(dfs);
    }
    for (var i = 0; i < Blockly.Blocks.activityDataFields.length; i++) {
      var field = Blockly.Blocks.activityDataFields[i];
      var dfs = [];
      dfs.push(Blockly.Blocks.activityDataFields[i].name);
      dfs.push(Blockly.Blocks.activityDataFields[i].name);
      if (field.scope === 'Activity' || field.scope === 'activity') {
        this.activityDataFields.push(dfs);
      } else {
        this.destinationDataFields.push(dfs);
      }
    }
    var me = this;
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setColour(290);
    this.appendDummyInput()
      .appendField('获取')
      .appendField(new Blockly.FieldDropdown(scopes), 'ARG')
      .appendField('中DataFields:')
      .appendField(new Blockly.FieldDropdown(function () {
        var v = me.getField('ARG');
        if (v && v.getValue() === 'process' && me.processDataFields.length > 0) {
          return me.processDataFields;
        } else if (v && v.getValue() === 'activity' && me.activityDataFields.length > 0) {
          return me.activityDataFields;
        } else if (v && v.getValue() === 'destination' && me.destinationDataFields.length > 0) {
          return me.destinationDataFields;
        } else {
          return me.dataFields;
        }
      }), 'VALUE')
      .appendField('的数据');
    this.setOutput(true);
    this.contextMenu = true;
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
  }
};

Blockly.Blocks['rule_setdatafield'] = {
  processDataFields : [],
  activityDataFields : [],
  destinationDataFields : [],
  dataFields: [['','']],
  init: function () {
    var scopes = [['流程','process'],['节点', 'activity'],['目标', 'destination']];
    this.processDataFields = [];
    this.activityDataFields = [];
    this.destinationDataFields = [];
    for (var i = 0; i < Blockly.Blocks.processDataFields.length; i++) {
      var dfs = [];
      dfs.push(Blockly.Blocks.processDataFields[i].name);
      dfs.push(Blockly.Blocks.processDataFields[i].name);
      this.processDataFields.push(dfs);
    }
    for (var i = 0; i < Blockly.Blocks.activityDataFields.length; i++) {
      var field = Blockly.Blocks.activityDataFields[i];
      var dfs = [];
      dfs.push(Blockly.Blocks.activityDataFields[i].name);
      dfs.push(Blockly.Blocks.activityDataFields[i].name);
      if (field.scope === 'Activity' || field.scope === 'activity') {
        this.activityDataFields.push(dfs);
      } else {
        this.destinationDataFields.push(dfs);
      }

    }
    var me = this;
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setColour(290);
    this.appendValueInput('NEXT')
      .appendField('给')
      .appendField(new Blockly.FieldDropdown(scopes), 'ARG')
      .appendField('中DataFields:')
      .appendField(new Blockly.FieldDropdown(function () {
        var v = me.getField('ARG');
        if (v && v.getValue() === 'process' && me.processDataFields.length > 0) {
          return me.processDataFields;
        } else if (v && v.getValue() === 'activity' && me.activityDataFields.length > 0) {
          return me.activityDataFields;
        } else if (v && v.getValue() === 'destination' && me.destinationDataFields.length > 0) {
          return me.destinationDataFields;
        } else {
          return me.dataFields;
        }
      }), 'VALUE')
      .appendField('赋值为');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.contextMenu = true;
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
  },
  getRuleVarName : function (type) {
    if (type === 'String' && this.getField('VALUE') && this.getField('ARG')) {
      var arg = this.getFieldValue('ARG');
      var name = this.getFieldValue('VALUE');
      var respName = arg + '_' + name.replace(' ','_');
      return respName;
    }
  },
};

Blockly.Blocks['rule_returnNumber'] = {
  init: function () {

    var items = [['全部','1'],['指定','2'],['百分比','3']];

    var me = this;
    this.num = Blockly.Drools.count++;
    this.setColour(290);
    this.appendValueInput('NEXT')
      .appendField('返回')
      .appendField(new Blockly.FieldDropdown(items, function (data) {
        this.setValue(data);
        if (data === '1') {
          if (me.getField('OBJ')) {
            this.sourceBlock_.removeInput('PRO');
          }
        }else if (data === '2') {
          if (me.getField('OBJ')) {
            this.sourceBlock_.removeInput('PRO');
          }
        } else if (data === '3') {
          if (!me.getField('OBJ')) {
            this.sourceBlock_.append();
          }
        }
      }), 'TYPE')
      .appendField('  ');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.contextMenu = true;
  },

  append: function () {
    this.appendDummyInput('PRO')
      .appendField('的')
      .appendField(new Blockly.FieldTextInput(''), 'OBJ')
      .appendField('%');
  },
  setFieldValue: function(newValue, name) {
    var field = this.getField(name);
    if (field == null && name === 'OBJ') {
      this.append();
      field = this.getField('OBJ');
      field.setValue(newValue);
      return;
    }
    field.setValue(newValue);
  }
};

Blockly.Blocks['rule_byLanguage'] = {
  init: function () {
    this.setColour(290);
    this.appendDummyInput()
      .appendField('常量的多语言转换')
      .appendField(new Blockly.FieldDropdown(Blockly.Drools.langArr), 'TYPE');
    this.setTooltip('language type');
    this.setOutput(true);
  }
};

Blockly.Blocks['rule_typeChange'] = {
  init: function () {
    var items = [['Integer', 'Integer'], ['String', 'String'], ['Float', 'Float'], ['Double', 'Double'], ['BigDecimal','BigDecimal'], ['DateTime','DateTime']];
    this.setColour(290);
    this.appendValueInput('IN')
      .appendField(new Blockly.FieldDropdown(items,  function (data) {
        this.setValue(data);
        if (data === 'DateTime') {
          this.sourceBlock_.append();
        } else {
          if (this.sourceBlock_.getField('OBJ')) {
            this.sourceBlock_.removeInput('PRO');
          }
        }
      }), 'TYPE');
    this.setInputsInline(true);
    this.setTooltip('data type');
    this.setOutput(true);
  },
  append: function () {
    this.appendDummyInput('PRO')
      .appendField('格式:')
      .appendField(new Blockly.FieldTextInput(''), 'OBJ');
  },
  setFieldValue: function(newValue, name) {
    var field = this.getField(name);
    if (field == null && name === 'OBJ') {
      this.append();
      field = this.getField('OBJ');
      field.setValue(newValue);
      return;
    }
    field.setValue(newValue);
  }
};

Blockly.Blocks['rule_getByLang'] = {
  init: function () {
    this.setColour(290);
    this.appendValueInput('IN')
      .appendField('上下文与对象属性的多语言转换')
      .appendField(new Blockly.FieldDropdown(Blockly.Drools.langArr), 'TYPE');
    this.setInputsInline(true);
    this.setTooltip('language type');
    this.setOutput(true);
  }
};

Blockly.Blocks['rule_baseItem'] = {
  init: function () {
    this.setColour(290);
    var me = this;
    this.appendValueInput('IN')
      .appendField('定义变量')
      .appendField(new Blockly.FieldDropdown(Blockly.Drools.typeArr), 'TYPE')
      .appendField(new Blockly.SelectWin('showItemWin',function (data, win) {
        win.setValue(data);
        win.setText(data);
      }, ''), 'NAME');
    this.setTooltip('item');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  },
  getRuleVarName: function (type) {
    if (this.getField('NAME') && this.getField('TYPE')) {
      if (type === this.getFieldValue('TYPE')) {
        return this.getFieldValue('NAME');
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
};

Blockly.Blocks['rule_jsonSplice'] = {
  init: function () {
    var me = this;
    this.num = Blockly.Drools.count++;
    this.respName = 'jsonSplice_'+ this.num;
    this.num = Blockly.Drools.count++;
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setColour(290);
    this.appendDummyInput()
      .appendField('拼接JsonNode:')
      .appendField(new Blockly.FieldDropdown(function () {
        return Blockly.Drools.getVarNames('JsonNode').length > 0 ? Blockly.Drools.getVarNames('JsonNode') : [['','']];
      }), 'NAME')
      .appendField('的Key:');
    this.appendValueInput('KEY');
    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput(this.respName), 'returnName');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('拼接JSONNODE的key的值');
  },
  getRuleVarName : function (type) {
    if (type === 'String' && this.getField('returnName')) {
      return this.respName;
    }
  },
  setFieldValue: function(data, name) {
    var field = this.getField(name);
    if ('returnName' === name) {
      this.respName = toStr(data);
    }
    if (field) {
      field.setValue(toStr(data));
    }
  }
};

Blockly.Blocks['rule_splitString'] = {
  init: function () {
    this.setColour(290);
    this.num = Blockly.Drools.count++;
    this.respName = 'split_'+ this.num;
    this.appendDummyInput()
      .appendField('以字符"')
      .appendField(new Blockly.FieldTextInput(''), 'point')
      .appendField('"拆分字符串');
    this.appendValueInput('STR');
    this.appendDummyInput()
      .appendField('返回字符串数组')
      .appendField(new Blockly.FieldTextInput(this.respName), 'returnName');
    this.setInputsInline(true);
    this.setTooltip('拆分字符串');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  },
  getRuleVarName : function (type) {
    if (type === 'arr' && this.getField('returnName')) {
      return this.respName;
    }
  },
  setFieldValue: function(data, name) {
    var field = this.getField(name);
    if ('returnName' === name) {
      this.respName = toStr(data);
    }
    if (field) {
      field.setValue(toStr(data));
    }
  }
};

Blockly.Blocks['rule_useArrByIndex'] = {
  init: function () {
    this.setColour(290);
    this.appendDummyInput()
      .appendField('取数组')
      .appendField(new Blockly.FieldDropdown(function () {
        return Blockly.Drools.getVarNames('arr').length > 0 ? Blockly.Drools.getVarNames('arr') : [['','']];
      }), 'NAME')
      .appendField('下标');
    this.appendValueInput('INDEX');
    this.setInputsInline(true);
    this.setTooltip('根据数组下标取数组元素');
    this.setOutput(true);
  }
};

Blockly.Blocks['rule_doOutRest'] = {
  init: function () {
    BaseUrlData;
    this.setColour(290);
    this.num = Blockly.Drools.count++;
    this.respName = 'outRest_'+ this.num;
    this.appendDummyInput()
      .appendField('请求外部接口URL:')
      .appendField(new Blockly.FieldDropdown(BaseUrlData), 'BASEURL')
      .appendField('+')
      .appendField(new Blockly.SelectWin('showItemAreaWin',function (data, win) {
        win.setValue(data);
        win.setText(data);
      }, ''), 'URL');
    this.appendDummyInput()
      .appendField('请求类型:')
      .appendField(new Blockly.FieldDropdown([['POST','1'],['GET','0']]), 'METHODTYPE');
    this.appendDummyInput()
      .appendField('请求参数:')
      .appendField(new Blockly.SelectWin('showItemAreaWin',function (data, win) {
        win.setValue(data);
        win.setText(data);
      }, ''), 'PARAMS');
    this.appendDummyInput()
      .appendField('返回JsonNode对象')
      .appendField(new Blockly.FieldTextInput(this.respName), 'returnName');
    this.setTooltip('请求外部接口');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  },
  getRuleVarName : function (type) {
    if (type === 'JsonNode' && this.getField('returnName')) {
      return this.respName;
    }
  },
  setFieldValue: function(data, name) {
    var field = this.getField(name);
    if ('returnName' === name) {
      this.respName = toStr(data);
    }
    if (field) {
      if (toStr(data)) {
        field.setValue(toStr(data));
      }
      else{
        field.setValue(data);
      }
    }
  }
};

Blockly.Blocks['rule_getArgOfJson'] = {
  init: function () {
    var items = [['String', 'String'], ['Integer', 'Integer'], ['Float', 'Float'], ['Double', 'Double']];
    this.setColour(160);
    this.appendDummyInput()
      .appendField('取类型为')
      .appendField(new Blockly.FieldDropdown(items), 'TYPE')
      .appendField('的JsonNode:')
      .appendField(new Blockly.FieldDropdown(function () {
        return Blockly.Drools.getVarNames('JsonNode').length > 0 ? Blockly.Drools.getVarNames('JsonNode') : [['','']];
      }), 'NAME')
      .appendField('的Key:')
      .appendField(new Blockly.FieldTextInput(''), 'KEY')
      .appendField('的值');
    this.setOutput(true);
  }
};

Blockly.Blocks['rule_jsonGet'] = {
  init: function () {
    this.setColour(290);
    this.appendValueInput('INDEX')
      .appendField('JsonNode数据')
      .appendField(new Blockly.FieldDropdown(function () {
        return Blockly.Drools.getVarNames('JsonNode').length > 0 ? Blockly.Drools.getVarNames('JsonNode') : [['','']];
      }), 'NAME')
      .appendField(new Blockly.FieldDropdown(Blockly.Drools.jsonDoArr), 'METHOD');
    this.setInputsInline(true);
    this.setTooltip('JsonNode根据变量取值，返回JsonNode');
    this.setOutput(true);
  }
};

Blockly.Blocks['rule_jsonMethod'] = {
  init: function () {
    this.setColour(290);
    this.appendDummyInput()
      .appendField('JsonNode数据')
      .appendField(new Blockly.FieldDropdown(function () {
        return Blockly.Drools.getVarNames('JsonNode').length > 0 ? Blockly.Drools.getVarNames('JsonNode') : [['','']];
      }), 'NAME')
      .appendField('类型转换方法')
      .appendField(new Blockly.FieldDropdown(Blockly.Drools.jsonMethodArr), 'METHOD');
    this.setTooltip('JsonNode执行数据转换方法');
    this.setOutput(true);
  }
};

Blockly.Blocks['rule_getFormJson'] = {
  init: function () {
    this.setColour(290);
    this.appendDummyInput()
      .appendField('获取表单的')
      .appendField(new Blockly.SelectWin('doSelectWin', function (data, win) {
        //新版复合选择器 传的是数组 所有取第一个
        // data = data[0];
        if (data && data.path) {
          win.setValue(toStr(data));
          win.setText(data.path);
        }
      }, 'form'), 'OBJ')
      .appendField('JsonNode数据');
    this.setTooltip('获取表单的JsonNode类型数据');
    this.setOutput(true);
  },
  setFieldValue: function(data, name) {
    var field = this.getField(name);
    if (field) {
      field.setValue(toStr(data));
      if (name === 'OBJ') {
        //解决积木undefined问题 2020年4月21日13:47:07 yl
        if (toJson(data).path) {
          field.setText(toJson(data).path);
        }
        else{
          field.setText(data);
        }
      }
    }
  }
};

Blockly.Blocks['rule_useBaseItem'] = {
  init: function () {
    this.setColour(290);
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(function () {
        return Blockly.Drools.getBaseItem();
      }), 'NAME');
    this.setTooltip('use item');
    this.setOutput(true);
  }
};

Blockly.Blocks['rule_setItemVal'] = {
  init: function () {
    this.setColour(290);
    this.appendValueInput('IN')
      .appendField('变量')
      .appendField(new Blockly.FieldDropdown(function () {
        return Blockly.Drools.getBaseItem();
      }), 'NAME')
      .appendField(' = ');
    this.setInputsInline(false);
    this.setTooltip('use item');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
  }
};

Blockly.Blocks['rule_math_arithmetic'] = {
  /**
     * Block for basic arithmetic operator.
     * @this Blockly.Block
     */
  init: function () {
    var OPERATORS =
            [
              [Blockly.Msg.MATH_ADDITION_SYMBOL, 'ADD'],
              [Blockly.Msg.MATH_SUBTRACTION_SYMBOL, 'MINUS'],
              [Blockly.Msg.MATH_MULTIPLICATION_SYMBOL, 'MULTIPLY'],
              [Blockly.Msg.MATH_DIVISION_SYMBOL, 'DIVIDE'],
              [Blockly.Msg.MATH_POWER_SYMBOL, 'POWER']
            ];
    this.setHelpUrl(Blockly.Msg.MATH_ARITHMETIC_HELPURL);
    this.setColour(230);
    this.setOutput(true);
    this.appendValueInput('A');
    this.appendValueInput('B')
      .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function () {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        ADD: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD,
        MINUS: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS,
        MULTIPLY: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MULTIPLY,
        DIVIDE: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_DIVIDE,
        POWER: Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_POWER
      };
      return TOOLTIPS[mode];
    });
  }
};

Blockly.Blocks['logic_compare'] = {
  /**
   * Block for comparison operator.
   * @this Blockly.Block
   */
  init: function () {
    var OPERATORS = Blockly.RTL ? [
      ['=', 'EQ'],
      ['\u2260', 'NEQ'],
      ['<', 'LT'],
      ['\u2265', 'LTE'],
      ['>', 'GT'],
      ['\u2264', 'GTE'],
      ['.equals', '.equals'],
      ['.contains', '.contains'],
      ['.after', '.after'],
      ['.before', '.before'],
      ['.startsWith', '.startsWith'],
      ['.endsWith', '.endsWith']
    ] : [
      ['=', 'EQ'],
      ['\u2260', 'NEQ'],
      ['<', 'LT'],
      ['\u2264', 'LTE'],
      ['>', 'GT'],
      ['\u2265', 'GTE'],
      ['.equals', '.equals'],
      ['.contains', '.contains'],
      ['.after', '.after'],
      ['.before', '.before'],
      ['.startsWith', '.startsWith'],
      ['.endsWith', '.endsWith']
    ];
    this.setHelpUrl(Blockly.Msg.LOGIC_COMPARE_HELPURL);
    this.setColour(210);
    this.setOutput(true, 'Boolean');
    this.appendValueInput('A');
    this.appendValueInput('B')
      .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function () {
      var op = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        EQ: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ,
        NEQ: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_NEQ,
        LT: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT,
        LTE: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LTE,
        GT: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT,
        GTE: Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GTE
      };
      return TOOLTIPS[op];
    });
  }
};

Blockly.Blocks['logic_operation'] = {
  /**
   * Block for logical operations: 'and', 'or'.
   * @this Blockly.Block
   */
  init: function () {
    this.OPERATORS =
      [
        [Blockly.Msg.LOGIC_OPERATION_AND, 'AND'],
        [Blockly.Msg.LOGIC_OPERATION_OR, 'OR']
      ];
    this.setHelpUrl(Blockly.Msg.LOGIC_OPERATION_HELPURL);
    this.setColour(210);
    this.setOutput(true, 'Boolean');
    this.appendValueInput('IN0')
      .setCheck('Boolean');
    this.appendValueInput('IN1')
      .setCheck('Boolean')
      .appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP1');
    this.setInputsInline(true);
    this.setMutator(new Blockly.Mutator(['logic_compare_number']));
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function () {
      var op = thisBlock.getFieldValue('OP1');
      var TOOLTIPS = {
        AND: Blockly.Msg.LOGIC_OPERATION_TOOLTIP_AND,
        OR: Blockly.Msg.LOGIC_OPERATION_TOOLTIP_OR
      };
      return TOOLTIPS[op];
    });
  },
  /**
   * Create XML to represent the number of else-if and else inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function () {
    if (!this.opCount_) {
      return null;
    }

    this.params_ = [];
    var container = document.createElement('mutation');
    if (this.opCount_) {
      var parameter = {};
      parameter.name = 'operators';
      parameter.value = this.opCount_;
      this.params_.push(parameter);
      container.setAttribute('name', 'operators');
      container.setAttribute('value', this.opCount_);
    }
    return container;
  },
  getMutationParams: function () {
    this.mutationToDom();
    return this.params_;
  },
  domToMutation: function (xmlElement) {
    this.arguments_ = [];
    var elements = [].concat(xmlElement);
    for (var x = 0; x < elements.length; x++) {
      if (elements[x].name && elements[x].name.toLowerCase() == 'operators') {
        this.opCount_ = parseInt(elements[x].value, 10);
      }
      if(elements[x].getAttribute){
        if (elements[x].getAttribute('name') && elements[x].getAttribute('name').toLowerCase() == 'operators' && elements[x].getAttribute('value')) {
          this.opCount_ = parseInt(elements[x].getAttribute('value'), 10);
        }
      }

      for (var x = 1; x <= this.opCount_; x++) {
        this.appendValueInput('IN' + (x+1))
          .setCheck('Boolean')
          .appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP' + (x+1));
      }
    }
  },
  decompose: function (workspace) {
    // var containerBlock = Blockly.Block.obtain(workspace, 'logic_compare_base');
    var containerBlock = workspace.newBlock('logic_compare_base');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 1; x <= this.opCount_; x++) {
      // var numberBlock = Blockly.Block.obtain(workspace, 'logic_compare_number');
      var numberBlock = workspace.newBlock('logic_compare_number');
      numberBlock.initSvg();
      connection.connect(numberBlock.previousConnection);
      connection = numberBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function (containerBlock) {
    // this.opCount_ = 0;
    // Disconnect all the input blocks and remove the inputs.
    for (var x = this.opCount_; x > 0; x--) {
      if (this.getInput('IN' + (x + 1))) {
        this.removeInput('IN' + (x + 1));
      }
      if (this.getInput('OP' + (x + 1))) {
        this.removeInput('OP' + (x + 1));
      }
    }
    this.opCount_ = 0;
    // Rebuild the block's optional inputs.
    var clauseBlock = containerBlock.getInputTargetBlock('STACK');
    while (clauseBlock) {
      switch (clauseBlock.type) {
      case 'logic_compare_number':
        this.opCount_++;

        var ifInput = this.appendValueInput('IN' + (this.opCount_ + 1))
          .setCheck('Boolean')
          .appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP' + (this.opCount_ + 1));

          // Reconnect any child blocks.
        if (clauseBlock.valueConnection_) {
          ifInput.connection.connect(clauseBlock.valueConnection_);
        }
        if (clauseBlock.statementConnection_) {
          doInput.connection.connect(clauseBlock.statementConnection_);
        }
        break;
      default:
        console.log('Unknown block type ' + clauseBlock.type);
      }
      clauseBlock = clauseBlock.nextConnection &&
        clauseBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function (containerBlock) {
    var clauseBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 1;
    while (clauseBlock) {
      switch (clauseBlock.type) {
      case 'logic_compare_number':
        var inputIf = this.getInput('IN' + x);
        var inputDo = this.getInput('OP' + x);
        clauseBlock.valueConnection_ =
            inputIf && inputIf.connection.targetConnection;
        clauseBlock.statementConnection_ =
            inputDo && inputDo.connection.targetConnection;
        x++;
        break;
      default:
        throw 'Unknown block type.';
      }
      clauseBlock = clauseBlock.nextConnection &&
        clauseBlock.nextConnection.targetBlock();
    }
  }
};

Blockly.Blocks['logic_compare_base'] = {
  /**
   * Mutator block for compare container.
   * @this Blockly.Block
   */
  init: function () {
    this.setColour(210);
    this.appendDummyInput()
      .appendField('Logic Compare');
    this.appendStatementInput('STACK');
    this.setTooltip(Blockly.Msg.CONTROLS_IF_IF_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['logic_compare_number'] = {
  /**
   * Mutator block for additional numbers.
   * @this Blockly.Block
   */
  init: function () {
    this.setColour(210);
    this.appendDummyInput()
      .appendField('number');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('number tooltip');
    this.contextMenu = false;
  }
};

Blockly.Blocks['controls_if'] = {
  /**
   * Block for if/elseif/else condition.
   * @this Blockly.Block
   */
  init: function () {
    this.setHelpUrl(Blockly.Msg.CONTROLS_IF_HELPURL);
    this.setColour(210);
    this.appendValueInput('IF0')
      .setCheck('Boolean')
      .appendField(Blockly.Msg.CONTROLS_IF_MSG_IF);
    this.appendStatementInput('DO0')
      .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setMutator(new Blockly.Mutator(['controls_if_elseif',
      'controls_if_else']));
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function () {
      if (!thisBlock.elseifCount_ && !thisBlock.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_1;
      } else if (!thisBlock.elseifCount_ && thisBlock.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_2;
      } else if (thisBlock.elseifCount_ && !thisBlock.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_3;
      } else if (thisBlock.elseifCount_ && thisBlock.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_4;
      }
      return '';
    });
    this.elseifCount_ = 0;
    this.elseCount_ = 0;
  },
  /**
   * Create XML to represent the number of else-if and else inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function () {
    if (!this.elseifCount_ && !this.elseCount_) {
      return null;
    }

    this.params_ = [];
    var container = document.createElement('mutation');
    if (this.elseifCount_) {
      var parameter = {};
      parameter.name = 'elseif';
      parameter.value = this.elseifCount_;
      this.params_.push(parameter);
      container.setAttribute('elseif', this.elseifCount_);
    }
    if (this.elseCount_) {
      var parameter = {};
      parameter.name = 'else';
      parameter.value = this.elseCount_;
      this.params_.push(parameter);
      container.setAttribute('else', 1);
    }
    return container;
  },
  getMutationParams: function () {
    this.mutationToDom();
    return this.params_;
  },
  /**
   * Parse XML to restore the else-if and else inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function (xmlElement) {
    this.arguments_ = [];
    var elements = [].concat(xmlElement);
    for (var x = 0; x < elements.length; x++) {
      if (elements[x].name && elements[x].name.toLowerCase() == 'else') {
        this.elseCount_ = parseInt(elements[x].value, 10);
      }
      if (elements[x].name && elements[x].name.toLowerCase() == 'elseif') {
        this.elseifCount_ = parseInt(elements[x].value, 10);
      }
      if (elements[x].getAttribute && elements[x].getAttribute('else')) {
        this.elseCount_ = parseInt(elements[x].getAttribute('else'), 10);
      }
      if (elements[x].getAttribute && elements[x].getAttribute('elseif')) {
        this.elseifCount_ = parseInt(elements[x].getAttribute('elseif'), 10);
      }
    }
    for (var x = 1; x <= this.elseifCount_; x++) {
      this.appendValueInput('IF' + x)
        .setCheck('Boolean')
        .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF);
      this.appendStatementInput('DO' + x)
        .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
    }
    if (this.elseCount_) {
      this.appendStatementInput('ELSE')
        .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSE);
    }
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function (workspace) {
    var containerBlock = Blockly.Block.obtain(workspace, 'controls_if_if');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 1; x <= this.elseifCount_; x++) {
      var elseifBlock = Blockly.Block.obtain(workspace, 'controls_if_elseif');
      elseifBlock.initSvg();
      connection.connect(elseifBlock.previousConnection);
      connection = elseifBlock.nextConnection;
    }
    if (this.elseCount_) {
      var elseBlock = Blockly.Block.obtain(workspace, 'controls_if_else');
      elseBlock.initSvg();
      connection.connect(elseBlock.previousConnection);
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function (containerBlock) {
    // Disconnect the else input blocks and remove the inputs.
    if (this.elseCount_) {
      this.removeInput('ELSE');
    }
    this.elseCount_ = 0;
    // Disconnect all the elseif input blocks and remove the inputs.
    for (var x = this.elseifCount_; x > 0; x--) {
      this.removeInput('IF' + x);
      this.removeInput('DO' + x);
    }
    this.elseifCount_ = 0;
    // Rebuild the block's optional inputs.
    var clauseBlock = containerBlock.getInputTargetBlock('STACK');
    while (clauseBlock) {
      switch (clauseBlock.type) {
      case 'controls_if_elseif':
        this.elseifCount_++;
        var ifInput = this.appendValueInput('IF' + this.elseifCount_)
          .setCheck('Boolean')
          .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF);
        var doInput = this.appendStatementInput('DO' + this.elseifCount_);
        doInput.appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
        // Reconnect any child blocks.
        if (clauseBlock.valueConnection_) {
          ifInput.connection.connect(clauseBlock.valueConnection_);
        }
        if (clauseBlock.statementConnection_) {
          doInput.connection.connect(clauseBlock.statementConnection_);
        }
        break;
      case 'controls_if_else':
        this.elseCount_++;
        var elseInput = this.appendStatementInput('ELSE');
        elseInput.appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSE);
        // Reconnect any child blocks.
        if (clauseBlock.statementConnection_) {
          elseInput.connection.connect(clauseBlock.statementConnection_);
        }
        break;
      default:
        throw 'Unknown block type.';
      }
      clauseBlock = clauseBlock.nextConnection &&
        clauseBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function (containerBlock) {
    var clauseBlock = containerBlock.getInputTargetBlock('STACK');
    var x = 1;
    while (clauseBlock) {
      switch (clauseBlock.type) {
      case 'controls_if_elseif':
        var inputIf = this.getInput('IF' + x);
        var inputDo = this.getInput('DO' + x);
        clauseBlock.valueConnection_ =
            inputIf && inputIf.connection.targetConnection;
        clauseBlock.statementConnection_ =
            inputDo && inputDo.connection.targetConnection;
        x++;
        break;
      case 'controls_if_else':
        var inputDo = this.getInput('ELSE');
        clauseBlock.statementConnection_ =
            inputDo && inputDo.connection.targetConnection;
        break;
      default:
        throw 'Unknown block type.';
      }
      clauseBlock = clauseBlock.nextConnection &&
        clauseBlock.nextConnection.targetBlock();
    }
  }
};


Blockly.Blocks['controls_if_if'] = {
  /**
   * Mutator block for if container.
   * @this Blockly.Block
   */
  init: function () {
    this.setColour(210);
    this.appendDummyInput()
      .appendField(Blockly.Msg.CONTROLS_IF_IF_TITLE_IF);
    this.appendStatementInput('STACK');
    this.setTooltip(Blockly.Msg.CONTROLS_IF_IF_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['controls_if_elseif'] = {
  /**
   * Mutator bolck for else-if condition.
   * @this Blockly.Block
   */
  init: function () {
    this.setColour(210);
    this.appendDummyInput()
      .appendField(Blockly.Msg.CONTROLS_IF_ELSEIF_TITLE_ELSEIF);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.CONTROLS_IF_ELSEIF_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['controls_if_else'] = {
  /**
   * Mutator block for else condition.
   * @this Blockly.Block
   */
  init: function () {
    this.setColour(210);
    this.appendDummyInput()
      .appendField(Blockly.Msg.CONTROLS_IF_ELSE_TITLE_ELSE);
    this.setPreviousStatement(true);
    this.setTooltip(Blockly.Msg.CONTROLS_IF_ELSE_TOOLTIP);
    this.contextMenu = false;
  }
};
