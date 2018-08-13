/*BlockToggler*/
'use strict';

//TODO добавить возможность програмного добавления групп
//TODO на открыти/закрытие/переключени при передаче колбека, обхеденять с колбеком родным

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD (Register as an anonymous module)
    define(['jquery'], factory);
  } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
    // Node/CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
})(function ($) {
  var JElementTogglerController = function () {
    function JElementTogglerController(options) {
      _classCallCheck(this, JElementTogglerController);

      this._togglerBtn = options.togglerBtn || null;
      this._listenedEl = options.listenedEl || document.body;
      //this._delegated = options.delegated || false;
      //this._delegatedContainer = options.delegatedContainer || null;
      this._targetSelector = options.target || null;
      this._getTarget = options.getTarget || null; //func, arg: this._$togglerBtn, return: target
      this._groupName = options.groupName || null;
      this._closeBtnSelector = options.closeBtnSelector || '.js__et-close';
      this._animation = options.animation || 'simple'; // 'none', 'simple', 'slide', 'fade'
      this._animationDuration = options.animationDuration || 400;
      this._openAnimation = options.openAnimation || this._animation;
      this._closeAnimation = options.closeAnimation || this._animation;
      this._switchAnimation = options.switchAnimation || this._animation;
      this._openAnimationDuration = options.openAnimationDuration || this._animationDuration;
      this._closeAnimationDuration = options.closeAnimationDuration || this._animationDuration;
      this._switchAnimationDuration = options.switchAnimationDuration || this._animationDuration;
      this._onBeforeOpen = options.onBeforeOpen || null;
      this._onAfterOpen = options.onAfterOpen || null;
      this._onBeforeClose = options.onBeforeClose || null;
      this._onAfterClose = options.onAfterClose || null;
      this._onBeforeSwitch = options.onBeforeSwitch || null;
      this._onAfterSwitch = options.onAfterSwitch || null;
      this._outerClickClose = options.outerClick || false;
      this._disallowedActions = options.disallowedActions || [];
      this.actions = {
        open: 'open',
        close: 'close',
        switch: 'switch'
      };
      this._isActive = false;
      this._isWorking = false;
      this._clickActionTimeout = null;
      this.userClassName = options.className || {};
      this.className = {
        initializedToggler: 'js__et-toggler-initialized',
        initializedTarget: 'js__et-target-initialized',
        active: 'et-active'
      };
      this.events = {
        beforeOpen: 'jElementToggler:beforeOpen',
        afterOpen: 'jElementToggler:afterOpen',
        beforeClose: 'jElementToggler:beforeClose',
        afterClose: 'jElementToggler:afterClose',
        beforeSwitch: 'jElementToggler:beforeSwitch',
        afterSwitch: 'jElementToggler:afterSwitch',
        openGroup: 'jElementToggler:openGroup',
        closeGroup: 'jElementToggler:closeGroup',

        /*managing events*/
        open: 'jElementToggler:open',
        close: 'jElementToggler:close',
        start: 'jElementToggler:start',
        stop: 'jElementToggler:stop'
      };

      this.init();
    }

    _createClass(JElementTogglerController, [{
      key: 'init',
      value: function init() {
        $.extend(this.className, this.userClassName);
        this.bindElements();

        if ((!this._$target || !this._$target.length) && this._animation !== 'none') return; //if still no target stop init func

        this.bindHandlers();
        this.attachHandlers();

        if (this._animation !== 'none') {
          // возможно лишнее условие
          this._$target.hide();
        }

        if (this._$togglerBtn.hasClass(this.className.active) || this._$togglerBtn.is(':checked')) {
          this.showEl('simple');
          this._isActive = true;
        }

        this._isWorking = true;
        this._isInited = true;
      }
    }, {
      key: 'bindElements',
      value: function bindElements() {
        this._$togglerBtn = $(this._togglerBtn);
        this._$listenedEl = $(this._listenedEl);
        this._groupName = this._groupName || this._$togglerBtn.attr('data-et-group');

        if (typeof this._getTarget === 'function') {
          this._$target = $(this._getTarget(this._$togglerBtn, this));
        } else {
          this._targetSelector = this._targetSelector || this._$togglerBtn.attr('data-et-target') || this._$togglerBtn.attr('href');
          this._$target = $(this._targetSelector);
        }

        if (this._$togglerBtn.is('input[type="checkbox"]')) {
          this.isCheckbox = true;
        }
      }
    }, {
      key: 'bindHandlers',
      value: function bindHandlers() {
        var maxAnimationDuration = this._openAnimationDuration >= this._closeAnimationDuration ? this._openAnimationDuration : this._closeAnimationDuration;

        this._debouncedTogglerHandler = this.debounce(this.togglerHandler, maxAnimationDuration + 5, this);
        this._togglerClickHandler = this.togglerClickHandler.bind(this);
        this._clearClickActionTimeout = this.clearClickActionTimeout.bind(this);
        this._openBlockListener = this.openBlockListener.bind(this);
        this._openGroupHandler = this.switchHandler.bind(this);
        this._closeGroupHandler = this.closeGroupHandler.bind(this);
        this._closeBtnListener = this.closeBtnListener.bind(this);
        this._outerClickListener = this.outerClickListener.bind(this);
        this._openElHandler = this.openElHandler.bind(this);
        this._closeElHandler = this.closeElHandler.bind(this);
        this._startHandler = this.startHandler.bind(this);
        this._stopHandler = this.stopHandler.bind(this);
      }
    }, {
      key: 'attachHandlers',
      value: function attachHandlers() {
        var _$togglerBtn$on;

        var clickEvent = this._clickEvent = this.isIOS() ? 'touchstart' : 'click';
        var $listenedEl = this._$listenedEl;
        var $target = this._$target;

        if ($target.length) {
          $target.on('click', this._closeBtnListener).addClass(this.className.initializedTarget);
        }

        if (this._outerClickClose) {
          $listenedEl.on(this._clickEvent, this._outerClickListener);
        }

        if (this._groupName) {
          var _$listenedEl$on;

          $listenedEl.on((_$listenedEl$on = {}, _defineProperty(_$listenedEl$on, this.events.beforeOpen, this._openBlockListener), _defineProperty(_$listenedEl$on, this.events.openGroup, this._openGroupHandler), _defineProperty(_$listenedEl$on, this.events.closeGroup, this._closeGroupHandler), _$listenedEl$on));
        }

        this._$togglerBtn.on((_$togglerBtn$on = {}, _defineProperty(_$togglerBtn$on, clickEvent, this._debouncedTogglerHandler), _defineProperty(_$togglerBtn$on, this.events.open, this._openElHandler), _defineProperty(_$togglerBtn$on, this.events.close, this._closeElHandler), _defineProperty(_$togglerBtn$on, this.events.stop, this._stopHandler), _$togglerBtn$on)).addClass(this.className.initializedToggler);

        if (!this._isInited) {
          this._$togglerBtn.on(_defineProperty({}, this.events.start, this._startHandler));
        }
      }
    }, {
      key: 'detachHandlers',
      value: function detachHandlers() {
        var _$togglerBtn$off;

        var clickEvent = this._clickEvent = this.isIOS() ? 'touchstart' : 'click';
        var $listenedEl = this._$listenedEl;
        var $target = this._$target;

        if ($target.length) {
          $target.off('click', this._closeBtnListener).removeClass(this.className.initializedTarget);
        }

        if (this._outerClickClose) {
          $listenedEl.off(this._clickEvent, this._outerClickListener);
        }

        if (this._groupName) {
          var _$listenedEl$off;

          $listenedEl.off((_$listenedEl$off = {}, _defineProperty(_$listenedEl$off, this.events.beforeOpen, this._openBlockListener), _defineProperty(_$listenedEl$off, this.events.closeGroup, this._closeGroupHandler), _$listenedEl$off));
        }

        this._$togglerBtn.off((_$togglerBtn$off = {}, _defineProperty(_$togglerBtn$off, clickEvent, this._debouncedTogglerHandler), _defineProperty(_$togglerBtn$off, this.events.open, this._openElHandler), _defineProperty(_$togglerBtn$off, this.events.close, this._closeElHandler), _defineProperty(_$togglerBtn$off, this.events.stop, this._stopHandler), _$togglerBtn$off)).removeClass(this.className.initializedToggler);
      }
    }, {
      key: 'start',
      value: function start() {
        if (this._isWorking) return;

        this.attachHandlers();
        this._isWorking = true;
      }
    }, {
      key: 'stop',
      value: function stop() {
        if (!this._isWorking) return;

        this.detachHandlers();
        this._isWorking = false;
      }
    }, {
      key: 'startHandler',
      value: function startHandler(e) {
        var el = e.target;

        if (!this.isSameToggler(el)) return;

        this.start();
      }
    }, {
      key: 'stopHandler',
      value: function stopHandler(e) {
        var el = e.target;

        if (!this.isSameToggler(el)) return;

        this.stop();
      }
    }, {
      key: 'isSameToggler',
      value: function isSameToggler(el) {
        //let $el = $(el);
        //let $closestTogglerBtn = $el.closest('.' + this.className.initializedToggler);

        return this._$togglerBtn.is(el);
      }
    }, {
      key: 'togglerHandler',
      value: function togglerHandler(e) {
        var $el = $(e.target);
        var isTarget = !!$el.closest(this._$target).length && !$el.is(this._$togglerBtn);
        var scrollEvent = this.isIOS() ? 'touchmove' : 'scroll';

        if (!this.isHidden(this._$target) && this._animation !== 'none') {
          //возможно стоит также удалить
          this._isActive = true;
        }

        if (this._isActive && isTarget) return;

        if (!this.isIOS() && !this.isCheckbox) {
          e.preventDefault();
        }

        this.clearClickActionTimeout();
        this._clickActionTimeout = setTimeout(function () {
          this.togglerClickHandler();
          $(document).off(scrollEvent, this._clearClickActionTimeout);
        }.bind(this), 200);

        $(document).one(scrollEvent, this._clearClickActionTimeout);
      }
    }, {
      key: 'clearClickActionTimeout',
      value: function clearClickActionTimeout() {
        if (this._clickActionTimeout) {
          clearTimeout(this._clickActionTimeout);
          this._clickActionTimeout = null;
        }
      }
    }, {
      key: 'togglerClickHandler',
      value: function togglerClickHandler() {
        if (this._isActive) {
          this.hideEl();
        } else {
          this.showEl();
        }
      }
    }, {
      key: 'openElHandler',
      value: function openElHandler(e, animation, duration, callback) {
        var el = e.target;

        if (!this.isSameToggler(el)) return;

        this.showEl(animation, duration, callback);
      }
    }, {
      key: 'closeElHandler',
      value: function closeElHandler(e, animation, duration, callback) {
        var el = e.target;

        if (!this.isSameToggler(el)) return;

        this.hideEl(animation, duration, callback);
      }
    }, {
      key: 'openBlockListener',
      value: function openBlockListener(e, controller) {
        if (!this._isActive || controller._$togglerBtn.is(this._$togglerBtn) || controller._groupName !== this._groupName || controller._groupName === undefined) {
          return;
        }

        this.switchEl();
      }
    }, {
      key: 'switchHandler',
      value: function switchHandler(e, groupName) {
        if (groupName !== this._groupName || groupName === undefined) {
          return;
        }

        this.switchEl();
      }
    }, {
      key: 'closeGroupHandler',
      value: function closeGroupHandler(e, groupName) {
        if (!this._isActive || groupName !== this._groupName || groupName === undefined) {
          return;
        }

        this.hideEl();
      }
    }, {
      key: 'outerClickListener',
      value: function outerClickListener(e) {
        //console.dir(this);
        if (!this._isActive) return;

        var $el = $(e.target);
        var isOuter = !$el.closest(this._$target.add(this._$togglerBtn)).length;

        if (!isOuter) return;

        this.hideEl();
      }
    }, {
      key: 'closeBtnListener',
      value: function closeBtnListener(e) {
        var $el = $(e.target);
        var $closeBtn = $el.closest(this._closeBtnSelector);

        if (!$closeBtn.length) return;

        var $currTarget = $closeBtn.closest('.' + this.className.initializedTarget);

        if (!$currTarget.is(this._$target)) return;

        this.hideEl();
      }
    }, {
      key: 'showEl',
      value: function showEl(animation, duration, callback) {
        if (~this._disallowedActions.indexOf(this.actions.open)) return;

        var $target = this._$target;
        callback = typeof callback === 'function' ? callback.bind(this) : this.showCallback.bind(this);
        duration = duration || this._openAnimationDuration;
        animation = animation || this._openAnimation;

        if (this._$togglerBtn.is('input[type="checkbox"]')) {
          this._$togglerBtn.attr('checked', true);
        } else {
          this._$togglerBtn.addClass(this.className.active);
        }
        $target.addClass(this.className.active);
        this._isActive = true;

        if (typeof this._onBeforeOpen === 'function') {
          this._onBeforeOpen(this);
        }

        this._$togglerBtn.trigger(this.events.beforeOpen, [this]);

        switch (animation) {
          case 'none':
            callback();
            break;
          case 'simple':
            $target.show();
            callback();
            break;
          case 'slide':
            if (!$target.length) {
              callback();
            } else {
              $target.slideDown(duration, callback);
            }
            break;
          case 'fade':
            if (!$target.length) {
              callback();
            } else {
              $target.fadeIn(duration, callback);
            }
            break;
        }
      }
    }, {
      key: 'showCallback',
      value: function showCallback() {
        if (typeof this._onAfterOpen === 'function') {
          this._onAfterOpen(this);
        }

        this._$togglerBtn.trigger(this.events.afterOpen, [this]);

        if (this._outerClickClose) {
          this._$listenedEl.on(this._clickEvent, this.outerClickListener);
        }
      }
    }, {
      key: 'hideEl',
      value: function hideEl(animation, duration, callback) {
        if (~this._disallowedActions.indexOf(this.actions.close)) return;

        var $target = this._$target;
        callback = typeof callback === 'function' ? callback.bind(this) : this.hideCallback.bind(this);
        duration = duration || this._closeAnimationDuration;
        animation = animation || this._closeAnimation;

        if (this._$togglerBtn.is('input[type="checkbox"]')) {
          this._$togglerBtn.attr('checked', false);
        } else {
          this._$togglerBtn.removeClass(this.className.active);
        }
        $target.removeClass(this.className.active);
        this._isActive = false;

        if (typeof this._onBeforeClose === 'function') {
          this._onBeforeClose(this);
        }

        this._$togglerBtn.trigger(this.events.beforeClose, [this]);

        switch (animation) {
          case 'none':
            callback();
            break;
          case 'simple':
            $target.hide();
            callback();
            break;
          case 'slide':
            $target.slideUp(duration, callback);
            break;
          case 'fade':
            $target.fadeOut(duration, callback);
            break;
        }
      }
    }, {
      key: 'hideCallback',
      value: function hideCallback() {
        if (typeof this._onAfterClose === 'function') {
          this._onAfterClose(this);
        }

        this._$togglerBtn.trigger(this.events.afterClose, [this]);

        if (this._outerClickClose) {
          this._$listenedEl.off(this._clickEvent, this.outerClickListener);
        }
      }
    }, {
      key: 'switchEl',
      value: function switchEl(animation, duration, callback) {
        if (~this._disallowedActions.indexOf(this.actions.switch)) return;

        var $target = this._$target;
        callback = typeof callback === 'function' ? callback.bind(this) : this.switchCallback.bind(this);
        duration = duration || this._switchAnimationDuration;
        animation = animation || this._switchAnimation;

        if (this._$togglerBtn.is('input[type="checkbox"]')) {
          this._$togglerBtn.attr('checked', false);
        } else {
          this._$togglerBtn.removeClass(this.className.active);
        }
        $target.removeClass(this.className.active);
        this._isActive = false;

        if (typeof this._onBeforeSwitch === 'function') {
          this._onBeforeSwitch(this);
        }

        this._$togglerBtn.trigger(this.events.beforeSwitch, [this]);

        switch (animation) {
          case 'none':
            callback();
            break;
          case 'simple':
            $target.hide();
            callback();
            break;
          case 'slide':
            $target.slideUp(duration, callback);
            break;
          case 'fade':
            $target.fadeOut(duration, callback);
            break;
        }
      }
    }, {
      key: 'switchCallback',
      value: function switchCallback() {
        if (typeof this._onAfterClose === 'function') {
          this._onAfterSwitch(this);
        }

        this._$togglerBtn.trigger(this.events.afterSwitch, [this]);

        if (this._outerClickClose) {
          this._$listenedEl.off(this._clickEvent, this.outerClickListener);
        }
      }
    }, {
      key: 'isIOS',
      value: function isIOS() {
        return (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
        );
      }
    }, {
      key: 'isHidden',
      value: function isHidden(el) {
        var $el = $(el);

        return $el.is(':hidden') || $el.css('visibility') === 'hidden' || +$el.css('opacity') === 0;
      }
    }, {
      key: 'getSelf',
      value: function getSelf() {
        return this;
      }

      /**
       * Debounces a function. Returns a function that calls the original fn function only if no invocations have been made
       * within the last quietMillis milliseconds.
       *
       * @param quietMillis number of milliseconds to wait before invoking fn
       * @param fn function to be debounced
       * @param bindedThis object to be used as this reference within fn
       * @return debounced version of fn
       */

    }, {
      key: 'debounce',
      value: function debounce(fn, quietMillis, bindedThis) {
        var isWaiting = false;
        return function func() {
          if (isWaiting) return;

          if (bindedThis === undefined) {
            bindedThis = this;
          }

          fn.apply(bindedThis, arguments);
          isWaiting = true;

          setTimeout(function () {
            isWaiting = false;
          }, quietMillis);
        };
      }
    }, {
      key: 'setOptions',
      value: function setOptions(options) {
        this.detachHandlers();

        for (var key in options) {
          this['_' + key] = options[key];
        }

        this.init();
      }
    }]);

    return JElementTogglerController;
  }();

  var DelegatedTogglerController = function () {
    function DelegatedTogglerController(options) {
      _classCallCheck(this, DelegatedTogglerController);

      this._$delegatedContainer = options.$delegatedContainer;
      this._togglerBtn = options.togglerBtn;
      this._jElementTogglerOptions = options;

      this.init();
    }

    _createClass(DelegatedTogglerController, [{
      key: 'init',
      value: function init() {
        this._jElementTogglerOptions.togglerBtn = null;
        this._clickHandler = this.clickHandler.bind(this);
        this._$delegatedContainer.on('click', this._clickHandler);
      }
    }, {
      key: 'clickHandler',
      value: function clickHandler(e) {
        var target = e.target;
        var togglerBtn = target.closest(this._togglerBtn);

        if (!togglerBtn || togglerBtn.jElementToggler && togglerBtn.jElementToggler instanceof JElementTogglerController) return;

        $(togglerBtn).jElementToggler(this._jElementTogglerOptions);
      }
    }]);

    return DelegatedTogglerController;
  }();

  $.fn.elementToggler = function () {
    var _ = this;
    var options = arguments[0] || {};
    var args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < _.length; i++) {
      if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
        if (options.delegated) {
          if (!$.isArray(_[i].delegatedToggler)) {
            _[i].delegatedToggler = [];
          }

          options.$delegatedContainer = $(_[i]);
          _[i].delegatedToggler.push(new DelegatedTogglerController(options));
        } else {
          options.togglerBtn = _[i];
          _[i].elementToggler = new JElementTogglerController(options);
        }
      } else {
        var result = _[i].jElementToggler[options].call(_[i].jElementToggler, args);

        if (typeof result !== 'undefined') return result;
      }
    }

    return _;
  };
});
