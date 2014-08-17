/*
 *  Tetris Object
 *    Howard Xu
 *  Copyright 2011
 */

// Object constructor
function Tetris( row, col ) {
   this.style = [ 0, 1, 3, 5, 7, 11, 15 ];
   this.shape = [
         	 [-1, -1, -1,  0,  0, -1],	//Q_TETRIMO
		 [ 0, -1,  0,  1,  0,  2],	//I_TETRIMO 
		 [-2,  0, -1,  0,  1,  0],
		 [-1, -1, -1,  0,  0,  1],	//Z_TETRIMO
		 [-1,  1,  0,  1,  1,  0],
		 [-1,  0, -1,  1,  0, -1],	//S_TETRIMO
		 [-1,  0,  0,  1,  1,  1],
		 [-1,  0,  0, -1,  0,  1],	//T_TETRIMO
		 [-1,  0,  0,  1,  1,  0],
		 [ 0, -1,  0,  1,  1,  0],
		 [-1,  0,  0, -1,  1,  0],
		 [-1,  0,  1,  0,  1,  1],	//L_TETRIMO
		 [ 0, -1,  1, -1,  0,  1],
		 [-1, -1, -1,  0,  1,  0],
		 [ 0, -1, -1,  1,  0,  1],
		 [-1,  0,  1, -1,  1,  0],	//J_TETRIMO
		 [-1, -1,  0, -1,  0,  1],
		 [-1,  0, -1,  1,  1,  0],
		 [ 0, -1,  0,  1,  1,  1],
         ];
   this.row = row;
   this.col = col;
   this.board = new Array (row*col);
   this.init();
}

// Initialation
Tetris.prototype.init = function()
{
   var n = this.row * this.col;
   for (var i=0; i<n; i++)
       this.board[i] = 0;
   this.newPiece();
}

// Get the offset of tetrimo
Tetris.prototype.getOffset = function( type, dir ) {
   var index = this.style[type];
   if (type == 0) {
   }
   else if (type < 4) {
       index += dir % 2;
   }
   else if (type < 7) {
       index += dir % 4;
   }
   else 
       alert("InValid Type: " + type);
   return this.shape[index];
}

// Generate a random Tetrimo
Tetris.prototype.newPiece = function() {
   this.n_shape = Math.floor(Math.random()*7);
   this.n_dir = Math.floor(Math.random()*4);
   this.n_color = Math.floor(Math.random()*7) + 1;
}

// Start a Tetrimo
Tetris.prototype.setPiece = function( row, col, dir ) {
   if (row == undefined) {
       row = 0;
       col = this.col >> 1;
       this.c_shape = this.n_shape;
       this.c_dir = dir = this.n_dir;
       this.c_color = this.n_color;
       this.newPiece();
   }
   if (this.checkPos( row, col, dir, 1 ) == 0) {
       this.c_row = row;
       this.c_col = col;
       this.c_dir = dir;
       return 1;
   }
   return 0;
}

// Fill the position
Tetris.prototype.fillPos = function( row, col, dir, clr ) {
   var ar = this.getOffset( this.c_shape, dir );
   ar = ar.concat( [0, 0] );
   for(var i=0; i<ar.length; i+=2) {
       var y = row + ar[i];
       var x = col + ar[i+1];
       if (y >= 0) 
          this.board[ y * this.col + x ] = clr;
   }
}

// Shift down
Tetris.prototype.shiftDown = function( row ) {
   if (row != undefined) {
       if (row >= this.row) row--;
       do {
           var y = row * this.col;
           var x = 0;
	   while (x < this.col) {
	      if (row > 0)
	         this.board[ y + x ] = this.board[ y + x - this.col];
	      else
		 this.board[ y + x ] = 0;
	      x++;
	   }
	   row --;
       } while (row >= 0);
   }
}

// Check line
Tetris.prototype.checkLine = function( row ) {
   if (row == undefined) row = this.c_row;
   if (row >= this.row) row--;
   var y = row * this.col;
   var x = 0;
   var ret = 0;
   var cnt = 0;
   while (x < this.col) {
       if (this.board[ y + x ] == 0)
	   ret++;
       else
	   cnt += this.board[ y + x ];
       x++;
   }
   if (ret == 0 || ret == this.col)
      return cnt;
   return -1;
}

// Check clear line
Tetris.prototype.checkClear = function( row ) {
   if (row == undefined) row = this.c_row;
   var sc = 0;
   var i = 0;
   row++;
   if (row >= this.row) row = this.row -1;
   while (i < 4 && row >= 0) {
       ret = this.checkLine( row );
       if (ret == 0) break;
       if (ret != -1) {
	   sc += ret;
	   this.shiftDown( row );
       }
       else 
	   row--;
       i++;
   }
   return sc;
}

// Check position
Tetris.prototype.checkPos = function( row, col, dir, fill ) {
   if (dir == undefined) dir = this.c_dir;
   var ar = this.getOffset( this.c_shape, dir );
   ar = ar.concat( [0, 0] );
   var ret = 0;
   for( i=0; i<ar.length; i+=2) {
       var y = row + ar[i];
       var x = col + ar[i+1];
       if (x < 0 || x >= this.col || y >= this.row)
	  ret = 1;
       else if (y < 0) 
	  ret = 0;
       else
	  ret = this.board[ y * this.col + x ];
       if (ret != 0) break;
   }
   if (fill != undefined && ret == 0)
       this.fillPos( row, col, dir, this.c_color );
   return ret;
}

// Color and decolor
Tetris.prototype.colorPos = function( clr ) {
   if (clr != undefined)
       clr = 0;
   else
       clr = this.c_color;
   this.fillPos( this.c_row, this.c_col, this.c_dir, clr);
}

// dump current status
Tetris.prototype.dump = function() {
   var i = 0;
   var msg = "<br>ROW: " + this.row + "  COL: " + this.col + "<br>\n";
   for (var r = 0; r < this.row; r++) {
      for (var c = 0; c < this.col; c++) 
   	msg += this.board[i++] + " ";
      msg += "<br>\n";
   }
   alert(msg);
}
Tetris.prototype.demo = function() {
   var ar = this.getOffset(6, 3);
   ar = ar.concat( [0,0] );
   var msg = "";
   for (var i=0; i < ar.length; i++)
       msg += ar[i] + " ";
   alert(msg);
}
