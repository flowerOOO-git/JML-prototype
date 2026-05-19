/**
 * Created by Administrator on 2017/10/24.
 */

'use strict';

Blockly.Drools['controls_if'] = function(block) {
  var n = 0;
  var argument = Blockly.Drools.valueToCode(block, 'IF' + n,
    Blockly.Drools.ORDER_NONE) || 'false';
  var branch = Blockly.Drools.statementToCode(block, 'DO' + n);
  var code = 'if (' + argument + ') {\n' + branch + '}';
  for (n = 1; n <= block.elseifCount_; n++) {
    argument = Blockly.Drools.valueToCode(block, 'IF' + n,
      Blockly.Drools.ORDER_NONE) || 'false';
    branch = Blockly.Drools.statementToCode(block, 'DO' + n);
    code += ' else if (' + argument + ') {\n' + branch + '}';
  }
  if (block.elseCount_) {
    branch = Blockly.Drools.statementToCode(block, 'ELSE');
    code += ' else {\n' + branch + '}';
  }
  return code + '\n';
};

Blockly.Drools['logic_compare'] = function(block) {
  // Comparison operator.
  var TOOLTIPS = {
    EQ: '==',
    NEQ: '!=',
    LT: '<',
    LTE: '<=',
    GT: '>',
    GTE: '>='
  };
  var OPERATORS = Blockly.RTL ? {
    '=': '==',
    '\u2260': '!=',
    '>': '>',
    '\u2265': '>=',
    '<': '<',
    '\u2264': '<='
  } : {
    '=': '==',
    '\u2260': '!=',
    '<': '<',
    '\u2264': '<=',
    '>': '>',
    '\u2265': '>='
  };
  var op_ = block.getFieldValue('OP');
  var operator = OPERATORS[op_] || TOOLTIPS[op_] || op_;
  var order = (operator == '==' || operator == '!=') ?
    Blockly.Drools.ORDER_EQUALITY : Blockly.Drools.ORDER_RELATIONAL;
  var argument0 = Blockly.Drools.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Drools.valueToCode(block, 'B', order) || '0';
  var code;
  if ('.equals' === operator || '.contains' === operator
    || '.after' === operator || '.before' === operator
    || '.startsWith' === operator || '.endsWith' === operator) {
    code = '(' + argument0 + ')' + operator + '(' + argument1 + ')';
  } else {
    code = argument0 + ' ' + operator + ' ' + argument1;
  }
  return [code, order];
};

Blockly.Drools['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.Drools.ORDER_LOGICAL_AND :
    Blockly.Drools.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Drools.valueToCode(block, 'A', order);
  var argument1 = Blockly.Drools.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == '&&') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Drools['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Drools.ORDER_ATOMIC];
};

Blockly.Drools['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.Drools.ORDER_LOGICAL_NOT;
  var argument0 = Blockly.Drools.valueToCode(block, 'BOOL', order) ||
        'true';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.Drools['logic_null'] = function(block) {
  // Null data type.
  return ['null', Blockly.Drools.ORDER_ATOMIC];
};

Blockly.Drools['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Drools.valueToCode(block, 'IF',
    Blockly.Drools.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.Drools.valueToCode(block, 'THEN',
    Blockly.Drools.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.Drools.valueToCode(block, 'ELSE',
    Blockly.Drools.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.Drools.ORDER_CONDITIONAL];
};
Blockly.Drools['text'] = function(block) {
  // Text value.
  var code = Blockly.Drools.javaquote_(block.getFieldValue('TEXT'));
  return [code, 99];
};
Blockly.Drools['drools_number'] = function(block) {
  // Text value.
  var code = block.getFieldValue('NUM');
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Drools['rule_main'] = function(block) {

  // Define a procedure with a return value.
  var packagePath = 'package ' + Blockly.Drools.defPackage;
  packagePath = packagePath + '\n' + Blockly.Drools.placeholder+ '\n';
  var funcName = block.getFieldValue('NAME');

  if (funcName && funcName[Blockly.Drools.nameLang]) {
    Blockly.Drools.ruleObject.name = funcName[Blockly.Drools.nameLang];
    Blockly.Drools.ruleObject.nameDesc = funcName;
  } else {
    var myDate = new Date();
    var mytime=myDate.getTime();
    Blockly.Drools.ruleObject.name = 'rule'+mytime;
    Blockly.Drools.ruleObject.nameDesc = {};
    Blockly.Drools.ruleObject.nameDesc[Blockly.Drools.defLang] = '规则'+mytime;
    Blockly.Drools.ruleObject.nameDesc[Blockly.Drools.nameLang] = 'rule'+mytime;
  }

  funcName = '"'+Blockly.Drools.ruleObject.name+'"';

  var branch = Blockly.Drools.statementToCode(block, 'STACK');
  if (Blockly.Drools.INFINITE_LOOP_TRAP) {
    branch = Blockly.Drools.INFINITE_LOOP_TRAP.replace(/%1/g,
      '\'' + block.num + '\'') + branch;
  }
  var importStr = ' import java.util.*;\n'+
        'import java.text.SimpleDateFormat;\n'+
        'import java.math.BigDecimal;\n'+
        'import com.fasterxml.jackson.databind.JsonNode;\n'+
        'import com.paasit.pai.core.blogic.java.restTemplateToken.RestTemplateTokenBLogic;\n'+
        'import com.fasterxml.jackson.databind.ObjectMapper;\n'+
        'import com.paasit.pai.core.blogic.dto.externalInterfaceInvoke.ExternalInterfaceInvokeReqtM01;\n'+
        'import com.paasit.pai.core.blogic.dto.externalInterfaceInvoke.ExternalInterfaceInvokeRespM01;\n'+
        'import com.paasit.pai.core.common.util.SpringContextUtil;\n'+
        'import com.paasit.pai.core.blogic.java.externalInterfaceInvoke.ExternalInterfaceInvokeBLogic;\n';
  var globalStr =' global ObjectMapper $objectMapper;\n' +
        ' global java.util.Map<String, Object> $formData;\n' +
        ' global java.util.Map<String, Map<String, Object>> $datafield;\n' +
        ' global java.util.Map<String, String> $map;\n' +
        ' global RestTemplateTokenBLogic $restTemplateTokenBLogic;\n' +
        ' global String $token;\n' +
        ' global String $gatewayUrl;\n' +
        Blockly.Drools.globalholder + '\n';
  var restTemplate1 = {};
  // restTemplate2.importString = '';
  restTemplate1.globalName = '$datafield';
  restTemplate1.dataType = 'Map';
  Blockly.Drools.ruleObject.droolsGlobalVOList.push(restTemplate1);
  var restTemplate2 = {};
  // restTemplate2.importString = '';
  restTemplate2.globalName = '$formData';
  restTemplate2.dataType = 'Map';
  Blockly.Drools.ruleObject.droolsGlobalVOList.push(restTemplate2);
  // for (var y = 0; y < args.length; y++) {
  //     importStr += (args[y] + ';' + '\n');
  //     globalStr += (argGlobal[y] + ';' + '\n');
  // }
  var code = packagePath +
        importStr +
        globalStr +
        'rule ' + funcName + '\n' +
        'when \n    eval(true)\nthen \n    ' + Blockly.Drools.log(Blockly.Drools.ruleObject.name,'then', '规则执行开始') +
        branch + '\n    '+ Blockly.Drools.log(Blockly.Drools.ruleObject.name,'rule_main', '规则执行结束')+ 'end';
  code = Blockly.Drools.scrub_(block, code);
  return '\n'+code;
};

Blockly.Drools['rule_get'] = function(block) {
  var objectStr = block.getFieldValue('NAME');
  if (!objectStr) {
    Blockly.Blocks.rule.errorMsg.push('rule_get 积木没有选择对象！');
    return '';
  }
  var object = toJson(objectStr);
  var sign = object.sign,
    argStr = block.getFieldValue('ARG');
  if (!argStr) {
    Blockly.Blocks.rule.errorMsg.push('rule_get 积木没有选择属性！');
    return '';
  }
  var arg = toJson(argStr);
  var argName = arg.name,
    //Blockly.Drools.upArgFirstName(arg.name),
    result = '',
    code = '';
  if (object.methodType === '1') {
    result = result + 'arg_' + object.text + arg.name;
    code = code + 'String ' + result + ' = "";\n';
    code = code + 'for (Map<String, Object> map : '+ object.text +'.getResult()) {\n';
    code = code + '    if (map.containsKey("' + arg.name + '")) {\n';
    code = code + '        ' + result + ' = ' + result + ' + map.get("' + arg.name + '").toString() + ",";\n';
    code = code + '    }\n';
    code = code + '}\n';
    code = code + 'if (!"".equals(' + result + ')) {\n';
    code = code + result + ' = ' + result + '.substring(0, ' + result + '.length() - 1);\n';
    code = code + '}\n';
    if (!Blockly.Drools.sign_isHave[result]) {
      Blockly.Drools.sign_isHave[result] = object.text;
      Blockly.Drools.sign_getCode[object.text] = (Blockly.Drools.sign_getCode[object.text] || '') + code;
    }
    return [result,99];
  } else if(object.methodType === '0'){
    if (arg.type === 'string') {
      result = result + object.text + '.get("'+argName+'").asText()';
    }
    else{
      result = result + object.text + '.get("'+argName+'")';
    }
  }else {
    var sum = block.dropSum;
    var jsonData ='';
    var text = '';
    for (var index = 0; index < sum; index++) {
      jsonData = block.getFieldValue('jsonData'+index);
      if(jsonData === '请选择'){
        break;
      }
      if(jsonData){
        jsonData = toJson(jsonData);
        var value = jsonData.name;
        text += '.get("'+value+'")';
      }
    }
    if(text){
      //首字母转换大写
      argName = argName.replace(argName[0],argName[0].toUpperCase());
      result = result + object.text + '.get'+argName + '()'+ text;
    }else{
      argName = argName.replace(argName[0],argName[0].toUpperCase());
      result = result + object.text + '.get'+argName + '()';
    }
  }
  code = code + result;
  var method = block.getField('method');
  if (method) {
    var methodName = block.getFieldValue('method');
    if (methodName) {
      code = code + methodName;
      var index = block.getField('index');
      if (index) {
        var indexVal = block.getFieldValue('index');
        if (Blockly.Drools.isNumber(indexVal)) {
          code = code + '(' + indexVal + ')';
        } else {
          Blockly.Blocks.rule.errorMsg.push('rule_get 积木中get方法参数应该填写数字！');
          return '';
        }
      }
    }
  }
  return [code,99];
};

Blockly.Drools['rule_returnArg'] = function(block) {
  var objectStr = block.getFieldValue('NAME');
  if (!objectStr) {
    Blockly.Blocks.rule.errorMsg.push('rule_returnArg 积木没有选择对象！');
    return '';
  }
  var object = toJson(objectStr);
  var sign = object.sign,
    argStr = block.getFieldValue('ARG');
  if (!argStr) {
    Blockly.Blocks.rule.errorMsg.push('rule_returnArg 积木没有选择属性！');
    return '';
  }
  var arg = toJson(argStr);
  var argName = Blockly.Drools.upArgFirstName(arg.name),
    type = 'String',
    result = '',
    code = '';
  if (object.methodType === '1') {
    result = result + 'arg_' + object.text;
    code = code + 'String ' + result + ' = "";\n';
    code = code + 'for (Map<String, Object> map : '+ object.text +'.getResult()) {\n';
    code = code + '    if (map.containsKey("' + arg.name + '")) {\n';
    code = code + '        ' + result + ' = ' + result + ' + (map.get("' + arg.name + '") == null ? "" : map.get("' + arg.name + '").toString()) + ",";\n';
    code = code + '    }\n';
    code = code + '}\n';
    code = code + 'if (!"".equals(' + result + ')) {\n';
    code = code + result + ' = ' + result + '.substring(0, ' + result + '.length() - 1);\n';
    code = code + '}\n';
  }
  else if(object.methodType === '0'){
    result =  result + object.text + '.get("'+arg.name+'").asText()';
  }
  else{
    result = result + object.text + '.get'+argName + '()';
  }
  code = code + 'com.paasit.pai.core.drools.DroolsResult droolsResult = new com.paasit.pai.core.drools.DroolsResult();\n droolsResult.setStringResult('+result+');\n droolsResult.setDataFieldSetter("'+Blockly.Drools.getDFTOresult()+'");\n insertLogical(droolsResult);\n';
  var name = 'setStringResult';
  var queryStr = '';
  var method = {};
  method.name = name;
  method.returnType = type;
  // Blockly.Drools.ruleObject.queryMethod.push(method);
  //Blockly.Drools.queryString = Blockly.Drools.queryString + queryStr + '\n';
  Blockly.Drools.setQueryString(method, queryStr);
  return code;
};

Blockly.Drools['rule_sum'] = function(block) {

  if (block.warning) {
    Blockly.Blocks.rule.errorMsg.push('rule_sum 积木有错误警告'+block.warning.text);
    return '';
  }
  var objectStr = block.getFieldValue('NAME');
  if (!objectStr) {
    Blockly.Blocks.rule.errorMsg.push('rule_sum 积木没有选择对象！');
    return '';
  }
  var argStr = block.getFieldValue('ARG');
  if (!argStr) {
    Blockly.Blocks.rule.errorMsg.push('rule_sum 积木没有选择属性！');
    return '';
  }
  var childArgStr = block.getFieldValue('childArg');
  if (!childArgStr) {
    Blockly.Blocks.rule.errorMsg.push('rule_sum 积木没有选择子属性！');
    return '';
  }
  var object = toJson(objectStr);
  var arg = toJson(argStr);
  var childArg = toJson(childArgStr);
  var childName = Blockly.Drools.upArgFirstName(childArg.name);
  var argName = Blockly.Drools.upArgFirstName(arg.name),
    code = '',
    id = block.num,
    sumname = 'sum_'+id;
  code = code + 'int '+sumname +' = 0;\n';
  code = code + 'for (int i=0; i < '+object.text+'.get'+argName+ '().size(); i++) {\n' +
        '    ' + sumname +' += '+object.text+'.get'+argName+ '().get(i).get'+childName+'()';
  code = code + ';\n';
  code = code + '}\n';
  return code;
};

Blockly.Drools['rule_splice'] = function(block) {
  if (block.warning) {
    Blockly.Blocks.rule.errorMsg.push('rule_splice 积木有错误警告'+block.warning.text);
    return '';
  }
  var objectStr = block.getFieldValue('NAME');
  if (!objectStr) {
    Blockly.Blocks.rule.errorMsg.push('rule_splice 积木没有选择对象！');
    return '';
  }
  var argStr = block.getFieldValue('ARG');
  if (!argStr) {
    Blockly.Blocks.rule.errorMsg.push('rule_splice 积木没有选择属性！');
    return '';
  }
  var childArgStr = block.getFieldValue('childArg');
  if (!childArgStr) {
    Blockly.Blocks.rule.errorMsg.push('rule_splice 积木没有选择子属性！');
    return '';
  }
  var object = toJson(objectStr);
  var arg = toJson(argStr);
  var childArg = toJson(childArgStr);
  var childName = Blockly.Drools.upArgFirstName(childArg.name);
  var argName = Blockly.Drools.upArgFirstName(arg.name),
    code = '',
    id = block.num,
    splicename = 'splice_'+id;
  code = code + 'String '+splicename +' = "";\n';
  code = code + 'for (int i=0; i < '+object.text+'.get'+argName+ '().size(); i++) {\n' +
        '    ' + splicename +' += ('+object.text+'.get'+argName+ '().get(i).get'+childName+'()';
  code = code + ' + ((i != ('+object.text+'.get'+argName+ '().size() -1 )) ? "," : ""));\n';
  code = code + '}\n';
  return code;
};

Blockly.Drools['rule_jsonSplice'] = function(block) {
  var name = block.getFieldValue('NAME');
  if (!name) {
    Blockly.Blocks.rule.errorMsg.push('rule_jsonSplice 积木没有选json！');
    return '';
  }
  var key = Blockly.Drools.valueToCode(block, 'KEY', 99);
  if (!key) {
    Blockly.Blocks.rule.errorMsg.push('rule_jsonSplice 积木没有添加子积木！');
    return '';
  }
  var returnName = block.getFieldValue('returnName');
  var code = 'String ' + returnName + ' = "";\n';
  code = code + 'for (int i = 0; i < '+ name +'.size(); i++) {\n';
  code = code + '    JsonNode temp = '+name+'.get(i).get('+key+');\n';
  code = code + '    if (null != temp) {\n';
  code = code + '        '+ returnName +' = '+ returnName +' + temp.asText() + ",";\n';
  code = code + '    }\n';
  code = code + '}\n';
  code = code + 'if (!"".equals('+returnName+')) {\n';
  code = code + '    '+returnName+' = '+returnName+'.substring(0, '+ returnName +'.length()-1);\n';
  code = code + '}\n';
  return code;
};

Blockly.Drools['rule_splitString'] = function(block) {
  var point = block.getFieldValue('point');
  if (!point) {
    Blockly.Blocks.rule.errorMsg.push('rule_splitString 积木没有填写拆分用字符！');
    return '';
  }
  var str = Blockly.Drools.valueToCode(block, 'STR', 99);
  if (!str) {
    Blockly.Blocks.rule.errorMsg.push('rule_splitString 积木没有添加希望拆分字符串的子积木！');
    return '';
  }
  var returnName = block.getFieldValue('returnName');
  var code = 'String[] ' + returnName + ' = (' + str + ').split("' + point + '");\n';
  return code;
};

Blockly.Drools['rule_useArrByIndex'] = function(block) {
  var name = block.getFieldValue('NAME');
  if (!name) {
    Blockly.Blocks.rule.errorMsg.push('rule_useArrByIndex 积木没有选数组！');
    return '';
  }
  var str = Blockly.Drools.valueToCode(block, 'INDEX', 99);
  if (!str) {
    Blockly.Blocks.rule.errorMsg.push('rule_useArrByIndex 积木没有添加下标！');
    return '';
  }
  var code = name + '[' + str + ']';
  return [code,99];
};

Blockly.Drools['rule_return_boolean'] = function(block) {
  var code = '',
    result = block.getFieldValue('RETURN'),
    objType = 'Boolean';
  code = objType + ' bool = '+result+';\n'
        +  'com.paasit.pai.core.drools.DroolsResult droolsResult = new com.paasit.pai.core.drools.DroolsResult();\n droolsResult.setBoolResult(bool);\n droolsResult.setDataFieldSetter("'+Blockly.Drools.getDFTOresult()+'");\n insertLogical(droolsResult);\n';

  var name = 'setBoolResult';
  var queryStr = '';
  var method = {};
  method.name = name;
  method.returnType = 'Boolean';
  // Blockly.Drools.ruleObject.queryMethod.push(method);
  //Blockly.Drools.queryString = Blockly.Drools.queryString + queryStr + '\n';
  Blockly.Drools.setQueryString(method, queryStr);
  return code;
};

Blockly.Drools['rule_return_string'] = function(block) {

  var code = '',
    result = block.getFieldValue('NAME'),
    type = 'String';
  if (result === 'String') {
    Blockly.Blocks.rule.errorMsg.push('rule_return_string 积木没有选择返回的字符串变量！');
    return '';
  }
  code = 'com.paasit.pai.core.drools.DroolsResult droolsResult = new com.paasit.pai.core.drools.DroolsResult();\n droolsResult.setStringResult('+result+');\n droolsResult.setDataFieldSetter("'+Blockly.Drools.getDFTOresult()+'");\n insertLogical(droolsResult);\n';

  var name = 'setStringResult';
  var queryStr = '';
  var method = {};
  method.name = name;
  method.returnType = type;
  // Blockly.Drools.ruleObject.queryMethod.push(method);
  //Blockly.Drools.queryString = Blockly.Drools.queryString + queryStr + '\n';
  Blockly.Drools.setQueryString(method, queryStr);
  return code;
};

Blockly.Drools['rule_return_number'] = function(block) {

  var code = '',
    result = block.getFieldValue('NAME'),
    type = 'BigDecimal';
  if (result === 'Number') {
    Blockly.Blocks.rule.errorMsg.push('rule_return_number 积木没有选择返回的数字变量！');
    return '';
  }
  code = 'BigDecimal bigDecimal = new BigDecimal('+result+');\n' +
        'com.paasit.pai.core.drools.DroolsResult droolsResult = new com.paasit.pai.core.drools.DroolsResult();\n droolsResult.setBigDecimalResult(bigDecimal);\n droolsResult.setDataFieldSetter("'+Blockly.Drools.getDFTOresult()+'");\n insertLogical(droolsResult);\n';

  Blockly.Drools.importString = Blockly.Drools.importString + 'import java.math.BigDecimal;\n';
  var name = 'setBigDecimalResult';
  var queryStr = '';
  var method = {};
  method.name = name;
  method.returnType = type;
  // Blockly.Drools.ruleObject.queryMethod.push(method);
  //Blockly.Drools.queryString = Blockly.Drools.queryString + queryStr + '\n';
  Blockly.Drools.setQueryString(method, queryStr);
  return code;
};

Blockly.Drools['rule_map'] = function(block) {
  var code = '',
    arg = block.getFieldValue('ARG');

  if (!arg) {
    Blockly.Blocks.rule.errorMsg.push('rule_map 积木没有选择属性！');
    return '';
  }
  code = '$map.get("'+arg+'")';
  return [code,99];
};

Blockly.Drools['drools_chooseObj'] = function(block) {
  var objectStr = block.getFieldValue('OBJ'),
    code = '';
  if (!objectStr) {
    Blockly.Blocks.rule.errorMsg.push('drools_chooseObj 积木没有选择值！');
    return '';
  }
  var object = JSON.parse(objectStr);

  if (!object.objName || !object.pointStr) {
    Blockly.Blocks.rule.errorMsg.push('drools_chooseObj 积木中选中的值存在错误！');
    return '';
  }
  var obj = {};
  // restTemplate2.importString = '';
  obj.globalName = '$' + Blockly.Drools.lawArgFirstName(object.objName);
  obj.dataType = Blockly.Drools.upArgFirstName(object.objName);
  if (!Blockly.Drools.droolsData[obj.globalName]) {
    Blockly.Drools.droolsData[obj.globalName] = [];
  }
  if (Blockly.Drools.droolsData[obj.globalName].indexOf(object.pointStr) === -1) {
    Blockly.Drools.droolsData[obj.globalName].push(object.pointStr);
  }
  Blockly.Drools.ruleObject.droolsGlobalVOList.push(obj);
  code = code + obj.globalName + object.getStr;
  if(object.type  && object.getStr){
    code = '$' + object.getStr;
  }
  return [code,99];
};
Blockly.Drools['rule_return_percentage'] = function(block) {
  var code = '';
  var intName = 'approvalSum_' +  block.num;
  var returnName = 'result_' + block.num;
  var arg =  block.getFieldValue('ARG');
  if (!arg) {
    Blockly.Blocks.rule.errorMsg.push('rule_return_percentage 没有输入对应的数值');
    return '';
  }
  code = code + 'int '+intName+' = Integer.valueOf($map.get("approvalCount")==null ? "0" : $map.get("approvalCount").toString()).intValue();\n'
    + ' Integer '+returnName+' = (int) Math.ceil('+intName+' * Double.valueOf('+arg+')/100);\n'
    + ' com.paasit.pai.core.drools.DroolsResult droolsResult = new com.paasit.pai.core.drools.DroolsResult();\n'
    + 'droolsResult.setIntegerResult('+returnName+');\n'
    + 'droolsResult.setDataFieldSetter("");\n'
    + 'insertLogical(droolsResult);\n';

  return code;
};

Blockly.Drools['drools_easyChoose'] = function(block) {
  var objectStr = block.getFieldValue('OBJ'),
    arg = block.getFieldValue('ARG'),
    lang = '',
    result = '',
    code = '';
  if (!objectStr) {
    Blockly.Blocks.rule.errorMsg.push('drools_easyChoose 积木没有选择值！');
    return '';
  }
  if (!arg) {
    Blockly.Blocks.rule.errorMsg.push('drools_easyChoose 积木没有选择属性！');
    return '';
  }
  var object = toJson(objectStr);

  if (block.getInput('Lang')) {
    lang = Blockly.Drools.valueToCode(block, 'Lang', 99);
  }

  if (object.key === 'functionBrowser') {
    // TODO 函数选择
    // 组织关系
  } else if (object.key === 'org') {
    // 组织关系
    for (var i = 0; i < object.value.length; i++) {
      var val = object.value[i].basic || object.value[i];
      result = result + ((val[arg] === null || val[arg] === undefined) ? '' : (lang ? val[arg][lang] : val[arg]));
      if (i !== (object.value.length - 1)) {
        result = result + ',';
      }
    }

    // 岗位
  } else if (object.key === 'station') {
    // 岗位选择
    for (var i = 0; i < object.value.length; i++) {
      var val = object.value[i];
      result = result + ((val[arg] === null || val[arg] === undefined) ? '' : (lang ? val[arg][lang] : val[arg]));
      if (i !== (object.value.length - 1)) {
        result = result + ',';
      }
    }

    // 人员选择
  } else if (object.key === 'emp') {
    // 人员选择
    for (var i = 0; i < object.value.length; i++) {
      var val = object.value[i];
      result = result + ((val[arg] === null || val[arg] === undefined) ? '' : (lang ? val[arg][lang] : val[arg]));
      if (i !== (object.value.length - 1)) {
        result = result + ',';
      }
    }
  }
  result = Blockly.Drools.javaquote_(result);
  code = 'com.paasit.pai.core.drools.DroolsResult droolsResult = new com.paasit.pai.core.drools.DroolsResult();\n droolsResult.setStringResult('+result+');\n droolsResult.setDataFieldSetter("'+Blockly.Drools.getDFTOresult()+'");\n insertLogical(droolsResult);\n';

  var name = 'setStringResult';
  var queryStr = '';
  var method = {};
  method.name = name;
  method.returnType = 'String';
  // Blockly.Drools.ruleObject.queryMethod.push(method);
  //Blockly.Drools.queryString = Blockly.Drools.queryString + queryStr + '\n';
  Blockly.Drools.setQueryString(method, queryStr);
  return code;
};

Blockly.Drools['drools_org'] = function(block) {
  var objectStr = block.getFieldValue('OBJ');
  if (!objectStr) {
    Blockly.Blocks.rule.errorMsg.push('drools_org 积木没有选择值！');
    return '';
  }
  var object = JSON.parse(objectStr);
  var orgRelId = object.orgRelId;
  var stationId = object.stationId;
  var code = 'ObjectQueryReqtM01 objectqueryreqtm01_IN_6 = new ObjectQueryReqtM01();\n' +
    'objectqueryreqtm01_IN_6.setObjectSqlStr("SELECT                 t1.adminEmpIds AS employeeIds             FROM                 orgStationEmp t1             WHERE                 (t1.is_del = 0 OR t1.is_del IS NULL)               AND t1.orgRelId = \''+orgRelId+'\'              AND t1.stationId = \''+stationId+'\'");\n'
    + 'objectqueryreqtm01_IN_6.setRegistryCenterId("38b67c4d-5704-4813-93da-0e1873e91507");\n'+
    ' Map sqlParam6 = new HashMap(); sqlParam6.put("@orgRelId",\''+orgRelId+'\' );\n' + 'sqlParam6.put("@stationId",\''+stationId+'\');\n' +
    ' objectqueryreqtm01_IN_6.setSqlParam(sqlParam6);\n objectqueryreqtm01_IN_6.setExecuteSqlEnable("1");\n' +
    'ObjectQueryRespM01 response_6 = apiClient6.getObjectSqlResult(objectqueryreqtm01_IN_6);\n' +
    'String arg_response_6 = "";\n' +'for (Map map : response_6.getResult()) {\n' +'    if (map.containsKey("employeeIds")) {\n'
    +' arg_response_6 = arg_response_6 + (map.get("employeeIds") == null ?"": map.get("employeeIds").toString()) + ",";\n' +
    '}\n'+'}\n' +'if (!"".equals(arg_response_6)) {\n' +
    'arg_response_6 = arg_response_6.substring(0, arg_response_6.length() - 1);\n' +
    '}\n'+'com.paasit.pai.core.drools.DroolsResult droolsResult = new com.paasit.pai.core.drools.DroolsResult();\n'+
    ' droolsResult.setStringResult(arg_response_6);\n'+
    ' droolsResult.setDataFieldSetter("");\n' +
    'insertLogical(droolsResult);';
  var serviceObject = {};
  serviceObject.api =  '/api/ObjectQuery';
  serviceObject.description = '根据传入sql语句，对sql进行解析，并返回执行结果';
  serviceObject.httpMethod = 'POST';
  serviceObject.serviceName = 'user-service' || 'object';//servie.service;
  serviceObject.returns = 'ObjectQueryRespM01';
  serviceObject.clientName = 'apiClient6';
  serviceObject.args = 'ObjectQueryReqtM01';
  serviceObject.name = 'ObjectQuery';
  serviceObject.resourceName = 'ObjectQuery';
  serviceObject.summary = '根据传入sql语句，对sql进行解析，并返回执行结果' || '';
  Blockly.Drools.dicObjects.mainInfo.push(serviceObject);
  Blockly.Drools.ruleObject.mainInfo.push(serviceObject);
  return code;
};

Blockly.Drools['drools_localChoose'] = function(block) {
  var objectStr = block.getFieldValue('OBJ'),
    arg = block.getFieldValue('ARG'),
    lang = '',
    result = '',
    code = '';
  if (!objectStr) {
    Blockly.Blocks.rule.errorMsg.push('drools_localChoose 积木没有选择值！');
    return '';
  }
  if (!arg) {
    Blockly.Blocks.rule.errorMsg.push('drools_localChoose 积木没有选择属性！');
    return '';
  }
  var object = toJson(objectStr);

  //华润数据结构
  if(object[0]){
    object.key = object[0].selectorType;
  }
  if (block.getInput('Lang')) {
    lang = Blockly.Drools.valueToCode(block, 'Lang', 99);
  }

  if (object.key === 'functionBrowser') {
    // TODO 函数选择
    // 组织关系
  } else if (object.key === 'org') {
    // 组织关系
    for (var i = 0; i < object.value.length; i++) {
      var val = object.value[i].basic || object.value[i];
      result = result + ((val[arg] === null || val[arg] === undefined) ? '' : (lang ? val[arg][lang] : val[arg]));
      if (i !== (object.value.length - 1)) {
        result = result + ',';
      }
    }
    result = Blockly.Drools.javaquote_(result);
    return [result, 99];
    // 岗位
  } else if (object.key === 'station') {
    // 岗位选择
    for (var i = 0; i < object.value.length; i++) {
      var val = object.value[i];
      result = result + ((val[arg] === null || val[arg] === undefined) ? '' : (lang ? val[arg][lang] : val[arg]));
      if (i !== (object.value.length - 1)) {
        result = result + ',';
      }
    }
    result = Blockly.Drools.javaquote_(result);
    return [result, 99];
    // 人员选择
  } else if (object.key === 'emp') {
    // 人员选择
    for (var i = 0; i < object.value.length; i++) {
      var val = object.value[i];
      result = result + ((val[arg] === null || val[arg] === undefined) ? '' : (lang ? val[arg][lang] : val[arg]));
      if (i !== (object.value.length - 1)) {
        result = result + ',';
      }
    }
    result = Blockly.Drools.javaquote_(result);
    return [result, 99];
  } else if (object.key === 'personnel') {
    // 人员选择
    for (var i = 0; i < object.length; i++) {
      var val = object[i];
      result = result + ((val[arg] === null || val[arg] === undefined) ? '' : (lang ? val[arg][lang] : val[arg]));
      if (i !== (object.length - 1)) {
        result = result + ',';
      }
    }
  } else if (object.key === 'organize') {
    // 组织关系
    for (var i = 0; i < object.length; i++) {
      var val = object[i].basic || object[i];
      result = result + ((val[arg] === null || val[arg] === undefined) ? '' : (lang ? val[arg][lang] : val[arg]));
      if (i !== (object.length - 1)) {
        result = result + ',';
      }
    }

    // 岗位
  }
};

Blockly.Drools['drools_formData'] = function(block) {
  var objectStr = block.getFieldValue('OBJ'),
    code = '';
  if (!objectStr) {
    Blockly.Blocks.rule.errorMsg.push('drools_formData 积木没有选择值！');
    return '';
  }
  var object = toJson(objectStr);
  if (!object.data || !object.path) {
    Blockly.Blocks.rule.errorMsg.push('drools_formData 选择的表单数据格式有误！');
    return '';
  }
  if (!Blockly.Drools.droolsData.$formData) {
    Blockly.Drools.droolsData.$formData = [];
  }
  if (Blockly.Drools.droolsData.$formData.indexOf(object.path) === -1) {
    Blockly.Drools.droolsData.$formData.push(object.path);
  }
  code = code + '$formData.get("' + object.path + '")';
  return [code,99];
};

Blockly.Drools['drools_formDataWithType'] = function(block) {
  var objectStr = block.getFieldValue('OBJ'),
    type = block.getFieldValue('TYPE'),
    code = '';
  if (!objectStr) {
    Blockly.Blocks.rule.errorMsg.push('drools_formData 积木没有选择值！');
    return '';
  }
  var object = toJson(objectStr);
  if (!object.data || !object.path) {
    Blockly.Blocks.rule.errorMsg.push('drools_formData 选择的表单数据格式有误！');
    return '';
  }
  if (!Blockly.Drools.droolsData.$formData) {
    Blockly.Drools.droolsData.$formData = [];
  }
  if (Blockly.Drools.droolsData.$formData.indexOf(object.path) === -1) {
    Blockly.Drools.droolsData.$formData.push(object.path);
  }
  code = code + '$formData.get("' + object.path + '")';
  if ('Integer' === type) {
    code = 'Integer.valueOf(' + code + '==null ? "0" : ' + code + '.toString()).intValue()';
  } else if ('String' === type) {
    code = 'String.valueOf(' + code + ')';
  } else if ('Float' === type) {
    code = 'Float.valueOf(' + code + '==null ? "0" : ' + code + '.toString()).floatValue()';
  } else if ('Double' === type) {
    code = 'Double.valueOf(' + code + '==null ? "0" : ' + code + '.toString()).doubleValue()';
  } else {
    Blockly.Blocks.rule.errorMsg.push('drools_formDataWithType 积木选择类型错误！');
    return '';
  }
  return [code,99];
};

Blockly.Drools['rule_returnNumber'] = function(block) {
  var code = '',
    choose = block.getFieldValue('TYPE'),
    type = 'Integer',
    returnName = 'result_' + block.num;

  var next = Blockly.Drools.valueToCode(block, 'NEXT', 99);
  if (!next) {
    Blockly.Blocks.rule.errorMsg.push('rule_returnNumber 积木没有填里面的积木！');
    return '';
  }

  if (choose === '3') {
    var obj = block.getFieldValue('OBJ');
    if (!obj) {
      Blockly.Blocks.rule.errorMsg.push('rule_returnNumber 积木没有填百分比数据！');
      return '';
    }
    code = 'Integer ' + returnName + ' = Math.ceil(Integer.valueOf('+ next +') * Double.valueOf(' + obj + ')/100);\n';
  } else if (choose === '2') {
    code = 'Integer ' + returnName + ' = '+ next +';\n';
  } else {
    code = 'Integer ' + returnName + ' = Integer.valueOf('+ next +');\n';
  }
  code = code +
        'com.paasit.pai.core.drools.DroolsResult droolsResult = new com.paasit.pai.core.drools.DroolsResult();\n droolsResult.setIntegerResult(' + returnName + ');\n droolsResult.setDataFieldSetter("'+Blockly.Drools.getDFTOresult()+'");\n insertLogical(droolsResult);\n';

  var name = 'setIntegerResult';
  var queryStr = '';
  var method = {};
  method.name = name;
  method.returnType = type;
  // Blockly.Drools.ruleObject.queryMethod.push(method);
  //Blockly.Drools.queryString = Blockly.Drools.queryString + queryStr + '\n';
  Blockly.Drools.setQueryString(method, queryStr);
  return code;
};

Blockly.Drools['rule_rest'] = function(block) {
  var servieStr = block.getFieldValue('NAME');
  if (!servieStr) {
    Blockly.Blocks.rule.errorMsg.push('rule_rest 积木没有选择服务！');
    return '';
  }
  var servie = toJson(servieStr);

  var returnName = block.getFieldValue('returnName');
  // api地址
  var api = Blockly.Drools.staticUrl + servie.apiUrl,
    apiName = 'apiClient' + block.num,// client变量名
    objType = '',// requestDto的类型
    rspType = '',// responseDto的类型
    requestStr = '',// 定义requestDto的代码段
    methodStr = '',// 调用方法的代码段
    n = '',// requestDto变量名
    rspname = returnName || block.respName,// responseDto变量名
    methodName = '',// 调用的方法名
    apiDetail = servie.apiDetail,// rest详情
    code = '';

  if (!apiDetail) {
    Blockly.Blocks.rule.errorMsg.push('rule_rest 积木所选服务数据异常！');
    return '';
  }
  // 判断是否是get方法
  if (servie.apiUrl && servie.apiUrl.indexOf('{id}') > -1) {
    var idcode = Blockly.Drools.valueToCode(block, 'ARG0', 99);
    n = idcode;
  }
  /********** requestDto定义与赋值 begin ************/
  // 获取requestDto的类型
  else if  (servie.reqParameters && servie.reqParameters.length > 0) {
    //var random = Math.ceil(Math.random() * 10000);
    var req = servie.reqParameters[0];
    var reqArgs = [];
    for (var key in req) {
      objType = key;
      reqArgs = req[key];
    }
    n = objType.toLocaleLowerCase()+'_IN_'+block.num;
    requestStr = requestStr + objType + ' ' + n + ' = new ' + objType + '();\n';

    if (servie.methodType === '1') {
      var result = '';
      var sqlParams = '';
      // var sqlParam = new Object();
      // var sqlparam='Map<String, Object> sqlParam = new HashMap<String, Object>()';
      if (apiDetail && apiDetail.params && apiDetail.params.objectSqlStr) {
        result = apiDetail.params.objectSqlStr;
      }
      for (var i = 0; i < reqArgs.length; i++) {
        var temp = '';
        if (block.getInput('ARG' + i)) {
          var branch = Blockly.Drools.valueToCode(block, 'ARG' + i, 99);
          if (branch && branch != '') {

            if ('IN' === reqArgs[i].useType) {
              temp = '"+(' + branch + '==null ? "" : ' + branch + '.toString().replace(",", "\',\'"))+"';
            } else {
              temp = '"+' + branch + '+"';
            }
          } else {
            temp = '';
          }
        } else if (reqArgs[i].defaultValue === '') {
          temp = '';
        } else if (reqArgs[i].defaultValue || reqArgs[i].defaultValue === 0 || reqArgs[i].defaultValue === false) {
          if ('string' === typeof reqArgs[i].defaultValue) {
            reqArgs[i].defaultValue = reqArgs[i].defaultValue.startsWith('\'') ? reqArgs[i].defaultValue.substr(1, reqArgs[i].defaultValue.length) : reqArgs[i].defaultValue;
            reqArgs[i].defaultValue = reqArgs[i].defaultValue.endsWith('\'') ? reqArgs[i].defaultValue.substr(0, reqArgs[i].defaultValue.length -1) : reqArgs[i].defaultValue;
          }
          temp = reqArgs[i].defaultValue;
        }
        if (result) {
          if(!temp && reqArgs[i].defaultValue){
            // if(reqArgs[i].defaultValue.indexOf(",")!=-1){
            //   var array = reqArgs[i].defaultValue.split(",");
            //   for (var index = 0; index < array.length; index++) {
            //     var element = array[index];
            //     temp += "'" + element + "'" +",";
            //   }
            //   temp = temp.substring(0,temp.length-1);

            // }
            // else{
            temp = reqArgs[i].defaultValue;
            //}
          }
          result = result.replace('@' + reqArgs[i].name, temp);
          let key='@'+reqArgs[i].name;
          if(!branch && reqArgs[i].defaultValue){
            branch = '"'+reqArgs[i].defaultValue+'"';
          }
          if ('IN' === reqArgs[i].useType) {
            branch = branch.toString().replace(',', '\',\'');
          }
          sqlParams +='sqlParam'+block.num+'.put("'+key+'", '+branch+');\n';
        }
      }
      // requestStr = requestStr + n + '.setObjectSqlStr("' + result + '");\n';

      // var paramtxt= JSON.stringify(sqlParam);
      // var uuid=generateUuid();
      requestStr = requestStr + n + '.setRegistryCenterId("' + servie.id + '");\n Map<String, Object> sqlParam'+block.num+' = new HashMap<String, Object>(); '+sqlParams+' ';
      requestStr = requestStr + n + '.setSqlParam(sqlParam'+block.num+');\n';

    } else {
      for (var i = 0; i < reqArgs.length; i++) {
        if (reqArgs[i].isHidden) {
          if (reqArgs[i].defaultValue === '') {
            requestStr = requestStr + n + '.set' + Blockly.Drools.upArgFirstName(reqArgs[i].name) + '("");\n';
          } else if (reqArgs[i].defaultValue || reqArgs[i].defaultValue === 0 || reqArgs[i].defaultValue === false) {
            if (reqArgs[i].type && reqArgs[i].type.toLowerCase() === 'string') {
              requestStr = requestStr + n + '.set' + Blockly.Drools.upArgFirstName(reqArgs[i].name) + '("' + reqArgs[i].defaultValue + '");\n';
            } else {
              requestStr = requestStr + n + '.set' + Blockly.Drools.upArgFirstName(reqArgs[i].name) + '(' + reqArgs[i].defaultValue + ');\n';
            }
          }
          continue;
        }
        if (block.getInput('ARG' + i)) {
          var branch = Blockly.Drools.valueToCode(block, 'ARG' + i, 99);
          if (branch && branch != '') {
            requestStr = requestStr + n + '.set' + Blockly.Drools.upArgFirstName(reqArgs[i].name) + '(' + branch + ');\n';
          } else {
            if (reqArgs[i].defaultValue === '') {
              requestStr = requestStr + n + '.set' + Blockly.Drools.upArgFirstName(reqArgs[i].name) + '("");\n';
            } else if (reqArgs[i].defaultValue || reqArgs[i].defaultValue === 0 || reqArgs[i].defaultValue === false) {
              if (reqArgs[i].type && reqArgs[i].type.toLowerCase() === 'string') {
                requestStr = requestStr + n + '.set' + Blockly.Drools.upArgFirstName(reqArgs[i].name) + '("' + reqArgs[i].defaultValue + '");\n';
              } else {
                requestStr = requestStr + n + '.set' + Blockly.Drools.upArgFirstName(reqArgs[i].name) + '(' + reqArgs[i].defaultValue + ');\n';
              }
            }
          }
        }

      }
    }
  }
  //处理rest调用 改成RestTemplate 2020年4月2日16:36:11

  var params = '';
  var getParams = [];
  if(servie.methodType === '0'){
    var httpMethod = servie.apiDetail.httpMethod;
    var req = servie.reqParameters[0];
    var reqArgs = [];
    var isDefault = false;
    for (var key in req) {
      reqArgs = req[key];
    }
    for (var i = 0; i < reqArgs.length; i++) {
      if (block.getInput('ARG' + i)) {
        var branch = Blockly.Drools.valueToCode(block, 'ARG' + i, 99);
        isDefault = false;
        //如果包含" 是字符串， 否则是数字
        // if(branch.indexOf('"') != -1){
        //   branch =branch.replace(/"/g,"");
        // }
        // else{
        //   branch =Number(branch);
        // }
        if(!branch){
          isDefault = true;
          branch = reqArgs[i].defaultValue;
        }
        if(httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'DELETE'){
          var jsonText = mergeJson(reqArgs[i].name,branch);
          params = params + jsonText;
        }
        else if(httpMethod === 'GET'){
          // branch = branch.replace(/"/g,"");
          getParams.push(reqArgs[i].name + '=' + branch.replace(/"/g,''));
        }
      }else{
        if(reqArgs[i].defaultValue){
          if(httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'DELETE'){
            //params[reqArgs[i].name] = reqArgs[i].defaultValue;
            var jsonText = mergeJson(reqArgs[i].name,reqArgs[i].defaultValue);
            params = params + jsonText;
          }else if(httpMethod === 'GET'){
            getParams.push(reqArgs[i].name + '=' + reqArgs[i].defaultValue);
          }
        }
      }
    }
    if(httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'DELETE'){
      if(params){
        // params = JSON.stringify(params);
        // params =  toStr(toJson(params)).replace(/"/g,'\\"').replace(/`/g, '"').replace(/`/g, '"');
      //用于是拼接的json  需要截取最后一位,
        params = params.substring(0,params.length -1 );
        params = '{' + params +'}';
      } else{
        params='{}';
      }
    }
    else if(httpMethod === 'GET'){
      if(getParams.length > 0){
        params = getParams.join('&');
        //'?' +
      }
      else{
        params='';
      }
    }
  }
  /********* requestDto定义与赋值 end *************/

  /*********方法调用片段 begin *************/
  // 获取responseDto的类型
  if (servie.rspParameters && servie.rspParameters.length > 0) {
    var rsp = servie.rspParameters[0];
    for (var key in rsp) {
      rspType = key;
    }
  }
  methodName = apiDetail.methodName;
  if (rspType) {
    if(servie.methodType === '0'){
      var url= servie.service+servie.apiUrl;
      var apiType = 1;
      var getdata = '';
      if(url.indexOf('{id}') != -1){
        //  var data = params.replace('id=','');
        var data = branch;
        //字符串
        var start = data.substr(0,1);
        var end = data.substr(data.length-1,1);
        if(start.indexOf('"') != -1 && end.indexOf('"') != -1 ){
          data = data.replace(/"/g,'');
          url = '/'+ url.replace('/{id}','/'+data);
        }
        //数字
        else if(isNumber(data)){
          url = '/'+ url.replace('/{id}','/'+data);
        }
        //java代码
        else{
        //默认值的情况 也是字符串处理
          if (isDefault) {
            url = '/'+ url.replace('/{id}','/'+data);
          }
          else{
            url = '/'+ url.replace('/{id}','');
            getdata = data;
          }
        }
      }
      if(servie.apiDetail.httpMethod === 'POST'){
        apiType = 1;
      }
      else if(servie.apiDetail.httpMethod === 'GET'){
        apiType = 0;
      }
      else if(servie.apiDetail.httpMethod === 'PUT'){
        apiType = 2;
      }
      else if(servie.apiDetail.httpMethod === 'DELETE'){
        apiType = 3;
      }
      if (getdata) {
        getdata = '+' + getdata;
        methodStr = methodStr + 'JsonNode' + ' ' + rspname + ' = ' +'$restTemplateTokenBLogic.executeCode($gatewayUrl + "'+url+'/" '+getdata+',"'+params+'",'+apiType+',$token);';
      } else {
        methodStr = methodStr + 'JsonNode' + ' ' + rspname + ' = ' +'$restTemplateTokenBLogic.executeCode($gatewayUrl + "'+url+'","'+params+'",'+apiType+',$token);';
      }
    } else{
      methodStr = methodStr + rspType + ' ' + rspname + ' =  '+ apiName + '.' + methodName + '(' + n + ');\n';
    }
    // if (servie.apiUrl && servie.apiUrl.indexOf('{id}') > -1) {
    //   methodStr = methodStr + 'if (null == ' + rspname + '){\n';
    //   methodStr = methodStr + '    ' + rspname + ' = new ' + rspType + '();\n';
    //   methodStr = methodStr + '}\n';
    // }
  } else {
    methodStr = methodStr + apiName + '.' + methodName + '(' + n + ');\n';
  }
  /********* 方法调用片段 end *************/

  var serviceObject = {};
  serviceObject.api =  servie.apiUrl;
  serviceObject.description = apiDetail.description;
  serviceObject.httpMethod = apiDetail.httpMethod;
  serviceObject.serviceName = servie.service || 'object';//servie.service;
  serviceObject.returns = rspType;
  serviceObject.clientName =apiName;
  // apiName;
  serviceObject.args = objType;
  serviceObject.name = apiDetail.objectName;
  serviceObject.resourceName = apiDetail.objectName;
  serviceObject.summary = apiDetail.description || '';
  if(servie.methodType === '0'){
    code = code + methodStr;
  } else{
    code = code + requestStr + methodStr;
    Blockly.Drools.dicObjects.mainInfo.push(serviceObject);
    Blockly.Drools.ruleObject.mainInfo.push(serviceObject);
  }
  code = code + '\n${'+rspname+'}\n';
  Blockly.Drools.sign_return.push(rspname);
  return code;
};
Blockly.Drools['rule_restAuth'] = function(block) {
  var servieStr = block.getFieldValue('NAME');
  if (!servieStr) {
    Blockly.Blocks.rule.errorMsg.push('rule_rest 积木没有选择服务！');
    return '';
  }
  var rulename = block.getFieldValue('returnName');
  var servie = toJson(servieStr);
  //var params = block.getFieldValue('PARAMS');
  var httpMethod = servie.apiDetail.requestMethodType;
  var req = servie.reqParameters[0];
  var reqArgs = [];
  var params = '';
  var getParams = [];
  for (var key in req) {
    reqArgs = req[key];
  }
  for (var i = 0; i < reqArgs.length; i++) {
    if (block.getInput('ARG' + i)) {
      var branch = Blockly.Drools.valueToCode(block, 'ARG' + i, 99);
      //  branch = branch.replace(/"/g,"");
      if(!branch){
        branch = reqArgs[i].defaultValue;
      }
      if(httpMethod === 'post'){
        var jsonText = mergeJson(reqArgs[i].name,branch);
        params = params + jsonText;
        //params[reqArgs[i].name] = branch;
      }
      else if(httpMethod === 'get'){
        branch = branch.replace(/"/g,'');
        getParams.push(reqArgs[i].name + '=' + branch);
      }
      else{
        var jsonText = mergeJson(reqArgs[i].name,branch);
        params = params + jsonText;
      }
    }else{
      if(reqArgs[i].defaultValue){
        if(httpMethod === 'post'){
          //params[reqArgs[i].name] = reqArgs[i].defaultValue;
          var jsonText = mergeJson(reqArgs[i].name,reqArgs[i].defaultValue);
          params = params + jsonText;
        }else if(httpMethod === 'get'){
          getParams.push(reqArgs[i].name + '=' + reqArgs[i].defaultValue);
        }
      }
    }
  }
  if(httpMethod === 'post'){
    if(params){
      //用于是拼接的json  需要截取最后一位,
      params = params.substring(0,params.length -1 );
      params = '{' + params +'}';
    }
    else{
      params='{}';
    }
  }
  else if(httpMethod === 'get'){
    if(getParams.length > 0){
      params = getParams.join('&');
    }
    else{
      params='';
    }
  }
  else{
    if(params){
      // params = JSON.stringify(params);
      // params =  toStr(toJson(params)).replace(/"/g,'\\"').replace(/`/g, '"').replace(/`/g, '"');
      params = params.substring(0,params.length -1 );
      params = '{' + params +'}';
    }
    else{
      params='{}';
    }
  }
  var code = 'ExternalInterfaceInvokeBLogic $test = SpringContextUtil.getBeanByType("ExternalInterfaceInvokeBLogic");\n'
  + '  ExternalInterfaceInvokeReqtM01 param = new ExternalInterfaceInvokeReqtM01();\n'
  + 'param.setMethodNo('+'"'+servie.methodNo+'"'+');\n param.setParam('+'"'+params+'"'+');\n'
  + 'ExternalInterfaceInvokeRespM01 '+rulename+' = $test.execute(param);\n';
  //Blockly.Drools.sign_return.push(rspname);
  return code;
};

Blockly.Drools['rule_byLanguage'] = function(block) {
  var type = block.getFieldValue('TYPE');
  if (!type) {
    Blockly.Blocks.rule.errorMsg.push('rule_byLanguage 积木没有选语言类型！');
    return '';
  }
  return [type, 99];
};

Blockly.Drools['rule_typeChange'] = function(block) {
  var type = block.getFieldValue('TYPE');
  var formatStr = block.getFieldValue('OBJ');
  if (!formatStr) {
    formatStr = 'yyyy-MM-dd HH:mm:ss';
  }
  if (!type) {
    Blockly.Blocks.rule.errorMsg.push('rule_typeChange 积木没有类型！');
    return '';
  }
  var branch = Blockly.Drools.valueToCode(block, 'IN', 99),
    code = '';
  if (!branch) {
    Blockly.Blocks.rule.errorMsg.push('rule_typeChange 积木没有增加后续积木！');
    return '';
  }
  if ('Integer' === type) {
    code = 'Integer.valueOf(' + branch + '==null ? "0" : ' + branch + '.toString()).intValue()';
  } else if ('String' === type) {
    code = 'String.valueOf(' + branch + ')';
  } else if ('Float' === type) {
    code = 'Float.valueOf(' + branch + '==null ? "0" : ' + branch + '.toString()).floatValue()';
  } else if ('Double' === type) {
    code = 'Double.valueOf(' + branch + '==null ? "0" : ' + branch + '.toString()).doubleValue()';
  } else if ('BigDecimal' === type) {
    code = 'new BigDecimal(' + branch + ')';
  } else if ('DateTime' === type) {
    code = '(new SimpleDateFormat("' + formatStr + '")).parse(' + branch + ')';
  } else {
    Blockly.Blocks.rule.errorMsg.push('rule_typeChange 积木选择类型错误！');
    return '';
  }
  return [code, 0];
};

Blockly.Drools['rule_getByLang'] = function(block) {
  var type = block.getFieldValue('TYPE');
  if (!type) {
    Blockly.Blocks.rule.errorMsg.push('rule_getByLang 积木没有类型！');
    return '';
  }
  var branch = Blockly.Drools.valueToCode(block, 'IN', 99),
    code = '';
  if (!branch) {
    Blockly.Blocks.rule.errorMsg.push('rule_getByLang 积木没有增加后续积木！');
    return '';
  }
  code = branch + '.get("' + type + '").asText()';
  return [code, 0];
};

Blockly.Drools['rule_baseItem'] = function(block) {
  var type = block.getFieldValue('TYPE');
  if (!type) {
    Blockly.Blocks.rule.errorMsg.push('rule_baseItem 积木没有类型！');
    return '';
  }
  var name = block.getFieldValue('NAME');
  if (!name) {
    Blockly.Blocks.rule.errorMsg.push('rule_baseItem 积木没有定义变量名！');
    return '';
  }
  var branch = Blockly.Drools.valueToCode(block, 'IN', 99),
    code = '';
  if (!branch) {
    Blockly.Blocks.rule.errorMsg.push('rule_baseItem 积木没有增加后续积木！');
    return '';
  }
  code = type + ' ' + name + ' = ' + branch + ';\n';
  return code;
};

Blockly.Drools['rule_doOutRest'] = function(block) {

  var baseurl =  block.getFieldValue('BASEURL');
  if (!baseurl) {
    // Blockly.Blocks.rule.errorMsg.push('rule_doOutRest 请求外部接口baseurl为空！');
    // return '';
  }
  var url = block.getFieldValue('URL');
  if (!url) {
    // Blockly.Blocks.rule.errorMsg.push('rule_doOutRest 请求外部接口URL为空！');
    // return '';
  }
  var methodType = block.getFieldValue('METHODTYPE');
  if (!methodType) {
    Blockly.Blocks.rule.errorMsg.push('rule_doOutRest 请求方式为空！');
    return '';
  }
  var params = block.getFieldValue('PARAMS');
  if (!params) {
    Blockly.Blocks.rule.errorMsg.push('rule_doOutRest 请求外部接口参数为空！');
    return '';
  }
  params = toStr(toJson(params)).replace(/"/g,'\\"').replace(/`/g, '"').replace(/`/g, '"');
  var returnName = block.getFieldValue('returnName');
  if (!returnName) {
    Blockly.Blocks.rule.errorMsg.push('rule_doOutRest 请求返回参数变量名不存在！');
    return '';
  }
  var code = Blockly.Drools.log(Blockly.Drools.ruleObject.name,'rule_doOutRest', '请求外部接口:' + url + ',' +
    '请求方法是:' + (methodType === '0' ? 'GET':'POST') + ', 参数是:' + params + ', token是:" + $token + "');
  code = code + 'JsonNode ' + returnName + ' = $restTemplateTokenBLogic.executeCode("' +baseurl+url + '","' + params + '", ' + methodType + ', $token);\n';
  code = code + Blockly.Drools.log(Blockly.Drools.ruleObject.name,'rule_doOutRest', '请求外部接口结果是:" + ' + returnName + '.toString() + "');
  return code;
};

Blockly.Drools['rule_getArgOfJson'] = function(block) {
  var name = block.getFieldValue('NAME'),
    type = block.getFieldValue('TYPE'),
    key = block.getFieldValue('KEY'),
    code = '';
  if (!name) {
    Blockly.Blocks.rule.errorMsg.push('rule_getArgOfJson 积木没有选择json！');
    return '';
  }
  if (!key) {
    Blockly.Blocks.rule.errorMsg.push('rule_getArgOfJson 积木没有填json的Key！');
    return '';
  }
  code = code + name + '.get("' + key + '")';
  if ('Integer' === type) {
    code = 'Integer.valueOf(' + code + '==null ? "0" : ' + code + '.toString()).intValue()';
  } else if ('String' === type) {
    code = 'String.valueOf(' + code + ').replace("\\\\\\"","").replace("\\\\\\\\\\n","").replace("\\"","")';
  } else if ('Float' === type) {
    code = 'Float.valueOf(' + code + '==null ? "0" : ' + code + '.toString()).floatValue()';
  } else if ('Double' === type) {
    code = 'Double.valueOf(' + code + '==null ? "0" : ' + code + '.toString()).doubleValue()';
  } else {
    Blockly.Blocks.rule.errorMsg.push('rule_getArgOfJson 积木选择类型错误！');
    return '';
  }
  return [code,99];
};

Blockly.Drools['rule_jsonGet'] = function(block) {
  var name = block.getFieldValue('NAME'),
    method = block.getFieldValue('METHOD'),
    code = '';
  if (!name) {
    Blockly.Blocks.rule.errorMsg.push('rule_jsonGet 积木没有选择json！');
    return '';
  }
  if (!method) {
    Blockly.Blocks.rule.errorMsg.push('rule_jsonGet 积木没有选择方法！');
    return '';
  }
  var key = Blockly.Drools.valueToCode(block, 'INDEX', 99);
  if (!key) {
    Blockly.Blocks.rule.errorMsg.push('rule_jsonGet 积木没有填json的Key！');
    return '';
  }
  code = code + name + method + '(' + key + ')';
  return [code,99];
};

Blockly.Drools['rule_jsonMethod'] = function(block) {
  var name = block.getFieldValue('NAME'),
    method = block.getFieldValue('METHOD'),
    code = '';
  if (!name) {
    Blockly.Blocks.rule.errorMsg.push('rule_jsonMethod 积木没有选择json！');
    return '';
  }
  if (!method) {
    Blockly.Blocks.rule.errorMsg.push('rule_jsonMethod 积木没有选方法！');
    return '';
  }
  var add = '';
  if ('.toString()' === method) {
    add = '.replace("\\"","\\\\\\"")';
  }
  code = name + method + add;
  return [code,99];
};

Blockly.Drools['rule_getFormJson'] = function(block) {
  var obj = block.getFieldValue('OBJ'),
    code = '';
  if (!obj) {
    Blockly.Blocks.rule.errorMsg.push('rule_getFormJson 积木没有选择key！');
    return '';
  }
  var object = toJson(obj);
  code = 'com.paasit.pai.core.util.DTOUtils.getFormDataByKey($formData, "' + object.path +'")';
  return [code,99];
};

Blockly.Drools['rule_useBaseItem'] = function(block) {
  var type = block.getFieldValue('NAME');
  if (!type) {
    Blockly.Blocks.rule.errorMsg.push('rule_useBaseItem 积木没有选择变量！');
    return '';
  }
  return [type, 0];
};

Blockly.Drools['rule_setItemVal'] = function(block) {
  var name = block.getFieldValue('NAME');
  if (!name) {
    Blockly.Blocks.rule.errorMsg.push('rule_setItemVal 积木没有选择变量名！');
    return '';
  }
  var branch = Blockly.Drools.valueToCode(block, 'IN', 99),
    code = '';
  if (!branch) {
    Blockly.Blocks.rule.errorMsg.push('rule_setItemVal 积木没有增加后续积木！');
    return '';
  }
  code = name + ' = ' + branch + ';\n';
  return code;
};

Blockly.Drools['rule_getdatafield'] = function(block) {
  var code = '';
  var type = block.getFieldValue('ARG');
  if (!type) {
    Blockly.Blocks.rule.errorMsg.push('rule_getdatafield 积木没有选择作用域！');
    return '';
  }
  var name = block.getFieldValue('VALUE');
  if (!name) {
    Blockly.Blocks.rule.errorMsg.push('rule_getdatafield 积木没有选择dataField！');
    return '';
  }
  if (!Blockly.Drools.droolsData['$datafield']) {
    Blockly.Drools.droolsData['$datafield'] = [];
  }
  if (Blockly.Drools.droolsData['$datafield'].indexOf(type + '.' +name) === -1) {
    Blockly.Drools.droolsData['$datafield'].push(type + '.' +name);
  }
  code = code + '((HashMap<String, Object>)$datafield.get("'+type+'")).get("'+name+'")';
  return [code,99];
};

Blockly.Drools['rule_setdatafield'] = function(block) {
  var code = '';
  var type = block.getFieldValue('ARG');
  if (!type) {
    Blockly.Blocks.rule.errorMsg.push('rule_setdatafield 积木没有选择作用域！');
    return '';
  }
  var name = block.getFieldValue('VALUE');
  if (!name) {
    Blockly.Blocks.rule.errorMsg.push('rule_setdatafield 积木没有选择dataField！');
    return '';
  }

  var next = Blockly.Drools.valueToCode(block, 'NEXT', 99);
  if (!next) {
    Blockly.Blocks.rule.errorMsg.push('rule_setdatafield 积木没有给dataField赋值！');
    return '';
  }
  code = code + 'String '+type + '_' + name.replace(' ', '_') + ' = '+next+';\n';
  var obj = {};
  obj.association = type;
  obj.dataName = name;
  obj.dataValue = type + '_' + name;
  Blockly.Drools.setDataFields.push(obj);
  return code;
};

Blockly.Drools['rule_math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    ADD: [' + ', Blockly.JavaScript.ORDER_ADDITION],
    MINUS: [' - ', Blockly.JavaScript.ORDER_SUBTRACTION],
    MULTIPLY: [' * ', Blockly.JavaScript.ORDER_MULTIPLICATION],
    DIVIDE: [' / ', Blockly.JavaScript.ORDER_DIVISION],
    POWER: [null, Blockly.JavaScript.ORDER_COMMA]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Drools.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Drools.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in JavaScript requires a special case since it has no operator.
  if (!operator) {
    code = 'Math.pow(' + argument0 + ', ' + argument1 + ')';
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.Drools['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var index = 1;
  var paramcode = '';
  var b = true;
  while (b){
    var fuhao = block.getFieldValue('OP'+index);
    var operator = (fuhao == 'AND') ? '&&' : '||';
    var order = (operator == '&&') ? Blockly.Drools.ORDER_LOGICAL_AND :
      Blockly.Drools.ORDER_LOGICAL_OR;
    if (index === 1) {
      var argument = Blockly.Drools.valueToCode(block, 'IN0', order);
      if (!argument) {
        // If there are no arguments, then the return value is false.
        argument = 'false';
      }
      paramcode = argument;
    }
    paramcode = paramcode+ ' ' + operator;
    var right = Blockly.Drools.valueToCode(block, 'IN'+index, order);
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

//判断字符串 是否为数据
function isNumber(val) {
  var regPos = /^\d+(\.\d+)?$/; //非负浮点数
  var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
  if(regPos.test(val) || regNeg.test(val)) {
    return true;
  } else {
    return false;
  }
}
//给字符串加转义符
function escapeStr(val){
  if(val.indexOf('"') == -1){
    val = '"' + val + '"';
  }
  if(val){
    return val.replace(/"/g,'\\"').replace(/`/g, '"').replace(/`/g, '"');
  }
  else{
    return '';
  }
}
//拼接json
function mergeJson(key,value){
  if(key && value){
    //字符串
    var start = value.substr(0,1);
    var end = value.substr(value.length-1,1);
    if(start.indexOf('"') != -1 && end.indexOf('"') != -1 ){
      return escapeStr(key) + ':' + escapeStr(value) + ',';
    }
    //数字
    else if(isNumber(value)){
      //ranch = branch.replace(/"/g,"");
      return  escapeStr(key) + ':' + value + ',';
    }
    //java代码
    else{
      return escapeStr(key) + ':' + '\\""' + '+' + value + '+' + '"\\"' + ',';
    }
  }
  else{
    return '';
  }
}

// TODO 发送邮件的积木
// TODO 其他基本类型的变量
// TODO jsonNode类型的变量
// TODO 更方便的请求第三方接口的积木
// TODO 根据变量类型选变量方法
