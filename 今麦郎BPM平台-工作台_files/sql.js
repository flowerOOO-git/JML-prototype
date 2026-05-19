/**
 * Created by apple on 17/10/18.
 */
'use strict';

//通过objid查子流程的api，查询该对象的所有子流程并且把流程属性全部列出来
Blockly.Blocks['select_get'] = {
  init: function () {
    //var objproperties = Blockly.Drools1.panelTreeData;
    var objname = Blockly.Drools1.objectname;
    var me = this;
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setColour(330);
    this.appendDummyInput('get_dummy')
      .appendField('对象:')
      .appendField(objname)
      .appendField('的属性:')
    //新增了第3个参数，用来选择使用哪种面板 tree 树形 dialogpage 分页的  不填或者dialog 是普通的对话框
      .appendField(new Blockly.multipleFieldDialog(Blockly.Drools1.panelTreeData,function (data_) {
        var value = data_[0].data;
        var type;
        //积木显示的内容，又对象描述就取，没有就显示对象名字
        var name;
        if(value.objdesc) {
          name = value.objdesc;
        }else {
          if(value.objectName) {
            name = value.objectName;
          }else {
            name = value.text;
          }
        }
        if(value.desc) {
          var text = name + '.' + value.desc;
        }else {
          var text = name + '.' + value.name;
        }
        //自然语言的描述
        if(value.desc) {
          var desc = '[' + name + '].[' + value.desc + ']';
        }else {
          var desc = name;
        }
        // var desc = name  + '的' + value.desc;
        //是否是递归属性
        if(value.isOrg == '1'){
          type = 'recursion';
        }else {
          type = value.type;
        }
        //制作一个类把需要传的参数放进类里，然后赋值给value，好让回显的时候能用到
        var value_ = {};
        //this.type = type;
        //分类如果是别名那么生成个uuid作为value
        if(value.alias){
          value_.getvalue = value.alias + '.' + value.value;
        }else {
          value_.getvalue = value.formname + '.' + value.name;
        }
        value_.name = text;
        value_.desc = desc;
        this.formname = value.formname;
        this.setValue(value_);
        this.setText(text);
        Blockly.Drools1.changeopt(me,type,'NAME3');
      } , 'tree'), 'NAME');
    this.setOutput(true);
    this.contextMenu = true;
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
    this.arguments_ = [];
  },

  setFieldValue: function(value, name) {
    var field = this.getField_(name);
    if (field) {
      field.setValue(value);
      field.setText(value.name);
      //var con = this.getSurroundParent();
      // var type = this.type;
      // Blockly.Drools1.changeopt(this,type,'NAME3');
    }
  }
};




Blockly.Blocks['select_allobj'] = {
  init: function () {
    var OPERATORS = Blockly.Drools1.panelGridData;
    var me = this;
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setColour(280);
    this.appendDummyInput('get_dummy')
      .appendField('取得对象:')
      .appendField(new Blockly.multipleFieldDialog(OPERATORS , function (value) {
        var this_ = this;
        this.setValue(value[0].data);
        this.setText(value[0].data.objectName);
        this.objlist = value[0].data.objectName;
        var allobjOPT =[];

        Blockly.Drools1.getUrlData(me,'NAME1',function (data) {
          var seturl = me.getField_('NAME2');
          allobjOPT = data;
          seturl.menuGenerator_ = allobjOPT[0];
          seturl.setText('请选择属性');
          var init = {};
          var temp = value[0].data;

          init.objectName = value[0].data.objectName;
          init.url = allobjOPT[1];
          temp.init = init;
          this_.setValue(temp);
        });
        //seturl.menuGenerator_ = allobjOPT[0];
        //seturl.setText('请选择属性');

      } , 'dialogpage'), 'NAME1')
      .appendField('的属性：')
      .appendField(new Blockly.multipleFieldDialog(null, function (value) {
        var seturl = me.getField_('NAME2');
        var setText = '(' + value.length + ')';
        var setValue;
        var value_ = {};
        //value.objectName = setText;
        if(value[0].data.relId){
          for (var i = 0; i < value.length; i++) {
            //把值设为 'value[1]'，'value[2]'，'value[3]'的形式
            if (value[i].data.id)
              if (i == 0) {
                setValue = '\'' + value[i].data.relId + '\'';
              } else {
                setValue = setValue + ',' + '\'' + value[i].data.relId + '\'';
              }
          }
        }else {
          for (var i = 0; i < value.length; i++) {
            //把值设为 'value[1]'，'value[2]'，'value[3]'的形式
            if (value[i].data.id)
              if (i == 0) {
                setValue = '\'' + value[i].data.id + '\'';
              } else {
                setValue = setValue + ',' + '\'' + value[i].data.id + '\'';
              }
          }
        }
        //把选中了多少个值放进num属性，方便到时改变操作符为in
        var num = value.length;
        Blockly.Drools1.selectnum(me,num);

        value_.objectName = setText;
        value_.getValue = setValue;
        //把url传进去是为了点击确定之后再打开依然能看到选择值的面板上有值显示
        //value_.url = seturl.url;
        this.setValue(value_);
        this.setText(setText);
      }, 'dialogpageORchecktree'), 'NAME2');
    this.setOutput(true);
    this.contextMenu = true;
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
    this.arguments_ = [];
  },

  onchange: function () {

  },

  setFieldValue: function(value, name) {
    var me = this;
    var field = this.getField_(name);
    if (field) {
      field.setValue(value);
      field.setText(value.objectName);
      if(value.init && value.init!= null){
        var seturl = me.getField_('NAME2');
        var allobjOPT = {};
        Blockly.Drools1.getGridPagePanelcontent(value.init.url, value.init.objectName,function (data) {
          allobjOPT =  data;
          seturl.menuGenerator_ = allobjOPT;
        });

      }
      // var type = this.type;
      // Blockly.Drools1.changeopt(this,type,'NAME3');
    }
  }
};



Blockly.Blocks['select_opt'] = {
  init: function() {
    var me = this;
    this.appendValueInput('NAME1');
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(Blockly.Drools1.string,function (value) {
        var text = value.text;
        // var value_ = {};
        // value_.getvalue = value.value;
        // value_.name = value.text;
        this.setValue(value.value);
        //this.value_ = value_;
        //this.text_ = text;
        Blockly.Drools1.addblock(me,text);
        //Blockly.Drools1.addrecursion(me,text);
      },'select'), 'NAME3');
    this.appendValueInput('context');

    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  },

  setFieldValue: function(value, name) {
    var me = this;
    var field = this.getField_(name);

    if(name == 'NAME3'){
      var patt = /[a-z]+/;
      var type = value.match(patt);
      if (field) {
        if(type == 'rec') {
          field.menuGenerator_ = Blockly.Drools1.recursion;
        }else if(type == 'str'){
          field.menuGenerator_ = Blockly.Drools1.string;
        }else if(type == 'int'){
          field.menuGenerator_ = Blockly.Drools1.integer;
        }else if(type == 'dec'){
          field.menuGenerator_ = Blockly.Drools1.bigdecimal;
        }else if(type == 'bool'){
          field.menuGenerator_ = Blockly.Drools1.boolean;
        }else if(type == 'date'){
          field.menuGenerator_ = Blockly.Drools1.datetime;
        }else if(type == 'obj'){
          field.menuGenerator_ = Blockly.Drools1.object;
        }
      }
    }
    if (field) {
      field.setValue(value);
      //field.setText(value);

      // var type = this.type;
      // Blockly.Drools1.changeopt(this,type,'NAME3');
    }
    if(name == 'path'){
      var orgdata = Blockly.Drools1.getOrgData(Blockly.Drools1.Recursiondropdown[0].value);
      me.removeInput('context', 3);
      me.removeInput('context1', 3);
      if(me.getField_('path')){
        //没有就创建有就不管
      }else {
        me.appendInput_(5, 'recursion');
        for(var i=0,input; input = me.inputList[i]; i++) {
          if(input.name == 'recursion') {
            input.appendField(' ');
            input.appendField(new Blockly.multipleFieldDialog(orgdata, function (value) {
              var lanuage = PAI.Global.getLanguage();
              var value_ = {};
              value_.formname = value.getAt(0).lastValue;
              value_.name = value.getAt(1).getSelection()[0].data.text[lanuage];
              value_.getvalue = value.getAt(1).getSelection()[0].data.ext.idPath;

              this.setValue(value_);
              this.setText(value_.name);
            }, 'form'), 'path');
          }
        }
      }
      var temp = me.getField_('path');
      if(temp){
        temp.setValue(value);
        temp.setText(value.name);
      }
    }
  }
};

Blockly.Blocks['select_operation'] = {
  /**
     * Block for logical operations: 'and', 'or'.
     * @this Blockly.Block
     */
  init: function () {
    this.OPERATORS = [
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

    var container = [];
    if (this.opCount_) {
      var parameter = {};
      parameter.name = 'operators';
      parameter.value = this.opCount_;
      container.push(parameter);
    }
    return container;
  },
  domToMutation: function (xmlElement) {
    this.arguments_ = [];
    var elements = [].concat(xmlElement);
    for (var x = 0; x < elements.length; x++) {
      if (elements[x].name.toLowerCase() == 'operators') {
        this.opCount_ = parseInt(elements[x].value, 10);
      }

      for (var x = 1; x <= this.opCount_; x++) {
        this.appendValueInput('IN' + (x+1))
          .setCheck('Boolean')
          .appendField(new Blockly.FieldDropdown(this.OPERATORS), 'OP' + (x+1));
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
  /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
  compose: function (containerBlock) {
    // this.opCount_ = 0;
    // Disconnect all the input blocks and remove the inputs.
    for (var x = this.opCount_; x > 0; x--) {
      this.removeInput('IN' + (x + 1));
      this.removeInput('OP' + (x + 1));
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

Blockly.Blocks['select_text'] = {
  /**
     * Block for text value.
     * @this Blockly.Block
     */
  init: function () {
    this.setHelpUrl(Blockly.Msg.TEXT_TEXT_HELPURL);
    this.setColour(160);
    this.appendDummyInput()
      .appendField(this.newQuote_(true))
      .appendField(new Blockly.FieldTextInput(''), 'TEXT')
      .appendField(this.newQuote_(false));
    this.setOutput(true, 'String');
    this.setTooltip(Blockly.Msg.TEXT_TEXT_TOOLTIP);
  },
  /**
     * Create an image of an open or closed quote.
     * @param {boolean} open True if open quote, false if closed.
     * @return {!Blockly.FieldImage} The field image of the quote.
     * @private
     */
  newQuote_: function (open) {
    if (open == Blockly.RTL) {
      var file = 'quote1.png';
    } else {
      var file = 'quote0.png';
    }
    return new Blockly.FieldImage(Blockly.pathToBlockly + 'media/' + file,
      12, 12, '"');
  }
};

Blockly.Blocks['select_number'] = {
  init: function () {
    this.setHelpUrl(Blockly.Msg.TEXT_TEXT_HELPURL);
    this.setColour(160);
    this.appendDummyInput()
      .appendField(new Blockly.FieldTextInput(''), 'NUM');
    this.setOutput(true);
    this.setTooltip('非字符串');
  }
};

Blockly.Blocks['select_boolean'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(Blockly.Drools1.bool), 'Boolean');
    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['select_datetime'] = {
  init: function() {
    this.appendDummyInput()
      .appendField('转换格式：')
      .appendField(new Blockly.FieldDropdown(Blockly.Drools1.time), 'FORMAT');
    this.appendValueInput('TIME');
    this.setInputsInline(true);
    this.setOutput(true);
    this.setColour(210);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

