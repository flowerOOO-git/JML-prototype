var processDesignUtils = {
  namesMap: new Map(),
  // 判断对象是否为空对象;
  isEmptyObject: function (obj) {

    for (var key in obj) {
      return false;
    }

    return true;
  },
  /**
   *
   * @param item list:{name:'',value:''}
   * @returns {string}  拼接好的HTML代码
   */
  generateElement: function (item) {
    if (item && item.length > 0) {
      let ul = '<ul class="k2-node-container">';
      for (let i = 0; i < item.length; i++) {
        //  var imageUrl = processDesignConstant.NODE_BACKGROUND_IMAGE[item[i]['-name']] ? processDesignConstant.NODE_BACKGROUND_IMAGE[item[i]['-name']] : processDesignConstant.NODE_BACKGROUND_IMAGE.default;
        // background: url(' + imageUrl + ') no-repeat 3px center;background-size:10px 10px;-webkit-background-size:10px 10px;
        ul += '<li class="k2-node-item"  title="' + item[i].name + '">' + item[i].name + '</li>';
      }
      ul += '</ul>';

      return ul;
    } else {
      return '';
    }
  },
  // 继承公共方法
  extend: function (Child, Parent) {
    var F = function () {};

    F.prototype = Parent.prototype;

    Child.prototype = Parent.prototype;

    Child.prototype.constructor = Child;

    Child.uber = Parent.prototype;
  },
  setNamesMap: function(data){
    if (data) {
      for(var key in data) {
        if (data.hasOwnProperty(key)) {
          var node = data[key];
          var nodeName = node.nodeName;
          if (!nodeName) continue;
          let NODE_NAME = processDesignConstant.NODE_NAME[node.nodeType];
          if(window.NODE_TYPE_TITLE){
            NODE_NAME = window.NODE_TYPE_TITLE[node.nodeType];
          }
          // 如果包含nodeName,并且nodeName是以当前inputType开头，则把后面的字符转化为数字，如果转化不了则为0
          if (nodeName && nodeName.startsWith(NODE_NAME)) {
            var suffer = nodeName.substr(NODE_NAME.length);
            if (!isNaN(suffer)) {
              // 从map里获取数字进行比较
              // 如果没取到，直接给当前数字
              if (!this.namesMap.get(NODE_NAME)) {
                this.namesMap.set(NODE_NAME, +suffer);
              }
              else {
                // 如果取到了，与当前获取的数字进行对比，如果比当前的大，则不变，否则设置为当前的值
                var maxNumber = +this.namesMap.get(NODE_NAME);
                if (maxNumber < +suffer) {
                  this.namesMap.set(NODE_NAME, +suffer);
                }
              }
            }
            else {
              // 如果不是数字，直接设置为0
              // this.namesMap.set(inputType, 0);
            }
          }
        }
      }
    }
  },
  /**
   *
   * @param nodeName  需要添加的cell名称
   * @returns {Array} 返回新的节点名称
   */
  getDuplicateNameOfNode: function (nodeName) {
    if (!nodeName) {
      return;
    }

    // 去除nodeName末尾的数字
    nodeName = nodeName.replace(/\d+$/, '');
    // 如果没有从map里获取到，则直接给1
    if (!this.namesMap.get(nodeName)) {
      this.namesMap.set(nodeName, 1);
      return nodeName + '1';
    }
    else {
      var maxNumber = +this.namesMap.get(nodeName) + 1;
      this.namesMap.set(nodeName, maxNumber);

      return nodeName + maxNumber.toString();
    }
  },
  clearNamesMap: function() {
    this.namesMap = new Map();
  },
  httpRequest: function (url, data, method) {
    return new Promise(function (resolve, reject) {
      var xhr;
      var paiToken;
      var apiUrl = PAI.application.serviceUrl + url;

      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
      }

      xhr.open(method || 'POST', apiUrl, true);

      var token = JSON.parse(localStorage.getItem('PAI-token'));

      if (token && token['access_token']) {
        paiToken = 'Bearer ' + token['access_token'];
      }

      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.setRequestHeader('Authorization', paiToken);

      xhr.responseType = 'json';

      xhr.onload = function () {
        var status = xhr.status;

        if (status === 200) {
          resolve(xhr.response);
        } else {
          reject(status);
        }
      };
      //
      xhr.send(JSON.stringify(data));
    });
  },
  deepCopy: function (source, target) {
    //容错处理
    var sourceObj = source || {};
    for (var k in target) {
      //只拷贝实例属性，不进行原型的拷贝
      if (target.hasOwnProperty(k)) {
        //引用类型的数据单独处理
        if (typeof target[k] == 'object') {
          if (k !== 'parent' && k !== 'children' && k !== 'edges') {
            if (target[k]) {
              sourceObj[k] = Array.isArray(target[k]) ? [] : {};
              //递归处理引用类型数据
              this.deepCopy(sourceObj[k], target[k]);
            } else {
              sourceObj[k] = target[k];
            }
          } else {
            sourceObj[k] = null;
          }
        } else {
          //值类型的数据直接进行拷贝
          sourceObj[k] = target[k];
        }
      }
    }
  },
  uuid: function() {
    var s = [];
    var hexDigits = '0123456789abcdef';
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    // bits 12-15 of the time_hi_and_version field to 0010
    s[14] = '4';
    // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';

    return s.join('');
  }
};
