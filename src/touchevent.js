/*
 * @name TouchEvent Module
 * @desc
 		touch event,tuchdown/up/on/press/move
		events are bound to $ object,like this:
		$('').touchon(function(){
			//
		});
		
 * @dependencies
 		os module
		zepto.module ,this is the default item,can be reset
 */
;(function(undefined){
	if(module.declare === undefined){
		throw 'There is no global module.declare method!';
	}
	module.alias({
		'zepto.module':'{modules}/zepto.module',
		'os':'{plugins}/os'
	});
	module.globals({
		'$':'zepto.module'
	});
	module.defaults('touchevent',{
		pressTime:1000,//long click time
		delayTime:0,//click delay time
		offsetTime:200,//offset time
        rotateAngle:5,//the min rotate angle
        scale:0.2,//the min scale 
		eventListenerZone:document//Event monitoring area
	});
	// is empty object
	function isEmptyObject(obj){
		for(var name in obj){
			return false;
		}
		
		return true;
	};
	/*
	 * Event Manager
	 */
	function EventManager(el,name,fn){
		if(el === undefined || el === null){
			
			return ;
		}
		el[EventManager.expando]=el[EventManager.expando]||EventManager.gid++;
		
		EventManager.regist(el,name,fn);
	};
	//event regist
	EventManager.regist=function(el,name,fn){
		if(typeof fn !== 'function'){
			
			return ;
		}
		var gid=el[EventManager.expando];
		EventManager.Event[gid]=EventManager.Event[gid]||{};
		EventManager.Event[gid][name]=EventManager.Event[gid][name]||[];
		EventManager.Event[gid][name].push(fn);
	};
	//event remove
	EventManager.remove=function(el,name,fn){
		var gid=el[EventManager.expando],
			evt=EventManager.get(el,name,fn);
		if(evt && el){
			//to remove a group of events
			if(fn === undefined){
				if(EventManager.Event[gid] && EventManager.Event[gid][name]){
					delete EventManager.Event[gid][name];
				}
				evt.forEach(function(fun,index){
					el.removeEventListener(name,fun,false);
				});
				
				return ;
			}
			var i=evt['index'];
			//to remove an event
			EventManager.Event[gid][name].splice(i,1);
			el.removeEventListener(name,fn,false);
		}
	};
	//get the event object
	EventManager.get=function(el,name,fn){
		var gid=el[EventManager.expando];
		if(gid === undefined || gid === null){
			
			return ;
		}
		if(!(EventManager.Event[gid] && EventManager.Event[gid][name])){
			
			return ;
		}
		//returns a set of events
		if(fn === undefined){
			
			return EventManager.Event[gid][name];
		}
		//returns an event
		var i=0,
			len=EventManager.Event[gid][name].length;
		for(;i<len;i++){
			if(EventManager.Event[gid][name][i] === fn){
				
				return {index:i,fn:fn};
			}
		}
		
		return ;
	};
	//event dispatch
	EventManager.dispatch=function(el,type,e){
		var fn=EventManager.get(el,type);
        
		fn&&fn.forEach(function(fun,index){
			fun.call(el,e);
		});
	};
	//whether the event is in the Event Manager
	EventManager.isIn=function(el){
		var gid=el[EventManager.expando];
		
		return EventManager.Event[gid] ? true : false;
	};
	//event container
	/*
	 * event storage way
	   {
	   		gid:{
				touchname:[]
			}
	   }
	 */
	EventManager.Event={};
	//unique field attribute
	EventManager.expando='_TouchEvent'+(''+Math.random()).replace( /\D/g,'');
	//global id
	EventManager.gid=1;
    
    var globals=module.globals(),
		$name=globals['$'];
	//define touchevent module
	module.declare('touchevent',[$name,'os'],function(require,exports){
		var os=require('os'),
			$=require($name),
			defaults=module.defaults('touchevent');
			
		var handEvent=['down','up','on','press','move'],
            gettureEvent=['down','up','move','rotate','scale'],
            eventsName=[handEvent,gettureEvent];
            
		var desktop=os.desktop;
		var touchName='touch',
            gestureName='gesture',
            eventName={},
			el=defaults.eventListenerZone||document;
            //
            eventName[touchName]=desktop ? 'HTMLEvents' : 'TouchEvent';
            eventName[gestureName]=desktop ? 'HTMLEvents' : 'GestureEvent';
		
        var eventsArray=[touchName,gestureName];
        
        var //touch event name
            START_EV=desktop ? 'mousedown' : 'touchstart',
			MOVE_EV=desktop ? 'mousemove' : 'touchmove',
			END_EV=desktop ? 'mouseup' : 'touchend',
            //gesture event name
            GESTURE_START_EV=desktop ? 'mousedown' : 'gesturestart',
            GESTURE_CHANGE_EV=desktop ? 'mousemove' : 'gesturechange',
            GESTURE_END_EV=desktop ? 'mouseup' : 'gestureend';
		//touch event binding mechanism
		function TouchBind($){
			/*
			 * down	: touch down
			 * up	: touch up
			 * on	: touch on
			 * press: touch press
			 * move	: touch move
			 *
			 */
			$.fn.eventAccess=function(elems,fun,name,fn){
				var i=0,
					l=elems.length;
				for(;i<l;i++){
					fun.call(elems[i],name,fn);
				}
				
				return this;
			};
            //touch event bind
            $.each(eventsArray,function(i,n){
                $.each(eventsName[i],function(index,name){
                    
                    $.fn[n+name]=function(fn,bubbles,cancelable){
                        cancelable=cancelable ===undefined ? true : cancelable;
                    bubbles=bubbles === true ? true : false;
                        
                        return this.eventAccess(this,function(name,fn){
                            if(fn == null){
                                //directly trigger
                                this.dispatchEvent(this.event[name]);
                                return;
                            }
                            var _this=this,
                                evt=document.createEvent(eventName[n]);
                            
                            _this.bubbles=bubbles;//bubbles
                            _this.addEventListener(name,fn,bubbles);
                            
                            new EventManager(_this,name,fn);//event regist
                        },n+name,fn);
                    }
                });
            });
            //touch/gesture event unbind
            $.each(eventsArray,function(i,n){
                $.fn['unbind'+n]=function(name,fn){
                    return this.eventAccess(this,function(name,fn){
                        (function(el,name){
                            var t=setTimeout(function(){
                                clearTimeout(t);
                                
                                EventManager.remove(el,name,fn);
                            });
                        })(this,n+name);//touch*/gesture* name
                    },name,fn);
                };
            });
		};
		//touch event realization mechanism
		function TouchEvent(el){
			if(typeof el === 'string'){
				el=document.getElementById(el);	
			}
            
            //touch event
			el.addEventListener(START_EV,this,true);
            //gesture event
            el.addEventListener(GESTURE_START_EV,this,true); 
		};
        
        //touch textarea
        function TouchInputBox(e,el){
            var target=e.target,
                point=(e.touches && e.touches[0])||e,
                delta=el.delta;
            if(target.tagName === 'INPUT'){//input
                
                return e.preventDefault();
            }
            if(target.tagName === 'TEXTAREA'){//textarea
                var top=target.scrollTop <= 0,
                    bottom=target.scrollTop + target.clientHeight >= target.scrollHeight,
                    up=(point.layerY||point.pageY) > delta.startY,
                    down=(point.layerY||point.pageY) < delta.startY;
                if((top && up) || (bottom && down)){
                    e.preventDefault();
                }else{
                    e.stopPropagation();
                }
            }
        };
        
		TouchEvent.prototype={
			dx:0,
			dy:0,
			cx:0,
			cy:0,
			isInPressTime:true,
			isInDelayTime:true,
			triggered:false,
			moved:false,
			pressTimeout:null,
			delayTimeout:null,
			handleEvent:function(e){
                var target=e.target;
				
				if(desktop && e.button != 0){//don't left key
					
                    return;
				}
				if(target.nodeType === 3){//text node
					target=target.parentNode;
				}
				this.triggered=false;//is triggered
                
                this.isInPressTime=true;
                var _this=this;
                //delay time
				if(this.delayTimeout === null){
					var dtime=defaults.delayTime;
					dtime=dtime-defaults.offsetTime;
					dtime=dtime > 0 ? dtime : 0;
					_this.delayTimeout=setTimeout(function(){
						_this.isInDelayTime=true;
						clearTimeout(_this.delayTimeout);
						_this.delayTimeout=null;
					},dtime);
				}
                
				while(target.nodeType !== 9){
					if(EventManager.isIn(target)){
						this[e.type].call(this,e,target);
						if(target.bubbles){//don't bubbles
							
                            return;	
						}
					}
					target=target && target.parentNode ? target.parentNode : document;
				}
			},
			mousedown:function(e,target){
				this.touchstart(e,target);
			},
			mousemove:function(e,target){
				//to deal input box
                TouchInputBox(e,target);
                
				this.touchmove(e,target);
			},
			mouseup:function(e,target){
				
				this.touchend(e,target);
			},
			touchstart:function(e,target){
                var point=(e.touches && e.touches[0])||e;
                //delta info
                target.delta={
                    startX:point.layerX||point.pageX,
                    startY:point.layerY||point.pageY,
                    endX:point.layerX||point.pageX,
                    endY:point.layerY||point.pageY,
                    moveX:0,
                    moveY:0
                }
                var down=touchName+'down';
                var _this=this;
                this.moved=false;
                
                //trigger touch down event
				EventManager.dispatch(target,down,e);
				
				//long time according to
				if(this.pressTimeout === null){
					var ptime=defaults.pressTime;
					ptime=ptime-defaults.offsetTime;
					ptime=ptime > 0 ? ptime : 0;
					_this.pressTimeout=setTimeout(function(){
						_this.isInPressTime=!_this.isInPressTime;
						if(!_this.isInPressTime && !_this.moved){
							var press=touchName+'press'
							//trigger touch press event
							EventManager.dispatch(target,press,e);
						}
						clearTimeout(_this.pressTimeout);
						_this.pressTimeout=null;
					},ptime);
				}
				
				document.addEventListener(MOVE_EV, this, true);
				document.addEventListener(END_EV, this, true);
                document.removeEventListener(START_EV, this, false);
			},
			touchmove:function(e,target){
                //to deal input box
                TouchInputBox(e,target);
                
                var point=(e.touches && e.touches[0])||e;
                //update delta info
                target.delta=target.delta||{};
                target.delta.endX=point.layerX||point.pageX;
                target.delta.endY=point.layerY||point.pageY;
                target.delta.moveX=target.delta.endX-target.delta.startX;
                target.delta.moveY=target.delta.endY-target.delta.startY;
                
                this.moved=true;
                if(desktop && (target.delta.moveX === 0 || target.delta.moveY === 0)){//from a browser window into another browser window
                    this.moved=false;
                }
				//moving ,not long press
				this.isInPressTime=true;
				//trigger touch move event
				var move=touchName+'move';
				EventManager.dispatch(target,move,e);
			},
			touchend:function(e,target){
				//remove event listener
				document.removeEventListener(MOVE_EV, this, true);
				document.removeEventListener(END_EV, this, true);
				var theEvent = null;
				//this.moved=desktop ? false : this.moved;
				
				var up=touchName+'up';
				//trigger touch up event
				EventManager.dispatch(target,up,e);
                
				if(this.isInPressTime && this.isInDelayTime && !this.moved){
					var on=touchName+'on';
                    /*if(this.prevTarget !== null && this.triggered){
                       this.isInDelayTime=false;// 
                    }*/
    
                    this.prevTarget=target;
					//trigger touch on event
					EventManager.dispatch(target,on,e);
				}
	
				clearTimeout(this.pressTimeout);//clear long press time
				this.pressTimeout=null;
				this.triggered=true;
			},
            gesturestart:function(e,target){
                var point=(e.touches && e.touches[0])||e;
                //delta
                target.delta={
                    startX:point.layerX||point.pageX,
                    startY:point.layerY||point.pageY,
                    endX:point.layerX||point.pageX,
                    endY:point.layerY||point.pageY,
                    moveX:0,
                    moveY:0
                }
                
                var down=gestureName+'down';
                //trigger touch down event
				EventManager.dispatch(target,down,e);
                
                document.addEventListener(GESTURE_CHANGE_EV, this, true);
				document.addEventListener(GESTURE_END_EV, this, true);
                document.removeEventListener(GESTURE_START_EV, this, false);
            },
            gesturechange:function(e,target){
                var point=(e.touches && e.touches[0])||e;
                //delta
                target.delta=target.delta||{};
                target.delta.endX=point.layerX||point.pageX;
                target.delta.endY=point.layerY||point.pageY;
                target.delta.moveX=point.layerX-target.delta.startX;
                target.delta.moveY=point.layerY-target.delta.startY;
                
                //trigger gesture move event
				var move=gestureName+'move';
				EventManager.dispatch(target,move,e);
                
                //trigger gesture rotate event
                var rotate=gestureName+'rotate';
                target.rotation=e.rotation||0;
                EventManager.dispatch(target,rotate,e);
                
                //trigger gesture scale event
                var scale=gestureName+'scale';
                target.scale=e.scale||1;
                EventManager.dispatch(target,scale,e);
            },
            gestureend:function(e,target){
                //remove event listener
				document.removeEventListener(GESTURE_CHANGE_EV, this, false);
				document.removeEventListener(GESTURE_END_EV, this, false);
                
                var up=gestureName+'up';
                
                //delta
                target.delta.endX=e.layerX;
                target.delta.endY=e.layerY;
                target.delta.moveX=e.layerX-target.delta.startX;
                target.delta.moveY=e.layerY-target.delta.startY;
                
				//trigger gesture up event
				EventManager.dispatch(target,up,e);
            }
		};
		//event bind
		TouchBind($);
		//add event listeners
		new TouchEvent(el);
	});
})();