/*
 * @Description: 重写mxGraph 中Menus.js 的类
 * @Author: 忆达夫
 * @Date: 2018/11/19
 * @Last Modified by: 忆达夫
 * @Last Modified time: 17:56
 */
Menus.prototype.menuItems = [
  // {value: '新增', name: 'create'},
  // {value: '打开', name: 'open'},
  {value: '保存', name: 'save'},
  // {value: '发布', name: 'deploy'},
  // {value: '图片', name: 'img'},
  // {value: '打印', name: 'print'},
  // {value: '帮助', name: 'help'},
  // {value: '关闭', name: 'close'},
  {value: '流程属性', name: 'flowProperty'},
  {value: '更多',name: 'more'}
];
//
Menus.prototype.navMenuItems = [
  {value: '新增', name: 'create'},
  {value: '打开', name: 'open'},
  // {value: '保存', name: 'save'},
  {value: '发布', name: 'deploy'},
  {value: '仅发布', name: 'onlyDeploy'}
  // {value: '图片', name: 'img'},
  // {value: '打印', name: 'print'},
  // {value: '帮助', name: 'help'},
  // {value: '关闭', name: 'close'}
  // {value: '流程属性', name: 'flowProperty'}
];

// menuItems background-image url
Menus.prototype.MENU_CLASS_NAME = {
  'create': 'icon-font icon-create',
  'open': 'icon-font icon-open',
  'save': 'icon-font icon-save',
  'deploy': 'icon-font icon-deploy',
  'onlyDeploy': 'icon-font icon-print',
  'img': 'icon-font icon-img',
  'print': 'icon-font icon-print',
  'help': 'icon-font icon-help',
  'close': 'icon-font icon-close',
  'flowProperty': 'icon-font icon-property',
  'more': 'icon-font icon-more'
};

Menus.prototype.handlers = {
  'create': function () {},
  'open': function () {},
  'deploy': function () {},
  // 仅发布:用于将测试环境的数据通过流程设计器进行流程图发布,并不新增mysql数据
  'onlyDeploy': function() {},

  'save': function (d) {},
  'img': function (d) {},
  'print': function () {},
  'help': function () {},
  'close': function () {
    window.close();
  },
  'flowProperty': function (){},
  'more': function(event) {}
};
