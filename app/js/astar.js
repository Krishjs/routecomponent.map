    (function (w) {
        window['Path'] = function (line, previous) {
            var instance = this;
            this.pathindex = line.lineindex;
            this.PathString = '';
            this.Paths = [];
            this.Line = line;
            this.parent = previous;
            this.GetDistance = function () {
                var distance = 0;
                return google.maps.geometry.spherical.computeLength(line.line.getPath().getArray());;
            }
            if (this.parent == null) {
                this.OverallDistance = 0;
                this.PathString = this.pathindex;
            }
            else {
                this.OverallDistance = this.parent.OverallDistance;
                this.PathString = previous.PathString + "_" + this.pathindex
            }
            this.OverallDistance += this.GetDistance();
        }
        window['aStar'] = function () {
            var instance = this;
            this.OpenPaths = null;
            this.ClosedPaths = [];
            this.StartIndexes = [];
            this.EndIndexes = [];
            this.AllPaths = [];
            this.init = function (from, to, allpaths) {
                this.OpenPaths = new BinaryHeap(function (state) {
                    return state.OverallDistance;
                });
                from.Lines.forEach(l => instance.StartIndexes.push(l.lineindex));
                to.Lines.forEach(l => instance.EndIndexes.push(l.lineindex));
                this.AllPaths = allpaths;
                return this.Starter(from, to);
            };
            this.CheckPath = function (path) {
                return this.EndIndexes.indexOf(path.pathindex) > -1;
            };
            this.Starter = function (from, to) {
                from.Lines.forEach(v => instance.OpenPaths.push(new Path(v, null)));
                while (this.OpenPaths.size() > 0) {
                    var currentPath = this.OpenPaths.pop();
                    this.ClosedPaths[currentPath.PathString] = currentPath;
                    if (this.CheckPath(currentPath)) {
                        return currentPath;
                    }
                    this.NextPaths = this.GetNextPaths(currentPath);
                    for (var i = 0; i < this.NextPaths.length; i++) {
                        var inOpenList = false;
                        var inClosedList = false;
                        var nextPath = this.NextPaths[i];
                        var IsOpenList = this.IsinOpen(nextPath);
                        if (IsOpenList.Present) {
                            inOpenList = true;
                            if (!IsOpenList.Costlier) {
                                instance.OpenPaths.rescoreElement(nextPath);
                            }
                        }
                        else {
                            inClosedList = this.ClosedPaths.hasOwnProperty(nextPath.index);
                        }
                        if (!inClosedList && !inOpenList) {
                            this.OpenPaths.push(nextPath);
                        }
                    }
                }
            };
            this.GetNextPaths = function (path) {
                var self = this;
                var nextPaths = [];
                this.AllPaths.forEach(function (p) {
                    var endlatlng = new google.maps.LatLng(path.Line.end.lat, path.Line.end.lng);
                    var startlatlng = new google.maps.LatLng(path.Line.start.lat, path.Line.start.lng);
                    if ((google.maps.geometry.poly.isLocationOnEdge(startlatlng, p.line) || google.maps.geometry.poly.isLocationOnEdge(endlatlng, p.line)) && p.lineindex != path.pathindex && path.PathString.indexOf(p.lineindex) === -1 && self.StartIndexes.indexOf(p.lineindex) === -1) {
                        nextPaths.push(new Path(p, path));
                    }
                });
                return nextPaths;
            };
            this.IsinOpen = function (nextPath) {
                var present = false;
                var costlier = false;
                for (var i = 0; i < this.OpenPaths.content.length; i++) {
                    if (this.OpenPaths.content[i].PathString === nextPath.PathString) {
                        present = true;
                        costlier = this.OpenPaths.content[i].OverallDistance < nextPath.OverallDistance;
                    }
                }
                return {
                    Present: present
                    , Costlier: costlier
                };
            }
        }
    })(window);