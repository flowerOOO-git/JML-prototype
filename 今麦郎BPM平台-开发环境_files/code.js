/**
 * Blockly Demos: Code
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for Blockly's Code demo.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Create a namespace for the application.
 */
var Code = {};

/**
 * Lookup for names of supported languages.  Keys should be in ISO 639 format.
 */
Code.LANGUAGE_NAME = {
  'ar': 'العربية',
  'be-tarask': 'Taraškievica',
  'br': 'Brezhoneg',
  'ca': 'Català',
  'cs': 'Česky',
  'da': 'Dansk',
  'de': 'Deutsch',
  'el': 'Ελληνικά',
  'en': 'English',
  'es': 'Español',
  'et': 'Eesti',
  'fa': 'فارسی',
  'fr': 'Français',
  'he': 'עברית',
  'hrx': 'Hunsrik',
  'hu': 'Magyar',
  'ia': 'Interlingua',
  'is': 'Íslenska',
  'it': 'Italiano',
  'ja': '日本語',
  'kab': 'Kabyle',
  'ko': '한국어',
  'mk': 'Македонски',
  'ms': 'Bahasa Melayu',
  'nb': 'Norsk Bokmål',
  'nl': 'Nederlands, Vlaams',
  'oc': 'Lenga d\'òc',
  'pl': 'Polski',
  'pms': 'Piemontèis',
  'pt-br': 'Português Brasileiro',
  'ro': 'Română',
  'ru': 'Русский',
  'sc': 'Sardu',
  'sk': 'Slovenčina',
  'sr': 'Српски',
  'sv': 'Svenska',
  'ta': 'தமிழ்',
  'th': 'ภาษาไทย',
  'tlh': 'tlhIngan Hol',
  'tr': 'Türkçe',
  'uk': 'Українська',
  'vi': 'Tiếng Việt',
  'zh-hans': '简体中文',
  'zh-hant': '正體中文'
};

/**
 * List of RTL languages.
 */
Code.LANGUAGE_RTL = ['ar', 'fa', 'he', 'lki'];

/**
 * Blockly's main workspace.
 * @type {Blockly.WorkspaceSvg}
 */
Code.workspace = null;

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if parameter not found.
 * @return {string} The parameter value or the default value if not found.
 */
Code.getStringParamFromUrl = function(name, defaultValue) {
  // update by dlm 20211216
  var langType = Code.getLangType();
  if (!langType) {
    return 'zh-hans';
  } else if (langType === 'en') {
    return 'en';
  } else {
    return 'zh-hans';
  }
  // var val = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  // return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

Code.getLangType = function() {
  var langType = localStorage.getItem('PAI-language')
    ? localStorage.getItem('PAI-language')
    : localStorage.getItem('lang');
  if (!langType) {
    return 'zh_CN';
  }
  return langType;
};

/**
 * Get the language of this user from the URL.
 * @return {string} User's language.
 */
Code.getLang = function() {
  var lang = Code.getStringParamFromUrl('lang', '');
  if (Code.LANGUAGE_NAME[lang] === undefined) {
    // Default to English.
    lang = 'en';
  }
  return lang;
};

/**
 * Is the current language (Code.LANG) an RTL language?
 * @return {boolean} True if RTL, false if LTR.
 */
Code.isRtl = function() {
  return Code.LANGUAGE_RTL.indexOf(Code.LANG) != -1;
};

/**
 * Load blocks saved on App Engine Storage or in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
Code.loadBlocks = function(defaultXml) {
  try {
    var loadOnce = window.sessionStorage.loadOnceBlocks;
  } catch(e) {
    // Firefox sometimes throws a SecurityError when accessing sessionStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
    var loadOnce = null;
  }
  if ('BlocklyStorage' in window && window.location.hash.length > 1) {
    // An href with #key trigers an AJAX call to retrieve saved blocks.
    BlocklyStorage.retrieveXml(window.location.hash.substring(1));
  } else if (loadOnce) {
    // Language switching stores the blocks during the reload.
    delete window.sessionStorage.loadOnceBlocks;
    var xml = Blockly.Xml.textToDom(loadOnce);
    Blockly.Xml.domToWorkspace(xml, Code.workspace);
  } else if (defaultXml) {
    // Load the editor with default starting blocks.
    var xml = Blockly.Xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(xml, Code.workspace);
  } else if ('BlocklyStorage' in window) {
    // Restore saved blocks in a separate thread so that subsequent
    // initialization is not affected from a failed load.
    window.setTimeout(BlocklyStorage.restoreBlocks, 0);
  }
};

/**
 * Save the blocks and reload with a different language.
 */
Code.changeLanguage = function() {
  // Store the blocks for the duration of the reload.
  // MSIE 11 does not support sessionStorage on file:// URLs.
  if (window.sessionStorage) {
    var xml = Blockly.Xml.workspaceToDom(Code.workspace);
    var text = Blockly.Xml.domToText(xml);
    window.sessionStorage.loadOnceBlocks = text;
  }

  var languageMenu = document.getElementById('languageMenu');
  var newLang = encodeURIComponent(
    languageMenu.options[languageMenu.selectedIndex].value);
  var search = window.location.search;
  if (search.length <= 1) {
    search = '?lang=' + newLang;
  } else if (search.match(/[?&]lang=[^&]*/)) {
    search = search.replace(/([?&]lang=)[^&]*/, '$1' + newLang);
  } else {
    search = search.replace(/\?/, '?lang=' + newLang + '&');
  }

  window.location = window.location.protocol + '//' +
      window.location.host + window.location.pathname + search;
};

/**
 * Bind a function to a button's click event.
 * On touch enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!Function} func Event handler to bind.
 */
Code.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};

/**
 * Load the Prettify CSS and JavaScript.
 */
Code.importPrettify = function() {
  // var script = document.createElement('script');
  // script.setAttribute('src', 'https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js');
  // document.head.appendChild(script);
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', '/static/blockly/prettify.css');
  document.head.appendChild(link);
  var script = document.createElement('script');
  script.setAttribute('src', '/static/blockly/prettify.js');
  document.head.appendChild(script);
};

/**
 * Compute the absolute coordinates and dimensions of an HTML element.
 * @param {!Element} element Element to match.
 * @return {!Object} Contains height, width, x, and y properties.
 * @private
 */
Code.getBBox_ = function(element) {
  var height = element.offsetHeight;
  var width = element.offsetWidth;
  var x = 0;
  var y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  return {
    height: height < 600 ? 600 : height,
    width: width,
    x: x,
    y: y
  };
};

/**
 * User's language (e.g. "en").
 * @type {string}
 */
Code.LANG = Code.getLang();
Code.LANGTYPE = Code.getLangType();

/**
 * List of tab names.
 * @private
 */
Code.TABS_ = ['blocks', 'Drools', 'xml'];

Code.selected = 'blocks';

/**
 * Switch the visible pane when a tab is clicked.
 * @param {string} clickedName Name of tab clicked.
 */
Code.tabClick = function(clickedName) {
  // If the XML tab was open, save and render the content.
  if (document.getElementById('tab_xml').className == 'tabon') {
    var xmlTextarea = document.getElementById('content_xml');
    var xmlText = xmlTextarea.value;
    var xmlDom = null;
    try {
      xmlDom = Blockly.Xml.textToDom(xmlText);
    } catch (e) {
      var q =
          window.confirm(MSG['badXml'].replace('%1', e));
      if (!q) {
        // Leave the user on the XML tab.
        return;
      }
    }
    if (xmlDom) {
      Code.workspace.clear();
      Blockly.Xml.domToWorkspace(xmlDom, Code.workspace);
    }
  }

  if (document.getElementById('tab_blocks').className == 'tabon') {
    Code.workspace.setVisible(false);
  }
  // Deselect all tabs and hide all panes.
  for (var i = 0; i < Code.TABS_.length; i++) {
    var name = Code.TABS_[i];
    document.getElementById('tab_' + name).className = 'taboff';
    document.getElementById('content_' + name).style.visibility = 'hidden';
  }

  // Select the active tab.
  Code.selected = clickedName;
  document.getElementById('tab_' + clickedName).className = 'tabon';
  // Show the selected pane.
  document.getElementById('content_' + clickedName).style.visibility =
      'visible';
  Code.renderContent();
  if (clickedName == 'blocks') {
    Code.workspace.setVisible(true);
  }
  Blockly.svgResize(Code.workspace);
};

/**
 * Populate the currently selected pane with content generated from the blocks.
 */
Code.renderContent = function() {
  var content = document.getElementById('content_' + Code.selected);
  // Initialize the pane.
  if (content.id == 'content_xml') {
    var xmlTextarea = document.getElementById('content_xml');
    var xmlDom = Blockly.Xml.workspaceToDom(Code.workspace);
    var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
    xmlTextarea.value = xmlText;
    xmlTextarea.focus();
  } else if (content.id == 'content_Drools') {
    Code.attemptCodeGeneration(Blockly.Drools, 'js');
  } else if (content.id == 'content_python') {
    Code.attemptCodeGeneration(Blockly.Python, 'py');
  } else if (content.id == 'content_php') {
    Code.attemptCodeGeneration(Blockly.PHP, 'php');
  } else if (content.id == 'content_dart') {
    Code.attemptCodeGeneration(Blockly.Dart, 'dart');
  } else if (content.id == 'content_lua') {
    Code.attemptCodeGeneration(Blockly.Lua, 'lua');
  }
};

/**
 * Attempt to generate the code and display it in the UI, pretty printed.
 * @param generator {!Blockly.Generator} The generator to use.
 * @param prettyPrintType {string} The file type key for the pretty printer.
 */
Code.attemptCodeGeneration = function(generator, prettyPrintType) {
  var content = document.getElementById('content_' + Code.selected);
  content.textContent = '';
  if (Code.checkAllGeneratorFunctionsDefined(generator)) {
    // var code = generator.workspaceToCode(Code.workspace);
    var code = Blockly.vue_.getBlocklyCode();
    content.textContent = code;
    if (typeof PR.prettyPrintOne == 'function') {
      code = content.textContent;
      code = PR.prettyPrintOne(code, prettyPrintType);
      content.innerHTML = code;
    }
  }
};

/**
 * Check whether all blocks in use have generator functions.
 * @param generator {!Blockly.Generator} The generator to use.
 */
Code.checkAllGeneratorFunctionsDefined = function(generator) {
  var blocks = Code.workspace.getAllBlocks();
  var missingBlockGenerators = [];
  for (var i = 0; i < blocks.length; i++) {
    var blockType = blocks[i].type;
    if (!generator[blockType]) {
      if (missingBlockGenerators.indexOf(blockType) === -1) {
        missingBlockGenerators.push(blockType);
      }
    }
  }

  var valid = missingBlockGenerators.length == 0;
  if (!valid) {
    var msg = 'The generator code for the following blocks not specified for '
        + generator.name_ + ':\n - ' + missingBlockGenerators.join('\n - ');
    Blockly.alert(msg);  // Assuming synchronous. No callback.
  }
  return valid;
};

/**
 * Initialize Blockly.  Called on page load.
 */
Code.init = function(toolXML, ruleData){
  if (ruleData) {
    Blockly.Drools.createWin(ruleData);
  }
  Code.initLanguage();
  var rtl = Code.isRtl();
  var container = document.getElementById('content_area');
  var onresize = function(e) {
    var bBox = Code.getBBox_(container);
    for (var i = 0; i < Code.TABS_.length; i++) {
      var el = document.getElementById('content_' + Code.TABS_[i]);
      // el.style.top = 125 + 'px';
      // el.style.left = 20 + 'px';
      el.style.top = 27+ 'px';
      el.style.left = 0 + 'px';
      // Height and width need to be set, read back, then set again to
      // compensate for scrollbars.
      el.style.height = bBox.height + 'px';
      el.style.height = (2 * bBox.height - el.offsetHeight - 227 ) + 'px';
      el.style.width = bBox.width + 'px';
      el.style.width = (2 * bBox.width - el.offsetWidth) + 'px';
    }
    // Make the 'Blocks' tab line up with the toolbox.
    document.getElementById('tab_blocks').style.minWidth = '118px';
    document.getElementById('tab_Drools').style.minWidth = Code.workspace.toolbox_.width
      ? Code.workspace.toolbox_.width + 'px'
      : '135px';
  };
  window.addEventListener('resize', onresize, false);

  // The toolbox XML specifies each category name using Blockly's messaging
  // format (eg. `<category name="%{BKY_CATLOGIC}">`).
  // These message keys need to be defined in `Blockly.Msg` in order to
  // be decoded by the library. Therefore, we'll use the `MSG` dictionary that's
  // been defined for each language to import each category name message
  // into `Blockly.Msg`.
  // TODO: Clean up the message files so this is done explicitly instead of
  // through this for-loop.
  for (var messageKey in MSG) {
    if (messageKey.indexOf('cat') == 0) {
      Blockly.Msg[messageKey.toUpperCase()] = MSG[messageKey];
    }
  }
  // Construct the toolbox XML, replacing translated variable names.
  var toolboxText = toolXML || document.getElementById('toolbox').outerHTML;
  toolboxText = toolboxText.replace(/(^|[^%]){(\w+)}/g,
    function(m, p1, p2) {return p1 + MSG[p2];});
  var toolboxXml = Blockly.Xml.textToDom(toolboxText);

  Code.workspace = Blockly.inject('content_blocks',
    {grid:
          {spacing: 25,
            length: 3,
            colour: '#ccc',
            snap: true},
    media: '/static/blockly/media/',
    rtl: rtl,
    toolbox: toolboxXml,
    zoom:
           {controls: true,
             wheel: true,
             startScale: 0.8,
             maxScale: 3,
             minScale: 0.3,
             scaleSpeed: 1.2}
    });

  // Add to reserved word list: Local variables in execution environment (runJS)
  // and the infinite loop detection function.
  Blockly.Drools.addReservedWords('code,timeouts,checkTimeout');

  Code.loadBlocks('');

  if ('BlocklyStorage' in window) {
    // Hook a save function onto unload.
    BlocklyStorage.backupOnUnload(Code.workspace);
  }

  Code.tabClick(Code.selected);

  Code.bindClick('trashButton',
    function() {Code.discard(); Code.renderContent();});
  // Code.bindClick('runButton', Code.runJS);
  Code.bindClick('runButton', Code.runDrools);
  // Disable the link button if page isn't backed by App Engine storage.
  var linkButton = document.getElementById('linkButton');
  if ('BlocklyStorage' in window) {
    BlocklyStorage['HTTPREQUEST_ERROR'] = MSG['httpRequestError'];
    BlocklyStorage['LINK_ALERT'] = MSG['linkAlert'];
    BlocklyStorage['HASH_ERROR'] = MSG['hashError'];
    BlocklyStorage['XML_ERROR'] = MSG['xmlError'];
    Code.bindClick(linkButton,
      function() {BlocklyStorage.link(Code.workspace);});
  } else if (linkButton) {
    linkButton.className = 'disabled';
  }

  for (var i = 0; i < Code.TABS_.length; i++) {
    var name = Code.TABS_[i];
    Code.bindClick('tab_' + name,
      function(name_) {return function() {Code.tabClick(name_);};}(name));
  }
  onresize();
  Blockly.svgResize(Code.workspace);

  // Lazy-load the syntax-highlighting.
  window.setTimeout(Code.importPrettify, 1);
};

Code.showBlock = function (name) {
  Code.selected = 'blocks';
  document.getElementById('tab_blocks').className = 'tabon';
  Code.workspace.setVisible(true);
  var container = document.getElementById('content_area');
  var bBox = Code.getBBox_(container);
  for (var i = 0; i < Code.TABS_.length; i++) {
    var el = document.getElementById('content_' + Code.TABS_[i]);
    // el.style.top = 125 + 'px';
    // el.style.left = 20 + 'px';
    el.style.top = 27+ 'px';
    el.style.left = 0 + 'px';
    // Height and width need to be set, read back, then set again to
    // compensate for scrollbars.
    el.style.height = bBox.height + 'px';
    el.style.height = (2 * bBox.height - el.offsetHeight - 227 ) + 'px';
    el.style.width = bBox.width + 'px';
    el.style.width = (2 * bBox.width - el.offsetWidth) + 'px';
  }
  // Make the 'Blocks' tab line up with the toolbox.
  if (Code.workspace && Code.workspace.toolbox_.width) {
    document.getElementById('tab_blocks').style.minWidth = '118px';
  }
  Blockly.svgResize(Code.workspace);
};

/**
 * Initialize the page language.
 */
Code.initLanguage = function() {
  // Set the HTML's language and direction.
  var rtl = Code.isRtl();
  document.dir = rtl ? 'rtl' : 'ltr';
  document.head.parentElement.setAttribute('lang', Code.LANG);

  // Sort languages alphabetically.
  var languages = [];
  for (var lang in Code.LANGUAGE_NAME) {
    languages.push([Code.LANGUAGE_NAME[lang], lang]);
  }
  var comp = function(a, b) {
    // Sort based on first argument ('English', 'Русский', '简体字', etc).
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    return 0;
  };
  languages.sort(comp);
  // Populate the language selection menu.
  // var languageMenu = document.getElementById('languageMenu');
  // languageMenu.options.length = 0;
  // for (var i = 0; i < languages.length; i++) {
  //   var tuple = languages[i];
  //   var lang = tuple[tuple.length - 1];
  //   var option = new Option(tuple[0], lang);
  //   if (lang == Code.LANG) {
  //     option.selected = true;
  //   }
  //   languageMenu.options.add(option);
  // }
  // languageMenu.addEventListener('change', Code.changeLanguage, true);
  //
  // // Inject language strings.
  // document.title += ' ' + MSG['title'];
  document.getElementById('tab_blocks').textContent = MSG['blocks'];
  //
  // document.getElementById('linkButton').title = MSG['linkTooltip'];
  // document.getElementById('runButton').title = MSG['runTooltip'];
  // document.getElementById('trashButton').title = MSG['trashTooltip'];
};

/**
 * Execute the user's code.
 * Just a quick and dirty eval.  Catch infinite loops.
 */
Code.runJS = function() {
  Blockly.Drools.INFINITE_LOOP_TRAP = '  checkTimeout();\n';
  var timeouts = 0;
  var checkTimeout = function() {
    if (timeouts++ > 1000000) {
      throw MSG['timeout'];
    }
  };
  var code = Blockly.Drools.workspaceToCode(Code.workspace);
  Blockly.Drools.INFINITE_LOOP_TRAP = null;
  try {
    eval(code);
  } catch (e) {
    alert(MSG['badCode'].replace('%1', e));
  }
};
Code.runDrools = function() {
  if (Blockly.vue_) {
    Blockly.vue_.showTestForm();
  }
};

/**
 * Discard all blocks from the workspace.
 */
Code.discard = function() {
  var count = Code.workspace.getAllBlocks().length;
  if (count < 2 ||
      window.confirm(Blockly.Msg['DELETE_ALL_BLOCKS'].replace('%1', count))) {
    Code.workspace.clear();
    // if (window.location.hash) {
    //   window.location.hash = '';
    // }
  }
};

// Load the Code demo's language strings.
document.write('<script src="/static/blockly/msg/' + Code.LANG + '.js"></script>\n');
// Load Blockly's language strings.
document.write('<script src="/static/blockly/msg/js/' + Code.LANG + '.js"></script>\n');

/****Code扩展方法***/
Code.setVueToBlockly = function (vueObj) {
  Blockly.vue_ = vueObj;
};

// 把导入或者复制的字符串转换成block放入到workspace
Code.doStringToWorkspace = function (str) {
  if (str && typeof str === 'string') {
    try {
      var json = JSON.parse(str);
      if (json) {
        if (json.block) {
          Blockly.Json.setWorkspace(Blockly.getMainWorkspace(), json);
        } else {
          Blockly.Json.domToBlock(Blockly.getMainWorkspace(), json);
        }
        window.setTimeout(function () {
          Code.showBlock('blocks');
        }, 150);
      }
    } catch (e) {
      // error
      console.log('把导入或者复制的字符串转换成block放入到workspace处理失败' + e);
    }
  }
};

// 下载对应的模块为json文件
function downloadJson (textStr, filename) {
  var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(textStr);
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', filename + '.json');
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
// window.addEventListener('load', Code.init);
function createUpload() {
  if (document.getElementById('importfile')) {
    document.body.removeChild(document.getElementById('importfile'));
  }
  var inputObj=document.createElement('input');
  inputObj.setAttribute('id','importfile');
  inputObj.setAttribute('type','file');
  inputObj.setAttribute('name','file');
  inputObj.setAttribute('style','visibility:hidden');
  document.body.appendChild(inputObj);
  inputObj.value;
  inputObj.click();
}
// 列表按钮
function listButtonClick() {
  // 弹出规则选择器，选取规则后回显在界面上
  if (Blockly.vue_) {
    Blockly.vue_.showRuleList('', function (data) {
      if (data && data.length > 0) {
        var rule = data[0];
        var str = rule.xmlCode;
        Code.doStringToWorkspace(str);
      }
    });
  }
}
// json按钮
function jsonButtonClick() {
  // 弹出规则选择器，选取规则后回显在界面上
  if (Blockly.vue_) {
    Blockly.vue_.showJsonInput('', function (data) {
      debugger;
      Code.doStringToWorkspace(data);
    });
  }
}

// 复制按钮
function copyButtonClick() {
  // 复制回显积木用的json格式字符串
  var str = JSON.stringify(Blockly.Json.getWorkspace(Code.workspace));
  if (str) {
    try {
      let clipboardObj = navigator.clipboard;
      clipboardObj.writeText(str);
    } catch (error) {
      var save = function (e) {
        // 复制到剪切板
        e.clipboardData.setData('text/plain', str);
        // 阻止默认行为
        e.preventDefault();
      };
      document.addEventListener('copy', save);
      document.execCommand('copy');
    }
    Blockly.vue_.$notify({
      type: 'success',
      message: MSG.copySuccess
    });
  }
}

// 黏贴按钮
function pasteButtonClick() {
  if (navigator && navigator.clipboard) {
    // 从剪切板获取数据
    navigator.clipboard.readText().then(function(str) {
      Code.doStringToWorkspace(str);
      Blockly.vue_.$notify({
        type: 'success',
        message: MSG.pasteSuccess
      });
    }).catch(function(e) {
      console.log('从剪切板获取数据异常' + e);
    });
  } else {
    Blockly.vue_.$notify({
      type: 'warning',
      message: '浏览器判断该站点不安全，无法访问剪切板。请使用导入导出功能！'
    });
  }
}

// 导出按钮
function exportButtonClick() {
  // 导出回显积木用的json格式字符串
  var str = JSON.stringify(Blockly.Json.getWorkspace(Code.workspace));
  if (str) {
    var num = Code.workspace.getAllBlocks().length;
    var fileName = num + ' blocks';
    downloadJson(str, fileName);
    Blockly.vue_.$notify({
      type: 'success',
      message: MSG.exportSuccess.replace('%1', num)
    });
  }
}

// 导入按钮
function importButtonClick() {
  // 防止重复点击
  if (Code._isImport) {
    return;
  }
  Code._isImport = true;
  // 创建上传控件
  try {
    createUpload();
  } catch (e) {
    Code._isImport = false;
    console.log('创建上传用的文件dom失败' + e);
    return;
  }
  Code._isImport = false;
  document.getElementById('importfile').addEventListener('change', function(e){
    for (var i=0; i< e.target.files.length; i++){
      let entry = e.target.files[i];
      try {
        // 读取文件文本内容
        entry.text().then(function(data) {
          Code.doStringToWorkspace(data);
          Blockly.vue_.$notify({
            type: 'success',
            message: MSG.importSuccess
          });
          if (document.getElementById('importfile')) {
            document.body.removeChild(document.getElementById('importfile'));
          }
        }).catch (function(e) {
          console.log('文件内容text读取异常：' + e);
        });
      } catch (e) {
        console.log('文件导入异常，文件名：' + entry.name + '。。。' + e);
      }
    }
  });
}
// 重写
Blockly.BlockSvg.prototype.showContextMenu_ = function(e) {
  if (this.workspace.options.readOnly || !this.contextMenu) {
    return;
  }
  // Save the current block in a variable for use in closures.
  var block = this;
  var menuOptions = [];
  // add by dlm 20220104
  menuOptions.push({
    text: MSG.copyToClipboard,//Blockly.Msg['DUPLICATE_BLOCK'],
    enabled: true,
    callback: function() {
      // 复制回显积木用的json格式字符串
      var str = JSON.stringify(Blockly.Json.blockToDom_(block));
      if (str) {
        try {
          let clipboardObj = navigator.clipboard;
          clipboardObj.writeText(str);
        } catch (error) {
          var save = function (e) {
            // 复制到剪切板
            e.clipboardData.setData('text/plain', str);
            // 阻止默认行为
            e.preventDefault();
          };
          document.addEventListener('copy', save);
          document.execCommand('copy');
        }
      }
    }
  });
  if (this.isDeletable() && this.isMovable() && !block.isInFlyout) {
    menuOptions.push(Blockly.ContextMenu.blockDuplicateOption(block));
    if (this.isEditable() && !this.collapsed_ &&
      this.workspace.options.comments) {
      menuOptions.push(Blockly.ContextMenu.blockCommentOption(block));
    }

    // Option to make block inline.
    if (!this.collapsed_) {
      for (var i = 1; i < this.inputList.length; i++) {
        if (this.inputList[i - 1].type != Blockly.NEXT_STATEMENT &&
          this.inputList[i].type != Blockly.NEXT_STATEMENT) {
          // Only display this option if there are two value or dummy inputs
          // next to each other.
          var inlineOption = {enabled: true};
          var isInline = this.getInputsInline();
          inlineOption.text = isInline ?
            Blockly.Msg['EXTERNAL_INPUTS'] : Blockly.Msg['INLINE_INPUTS'];
          inlineOption.callback = function() {
            block.setInputsInline(!isInline);
          };
          menuOptions.push(inlineOption);
          break;
        }
      }
    }

    if (this.workspace.options.collapse) {
      // Option to collapse/expand block.
      if (this.collapsed_) {
        var expandOption = {enabled: true};
        expandOption.text = Blockly.Msg['EXPAND_BLOCK'];
        expandOption.callback = function() {
          block.setCollapsed(false);
        };
        menuOptions.push(expandOption);
      } else {
        var collapseOption = {enabled: true};
        collapseOption.text = Blockly.Msg['COLLAPSE_BLOCK'];
        collapseOption.callback = function() {
          block.setCollapsed(true);
        };
        menuOptions.push(collapseOption);
      }
    }

    if (this.workspace.options.disable) {
      // Option to disable/enable block.
      var disableOption = {
        text: this.disabled ?
          Blockly.Msg['ENABLE_BLOCK'] : Blockly.Msg['DISABLE_BLOCK'],
        enabled: !this.getInheritedDisabled(),
        callback: function() {
          var group = Blockly.Events.getGroup();
          if (!group) {
            Blockly.Events.setGroup(true);
          }
          block.setDisabled(!block.disabled);
          if (!group) {
            Blockly.Events.setGroup(false);
          }
        }
      };
      menuOptions.push(disableOption);
    }

    menuOptions.push(Blockly.ContextMenu.blockDeleteOption(block));
  }

  menuOptions.push(Blockly.ContextMenu.blockHelpOption(block));

  // Allow the block to add or modify menuOptions.
  if (this.customContextMenu) {
    this.customContextMenu(menuOptions);
  }

  Blockly.ContextMenu.show(e, menuOptions, this.RTL);
  Blockly.ContextMenu.currentBlock = this;
};
