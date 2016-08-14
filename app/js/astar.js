    (function (w) {
        window['Path'] = function () {
            var instance = this;
            this.index = from.lineindex + to.lineindex;
            this.path = path;
            this.FromPoint = from;
            this.ToPoint = to;
            this.parent = previous;
            this.GetDistance = function () {
                var distance = 0;
                return;
            }
            if (this.parent == null) {
                this.OverallDistance = 0;
            }
            else {
                this.OverallDistance = this.parent.OverallDistance;
            }
            this.OverallDistance = this.OverallDistance + this.GetDistance();
        }
        window['aStar'] = function () {
            var instance = this;
            this.OpenPaths = null;
            this.ClosedPaths = [];
            this.EndIndexes = [];
            this.init = function (from, to) {
                this.OpenPaths = new BinaryHeap(function (state) {
                    return state.OverallDistance;
                });
                to.Lines.forEach(function (l) {
                    this.EndIndexes.push(l.lineindex);
                });
            };
            this.CheckPath = function (path) {
                return this.EndIndexes.indexOf(path.lineindex) > -1;
            };
            this.Starter = function (from, to) {
                var currentPath = new Path(null, null, from, to);
                this.OpenPaths.push(currentPath);
                while (this.OpenPaths.size() > 0) {
                    var currentNode = this.OpenPaths.pop();
                    this.ClosedPaths[currentPath.index] = currentPath;
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
            }
        }
    })(window);