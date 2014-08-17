/* 
 *	Rubix Cube Object
 *	    Howard Xu
 *	Copyright Aug. 8, 2012
 */

// Object constructor
function RubixCube( N, H, X, Y) {
    if (N == undefined) N = 3;
    if (H == undefined) H = 30;
    if (X == undefined) X = 50;
    if (Y == undefined) Y = 200;
    this.C = [ 'red', 'yellow', 'blue', 'white', 'orange', 'lime', 'purple', 'black' ];
    this.FRONT = 0;
    this.BACK = 1;
    this.UP = 2;
    this.DOWN = 3;
    this.LEFT = 4;
    this.RIGHT = 5;
    this.STROKE = 6;
    this.init(X, Y, N, H);
    this.trans();
    this.V = 0;				// resolve flag
    this.U = [];				// undo array
    this.uid = null;			// undo id
    myself = this;
}

// initialize
RubixCube.prototype.init = function( x, y, n, h ) {
    this.X = x;				// position X
    this.Y = y;				// position Y
    this.N = n;				// number  
    this.H = h;				// half size
    this.Z = h + h;			// size
    this.B = 0;				// back flag
    this.A = new Array(6); 		// all data
    for (var i = 0; i < 6; i++) {
	this.A[i] = new Array(this.N * this.N);
	for (var j = 0; j < this.A[i].length; j++) {
	    this.A[i][j] = i;
	}
    }
}
// get round edge indexes
RubixCube.prototype.getR = function(N) {
    var R = [];
    var i = 0;
    var j = 0;
    var k = 0;
    var d = 0;
    if (N == undefined) N = this.N;
    else d = (this.N - N) / 2;    // N should be less this.N  { 2*i }
    while(j < N-1) R[k++] = (i+d)*this.N + d + (j++) ;
    while(i < N-1) R[k++] = (d+i++)*this.N + d + j ;
    while(j > 0) R[k++] = (d+i)*this.N + d + (j--) ;
    while(i > 0) R[k++] = (d+i--)*this.N + d + j ;
    return R;
}
// get indexes
RubixCube.prototype.getI = function(I, k) {
    var n, i;
    switch (I) {
	  case 0: // RU
		n = this.N * (this.N-1-k);
		i = 1;
	  break;
	  case 1: // DR
		n = k;
		i = this.N;
	  break;
	  case 2: // LU
		n = this.N * (this.N-k) - 1;
		i = -1;
	  break;
	  case 3: // DL
		n = this.N * (this.N-1) + k;
		i = -this.N;
	  break;
	  case 4: // UL
		n = this.N * this.N - 1 - k;
		i = -this.N
	  break;
	  case 5: // UR
		n = this.N-1-k;
		i = this.N
	  break;
	  case 6: // LD
		n = this.N*(k+1) - 1;
		i = -1;
	  break;
	  case 7: // RD
		n = this.N*k
		i = 1;
	  break;
    }
    var t = [];
    for( var j = 0; j < this.N; j++)
	  t[j] = n + j*i;
    return t;
}
// get a line index
RubixCube.prototype.getL = function(F, I) {
    var T = [];
    for (var j = 0; j < 8; j++) {
	  if (j % 2) 
		T = T.concat(this.getI( F[j], I ));
	  else 
		T.push(F[j]);
    }
    return T;
}
// create transform matrix
RubixCube.prototype.trans = function() {
    this.R = this.getR();
// URDL -- RU DR LU DL		0 1 2 3
// UBDF -- UL UR UR UL		4 5 5 4
// FLBR -- LD RD RD LD		6 7 7 6
    this.T = [ ];				// transform array
    var i;
    for ( i = 0; i < this.N; i++)
    	  this.T.push(this.getL( [this.UP, 0, this.RIGHT, 1, this.DOWN, 2, this.LEFT, 3], i));
    for ( i = 0; i < this.N; i++)
    	  this.T.push(this.getL( [this.UP, 4, this.BACK, 5, this.DOWN, 5, this.FRONT, 4], i));
    for ( i = 0; i < this.N; i++)
        this.T.push(this.getL( [this.FRONT, 6, this.LEFT, 7, this.BACK, 7, this.RIGHT, 6], i));
}
// set colors
RubixCube.prototype.setColor = function( f, b, u, d, l, r, s, c ) {
    this.C = [ f, b, u, d, l, r, s, c ];
}
// get vertical cell
RubixCube.prototype.getVert = function(x, y, c) {
	var H = this.H;
	var s = this.C[this.STROKE + this.B];
	var ret = '<polygon points="' + x + ',' + y + ' ' + (x+H) + ',' ;
	ret += (y-H) + ' ' + (x+H) + ',' + (y+H) + ' ' + x + ',' + (y+H+H);
	ret += ' " style="fill:' + c + '; stroke:';
	ret += s + '; stroke-width:3;fill-rule:evenodd;" />';
	return ret;
}
// get rectangle cell
RubixCube.prototype.getRect = function(x, y, c) {
	var Z = this.Z;
	var s = this.C[this.STROKE + this.B];
	return('<rect x="' + x + '" y="' + y + '" width="' + Z + '" height="' + Z + '" stroke="' + s + '" stroke-width="3" fill="' + c + '" />');
}
// get horizontal cell
RubixCube.prototype.getHori = function(x, y, c) {
	var H = this.H;
	var s = this.C[this.STROKE + this.B];
	var ret = '<polygon points="' + x + ',' + y + ' ' + (x+H+H) + ',' + y ;
	ret += ' ' + (x+H) + ',' + (y+H) + ' ' + (x-H) + ',' + (y+H);
	ret += ' " style="fill:' + c + '; stroke:';
	ret += s + '; stroke-width:3;fill-rule:evenodd;" />';
	return ret;
}
// get cube
RubixCube.prototype.getCube = function( B, X, Y) {
	var i, j, xx, yy;
	if (X == undefined || Y == undefined) {
    	    X = this.X;
            Y = this.Y;
	}	
	var faces = '';
	if (B) {
	this.B = 1;
	faces += this.getFace( X, Y, this.LEFT);
	faces += this.getFace( X, Y, this.BACK);
	faces += this.getFace( X, Y, this.DOWN);
	}
	else {
	this.B = 0;
	faces += this.getFace( X, Y, this.RIGHT);
	faces += this.getFace( X, Y, this.FRONT);
	faces += this.getFace( X, Y, this.UP);
	}
	return faces;
}
// get face
RubixCube.prototype.getFace = function( X, Y, F ) {
	var i, j, xx, yy, dy;
	var face = '';
	for (i = 0; i < this.N; i++) {
	    switch(F) {
		case  this.LEFT:
	    	case  this.RIGHT:    
	    	case  this.FRONT:
    	    		yy = Y + (i*this.Z);
	    	break;
		case this.BACK:
			yy = (Y-this.N*this.H) + (i*this.Z);
		break;
	    	case this.UP:
    	    		yy = (Y-this.N*this.H) + (i*this.H);	
	    	break;
		case this.DOWN:
			yy = (Y+this.N*this.H) + (i*this.H);
		break;
            }
    	    for (j = 0; j < this.N; j++) {
		switch( F ) {
		    case this.LEFT:
			xx = X + (j*this.H);
			face += this.getVert( xx, yy -(j*this.H), this.C[this.A[F][i*this.N + j]]);
		    break;
		    case this.RIGHT:
        		xx = (X+this.N*this.Z) + (j*this.H);  
			face += this.getVert( xx, yy -(j*this.H), this.C[this.A[F][i*this.N + j]]);
		    break;
		    case this.BACK:
			xx = (X+this.N*this.H) + (j*this.Z);
			face += this.getRect( xx, yy, this.C[this.A[F][i*this.N + j]]);
		    break;
		    case this.FRONT:
        		xx = X + (j*this.Z); 
			face += this.getRect( xx, yy, this.C[this.A[F][i*this.N + j]]);
		    break;
		    case this.UP:
		    case this.DOWN:
        		xx = (X+this.N*this.H) + (j*this.Z) - (i*this.H);
			face += this.getHori( xx, yy, this.C[this.A[F][i*this.N + j]]);
		    break;
		}
    	    }	
	}
	return face;
}
// face rotate
RubixCube.prototype.faceRot = function( F, C, N) {
    var i;
    var t = [];
    var R = this.R;
    if (N == undefined) N = this.N;
    else R = this.getR(N);
    var l = R.length; 
    var n = N-1;
    if ( C ) {
         for ( i = n; i > 0; i--)
		 t.push(this.A[F][R[l-i]]);
    	   for (i = l-1; i >= n; i--)
	       this.A[F][R[i]] = this.A[F][R[i-n]];
	   for ( i = 0; i < n; i++)
		 this.A[F][R[i]] = t[i];
    }
    else {
	   for ( i = 0; i < n; i++)
		 t.push(this.A[F][R[i]]);
	   for (i = n; i < l; i++)
	       this.A[F][R[i-n]] = this.A[F][R[i]];
	   for ( i = 0; i < n ; i++)
		 this.A[F][R[l - n + i]] = t[i];	
    }
    if (N > 3) this.faceRot( F, C, N-2 ); 
}
// rotate faces
RubixCube.prototype.rotFaces = function (I, C ) {
// U-R-D-L-
	//F  U: 6 7 8 R: 0 3 6 D: 8 7 6 L: 6 3 0
	//M  U: 3 4 5 R: 1 4 7 D: 5 4 3 L: 7 4 1
	//B  U: 0 1 2 R: 2 5 8 D: 2 1 0 L: 8 5 2
// U-B-D-F-
	//R  U: 8 5 2 B: 2 5 8 D: 2 5 8 F: 8 5 2
	//M  U: 7 4 1 B: 1 4 7 D: 1 4 7 F: 7 4 1
	//L  U: 6 3 0 B: 0 3 6 D: 0 3 6 F: 6 3 0
// F-L-B-R-
	//U  F: 2 1 0 L: 0 1 2 B: 0 1 2 R: 2 1 0
	//M  F: 5 4 3 L: 3 4 5 B: 3 4 5 R: 5 4 3
	//D  F: 8 7 6 L: 6 7 8 B: 6 7 8 R: 8 7 6
    var T = this.T[I];
    var i, j, cn, pn;
    var n = C? (this.N+1)* 3: 0;
    var t = [];
    for (i = 1; i <= this.N; i++)
	  t.push(this.A[T[n]][T[n+i]]);
    if ( C ) {
	for (i = 3; i > 0; i--) {
	    cn = (this.N+1) * i ;
	    pn = cn - (this.N+1);
	    for (j = 1; j <= this.N; j++)
		this.A[T[cn]][T[cn+j]] = this.A[T[pn]][T[pn+j]];
	}	 
	for (j = 0; j < this.N; j++)
	    this.A[T[pn]][T[pn+1+j]] = t[j];
    }
    else {
	for (i = 1; i <= 3; i++) {
	    cn = (this.N+1) * i;
	    pn = cn - (this.N+1);
	    for (j = 1; j <= this.N; j++)
		this.A[T[pn]][T[pn+j]] = this.A[T[cn]][T[cn+j]];
	}
	for (j = 0; j < this.N; j++)
	    this.A[T[cn]][T[cn+1+j]] = t[j];
    }
} 
// rotate  D: 0 - F, 1 - V, 2 - H; N:  0 - S, ... - M, n - L; C: 0, 1 
RubixCube.prototype.rotate = function(D, N, C) {
    this.rotFaces( D*this.N + N, C);
    switch( D ) {
	  case 0:		 // U-R-D-L-
	    	if ( N == 0 )  
		   this.faceRot(this.FRONT, C);
		else if ( N == this.N-1 )
		   this.faceRot(this.BACK, C);
        break;
	  case 1:		// U-B-D-F-
	    	if ( N == 0 )  
		   this.faceRot(this.RIGHT, C);
		else if ( N == this.N-1 )
		   this.faceRot(this.LEFT, C);
	  break;
	  case 2:		// F-L-B-R-
	    	if ( N == 0 )  
		   this.faceRot(this.UP, C);
		else if ( N == this.N-1 )
		   this.faceRot(this.DOWN, C);
	  break;
    }
    if (this.V == 0) { 
	  this.U.push( [ D, N, !C ] );
	  this.checkAll();
    }
}
// check array 
RubixCube.prototype.checkAll = function() {
    for (var i = 0; i < 6; i++) {
	 for (var j = 1; j < this.A[i].length; j++) {
	    if (this.A[i][0] != this.A[i][j])
		   return;
	 }
    }
    this.U = [];
}
// check x y in which box (position X Y)
RubixCube.prototype.checkXY = function( x, y, X, Y ) {
    var P = 0;
    if (X == undefined || Y == undefined) {
	   X = this.X;
	   Y = this.Y;
	   P = 1;
    }
    X+=5;
    Y+=5;
    var ZN = this.Z * this.N;
    var HN = this.H * this.N;
    if ( x < X || x > (X+ ZN + HN) || y < (Y-HN) || y > (Y+ZN) ) return -1;
    if ( P == 0 ) {
    	   if ( x < (X+ZN) && y > Y ) {  // in FRONT
	   	x -= X;
	   	y -= Y;
	   	var n = Math.floor(x/this.Z) + Math.floor(y/this.Z) * this.N;
         	return  n; 
    	   }
    	   var dx = x - (X+ZN);
    	   var dy = Y - y;
         if ( y < Y && dx  < dy ) { 
	   	 if (x - dy > X) {  // in UP
		  	x -= X+dy ;
		  	y -= (Y-HN);
		  	var n = Math.floor(x/this.Z) + Math.floor(y/this.H) * this.N;
	        	return 100 + n;
	   	 } 
    	   }
    	   else { 
	   	 if ( y + dx < (Y+ZN)) { // in RIGHT
		      x -= (X+ZN);
		  	y -= (Y-dx);
		  	var n = Math.floor(x/this.H) + Math.floor(y/this.Z) * this.N;
	 	  	return 200 + n;
	       } 
    	   }
    } 
    else {
    	   if ( x > (X+HN) && y < (Y+HN)) { // in BACK
	   	 x -= (X+HN);
	   	 y -= (Y-HN);
	   	 var n = Math.floor(x/this.Z) + Math.floor(y/this.Z) * this.N;
         	 return  300 + n; 
    	   }
    	   var dx = x - X;
    	   var dy = y - (Y+HN);
    	   if ( x < (X+HN) && y + dx < (Y+ZN)) {  
	   	 if ( y + dx > Y ) { 	// in LEFT
		  	x = dx;
		  	y -= Y-dx;
		  	var n = Math.floor(x/this.H) + Math.floor(y/this.Z) * this.N;
	 	  	return  400 + n;
         	 }
    	   }
    	   else {
	   	 if ( x + dy < (X + ZN + HN)) { // in DOWN
		  	x = dx - (HN-dy);
		  	y = dy;
		  	var n = Math.floor(x/this.Z) + Math.floor(y/this.H) * this.N;
	 	  	return  500 + n;
         	 }
    	   }
    }
    return -1;
}
RubixCube.prototype.getRotate = function( N ) {
    var F = Math.floor(N/100);
    var n = N%100;
    var y = Math.floor(n/this.N);
    var x = n%this.N;
    var c, d;
    n = -1;
    if ( x == 0 || y == 0 || x == this.N-1 || y == this.N-1)
    switch( F ) {
	  case 0:	// FRONT
	  case 3:	// BACK
		if ( y == 0 || y == this.N-1) {			// U-B-D-F-
		    d = 1;  n = this.N-1-x; c = (y?0:1);
		}
		else {							// F-L-B-R-
		    d = 2;  n = y; c = (x?0:1);
		}
	  break;
	  case 1:	// UP
	  case 5:	// DOWN
		if ( x == 0 || x == this.N-1) {			// U-R-D-L-
		    d = 0;  n = this.N-1-y; c = (x?1:0);
		}
		else {							// U-B-D-F-
		    d = 1;  n = this.N-1-x; c = (y?0:1);
		}
	  break;
	  case 2:	// RIGHT
	  case 4:	// LEFT
		if ( x == 0 || x == this.N-1) {			// F-L-B-R-
		    d = 2;  n = y; c = (x?0:1);
		}
		else {							// U-R-D-L-
		    d = 0;  n = x; c = (y?1:0);
		}
	  break
	  default:
	  break
    }
    if (n != -1) this.rotate( d, n, c);
    return n;
}
RubixCube.prototype.resolve = function() {
    if (this.V == 0)
	  clearInterval(this.uid);
    else {
	  var u = this.U.pop();
        if (u) {
		this.rotate( u[0], u[1], u[2]);
		this.redisp();
        }
	  else {
	 	this.V = 0;
	  } 
    }
}
// set undo
RubixCube.prototype.setUndo = function( func ) {
    var r = 0;
    if (func == undefined) {
	   if ( this.V ) {
	       this.V = 0;
	       r = 1;
	   }
    }
    else if ( this.V == 0) {
	   this.V = 1;
         this.redisp = func;
	   this.uid = setInterval( "myself.resolve()", 1000);
    } 
    return r;
}
// get inside data
RubixCube.prototype.getInside = function( N ) {
    var s = '';
    if (N == undefined) {
    	  for ( var i = 0; i < this.A.length; i++ )
	  	s += this.A[i] + '<br>';
    }
    else {
	  for ( var i = 0; i < this.T.length; i++)
	  	s += this.T[i] + '<br>';
    }
    return s; 
}