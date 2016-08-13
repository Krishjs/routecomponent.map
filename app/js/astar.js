    (function () {
        window['State'] = function () {
            var instance = this;
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
            this.init = function (from, to) {
                this.goalState = this.getGoalState(seqence);
                this.OpenPaths = new BinaryHeap(function (state) {
                    return state.OverallDistance;
                });
            };
            this.Starter = function (from, to) {
                var currentState = new State(null, null, from, to);
                this.OpenPaths.push(currentState);
                while (this.OpenPaths.size() > 0) {
                    var currentNode = this.OpenPaths.pop();
                    this.ClosedPaths[currentNode.ranSeqString] = currentNode;
                    if (currentNode.ranSeqString === this.goalState) {
                        return currentNode;
                    }
                    this.NextStateList = this.GetNextStateList(currentNode);
                    for (var i = 0; i < this.NextStateList.length; i++) {
                        var inOpenList = false;
                        var inClosedList = false;
                        var nextstate = this.NextStateList[i];
                        var IsOpenList = this.IsinOpen(nextstate);
                        if (IsOpenList.Present) {
                            inOpenList = true;
                            if (!IsOpenList.Costlier) {
                                instance.OpenPaths.rescoreElement(nextstate);
                            }
                        }
                        else {
                            inClosedList = this.ClosedPaths.hasOwnProperty(nextstate.ranSeqString);
                        }
                        if (!inClosedList && !inOpenList) {
                            this.OpenPaths.push(nextstate);
                        }
                    }
                }
            }
        }
    })(w);