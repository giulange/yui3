YUI.add("plugin", function(Y) {

    var L = Y.Lang;

    // TODO: Move to Y.add/register
    // var _registry = {};

    /**
     * Plugin provides a base class for all Plugin classes.
     * 
     * @class YUI.Widget
     * @extends YUI.Base
     * @param {Object} config The configuration object for the
     * plugin.
     */
    function Plugin(config) {
        Plugin.superclass.constructor.apply(this, arguments);
    }

    // No attributes
    // Plugin.ATTRS = null

    /**
     * Static property provides a string to identify the class.
     *
     * @property YUI.Plugin.NAME
     * @type {String}
     * @static
     */
    Plugin.NAME = "plugin";


    /**
     * Static property provides the namespace the plugin will be
     * registered under.
     *
     * @property YUI.Plugin.NS
     * @type {String}
     * @static
     */
    Plugin.NS = "plugin";

    /**
     * Registers a Plugin. The Plugin class passed in is expected
     * to have a static NS property defined which is used to register
     * the plugin and define it's namespace on the host object
     * 
     * If more than one plugin is registered with the same namespace
     * on the page, the last one registered will win.
     * 
     * @param {Function} pluginclass
     */
    // TODO: Move to Y.add
    // Plugin.add = function(pluginclass) {
    //    if (pluginclass.NS) {
    //        _registry[pluginclass.NS] = pluginclass;
    //    }
    // };

    /**
     * Retrieve the plugin class for a given plugin namespace.
     * @param {Object} ns The plugin's namespace
     */
    // Plugin.get = function(ns) {
    //    return _registry[ns];
    // };

    var proto = {

        _listeners: null,
        _overrides: null,

        /**
         * Initializer lifecycle implementation.
         * 
         * @method initializer
         * @param {Object} config Configuration object literal for the plugin
         */
        initializer : function(config) {

            if (!config.owner) {
                throw('plugin needs to have an owner defined');
            }

            this.owner = config.owner;

            this._listeners = [];
            this._overrides = [];

            Y.log('Initializing: ' + this.constructor.NAME, 'info', 'Plugin');
        },

        /**
         * desctructor lifecycle implementation.
         * 
         * Removes any listeners attached by the Plugin and restores
         * and over-ridden methods.
         * 
         * @method destructor
         */
        destructor: function() {
            var i;

            for (i = 0; i < this._listeners.length; i++) {
                var event = this._listeners[i];
                if (L.isObject(event)) {
                    event.obj.unsubscribe(event.ev, event.fn);
                }
            }

            for (i = 0; i < this._overrides.length; i++) {
                var o = this._overrides[i];
                if (L.isObject(o)) {
                    o.obj[o.method] = o.fn;
                    this._overrides[i] = null;
                }
            }
        },

        /**
         * Registers a listener on the provided object. The listener will
         * be automatically removed when the plugin is unplugged from the owner.
         * 
         * @method listen
         * @param {Object} obj
         * @param {Object} ev
         * @param {Object} fn
         * @param {Object} s
         * @param {Object} o
         */
        // TODO: Change to use Event Handle, once implemented (and then use Y.bind)
        listen: function(obj, ev, fn, s, o) {
            this._listeners[this._listeners.length] = { obj: obj, ev: ev, fn: fn };
            obj.on(ev, fn, s, o);
        },

        /**
         * Unregisters a listener from the provided object.
         * 
         * @method nolisten
         * @param {Object} obj
         * @param {Object} ev
         * @param {Object} fn
         * @param {Object} s
         * @param {Object} o
         */
        // TODO: Change to use Event Handle, once implemented (and then use Y.bind)
        nolisten: function(obj, ev, fn) {
            obj.unsubscribe(ev, fn);
            for (var i = 0; i < this._listeners.length; i++) {
                if ((this._listeners[i].ev == ev) && (this._listeners[i].fn == fn) && (this._listeners[i].obj == obj)) {
                    this._listeners[i] = null;
                    break;
                }
            }
        },

        /**
         * Registers a before change listener on the provided object. The listener will
         * be automatically removed when the plugin is unplugged from the owner.
         * 
         * @method listenBefore
         * @param {Object} obj
         * @param {Object} ev
         * @param {Object} fn
         * @param {Object} s
         * @param {Object} o
         */
        // TODO: Change to use Event Handle, once implemented (and Y.bind)
        listenBefore: function(obj, ev, fn, s, o) {
            ev = 'before' + ev.charAt(0).toUpperCase() + ev.substr(1) + 'Change';
            this.listen(obj, ev, fn, s, o);
        },

        /**
         * Unregisters a before change listener on the provided object.
         * 
         * @method nolistenbefore
         * @param {Object} obj
         * @param {Object} ev
         * @param {Object} fn
         */
        // TODO: Change to use Event Handle, once implemented (and Y.bind)
        nolistenBefore: function(obj, ev, fn) {
            ev = 'before' + ev.charAt(0).toUpperCase() + ev.substr(1) + 'Change';
            this.nolisten(obj, ev, fn);
        },

        /**
         * Overrides a method on the provided object. The original method is 
         * held onto and will be restored when the plugin is unplugged from the owner.
         * 
         * @method addOverride
         * @param {Object} obj
         * @param {Object} method
         * @param {Object} fn
         */
        addOverride: function(obj, method, fn) {
            if (L.isFunction(obj[method]) && L.isFunction(fn)) {
                this._overrides[this._overrides.length] = { method: method, obj: obj, fn: obj[method] };
                obj[method] = fn;
            } else {
                Y.log('Method (' + method + ') does not belong to object', 'error', 'Plugin');
            }
        },

        /**
         * Restore a method, previously over-ridden using addOverride.
         * 
         * @method removeOverride
         * @param {Object} obj
         * @param {Object} method
         */
        removeOverride: function(obj, method) {
            for (var i = 0; i < this._overrides.length; i++) {
                var o = this._overrides[i];
                if ((o.obj == obj) && (o.method == method)) {
                    obj[method] = o.fn;
                    this._overrides[i] = null;
                }
            }
        },

        setSilent: function(obj, config, val) {
            obj._configs[config].value = val;
        },

        toString: function() {
            return this.constructor.NAME + "[" + this.constructor.NS + "]";
        }
    };

    Y.extend(Plugin, Y.Base, proto);
    Y.Plugin = Plugin;
}, "3.0.0");

YUI.add('classnamemanager', function(Y) {

if (!Y.CLASS_NAME_PREFIX) {

	/**
	 * String indicating the prefix for all CSS class names.
	 *
	 * @property YUI.CLASS_NAME_PREFIX
	 * @type {String}
	 * @static
	 */
	Y.CLASS_NAME_PREFIX = "yui-";
}


// String constants
var _HYPHEN = "-";


/**
 * A class for Widgets or classes that extend Base, providing: 
 * 
 * <ul>
 *    <li>Easy creation of prefixed class names</li>
 *    <li>Caching of previously created class names for improved performance.</li>
 * </ul>
 * 
 * @class YUI.ClassNameManager
 */
Y.ClassNameManager = function() {

};

var ClassNameManager = Y.ClassNameManager;


ClassNameManager.ATTRS = {

	/**
	* @attribute classNamePrefix
	* @description String indicating the prefix for all class names.
	* @default YUI.CLASS_NAME_PREFIX ("yui-")
	* @type String
	*/
	classNamePrefix: {
	
		value: Y.CLASS_NAME_PREFIX,
		writeOnce: true
	
	}

};


ClassNameManager.prototype = {

	/**
	 * The class name for the instance, by default set to the value of the 
	 * <code>classNamePrefix</code> attribute and the <code>NAME</code> property.
	 *
	 * @property _className
	 * @protected
	 * @type {String}		 
	 */            
	_className: null,

	/**
	 * Collection of all of the class names used by the instance.
	 *
	 * @property _classNames
	 * @protected
	 * @type {Object}
	 */            
	_classNames: null,

	/**
	 * Returns a class name prefixed with the both the value of the 
	 * <code>classNamePrefix</code> attribute and the <code>NAME</code> property.
	 * 
	 * @method getClassName
	 * @param {String} classname
	 */
	getClassName: function (classname) {

		if (!this._className) {
			this._className = this.get("classNamePrefix") + this.constructor.NAME.toLowerCase();
		}


		if (!this._classNames) {
			this._classNames = {};
		}
	

		var oClassNames = this._classNames,
			sClassName  = oClassNames[classname];


		if (!sClassName) {
			sClassName =  this._className + _HYPHEN + classname;
			oClassNames[classname] = sClassName;
		}
		
		return sClassName;				
	
	}

};


}, "3.0.0");
YUI.add("widget", function(Y) {

	var L = Y.Lang;


	// String constants
	var _WIDGET = "widget",
		_CONTENT = "content",
		_VISIBLE = "visible",
		_HIDDEN = "hidden",
		_ENABLED = "enabled",
		_DISABLED = "disabled",
		_FOCUS = "focus",
		_HAS_FOCUS = "hasFocus",
		_WIDTH = "width",
		_HEIGHT = "height",
		_UI = "ui",
		_DIV = "div",
		_EMPTY = "",
		_HYPHEN = "-";

	// Widget nodeid-to-instance map for now, 1-to-1. 
	// Expand to nodeid-to-arrayofinstances if required.
	var _instances = {};

	/**
	 * A base class for widgets, providing:
	 * <ul>
	 *    <li>The render lifecycle method, in addition to the init and destroy 
	 *        lifecycle methods provide by Base</li>
	 *    <li>Abstract methods to support consistent MVC structure across 
	 *        widgets: renderer, initUI, syncUI</li>
	 *    <li>Support for common widget attributes, such as id, node, visible, 
	 *        disabled, strings</li>
	 *    <li>Plugin registration and activation support</li>
	 * </ul>
	 *
	 * @param config {Object} Object literal specifying widget configuration 
	 * properties (may container both attribute and non attribute configuration).
	 * 
	 * @class YUI.Widget
	 * @extends YUI.Base
	 */
	function Widget(config) {
		Y.log('constructor called', 'life', 'Widget');

		this.uid = Y.guid(_WIDGET);
		this.rendered = false;
		this._plugins = {};

		var boundingBox;

		if (!config.boundingBox) { // create from template if no bounding box provided
			config = Y.merge(config);
			
			boundingBox = Y.Node.create(this.constructor.TEMPLATE);
			
			config.boundingBox = boundingBox;
			config.contentBox = boundingBox.get("firstChild");
			
		}

		Widget.superclass.constructor.apply(this, arguments);
	}

	/**
	 * Static property provides a string to identify the class.
	 * Currently used to apply class identifiers to the bounding box 
	 * and to classify events fired by the widget.
	 *
	 * @property YUI.Widget.NAME
	 * @type {String}
	 * @static
	 */
	Widget.NAME = _WIDGET;

	/**
	 * Static property outlining the markup template for the class in JsonML.
	 *
	 * @property YUI.Widget.TEMPLATE
	 * @type {Array}
	 * @static
	 */
	Widget.TEMPLATE = [_DIV, [_DIV]];

	/**
	 * Static property used to define the default attribute 
	 * configuration for the Widget.
	 * 
	 * @property YUI.Widget.ATTRS
	 * @type {Object}
	 */
	Widget.ATTRS = {

		/**
		* @attribute boundingBox
		* @description The outermost DOM node for the Widget, used for sizing and positioning 
		* of a Widget as well as a containing element for any decorator elements used 
		* for skinning.
		* @type YUI.Node
		*/
		boundingBox: {
			set: function(val) {
				return this._initNode(val);
			},
			writeOnce: true
		},

		/**
		* @attribute contentBox
		* @description A DOM node that is a direct descendent of a Widget's bounding box that 
		* houses its content.
		* @type YUI.Node
		*/            
		contentBox: {
			writeOnce: true
		},


		/**
		* @attribute hasFocus
		* @description Boolean indicating if the Widget has focus.
		* @default false
		* @type Boolean
		*/
		hasFocus: {
			value: false
		},


		/**
		* @attribute disabled
		* @description Boolean indicating if the Widget should be disabled.  
		* (Disabled widgets will not respond to user input or fire events.)
		* @default false
		* @type Boolean
		*/
		disabled: {
			value: false
		},


		/**
		* @attribute visible
		* @description Boolean indicating weather or not the Widget is visible.
		* @default true
		* @type Boolean
		*/
		visible: {
			value: true
		},


		/**
		* @attribute height
		* @description String or number representing the height of the Widget.
		* @default ""
		* @type {String | Number}
		*/
		height: {
			// Default to not set on element style
			value: _EMPTY
		},

		/**
		* @attribute width
		* @description String or number representing the width of the Widget.
		* @default ""
		* @type {String | Number}
		*/
		width: {
			// Default to not set on element style
			value: _EMPTY
		},

		/**
		* @attribute strings
		* @description Collection of strings used to label elements of a Widget's UI.
		* @type Object
		*/
		strings: {
			// Widget UI strings go here
		}
	};

	/**
	 * Obtain Widget instances by bounding box id.
	 *
	 * @method YUI.Widget.getByNodeId
	 * @param id {String} Id used to identify the widget uniquely.
	 * @return {Widget} Widget instance
	 */
	Widget.getByNodeId = function(id) {
		return _instances[id];
	};

	var proto = {

		/**
		 * Initializer lifecycle implementation for the Widget class.
		 * 
		 * Base.init will invoke all prototype.initializer methods, for the
		 * class hierarchy (starting from Base), after all attributes have 
		 * been configured.
		 * 
		 * @param  config {Object} Configuration obejct literal for the widget
		 */
		initializer: function(config) {
			Y.log('initializer called', 'life', 'Widget');

			this._className = this.get("classNamePrefix") + this.constructor.NAME.toLowerCase();

			this._initPlugins(config);

			if (this.id) {
				_instances[this.id] = this;
			}
		},

		/**
		 * Descructor lifecycle implementation for the Widget class.
		 * 
		 * Base.destroy will invoke all prototype.destructor methods, for the
		 * class hierarchy (starting from the lowest sub-class).
		 *
		 */
		destructor: function() {
			Y.log('destructor called', 'life', 'Widget');

			this._destroyPlugins();

			if (this.id) {
				delete _instances[this.id];
			}
		},

		/**
		 * Establishes the initial DOM for the widget. Invoking this
		 * method will lead to the creating of all DOM elements for
		 * the widget (or the manipulation of existing DOM elements 
		 * for the progressive enhancement use case).
		 * <p>
		 * This method should only be invoked once for an initialized
		 * widget.
		 * </p>
		 * <p>
		 * It delegates to the widget specific renderer method to do
		 * the actual work.
		 * </p>
		 * 
		 * @method render
		 * @public
		 * @chain
		 * @final 
		 */
		render: function(parentNode) {
			if (this.destroyed) {
				throw('render failed; widget has been destroyed');
			}

			// append to parent if provided, or to body if no parent and not in body 
			parentNode = parentNode || Y.Node.get("body");
			if (parentNode && !parentNode.contains(this._boundingBox)) {
				parentNode.appendChild(this._boundingBox);
			}

			if (!this.rendered && this.fire("beforeRender") !== false) {
				this._uiInitNode();

				this._bindUI();
				this._syncUI();

				if (this.renderer) {
					this.renderer();
				}

				this.rendered = true;
				this.fire("render");
			}

			return this;
		},

		/** 
		 * Creates DOM (or manipulates DOM for progressive enhancement)
		 * This method is invoked by render() and is not chained 
		 * automatically for the class hierarchy (like initializer, destructor) 
		 * so it should be chained manually for subclasses if required.
		 * 
		 * @method renderer
		 */
		renderer: function() {},

		/**
		 * Configures/Setsup listeners to bind Widget State to UI/DOM
		 * 
		 * This method is not called by framework and is not chained 
		 * automatically for the class hierarchy.
		 * 
		 * @method bindUI
		 */
		bindUI: function() {},

		/**
		 * Adds nodes to the DOM 
		 * 
		 * This method is not called by framework and is not chained 
		 * automatically for the class hierarchy.
		 * 
		 * @method renderUI
		 */
		renderUI: function() {},

		/**
		 * Refreshes the rendered UI, based on Widget State
		 * 
		 * This method is not called by framework and is not chained
		 * automatically for the class hierarchy.
		 * 
		 * @method syncUI
		 */
		syncUI: function(){},

		/**
		* @method hide
		* @description Shows the Module element by setting the "visible" attribute to "false".
		*/
		hide: function() {
			return this.set(_VISIBLE, false);
		},

		/**
		* @method show
		* @description Shows the Module element by setting the "visible" attribute to "true".
		*/
		show: function() {
			return this.set(_VISIBLE, true);
		},

		/**
		* @method focus
		* @description Causes the Widget to receive the focus by setting the "hasFocus" 
		* attribute to "true".
		*/
		focus: function () {
			return this.set(_HAS_FOCUS, true);
		},

		/**
		* @method blur
		* @description Causes the Widget to lose focus by setting the "hasFocus" attribute 
		* to "false"
		*/            
		blur: function () {
			return this.set(_HAS_FOCUS, false);
		},

		/**
		* @method enable
		* @description Set the Widget's "disabled" attribute to "false".
		*/
		enable: function() {
			return this.set(_ENABLED, true);
		},

		/**
		* @method disabled
		* @description Set the Widget's "disabled" attribute to "true".
		*/
		disable: function() {
			return this.set(_DISABLED, false);
		},

		/**
		 * Sets the state of an attribute. Wrapper for
		 * AttributeProvider.set, with additional ability 
		 * to chain.
		 * 
		 * @method set
		 * @chain
		 */
		set: function() { 
			// extend to chain set calls
			Y.Attribute.prototype.set.apply(this, arguments);
			return this;
		},

		/**
		 * Returns an attribute of the Node instance specified as the Widget's bounding box.
		 * 
		 * @method getNodeAttr
		 */
		getNodeAttr: function(attr) {
			if (this._boundingBox) {
				return this._boundingBox.att(attr);
			}
			return undefined;
		},

		/**
		 * Sets an attribute for the Node instance specified as the Widget's bounding box.
		 * 
		 * @method getNodeAttr
		 * @chain             
		 */
		setNodeAttr: function(attr, val) {
			if (this._boundingBox) {
				this._boundingBox.att(attr, val);
			}
			return this;
		},

		/**
		 * Register and instantiate a plugin with the Widget.
		 * 
		 * @param p {String | Object |Array} Accepts the registered 
		 * namespace for the Plugin or an object literal with an "fn" property
		 * specifying the Plugin class and a "cfg" property specifying
		 * the configuration for the Plugin.
		 * <p>
		 * Additionally an Array can also be passed in, with either String or 
		 * Object literal elements, allowing for multiple plugin registration in 
		 * a single call
		 * </p>
		 * @method plug
		 * @chain
		 * @public
		 */
		plug: function(p) {
			if (p) {
				if (L.isArray(p)) {
					var ln = p.length;
					for (var i = 0; i < ln; i++) {
						this.plug(p[i]);
					}
				} else if (L.isFunction(p)) {
					this._plug(p);
				} else {
					this._plug(p.fn, p.cfg);
				}
			}
			return this;
		},

		/**
		 * Unregister and destroy a plugin already instantiated with the Widget.
		 * 
		 * @method unplug
		 * @param {String} ns The namespace key for the Plugin
		 * @chain
		 * @public
		 */
		unplug: function(ns) {
			if (ns) {
				this._unplug(ns);
			} else {
				for (ns in this._plugins) {
					this._unplug(ns);
				}
			}
			return this;
		},

		/**
		 * Determines if a plugin has been registered and instantiated 
		 * for this widget.
		 * 
		 * @method hasPlugin
		 * @public
		 * @return {Boolean} returns true, if the plugin has been applied
		 * to this widget.
		 */
		hasPlugin : function(ns) {
			return (this._plugins[ns] && this[ns]);
		},

		/**
		 * @private
		 */
		 
		_initPlugins: function(config) {

			// Class Configuration
			var classes = this._getClasses(), constructor;
			for (var i = 0; i < classes.length; i++) {
				constructor = classes[i];
				if (constructor.PLUGINS) {
					this.plug(constructor.PLUGINS);
				}
			}

			// User Configuration
			if (config && config.plugins) {
				this.plug(config.plugins);
			}
		},

		/**
		 * @private
		 */
		_destroyPlugins: function() {
			this._unplug();
		},

		/**
		 * @private
		 */
		_plug: function(PluginClass, config) {
			if (PluginClass && PluginClass.NS) {
				var ns = PluginClass.NS;

				config = config || {};
				config.owner = this;

				if (this.hasPlugin(ns)) {
					// Update config
					// this[ns].setAttributeConfigs(config, false);
					this[ns].setAtts(config);
				} else {
					// Create new instance
					this[ns] = new PluginClass(config);
					this._plugins[ns] = PluginClass;
				}
			}
		},


		/**
		 * @private
		 */
		_unplug : function(ns) {
			if (ns) {
				if (this[ns]) {
					this[ns].destroy();
					delete this[ns];
				}
				if (this._plugins[ns]) {
					delete this._plugins[ns];
				}
			}
		},


		/**
		 * Sets up listeners to synchronize UI state to attribute
		 * state.
		 *
		 * @method _bindUI
		 * @protected
		 */
		_bindUI: function() {
			this.on('visibleChange', this._onVisibleChange);
			this.on('disabledChange', this._onDisabledChange);
			this.on('heightChange', this._onHeightChange);
			this.on('widthChange', this._onWidthChange);
			this.on('hasFocusChange', this._onHasFocusChange);
			this._boundingBox.on(_FOCUS, Y.bind(this._onFocus, this));
			this._boundingBox.on("blur", Y.bind(this._onBlur, this));
		},


		/**
		 * Updates the widget UI to reflect the attribute state.
		 * 
		 * @method _syncUI
		 * @protected
		 */
		_syncUI: function() {
			this._uiSetVisible(this.get(_VISIBLE));
			this._uiSetDisabled(this.get(_DISABLED));
			this._uiSetHeight(this.get(_HEIGHT));
			this._uiSetWidth(this.get(_WIDTH));
			this._uiSetHasFocus(this.get(_HAS_FOCUS));
		},

		/**
		 * Sets the height on the widget's bounding box element
		 * 
		 * @method _uiSetHeight
		 * @protected
		 * @param {String | Number} val
		 */
		_uiSetHeight: function(val) {
			if (L.isNumber(val)) {
				val = val + this.DEF_UNIT;
			}
			this._boundingBox.setStyle(_HEIGHT, val);
		},

		/**
		 * Sets the width on the widget's bounding box element
		 *
		 * @method _uiSetWidth
		 * @protected
		 * @param {String | Number} val
		 */
		_uiSetWidth: function(val) {
			if (L.isNumber(val)) {
				val = val + this.DEF_UNIT;
			}
			this._boundingBox.setStyle(_WIDTH, val);
		},

		/**
		 * Sets the visible state for the UI
		 * 
		 * @method _uiSetVisible
		 * @protected
		 * @param {boolean} val
		 */
		_uiSetVisible: function(val) {

			var sClassName = this.getClassName(_HIDDEN);

			if (val === true) { 
				this._boundingBox.removeClass(sClassName); 
			} else {
				this._boundingBox.addClass(sClassName); 
			}
		},

		/**
		 * Sets the disabled state for the UI
		 * 
		 * @protected
		 * @param {boolean} val
		 */
		_uiSetDisabled: function(val) {

			var sClassName = this.getClassName(_DISABLED);

			if (val === true) {
				this._boundingBox.addClass(sClassName);
			} else {
				this._boundingBox.removeClass(sClassName);
			}
		},

		/**
		 * Sets the hasFocus state for the UI
		 * 
		 * @protected
		 * @param {boolean} val
		 * @param {string} src String representing the source that triggered an update to 
		 * the UI.     
		 */
		_uiSetHasFocus: function(val, src) {
			
			var sClassName = this.getClassName(_FOCUS);

			if (val === true) {
				this._boundingBox.addClass(sClassName);
				if (src !== _UI) {
					this._boundingBox.focus();
				}
				
			} else {
				this._boundingBox.removeClass(sClassName);
				if (src !== _UI) {
					this._boundingBox.blur();
				}
			}
		
		},

		/**
		 * Initializes widget state based on the node value
		 * provided, which maybe an instance of Y.Node, or a selector
		 * string
		 * 
		 * @method _initNode
		 * @protected
		 * @param {Node | String} node An instance of Y.Node, 
		 * representing the widget's bounding box, or a selector
		 * string which can be used to retrieve it. 
		 */
		_initNode: function(node) {
			// TODO: Looking at the node impl, this should 
			// also take care of id generation, if an id doesn't exist
			if (L.isString(node)) {
				node = Y.Node.get(node);
			}

			// Node not found
			if (node) {
				this.id = node.get("id");
				this._boundingBox = node;

				var contentBox = node.query(":first-child");
				
				if (contentBox) {
					this._contentBox = contentBox;
					this.set("contentBox", contentBox);
				}
				else {
					throw("node for content box not found");					
				}
			}
			else {
				throw("node for bounding box not found");                
			}

			return node;
		},

		/**
		 * Initializes the UI state for the bounding box. Applies marker
		 * classes to identify the widget.
		 * 
		 * @method _uiInitNode
		 * @protected
		 */
		_uiInitNode: function() {
			var classes = this._getClasses(), 
				constructor,
				classname;

			// Starting from 1, because we don't need Base (yui-base) marker
			for (var i = 1; i < classes.length; i++) {
				constructor = classes[i];
				if (constructor.NAME) {
				
					classname = this._className;
				
					this._boundingBox.addClass(classname);
					this._contentBox.addClass(classname + _HYPHEN + _CONTENT);
				}
			}
			
			this._boundingBox.set("tabIndex", 0);

		},

		/**
		 * Visible attribute UI handler
		 * 
		 * @method _onVisibleChange
		 * @protected
		 * @param {Object} evt Event object literal passed by AttributeProvider
		 */
		_onVisibleChange: function(evt) {
			this._uiSetVisible(evt.newVal);
		},

		/**
		 * Disabled attribute UI handler
		 * 
		 * @method _onDisabledChange
		 * @protected
		 * @param {Object} evt Event object literal passed by AttributeProvider
		 */
		_onDisabledChange: function(evt) {
			this._uiSetDisabled(evt.newVal);
		},
		
		/**
		 * Height attribute UI handler
		 * 
		 * @method _onHeightChange
		 * @protected
		 * @param {Object} evt Event object literal passed by AttributeProvider
		 */
		_onHeightChange: function(evt) {
			this._uiSetHeight(evt.newVal);
		},

		/**
		 * Width attribute UI handler
		 * 
		 * @method _onWidthChange
		 * @protected
		 * @param {Object} evt Event object literal passed by AttributeProvider
		 */
		_onWidthChange: function(evt) {
			this._uiSetWidth(evt.newVal);
		},

		/**
		 * hasFocus attribute UI handler
		 * 
		 * @method _onHasFocusChange
		 * @protected
		 * @param {Object} evt Event object literal passed by AttributeProvider
		 */
		_onHasFocusChange: function(evt) {
			this._uiSetHasFocus(evt.newVal, evt.src);
		},

		/**
		 * focus event UI handler used to sync the state of the Widget with the DOM
		 * 
		 * @method _onFocus
		 * @protected
		 */
		_onFocus: function () {
			this.set(_HAS_FOCUS, true, { src: _UI });
		},

		/**
		 * blur event UI handler used to sync the state of the Widget with the DOM
		 * 
		 * @method _onBlur
		 * @protected
		 */			
		_onBlur: function () {
			this.set(_HAS_FOCUS, false, { src: _UI });
		},

		/**
		 * Generic toString implementation for all widgets.
		 * @method toString
		 */
		toString: function() {
			return this.constructor.NAME + "[" + this.id + "]";
		},

		/**
		 * Default unit to use for style values
		 */
		DEF_UNIT : "px"

	};

	/**
	 * Static registration of default plugins for the class.
	 * 
	 * @property Y.Widget.PLUGINS
	 * @static
	 */
	Widget.PLUGINS = [
		// Placeholder for Widget Class Default plugins

		// - OR -
		// Instantiate a new plugin with or configure an existing plugin
		// { fn:Y.Plugin.Mouse, cfg:mousecfg }
	];

	Y.extend(Widget, Y.Base, proto);

	Y.augment(Widget, Y.ClassNameManager);

	Y.aggregate(Widget, Y.ClassNameManager);

	Y.Widget = Widget;

}, "3.0.0");
