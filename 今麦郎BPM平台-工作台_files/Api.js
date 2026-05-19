function MxAPI() {
  this.api = {
    getAllOrgs: {
      type: "POST",
      cache: false,
      url: 'HandlerWCF.ashx',
      dataType: "text",
      beforeSend: function () { }
    },
    getXml: {
      type: "POST",
      cache: false,
      url: 'HandlerWCF.ashx',
      dataType: "text",
      beforeSend: function () { }
    },
    getFlowInputInfo: {
      type: "POST",
      cache: false,
      url: 'HandlerWCF.ashx',
      dataType: "text",
      beforeSend: function () { }
    },
    updateFlowInfo: {
      type: "POST",
      cache: false,
      url: 'HandlerWCF.ashx',
      dataType: "text",
      beforeSend: function () { }
    },
    getXmlByVersion: {
      type: "POST",
      cache: false,
      url: 'HandlerWCF.ashx',
      dataType: "text",
      beforeSend: function () { }
    },
    getStepXml: {
      type: "POST",
      cache: false,
      url: 'HandlerWCF.ashx',
      dataType: "text",
      beforeSend: function () { }
    },
    getMaxVersion: {
      type: "POST",
      cache: false,
      url: 'HandlerWCF.ashx',
      dataType: "text",
      beforeSend: function () { }
    },
    save: {
      type: "POST",
      cache: false,
      url: 'HandlerWCF.ashx',
      dataType: "text",
      beforeSend: function () { }
    },
    delete: {
      type: "POST",
      cache: false,
      url: 'HandlerWCF.ashx',
      dataType: "text",
      beforeSend: function () { }
    },
    queryFlowInfoByManage: {
      type: "POST",
      cache: false,
      url: 'HandlerWCF.ashx',
      dataType: "text",
      beforeSend: function () { }
    },
    queryFlowInfoByDept: {
      type: "POST",
      cache: false,
      url: 'HandlerWCF.ashx',
      dataType: "text",
      beforeSend: function () { }
    },
    queryFlowInfoByUnit: {
      type: "POST",
      cache: false,
      url: 'HandlerWCF.ashx',
      dataType: "text",
      beforeSend: function () { }
    }
  }
}
MxAPI.prototype.api = null;
MxAPI.prototype.getAllOrgs = function (data, success, error) {
  this.api.getAllOrgs.data = data;
  this.mxajax(this.api.getAllOrgs, success, error);
};
MxAPI.prototype.getXml = function (data, success, error) {
  this.api.getXml.data = data;
  this.mxajax(this.api.getXml, success, error);
};
MxAPI.prototype.getFlowInputInfo = function (data, success, error) {
  this.api.getFlowInputInfo.data = data;
  this.mxajax(this.api.getFlowInputInfo, success, error);
};
MxAPI.prototype.updateFlowInfo = function (data, success, error) {
  this.api.updateFlowInfo.data = data;
  this.mxajax(this.api.updateFlowInfo, success, error);
};
MxAPI.prototype.getXmlByVersion = function (data, success, error) {
  this.api.getXmlByVersion.data = data;
  this.mxajax(this.api.getXmlByVersion, success, error);
};
MxAPI.prototype.getStepXml = function (data, success, error) {
  this.api.getStepXml.data = data;
  this.mxajax(this.api.getStepXml, success, error);
};
MxAPI.prototype.getMaxVersion = function (data, success, error) {
  this.api.getMaxVersion.data = data;
  this.mxajax(this.api.getMaxVersion, success, error);
};
MxAPI.prototype.save = function (data, success, error) {
  this.api.save.data = data;
  this.mxajax(this.api.save, success, error);
};
MxAPI.prototype.delete = function (data, success, error) {
  this.api.delete.data = data;
  this.mxajax(this.api.delete, success, error);
};
MxAPI.prototype.queryFlowInfoByManage = function (data, success, error) {
  this.api.queryFlowInfoByManage.data = data;
  this.mxajax(this.api.queryFlowInfoByManage, success, error);
};
MxAPI.prototype.queryFlowInfoByDept = function (data, success, error) {
  this.api.queryFlowInfoByDept.data = data;
  this.mxajax(this.api.queryFlowInfoByDept, success, error);
};
MxAPI.prototype.queryFlowInfoByUnit = function (data, success, error) {
  this.api.queryFlowInfoByUnit.data = data;
  this.mxajax(this.api.queryFlowInfoByUnit, success, error);
};

MxAPI.prototype.mxajax = function (params, success, error) {
  var obj = {};
  $.extend(true, obj, params, {success: function(res){suceess()}}, {error: function(err){error(err)}})
  $.ajax(obj)
}
