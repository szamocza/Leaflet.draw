L.Edit = L.Edit || {};

// L.Edit.Direction = L.Edit.CircleMarker.extend({
L.Edit.Direction = L.Edit.Marker.extend({
	options: {
		// moveIcon: new L.DivIcon({
		// 	iconSize: new L.Point(8, 8),
		// 	className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
		// }),
		resizeIcon: new L.DivIcon({
			iconSize: new L.Point(18, 18),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
		}),
		// touchMoveIcon: new L.DivIcon({
		// 	iconSize: new L.Point(20, 20),
		// 	className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move leaflet-touch-icon'
		// }),
		// touchResizeIcon: new L.DivIcon({
		// 	iconSize: new L.Point(20, 20),
		// 	className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize leaflet-touch-icon'
		// }),
	},

	initialize: function (marker, options) {
		L.Edit.Marker.prototype.initialize.call(this, marker, options);
	},

	addHooks: function () {
		L.Edit.Marker.prototype.addHooks.call(this);

		this._createDirectionMarker();
		// var dirMarker = this._dirMarker;
		// dirMarker.dragging.enable();
		// dirMarker.on('move', this._onDirMove, this);
		this._marker.on('dragstart', this._hideDirMarker, this);
		this._marker.on('dragend', this._showDirMarker, this);
	},

	removeHooks: function () {
		L.Edit.Marker.prototype.removeHooks.call(this);

		// dirMarker.off('move', this._onDirMove, this);
		this._unbindDirMarker();
	},

	_hideDirMarker: function() {
		this._dirMarker.setOpacity(0);
	},

	_showDirMarker: function() {
		var center = this._marker.getLatLng(),
			dirPoint = this._getDirectionMarkerPoint(center);
		// Beállítjuk a megfelelő szöghöz
		this._dirMarker.setLatLng(dirPoint);
		this._dirMarker.setOpacity(1);
	},

	_createDirectionMarker: function () {
		var center = this._marker.getLatLng(),
			dirPoint = this._getDirectionMarkerPoint(center);

		this._dirMarker = this._createMarker(dirPoint, this.options.resizeIcon);
	},

	_getDirectionMarkerPoint: function (latlng) {
		var r = 40, dir = this._marker.getDirection();
		return {
			lat: latlng.lat + r * Math.cos(dir),
			lng: latlng.lng + r * Math.sin(dir)
		};
	},

	_onDirMove: function (e) {
		var layer = e.target;
		layer.edited = true;
		this._redir(e.latlng);
		// this._map.fire(L.Draw.Event.EDITMOVE, { layer: layer });
	},

	_createMarker: function (latlng, icon) {
		// Extending L.Marker in TouchEvents.js to include touch.
		var marker = new L.Marker.Touch(latlng, {
			draggable: true,
			icon: icon,
			zIndexOffset: 10
		});

		this._bindDirMarker(marker);

		return marker;
	},

	_bindDirMarker: function (marker) {
		this._marker._map.addLayer(marker);
		marker
			.on('dragstart', this._onDirMarkerDragStart, this)
			.on('drag', this._onDirMarkerDrag, this)
			.on('dragend', this._onDirMarkerDragEnd, this);
		// 	.on('touchstart', this._onTouchStart, this)
		// 	.on('touchmove', this._onTouchMove, this)
		// 	.on('MSPointerMove', this._onTouchMove, this)
		// 	.on('touchend', this._onTouchEnd, this)
		// 	.on('MSPointerUp', this._onTouchEnd, this);
	},

	_unbindDirMarker: function () {
		this._dirMarker
			.off('dragstart', this._onDirMarkerDragStart, this)
			.off('drag', this._onDirMarkerDrag, this)
			.off('dragend', this._onDirMarkerDragEnd, this);
		// 	.off('touchstart', this._onTouchStart, this)
		// 	.off('touchmove', this._onTouchMove, this)
		// 	.off('MSPointerMove', this._onTouchMove, this)
		// 	.off('touchend', this._onTouchEnd, this)
		// 	.off('MSPointerUp', this._onTouchEnd, this);
		this._dirMarker.remove();
		this._dirMarker = null;
	},

	_onDirMarkerDragStart: function(e) {
		this._dirMarker.setOpacity(0);
		this._marker.fire('editstart');
	},

	_onDirMarkerDrag: function(e) {
		var marker = e.target,
			latlng = marker.getLatLng();

		this._marker.setDirection(toDir(this._marker.getLatLng(), latlng));
		// this._map.fire(L.Draw.Event.EDITRESIZE, { layer: this._marker });

		//
		// this._marker.redraw();
		// this._marker.fire('editdrag');
	},

	_onDirMarkerDragEnd: function(e) {
		this._dirMarker.setOpacity(1);
		this._marker.fire('editend');
	},
});