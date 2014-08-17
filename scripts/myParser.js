/*
 *	myParser Object
 */
	function myParser() {
		this.NM = 7;				// number of character set
		// character set
		this.cs = [  	"0123456789",	// n -- number
                      		"+-*/",		// o -- operator
                      		"=",			// = -- equal 
                      		" ",			//   -- space
                      		"(",			// ( -- left paraentheses
                      		")",			// ) -- right parantheses
                      		"" ];			// * -- others
		// state table
		this.st = [
		//       n    o    =   ' '   (    )   *  			allowed      	from
         		[  3,  -1,  -1,   0,   1,  -1, -1], 		// n, ,(           start
         		[  3,  -1,  -1,   1,   2,  -1, -1], 		// n, ,(           (
         		[  3,  -1,  -1,   2,   1,  -1, -1], 		// n, ,(           (
         		[  3,   6,  -1,   4,  -1,   4, -1],			// n,o, ,)         n
         		[ -1,   6,  -1,   4,  -1,   5, -1], 		// o, ,)           ' ')
         		[ -1,   6,  -1,   5,  -1,   4, -1], 		// o, ,)           )
         		[  8,  -1,  -1,   6,   7,  -1, -1], 		// n, ,(           o
         		[  8,  -1,  -1,   7,   6,  -1, -1], 		// n, ,(           (
         		[  8,   6,  11,   9,  -1,   9, -1], 		// n,o,=, ,)       (
         		[ -1,   6,  11,   9,  -1,  10, -1], 		// o,=, )          ' ')
         		[ -1,   6,  11,  10,  -1,   9, -1], 		// o,=, )          )
         		[ 12,  -1,  -1,  11,  -1,  -1, -1], 		// n, ,            =
         		[ 12,  -1,  -1,  13,  -1,  -1  -1],			// n, ,            n
         		[ -1,  -1,  -1,  13,  -1,  -1  -1]			//  ,              ' '
		];
		this.init();
		this.myfunc = this.mydef;		// customer function
	}
	// initialization
	myParser.prototype.init = function() {
		this.cnt = 0;				// parentheses pair counter
		this.lst = [];				// inner list
		this.top = 0;				// tail of list
		this.opt = 0;				// operator position
	}
	// record parantheses pair
	myParser.prototype.update = function(t) {
		var n =  0;
		if (t == '(') n = 1;
		else if (t == ')') n = -1;
		if (n != 0 && this.cnt >= 0) this.cnt += n;
		this.lst.push(t);
		this.top++;
	}
	// normal parse
	myParser.prototype.op = function(kk, k, hh, h, s) {
		if (kk > 0) {
			this.update(s.substring(hh,hh+1));
		}
		return h;
	}
	// create polish notation list
	myParser.prototype.push = function(p) {
		if (p.charAt(0) == '(') {
			this.opt = this.top;
			this.lst.push("");
			this.lst.push("(");
			this.top += 2;
		}
		else if(p.charAt(0) >= '0' && p.charAt(0) <= '9') {
			this.opt = this.top;
			this.lst.push("");
			this.lst.push(p);
			this.top += 2;
		}
		else if (p.charAt(0) == ')') {
			var cpt = this.top -1;
			while (cpt > 0) {
				if (this.lst[cpt] == '(') {
					this.lst[cpt] = "";
					this.opt = cpt-1;
					break;
				}
				cpt -= 2;
			}
		}
		else  {
			this.lst[this.opt] = p;
		}
	}
	// calculate expression
	myParser.prototype.calc = function(fnc) {
		var cpt = this.top - 1;
		var stack = [];
		var stop = 0;
		this.txt = "";
		while (cpt >= 0) {
			if (this.lst[cpt] != "") {
				if(this.lst[cpt].charAt(0) >= '0' && this.lst[cpt].charAt(0) <= '9') {
					stack.push(this.lst[cpt]);
					this.txt += "push operand " + this.lst[cpt] + "\n";
				}
				else {
					var x = stack.pop();
					var y = stack.pop();
					this.txt += "operator " + this.lst[cpt] + "\npop " + x + "\npop " + y + "\n";
					var s = " " + x + " " + this.lst[cpt] + " " + y;
					var z = eval(s);
					stack.push(z);
					this.txt += "calculate " + s + "\npush result " + z + "\n";
				}
			}
			cpt--;
		}
		return stack.pop();
	}
	// dump polish notation
	myParser.prototype.dump = function() {
		var cpt = 0;
		var s = "";
		while( cpt < this.top ) {
			if (this.lst[cpt] != "") s += this.lst[cpt] + " ";
			cpt++;
		}
		return s;
	}
	// polish notation parse
	myParser.prototype.sop = function(kk,k,hh,h,s) {
		if (kk > 0 && kk < 11) {
			var p = s.substring(hh, h);
			var i = 0;
			while(p.charAt(i) == ' ') i++;
			if (i > 0) p = p.substring(i);
			if (p.length > 0) this.push(p);
		}
		return h;
	}
	// default customer function
	myParser.prototype.mydef = function(kk,k,hh,h,s) {
		return h;
	}
	// set customer function
	myParser.prototype.set_func = function(fnc) {
		if (fnc) this.myfunc = fnc;
		else this.myfunc = this.mydef;
	}
/*
 *      This is based on my four line parser written on 1985 in C
 *      It can handle validating of any BNF grammars
 *      Adding the customer function pointer to handle the output
 *
 *      Method:         ps  --  universe parser
 *      Parameters:     char *s  -- parsng string
 *                      int  *h  -- current index of string
 *                      char *cs[] -- grammar character set
 *                      int  *st[] -- state table
 *                      int  n  -- max number of column in table
 *      Return          value of state
 *      Note:           check the return valid state value
 *                      otherwise verify the current index of string
 */
	myParser.prototype.ps = function(s, h, cs, st, n) {
		var hh = h, kk = 0;	// for extended function: previous position and state
		var i, j, f, k = 0;			// line 1 -- declare and initial
		for (h = 0; h < s.length && k != -1; h++) {
			for (i = 0, f = n-1; i < n && f == n-1; i++)
				for (j=0; cs[i].charAt(j)  && f == n-1; j++)
					if (cs[i].charAt(j) == s.charAt(h))
						f = i;	// line 2 -- find match set
			k = this.st[k][f];		// line 3 -- find next state
			if (kk != k) {	// state changes
				hh = this.myfunc(kk, k, hh, h, s);
				kk = k;
			}
		}
		return [k, hh];				// line 4 -- return state
	}
	// parser wrapper -- return state, index, parantheses pair counter
	myParser.prototype.parse = function(s, n) {
		this.init();
		this.set_func(n?this.sop:this.op);
      	return [(this.ps(s, 0, this.cs, this.st, this.NM)), this.cnt ];
      }