L.Util.Random = function(seed) {
    this._seed = seed % 2147483647;
    if (this._seed <= 0) this._seed += 2147483646;
};

/**
 * Returns a pseudo-random value between 1 and 2^32 - 2.
 */
L.Util.Random.prototype.next = function () {
    return this._seed = this._seed * 16807 % 2147483647;
};


/**
 * Returns a pseudo-random floating point number in range [0, 1).
 */
L.Util.Random.prototype.nextFloat = function () {
    // We know that result of next() will be 1 to 2147483646 (inclusive).
    return (this.next() - 1) / 2147483646;
};

L.Cloud = L.Polygon.extend({
    options: {
        frillLen: 50.0,
        frillHeight: .6
    },

    _polygonArea: function(vertices) {
        var area = 0;
        for (var i = 0; i < vertices.length; i++) {
            j = (i + 1) % vertices.length;
            area += vertices[i].x * vertices[j].y;
            area -= vertices[j].x * vertices[i].y;
        }
        return area;
    },

    redraw: function () {
        if (this._map) {
            this._updatePath();
        }
        return this;
    },

    _updatePath: function () {
        var rings = this._parts;

        var path = '',
            i, j, rn, len2, points, p,
        frillLen = this.options.frillLen,
        frillHeight = this.options.frillHeight;
        var rand = new L.Util.Random(3);

        for (i = 0, rn = rings.length; i < rn; i++) {
            points = rings[i];

            var prevP;
            var sign = this._polygonArea(points) < 0 ? -1 : 1;
            len2 = points.length;
            for (j = 0; j <= len2; j++) {
                p = points[j % len2];
                if(j) {
                    var dx = p.x - prevP.x;
                    var dy = p.y - prevP.y;
                    var len = Math.sqrt(dx * dx + dy * dy);
                    if(len === 0) continue;

                    // Normalized directional vector
                    dx /= len;
                    dy /= len;
                    // Scaled normal vector
                    var n = Math.floor(len / frillLen + .5);
                    // Scaled directional vector
                    var flen = len / (n || 1);
                    var ix = flen * dx;
                    var iy = flen * dy;
                    var nx = iy * frillHeight * sign;
                    var ny = -ix * frillHeight * sign;
                    for(; n; n--) {
                        var r1 = 0.5 + rand.nextFloat();
                        var r2 = 0.5 + rand.nextFloat();;
                        path += 'c ' + r1 * nx + ' ' + r1 * ny + ',' + (ix + r2 * nx) + ' ' + (iy + r2 * ny) + ',' + ix + ' ' + iy;
                    }
                } else {
                    path += 'M' + p.x + ' ' + p.y;
                }
                prevP = p;
            }
            path += 'z';
        }

        this._path.setAttribute('d', path || 'M0 0');
    }
});

L.Draw.Cloud = L.Draw.Polygon.extend({
    statics: {
        TYPE: 'cloud'
    },

    Poly: L.Cloud,

    initialize: function (map, options) {
        L.Draw.Polygon.prototype.initialize.call(this, map, options);
        this.type = L.Draw.Cloud.TYPE;
    },

    _vertexChanged: function (latlng, added) {
        L.Draw.Polygon.prototype._vertexChanged.call(this, latlng, added);
    }
});

L.cloud = function(latlngs, options) {
    return new L.Cloud(latlngs, options);
}