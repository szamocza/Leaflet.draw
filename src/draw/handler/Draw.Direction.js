function toDir(from, to) {
    var x = to.lng - from.lng;
    var y = to.lat - from.lat;
    var l = Math.sqrt(x*x + y*y);
    if(l > 0.000001) {
        var result = Math.asin(x / l);
        if(y < 0) {
            return 3.1415 - result;
        } else {
            return result;
        }
    } else {
        return 0;
    }
}

var piPer4 = 3.1415 / 4;

function wrapDivIcon(options, direction) {
    return L.divIcon(Object.assign({},
        options.icon.options,
        {
            html: options.icon.options.html
                + '<div class="leaflet-draw-direction" style="transform: rotate(' + (direction + piPer4) + 'rad)"><div class="arrow" style="background:' + (options.color || 'black') + '"></div></div>'
        })
    );
}

L.Direction = L.Marker.extend({
    options: Object.assign({}, L.Marker.options, {
        direction: 0,
        icon: L.divIcon({
            iconSize: [40,40],
            iconAnchor: [20, 33],
            html: '<svg viewBox="-5 -5 110 110" height="40" width="40" style="fill:none;stroke-width:10;stroke:black"><circle r="45" cy="50" cx="50"></circle><path id="triangle" d="m 50,84 7,7 H 43 Z"></path></svg>'
        })
    }),

    initialize: function (latlng, options) {
        L.setOptions(this, options);
        if(this.options) {
            if (this.options.icon) {
                this.options.icon = wrapDivIcon(this.options);
            }
            this._direction = this.options.direction || 0;
        }
        L.Marker.prototype.initialize.call(this, latlng, this.options);
    },

    setStyle: function (style) {
        L.setOptions(this, style);
        if (this._renderer) {
            this._renderer._updateStyle(this);
        }
        return this;
    },

    // @method getDirection: LatLng
    // Returns the current direction of the marker.
    getDirection: function () {
        return this._direction;
    },

    // @method setDirection(direction: LatLng): this
    // Changes the marker direction to the given direction.
    setDirection: function (direction) {
        var oldDirection = this._direction;
        this._direction = direction;
        this.update();

        return this.fire('rotate', {oldDirection: oldDirection, direction: this._direction});
    },

    update: function () {
        L.Marker.prototype.update.call(this);

        if (this._icon) {
            var dir = this._icon.querySelector('.leaflet-draw-direction');
            if(dir) {
                dir.style.transform = "rotate(" + (piPer4 + this._direction) + "rad)";
            }
        }

        return this;
    },

    redraw: function () {
        this.update();
    }
});

L.Draw.Direction = L.Draw.SimpleShape.extend({
    statics: {
        TYPE: 'direction'
    },

    options: {
        icon: L.divIcon({
            className: 'leaflet-mouse-marker',
            iconAnchor: [20, 20],
            iconSize: [40, 40]
        }),
        repeatMode: false,
        zIndexOffset: 2000 // This should be > than the highest z-index any markers
    },

    initialize: function (map, options) {
        this.type = L.Draw.Direction.TYPE;
        L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
    },

    _drawShape: function (latlng) {
        var dir = toDir(this._startLatLng, latlng);
        if (!this._shape) {
            this._shape = new L.Direction(this._startLatLng, {direction: 0});
            this._map.addLayer(this._shape);
        }
        this._shape.setDirection(dir);
    },

    _fireCreatedEvent: function () {
        var dir = new L.Direction(this._startLatLng, {direction: this._shape.getDirection()});
        L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, dir);
    },

    _onMouseMove: function (e) {
        var latlng = e.latlng;

        // this._tooltip.updatePosition(latlng);
        if (this._isDrawing) {
            this._drawShape(latlng);
        }
    }
});

L.direction = function(latlngs, options) {
    return new L.Direction(latlngs, options);
};

L.Direction.addInitHook(function () {
    if (L.Edit.Direction) {
        this.editing = new L.Edit.Direction(this);

        if (this.options.editable) {
            this.editing.enable();
        }
    }
});
