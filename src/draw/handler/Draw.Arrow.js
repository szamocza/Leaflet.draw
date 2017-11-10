L.Arrow = L.Polygon.extend({
    /*        (1)                ---
              /|               athickness%
             / |(2)         (3)   |
            /  |--------------   ---
           /                 | thickness%
         (X) . . . LEN . . . O   ---
           \                 |
            \  |--------------
             \ |(5)         (4)
              \|
              (6)
               |---length%---|
     */
    options: {
        noClip: true,
        /**
         * Törzs vastagsága LEN%-ban
         */
        thickness: .1,
        /**
         * Nyilhegy kilógó szélessége törzs vastagság %-ban
         */
        athickness: .9,
        /**
         * Törzs hossza LEN%-ban
         */
        thickness: .1,
        length: .8,

        fill: true,
        fillColor: null, //same as color by default
        fillOpacity: 0.2
    },

    redraw: function () {
        if (this._map) {
            this._updatePath();
        }
        return this;
    },

    _updatePath: function () {
        var rings = this._parts;

        var path, i, j, points, rn;

        for (i = 0, rn = rings.length; i < rn; i++) {
            points = rings[i];

            // Arrow head
            var p1 = points[0];
            var p2 = points[1];
            var dx = p2.x - p1.x;
            var dy = p2.y - p1.y;

            var th = this.options.thickness,
                ath = this.options.athickness * th,
                len = this.options.length,
                l = Math.sqrt(dx * dx + dy * dy);

            if(l < 0.001) continue;

            if(points.length > 2) {
                var ix = dx / l;
                var iy = dy / l;

                p3 = points[2];
                var d3x = p3.x - p1.x;
                var d3y = p3.y - p1.y;
                // Főirányba eső hossz %-ban
                len = Math.abs(d3x * ix + d3y * iy) / l;
                // Merőleges irány hossz %-ban
                th = Math.abs(-d3x * iy + d3y * ix) / l;
                ath = this.options.athickness * th;
            }

            var relpts = [
                len - 1.0, ath + th,
                0, -ath,
                -len, 0,
                0, -2 * th,
                len, 0,
                0, -ath
            ];

            path = 'M' + p2.x + ' ' + p2.y;

            for(j = 0; j < relpts.length; j += 2) {
                x = relpts[j];
                y = relpts[j + 1];
                path += 'l' + (x * dx - y * dy) + ' ' + (x * dy + y * dx);
            }

            path += 'z';
        }

        this._path.setAttribute('d', path || 'M0 0');
    }
});

L.Draw.Arrow = L.Draw.Polygon.extend({
    statics: {
        TYPE: 'arrow'
    },

    Poly: L.Arrow,

    initialize: function (map, options) {
        L.Draw.Polygon.prototype.initialize.call(this, map, options);
        this.type = L.Draw.Arrow.TYPE;
    },

    _vertexChanged: function (latlng, added) {
        L.Draw.Polygon.prototype._vertexChanged.call(this, latlng, added);
    },

    _endPoint: function (clientX, clientY, e) {
        if(this._markers.length >= 2) {
            this.addVertex(e.latlng);
            this._finishShape();
            this._mouseDownOrigin = null;
        } else {
            L.Draw.Polygon.prototype._endPoint.call(this, clientX, clientY, e);
        }
    }
});

L.arrow = function(latlngs, options) {
    return new L.Arrow(latlngs, options);
};