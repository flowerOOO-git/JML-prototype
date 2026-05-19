/**
 * Created by Administrator on 2017/10/24.
 */

'use strict';

Blockly.Drools['tool_language'] = function(block) {

  var num = block.inputNum;
  var obj = {};
  for (var i = 0; i <= block.inputNum; i++) {
    var lang = Blockly.Drools.statementToCode(block, 'LANG' + i).trim();
    var type = block.getFieldValue('TYPE' + i);
    obj[type] = lang;
  }
  if (obj.zh_CN && !obj.en) {
    obj['en'] = obj.zh_CN;
  } else if (obj.en && !obj.zh_CN) {
    obj['zh_CN'] = obj.en;
  }
  var objStr = JSON.stringify(obj);
  return objStr;
};

Blockly.Drools['tool_text'] = function(block) {
  var next = Blockly.Drools.statementToCode(block, 'NEXT');
  //过滤空格
  next = next.trim();
  var code = block.getFieldValue('TEXT') + next;
  return code;
};

Blockly.Drools['tool_chooseObj'] = function(block) {
  var object = block.getFieldValue('OBJ'),
    code = '';
  if (!object) {
    Blockly.Blocks.rule.errorMsg.push('tool_chooseObj 积木没有选择值！');
    return '';
  }
  var next = Blockly.Drools.statementToCode(block, 'NEXT');
  next = next.trim();
  var objvar = toJson(object);
  //上下文选择器
  if (objvar.selectorType === 'form') {
    code = code + '{D:' + objvar.path + '}';
  } else if (objvar.selectorType === 'processContext') {
    code = code + '{P:' + objvar.path + '}';
  } else {
    if (objvar.name) {
      code = code + '{P:' + objvar.name + '}';
    }
    // else{
    //   code = code + '{P:' + objvar.objName + '.' +objvar.name + '}';
    // }
  }
  code = code + next;
  return code;
};

Blockly.Drools['tool_chooseSeq'] = function(block) {

  var object = block.getFieldValue('TYPE'),
    code = '',
    seq = '';
  if (!object) {
    Blockly.Blocks.rule.errorMsg.push('tool_chooseSeq 积木没有选择序列方式！');
    return '';
  }
  if (object === '2') {
    seq = '{' + block.getFieldValue('OBJ') + '}';
  }else if (object === '3') {
    var valstr = block.getFieldValue('OBJ');
    var valobj = toJson(valstr);
    if (valobj && valobj.length > 0) {
      seq = '{';
      for (var i = 0; i < valobj.length; i++) {
        var v = valobj[i];
        var codestr = v.formField + '@' + v.fieldConstant + '@' + v.serialCode;
        if (i < valobj.length -1) {
          codestr = codestr + '$';
        }
        seq = seq + codestr;
      }
      seq = seq + '}';
    } else {
      Blockly.Blocks.rule.errorMsg.push('tool_chooseSeq 通过条件判断序列号的数据错误');
      return '';
    }
  } else {
    // TODO 如果选择自动，这里应该是啥？
    seq = '{code}';
  }
  var next = Blockly.Drools.statementToCode(block, 'NEXT');
  next = next.trim();

  code = code + seq + next;
  return code;
};

Blockly.Drools['tool_chooseDateType'] = function(block) {

  var object = this.getField('DATETYPE'),
    code = '';
  if (!object) {
    Blockly.Blocks.rule.errorMsg.push('tool_chooseDateType 积木没有日期类型！');
    return '';
  }
  var next = Blockly.Drools.statementToCode(block, 'NEXT');
  next = next.trim();

  code = code + '[' + object.getValue() + ']' + next;
  return code;
};

Blockly.Drools['sql_compare'] = function(block) {
  var code = 'alert(1);';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.Drools['sql_get'] = function(block) {
  var code = 'alert(2);';
  return [code, Blockly.JavaScript.ORDER_NONE];
};
