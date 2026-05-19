/**
 * Created by apple on 17/10/18.
 */
'use strict';

Blockly.Blocks['tool_language'] = {
  init: function () {
    this.setColour(290);
    this.appendValueInput('LANG0')
      .appendField(new Blockly.FieldDropdown(Blockly.Drools.langArr), 'TYPE0');
    this.setTooltip('language type');
    this.setMutator(new Blockly.Mutator(['logic_compare_number']));
    this.inputNum = 0;
  },
  mutationToDom: function () {
    if (!this.opCount_) {
      return null;
    }

    //var container = [];
    this.params_ = [];
    var container = document.createElement('mutation');
    if (this.opCount_) {
      // var parameter = {};
      // parameter.name = 'operators';
      // parameter.value = this.opCount_;
      // container.push(parameter);
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
      if (elements[x].name.toLowerCase() == 'operators') {
        this.opCount_ = parseInt(elements[x].value, 10);
      }

      for (var x = 1; x <= this.opCount_; x++) {
        this.appendValueInput('LANG' + x)
          .appendField(new Blockly.FieldDropdown(Blockly.Drools.langArr), 'TYPE' + x);
      }
    }
  },
  decompose: function (workspace) {
    var containerBlock = Blockly.Block.obtain(workspace, 'logic_compare_base');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var x = 1; x <= this.opCount_; x++) {
      var numberBlock = Blockly.Block.obtain(workspace, 'logic_compare_number');
      numberBlock.initSvg();
      connection.connect(numberBlock.previousConnection);
      connection = numberBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function (containerBlock) {
    // this.opCount_ = 0;
    // Disconnect all the input blocks and remove the inputs.
    // for (var x = this.opCount_; x > 0; x--) {
    //     this.removeInput('LANG' + x);
    // }
    this.opCount_ = 0;
    // Rebuild the block's optional inputs.
    var clauseBlock = containerBlock.getInputTargetBlock('STACK');
    while (clauseBlock) {
      switch (clauseBlock.type) {
      case 'logic_compare_number':
        this.opCount_++;
        if (this.opCount_ > this.inputNum) {
          this.inputNum++;
          var ifInput = this.appendValueInput('LANG' + this.inputNum)
            .appendField(new Blockly.FieldDropdown(Blockly.Drools.langArr), 'TYPE' + this.inputNum);
          // Reconnect any child blocks.
          if (clauseBlock.valueConnection_) {
            ifInput.connection.connect(clauseBlock.valueConnection_);
          }
        }
        break;
      default:
        console.log('Unknown block type ' + clauseBlock.type);
      }
      clauseBlock = clauseBlock.nextConnection &&
              clauseBlock.nextConnection.targetBlock();
    }
    for (; this.inputNum > this.opCount_; this.inputNum--) {
      this.removeInput('LANG' + this.inputNum);
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
        var inputIf = this.getInput('LANG' + x);
        clauseBlock.valueConnection_ =
                inputIf && inputIf.connection.targetConnection;
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

Blockly.Blocks['tool_text'] = {
  init: function () {
    this.setColour(160);
    this.appendValueInput('NEXT')
      .appendField(new Blockly.FieldTextInput(''), 'TEXT');
    this.setOutput(true);
    this.setTooltip(Blockly.Msg.TEXT_TEXT_TOOLTIP);
  }
};


Blockly.Blocks['tool_chooseObj'] = {
  init: function () {
    this.setColour(160);
    this.appendValueInput('NEXT')
      .appendField('从对象选择器中选择')
      .appendField(new Blockly.SelectWin('doSelectWin', function (data, win) {
        data = data[0];
        if (data) {
          //  var val = {};
          //  Blockly.Drools.getParentNode(val, data);
          // win.setValue(toStr(val));
          // win.setText(val.pointStr);
          //流程上下文
          if(data.selectorType === 'processContext'){
            if(data.label){
              win.redata = data.label;
            }
            win.setValue(toStr(data));
            win.setText(data.path);
          }
          else if(data.selectorType === 'form'){
            win.setValue(toStr(data));
            win.setText(data.path);
            //回显
          //  if(data.name){
          //    win.redata = data.name
          //  }
          }
        } else {
          // alert('请选择子节点');
          Blockly.vue_.$notify({
            type: 'warn',
            message: '请选择子节点',
            duration:1500
          });
        }
      }, 'formtemp'), 'OBJ');
    this.setOutput(true);
  },
  setFieldValue: function(value, name) {
    var field = this.getField(name);
    var newValue = toJson(value);
    field.setValue(toStr(value));
    if (newValue.key && newValue.key === 'bizModelBrowser') {
      field.setText(newValue.path);
    } else {
      if(newValue.pointStr){
        field.setText(newValue.pointStr);
      }
      else{
        if('processContext' === newValue.selectorType){
          field.setText(newValue.path);
        }
        else{
          field.setText(newValue.path);
        }
      }
    }
    if(value === '选择器'){
      field.setText(value);
    }
  }
};

Blockly.Blocks['tool_chooseSeq'] = {
  init: function () {

    var items = [['自动产生','1'],['手动设置序列号','2'],['通过条件选择序列号','3']];
    var me = this;

    this.setColour(160);
    this.appendValueInput('NEXT')
      .appendField('序列选择器')
      .appendField(new Blockly.FieldDropdown(items, function (data) {
        this.setValue(data);
        if (data === '1') {
          if (me.getField('OBJ')) {
            this.sourceBlock_.getInput('NEXT').removeField('OBJ');
          }
        }else if (data === '2') {
          if (!me.getField('OBJ')) {
            this.sourceBlock_.append(data);
          }
        }else if (data === '3') {
          if (!me.getField('OBJ')) {
            this.sourceBlock_.append(data);
          }
        }
      }), 'TYPE');
    this.setOutput(true);
  },
  append: function () {
    var winParam = 'serialnumber';
    var sign = this.getFieldValue('TYPE');
    if (sign === '3') {
      winParam = 'serialcondition';
    }
    this.getInput('NEXT')
      .appendField(new Blockly.SelectWin('doSelectWin', function (data,win) {
        if (sign === '2' && data && data.code) {
          win.setValue(toStr(data.code));
          win.setText(data.code);
        } else if (sign === '3' && data && data.length > 0) {
          win.setValue(toStr(data));
          win.setText(data.length + '个序列号条件');
        }

      }, winParam), 'OBJ');
  },
  setFieldValue: function(newValue, name) {
    var field = this.getField(name);
    if (field == null && name === 'OBJ') {
      this.append();
      field = this.getField('OBJ');
      var sign = this.getFieldValue('TYPE');
      if (sign === '3') {
        field.setValue(newValue);
        var jsonval = toJson(newValue);
        field.setText(jsonval ? (jsonval.length + '个序列号条件') : '');
      } else {
        field.setValue(newValue);
      }
      return;
    }
    field.setValue(newValue);
  }

};

Blockly.Blocks['tool_chooseDateType'] = {
  init: function () {

    var items = [
      ['8位年月日','yyyyMMdd'],
      ['6位年月日','yyMMdd'],
      ['4位年份','yyyy'],
      ['2位年份','yy'],
      ['2位月份','MM'],
      ['月份','mm'],
      ['2位日期','dd'],
      ['日期','d']
    ];

    this.setColour(160);
    this.appendValueInput('NEXT')
      .appendField('日期选择器')
      .appendField(new Blockly.FieldDropdown(items), 'DATETYPE');

    this.setOutput(true);
  }
};
var item1 = [['is null', 'is null'], ['is not null', 'is not null'], ['in', 'in']];
Blockly.Blocks['sql_compare'] = {
  init: function() {
    this.appendValueInput('NAME1');
    this.appendValueInput('NAME')
      .appendField(new Blockly.FieldDropdown(item1), 'NAME');
    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['sql_get'] = {
  init: function () {
    var me = this;
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setColour(280);
    this.appendDummyInput('get_dummy')
      .appendField('取得对象:')
      .appendField(new Blockly.FieldDialog(function () {
        return Blockly.Drools.getPanelArgs.call();
      }, function (value) {
        this.setValue(value);
        this.setText(value.text);
      }), 'NAME')
      .appendField('的属性：')
      .appendField(new Blockly.FieldDialog(function () {
        var obj = me.getFieldValue('NAME') || {};
        var ret = [];
        if (obj.value && obj.value[0]) {
          var val = obj.value[0];
          for (var key in val) {
            ret = val[key];
          }
        }
        return Blockly.Drools.getAttrs(ret, obj.sign);
      }, function (value) {
        if (value) {
          this.setValue(value);
          if (value.description) {
            this.setText(value.description);
          } else if (value.name) {
            this.setText(value.name);
          }
          if (value.type && value.type.toLocaleLowerCase() === 'array') {
            me.appendChildArg(value.items);
          }
        }
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
      if (this.getField_('desc')) {
        input.removeField('desc');
      }
      if (this.getField_('method')) {
        input.removeField('method');
      }
      if (this.getField_('index')) {
        input.removeField('index');
      }
      if (this.getField_('desc_1')) {
        input.removeField('desc_1');
      }
      if (this.getField_('desc_2')) {
        input.removeField('desc_2');
      }
      this.varName = 'sum_' + this.id;
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
  setFieldValue: function(value, name) {
    var field = this.getField_(name);
    if (field) {
      field.setValue(value);
      if (name === 'NAME') {
        field.setText(value.text);
      } else if (name === 'ARG') {
        if (value.description) {
          field.setText(value.description);
        } else if (value.name) {
          field.setText(value.name);
        }
        if (value.type && value.type.toLocaleLowerCase() === 'array') {
          this.appendChildArg(value.items);
        }
      }
    }
  }
};
