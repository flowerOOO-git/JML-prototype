
'use strict';
//获取属性类型
Blockly.Drools['select_get'] = function(block) {
  var temp =  block.getField_('NAME').value_;
  var value;
  if(temp) {
    value = temp.getvalue;
  }else {
    value = 'null';
  }
  var code = value;
  return [code, Blockly.JavaScript.ORDER_CONDITIONAL];
};

//操作符的选择翻译
Blockly.Drools['select_opt'] = function(block) {
  var op_ = block.getField_('NAME3').value_;

  var optext_ = block.getField_('NAME3').text_;
  var treePanelValue = block.getFieldValue('path') || '';

  var argumentNAME1 = Blockly.Drools.valueToCode(block, 'NAME1', 0) || 'false';

  var argumentcontext = Blockly.Drools.valueToCode(block, 'context', 0) || '';
  var argumentcontext1 = Blockly.Drools.valueToCode(block, 'context1', 0) || '';
  //如果第3个空槽有值就代表是between and符号，所有后面要加个AND
  if(argumentcontext1 != ''){
    var patt1 = /^"(.*)"$/;
    if(argumentcontext1.match(patt1) != null) {
      argumentcontext1 = argumentcontext1.match(patt1)[1];
      argumentcontext1 = '\'' + argumentcontext1  + '\'';
    }
    argumentcontext1 = 'AND' + ' ' + argumentcontext1;
  }


  //利用正则表达式改变嵌套的积木的内容
  if(optext_ =='='){
    var patt = /=/;
    op_ = op_.match(patt);


  }else if(optext_ =='\u2260'){
    var patt = /!=/;
    op_ = op_.match(patt);


  }else if(optext_ =='<' ) {
    //如果是<符号，那么就只取<符号
    var patt = /</;
    op_ = op_.match(patt);


  }else if(optext_ =='\u2264' ) {

    var patt = /<=/;
    op_ = op_.match(patt);


  }else if(optext_ =='>' ) {
    //如果是in符号，那么就在外面套个（）括号
    var patt = />/;
    op_ = op_.match(patt);

  }else if(optext_ =='\u2265' ) {
    //如果是in符号，那么就在外面套个（）括号
    var patt = />=/;
    op_ = op_.match(patt);

  } else if(optext_ =='in' || optext_ == 'not in') {
    //如果是in符号，那么就在外面套个（）括号
    var patt = /[A-Z](.*)[A-Z]/g;
    op_ = op_.match(patt);
    argumentcontext = '(' + argumentcontext + ')';
    //如果是begins的话
  }else if(optext_ =='begins with' || optext_ == 'doesn\'t begin with'){

    var patt = /[A-Z](.*)[A-Z]/g;
    op_ = op_.match(patt);
    if(argumentcontext) {
      var patt1 = /^'(.*)'$/;
      if (argumentcontext.match(patt1) != null) {

        argumentcontext = argumentcontext.match(patt1)[1];
        argumentcontext = '(' + '\'' + argumentcontext + '%' + '\'' + ')';
      }
    }

  }else if(optext_ == 'contains' || optext_ == 'doesn\'t contains'){
    //因为正则匹配修改fieldValue的值如果相同显示会有问题，所以值为正确值后面加了个1
    // ，正则匹配修改fieldValue的值，把后面的数字去掉
    var patt = /[A-Z](.*)[A-Z]/g;
    op_ = op_.match(patt);

    //把积木的翻译里的双引号去掉
    if(argumentcontext) {
      var patt1 = /^'(.*)'$/;
      if (argumentcontext.match(patt1) != null) {

        argumentcontext = argumentcontext.match(patt1)[1];
        argumentcontext = '(' + '\'' + '%' + argumentcontext + '%' + '\'' + ')';
      }
    }
  }else if(optext_ == 'ends with' || optext_ == 'doesn\'t ends with'){
    //因为正则匹配修改fieldValue的值如果相同显示会有问题，所以值为正确值后面加了个1
    // ，正则匹配修改fieldValue的值，把后面的数字去掉
    var patt = /[A-Z](.*)[A-Z]/g;
    op_ = op_.match(patt);
    //把积木的翻译里的双引号去掉
    if(argumentcontext) {
      var patt1 = /^'(.*)'$/;
      if (argumentcontext.match(patt1) != null) {

        argumentcontext = argumentcontext.match(patt1)[1];
        argumentcontext = '(' + '\'' + '%' + argumentcontext  + '\'' + ')';
      }
    }


  }else if(optext_ == 'hierarchy' || optext_ == 'recursion'){
    var patt = /[A-Z](.*)[A-Z]/g;
    op_ = op_.match(patt);

  }else  if(optext_ == 'is empty'){
    var patt = /=' '/;
    op_ = op_.match(patt);
  }else  if(optext_ == 'is not empty'){
    var patt = /!=' '/;
    op_ = op_.match(patt);
  }else  if(optext_ == 'is null'){
    var patt = /IS NULL/;
    op_ = op_.match(patt);
  }else  if(optext_ == 'is not null'){
    var patt = /IS NOT NULL/;
    op_ = op_.match(patt);
  }else  if(optext_ == 'between'){
    var patt = /BETWEEN/;
    op_ = op_.match(patt);

  }else  if(optext_ == 'not between'){
    var patt = /NOT BETWEEN/;
    op_ = op_.match(patt);

  }

  var code;
  var RelFormname;
  if(treePanelValue != '' && treePanelValue != null) {
    //var targetBlock = block.getInputTargetBlock('NAME1').getField_('NAME');
    //var formname = Blockly.Drools1.panelTreeData.store.root.children[0].formname;
    if(Blockly.Drools1.RelFormname){
      for(var i = 0; i < Blockly.Drools1.RelFormname.length; i++){
        var relname = Blockly.Drools1.RelFormname[i].name;
        if (relname == treePanelValue.formname){
          RelFormname = Blockly.Drools1.RelFormname[i].RelFormname;
        }
      }
    }
    var treePanelValue_ = argumentNAME1 + ' ' +'IN (Select id from '+ RelFormname +' Where idPath LIKE \'' + treePanelValue.getvalue + '\')';
    code = treePanelValue_;
  }else {
    //var treePanelValue_ = treePanelValue;
    code = argumentNAME1 + ' ' + op_ + ' ' + argumentcontext + ' ' + argumentcontext1 ;
  }


  return [code, Blockly.JavaScript.ORDER_NONE];
};

//添加and 或者 or
Blockly.Drools['select_operation'] = function(block) {
  // Operations 'and', 'or'.
  var index = 1;
  var paramcode = '';
  var b = true;
  while (b){
    var fuhao = block.getFieldValue('OP'+index);
    var operator = (fuhao == 'AND') ? 'AND' : 'OR';
    var order = (operator == '&&') ? Blockly.Drools.ORDER_LOGICAL_AND :
      Blockly.Drools.ORDER_LOGICAL_OR;
    if (index === 1) {
      var argument = Blockly.Drools.valueToCode(block, 'IN0', 0);
      if (!argument) {
        // If there are no arguments, then the return value is false.
        argument = 'false';
      }
      paramcode = argument;
    }
    paramcode = paramcode+ ' ' + operator;
    var right = Blockly.Drools.valueToCode(block, 'IN'+index, 0);
    if (!right) {
      // If there are no arguments, then the return value is false.
      right = 'false';
    }
    paramcode = paramcode + ' ' + right;
    index++;
    if (!block.getFieldValue('OP'+index)) {
      b = false;
    }
  }

  var code = paramcode;
  return [code, order];
};

//添加 text类型
Blockly.Drools['select_text'] = function(block) {
  // Text value.
  var code = Blockly.Drools.javaquote_(block.getFieldValue('TEXT'));
  if(code) {
    var patt1 = /^"(.*)"$/;
    if (code.match(patt1) != null) {

      code = code.match(patt1)[1];
      code = '\'' + code + '\'';
    }
  }
  return [code, 99];
};

//添加number类型
Blockly.Drools['select_number'] = function(block) {
  // Text value.
  var code = block.getFieldValue('NUM');
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


Blockly.Drools['select_boolean'] = function(block) {
  // Text value.

  var code = block.getFieldValue('Boolean');
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
Blockly.Drools['select_datetime'] = function(block) {
  // Text value.
  var argumentstime = Blockly.Drools.valueToCode(block, 'TIME', 0) || '';
  var op_ = block.getFieldValue('FORMAT');
  var code = 'to_date(' + argumentstime + ',\'' + op_ + '\')';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Drools['select_allobj'] = function(block) {
  var temp =  block.getField_('NAME2').value_;
  var value;

  if(temp){
    value = temp.getValue;
  }else {
    value = null;
  }

  var code = value;
  if (value == '请选择属性'){
    code = 'null';
  }
  return [code, Blockly.JavaScript.ORDER_CONDITIONAL];
};
