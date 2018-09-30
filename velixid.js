
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

function openPopupCenter(url, title, w, h) {
    // Fixes dual-screen position
    // Most browsers use window.screenLeft
    // Firefox uses screen.left
    var dualScreenLeft = getFirstNumber(window.screenLeft, screen.left),
        dualScreenTop = getFirstNumber(window.screenTop, screen.top),
        width = getFirstNumber(window.innerWidth, document.documentElement.clientWidth, screen.width),
        height = getFirstNumber(window.innerHeight, document.documentElement.clientHeight, screen.height),
        left = ((width / 2) - (w / 2)) + dualScreenLeft,
        top = ((height / 2) - (h / 2)) + dualScreenTop,
        newWindow = window.open(url, title, getSpecs());

    // Puts focus on the newWindow
    if (window.focus) {
        newWindow.focus();
    }

    return newWindow;

    function getSpecs() {
        return 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left;
    }

    function getFirstNumber() {
        for (var i = 0, len = arguments.length; i < len; i++) {
            var value = arguments[i];

            if (typeof value === 'number') {
                return value;
            }
        }
    }
}


var VelixID = {
    EVENTS: {
        LOGIN: 'login',
        ERROR: 'error',
        REJECT: 'reject',
        CANCEL: 'cancel'
    },

    init: function (params) {
        this._token = params.token;

        if (!prams.disableButtonSetup) {
            document.querySelectorAll('[data-button-type=velixid-login]').forEach(function (button) {
                this._styleButton(button);
                this._addBehaviour(button);
            }.bind(this));
        }

        window.addEventListener('message', function (e) {
            if (this._popup && e.data.close) {
                if (e.data.data === 'cancel') {
                    this._popup.close();
                    this._fireEvent('cancel', undefined);
                } else {
                    setTimeout(function () {
                        this._popup.close();
                    }.bind(this), 3000);

                    if (e.data.data === 'rejected') {
                        this._fireEvent('reject', undefined);
                    } else {
                        this._fireEvent('login', e.data);
                    }
                }
            }
        }.bind(this), false);
    },

    _styleButton: function (button) {
        button.style.padding = '8px 15px'
        button.style.background = '#090b23';
        button.style.color = '#ffffff';
        button.style.font = '#ffffff';
        button.style.fontFamily = 'Helvetica, Lato, Arial';
        button.style.fontSize = '12px';
        button.style.border = '0px solid';
        button.style.borderRadius = '4px';
        button.style.outline = 'none';
        button.style.cursor = 'pointer';
    },

    _addBehaviour: function (button) {
        switch (button.dataset['buttonType']) {
            case 'velixid-login':
                button.onclick = this._openLoginPopup.bind(this);
                break;
            default:
                break;
        }
    },

    _openLoginPopup: function () {
        this._popup = openPopupCenter('https://api.velix.id/popup/login/' + this._token, 'Login with Velix.ID', 500, 500);
    },

    _events: {
        'login': [],
        'error': [],
        'reject': [],
        'cancel': []
    },

    _fireEvent: function (event, data) {
        if (this._events[event]) {
            for (let index = 0; index < this._events[event].length; index++) {
                let callback = this._events[event][index];
                callback(data);
            }
        }
    },

    on: function (event, callback) {
        if (this._events[event] && typeof callback === 'function') {
            this._events[event].push(callback);
        }
    }
}

// Some AMD build optimizers, like r.js, check for condition patterns like:
if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose VelixID on the global object to prevent errors when VelixID is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    // Use `_.noConflict` to remove VelixID from the global object.
    root._ = VelixID;

    // Define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module.
    define(function () {
        return VelixID;
    });
}
// Check for `exports` after `define` in case a build optimizer adds it.
else if (freeModule) {
    // Export for Node.js.
    (freeModule.exports = VelixID)._ = VelixID;
    // Export for CommonJS support.
    freeExports._ = VelixID;
}
else {
    // Export to the global object.
    root._ = VelixID;
}
