/**
The tap module provides a gesture events, "tap", which normalizes user interactions
across touch and mouse or pointer based input devices.  This can be used by application developers
to build input device agnostic components which behave the same in response to either touch or mouse based
interaction.

'tap' is like a touchscreen 'click', only it requires much less finger-down time since it listens to touch events,
but reverts to mouse events if touch is not supported.

@example

    YUI().use('event-tap', function (Y) {
        Y.one('#my-button').on('tap', function (e) {
            Y.log('Button was tapped on');
        });
    });

@module event
@submodule event-tap
@author Andres Garza, matuzak and tilo mitra
@since 3.7.0

*/
var doc = Y.config.doc,
    GESTURE_MAP = Y.Event._GESTURE_MAP,
    SUPPORTS_TOUCHES = !!(doc && doc.createTouch),
    EVT_START = GESTURE_MAP.start,
    EVT_TAP = 'tap',

    HANDLES = {
        START: 'Y_TAP_ON_START_HANDLE',
        END: 'Y_TAP_ON_END_HANDLE',
        CANCEL: 'Y_TAP_ON_CANCEL_HANDLE'
    };

function detachHelper(subscription, handles, subset) {

    handles = subset ? handles : [ handles.START, handles.END, handles.CANCEL ];

    Y.Array.each(handles, function (item) {
        var handle = subscription[item];
        if (handle) {
            handle.detach();
            subscription[item] = null;
        }
    });

}


/**
Sets up a "tap" event, that is fired on touch devices in response to a tap event (finger down, finder up).
This event can be used instead of listening for click events which have a 500ms delay on most touch devices.
This event can also be listened for using node.delegate().

@event tap
@param type {string} "tap"
@param fn {function} The method the event invokes. It receives the event facade of the underlying DOM event.
@for Event
@return {EventHandle} the detach handle
*/
Y.Event.define(EVT_TAP, {
    publishConfig: {
        preventedFn: function (e) {
            e.target.once('click', function (click) {
                click.preventDefault();
            });
        }
    },

    processArgs: function (args, isDelegate) {

        //if we return for the delegate use case, then the `filter` argument
        //returns undefined, and we have to get the filter from sub._extra[0] (ugly)

        if (!isDelegate) {
            var extra = args[3];
            // remove the extra arguments from the array as specified by
            // http://yuilibrary.com/yui/docs/event/synths.html
            args.splice(3,1);
            return extra;
        }
    },
    /**
    This function should set up the node that will eventually fire the event.

    Usage:

        node.on('tap', function (e) {
            Y.log('the node was tapped on');
        });

    @method on
    @param {Y.Node} node
    @param {Array} subscription
    @param {Boolean} notifier
    @public
    @static
    **/
    on: function (node, subscription, notifier) {
        subscription[HANDLES.START] = node.on(EVT_START, this.touchStart, this, node, subscription, notifier);
    },

    /**
    Detaches all event subscriptions set up by the event-tap module

    @method detach
    @param {Y.Node} node
    @param {Array} subscription
    @param {Boolean} notifier
    @public
    @static
    **/
    detach: function (node, subscription, notifier) {
        detachHelper(subscription, HANDLES);
    },

    /**
    Event delegation for the 'tap' event. The delegated event will use a
    supplied selector or filtering function to test if the event references at least one
    node that should trigger the subscription callback.

    Usage:

        node.delegate('tap', function (e) {
            Y.log('li a inside node was tapped.');
        }, 'li a');

    @method delegate
    @param {Y.Node} node
    @param {Array} subscription
    @param {Boolean} notifier
    @param {String | Function} filter
    @public
    @static
    **/
    delegate: function (node, subscription, notifier, filter) {
        subscription[HANDLES.START] = node.delegate(EVT_START, function (e) {
            this.touchStart(e, node, subscription, notifier, true);
        }, filter, this);
    },

    /**
    Detaches the delegated event subscriptions set up by the event-tap module.
    Only used if you use node.delegate(...) instead of node.on(...);

    @method detachDelegate
    @param {Y.Node} node
    @param {Array} subscription
    @param {Boolean} notifier
    @public
    @static
    **/
    detachDelegate: function (node, subscription, notifier) {
        detachHelper(subscription, HANDLES);
    },

    /**
    Called when the monitor(s) are tapped on, either through touchstart or mousedown.

    @method touchStart
    @param {DOMEventFacade} event
    @param {Y.Node} node
    @param {Array} subscription
    @param {Boolean} notifier
    @param {Boolean} delegate
    @protected
    @static
    **/
    touchStart: function (event, node, subscription, notifier, delegate) {

        var context = {
                canceled: false,
                eventType: event.type
            },
            needToCancel = subscription.needToCancel || false;
        //move ways to quit early to the top.

        // no right clicks
        if (event.button && event.button === 3) {
            return;
        }

        // for now just support a 1 finger count (later enhance via config)
        if (event.touches && event.touches.length !== 1) {
            return;
        }

        context.node = delegate ? event.currentTarget : node;

        //There is a double check in here to support event simulation tests, in which
        //event.touches can be undefined when simulating 'touchstart' on touch devices.
        if (SUPPORTS_TOUCHES && event.touches) {
          context.startXY = [ event.touches[0].pageX, event.touches[0].pageY ];
        }
        else {
          context.startXY = [ event.pageX, event.pageY ];
        }

        //if `onTouchStart()` was called by a touch event, set up touch event subscriptions. Otherwise, set up mouse/pointer event event subscriptions.
        if (event.touches && !needToCancel) {

            subscription[HANDLES.END] = node.once('touchend', this.touchEnd, this, node, subscription, notifier, delegate, context);
            subscription[HANDLES.CANCEL] = node.once('touchcancel', this.detach, this, node, subscription, notifier, delegate, context);

            subscription.needToCancel = true;
        }
        else if (context.eventType.indexOf('mouse') !== -1 && !needToCancel) {
            subscription[HANDLES.END] = node.once('mouseup', this.touchEnd, this, node, subscription, notifier, delegate, context);
            subscription[HANDLES.CANCEL] = node.once('mousecancel', this.detach, this, node, subscription, notifier, delegate, context);

            subscription.needToCancel = true;
        }
        else if (context.eventType.indexOf('MSPointer') !== -1 && !needToCancel) {
            subscription[HANDLES.END] = node.once('MSPointerUp', this.touchEnd, this, node, subscription, notifier, delegate, context);
            subscription[HANDLES.CANCEL] = node.once('MSPointerCancel', this.detach, this, node, subscription, notifier, delegate, context);

            subscription.needToCancel = true;
        }

    },


    /**
    Called when the monitor(s) fires a touchend event (or the mouse equivalent).
    This method fires the 'tap' event if certain requirements are met.

    @method touchEnd
    @param {DOMEventFacade} event
    @param {Y.Node} node
    @param {Array} subscription
    @param {Boolean} notifier
    @param {Boolean} delegate
    @param {Object} context
    @protected
    @static
    **/
    touchEnd: function (event, node, subscription, notifier, delegate, context) {
        var startXY = context.startXY,
            endXY,
            clientXY,
            sensitivity = 15;

        if (subscription._extra && subscription._extra.sensitivity !== undefined) {
            sensitivity = subscription._extra.sensitivity;
        }

        subscription.needToCancel = false;

        //There is a double check in here to support event simulation tests, in which
        //event.touches can be undefined when simulating 'touchstart' on touch devices.
        if (event.changedTouches) {
          endXY = [ event.changedTouches[0].pageX, event.changedTouches[0].pageY ];
          clientXY = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
        }
        else {
          endXY = [ event.pageX, event.pageY ];
          clientXY = [event.clientX, event.clientY];
        }

        detachHelper(subscription, [ HANDLES.MOVE, HANDLES.END, HANDLES.CANCEL ], true, context);

        // make sure mouse didn't move
        if (Math.abs(endXY[0] - startXY[0]) <= sensitivity && Math.abs(endXY[1] - startXY[1]) <= sensitivity) {

            event.type = EVT_TAP;
            event.pageX = endXY[0];
            event.pageY = endXY[1];
            event.clientX = clientXY[0];
            event.clientY = clientXY[1];
            event.currentTarget = context.node;

            notifier.fire(event);
        }

    }
});
