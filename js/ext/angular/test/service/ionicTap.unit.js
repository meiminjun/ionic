window.console.debug = function(){};

describe('Ionic Tap', function() {
  var deregisterTap;

  beforeEach(function() {
    window._setTimeout = window.setTimeout;
    window.setTimeout = function(){};
    _activeElement = null; // the element which has focus

    deregisterTap = ionic.tap.register(document.createElement('div'));
  });

  afterEach(function(){
    window.setTimeout = window._setTimeout;
    deregisterTap();
  });

  /*

  Physical Device Testing Scenarios
  ---------------------------------
  - Keyboard should show up when tapping on a text input
  - Keyboard should show up when tapping on a label which surrounds a text input
  - Keyboard should go away when text input is focused, then tapped outside of input
  - Keyboard should hide when tapping the virtual keyboard's "Done" or down arrow, but tapping
    the input again will bring up the keyboard again
  - Options dialog should show when tapping on a select
  - Options dialog should show when tapping on a label which surrounds a select (not working in Android 2.3)
  - Tapping a button element should fire one click
  - Tapping an anchor element should fire one click
  - Tapping a checkbox should fire one click
  - Tapping a label which surrounds a checkbox should fire one click
  - Tapping a radio button should fire one click
  - Tapping a label which surrounds a radio button should fire one click
  - Moving an input[range] slider should work
  - Tapping the track on an input[range] slider should move the knob to that location (not a default in iOS)
  - Tapping an input[file] should bring up the file dialog
  - After tapping an input[file] and closing the input file dialog, tap a different
    element and the file dialog should NOT show up
  - Element which is disabled should not be clicked
  - Holding a touchstart, and not moving, should fire the click no matter how long the hold
  - Holding a mousedown, and not moving, should fire the click no matter how long the hold
  - Holding touchstart, then moving a few pixels cancels the click
  - Holding mousedown, then moving a few pixels cancels the click
  - Touchstart should set and remove the activated css class
  - Mousedown should set and remove the activated css class
  - Holding touchstart, then moving a few pixels removes the activated css class
  - Holding mousedown, then moving a few pixels removes the activated css class
  - An element or one of its parents with data-tap-disabled attribute should still click, but w/ a delay
  - ALL THE ABOVE, BUT NOW WITH NG-CLICK ON THE INPUT!
  - Tapping a div with an click event added should fire one click

  Tested on:
  ----------------------------
  - iOS6 iPad 3
  - iOS7 iPhone 5

  */

  it('Should trigger a labels child inputs click, but stop the labels end event', function() {
    var e = {
      type: 'touchstart',
      target: {
        tagName: 'LABEL',
        dispatchEvent: function() { e.target.dispatchedEvent = true },
        focus: function() { e.target.focused = true },
        control: {
          tagName: 'INPUT',
          dispatchEvent: function() { e.target.control.dispatchedEvent = true },
          focus: function() { e.target.control.focused = true },
        }
      },
      stopPropagation: function() { e.stoppedPropagation = true },
      preventDefault: function() { e.preventedDefault = true }
    };

    tapClick(e);

    expect( e.target.dispatchedEvent ).toBeUndefined();
    expect( e.target.focused ).toBeUndefined();

    expect( e.target.control.dispatchedEvent ).toBeDefined();
    expect( e.target.control.focused ).toBeDefined();

    expect( e.stoppedPropagation ).toBeUndefined();
    expect( e.preventedDefault ).toBeDefined();
  });

  it('Should trigger a click for an element w/out a wrapping label', function() {
    var e = {
      type: 'touchstart',
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { e.target.dispatchedEvent = true },
        focus: function() { e.target.focused = true },
      },
      stopPropagation: function() { e.stoppedPropagation = true },
      preventDefault: function() { e.preventedDefault = true }
    };

    tapClick(e);

    expect( e.target.dispatchedEvent ).toBeDefined();
    expect( e.target.focused ).toBeDefined();

    expect( e.stoppedPropagation ).toBeUndefined();
    expect( e.preventedDefault ).toBeUndefined();

  });

  it('Should not trigger a click if tapPointerMoved has moved', function() {
    var e = {
      type: 'touchstart',
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { e.target.dispatchedEvent = true },
        focus: function() { e.target.focused = true },
      },
      stopPropagation: function() { e.stoppedPropagation = true },
      preventDefault: function() { e.preventedDefault = true }
    };

    tapPointerMoved = true;
    expect( tapClick(e) ).toEqual(false);

  });

  it('Should trigger click on mouseup and when nearby mousedown happened', function() {
    var e = {
      type: 'mousedown',
      clientX: 100, clientY: 100,
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { e.target.dispatchedEvent = true },
        focus: function() { e.target.focused = true },
      },
      stopPropagation: function() { e.stoppedPropagation = true },
      preventDefault: function() { e.preventedDefault = true }
    };

    expect( e.target.dispatchedEvent ).toBeUndefined();

    tapMouseDown({clientX: 101, clientY: 101});
    tapMouseUp(e);

    expect( e.target.dispatchedEvent ).toBeDefined();
  });

  it('Should not trigger click on mouseup because mousedown coordinates too far away', function() {
    var e = {
      clientX: 100, clientY: 100,
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { e.target.dispatchedEvent = true },
        focus: function() { e.target.focused = true },
      },
      stopPropagation: function() { e.stoppedPropagation = true },
      preventDefault: function() { e.preventedDefault = true }
    };

    expect( e.target.dispatchedEvent ).toBeUndefined();

    tapMouseDown({clientX: 201, clientY: 101});
    tapMouseUp(e);

    expect( e.target.dispatchedEvent ).toBeUndefined();
  });

  it('Should set tapHasPointerMoved=false on tapTouchStart', function() {
    tapPointerMoved = null;
    tapTouchStart({});
    expect( tapPointerMoved ).toEqual(false);
  });

  it('Should set tapPointerMoved=false on tapTouchCancel', function() {
    tapPointerMoved = true;
    tapTouchCancel();
    expect( tapPointerMoved ).toEqual(false);
  });

  it('Should set tapHasPointerMoved=true on tapTouchMove', function() {
    tapPointerMoved = null;
    tapTouchStart({ clientX: 100, clientY: 100 });
    expect( tapPointerMoved ).toEqual(false);
    tapTouchMove({ clientX: 200, clientY: 100 });
    expect( tapPointerMoved ).toEqual(true);
  });

  it('Should set tapHasPointerMoved=false on tapMouseDown', function() {
    tapPointerMoved = null;
    tapMouseDown({});
    expect( tapPointerMoved ).toEqual(false);
  });

  it('Should set tapPointerMoved=false on tapMouseUp', function() {
    tapPointerMoved = true;
    tapMouseUp({});
    expect( tapPointerMoved ).toEqual(false);
  });

  it('Should set tapHasPointerMoved=true on tapMouseMove', function() {
    tapPointerMoved = null;
    tapMouseDown({ clientX: 100, clientY: 100 });
    expect( tapPointerMoved ).toEqual(false);
    tapMouseMove({ clientX: 200, clientY: 100 });
    expect( tapPointerMoved ).toEqual(true);
  });

  it('Should trigger click on touchend and nearby touchstart happened', function() {
    var e = {
      type: 'touchend',
      clientX: 101, clientY: 101,
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { e.target.dispatchedEvent = true },
        focus: function() { e.target.focused = true },
      },
      stopPropagation: function() { e.stoppedPropagation = true },
      preventDefault: function() { e.preventedDefault = true }
    };

    tapTouchStart({clientX: 100, clientY: 100});
    tapTouchEnd(e);

    expect( e.target.dispatchedEvent ).toBeDefined();
  });

  it('Should not trigger click on touchend because touchstart coordinates too far away', function() {
    var e = {
      type: 'touchstart',
      clientX: 100, clientY: 100,
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { e.target.dispatchedEvent = true },
        focus: function() { e.target.focused = true },
      },
      stopPropagation: function() { e.stoppedPropagation = true },
      preventDefault: function() { e.preventedDefault = true }
    };

    expect( e.target.dispatchedEvent ).toBeUndefined();

    tapTouchStart({clientX: 200, clientY: 100});

    tapTouchEnd(e);

    expect( e.target.dispatchedEvent ).toBeUndefined();
  });

  it('Should tapEnabledTouchEvents because of touchstart', function() {
    tapEnabledTouchEvents = false;
    tapTouchStart({});
    tapEnabledTouchEvents = true;
  });

  it('Should cancel click on touchcancel', function() {
    tapTouchCancel();
    expect(tapPointerMoved).toEqual(false);
  });

  it('Should cancel click when touchmove coordinates goes too far from touchstart coordinates', function() {
    var e = { clientX: 100, clientY: 100 };
    tapTouchStart(e);

    expect( tapTouchMove({ clientX: 102, clientY: 100 }) ).toBeUndefined();

    expect( tapTouchMove({ clientX: 105, clientY: 100 }) ).toBeUndefined();

    expect( tapTouchMove({ clientX: 200, clientY: 100 }) ).toEqual(false);
  });

  it('Should cancel click when touchend coordinates are too far from touchstart coordinates', function() {
    var e = {
      clientX: 100, clientY: 100,
      dispatchEvent: function(){ this.dispatchedEvent = true; }
    };
    tapTouchStart(e);
    tapTouchEnd({ clientX: 200, clientY: 100 })
    expect( e.dispatchedEvent ).toBeUndefined();
  });

  it('Should cancel click when mousemove coordinates goes too far from mousedown coordinates', function() {
    var e = { clientX: 100, clientY: 100 };
    tapMouseDown(e);

    expect( tapMouseMove({ clientX: 102, clientY: 100 }) ).toBeUndefined();

    expect( tapMouseMove({ clientX: 105, clientY: 100 }) ).toBeUndefined();

    expect( tapMouseMove({ clientX: 200, clientY: 100 }) ).toEqual(false);
  });

  it('Should cancel click when mouseup coordinates are too far from mousedown coordinates', function() {
    var e = {
      clientX: 100, clientY: 100,
      dispatchEvent: function(){ this.dispatchedEvent = true; }
    };
    tapMouseDown(e);
    tapMouseUp({ clientX: 200, clientY: 100 });
    expect( e.dispatchedEvent ).toBeUndefined();
  });

  it('Should do nothing if mousedown is a custom event from ionic tap', function() {
    var e = {
      isTapHandled: false,
      isIonicTap: true
    };
    tapMouseDown(e);
    expect( e.isTapHandled ).toEqual(false);
  });

  it('Should tapClick with touchend and fire immediately', function() {
    var e = {
      target: {
        tagName: 'button',
        dispatchEvent: function(){
          this.dispatchedEvent = true;
        }
      }
    }
    tapClick(e);
    expect(e.target.dispatchedEvent).toEqual(true);
  });

  it('Should tapHasPointerMoved false if are null', function() {
    expect( tapHasPointerMoved(null) ).toEqual(false);
  });

  it('Should tapPointerStart false if are null', function() {
    tapPointerStart = null;
    expect( tapHasPointerMoved(null) ).toEqual(false);
  });

  it('Should tapPointerStart false if are null', function() {
    var e = {};
    tapPointerStart = {x:0, y:0};
    expect( tapHasPointerMoved(e) ).toEqual(false);
  });

  it('Should tapHasPointerMoved true if greater than or equal to release tolerance', function() {
    tapPointerStart = { x: 100, y: 100 };

    var s = tapHasPointerMoved({ clientX: 111, clientY: 100 });
    expect(s).toEqual(true);

    s = tapHasPointerMoved({ clientX: 89, clientY: 100 });
    expect(s).toEqual(true);

    s = tapHasPointerMoved({ clientX: 100, clientY: 109 });
    expect(s).toEqual(true);

    s = tapHasPointerMoved({ clientX: 100, clientY: 91 });
    expect(s).toEqual(true);

    s = tapHasPointerMoved({ clientX: 100, clientY: 200 });
    expect(s).toEqual(true);
  });

  it('Should tapHasPointerMoved false if less than release tolerance', function() {
    tapPointerStart = { x: 100, y: 100 };

    var s = tapHasPointerMoved({ clientX: 100, clientY: 100 });
    expect(s).toEqual(false);

    s = tapHasPointerMoved({ clientX: 104, clientY: 100 });
    expect(s).toEqual(false);

    s = tapHasPointerMoved({ clientX: 96, clientY: 100 });
    expect(s).toEqual(false);

    s = tapHasPointerMoved({ clientX: 100, clientY: 102 });
    expect(s).toEqual(false);

    s = tapHasPointerMoved({ clientX: 100, clientY: 98 });
    expect(s).toEqual(false);
  });

  it('Should not be tapHasPointerMoved if 0 coordinates', function() {
    var e = { clientX: 0, clientY: 0 };
    var s = tapHasPointerMoved(e, { clientX: 100, clientY: 100 });
    expect(s).toEqual(false);
  });

  it('Should get coordinates from page mouse event', function() {
    var e = { pageX: 77, pageY: 77 };
    var c = getPointerCoordinates(e);
    expect(c).toEqual({x:77, y: 77});
  });

  it('Should get coordinates from client mouse event', function() {
    var e = { clientX: 77, clientY: 77 };
    var c = getPointerCoordinates(e);
    expect(c).toEqual({x:77, y: 77});
  });

  it('Should get coordinates from changedTouches touches', function() {
    var e = {
      touches: [{ clientX: 99, clientY: 99 }],
      changedTouches: [{ clientX: 88, clientY: 88 }]
    };
    var c = getPointerCoordinates(e);
    expect(c).toEqual({x:88, y: 88});
  });

  it('Should get coordinates from page touches', function() {
    var e = {
      touches: [{ pageX: 99, pageY: 99 }]
    };
    var c = getPointerCoordinates(e);
    expect(c).toEqual({x:99, y: 99});
  });

  it('Should get coordinates from client touches', function() {
    var e = {
      touches: [{ clientX: 99, clientY: 99 }]
    };
    var c = getPointerCoordinates(e);
    expect(c).toEqual({x:99, y: 99});
  });

  it('Should get 0 coordinates', function() {
    var e = {};
    var c = getPointerCoordinates(e);
    expect(c).toEqual({x:0, y: 0});
  });

  it('Should not tapClick for disabled elements', function() {
    // Disabled elements should not be tapped
    var targetEle = document.createElement('input');
    targetEle.disabled = true;

    var e = {
      target: targetEle
    }

    expect( tapClick(e) ).toEqual(false);
  });

  it('Should tapRequiresNativeClick for invalid element', function() {
    expect( tapRequiresNativeClick( null ) ).toEqual(true);
  });

  it('Should tapRequiresNativeClick for input.disabled', function() {
    var ele = document.createElement('input');
    ele.disabled = true;
    expect( tapRequiresNativeClick( ele ) ).toEqual(true);
  });

  it('Should tapRequiresNativeClick for input[range]', function() {
    var ele = document.createElement('input');
    ele.type = 'range';
    expect( tapRequiresNativeClick( ele ) ).toEqual(true);
  });

  it('Should tapRequiresNativeClick for input[file]', function() {
    var ele = document.createElement('input');
    ele.type = 'file';
    expect( tapRequiresNativeClick( ele ) ).toEqual(true);
  });

  it('Should tapRequiresNativeClick for video element', function() {
    var ele = document.createElement('video');
    expect( tapRequiresNativeClick( ele ) ).toEqual(true);
  });

  it('Should tapRequiresNativeClick for object element', function() {
    var ele = document.createElement('object');
    expect( tapRequiresNativeClick( ele ) ).toEqual(true);
  });

  it('Should not tapRequiresNativeClick for common inputs', function() {
    var inputTypes = ['text', 'email', 'search', 'tel', 'number', 'date', 'month', 'password', null, undefined, ''];
    for(var x=0; x<inputTypes.length; x++) {
      var targetEle = document.createElement('input');
      targetEle.type = inputTypes[x];
      expect( tapRequiresNativeClick(targetEle) ).toEqual(false);
    }
    expect( tapRequiresNativeClick( document.createElement('img') ) ).toEqual(false);
    expect( tapRequiresNativeClick( document.createElement('div') ) ).toEqual(false);
    expect( tapRequiresNativeClick( document.createElement('textarea') ) ).toEqual(false);
    expect( tapRequiresNativeClick( document.createElement('select') ) ).toEqual(false);
  });

  it('Should tapRequiresNativeClick for an element with data-tap-disabled attribute', function() {
    var div = document.createElement('div');
    expect( tapRequiresNativeClick( div ) ).toEqual(false);

    div.setAttribute('data-tap-disabled', "true")
    expect( tapRequiresNativeClick( div ) ).toEqual(true);
  });

  it('Should tapRequiresNativeClick for an element with one of its parents with data-tap-disabled attribute', function() {
    var div1 = document.createElement('div');
    var div2 = document.createElement('div');
    var div3 = document.createElement('div');
    var div4 = document.createElement('div');
    var div5 = document.createElement('div');

    div1.appendChild(div2);
    div2.appendChild(div3);
    div3.appendChild(div4);
    div4.appendChild(div5);

    div2.setAttribute('data-tap-disabled', "true");

    expect( tapRequiresNativeClick( div1 ) ).toEqual(false);
    expect( tapRequiresNativeClick( div2 ) ).toEqual(true);
    expect( tapRequiresNativeClick( div3 ) ).toEqual(true);
    expect( tapRequiresNativeClick( div4 ) ).toEqual(true);
    expect( tapRequiresNativeClick( div5 ) ).toEqual(true);
  });

  it('Should not allow a click that has an input target but not created by tapClick', function() {
    var e = {
      target: document.createElement('input'),
      stopPropagation: function(){ this.stoppedPropagation = true },
      preventDefault: function(){ this.preventedDefault = true }
    };
    tapClickGateKeeper(e);

    expect( e.stoppedPropagation ).toBeDefined();
    expect( e.preventedDefault ).toBeDefined();
  });

  it('Should allow a click that is a tapClick', function() {
    var e = {
      target: document.createElement('input'),
      isIonicTap: true,
      stopPropagation: function(){ this.stoppedPropagation = true },
      preventDefault: function(){ this.preventedDefault = true }
    };
    tapClickGateKeeper(e);

    expect( e.stoppedPropagation ).toBeUndefined();
    expect( e.preventedDefault ).toBeUndefined();
  });

  it('Should allow a click that is an ignore element', function() {
    var e = {
      target: document.createElement('input'),
      stopPropagation: function(){ this.stoppedPropagation = true },
      preventDefault: function(){ this.preventedDefault = true }
    };
    e.target.type = 'range';
    tapClickGateKeeper(e);

    expect( e.stoppedPropagation ).toBeUndefined();
    expect( e.preventedDefault ).toBeUndefined();
  });

  it('Should focus input', function() {
    var ele = {
      tagName: 'INPUT',
      focus: function(){ this.hasFocus=true; }
    }
    tapHandleFocus(ele);
    expect( ele.hasFocus ).toEqual(true);
  });

  it('Should focus textarea', function() {
    var ele = {
      tagName: 'TEXTAREA',
      focus: function(){ this.hasFocus=true; }
    }
    tapHandleFocus(ele);
    expect( ele.hasFocus ).toEqual(true);
  });

  it('Should set tapTouchFocusedInput if touch event and text input', function() {
    tapEnabledTouchEvents = true;
    var ele = {
      tagName: 'TEXTAREA'
    }
    tapHandleFocus(ele);
    expect( tapTouchFocusedInput ).toEqual(ele);
  });

  it('Should not set tapTouchFocusedInput if mouse event and text input', function() {
    tapEnabledTouchEvents = false;
    var ele = {
      tagName: 'TEXTAREA'
    }
    tapHandleFocus(ele);
    expect( tapTouchFocusedInput ).toEqual(null);
  });

  it('Should focus select', function() {
    var ele = {
      tagName: 'SELECT',
      focus: function(){ this.hasFocus=true; },
      dispatchEvent: function(){}
    }
    tapHandleFocus(ele);
    expect( ele.hasFocus ).toEqual(true);
    expect( tapTouchFocusedInput ).toEqual(null);
  });

  it('Should not focus on common elements', function() {
    var tags = ['div', 'span', 'i', 'body', 'section', 'article', 'aside', 'li', 'p', 'header', 'button', 'ion-content'];
    for(var x=0; x<tags.length; x++) {
      var ele = {
        tagName: tags[x],
        focus: function(){ this.hasFocus=true; }
      }
      tapHandleFocus(ele);
      expect( ele.hasFocus ).toBeUndefined();
    }
  });

  it('Should not focus on an input that already has focus', function() {
    var ele = {
      tagName: 'INPUT',
      focus: function(){ this.hasFocus=true; }
    }
    tapHandleFocus(ele);
    expect( ele.hasFocus ).toEqual(true);

    ele.focus = function(){ this.hasSecondFocus=true }
    tapHandleFocus(ele);
    expect( ele.hasSecondFocus ).toBeUndefined();
  });

  it('Should not focus out on common elements', function() {
    var tags = ['div', 'span', 'i', 'body', 'section', 'article', 'aside', 'li', 'p', 'header', 'button', 'ion-content'];
    for(var x=0; x<tags.length; x++) {
      var ele = {
        tagName: tags[x],
        blur: function(){ this.hasBlurred=true; }
      }
      tapActiveElement(ele);
      tapFocusOutActive(ele);
      expect( ele.hasBlurred ).toBeUndefined();
    }
  });

  it('Should focus out on input elements', function() {
    var tags = ['input', 'textarea', 'select'];
    for(var x=0; x<tags.length; x++) {
      var ele = {
        tagName: tags[x],
        blur: function(){ this.hasBlurred=true; }
      }
      tapActiveElement(ele);
      tapFocusOutActive(ele);
      expect( ele.hasBlurred ).toEqual(true);
    }
  });

  it('Should not prevent scrolling', function() {
    var target = document.createElement('div');
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(false);
  });

  it('Should prevent scrolling because the event has defaultedPrevented', function() {
    var target = document.createElement('div');
    var e = {
      target: target,
      defaultPrevented: true
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);
  });

  it('Should not prevent scrolling if the target was an input or textarea', function() {
    var target = document.createElement('input');
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(false);

    e.target = document.createElement('textarea');
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(false);

    e.target = document.createElement('select');
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(false);
  });

  it('Should not prevent scrolling if the target was an input or textarea, and the target is the same as the active element', function() {
    var target = document.createElement('input');
    tapActiveElement(target);
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(false);
  });

  it('Should not prevent scrolling if the target isContentEditable', function() {
    var target = document.createElement('div');
    target.isContentEditable = true;
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(false);
  });

  it('Should prevent scrolling if the target has dataset.preventScroll', function() {
    var target = document.createElement('div');
    target.setAttribute('data-prevent-scroll', 'true');
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);

    target = document.createElement('div');
    target.dataset.preventScroll = true;
    e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);

    target = document.createElement('div');
    target.dataset.preventScroll = 'true';
    e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);
  });

  it('Should prevent scrolling if the browser doesnt support dataset but target has data-prevent-default attribute', function() {
    var target = {
      tagName: 'div',
      getAttribute: function(val) {
        if(val === 'data-prevent-default') {
          return 'true';
        }
      }
    }
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);
  });

  it('Should prevent scrolling if the target is an object or embed', function() {
    var target = document.createElement('object');
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);

    target = document.createElement('embed');
    e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);
  });

  it('Should get target element from event', function() {
    var e = {
      target: document.createElement('div')
    };
    expect( tapTargetElement(e).tagName ).toEqual('DIV');
  });

  it('Should get labels input control from event target', function() {
    var label = document.createElement('label');
    var input = document.createElement('input');
    label.appendChild(input);

    var e = {
      target: label
    };
    expect( tapTargetElement(e).tagName ).toEqual('INPUT');
  });

  it('Should get button target even if it has children from es target', function() {
    var button = document.createElement('button');
    var span = document.createElement('span');
    button.appendChild(span);

    var e = {
      target: button
    };
    expect( tapTargetElement(e, null).tagName ).toEqual('BUTTON');
  });

  it('Should isTextInput', function() {
    expect( ionic.tap.isTextInput(null) ).toEqual(false);

    var ele = document.createElement('textarea');
    expect( ionic.tap.isTextInput(ele) ).toEqual(true);

    ele = document.createElement('input');
    expect( ionic.tap.isTextInput(ele) ).toEqual(true);

    ele.type = 'search';
    expect( ionic.tap.isTextInput(ele) ).toEqual(true);

    ele.type = 'url';
    expect( ionic.tap.isTextInput(ele) ).toEqual(true);

    ele.type = 'email';
    expect( ionic.tap.isTextInput(ele) ).toEqual(true);

    ele.type = 'range';
    expect( ionic.tap.isTextInput(ele) ).toEqual(false);

    ele.type = 'file';
    expect( ionic.tap.isTextInput(ele) ).toEqual(false);

    ele.type = 'submit';
    expect( ionic.tap.isTextInput(ele) ).toEqual(false);

    ele.type = 'reset';
    expect( ionic.tap.isTextInput(ele) ).toEqual(false);
  });

  it('Should reset focus to tapTouchFocusedInput if the active element changed from mousedown', function() {
    tapEnabledTouchEvents = true;
    tapActiveElement(document.createElement('textarea'));

    var tapFocusedEle = document.createElement('input');
    tapFocusedEle.focus = function(){
      this.hasFocus = true;
    }

    tapTouchFocusedInput = tapFocusedEle;

    var e = {
      target: document.createElement('input')
    };
    tapFocusIn(e);

    expect( tapFocusedEle.hasFocus ).toEqual(true);
    expect( tapTouchFocusedInput ).toEqual(null);
  });

});