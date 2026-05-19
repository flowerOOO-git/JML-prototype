/**
 * @license
 * Visual Blocks Editor
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
 * @fileoverview Dropdown input field.  Used for editable titles and variables.
 * In the interests of a consistent UI, the toolbox shares some functions and
 * properties with the context menu.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.SelectWin');

goog.require('Blockly.Field');
goog.require('Blockly.utils');
goog.require('Blockly.utils.uiMenu');

goog.require('goog.events');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.userAgent');


/**
 * Class for an editable dropdown field.
 * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
 *     for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected, with the newly selected value as its sole argument.
 *     If it returns a value, that value (which must be one of the options) will
 *     become selected in place of the newly selected option, unless the return
 *     value is null, in which case the change is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.SelectWin = function(menuGenerator, callback, param, block, opt_validator) {
  if (typeof Blockly.vue_[menuGenerator] != 'function' || typeof callback != 'function') {
    throw TypeError('Blockly.SelectWin对象的第一个参数和第二个参数必须为function.');
  }
  this.menuGenerator_ = menuGenerator;
  this.callback_ = callback;
  this.param_ = param;
  this.block_ = block;
  // Call parent's constructor.
  Blockly.SelectWin.superClass_.constructor.call(this, Blockly.Drools.BaseText,
    opt_validator);
};
goog.inherits(Blockly.SelectWin, Blockly.Field);

/**
 * Construct a SelectWin from a JSON arg object.
 * @param {!Object} options A JSON object with options (options).
 * @returns {!Blockly.SelectWin} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.SelectWin.fromJson = function(options) {
  return new Blockly.SelectWin(options['options']);
};

/**
 * Horizontal distance that a checkmark overhangs the dropdown.
 */
Blockly.SelectWin.CHECKMARK_OVERHANG = 25;

/**
 * Maximum height of the dropdown menu, as a percentage of the viewport height.
 */
Blockly.SelectWin.MAX_MENU_HEIGHT_VH = 0.45;

/**
 * Android can't (in 2014) display "▾", so use "▼" instead.
 */
Blockly.SelectWin.ARROW_CHAR = goog.userAgent.ANDROID ? '\u25BC' : '\u25BE';

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.SelectWin.prototype.CURSOR = 'default';

/**
 * Language-neutral currently selected string or image object.
 * @type {string|!Object}
 * @private
 */
Blockly.SelectWin.prototype.value_ = '';

/**
 * SVG image element if currently selected option is an image, or null.
 * @type {SVGElement}
 * @private
 */
Blockly.SelectWin.prototype.imageElement_ = null;

/**
 * Object with src, height, width, and alt attributes if currently selected
 * option is an image, or null.
 * @type {Object}
 * @private
 */
Blockly.SelectWin.prototype.imageJson_ = null;

/**
 * Install this dropdown on a block.
 */
Blockly.SelectWin.prototype.init = function() {
  if (this.fieldGroup_) {
    // Dropdown has already been initialized once.
    return;
  }
  // Add dropdown arrow: "option ▾" (LTR) or "▾ אופציה" (RTL)
  this.arrow_ = Blockly.utils.createSvgElement('tspan', {}, null);
  this.arrow_.appendChild(document.createTextNode(this.sourceBlock_.RTL ?
    Blockly.SelectWin.ARROW_CHAR + ' ' :
    ' ' + Blockly.SelectWin.ARROW_CHAR));

  Blockly.SelectWin.superClass_.init.call(this);
};

/**
 * Create a dropdown menu under the text.
 * @private
 */
Blockly.SelectWin.prototype.showEditor_ = function() {
  // Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, null);
  // var menu = this.createMenu_();
  // this.addActionListener_(menu);
  // this.positionMenu_(menu);
  // Blockly.vue_.doSelectWin('', function (result) {
  // });
  Blockly.vue_[this.menuGenerator_](this.param_, this.callback_, this);
};

/**
 * Add a listener for mouse and keyboard events in the menu and its items.
 * @param {!goog.ui.Menu} menu The menu to add listeners to.
 * @private
 */
Blockly.SelectWin.prototype.addActionListener_ = function(menu) {
  var thisField = this;

  function callback(e) {
    var menu = this;
    var menuItem = e.target;
    if (menuItem) {
      thisField.onItemSelected(menu, menuItem);
    }
    Blockly.WidgetDiv.hideIfOwner(thisField);
    Blockly.Events.setGroup(false);
  }
  // Listen for mouse/keyboard events.
  goog.events.listen(menu, goog.ui.Component.EventType.ACTION, callback);
};

/**
 * Create and populate the menu and menu items for this dropdown, based on
 * the options list.
 * @return {!goog.ui.Menu} The populated dropdown menu.
 * @private
 */
Blockly.SelectWin.prototype.createMenu_ = function() {
  var menu = new goog.ui.Menu();
  menu.setRightToLeft(this.sourceBlock_.RTL);
  var options = this.getOptions();
  for (var i = 0; i < options.length; i++) {
    var content = options[i][0]; // Human-readable text or image.
    var value = options[i][1];   // Language-neutral value.
    if (typeof content == 'object') {
      // An image, not text.
      var image = new Image(content['width'], content['height']);
      image.src = content['src'];
      image.alt = content['alt'] || '';
      content = image;
    }
    var menuItem = new goog.ui.MenuItem(content);
    menuItem.setRightToLeft(this.sourceBlock_.RTL);
    menuItem.setValue(value);
    menuItem.setCheckable(true);
    menu.addChild(menuItem, true);
    menuItem.setChecked(value == this.value_);
  }
  return menu;
};

/**
 * Place the menu correctly on the screen, taking into account the dimensions
 * of the menu and the dimensions of the screen so that it doesn't run off any
 * edges.
 * @param {!goog.ui.Menu} menu The menu to position.
 * @private
 */
Blockly.SelectWin.prototype.positionMenu_ = function(menu) {
  // Record viewport dimensions before adding the dropdown.
  var viewportBBox = Blockly.utils.getViewportBBox();
  var anchorBBox = this.getAnchorDimensions_();

  this.createWidget_(menu);
  var menuSize = Blockly.utils.uiMenu.getSize(menu);

  var menuMaxHeightPx = Blockly.SelectWin.MAX_MENU_HEIGHT_VH
    * document.documentElement.clientHeight;
  if (menuSize.height > menuMaxHeightPx) {
    menuSize.height = menuMaxHeightPx;
  }

  if (this.sourceBlock_.RTL) {
    Blockly.utils.uiMenu.adjustBBoxesForRTL(viewportBBox, anchorBBox, menuSize);
  }
  // Position the menu.
  Blockly.WidgetDiv.positionWithAnchor(viewportBBox, anchorBBox, menuSize,
    this.sourceBlock_.RTL);
  // Calling menuDom.focus() has to wait until after the menu has been placed
  // correctly.  Otherwise it will cause a page scroll to get the misplaced menu
  // in view.  See issue #1329.
  menu.getElement().focus();
};

/**
 * Create and render the menu widget inside Blockly's widget div.
 * @param {!goog.ui.Menu} menu The menu to add to the widget div.
 * @private
 */
Blockly.SelectWin.prototype.createWidget_ = function(menu) {
  var div = Blockly.WidgetDiv.DIV;
  menu.render(div);
  Blockly.utils.addClass(menu.getElement(), 'blocklyDropdownMenu');
  // Enable autofocus after the initial render to avoid issue #1329.
  menu.setAllowAutoFocus(true);
};

/**
 * Returns the coordinates of the anchor rectangle for the widget div.
 * On a SelectWin we take the top-left corner of the field, then adjust for
 * the size of the checkmark that is displayed next to the currently selected
 * item. This means that the item text will be positioned directly under the
 * field text, rather than offset slightly.
 * @returns {!Object} The bounding rectangle of the anchor, in window
 *     coordinates.
 * @private
 */
Blockly.SelectWin.prototype.getAnchorDimensions_ = function() {
  var boundingBox = this.getScaledBBox_();
  if (this.sourceBlock_.RTL) {
    boundingBox.right += Blockly.SelectWin.CHECKMARK_OVERHANG;
  } else {
    boundingBox.left -= Blockly.SelectWin.CHECKMARK_OVERHANG;
  }

  return boundingBox;
};

/**
 * Handle the selection of an item in the dropdown menu.
 * @param {!goog.ui.Menu} menu The Menu component clicked.
 * @param {!goog.ui.MenuItem} menuItem The MenuItem selected within menu.
 */
Blockly.SelectWin.prototype.onItemSelected = function(menu, menuItem) {
  var value = menuItem.getValue();
  if (this.sourceBlock_) {
    // Call any validation function, and allow it to override.
    value = this.callValidator(value);
  }
  if (value !== null) {
    this.setValue(value);
  }
};

/**
 * Factor out common words in statically defined options.
 * Create prefix and/or suffix labels.
 * @private
 */
Blockly.SelectWin.prototype.trimOptions_ = function() {
  this.prefixField = null;
  this.suffixField = null;
  var options = this.menuGenerator_;
  if (!Array.isArray(options)) {
    return;
  }
  var hasImages = false;

  // Localize label text and image alt text.
  for (var i = 0; i < options.length; i++) {
    var label = options[i][0];
    if (typeof label == 'string') {
      options[i][0] = Blockly.utils.replaceMessageReferences(label);
    } else {
      if (label.alt != null) {
        options[i][0].alt = Blockly.utils.replaceMessageReferences(label.alt);
      }
      hasImages = true;
    }
  }
  if (hasImages || options.length < 2) {
    return;  // Do nothing if too few items or at least one label is an image.
  }
  var strings = [];
  for (var i = 0; i < options.length; i++) {
    strings.push(options[i][0]);
  }
  var shortest = Blockly.utils.shortestStringLength(strings);
  var prefixLength = Blockly.utils.commonWordPrefix(strings, shortest);
  var suffixLength = Blockly.utils.commonWordSuffix(strings, shortest);
  if (!prefixLength && !suffixLength) {
    return;
  }
  if (shortest <= prefixLength + suffixLength) {
    // One or more strings will entirely vanish if we proceed.  Abort.
    return;
  }
  if (prefixLength) {
    this.prefixField = strings[0].substring(0, prefixLength - 1);
  }
  if (suffixLength) {
    this.suffixField = strings[0].substr(1 - suffixLength);
  }

  this.menuGenerator_ = Blockly.SelectWin.applyTrim_(options, prefixLength,
    suffixLength);
};

/**
 * Use the calculated prefix and suffix lengths to trim all of the options in
 * the given array.
 * @param {!Array.<!Array>} options Array of option tuples:
 *     (human-readable text or image, language-neutral name).
 * @param {number} prefixLength The length of the common prefix.
 * @param {number} suffixLength The length of the common suffix
 * @return {!Array.<!Array>} A new array with all of the option text trimmed.
 */
Blockly.SelectWin.applyTrim_ = function(options, prefixLength, suffixLength) {
  var newOptions = [];
  // Remove the prefix and suffix from the options.
  for (var i = 0; i < options.length; i++) {
    var text = options[i][0];
    var value = options[i][1];
    text = text.substring(prefixLength, text.length - suffixLength);
    newOptions[i] = [text, value];
  }
  return newOptions;
};

/**
 * @return {boolean} True if the option list is generated by a function.
 *     Otherwise false.
 */
Blockly.SelectWin.prototype.isOptionListDynamic = function() {
  return typeof this.menuGenerator_ == 'function';
};

/**
 * Return a list of the options for this dropdown.
 * @return {!Array.<!Array>} Array of option tuples:
 *     (human-readable text or image, language-neutral name).
 * @throws If generated options are incorrectly structured.
 */
Blockly.SelectWin.prototype.getOptions = function() {
  if (this.isOptionListDynamic()) {
    var generatedOptions = this.menuGenerator_.call(this);
    Blockly.SelectWin.validateOptions_(generatedOptions);
    return generatedOptions;
  }
  return /** @type {!Array.<!Array.<string>>} */ (this.menuGenerator_);
};

/**
 * Get the language-neutral value from this dropdown menu.
 * @return {string} Current text.
 */
Blockly.SelectWin.prototype.getValue = function() {
  return this.value_;
};

/**
 * Set the language-neutral value for this dropdown menu.
 * @param {string} newValue New value to set.
 */
Blockly.SelectWin.prototype.setValue = function(newValue) {
  if (newValue === null || newValue === this.value_) {
    return;  // No change if null.
  }
  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
      this.sourceBlock_, 'field', this.name, this.value_, newValue));
  }
  this.value_ = newValue;
  if (typeof newValue === 'string') {
    this.text_ = newValue;
    this.forceRerender();
  }
};

/**
 * Draws the border with the correct width.
 * @private
 */
Blockly.SelectWin.prototype.render_ = function() {
  if (!this.visible_) {
    this.size_.width = 0;
    return;
  }
  if (this.sourceBlock_ && this.arrow_) {
    // Update arrow's colour.
    this.arrow_.style.fill = this.sourceBlock_.getColour();
  }
  var child;
  while ((child = this.textElement_.firstChild)) {
    this.textElement_.removeChild(child);
  }
  if (this.imageElement_) {
    Blockly.utils.removeNode(this.imageElement_);
    this.imageElement_ = null;
  }

  if (this.imageJson_) {
    this.renderSelectedImage_();
  } else {
    this.renderSelectedText_();
  }
  this.borderRect_.setAttribute('height', this.size_.height - 9);
  this.borderRect_.setAttribute('width',
    this.size_.width + Blockly.BlockSvg.SEP_SPACE_X);
};

/**
 * Renders the selected option, which must be an image.
 * @private
 */
Blockly.SelectWin.prototype.renderSelectedImage_ = function() {
  // Image option is selected.
  this.imageElement_ = Blockly.utils.createSvgElement('image',
    {
      'y': 5,
      'height': this.imageJson_.height + 'px',
      'width': this.imageJson_.width + 'px'
    }, this.fieldGroup_);
  this.imageElement_.setAttributeNS(
    'http://www.w3.org/1999/xlink', 'xlink:href', this.imageJson_.src);
  // Insert dropdown arrow.
  this.textElement_.appendChild(this.arrow_);
  var arrowWidth = Blockly.Field.getCachedWidth(this.arrow_);
  this.size_.height = Number(this.imageJson_.height) + 19;
  this.size_.width = Number(this.imageJson_.width) + arrowWidth;
  if (this.sourceBlock_.RTL) {
    this.imageElement_.setAttribute('x', arrowWidth);
    this.textElement_.setAttribute('x', -1);
  } else {
    this.textElement_.setAttribute('text-anchor', 'end');
    this.textElement_.setAttribute('x', this.size_.width + 1);
  }
};

/**
 * Renders the selected option, which must be text.
 * @private
 */
Blockly.SelectWin.prototype.renderSelectedText_ = function() {
  // Text option is selected.
  // Replace the text.
  var textNode = document.createTextNode(this.getDisplayText_());
  this.textElement_.appendChild(textNode);
  // Insert dropdown arrow.
  if (this.sourceBlock_.RTL) {
    this.textElement_.insertBefore(this.arrow_, this.textElement_.firstChild);
  } else {
    this.textElement_.appendChild(this.arrow_);
  }
  this.textElement_.setAttribute('text-anchor', 'start');
  this.textElement_.setAttribute('x', 0);

  this.size_.height = Blockly.BlockSvg.MIN_BLOCK_Y;
  this.size_.width = Blockly.Field.getCachedWidth(this.textElement_);
};

/**
 * Updates the width of the field. Overrides field.prototype.updateWidth to
 * deal with image selections on IE and Edge. If the selected item is not an
 * image, or if the browser is not IE / Edge, this simply calls the parent
 * implementation.
 */
Blockly.SelectWin.prototype.updateWidth = function() {
  if (this.imageJson_ && (goog.userAgent.IE || goog.userAgent.EDGE)) {
    // Recalculate the full width.
    var arrowWidth = Blockly.Field.getCachedWidth(this.arrow_);
    var width = Number(this.imageJson_.width) + arrowWidth + Blockly.BlockSvg.SEP_SPACE_X;
    if (this.borderRect_) {
      this.borderRect_.setAttribute('width', width);
    }
    this.size_.width = width;
  } else {
    Blockly.Field.prototype.updateWidth.call(this);
  }
};

/**
 * Close the dropdown menu if this input is being deleted.
 */
Blockly.SelectWin.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.SelectWin.superClass_.dispose.call(this);
};

/**
 * Validates the data structure to be processed as an options list.
 * @param {?} options The proposed dropdown options.
 * @throws If proposed options are incorrectly structured.
 * @private
 */
Blockly.SelectWin.validateOptions_ = function(options) {
  if (!Array.isArray(options)) {
    throw TypeError('SelectWin options must be an array.');
  }
  var foundError = false;
  for (var i = 0; i < options.length; ++i) {
    var tuple = options[i];
    if (!Array.isArray(options)) {
      foundError = true;
      console.error(
        'Invalid option[' + i + ']: Each SelectWin option must be an ' +
        'array. Found: ', tuple);
    } else if (typeof tuple[1] != 'string') {
      foundError = true;
      console.error(
        'Invalid option[' + i + ']: Each SelectWin option id must be ' +
        'a string. Found ' + tuple[1] + ' in: ', tuple);
    } else if ((typeof tuple[0] != 'string') &&
      (typeof tuple[0].src != 'string')) {
      foundError = true;
      console.error(
        'Invalid option[' + i + ']: Each SelectWin option must have a ' +
        'string label or image description. Found' + tuple[0] + ' in: ',
        tuple);
    }
  }
  if (foundError) {
    throw TypeError('Found invalid SelectWin options.');
  }
};

Blockly.Field.register('field_selectWin', Blockly.SelectWin);
