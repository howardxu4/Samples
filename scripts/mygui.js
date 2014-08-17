/*
 *  Tetris Game User Interface
 *	Howard Xu
 *  Copyright Oct. 2011
 */

var ctrls = [ 'update(0,0,1)', '^', 'update(0,-1,0)', '<', 
	  'update(0,1,0)', '>', 'move_down()', 'V' ];
var clrs = ['gray', 'red', 'magenta', 'yellow', 'green', 'cyan', 'blue', 'purple'];
var mythis;
var state = 0;		// PAUSE 0, RUN 1, DONE 2
var block = 1;
var updt = 0;
var score = 0;
var interval = 250;
var cells;
var pview;
var snext = 1;

function init( row, col )
{
   document.write ("<table id='board' width='" + (col * 30) + "' height='");
   document.write ( (row * 30) + "' >");
   for( i=0; i< row; i++ ) {
      document.write ("<tr>");
      for( j = 0; j < col; j++ ) {
	 document.write ("<td bgcolor='gray' ></td>");
      }
      document.write ("</tr>");
   }
   document.write("</table><br>");
   mythis = new Tetris( row, col );
   mythis.setPiece();
}

function prev()
{
   document.write("<table id='prev' width=80 height=60>");
   for (i=0; i< 4; i++) {
      document.write("<tr>");
      for (j=0; j<4; j++)
	 document.write("<td bgcolor='gray'></td>");
      document.write ("</tr>");
   }
   document.write("</table><br><br><br><br>");
}

function new_btn(val, cmd, id) 
{
   document.write("<input type='button' value='" +  val );
   if (id != undefined)
      document.write("' id='" + id );
   document.write("' onclick=" + cmd + "; />");
}

function ctrl()
{
   document.write ("<table width='100' height='90'>");
   n = 0;
   for(i=0; i<3; i++) {
       document.write ("<tr>");
       for( j=0; j<3; j++) {
	   document.write("<td>");
	   if (n%2) new_btn( ctrls[n], ctrls[n-1]);	
	   document.write("</td>");
	   n++;
       }
       document.write ("</tr>");
   }
   document.write("</table>");
}

function report(sc)
{
   obj = document.getElementById('scr');
   obj.value = sc;
}

function disp()
{
   if (pview == undefined) {
       tbl = document.getElementById('prev');
       pview = tbl.getElementsByTagName('td');
   }
   for( i=0; i<16; i++) 
      pview[i].style.backgroundColor='gray';
   if (!snext) return;

   ar = mythis.getOffset( mythis.n_shape, mythis.n_dir );
   ar = ar.concat( [0, 0] );
   clr = clrs[ mythis.n_color ];
   for( i=0; i<ar.length; i+=2) {
       y = 2 + ar[i];
       x = 1 + ar[i+1];
       c = y * 4 + x;
       pview[c].style.backgroundColor=clr;
   } 
}

function set_color( idx, clr )
{
   if (cells == undefined) {
       tbl = document.getElementById('board');
       cells = tbl.getElementsByTagName('td');
   }
   elmt = cells[idx];
   if (elmt.style) 
       elmt.style.backgroundColor=clr;
}

function show() {
   ar = mythis.getOffset( mythis.c_shape, mythis.c_dir );
   ar = ar.concat( [0, 0] );
   for( i=0; i<ar.length; i+=2) {
      y = mythis.c_row + ar[i];
      x = mythis.c_col + ar[i+1];
      if (y >= 0 && y < mythis.row) {
         c = y * mythis.col + x;
         idx = mythis.board[ c ];
	 set_color( c, clrs[ idx ]);
      }
   }
}

function showall() {
   for (i=0; i<mythis.board.length; i++) {
       idx = mythis.board[ i ];
       set_color( i, clrs[ idx ]);
   }
}

function update(dd, cc, oo) {
   if (state != 1) return block;
   if (block==0 || updt==1) return 1;
   updt = 1;
   mythis.colorPos(0);
   show();
   if (mythis.checkPos(mythis.c_row + dd, mythis.c_col + cc,
	(4 + mythis.c_dir + oo) % 4) == 0) {
       mythis.c_col += cc;
       mythis.c_dir = (4 + mythis.c_dir + oo) % 4;
   }
   n = mythis.setPiece(mythis.c_row + dd, mythis.c_col, mythis.c_dir);
   if (n == 0) {
       mythis.colorPos(); 
   }
   show();
   updt = 0;
   return n;
}

function check_block() {
   n = mythis.checkClear();
   if (n) {
       score += n;
       report(score);
   }
   showall();
}

function new_block() {
   block = mythis.setPiece();
   disp();
   showall();
   return block;
}

function tick() {
   if (state != 1) return;
   if (block == 0) {
       check_block();
       if (new_block() == 0) {
	      alert ("Game over! Your score: " + score);
	      state = 2;
	      stop_play();
	      return;
       }
   }
   else
       move_down();
   setTimeout("tick()", interval);
}

function move_down() {
   block = update(1, 0, 0);
}

function start_play(obj) {
   if (state != 1) {
       disp();
       state = 1;
       obj.value = "pause";
       tick();
   }
   else if (state == 1) {
       obj.value = "start";
       state = 0;
   }
   obj = document.getElementById('stp');
   obj.value = " stop ";
}

function stop_play(obj) {
   if (obj == undefined) 
       obj = document.getElementById('stp');
   if (state == 2) {
       mythis.init( mythis.row, mythis.col );
       block = mythis.setPiece();
       disp();
       mythis.colorPos(0);
       score = 0;
       report(score);
       obj.value = "  stop  ";
       showall();
   }
   else {
       obj.value = " reset ";
   }
   obj = document.getElementById('sta');
   obj.value = " start ";
   state = 2;
}

function trace(t) {
   if (t) { 
      alert ("Block: " + block + " State: " + state);
   }
   else
      mythis.dump();
}

function process_spk(event) {
//    if (window.event)
	process_key(event);
    return false;
}
function process_key(event) {
   if (window.event)
       event = window.event;
   switch( event.keyCode ) {
       case 37: update(0,-1,0);
       break;
       case 38: update(0,0,1);
       break;
       case 39: update(0,1,0);
       break;
       case 40: move_down();
       break;
   }
   if (event.which == 32)
      start_play();
   else if (event.which == 10)
      stop_play();
//   alert( "KCD: " + event.keyCode + " CCD " + event.charCode + " WCH " + event.which );   
}

function flip() 
{
    snext = !snext;
    disp();
}

function mygui()
{
   document.onkeypress=process_key;
   document.onkeydown=process_spk;
   document.write("<center><br><br><table><tr><td width=200>");
   document.write("<b>Instruction of how to play Tetris Game</b><br><br>");
   document.write("By pressing LEFT and RIGHT arrow keys, you can slide the falling Tetrimino from side to side.<br><br>By pressing the UP arrow key, you can rotate a Tetrimino 90 degrees clockwise.<br><br>By pressing the Down arrow key, you can play fast a Tetrimino falling down. <br><br>To score points in Tetris, you must clear lines. To clear a line, every square in a row has to be filled.");
   document.write(" </td><td width=30></td><td>");
   init(15, 10);
   document.write("</td> <td width=30></td><td> <center>");
   document.write("Score: <input type='text' id='scr' value='0' size=6/><br><br>");
   document.write("Next Tetrimino: <input type='checkbox' checked onclick=flip(); /><br>");
   prev();
   ctrl();
   document.write("<br><br>");
   new_btn( "  start  ", "start_play(this)", "sta" );
   document.write(" &nbsp; &nbsp; &nbsp; ");
   new_btn( "  stop  ", "stop_play(this)", "stp" );
   document.write("</td></tr></table>");
}

