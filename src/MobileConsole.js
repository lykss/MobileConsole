;(function() {
	
	"use strict";
	
	function MobileConsole() {
		var that = this;
		
		that.options = {
			"debugWrapperID": "_console_wrapper",
			"debugWindowID": "_console",
			"debugHeaderID": "_console_header",
			"debugWindow": null,
			"debugWrapper": null,
			"debugHeader": null,
			"debugInfoIdx": 0,
			"positionQueue": [],
			"toolbar": null,
			"isScrollToBottom": true
		}
		
		if (that == window) {
			return new MobileConsole();
		}
		
		that._init();
	}
	
	MobileConsole.prototype = {
		
		_init: function() {
			var that = this;
			
			that._buildDebugComponent();
			
			that._bindDragEvent();
			that._bindToggleWindowEvent();
			that._bindToggleScrollModelEvent();
		},
		
		_hasExistedDebugWindow: function() {
			var that = this;
			var debugWindowID = that.options.debugWindowID;
			var debugWindow = document.getElementById(debugWindowID);
			
			return !!debugWindow;
		},
		
		_createDebugWrapper: function() {
			var that = this;
			var debugWrapperID = that.options.debugWrapperID;
			var debugWrapper = document.getElementById(debugWrapperID);
			
			if (debugWrapper) {
				return false;
			}
			
			debugWrapper = document.createElement("div");
			debugWrapper.id = debugWrapperID;
			debugWrapper.style.cssText = ';position: fixed;left: 0;top: 0;z-index: 9999;';
			
			document.body.appendChild(debugWrapper);
			
			that.options.debugWrapper = debugWrapper;
		},
		
		_getDebugWrapper: function() {
			var that = this;
			var debugWrapper = that.options.debugWrapper;
			
			if (!debugWrapper) {
				that._createDebugWrapper();
				debugWrapper = that.options.debugWrapper;
			}
			
			return debugWrapper;
		},
		
		_createDebugHeader: function() {
			var that = this;
			var debugHeaderID = that.options.debugHeaderID;
			var debugHeader = document.getElementById(debugHeaderID);
			
			if (debugHeader) {
				return false;
			}
			
			debugHeader = document.createElement("header");
			debugHeader.id = debugHeaderID;
			debugHeader.style.cssText = ';margin: 0;height: 30px;color: #fff;text-align: center;line-height: 30px;vertical-align: middle;background: #0f0;';
			
			debugHeader.innerText = "console";
			
			that.options.debugHeader = debugHeader;
		},
		
		_getDebugHeader: function() {
			var that = this;
			var debugHeader = that.options.debugHeader;
			
			if (!debugHeader) {
				that._createDebugHeader();
				debugHeader = that.options.debugHeader;
			}
			
			return debugHeader;
		},
		
		_createDebugWindow: function() {
			var that = this;
			var debugWindowID = that.options.debugWindowID;
			var debugWindow = document.createElement("ul");
			
			debugWindow.id = debugWindowID;
			debugWindow.style.cssText = ';margin: 0px;padding: 0;max-height: 50vh;max-width: 300px;overflow-y: auto;background: #a5a5a5;';
			
			that._setDebugWindow(debugWindow);
		},
		
		_setDebugWindow: function(debugWindow) {
			var that = this;
			
			that.options.debugWindow = debugWindow;
		},
		
		_getDebugWindow: function() {
			var that = this;
			var debugWindow = that.options.debugWindow;
			
			if (!debugWindow) {
				that._createDebugWindow();
				debugWindow = that.options.debugWindow;
			}
			
			return debugWindow;
		},
		
		_createToolbar: function() {
			var that = this;
			var toolbar = document.createElement("span");
			
			toolbar.style.cssText = ";display: inline-block;padding-left: 4px;width: 40px;color: red;";
			toolbar.innerText = "↓";
			
			that.options.toolbar = toolbar;
		},
		
		_getToolbar: function() {
			var that = this;
			var toolbar = that.options.toolbar;
			
			if (!toolbar) {
				that._createToolbar();
				toolbar = that.options.toolbar;
			}
			
			return toolbar;
		},
		
		_buildDebugComponent: function() {
			var that = this;
			
			if (!that._hasExistedDebugWindow()) {
				that._createDebugWindow();
			}
			
			that._createDebugHeader();
			that._createDebugWrapper();
			
			var wrapper = that._getDebugWrapper();
			var header = that._getDebugHeader();
			var container = that._getDebugWindow();
			var toolbar = that._getToolbar();
			
			header.appendChild(toolbar);
			
			wrapper.appendChild(header);
			wrapper.appendChild(container);
			
			that._bindPreventParentScrollEvent(container);
			
			document.body.appendChild(wrapper);
		},
		
		_createDebugInfoItem: function(debugInfo, styles) {
			var that = this;
			var debugInfoItem = document.createElement("li");
			var debugWindow = that._getDebugWindow();
			
			debugInfoItem.style.cssText = styles;
			debugInfoItem.innerText = debugInfo;
			
			debugWindow.appendChild(debugInfoItem);
		},
		
		_addPointPosition: function(pos) {
			var that = this;
			
			if (!Array.isArray(that.options.positionQueue)) {
				that.options.positionQueue = [];
			}
			
			that.options.positionQueue.unshift(pos);
		},
		
		_getLatesPointPosition: function() {
			var that = this;
			var positions = that.options.positionQueue;
			
			return positions[0];
		},
		
		_clearAllPointPosition: function() {
			var that = this;
			
			that.options.positionQueue = [];
		},
		
		_calcDistance: function(point1, point2) {
			var that = this;
			
			if (!point1 || !point2) {
				return 0;
			}
			
			var point1X = parseInt(point1.x);
			var point1Y = parseInt(point1.y);
			var point2X = parseInt(point2.x);
			var point2Y = parseInt(point2.y);
			
			if (!point1X || !point1Y || !point2X || !point2Y) {
				return 0;
			}
			
			var disX = Math.abs(point1X - point2X);
			var disY = Math.abs(point1Y - point2Y);
			var distance = Math.sqrt(disX * disX + disY * disY);
			
			return distance;
		},
		
		_calcPositionOffset: function(sourcePosition, targetPosition) {
			var that = this;
			
			if (!sourcePosition || !targetPosition) {
				return {
					offsetX: 0,
					offsetY: 0
				}
			}
			
			var srcPX = parseInt(sourcePosition.x);
			var srcPY = parseInt(sourcePosition.y);
			var tarPX = parseInt(targetPosition.x);
			var tarPY = parseInt(targetPosition.y);
			
			if (!srcPX || !srcPY || !tarPX || !tarPY) {
				return {
					offsetX: 0,
					offsetY: 0
				}
			}
			
			var offsetX = tarPX - srcPX;
			var offsetY = tarPY - srcPY;
			
			return {
				offsetX: offsetX,
				offsetY: offsetY
			}
		},
		
		_moveDebugWrapper: function(offsetX, offsetY) {
			var that = this;
			var wrapper = that._getDebugWrapper();
			var styles = wrapper.style;
			var left = parseInt(styles.left);
			var top = parseInt(styles.top);
			
			var clientRect = wrapper.getBoundingClientRect();
			var maxMoveLeftDis = parseInt(clientRect.left);
			var maxMoveRightDis = window.innerWidth - clientRect.left - clientRect.width;
			var maxMoveUpDis = parseInt(clientRect.top);
			var maxMoveDownDis = window.innerHeight - clientRect.top - clientRect.height;
			
			if (offsetX < 0 && Math.abs(offsetX) > maxMoveLeftDis) {
				offsetX = (-1) * maxMoveLeftDis;
			}
			
			if (offsetX > 0 && offsetX > maxMoveRightDis) {
				offsetX = maxMoveRightDis;
			}
			
			if (offsetY < 0 && Math.abs(offsetY) > maxMoveUpDis) {
				offsetY = (-1) * maxMoveUpDis;
			}
			
			if (offsetY > 0 && offsetY > maxMoveDownDis) {
				offsetY = maxMoveDownDis;
			}
			
			var posX = left + offsetX;
			var posY = top + offsetY;
			
			wrapper.style.left = posX + "px";
			wrapper.style.top = posY + "px";
		},
		
		_bindDragEvent: function() {
			var that = this;
			var debugHeader = that._getDebugHeader();
			
			debugHeader.addEventListener("touchstart", function() {
				that._clearAllPointPosition();
			});
			
			debugHeader.addEventListener("touchmove", function(e) {
				var curPointPosition = that._getPosition(e);
				var latesPointPosition = that._getLatesPointPosition();
				var positionOffset = that._calcPositionOffset(latesPointPosition, curPointPosition);
				
				that._moveDebugWrapper(positionOffset.offsetX, positionOffset.offsetY);
				
				that._addPointPosition(curPointPosition);
				
				if (e.target == debugHeader) {
					e.preventDefault();
				}
			});
			
			debugHeader.addEventListener("touchend", function() {
				that._clearAllPointPosition();
			});
		},
		
		_getCurDebugInfoIdx: function() {
			var that = this;
			
			return that.options.debugInfoIdx;
		},
		
		_updateDebugInfoIdx: function() {
			var that = this;
			var curDebugInfoIdx = that._getCurDebugInfoIdx();
			
			that.options.debugInfoIdx = parseInt(curDebugInfoIdx) + 1;
		},
		
		_createDebugInfoIdx: function() {
			var that = this;
			var debugInfoIdx = null;
			
			that._updateDebugInfoIdx();
			
			debugInfoIdx = that._getCurDebugInfoIdx();
			
			return debugInfoIdx;
		},
		
		_getCurTime: function() {
			var that = this;
			var now = (new Date());
			var curHours = now.getHours();
			var curMinutes = now.getMinutes();
			var curSeconds = now.getSeconds();
			
			return curHours + " :" + curMinutes + " :" + curSeconds;
		},
		
		_isMobile: function() {
			var that = this;
			
			return "ontouchstart" in document;
		},
		
		_getPosition: function(e) {
			var that = this;
			var isMobile = that._isMobile();
			var x = null;
			var y = null;
			
			if (isMobile) {
				x = e.touches[0].pageX;
				y = e.touches[0].pageY;
			} else {
				x = e.pageX;
				y = e.pageY;
			}
			
			return {
				x: x,
				y: y
			}
		},
		
		info: function(debugInfo) {
			var that = this;
			var styles = ';margin: 2px 0;padding: 4px 2px;color: #000;background: #fff;list-style: none;max-width: 300px;overflow: auto;';
			var infoIdx = that._createDebugInfoIdx();
			var infoTime = that._getCurTime();
			
			debugInfo = "(" + infoIdx + ", " + infoTime + ") " + debugInfo;
			
			that._createDebugInfoItem(debugInfo, styles);
			
			if (that.options.isScrollToBottom) {
				that._scrollToBottom();
			}
		},
		
		warn: function(debugInfo) {
			var that = this;
			var styles = ';margin: 2px 0;padding: 4px 2px;color: #000;background: #ff0;list-style: none;max-width: 300px;overflow: auto;';
			var infoIdx = that._createDebugInfoIdx();
			var infoTime = that._getCurTime();
			
			debugInfo = "(" + infoIdx + ", " + infoTime + ") " + debugInfo;
			
			that._createDebugInfoItem(debugInfo, styles);
			
			if (that.options.isScrollToBottom) {
				that._scrollToBottom();
			}
		},
		
		err: function(debugInfo) {
			var that = this;
			var styles = ';margin: 2px 0;padding: 4px 2px;color: #000;background: #f00;list-style: none;max-width: 300px;overflow: auto;';
			var infoIdx = that._createDebugInfoIdx();
			var infoTime = that._getCurTime();
			
			debugInfo = "(" + infoIdx + ", " + infoTime + ") " + debugInfo;
			
			that._createDebugInfoItem(debugInfo, styles);
			
			if (that.options.isScrollToBottom) {
				that._scrollToBottom();
			}
		},
		
		clear: function() {
			var that = this;
			var debugWindow = that._getDebugWindow();
			
			debugWindow.innerHTML = "";
		},
		
		_scrollToBottom: function() {
			var that = this;
			var debugWindow = that._getDebugWindow();
			var _scrollHeight = debugWindow.scrollHeight;
			
			debugWindow.scrollTop = _scrollHeight;
		},
		
		_bindToggleWindowEvent: function() {
			var that = this;
			var debugHeader = that._getDebugHeader();
			
			debugHeader.addEventListener("click", function() {
				var debugWindow = that._getDebugWindow();
				var display = debugWindow.style.display;
				
				if (display == "none") {
					debugWindow.style.display = "block";
				} else {
					debugWindow.style.display = "none";
				}
			});
		},
		
		_bindToggleScrollModelEvent: function() {
			var that = this;
			var toolbar = that._getToolbar();
			
			toolbar.addEventListener("click", function(e) {
				var isScrollToBottom = that.options.isScrollToBottom;
				
				that.options.isScrollToBottom = !isScrollToBottom;
				
				toolbar.style.color = !isScrollToBottom ? "red" : "";
				
				e.preventDefault();
				e.stopPropagation();
			});
		},
		
		_bindPreventParentScrollEvent: function(targetDOM) {
			var that = this;
			
//			targetDOM.addEventListener("touchmove", function(e) {
//				e.stopPropagation();
//			});
		}
	}
	
	window.MobileConsole = new MobileConsole();
	
	console.info = function(msg) {
		window.MobileConsole.info(msg);
	}
	
	console.warn = function(msg) {
		window.MobileConsole.warn(msg);
	}
	
	console.error = function(msg) {
		window.MobileConsole.err(msg);
	}
	
})();
