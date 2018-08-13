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

  $.fn.jElementToggler = function () {
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
          _[i].jElementToggler = new JElementTogglerController(options);
        }

        //options.togglerBtn = _[i];
        //_[i].jElementToggler = new JElementTogglerController(options);
      } else {
        var result = _[i].jElementToggler[options].call(_[i].jElementToggler, args);

        if (typeof result !== 'undefined') return result;
      }
    }

    return _;
  };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzL2pFbGVtZW50VG9nZ2xlci5lczYuanMiXSwibmFtZXMiOlsiZmFjdG9yeSIsImRlZmluZSIsImFtZCIsImV4cG9ydHMiLCJtb2R1bGUiLCJyZXF1aXJlIiwialF1ZXJ5IiwiJCIsIkpFbGVtZW50VG9nZ2xlckNvbnRyb2xsZXIiLCJvcHRpb25zIiwiX3RvZ2dsZXJCdG4iLCJ0b2dnbGVyQnRuIiwiX2xpc3RlbmVkRWwiLCJsaXN0ZW5lZEVsIiwiZG9jdW1lbnQiLCJib2R5IiwiX3RhcmdldFNlbGVjdG9yIiwidGFyZ2V0IiwiX2dldFRhcmdldCIsImdldFRhcmdldCIsIl9ncm91cE5hbWUiLCJncm91cE5hbWUiLCJfY2xvc2VCdG5TZWxlY3RvciIsImNsb3NlQnRuU2VsZWN0b3IiLCJfYW5pbWF0aW9uIiwiYW5pbWF0aW9uIiwiX2FuaW1hdGlvbkR1cmF0aW9uIiwiYW5pbWF0aW9uRHVyYXRpb24iLCJfb3BlbkFuaW1hdGlvbiIsIm9wZW5BbmltYXRpb24iLCJfY2xvc2VBbmltYXRpb24iLCJjbG9zZUFuaW1hdGlvbiIsIl9zd2l0Y2hBbmltYXRpb24iLCJzd2l0Y2hBbmltYXRpb24iLCJfb3BlbkFuaW1hdGlvbkR1cmF0aW9uIiwib3BlbkFuaW1hdGlvbkR1cmF0aW9uIiwiX2Nsb3NlQW5pbWF0aW9uRHVyYXRpb24iLCJjbG9zZUFuaW1hdGlvbkR1cmF0aW9uIiwiX3N3aXRjaEFuaW1hdGlvbkR1cmF0aW9uIiwic3dpdGNoQW5pbWF0aW9uRHVyYXRpb24iLCJfb25CZWZvcmVPcGVuIiwib25CZWZvcmVPcGVuIiwiX29uQWZ0ZXJPcGVuIiwib25BZnRlck9wZW4iLCJfb25CZWZvcmVDbG9zZSIsIm9uQmVmb3JlQ2xvc2UiLCJfb25BZnRlckNsb3NlIiwib25BZnRlckNsb3NlIiwiX29uQmVmb3JlU3dpdGNoIiwib25CZWZvcmVTd2l0Y2giLCJfb25BZnRlclN3aXRjaCIsIm9uQWZ0ZXJTd2l0Y2giLCJfb3V0ZXJDbGlja0Nsb3NlIiwib3V0ZXJDbGljayIsIl9kaXNhbGxvd2VkQWN0aW9ucyIsImRpc2FsbG93ZWRBY3Rpb25zIiwiYWN0aW9ucyIsIm9wZW4iLCJjbG9zZSIsInN3aXRjaCIsIl9pc0FjdGl2ZSIsIl9pc1dvcmtpbmciLCJfY2xpY2tBY3Rpb25UaW1lb3V0IiwidXNlckNsYXNzTmFtZSIsImNsYXNzTmFtZSIsImluaXRpYWxpemVkVG9nZ2xlciIsImluaXRpYWxpemVkVGFyZ2V0IiwiYWN0aXZlIiwiZXZlbnRzIiwiYmVmb3JlT3BlbiIsImFmdGVyT3BlbiIsImJlZm9yZUNsb3NlIiwiYWZ0ZXJDbG9zZSIsImJlZm9yZVN3aXRjaCIsImFmdGVyU3dpdGNoIiwib3Blbkdyb3VwIiwiY2xvc2VHcm91cCIsInN0YXJ0Iiwic3RvcCIsImluaXQiLCJleHRlbmQiLCJiaW5kRWxlbWVudHMiLCJfJHRhcmdldCIsImxlbmd0aCIsImJpbmRIYW5kbGVycyIsImF0dGFjaEhhbmRsZXJzIiwiaGlkZSIsIl8kdG9nZ2xlckJ0biIsImhhc0NsYXNzIiwiaXMiLCJzaG93RWwiLCJfaXNJbml0ZWQiLCJfJGxpc3RlbmVkRWwiLCJhdHRyIiwiaXNDaGVja2JveCIsIm1heEFuaW1hdGlvbkR1cmF0aW9uIiwiX2RlYm91bmNlZFRvZ2dsZXJIYW5kbGVyIiwiZGVib3VuY2UiLCJ0b2dnbGVySGFuZGxlciIsIl90b2dnbGVyQ2xpY2tIYW5kbGVyIiwidG9nZ2xlckNsaWNrSGFuZGxlciIsImJpbmQiLCJfY2xlYXJDbGlja0FjdGlvblRpbWVvdXQiLCJjbGVhckNsaWNrQWN0aW9uVGltZW91dCIsIl9vcGVuQmxvY2tMaXN0ZW5lciIsIm9wZW5CbG9ja0xpc3RlbmVyIiwiX29wZW5Hcm91cEhhbmRsZXIiLCJzd2l0Y2hIYW5kbGVyIiwiX2Nsb3NlR3JvdXBIYW5kbGVyIiwiY2xvc2VHcm91cEhhbmRsZXIiLCJfY2xvc2VCdG5MaXN0ZW5lciIsImNsb3NlQnRuTGlzdGVuZXIiLCJfb3V0ZXJDbGlja0xpc3RlbmVyIiwib3V0ZXJDbGlja0xpc3RlbmVyIiwiX29wZW5FbEhhbmRsZXIiLCJvcGVuRWxIYW5kbGVyIiwiX2Nsb3NlRWxIYW5kbGVyIiwiY2xvc2VFbEhhbmRsZXIiLCJfc3RhcnRIYW5kbGVyIiwic3RhcnRIYW5kbGVyIiwiX3N0b3BIYW5kbGVyIiwic3RvcEhhbmRsZXIiLCJjbGlja0V2ZW50IiwiX2NsaWNrRXZlbnQiLCJpc0lPUyIsIiRsaXN0ZW5lZEVsIiwiJHRhcmdldCIsIm9uIiwiYWRkQ2xhc3MiLCJvZmYiLCJyZW1vdmVDbGFzcyIsImRldGFjaEhhbmRsZXJzIiwiZSIsImVsIiwiaXNTYW1lVG9nZ2xlciIsIiRlbCIsImlzVGFyZ2V0IiwiY2xvc2VzdCIsInNjcm9sbEV2ZW50IiwiaXNIaWRkZW4iLCJwcmV2ZW50RGVmYXVsdCIsInNldFRpbWVvdXQiLCJvbmUiLCJjbGVhclRpbWVvdXQiLCJoaWRlRWwiLCJkdXJhdGlvbiIsImNhbGxiYWNrIiwiY29udHJvbGxlciIsInVuZGVmaW5lZCIsInN3aXRjaEVsIiwiaXNPdXRlciIsImFkZCIsIiRjbG9zZUJ0biIsIiRjdXJyVGFyZ2V0IiwiaW5kZXhPZiIsInNob3dDYWxsYmFjayIsInRyaWdnZXIiLCJzaG93Iiwic2xpZGVEb3duIiwiZmFkZUluIiwiaGlkZUNhbGxiYWNrIiwic2xpZGVVcCIsImZhZGVPdXQiLCJzd2l0Y2hDYWxsYmFjayIsInRlc3QiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJ3aW5kb3ciLCJNU1N0cmVhbSIsImNzcyIsImZuIiwicXVpZXRNaWxsaXMiLCJiaW5kZWRUaGlzIiwiaXNXYWl0aW5nIiwiZnVuYyIsImFwcGx5IiwiYXJndW1lbnRzIiwia2V5IiwiRGVsZWdhdGVkVG9nZ2xlckNvbnRyb2xsZXIiLCJfJGRlbGVnYXRlZENvbnRhaW5lciIsIiRkZWxlZ2F0ZWRDb250YWluZXIiLCJfakVsZW1lbnRUb2dnbGVyT3B0aW9ucyIsIl9jbGlja0hhbmRsZXIiLCJjbGlja0hhbmRsZXIiLCJqRWxlbWVudFRvZ2dsZXIiLCJfIiwiYXJncyIsIkFycmF5IiwicHJvdG90eXBlIiwic2xpY2UiLCJjYWxsIiwiaSIsImRlbGVnYXRlZCIsImlzQXJyYXkiLCJkZWxlZ2F0ZWRUb2dnbGVyIiwicHVzaCIsInJlc3VsdCJdLCJtYXBwaW5ncyI6IkFBQUM7QUFDRDs7QUFFQztBQUNBOzs7Ozs7Ozs7O0FBQ0QsQ0FBQyxVQUFVQSxPQUFWLEVBQW1CO0FBQ2xCLE1BQUksT0FBT0MsTUFBUCxLQUFrQixVQUFsQixJQUFnQ0EsT0FBT0MsR0FBM0MsRUFBZ0Q7QUFDOUM7QUFDQUQsV0FBTyxDQUFDLFFBQUQsQ0FBUCxFQUFtQkQsT0FBbkI7QUFDRCxHQUhELE1BR08sSUFBSSxRQUFPRyxPQUFQLHlDQUFPQSxPQUFQLE9BQW1CLFFBQXZCLEVBQWlDO0FBQ3RDO0FBQ0FDLFdBQU9ELE9BQVAsR0FBaUJILFFBQVFLLFFBQVEsUUFBUixDQUFSLENBQWpCO0FBQ0QsR0FITSxNQUdBO0FBQ0w7QUFDQUwsWUFBUU0sTUFBUjtBQUNEO0FBQ0YsQ0FYRCxFQVdHLFVBQVVDLENBQVYsRUFBYTtBQUFBLE1BQ1JDLHlCQURRO0FBRVosdUNBQWFDLE9BQWIsRUFBc0I7QUFBQTs7QUFDcEIsV0FBS0MsV0FBTCxHQUFtQkQsUUFBUUUsVUFBUixJQUFzQixJQUF6QztBQUNBLFdBQUtDLFdBQUwsR0FBbUJILFFBQVFJLFVBQVIsSUFBc0JDLFNBQVNDLElBQWxEO0FBQ0E7QUFDQTtBQUNBLFdBQUtDLGVBQUwsR0FBdUJQLFFBQVFRLE1BQVIsSUFBa0IsSUFBekM7QUFDQSxXQUFLQyxVQUFMLEdBQWtCVCxRQUFRVSxTQUFSLElBQXFCLElBQXZDLENBTm9CLENBTXlCO0FBQzdDLFdBQUtDLFVBQUwsR0FBa0JYLFFBQVFZLFNBQVIsSUFBcUIsSUFBdkM7QUFDQSxXQUFLQyxpQkFBTCxHQUF5QmIsUUFBUWMsZ0JBQVIsSUFBNEIsZUFBckQ7QUFDQSxXQUFLQyxVQUFMLEdBQWtCZixRQUFRZ0IsU0FBUixJQUFxQixRQUF2QyxDQVRvQixDQVM4QjtBQUNsRCxXQUFLQyxrQkFBTCxHQUEwQmpCLFFBQVFrQixpQkFBUixJQUE2QixH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LEVBQUVNLENBQUYsRUFBS0csZ0JBQWYsQ0FBTCxFQUF1QztBQUNyQ1QsY0FBRU0sQ0FBRixFQUFLRyxnQkFBTCxHQUF3QixFQUF4QjtBQUNEOztBQUVEekwsa0JBQVEySyxtQkFBUixHQUE4QjdLLEVBQUVrTCxFQUFFTSxDQUFGLENBQUYsQ0FBOUI7QUFDQU4sWUFBRU0sQ0FBRixFQUFLRyxnQkFBTCxDQUFzQkMsSUFBdEIsQ0FBMkIsSUFBSWpCLDBCQUFKLENBQStCekssT0FBL0IsQ0FBM0I7QUFDRCxTQVBELE1BT087QUFDTEEsa0JBQVFFLFVBQVIsR0FBcUI4SyxFQUFFTSxDQUFGLENBQXJCO0FBQ0FOLFlBQUVNLENBQUYsRUFBS1AsZUFBTCxHQUF1QixJQUFJaEwseUJBQUosQ0FBOEJDLE9BQTlCLENBQXZCO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNELE9BZkQsTUFlTztBQUNMLFlBQUkyTCxTQUFTWCxFQUFFTSxDQUFGLEVBQUtQLGVBQUwsQ0FBcUIvSyxPQUFyQixFQUE4QnFMLElBQTlCLENBQW1DTCxFQUFFTSxDQUFGLEVBQUtQLGVBQXhDLEVBQXlERSxJQUF6RCxDQUFiOztBQUVBLFlBQUksT0FBT1UsTUFBUCxLQUFrQixXQUF0QixFQUFtQyxPQUFPQSxNQUFQO0FBQ3BDO0FBQ0Y7O0FBRUQsV0FBT1gsQ0FBUDtBQUNELEdBN0JEO0FBOEJELENBOW1CRCIsImZpbGUiOiJqcy9qRWxlbWVudFRvZ2dsZXIuZXM2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIC8qQmxvY2tUb2dnbGVyKi9cbid1c2Ugc3RyaWN0JztcblxuIC8vVE9ETyDQtNC+0LHQsNCy0LjRgtGMINCy0L7Qt9C80L7QttC90L7RgdGC0Ywg0L/RgNC+0LPRgNCw0LzQvdC+0LPQviDQtNC+0LHQsNCy0LvQtdC90LjRjyDQs9GA0YPQv9C/XG4gLy9UT0RPINC90LAg0L7RgtC60YDRi9GC0Lgv0LfQsNC60YDRi9GC0LjQtS/Qv9C10YDQtdC60LvRjtGH0LXQvdC4INC/0YDQuCDQv9C10YDQtdC00LDRh9C1INC60L7Qu9Cx0LXQutCwLCDQvtCx0YXQtdC00LXQvdGP0YLRjCDRgSDQutC+0LvQsdC10LrQvtC8INGA0L7QtNC90YvQvFxuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQgKFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUpXG4gICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGUvQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgfVxufSkoZnVuY3Rpb24gKCQpIHtcbiAgY2xhc3MgSkVsZW1lbnRUb2dnbGVyQ29udHJvbGxlciB7XG4gICAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuX3RvZ2dsZXJCdG4gPSBvcHRpb25zLnRvZ2dsZXJCdG4gfHwgbnVsbDtcbiAgICAgIHRoaXMuX2xpc3RlbmVkRWwgPSBvcHRpb25zLmxpc3RlbmVkRWwgfHwgZG9jdW1lbnQuYm9keTtcbiAgICAgIC8vdGhpcy5fZGVsZWdhdGVkID0gb3B0aW9ucy5kZWxlZ2F0ZWQgfHwgZmFsc2U7XG4gICAgICAvL3RoaXMuX2RlbGVnYXRlZENvbnRhaW5lciA9IG9wdGlvbnMuZGVsZWdhdGVkQ29udGFpbmVyIHx8IG51bGw7XG4gICAgICB0aGlzLl90YXJnZXRTZWxlY3RvciA9IG9wdGlvbnMudGFyZ2V0IHx8IG51bGw7XG4gICAgICB0aGlzLl9nZXRUYXJnZXQgPSBvcHRpb25zLmdldFRhcmdldCB8fCBudWxsOyAvL2Z1bmMsIGFyZzogdGhpcy5fJHRvZ2dsZXJCdG4sIHJldHVybjogdGFyZ2V0XG4gICAgICB0aGlzLl9ncm91cE5hbWUgPSBvcHRpb25zLmdyb3VwTmFtZSB8fCBudWxsIDtcbiAgICAgIHRoaXMuX2Nsb3NlQnRuU2VsZWN0b3IgPSBvcHRpb25zLmNsb3NlQnRuU2VsZWN0b3IgfHwgJy5qc19fZXQtY2xvc2UnO1xuICAgICAgdGhpcy5fYW5pbWF0aW9uID0gb3B0aW9ucy5hbmltYXRpb24gfHwgJ3NpbXBsZSc7ICAvLyAnbm9uZScsICdzaW1wbGUnLCAnc2xpZGUnLCAnZmFkZSdcbiAgICAgIHRoaXMuX2FuaW1hdGlvbkR1cmF0aW9uID0gb3B0aW9ucy5hbmltYXRpb25EdXJhdGlvbiB8fCA0MDA7XG4gICAgICB0aGlzLl9vcGVuQW5pbWF0aW9uID0gb3B0aW9ucy5vcGVuQW5pbWF0aW9uIHx8IHRoaXMuX2FuaW1hdGlvbjtcbiAgICAgIHRoaXMuX2Nsb3NlQW5pbWF0aW9uID0gb3B0aW9ucy5jbG9zZUFuaW1hdGlvbiB8fCB0aGlzLl9hbmltYXRpb247XG4gICAgICB0aGlzLl9zd2l0Y2hBbmltYXRpb24gPSBvcHRpb25zLnN3aXRjaEFuaW1hdGlvbiB8fCB0aGlzLl9hbmltYXRpb247XG4gICAgICB0aGlzLl9vcGVuQW5pbWF0aW9uRHVyYXRpb24gPSBvcHRpb25zLm9wZW5BbmltYXRpb25EdXJhdGlvbiAgfHwgdGhpcy5fYW5pbWF0aW9uRHVyYXRpb24gO1xuICAgICAgdGhpcy5fY2xvc2VBbmltYXRpb25EdXJhdGlvbiA9IG9wdGlvbnMuY2xvc2VBbmltYXRpb25EdXJhdGlvbiAgfHwgdGhpcy5fYW5pbWF0aW9uRHVyYXRpb24gO1xuICAgICAgdGhpcy5fc3dpdGNoQW5pbWF0aW9uRHVyYXRpb24gPSBvcHRpb25zLnN3aXRjaEFuaW1hdGlvbkR1cmF0aW9uICB8fCB0aGlzLl9hbmltYXRpb25EdXJhdGlvbiA7XG4gICAgICB0aGlzLl9vbkJlZm9yZU9wZW4gPSBvcHRpb25zLm9uQmVmb3JlT3BlbiB8fCBudWxsO1xuICAgICAgdGhpcy5fb25BZnRlck9wZW4gPSBvcHRpb25zLm9uQWZ0ZXJPcGVuIHx8IG51bGw7XG4gICAgICB0aGlzLl9vbkJlZm9yZUNsb3NlID0gb3B0aW9ucy5vbkJlZm9yZUNsb3NlIHx8IG51bGw7XG4gICAgICB0aGlzLl9vbkFmdGVyQ2xvc2UgPSBvcHRpb25zLm9uQWZ0ZXJDbG9zZSB8fCBudWxsO1xuICAgICAgdGhpcy5fb25CZWZvcmVTd2l0Y2ggPSBvcHRpb25zLm9uQmVmb3JlU3dpdGNoIHx8IG51bGw7XG4gICAgICB0aGlzLl9vbkFmdGVyU3dpdGNoID0gb3B0aW9ucy5vbkFmdGVyU3dpdGNoIHx8IG51bGw7XG4gICAgICB0aGlzLl9vdXRlckNsaWNrQ2xvc2UgPSBvcHRpb25zLm91dGVyQ2xpY2sgfHwgZmFsc2U7XG4gICAgICB0aGlzLl9kaXNhbGxvd2VkQWN0aW9ucyA9IG9wdGlvbnMuZGlzYWxsb3dlZEFjdGlvbnMgfHwgW107XG4gICAgICB0aGlzLmFjdGlvbnMgPSB7XG4gICAgICAgIG9wZW46ICdvcGVuJyxcbiAgICAgICAgY2xvc2U6ICdjbG9zZScsXG4gICAgICAgIHN3aXRjaDogJ3N3aXRjaCdcbiAgICAgIH07XG4gICAgICB0aGlzLl9pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgdGhpcy5faXNXb3JraW5nID0gZmFsc2U7XG4gICAgICB0aGlzLl9jbGlja0FjdGlvblRpbWVvdXQgPSBudWxsO1xuICAgICAgdGhpcy51c2VyQ2xhc3NOYW1lID0gb3B0aW9ucy5jbGFzc05hbWUgfHwge307XG4gICAgICB0aGlzLmNsYXNzTmFtZSA9IHtcbiAgICAgICAgaW5pdGlhbGl6ZWRUb2dnbGVyOiAnanNfX2V0LXRvZ2dsZXItaW5pdGlhbGl6ZWQnLFxuICAgICAgICBpbml0aWFsaXplZFRhcmdldDogJ2pzX19ldC10YXJnZXQtaW5pdGlhbGl6ZWQnLFxuICAgICAgICBhY3RpdmU6ICdldC1hY3RpdmUnXG4gICAgICB9O1xuICAgICAgdGhpcy5ldmVudHMgPSB7XG4gICAgICAgIGJlZm9yZU9wZW46ICdqRWxlbWVudFRvZ2dsZXI6YmVmb3JlT3BlbicsXG4gICAgICAgIGFmdGVyT3BlbjogJ2pFbGVtZW50VG9nZ2xlcjphZnRlck9wZW4nLFxuICAgICAgICBiZWZvcmVDbG9zZTogJ2pFbGVtZW50VG9nZ2xlcjpiZWZvcmVDbG9zZScsXG4gICAgICAgIGFmdGVyQ2xvc2U6ICdqRWxlbWVudFRvZ2dsZXI6YWZ0ZXJDbG9zZScsXG4gICAgICAgIGJlZm9yZVN3aXRjaDogJ2pFbGVtZW50VG9nZ2xlcjpiZWZvcmVTd2l0Y2gnLFxuICAgICAgICBhZnRlclN3aXRjaDogJ2pFbGVtZW50VG9nZ2xlcjphZnRlclN3aXRjaCcsXG4gICAgICAgIG9wZW5Hcm91cDogJ2pFbGVtZW50VG9nZ2xlcjpvcGVuR3JvdXAnLFxuICAgICAgICBjbG9zZUdyb3VwOiAnakVsZW1lbnRUb2dnbGVyOmNsb3NlR3JvdXAnLFxuXG4gICAgICAgIC8qbWFuYWdpbmcgZXZlbnRzKi9cbiAgICAgICAgb3BlbjogJ2pFbGVtZW50VG9nZ2xlcjpvcGVuJyxcbiAgICAgICAgY2xvc2U6ICdqRWxlbWVudFRvZ2dsZXI6Y2xvc2UnLFxuICAgICAgICBzdGFydDogJ2pFbGVtZW50VG9nZ2xlcjpzdGFydCcsXG4gICAgICAgIHN0b3A6ICdqRWxlbWVudFRvZ2dsZXI6c3RvcCdcbiAgICAgIH07XG5cbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAkLmV4dGVuZCh0aGlzLmNsYXNzTmFtZSwgdGhpcy51c2VyQ2xhc3NOYW1lKTtcbiAgICAgIHRoaXMuYmluZEVsZW1lbnRzKCk7XG5cbiAgICAgIGlmICgoIXRoaXMuXyR0YXJnZXQgfHwgIXRoaXMuXyR0YXJnZXQubGVuZ3RoKSAmJiB0aGlzLl9hbmltYXRpb24gIT09ICdub25lJykgcmV0dXJuOyAvL2lmIHN0aWxsIG5vIHRhcmdldCBzdG9wIGluaXQgZnVuY1xuXG4gICAgICB0aGlzLmJpbmRIYW5kbGVycygpO1xuICAgICAgdGhpcy5hdHRhY2hIYW5kbGVycygpO1xuXG4gICAgICBpZiAodGhpcy5fYW5pbWF0aW9uICE9PSAnbm9uZScpIHsgLy8g0LLQvtC30LzQvtC20L3QviDQu9C40YjQvdC10LUg0YPRgdC70L7QstC40LVcbiAgICAgICAgdGhpcy5fJHRhcmdldC5oaWRlKCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl8kdG9nZ2xlckJ0bi5oYXNDbGFzcyh0aGlzLmNsYXNzTmFtZS5hY3RpdmUpIHx8IHRoaXMuXyR0b2dnbGVyQnRuLmlzKCc6Y2hlY2tlZCcpKSB7XG4gICAgICAgIHRoaXMuc2hvd0VsKCdzaW1wbGUnKTtcbiAgICAgICAgdGhpcy5faXNBY3RpdmUgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9pc1dvcmtpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5faXNJbml0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGJpbmRFbGVtZW50cygpIHtcbiAgICAgIHRoaXMuXyR0b2dnbGVyQnRuID0gJCh0aGlzLl90b2dnbGVyQnRuKTtcbiAgICAgIHRoaXMuXyRsaXN0ZW5lZEVsID0gJCh0aGlzLl9saXN0ZW5lZEVsKTtcbiAgICAgIHRoaXMuX2dyb3VwTmFtZSA9IHRoaXMuX2dyb3VwTmFtZSB8fCB0aGlzLl8kdG9nZ2xlckJ0bi5hdHRyKCdkYXRhLWV0LWdyb3VwJyk7XG5cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5fZ2V0VGFyZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuXyR0YXJnZXQgPSAkKHRoaXMuX2dldFRhcmdldCh0aGlzLl8kdG9nZ2xlckJ0biwgdGhpcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fdGFyZ2V0U2VsZWN0b3IgPSB0aGlzLl90YXJnZXRTZWxlY3RvciB8fCB0aGlzLl8kdG9nZ2xlckJ0bi5hdHRyKCdkYXRhLWV0LXRhcmdldCcpIHx8IHRoaXMuXyR0b2dnbGVyQnRuLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgdGhpcy5fJHRhcmdldCA9ICQodGhpcy5fdGFyZ2V0U2VsZWN0b3IpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fJHRvZ2dsZXJCdG4uaXMoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpKSB7XG4gICAgICAgIHRoaXMuaXNDaGVja2JveCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYmluZEhhbmRsZXJzKCkge1xuICAgICAgbGV0IG1heEFuaW1hdGlvbkR1cmF0aW9uID0gdGhpcy5fb3BlbkFuaW1hdGlvbkR1cmF0aW9uID49IHRoaXMuX2Nsb3NlQW5pbWF0aW9uRHVyYXRpb24gPyB0aGlzLl9vcGVuQW5pbWF0aW9uRHVyYXRpb246IHRoaXMuX2Nsb3NlQW5pbWF0aW9uRHVyYXRpb247XG5cbiAgICAgIHRoaXMuX2RlYm91bmNlZFRvZ2dsZXJIYW5kbGVyID0gdGhpcy5kZWJvdW5jZSh0aGlzLnRvZ2dsZXJIYW5kbGVyLCBtYXhBbmltYXRpb25EdXJhdGlvbiArIDUsIHRoaXMpO1xuICAgICAgdGhpcy5fdG9nZ2xlckNsaWNrSGFuZGxlciA9IHRoaXMudG9nZ2xlckNsaWNrSGFuZGxlci5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fY2xlYXJDbGlja0FjdGlvblRpbWVvdXQgPSB0aGlzLmNsZWFyQ2xpY2tBY3Rpb25UaW1lb3V0LmJpbmQodGhpcyk7XG4gICAgICB0aGlzLl9vcGVuQmxvY2tMaXN0ZW5lciA9IHRoaXMub3BlbkJsb2NrTGlzdGVuZXIuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29wZW5Hcm91cEhhbmRsZXIgPSB0aGlzLnN3aXRjaEhhbmRsZXIuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX2Nsb3NlR3JvdXBIYW5kbGVyID0gdGhpcy5jbG9zZUdyb3VwSGFuZGxlci5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fY2xvc2VCdG5MaXN0ZW5lciA9IHRoaXMuY2xvc2VCdG5MaXN0ZW5lci5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fb3V0ZXJDbGlja0xpc3RlbmVyID0gdGhpcy5vdXRlckNsaWNrTGlzdGVuZXIuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX29wZW5FbEhhbmRsZXIgPSB0aGlzLm9wZW5FbEhhbmRsZXIuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX2Nsb3NlRWxIYW5kbGVyID0gdGhpcy5jbG9zZUVsSGFuZGxlci5iaW5kKHRoaXMpO1xuICAgICAgdGhpcy5fc3RhcnRIYW5kbGVyID0gdGhpcy5zdGFydEhhbmRsZXIuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuX3N0b3BIYW5kbGVyID0gdGhpcy5zdG9wSGFuZGxlci5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIGF0dGFjaEhhbmRsZXJzKCkge1xuICAgICAgbGV0IGNsaWNrRXZlbnQgPSB0aGlzLl9jbGlja0V2ZW50ID0gdGhpcy5pc0lPUygpID8gJ3RvdWNoc3RhcnQnIDogJ2NsaWNrJztcbiAgICAgIGxldCAkbGlzdGVuZWRFbCA9IHRoaXMuXyRsaXN0ZW5lZEVsO1xuICAgICAgbGV0ICR0YXJnZXQgPSB0aGlzLl8kdGFyZ2V0O1xuXG4gICAgICBpZiAoJHRhcmdldC5sZW5ndGgpIHtcbiAgICAgICAgJHRhcmdldFxuICAgICAgICAgIC5vbignY2xpY2snLCB0aGlzLl9jbG9zZUJ0bkxpc3RlbmVyKVxuICAgICAgICAgIC5hZGRDbGFzcyh0aGlzLmNsYXNzTmFtZS5pbml0aWFsaXplZFRhcmdldCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9vdXRlckNsaWNrQ2xvc2UpIHtcbiAgICAgICAgJGxpc3RlbmVkRWwub24odGhpcy5fY2xpY2tFdmVudCwgdGhpcy5fb3V0ZXJDbGlja0xpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2dyb3VwTmFtZSkge1xuICAgICAgICAkbGlzdGVuZWRFbC5vbih7XG4gICAgICAgICAgW3RoaXMuZXZlbnRzLmJlZm9yZU9wZW5dOiB0aGlzLl9vcGVuQmxvY2tMaXN0ZW5lcixcbiAgICAgICAgICBbdGhpcy5ldmVudHMub3Blbkdyb3VwXTogdGhpcy5fb3Blbkdyb3VwSGFuZGxlcixcbiAgICAgICAgICBbdGhpcy5ldmVudHMuY2xvc2VHcm91cF06IHRoaXMuX2Nsb3NlR3JvdXBIYW5kbGVyXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl8kdG9nZ2xlckJ0blxuICAgICAgICAub24oe1xuICAgICAgICAgIFtjbGlja0V2ZW50XTogdGhpcy5fZGVib3VuY2VkVG9nZ2xlckhhbmRsZXIsXG4gICAgICAgICAgW3RoaXMuZXZlbnRzLm9wZW5dOiB0aGlzLl9vcGVuRWxIYW5kbGVyLFxuICAgICAgICAgIFt0aGlzLmV2ZW50cy5jbG9zZV06IHRoaXMuX2Nsb3NlRWxIYW5kbGVyLFxuICAgICAgICAgIFt0aGlzLmV2ZW50cy5zdG9wXTogdGhpcy5fc3RvcEhhbmRsZXJcbiAgICAgICAgfSlcbiAgICAgICAgLmFkZENsYXNzKHRoaXMuY2xhc3NOYW1lLmluaXRpYWxpemVkVG9nZ2xlcik7XG5cbiAgICAgIGlmICghdGhpcy5faXNJbml0ZWQpIHtcbiAgICAgICAgdGhpcy5fJHRvZ2dsZXJCdG5cbiAgICAgICAgICAub24oe1xuICAgICAgICAgICAgW3RoaXMuZXZlbnRzLnN0YXJ0XTogdGhpcy5fc3RhcnRIYW5kbGVyXG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGV0YWNoSGFuZGxlcnMoKSB7XG4gICAgICBsZXQgY2xpY2tFdmVudCA9IHRoaXMuX2NsaWNrRXZlbnQgPSB0aGlzLmlzSU9TKCkgPyAndG91Y2hzdGFydCcgOiAnY2xpY2snO1xuICAgICAgbGV0ICRsaXN0ZW5lZEVsID0gdGhpcy5fJGxpc3RlbmVkRWw7XG4gICAgICBsZXQgJHRhcmdldCA9IHRoaXMuXyR0YXJnZXQ7XG5cbiAgICAgIGlmICgkdGFyZ2V0Lmxlbmd0aCkge1xuICAgICAgICAkdGFyZ2V0XG4gICAgICAgICAgLm9mZignY2xpY2snLCB0aGlzLl9jbG9zZUJ0bkxpc3RlbmVyKVxuICAgICAgICAgIC5yZW1vdmVDbGFzcyh0aGlzLmNsYXNzTmFtZS5pbml0aWFsaXplZFRhcmdldCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9vdXRlckNsaWNrQ2xvc2UpIHtcbiAgICAgICAgJGxpc3RlbmVkRWwub2ZmKHRoaXMuX2NsaWNrRXZlbnQsIHRoaXMuX291dGVyQ2xpY2tMaXN0ZW5lcik7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9ncm91cE5hbWUpIHtcbiAgICAgICAgJGxpc3RlbmVkRWwub2ZmKHtcbiAgICAgICAgICBbdGhpcy5ldmVudHMuYmVmb3JlT3Blbl06IHRoaXMuX29wZW5CbG9ja0xpc3RlbmVyLFxuICAgICAgICAgIFt0aGlzLmV2ZW50cy5jbG9zZUdyb3VwXTogdGhpcy5fY2xvc2VHcm91cEhhbmRsZXJcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuXyR0b2dnbGVyQnRuXG4gICAgICAgIC5vZmYoe1xuICAgICAgICAgIFtjbGlja0V2ZW50XTogdGhpcy5fZGVib3VuY2VkVG9nZ2xlckhhbmRsZXIsXG4gICAgICAgICAgW3RoaXMuZXZlbnRzLm9wZW5dOiB0aGlzLl9vcGVuRWxIYW5kbGVyLFxuICAgICAgICAgIFt0aGlzLmV2ZW50cy5jbG9zZV06IHRoaXMuX2Nsb3NlRWxIYW5kbGVyLFxuICAgICAgICAgIFt0aGlzLmV2ZW50cy5zdG9wXTogdGhpcy5fc3RvcEhhbmRsZXJcbiAgICAgICAgfSlcbiAgICAgICAgLnJlbW92ZUNsYXNzKHRoaXMuY2xhc3NOYW1lLmluaXRpYWxpemVkVG9nZ2xlcik7XG4gICAgfVxuXG4gICAgc3RhcnQoKSB7XG4gICAgICBpZiAodGhpcy5faXNXb3JraW5nKSByZXR1cm47XG5cbiAgICAgIHRoaXMuYXR0YWNoSGFuZGxlcnMoKTtcbiAgICAgIHRoaXMuX2lzV29ya2luZyA9IHRydWU7XG4gICAgfVxuXG4gICAgc3RvcCgpIHtcbiAgICAgIGlmICghdGhpcy5faXNXb3JraW5nKSByZXR1cm47XG5cbiAgICAgIHRoaXMuZGV0YWNoSGFuZGxlcnMoKTtcbiAgICAgIHRoaXMuX2lzV29ya2luZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHN0YXJ0SGFuZGxlcihlKSB7XG4gICAgICBsZXQgZWwgPSBlLnRhcmdldDtcblxuICAgICAgaWYgKCF0aGlzLmlzU2FtZVRvZ2dsZXIoZWwpKSByZXR1cm47XG5cbiAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICB9XG5cbiAgICBzdG9wSGFuZGxlcihlKSB7XG4gICAgICBsZXQgZWwgPSBlLnRhcmdldDtcblxuICAgICAgaWYgKCF0aGlzLmlzU2FtZVRvZ2dsZXIoZWwpKSByZXR1cm47XG5cbiAgICAgIHRoaXMuc3RvcCgpO1xuICAgIH1cblxuICAgIGlzU2FtZVRvZ2dsZXIoZWwpIHtcbiAgICAgIC8vbGV0ICRlbCA9ICQoZWwpO1xuICAgICAgLy9sZXQgJGNsb3Nlc3RUb2dnbGVyQnRuID0gJGVsLmNsb3Nlc3QoJy4nICsgdGhpcy5jbGFzc05hbWUuaW5pdGlhbGl6ZWRUb2dnbGVyKTtcblxuICAgICAgcmV0dXJuIHRoaXMuXyR0b2dnbGVyQnRuLmlzKGVsKTtcbiAgICB9XG5cbiAgICB0b2dnbGVySGFuZGxlcihlKSB7XG4gICAgICBsZXQgJGVsID0gJChlLnRhcmdldCk7XG4gICAgICBsZXQgaXNUYXJnZXQgPSAhISRlbC5jbG9zZXN0KHRoaXMuXyR0YXJnZXQpLmxlbmd0aCAmJiAhJGVsLmlzKHRoaXMuXyR0b2dnbGVyQnRuKTtcbiAgICAgIGxldCBzY3JvbGxFdmVudCA9IHRoaXMuaXNJT1MoKSA/ICd0b3VjaG1vdmUnIDogJ3Njcm9sbCc7XG5cbiAgICAgIGlmICghdGhpcy5pc0hpZGRlbih0aGlzLl8kdGFyZ2V0KSAmJiB0aGlzLl9hbmltYXRpb24gIT09ICdub25lJykgeyAvL9Cy0L7Qt9C80L7QttC90L4g0YHRgtC+0LjRgiDRgtCw0LrQttC1INGD0LTQsNC70LjRgtGMXG4gICAgICAgIHRoaXMuX2lzQWN0aXZlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2lzQWN0aXZlICYmIGlzVGFyZ2V0KSByZXR1cm47XG5cbiAgICAgIGlmICghdGhpcy5pc0lPUygpICYmICF0aGlzLmlzQ2hlY2tib3gpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNsZWFyQ2xpY2tBY3Rpb25UaW1lb3V0KCk7XG4gICAgICB0aGlzLl9jbGlja0FjdGlvblRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy50b2dnbGVyQ2xpY2tIYW5kbGVyKCk7XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZihzY3JvbGxFdmVudCwgdGhpcy5fY2xlYXJDbGlja0FjdGlvblRpbWVvdXQpO1xuICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgMjAwKTtcblxuICAgICAgJChkb2N1bWVudCkub25lKHNjcm9sbEV2ZW50LCB0aGlzLl9jbGVhckNsaWNrQWN0aW9uVGltZW91dCk7XG4gICAgfVxuXG4gICAgY2xlYXJDbGlja0FjdGlvblRpbWVvdXQoKSB7XG4gICAgICBpZiAodGhpcy5fY2xpY2tBY3Rpb25UaW1lb3V0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9jbGlja0FjdGlvblRpbWVvdXQpO1xuICAgICAgICB0aGlzLl9jbGlja0FjdGlvblRpbWVvdXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRvZ2dsZXJDbGlja0hhbmRsZXIoKSB7XG4gICAgICBpZiAodGhpcy5faXNBY3RpdmUpIHtcbiAgICAgICAgdGhpcy5oaWRlRWwoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2hvd0VsKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb3BlbkVsSGFuZGxlcihlLCBhbmltYXRpb24sIGR1cmF0aW9uLCBjYWxsYmFjaykge1xuICAgICAgbGV0IGVsID0gZS50YXJnZXQ7XG5cbiAgICAgIGlmICghdGhpcy5pc1NhbWVUb2dnbGVyKGVsKSkgcmV0dXJuO1xuXG4gICAgICB0aGlzLnNob3dFbChhbmltYXRpb24sIGR1cmF0aW9uLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgY2xvc2VFbEhhbmRsZXIoZSwgYW5pbWF0aW9uLCBkdXJhdGlvbiwgY2FsbGJhY2spIHtcbiAgICAgIGxldCBlbCA9IGUudGFyZ2V0O1xuXG4gICAgICBpZiAoIXRoaXMuaXNTYW1lVG9nZ2xlcihlbCkpIHJldHVybjtcblxuICAgICAgdGhpcy5oaWRlRWwoYW5pbWF0aW9uLCBkdXJhdGlvbiwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIG9wZW5CbG9ja0xpc3RlbmVyKGUsIGNvbnRyb2xsZXIpIHtcbiAgICAgIGlmICghdGhpcy5faXNBY3RpdmUgfHxcbiAgICAgICAgY29udHJvbGxlci5fJHRvZ2dsZXJCdG4uaXModGhpcy5fJHRvZ2dsZXJCdG4pIHx8XG4gICAgICAgIGNvbnRyb2xsZXIuX2dyb3VwTmFtZSAhPT0gdGhpcy5fZ3JvdXBOYW1lIHx8XG4gICAgICAgIGNvbnRyb2xsZXIuX2dyb3VwTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zd2l0Y2hFbCgpO1xuICAgIH1cblxuICAgIHN3aXRjaEhhbmRsZXIoZSwgZ3JvdXBOYW1lKSB7XG4gICAgICBpZiAoZ3JvdXBOYW1lICE9PSB0aGlzLl9ncm91cE5hbWUgfHxcbiAgICAgICAgZ3JvdXBOYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN3aXRjaEVsKCk7XG4gICAgfVxuXG4gICAgY2xvc2VHcm91cEhhbmRsZXIoZSwgZ3JvdXBOYW1lKSB7XG4gICAgICBpZiAoIXRoaXMuX2lzQWN0aXZlIHx8XG4gICAgICAgIGdyb3VwTmFtZSAhPT0gdGhpcy5fZ3JvdXBOYW1lIHx8XG4gICAgICAgIGdyb3VwTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5oaWRlRWwoKTtcbiAgICB9XG5cbiAgICBvdXRlckNsaWNrTGlzdGVuZXIoZSkge1xuICAgICAgLy9jb25zb2xlLmRpcih0aGlzKTtcbiAgICAgIGlmICghdGhpcy5faXNBY3RpdmUpIHJldHVybjtcblxuICAgICAgbGV0ICRlbCA9ICQoZS50YXJnZXQpO1xuICAgICAgbGV0IGlzT3V0ZXIgPSAhJGVsLmNsb3Nlc3QodGhpcy5fJHRhcmdldC5hZGQodGhpcy5fJHRvZ2dsZXJCdG4pKS5sZW5ndGg7XG5cbiAgICAgIGlmICghaXNPdXRlcikgcmV0dXJuO1xuXG4gICAgICB0aGlzLmhpZGVFbCgpO1xuICAgIH1cblxuICAgIGNsb3NlQnRuTGlzdGVuZXIoZSkge1xuICAgICAgbGV0ICRlbCA9ICQoZS50YXJnZXQpO1xuICAgICAgbGV0ICRjbG9zZUJ0biA9ICRlbC5jbG9zZXN0KHRoaXMuX2Nsb3NlQnRuU2VsZWN0b3IpO1xuXG4gICAgICBpZiAoISRjbG9zZUJ0bi5sZW5ndGgpIHJldHVybjtcblxuICAgICAgbGV0ICRjdXJyVGFyZ2V0ID0gJGNsb3NlQnRuLmNsb3Nlc3QoJy4nICsgdGhpcy5jbGFzc05hbWUuaW5pdGlhbGl6ZWRUYXJnZXQpO1xuXG4gICAgICBpZiAoISRjdXJyVGFyZ2V0LmlzKHRoaXMuXyR0YXJnZXQpKSByZXR1cm47XG5cbiAgICAgIHRoaXMuaGlkZUVsKCk7XG4gICAgfVxuXG4gICAgc2hvd0VsKGFuaW1hdGlvbiwgZHVyYXRpb24sIGNhbGxiYWNrKSB7XG4gICAgICBpZiAofnRoaXMuX2Rpc2FsbG93ZWRBY3Rpb25zLmluZGV4T2YodGhpcy5hY3Rpb25zLm9wZW4pKSByZXR1cm47XG5cbiAgICAgIGxldCAkdGFyZ2V0ID0gdGhpcy5fJHRhcmdldDtcbiAgICAgIGNhbGxiYWNrID0gdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gY2FsbGJhY2suYmluZCh0aGlzKSA6IHRoaXMuc2hvd0NhbGxiYWNrLmJpbmQodGhpcyk7XG4gICAgICBkdXJhdGlvbiA9IGR1cmF0aW9uIHx8IHRoaXMuX29wZW5BbmltYXRpb25EdXJhdGlvbjtcbiAgICAgIGFuaW1hdGlvbiA9IGFuaW1hdGlvbiB8fCB0aGlzLl9vcGVuQW5pbWF0aW9uO1xuXG4gICAgICBpZiAodGhpcy5fJHRvZ2dsZXJCdG4uaXMoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpKSB7XG4gICAgICAgIHRoaXMuXyR0b2dnbGVyQnRuLmF0dHIoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuXyR0b2dnbGVyQnRuLmFkZENsYXNzKHRoaXMuY2xhc3NOYW1lLmFjdGl2ZSk7XG4gICAgICB9XG4gICAgICAkdGFyZ2V0LmFkZENsYXNzKHRoaXMuY2xhc3NOYW1lLmFjdGl2ZSk7XG4gICAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XG5cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5fb25CZWZvcmVPcGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX29uQmVmb3JlT3Blbih0aGlzKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fJHRvZ2dsZXJCdG4udHJpZ2dlcih0aGlzLmV2ZW50cy5iZWZvcmVPcGVuLCBbdGhpc10pO1xuXG4gICAgICBzd2l0Y2ggKGFuaW1hdGlvbikge1xuICAgICAgICBjYXNlICdub25lJzpcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzaW1wbGUnOlxuICAgICAgICAgICR0YXJnZXQuc2hvdygpO1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NsaWRlJzpcbiAgICAgICAgICBpZiAoISR0YXJnZXQubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkdGFyZ2V0LnNsaWRlRG93bihkdXJhdGlvbiwgY2FsbGJhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmFkZSc6XG4gICAgICAgICAgaWYgKCEkdGFyZ2V0Lmxlbmd0aCkge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHRhcmdldC5mYWRlSW4oZHVyYXRpb24sIGNhbGxiYWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2hvd0NhbGxiYWNrKCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLl9vbkFmdGVyT3BlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9vbkFmdGVyT3Blbih0aGlzKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fJHRvZ2dsZXJCdG4udHJpZ2dlcih0aGlzLmV2ZW50cy5hZnRlck9wZW4sIFt0aGlzXSk7XG5cbiAgICAgIGlmICh0aGlzLl9vdXRlckNsaWNrQ2xvc2UpIHtcbiAgICAgICAgdGhpcy5fJGxpc3RlbmVkRWwub24odGhpcy5fY2xpY2tFdmVudCwgdGhpcy5vdXRlckNsaWNrTGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGhpZGVFbChhbmltYXRpb24sIGR1cmF0aW9uLCBjYWxsYmFjaykge1xuICAgICAgaWYgKH50aGlzLl9kaXNhbGxvd2VkQWN0aW9ucy5pbmRleE9mKHRoaXMuYWN0aW9ucy5jbG9zZSkpIHJldHVybjtcblxuICAgICAgbGV0ICR0YXJnZXQgPSB0aGlzLl8kdGFyZ2V0O1xuICAgICAgY2FsbGJhY2sgPSB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjay5iaW5kKHRoaXMpIDogdGhpcy5oaWRlQ2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICAgIGR1cmF0aW9uID0gZHVyYXRpb24gfHwgdGhpcy5fY2xvc2VBbmltYXRpb25EdXJhdGlvbjtcbiAgICAgIGFuaW1hdGlvbiA9IGFuaW1hdGlvbiB8fCB0aGlzLl9jbG9zZUFuaW1hdGlvbjtcblxuICAgICAgaWYgKHRoaXMuXyR0b2dnbGVyQnRuLmlzKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSkge1xuICAgICAgICB0aGlzLl8kdG9nZ2xlckJ0bi5hdHRyKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fJHRvZ2dsZXJCdG4ucmVtb3ZlQ2xhc3ModGhpcy5jbGFzc05hbWUuYWN0aXZlKTtcbiAgICAgIH1cbiAgICAgICR0YXJnZXQucmVtb3ZlQ2xhc3ModGhpcy5jbGFzc05hbWUuYWN0aXZlKTtcbiAgICAgIHRoaXMuX2lzQWN0aXZlID0gZmFsc2U7XG5cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5fb25CZWZvcmVDbG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9vbkJlZm9yZUNsb3NlKHRoaXMpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl8kdG9nZ2xlckJ0bi50cmlnZ2VyKHRoaXMuZXZlbnRzLmJlZm9yZUNsb3NlLCBbdGhpc10pO1xuXG4gICAgICBzd2l0Y2ggKGFuaW1hdGlvbikge1xuICAgICAgICBjYXNlICdub25lJzpcbiAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzaW1wbGUnOlxuICAgICAgICAgICR0YXJnZXQuaGlkZSgpO1xuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NsaWRlJzpcbiAgICAgICAgICAkdGFyZ2V0LnNsaWRlVXAoZHVyYXRpb24sIGNhbGxiYWNrKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmFkZSc6XG4gICAgICAgICAgJHRhcmdldC5mYWRlT3V0KGR1cmF0aW9uLCBjYWxsYmFjayk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaGlkZUNhbGxiYWNrKCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLl9vbkFmdGVyQ2xvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5fb25BZnRlckNsb3NlKHRoaXMpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl8kdG9nZ2xlckJ0bi50cmlnZ2VyKHRoaXMuZXZlbnRzLmFmdGVyQ2xvc2UsIFt0aGlzXSk7XG5cbiAgICAgIGlmICh0aGlzLl9vdXRlckNsaWNrQ2xvc2UpIHtcbiAgICAgICAgdGhpcy5fJGxpc3RlbmVkRWwub2ZmKHRoaXMuX2NsaWNrRXZlbnQsIHRoaXMub3V0ZXJDbGlja0xpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzd2l0Y2hFbChhbmltYXRpb24sIGR1cmF0aW9uLCBjYWxsYmFjaykge1xuICAgICAgaWYgKH50aGlzLl9kaXNhbGxvd2VkQWN0aW9ucy5pbmRleE9mKHRoaXMuYWN0aW9ucy5zd2l0Y2gpKSByZXR1cm47XG5cbiAgICAgIGxldCAkdGFyZ2V0ID0gdGhpcy5fJHRhcmdldDtcbiAgICAgIGNhbGxiYWNrID0gdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gY2FsbGJhY2suYmluZCh0aGlzKSA6IHRoaXMuc3dpdGNoQ2FsbGJhY2suYmluZCh0aGlzKTtcbiAgICAgIGR1cmF0aW9uID0gZHVyYXRpb24gfHwgdGhpcy5fc3dpdGNoQW5pbWF0aW9uRHVyYXRpb247XG4gICAgICBhbmltYXRpb24gPSBhbmltYXRpb24gfHwgdGhpcy5fc3dpdGNoQW5pbWF0aW9uO1xuXG4gICAgICBpZiAodGhpcy5fJHRvZ2dsZXJCdG4uaXMoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpKSB7XG4gICAgICAgIHRoaXMuXyR0b2dnbGVyQnRuLmF0dHIoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl8kdG9nZ2xlckJ0bi5yZW1vdmVDbGFzcyh0aGlzLmNsYXNzTmFtZS5hY3RpdmUpO1xuICAgICAgfVxuICAgICAgJHRhcmdldC5yZW1vdmVDbGFzcyh0aGlzLmNsYXNzTmFtZS5hY3RpdmUpO1xuICAgICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcblxuICAgICAgaWYgKHR5cGVvZiB0aGlzLl9vbkJlZm9yZVN3aXRjaCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9vbkJlZm9yZVN3aXRjaCh0aGlzKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fJHRvZ2dsZXJCdG4udHJpZ2dlcih0aGlzLmV2ZW50cy5iZWZvcmVTd2l0Y2gsIFt0aGlzXSk7XG5cbiAgICAgIHN3aXRjaCAoYW5pbWF0aW9uKSB7XG4gICAgICAgIGNhc2UgJ25vbmUnOlxuICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3NpbXBsZSc6XG4gICAgICAgICAgJHRhcmdldC5oaWRlKCk7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc2xpZGUnOlxuICAgICAgICAgICR0YXJnZXQuc2xpZGVVcChkdXJhdGlvbiwgY2FsbGJhY2spO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmYWRlJzpcbiAgICAgICAgICAkdGFyZ2V0LmZhZGVPdXQoZHVyYXRpb24sIGNhbGxiYWNrKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzd2l0Y2hDYWxsYmFjaygpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5fb25BZnRlckNsb3NlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX29uQWZ0ZXJTd2l0Y2godGhpcyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuXyR0b2dnbGVyQnRuLnRyaWdnZXIodGhpcy5ldmVudHMuYWZ0ZXJTd2l0Y2gsIFt0aGlzXSk7XG5cbiAgICAgIGlmICh0aGlzLl9vdXRlckNsaWNrQ2xvc2UpIHtcbiAgICAgICAgdGhpcy5fJGxpc3RlbmVkRWwub2ZmKHRoaXMuX2NsaWNrRXZlbnQsIHRoaXMub3V0ZXJDbGlja0xpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpc0lPUygpIHtcbiAgICAgIHJldHVybiAvaVBhZHxpUGhvbmV8aVBvZC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiAhd2luZG93Lk1TU3RyZWFtO1xuICAgIH1cblxuICAgIGlzSGlkZGVuKGVsKSB7XG4gICAgICBsZXQgJGVsID0gJChlbCk7XG5cbiAgICAgIHJldHVybiAkZWwuaXMoJzpoaWRkZW4nKSB8fFxuICAgICAgICAkZWwuY3NzKCd2aXNpYmlsaXR5JykgPT09ICdoaWRkZW4nIHx8XG4gICAgICAgICskZWwuY3NzKCdvcGFjaXR5JykgPT09IDA7XG4gICAgfVxuXG4gICAgZ2V0U2VsZigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlYm91bmNlcyBhIGZ1bmN0aW9uLiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBjYWxscyB0aGUgb3JpZ2luYWwgZm4gZnVuY3Rpb24gb25seSBpZiBubyBpbnZvY2F0aW9ucyBoYXZlIGJlZW4gbWFkZVxuICAgICAqIHdpdGhpbiB0aGUgbGFzdCBxdWlldE1pbGxpcyBtaWxsaXNlY29uZHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcXVpZXRNaWxsaXMgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB3YWl0IGJlZm9yZSBpbnZva2luZyBmblxuICAgICAqIEBwYXJhbSBmbiBmdW5jdGlvbiB0byBiZSBkZWJvdW5jZWRcbiAgICAgKiBAcGFyYW0gYmluZGVkVGhpcyBvYmplY3QgdG8gYmUgdXNlZCBhcyB0aGlzIHJlZmVyZW5jZSB3aXRoaW4gZm5cbiAgICAgKiBAcmV0dXJuIGRlYm91bmNlZCB2ZXJzaW9uIG9mIGZuXG4gICAgICovXG4gICAgZGVib3VuY2UoZm4sIHF1aWV0TWlsbGlzLCBiaW5kZWRUaGlzKSB7XG4gICAgICBsZXQgaXNXYWl0aW5nID0gZmFsc2U7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gZnVuYygpIHtcbiAgICAgICAgaWYgKGlzV2FpdGluZykgcmV0dXJuO1xuXG4gICAgICAgIGlmIChiaW5kZWRUaGlzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBiaW5kZWRUaGlzID0gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGZuLmFwcGx5KGJpbmRlZFRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGlzV2FpdGluZyA9IHRydWU7XG5cbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaXNXYWl0aW5nID0gZmFsc2U7XG4gICAgICAgIH0sIHF1aWV0TWlsbGlzKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgICB0aGlzLmRldGFjaEhhbmRsZXJzKCk7XG5cbiAgICAgIGZvciAobGV0IGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgIHRoaXNbJ18nICsga2V5XSA9IG9wdGlvbnNba2V5XTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuICB9XG5cbiAgY2xhc3MgRGVsZWdhdGVkVG9nZ2xlckNvbnRyb2xsZXIge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgIHRoaXMuXyRkZWxlZ2F0ZWRDb250YWluZXIgPSBvcHRpb25zLiRkZWxlZ2F0ZWRDb250YWluZXI7XG4gICAgICB0aGlzLl90b2dnbGVyQnRuID0gb3B0aW9ucy50b2dnbGVyQnRuO1xuICAgICAgdGhpcy5fakVsZW1lbnRUb2dnbGVyT3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICB0aGlzLl9qRWxlbWVudFRvZ2dsZXJPcHRpb25zLnRvZ2dsZXJCdG4gPSBudWxsO1xuICAgICAgdGhpcy5fY2xpY2tIYW5kbGVyID0gdGhpcy5jbGlja0hhbmRsZXIuYmluZCh0aGlzKTtcbiAgICAgIHRoaXMuXyRkZWxlZ2F0ZWRDb250YWluZXIub24oJ2NsaWNrJywgdGhpcy5fY2xpY2tIYW5kbGVyKTtcbiAgICB9XG5cbiAgICBjbGlja0hhbmRsZXIoZSkge1xuICAgICAgbGV0IHRhcmdldCA9IGUudGFyZ2V0O1xuICAgICAgbGV0IHRvZ2dsZXJCdG4gPSB0YXJnZXQuY2xvc2VzdCh0aGlzLl90b2dnbGVyQnRuKTtcblxuICAgICAgaWYgKCF0b2dnbGVyQnRuIHx8XG4gICAgICAgICh0b2dnbGVyQnRuLmpFbGVtZW50VG9nZ2xlciAmJiB0b2dnbGVyQnRuLmpFbGVtZW50VG9nZ2xlciBpbnN0YW5jZW9mIEpFbGVtZW50VG9nZ2xlckNvbnRyb2xsZXIpXG4gICAgICApIHJldHVybjtcblxuICAgICAgJCh0b2dnbGVyQnRuKS5qRWxlbWVudFRvZ2dsZXIodGhpcy5fakVsZW1lbnRUb2dnbGVyT3B0aW9ucyk7XG4gICAgfVxuICB9XG5cblxuXG4gICQuZm4uakVsZW1lbnRUb2dnbGVyID0gZnVuY3Rpb24gKCkge1xuICAgIGxldCBfID0gdGhpcztcbiAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50c1swXSB8fCB7fTtcbiAgICBsZXQgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IF8ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuZGVsZWdhdGVkKSB7XG4gICAgICAgICAgaWYgKCEkLmlzQXJyYXkoX1tpXS5kZWxlZ2F0ZWRUb2dnbGVyKSkge1xuICAgICAgICAgICAgX1tpXS5kZWxlZ2F0ZWRUb2dnbGVyID0gW107XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb3B0aW9ucy4kZGVsZWdhdGVkQ29udGFpbmVyID0gJChfW2ldKTtcbiAgICAgICAgICBfW2ldLmRlbGVnYXRlZFRvZ2dsZXIucHVzaChuZXcgRGVsZWdhdGVkVG9nZ2xlckNvbnRyb2xsZXIob3B0aW9ucykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9wdGlvbnMudG9nZ2xlckJ0biA9IF9baV07XG4gICAgICAgICAgX1tpXS5qRWxlbWVudFRvZ2dsZXIgPSBuZXcgSkVsZW1lbnRUb2dnbGVyQ29udHJvbGxlcihvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vb3B0aW9ucy50b2dnbGVyQnRuID0gX1tpXTtcbiAgICAgICAgLy9fW2ldLmpFbGVtZW50VG9nZ2xlciA9IG5ldyBKRWxlbWVudFRvZ2dsZXJDb250cm9sbGVyKG9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IF9baV0uakVsZW1lbnRUb2dnbGVyW29wdGlvbnNdLmNhbGwoX1tpXS5qRWxlbWVudFRvZ2dsZXIsIGFyZ3MpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ICE9PSAndW5kZWZpbmVkJykgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gXztcbiAgfTtcbn0pO1xuIl19
