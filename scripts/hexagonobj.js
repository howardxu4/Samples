/*
 *	Alter Tetris in Hexagon -- Hexagon
 *           Howard Xu 
 *         Jan. 29, 2017
 */

function HexagonObj(radius=200) {

// global variables: stptlen, board, points, types, delta, color, shape

  /*
           -2  2              (-hr,-b) (hr,-b)                
          -1  0  1  5      (-r,0)  (0,0)  (r,0)  (2r,0)       
           -3  3              (-hr,b)  (hr,b)               
          -4     4         (-r,2b)        (r,2b)            
  */
  this. shape = [
    [ 0],                 // .    0
    [-1,  0,  1,  5],     // --   1
    [ 2,  0, -3, -4],     // /    2
    [-2,  0,  3,  4],     // \    3
    [-1,  0,  1, -2],     // '__  4    
    [-1,  0,  1,  2],     // __'  5
    [-1,  0,  1,  3],     // --.  6
    [-1,  0,  1, -3],     // .--  7
    [ 2,  0, -3,  3],     // /.   8
    [ 2,  0, -3, -2],     // '/   9
    [ 2,  0, -3, -1],     // ./   10
    [ 2,  0, -3,  1],     // /'   11
    [-2,  0,  3,  2],     // \'   12
    [-2,  0,  3, -3],     // .\   13
    [-2,  0,  3, -1],     // '\   14
    [-2,  0,  3,  1],     // \.   15
    [-1,  0, -3,  3],     // :\   16
    [ 1,  0, -3,  3],     // :/   17
    [ 2,  0,  3,  1],     // ::   18
    [-2,  2,  1,  3],     // ' ]  19
    [ 2,  1,  3, -3],     // . ]  20
    [ 1,  3, -3, -1],     // U    21
    [ 3, -3, -1, -2],     // [ '  22
    [-3, -1, -2,  2],     // [ .  23
    [-1, -2,  2,  1]      // ^    24
  ]
  this.fillcolors = [
    'red','magenta','purple','indigo','blue','coral','teal','green','orange','gray']

  // get filling color
  this.getfillcolor = function(c) {
    return this.fillcolors[ c%10 ]
  }

  // default value
  this.getdvalue = function() {
    bd = []
    for(var i=0; i<9; i++) {
      var a = []
      var st = this.stptlen[i]
      for(var j=0; j<9; j++){
        var l = st[1]
        if (i > 4) l = 9
        if (j >= st[0] && j < l)
          a.push(9)        // gray
        else
          a.push(-1)       // invalid
      }
      bd.push(a)
    }
    return bd
  }

  // initialize board
  this.init = function() {
    this.stptlen = []
    for (var i=0; i<9; i++) {
      var st = 0
      var l = 5
      if (i<5)
        l += i
      else {
        st = i-4
        l += 8-i
      } 
      this.stptlen.push([st, l])
    }
    this.board = this.getdvalue()
    this.edges = this.getdvalue()
  }

  // for debug 
  this.showboard = function() {
    for(var i in this.board)
      console.log(this.board[i])
  }

  // board cell check, mark or clean
  this.boardop = function(r, c, f) {
    var ret = true
    if (f == 0) 
      ret = (this.board[r][c] != 9)
    else if (f == 1)
      this.edges[r][c] = 0
    else {
      this.board[r][c] = 9
      this.edges[r][c] = 9
    }
    return ret
  }

  // line operatin: type: --, \,  / on n line, check | mark | clean  
  this.lineop = function(t, n, f) {
    var i = 0
    var ret = true
    if(t == 0) {
      var k = this.stptlen[n][0]
      while (i < this.stptlen[n][1]){
        ret &= this.boardop(n,k+i,f)
        i += 1
      }
    }
    else if (t == 1) {
      while(i < 9) {
        if (this.board[i][n] != -1)
          ret &= this.boardop(i,n,f)
        i += 1
      }      
    }
    else {
      var k = n - 4
      if (n >= 4) {
        for(i = 0; i< 9 & k < 9; i++) {
          if(this.board[i][k] != -1)
            ret &= this.boardop(i,k,f)
          k += 1
        }  
      }
      else {
        k = 4 - n 
        for( i = 0; i < 9 & k < 9; i++) {
          if(this.board[k][i] != -1)
            ret &= this.boardop(k,i,f)
          k += 1
        }      
      }
    }
    return ret
  }

  this.checkall = function() {
    var ret = []
    for (var t = 0; t < 3; t++) {
      var a = []
      for(var i = 0; i < 9; i++)
        if (this.lineop(t, i, 0)) 
          a.push(i)
      ret.push(a)
    } 
    return ret
  }

  this.adjnum = function(n) {
    var xn = 0
    var yn = 0
    switch(n) {
      case  4: xn=-2; yn=0;  break
      case  3: xn=-1; yn=0;  break
      case -1: xn=0;  yn=-1; break
      case -3: xn=-1; yn=-1; break
      case  2: xn=1;  yn=1;  break
      case -2: xn=1;  yn=0;  break
      case  1: xn=0;  yn=1;  break
      case  5: xn=0;  yn=2;  break
      case -4: xn=-2; yn=-2; break
      default:
    }
    return {x:xn, y:yn}
  }

  // get adjust of x, y
  this.getadjust = function(n, r, c) {
    xyn = this.adjnum(n)
    return [xyn.x + parseInt(r), xyn.y + parseInt(c)]
  }

  // check one type entry on board
  this.chkonetype = function(r, c, shp) {
    //console.log(shp)
    for(var i in shp) {
      var xy = this.getadjust(shp[i], r, c)
      if (xy[0] < 0 || xy[0] > 8 || xy[1] < 0 || xy[1] > 8)
        return false
      if (this.board[xy[0]][ xy[1]] != 9)
        return false
    }
    return true
  }

  // check a type on board possiblity
  this.chktypeall = function(t) {
    shp = this.shape[t]
    for (var r=0; r<9; r++)
      for (var c=0; c<9; c++) 
        if(this.board[r][c] == 9)
          if(this.chkonetype(r, c, shp))
            return true
    return false
  }

  // set one type entry on board
  this.setonetype = function(r, c, t, clr) {
    var shp = this.shape[t]
    if (this.chkonetype(r, c, shp)) {
      for (var i in shp) {
        var xy = this.getadjust(shp[i], r, c)
        this.board[xy[0]][ xy[1]] = clr
      }
      return true
    }
    console.log('Sorry, no fit')
    return false
  }
  
  // set hexagon points
  this.sethexapoints = function(r) {
    var b = Math.round(r * 0.866)
    var hr = r/2
    var p = r/5
    var hp = r/10
    this.hexapoints = []
    this.hexapoints.push([r, b, p])
    for (var i=0; i<9; i++) {
      var y = b -hp - i*p + i*3  
      var x = -hr -hp
      var l = 5 
      if (i < 5)  {
        l += i
        x -= i*hp
      }
      else  {
        l += 8 - i
        x -= (8-i)*hp
      }
      this.hexapoints.push([y, x, l])
    }
  }

  // get hexagon delta
  this.hexadelta = function(r, v=true) {
    var b = Math.round(r * 0.866)
    var hr = r/2
    if (v)
      return [0, r, b, hr, b, -hr, 0, -r, -b, -hr,  -b, hr]
    return [hr, b, r, 0, hr, -b, -hr, -b, -r, 0, -hr, b]
  }

  // set hexa types
  this.shapemap = function(s, r, hr, b) {
    var coord
    switch(s){
      case -2:
        coord = [-hr,-b]
        break
      case 2:
        coord = [hr,-b]
        break
      case -1:
        coord = [-r,0]
        break
      case 1:
        coord = [r,0]
        break
      case 5:
        coord = [r*2,0]
        break
      case -3:
        coord = [-hr,b]
        break
      case 3:
        coord = [hr,b]
        break
      case -4:
        coord = [-r,b*2]
        break
      case 4:
        coord = [r,b*2]
        break
      case 0:
      default:
        coord = [0, 0]
        break
    } 
    return coord
  }

  this.sethexatypes = function(r) {
    var b = Math.round(r * 0.866)
    var hr = r/2
    this.entrytypes = []
    for (var t in this.shape) {
      var a = []
      var shp = this.shape[t]
      for (var i in shp) 
        a = a.concat(this.shapemap(shp[i], r, hr, b))
      //console.log('('+t+') '+a)
      this.entrytypes.push(a)
    }
  } 

  // get hexa type
  this.gethexatype = function(t, r=40) {
    if(this.entrytypes == undefined)
      this.sethexatypes(r)
    return this.entrytypes[t]
  }

  // get hexa points
  this.gethexapoints = function(r) {
    if( this.hexapoints == undefined )
      this.sethexapoints(r)
    return this.hexapoints
  }

  // get one hexagon point 
  this.getHexagon = function(cx, cy, delta) {
    var plist = ''
    for (var i = 0; i <delta.length; i += 2) {
      plist += (cx + delta[i]) + ','
      plist += (cy + delta[i+1]) + ' '
    }
    return plist
  }

  // get all hexagon points array
  this.getallhexagon = function(cx, cy, radius) {
    var a = this.gethexapoints(radius)
    var b = a[0][2]
    var delta = this.hexadelta(b/2 + 1)
    var s = []
    for(var i=1; i<10; i++) {
      var x = a[i][1] + cx
      var y = a[i][0] + cy
      var l = a[i][2]
      var ss = []
      for(var j=0; j<l; j++) {
        ss.push(this.getHexagon(x+j*b, y, delta))       
      }
      s.push(ss)
    }
    return s
  }

  // get one type of entry 
  this.getonetype = function(cx, cy, radius, t) {
    var a = this.gethexatype(t, radius)
    if (this.hexadeltas == undefined)
      this.hexadeltas = this.hexadelta(radius/2 + 1)
    s = []
    for (var i = 0; i<a.length; i+=2) {
      var x = a[i] + cx
      var y = a[i+1] + cy
      s.push(this.getHexagon(x, y, this.hexadeltas))
    }
    return s
  }
  this.init()
}
