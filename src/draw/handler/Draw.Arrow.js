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
         * Nyilhegy kilógó szélessége törzs vastagság %-ban
         */
        athickness: .9,

        fill: true,
        fillColor: null, //same as color by default
        fillOpacity: 0.2
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

            var l = Math.sqrt(dx * dx + dy * dy);

            if(l < 0.001) continue;

            var ix = dx / l;
            var iy = dy / l;

            p3 = points[2];
            var d3x = p3.x - p1.x;
            var d3y = p3.y - p1.y;
            // Főirányba eső hossz %-ban
            len = Math.abs(d3x * ix + d3y * iy) / l;
            // Merőleges irány hossz %-ban
            var th = Math.abs(-d3x * iy + d3y * ix) / l;
            var ath = this.options.athickness * th;

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
        TYPE: 'arrow',
        /**
         * Törzs vastagsága LEN%-ban
         */
        THICKNESS: .1,
        /**
         * Törzs hossza LEN%-ban
         */
        LENGTH: .8,
    },

    Poly: L.Arrow,

    initialize: function (map, options) {
        L.Draw.Polygon.prototype.initialize.call(this, map, options);
        this.type = L.Draw.Arrow.TYPE;
    },

    _addControlPoint: function () {
        // Arrow head
        var p1 = this._markers[0]._latlng;
        var p2 = this._markers[1]._latlng;
        var dLng = p2.lng - p1.lng;
        var dLat = p2.lat - p1.lat;

        var th = L.Draw.Arrow.THICKNESS;
        var len = L.Draw.Arrow.LENGTH;
        this.addVertex({
            lng: p1.lng + dLng * len - dLat * th,
            lat: p1.lat + dLat * len + dLng * th
        });
    },

    _endPoint: function (clientX, clientY, e) {
        L.Draw.Polygon.prototype._endPoint.call(this, clientX, clientY, e);
        if(this._markers.length == 2) {
            this._addControlPoint();
            this._finishShape();
        }
    }
});

L.arrow = function(latlngs, options) {
    return new L.Arrow(latlngs, options);
};