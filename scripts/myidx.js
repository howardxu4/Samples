
var fnm = new Array(
	"alttetris.html", "Alter Tetris",
	"mytet.html", 	"Tetris",
	"2048.html", 	"2048",
	"3D2048.html", 	"3D2048",
	"myrubix.html", "Rubix",
     	"bounce.html",   "Bounce",
	"myparser.html","My Parser" );

function redisp(i)
{
	var fr = document.getElementById('WD');
	fr.src = fnm[i];
}
function setlink()
{
	for( i= 0; i < fnm.length; i+=2) {
	var line = "<a href='#' onclick='redisp(" + i +");' >" + fnm[i+1] + "</a><br/>";
	document.write(line);
	}
}
