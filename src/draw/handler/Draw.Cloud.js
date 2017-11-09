
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

    _updatePath: function () {
        var rings = this._parts;

        var path = '',
            i, j, rn, len2, points, p,
        frillLen = this.options.frillLen,
        frillHeight = this.options.frillHeight;

        for (i = 0, rn = rings.length; i < rn; i++) {
            points = rings[i];

            var prevP;
            var sign = this._polygonArea(points) < 0 ? -1 : 1;
            for (j = 0, len2 = points.length; j <= len2; j++) {
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
                        path += 'c ' + nx + ' ' + ny + ',' + (ix + nx) + ' ' + (iy + ny) + ',' + ix + ' ' + iy;
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