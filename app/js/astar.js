(function () {
    window['State'] = function() {
    var instance = this;
        
    this.ranSeqString = [];
    this.PathDistance = function () {
    
    }
    this.Init = function (seq, parent, fromDiv, toDiv) {
        this.rSeq = seq;
        this.blankIndex = seq.indexOf(0);
        this.FromDiv = fromDiv;
        this.ToDiv = toDiv;
        this.parent = parent;
        if (this.parent == null) {
            this.mcostg = 0;
        } else {
            this.mcostg = this.parent.mcostg + 1;
        }
        this.mcosth = this.GetMoveCost();
        this.mcostf = this.mcostg + this.mcosth;
        this.ranSeqString = seq.toString().replace(/\,/g, '');
        }
    }
})(w);