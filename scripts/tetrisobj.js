/*
 *      Alter Tetris in Hexagon - Tetris
 *           Howard Xu
 *         Jan. 29, 2017
 */

function TetrisObj(e0='e_0', e1='e_1', e2='e_2', e3='e_3', 
  upshow=function(){}, result=function(){}, rsize=200) {
  this.elname = [e0, e1, e2, e3]
  this.upshow = upshow
  this.result = result
  this.hexagon = new HexagonObj(rsize)
  this.bonus = 0  
  this.coords = [
	[0,0,0,0],  // board  left, top, dx, dy,
	[0,0,0,0],  // sample left, top, type, color
	[0,0,0,0],  // sample left, top, type, color
	[0,0,0,0],  // sample left, top, type, color
	[0,0,0,0]]  // cidx, height, width, score

  this.setname = function(nm) {
    this.name = nm
    return this
  }

  this.findOffset = function(el) {
    for (var lx=0, ly=0, h=el.offsetHeight; el != null;
      lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {top:ly, left:lx};
  }

  this.setcoord = function(radius=40) {
    for (var n = 0; n < 4; n++) {
      var lt = this.findOffset(document.getElementById('e_' + n))
      if (n == 0) {
        this.coords[n][0] = lt.left + 255
        this.coords[n][1] = lt.top + 205
      }
      else {
        this.coords[n][0] = lt.left + 100
        this.coords[n][1] = lt.top + 100
      }
    }
    this.coords[4][1] = Math.round(radius * 0.866)
    this.coords[4][2] = radius
    this.coords[4][3] = 0
  }

  this.showall = function() {
    var s = '<svg width="600" height="400">'
    var sl = this.hexagon.getallhexagon(300, 200, 200) 
    for (var i in sl) {
      ssl = sl[i]
      for (var j in ssl) {
        s += '<polygon points="' + ssl[j] + ' "'
        var d = this.hexagon.stptlen[i][0] + parseInt(j)
        var c = this.hexagon.getfillcolor(this.hexagon.board[i][d])
	var fc = 'purple'
	if (this.hexagon.edges[i][d] != 9) fc = 'cyan'
        s += ' style="fill:' + c + ';stroke:' + fc + ';stroke-width:2;fill-rule:evenodd;" /> '
      }
    } 
    s += '</svg>'
    return s 
  }

  this.showone = function(clr, typ) {
    var c = this.hexagon.getfillcolor(clr)
    var s = '<svg width="200" height="200">'
    var sl = this.hexagon.getonetype(100, 100, 40, typ)
    for (var i in sl) {
      s += '<polygon points="' + sl[i] + ' "'
      s += ' style="fill:' + c + ';stroke:puprple;stroke-width:2;fill-rule:evenodd;" /> '
    }
    s += '</svg>'
    return s 
  }
  
  this.setsample = function(n) {
    this.coords[n][2] = Math.floor(Math.random() * 25)
    this.coords[n][3] = Math.floor(Math.random() * 9)
  }
  
  this.dispone = function(n, f=false) {
    this.setsample(n)
    if (f) {
      this.bonus += 1
      if (this.bonus > 1)
        this.coords[n][2] = 0 
    }
    else
      this.bonus = 0
    document.getElementById(this.elname[n]).innerHTML = 
	this.showone(this.coords[n][3], this.coords[n][2])
  }

  this.dispall = function() {
    document.getElementById(this.elname[0]).innerHTML = this.showall()
  }

  this.updtscore = function(n, k) {
    this.coords[4][3] += n
    this.upshow(this.coords[4][3], k)
  }

  this.finalchk = function() {
    for(var t = 1; t<4; t++)
      if (this.hexagon.chktypeall(this.coords[t][2]))
        return
    setTimeout(result, 3000) 
  }

  this.updtboard = function() {
    for(var i = 0; i < 3; i++)
      if (this.res[i].length > 0)
        for (var j = 0; j < this.res[i].length; j++)
	  this.hexagon.lineop(i, this.res[i][j], 2)
    this.dispall()  
    this.finalchk()
  }

  this.proc = function(n) {
    var score = 0
    var k = 0
    this.res = this.hexagon.checkall()
    for (var i = 0; i < 3; i++)
      if (this.res[i].length > 0){
        for(var j = 0; j < this.res[i].length; j++) {
          this.hexagon.lineop(i, this.res[i][j], 1)
          score += 20 * this.hexagon.stptlen[this.res[i][j]][1]
          k += 1
        }
      }
    this.dispall()
    score *= k
    score += 40
    this.updtscore(score, k)
    this.dispone(n, k>0)
    if (k > 0) 
      setTimeout( this.name + '.updtboard()', 2000);
    else
      this.finalchk()
  }

  this.transf = function(x, y) {
    var r = 4 - Math.round((y - this.coords[0][1] - this.coords[0][3]) / this.coords[4][1])
    var c = Math.round((x - this.coords[0][0] - this.coords[0][2]) / this.coords[4][2])
	 + Math.round(r / 2 - 0.1) + 2 
    return { row: r, col: c };
  }

  // Drag and drop functions

  this.drag = function(ev) { 
    var n = parseInt(ev.target.id[2])
    ev.dataTransfer.setData("text", ev.target.id);  
    this.coords[0][2] = ev.clientX - this.coords[n][0]
    this.coords[0][3] = ev.clientY - this.coords[n][1]
    this.coords[4][0] = n
  }

  this.drop = function(ev) {
    ev.preventDefault();
    var rc = this.transf(ev.clientX, ev.clientY)
    var n = this.coords[4][0]
    if (this.hexagon.setonetype(rc.row, rc.col, this.coords[n][2], this.coords[n][3])) 
      this.proc(n)
  }
}

