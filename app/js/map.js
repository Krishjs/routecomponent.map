
(function (w) {
    function formInput(id) {
        this.Id = id;
        this.Mutant = undefined,
        this.Value = '';
        this.Position = {};
        this.Marker = null;
        this.Lines = [];
    };
    formInput.prototype.Me = function () {
        return document.getElementById(this.Id);
    };
    formInput.prototype.Mutate = function () {
        this.Mutant = new google.maps.places.Autocomplete(this.Me());
        this.Mutant.bindTo('bounds', kjsmap.map);
    };
    formInput.prototype.OnChange = function (s, e) {
        this.Value = s.value;
        kjsmap.SetPosition(this, this.Value);
    };
    w['kjsmap'] = {
        map: null,
        Circle: undefined,
        mapOptions: {
            minZoomLevel: 3,
            center: { lat: 13.046034415549146, lng: 80.321044921875 }
        },
        SetPosition: function (s, v) {
            var self = this;
            ajax.call({
                url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + v,
                isasync: true,
                type: 'GET',
                success: function (data) {
                    var output = JSON.parse(data);
                    if (output.status === google.maps.GeocoderStatus.OK) {
                        s.Position = output.results[0].geometry.location;
                        var address = self.Parser.Address(output.results[0].address_components);
                        s.Marker = new google.maps.Marker({
                            position: new google.maps.LatLng(s.Position.lat, s.Position.lng),
                            city_name: address.locality,
                            country_code: address.country,
                            optimized: false,
                            id: output.results[0].place_id
                        });
                        s.Marker.setMap(self.map);
                        _.defer(function () { self.Neighbour.Calculate(s.Position, s); });
                    }
                }
            });
        },
        Contains: function (c, p) {
            return c.getBounds().contains(p);
        },
        Neighbour: {
            Calculate: function (p, s) {
                if (kjsmap.Fetch(this.Calculate, this, [p])) {
                    var radius = 100000;
                    var circle = new google.maps.Circle({
                        strokeColor: '#000000',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#F0FFFF',
                        fillOpacity: 0.2,
                        center: p,
                        radius: radius
                    });
                    circle.setMap(kjsmap.map);
                    var found = !1;
                    function findNeighbour() {
                        kjsmap.Lines.forEach(function (v) {
                            var iamneighbour = !1;
                            v.getPath().getArray().forEach(function (gv) {
                                if (kjsmap.Contains(circle, gv)) {
                                    iamneighbour = !0;
                                }
                            });
                            if (iamneighbour) {
                                found = !0;
                                v.setVisible(!0);
                                s.Lines.push(v);
                            }
                        });
                    }
                    while (!found) {
                        circle.setRadius(radius);
                        findNeighbour();
                        radius = radius - 10000;
                        if (radius === 0) {
                            found = !0;
                        }
                    }
                }
            },
            Lines: function(f,t){
                
            }
        },
        PathFinder: {
            PathsAdded: !1,
            AllPaths: [],
            Find: function (f, t) {
                var routes = {};
                var self = this;
                var fp = f.Lines;
                var tp = t.Lines;                
                f.Lines.forEach(function (cr) {                    
                        if (self.PathsAdded) {
                        self.AllPaths.forEach(function(p) { 
                            var latlng = new google.maps.LatLng(p.end.lat,p.end.lng);
                            p.line.setVisible(google.maps.geometry.poly.isLocationOnEdge(latlng,cr)); 
                        });                        
                    }                                       
                });
            }
        },
        Parser: {
            Address: function (add) {
                var components = {};
                add.forEach(function (v1, k) {
                    v1.types.forEach(function (v2, k2) {
                        components[v2] = v1.long_name
                    });
                })
                return components;
            }
        },
        Form: {
            FromPort: new formInput('from'),
            ToPort: new formInput('to'),
            Search: function (s, e) {
                var start = this.FromPort.Marker.position;
                var end = this.ToPort.Marker.position;
                kjsmap.Direction.Service(!0, {
                    origin: start,
                    destination: end,
                    travelMode: google.maps.DirectionsTravelMode.DRIVING,
                    //transitOptions: { modes: [google.maps.TransitMode.ROAD] }
                });
                debugger;
                if (this.FromPort.Lines.length > 0
                    && this.ToPort.Lines.length > 0) {
                    kjsmap.PathFinder.Find(this.FromPort, this.ToPort);
                }
            },
            RangeChanged: function (s, e) {
                kjsmap.Circle.setRadius(s.value * 1000);
            }
        },
        RouteData: null,
        Lines: [],
        Fetch: function (fn, scope, args) {
            if (this.RouteData === null) {
                var self = this;
                ajax.call({
                    url: '/map',
                    isasync: true,
                    type: 'GET',
                    success: function (data) {
                        self.RouteData = JSON.parse(data);
                        if (fn) { fn.apply(scope || self, args); }
                    }
                });
            }
            return this.RouteData !== null;
        },
        DrawRoute: function (s) {
            var self = this;
            var toPostion = function (v) {
                return {
                    lat: v[1],
                    lng: v[0]
                };
            };
            this.RouteData.features.forEach(function (v, i) {
                var line = new google.maps.Polyline({
                    path: v.geometry.coordinates.map(function (vgc) { return toPostion(vgc); }),
                    geodesic: true,
                    strokeColor: '#000000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    visible: s
                });
                if (self.PathFinder.PathsAdded) {
                    var path = v.geometry.coordinates.map(function (vgc) { return toPostion(vgc); });                    
                    self.PathFinder.AllPaths.push({
                        isVisited: !1,
                        start: path[0],
                        end: path[path.length - 1],
                        path: path,
                        line:line
                    });                    
                }
                line.setMap(kjsmap.map);
                self.Lines.push(line);
            });
            self.PathFinder.PathsAdded = !0;
        },
        RoutesView: function (f) {
            if (this.Fetch(this.RoutesView, this, [f])) {
                this.DrawRoute(!0);
            }
            this.Lines.forEach(function (l) { l.setVisible(f); });
        },
        Direction: {
            RenderMan: undefined,
            ServiceGuy: undefined,
            Service: function (d, options, callback) {
                if (!this.ServiceGuy) { this.ServiceGuy = new google.maps.DirectionsService(); }
                var self = this;
                this.ServiceGuy.route(options, function (r) {
                    if (d) { self.Display(!0, r); }
                    else { callback.call(kjsmap, r); }
                });
            },
            Display: function (n, r) {
                var renderGuy = (!n && this.RenderMan) ? this.RenderMan : new google.maps.DirectionsRenderer();
                renderGuy.setMap(kjsmap.map);
                renderGuy.setDirections(r);
                if (!n && !this.RenderMan) { this.RenderMan = renderGuy; }
            }
        }
    };
    w['ajax'] = function () {
        var getHttpreq = function () {
            if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            }
            else {
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
        };
        return {
            xhttp: getHttpreq(),
            call: function (p) {
                this.xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        p.success(this.responseText);
                    }
                };
                this.xhttp.open(p.type, p.url, p.isasync);
                this.xhttp.send();
            },
        };
    }();
})(window);
function initMap() {
    var mapdiv = document.getElementById("map");
    if (mapdiv) {
        kjsmap.map = new google.maps.Map(mapdiv, {
            zoom: 4,
            minZoom: kjsmap.mapOptions.minZoomLevel,
            center: { lat: 13.046034415549146, lng: 80.321044921875 }
        });
        var southWest = new google.maps.LatLng(-85, -180);
        var northEast = new google.maps.LatLng(85, 180);
        var allowedBounds = new google.maps.LatLngBounds(southWest, northEast);
        kjsmap.Circle = new google.maps.Circle({
            strokeColor: '#000000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#F0FFFF',
            fillOpacity: 0.2,
            center: { lat: 13.089844954062787, lng: 80.29838562011719 },
            radius: 500,
            visible: !1,
            map: kjsmap.map
        });
        //kjsmap.Form.FromPort.Mutate();
        //kjsmap.Form.ToPort.Mutate();
        google.maps.event.addListener(kjsmap.map, "click", function (e) {
            console.log("Lat: " + e.latLng.lat());
            console.log("Lng: " + e.latLng.lng());
        });
        google.maps.event.addListener(kjsmap.map, 'center_changed', function (e) {
            if ((allowedBounds.getNorthEast().lat() > (kjsmap.map.getBounds().getNorthEast().lat()))
                    && (allowedBounds.getSouthWest().lat() < (kjsmap.map.getBounds().getSouthWest().lat()))) {
                lastValidCenter = kjsmap.map.getCenter();
                return;
            }
            kjsmap.map.panTo(lastValidCenter);
        });
    }
};

