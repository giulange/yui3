YUI.add("plugin",function(D){var A=D.Lang;function B(E){B.superclass.constructor.apply(this,arguments);}B.NAME="plugin";B.NS="plugin";var C={_listeners:null,_overrides:null,initializer:function(E){if(!E.owner){throw ("plugin needs to have an owner defined");}this.owner=E.owner;this._listeners=[];this._overrides=[];},destructor:function(){var E;for(E=0;E<this._listeners.length;E++){var F=this._listeners[E];if(A.isObject(F)){F.obj.unsubscribe(F.ev,F.fn);}}for(E=0;E<this._overrides.length;E++){var G=this._overrides[E];if(A.isObject(G)){G.obj[G.method]=G.fn;this._overrides[E]=null;}}},listen:function(H,G,F,E,I){this._listeners[this._listeners.length]={obj:H,ev:G,fn:F};H.on(G,F,E,I);},nolisten:function(H,G,F){H.unsubscribe(G,F);for(var E=0;E<this._listeners.length;E++){if((this._listeners[E].ev==G)&&(this._listeners[E].fn==F)&&(this._listeners[E].obj==H)){this._listeners[E]=null;break;}}},listenBefore:function(H,G,F,E,I){G="before"+G.charAt(0).toUpperCase()+G.substr(1)+"Change";this.listen(H,G,F,E,I);},nolistenBefore:function(G,F,E){F="before"+F.charAt(0).toUpperCase()+F.substr(1)+"Change";this.nolisten(G,F,E);},addOverride:function(F,G,E){if(A.isFunction(F[G])&&A.isFunction(E)){this._overrides[this._overrides.length]={method:G,obj:F,fn:F[G]};F[G]=E;}else{}},removeOverride:function(F,H){for(var E=0;E<this._overrides.length;E++){var G=this._overrides[E];if((G.obj==F)&&(G.method==H)){F[H]=G.fn;this._overrides[E]=null;}}},setSilent:function(F,E,G){F._configs[E].value=G;},toString:function(){return this.constructor.NAME+"["+this.constructor.NS+"]";}};D.extend(B,D.Base,C);D.Plugin=B;},"3.0.0");YUI.add("classnamemanager",function(B){if(!B.CLASS_NAME_PREFIX){B.CLASS_NAME_PREFIX="yui-";}var C="-";B.ClassNameManager=function(){};var A=B.ClassNameManager;A.ATTRS={classNamePrefix:{value:B.CLASS_NAME_PREFIX,writeOnce:true}};A.prototype={_className:null,_classNames:null,getClassName:function(F){if(!this._className){this._className=this.get("classNamePrefix")+this.constructor.NAME.toLowerCase();}if(!this._classNames){this._classNames={};}var D=this._classNames,E=D[F];if(!E){E=this._className+C+F;D[F]=E;}return E;}};},"3.0.0");YUI.add("widget",function(C){var F=C.Lang;var B="widget",O="content",E="visible",N="hidden",G="enabled",A="disabled",P="focus",S="hasFocus",R="width",H="height",T="ui",Q="div",K="",I="-";var J={};function D(U){this.uid=C.guid(B);this.rendered=false;this._plugins={};var L;if(!U.boundingBox){U=C.merge(U);L=C.Node.create(this.constructor.TEMPLATE);U.boundingBox=L;U.contentBox=L.get("firstChild");}D.superclass.constructor.apply(this,arguments);}D.NAME=B;D.TEMPLATE=[Q,[Q]];D.ATTRS={boundingBox:{set:function(L){return this._initNode(L);},writeOnce:true},contentBox:{writeOnce:true},hasFocus:{value:false},disabled:{value:false},visible:{value:true},height:{value:K},width:{value:K},strings:{}};D.getByNodeId=function(L){return J[L];};var M={initializer:function(L){this._className=this.get("classNamePrefix")+this.constructor.NAME.toLowerCase();this._initPlugins(L);if(this.id){J[this.id]=this;}},destructor:function(){this._destroyPlugins();if(this.id){delete J[this.id];}},render:function(L){if(this.destroyed){throw ("render failed; widget has been destroyed");}L=L||C.Node.get("body");if(L&&!L.contains(this._boundingBox)){L.appendChild(this._boundingBox);}if(!this.rendered&&this.fire("beforeRender")!==false){this._uiInitNode();this._bindUI();this._syncUI();if(this.renderer){this.renderer();}this.rendered=true;this.fire("render");}return this;},renderer:function(){},bindUI:function(){},renderUI:function(){},syncUI:function(){},hide:function(){return this.set(E,false);},show:function(){return this.set(E,true);},focus:function(){return this.set(S,true);},blur:function(){return this.set(S,false);},enable:function(){return this.set(G,true);},disable:function(){return this.set(A,false);},set:function(){C.Attribute.prototype.set.apply(this,arguments);return this;},getNodeAttr:function(L){if(this._boundingBox){return this._boundingBox.att(L);}return undefined;},setNodeAttr:function(L,U){if(this._boundingBox){this._boundingBox.att(L,U);}return this;},plug:function(V){if(V){if(F.isArray(V)){var U=V.length;for(var L=0;L<U;L++){this.plug(V[L]);}}else{if(F.isFunction(V)){this._plug(V);}else{this._plug(V.fn,V.cfg);}}}return this;},unplug:function(L){if(L){this._unplug(L);}else{for(L in this._plugins){this._unplug(L);}}return this;},hasPlugin:function(L){return(this._plugins[L]&&this[L]);},_initPlugins:function(L){var V=this._getClasses(),W;for(var U=0;U<V.length;U++){W=V[U];if(W.PLUGINS){this.plug(W.PLUGINS);}}if(L&&L.plugins){this.plug(L.plugins);}},_destroyPlugins:function(){this._unplug();},_plug:function(V,L){if(V&&V.NS){var U=V.NS;L=L||{};L.owner=this;if(this.hasPlugin(U)){this[U].setAtts(L);}else{this[U]=new V(L);this._plugins[U]=V;}}},_unplug:function(L){if(L){if(this[L]){this[L].destroy();delete this[L];}if(this._plugins[L]){delete this._plugins[L];}}},_bindUI:function(){this.on("visibleChange",this._onVisibleChange);this.on("disabledChange",this._onDisabledChange);this.on("heightChange",this._onHeightChange);this.on("widthChange",this._onWidthChange);this.on("hasFocusChange",this._onHasFocusChange);this._boundingBox.on(P,C.bind(this._onFocus,this));this._boundingBox.on("blur",C.bind(this._onBlur,this));},_syncUI:function(){this._uiSetVisible(this.get(E));this._uiSetDisabled(this.get(A));this._uiSetHeight(this.get(H));this._uiSetWidth(this.get(R));this._uiSetHasFocus(this.get(S));},_uiSetHeight:function(L){if(F.isNumber(L)){L=L+this.DEF_UNIT;}this._boundingBox.setStyle(H,L);},_uiSetWidth:function(L){if(F.isNumber(L)){L=L+this.DEF_UNIT;}this._boundingBox.setStyle(R,L);},_uiSetVisible:function(U){var L=this.getClassName(N);if(U===true){this._boundingBox.removeClass(L);}else{this._boundingBox.addClass(L);}},_uiSetDisabled:function(U){var L=this.getClassName(A);if(U===true){this._boundingBox.addClass(L);}else{this._boundingBox.removeClass(L);}},_uiSetHasFocus:function(V,U){var L=this.getClassName(P);if(V===true){this._boundingBox.addClass(L);
if(U!==T){this._boundingBox.focus();}}else{this._boundingBox.removeClass(L);if(U!==T){this._boundingBox.blur();}}},_initNode:function(U){if(F.isString(U)){U=C.Node.get(U);}if(U){this.id=U.get("id");this._boundingBox=U;var L=U.query(":first-child");if(L){this._contentBox=L;this.set("contentBox",L);}else{throw ("node for content box not found");}}else{throw ("node for bounding box not found");}return U;},_uiInitNode:function(){var U=this._getClasses(),V,W;for(var L=1;L<U.length;L++){V=U[L];if(V.NAME){W=this._className;this._boundingBox.addClass(W);this._contentBox.addClass(W+I+O);}}this._boundingBox.set("tabIndex",0);},_onVisibleChange:function(L){this._uiSetVisible(L.newVal);},_onDisabledChange:function(L){this._uiSetDisabled(L.newVal);},_onHeightChange:function(L){this._uiSetHeight(L.newVal);},_onWidthChange:function(L){this._uiSetWidth(L.newVal);},_onHasFocusChange:function(L){this._uiSetHasFocus(L.newVal,L.src);},_onFocus:function(){this.set(S,true,{src:T});},_onBlur:function(){this.set(S,false,{src:T});},toString:function(){return this.constructor.NAME+"["+this.id+"]";},DEF_UNIT:"px"};D.PLUGINS=[];C.extend(D,C.Base,M);C.augment(D,C.ClassNameManager);C.aggregate(D,C.ClassNameManager);C.Widget=D;},"3.0.0");