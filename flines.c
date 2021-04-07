
/*
  Copyright (c) 1985 Howard XU. (PRIVATE) All Rights Reserved.
  The function FourLinesParser was written in 1985 on betting
  The shortest program that can handle validating of any BNF grammars
  https://github.com/howardxu4/Samples/blob/master/myparser.html
*/

int FourLinesParser(
	char *s,	// input expression string
	char *cs[], 	// valid characters for each state
	int (*stt)[],  	// state table
	int n,		// state table column size
	int r)		// rule of state
{
 	int p, l,i,j,k,f, fn=n-1, (*st)[n]=stt;	// line 1 -- declaration
	for (p = l = k = 0; s && s[l] && k >= 0; l++) {
		for (i = 0, f = fn; i < n && f == fn; i++)
			for (j = 0; cs[i][j]  && f == fn; j++)
				if (cs[i][j] == s[l])
					f = i;	// line 2 -- find match set
		p = k, k = st[k][f];		// line 3 -- find next state
	}
	return (k>r?l:k<-1?p>r?l-1:-(l-1):-l);	// line 4 -- return +- position
}

/*
<digit> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
<unsigned integer> ::= <digit> | <unsigned integer><digit>
<integer> ::= <unsigned integer> | + <unsigned integer> | - <unsigned integer>
<decimal fraction> ::= .<unsigned integer>
<exponent part> ::= #<integer>
<decimal number> ::= <unsigned integer> | <decimal fraction> | <unsigned integer><decimal fraction>
<unsigned number> ::= <decimal number> | <exponent part> | <decimal number><exponent part>
<number> ::= <unsigned number> | + <unsigned number > | - <unsigned number >
*/
int myparser(char *s) {
	char* cs[] =  {
		"0123456789",
		"+-",
		".",
		"#",
		""
	};

	#define _S 1
	#define _D 2
	#define _e 3
	#define _s 4
	#define _C 5
	#define _N 6
	#define _E 7
	//	  n   +-  .  #   ''
	int st[][sizeof(cs)/sizeof(cs[0])] = {
		{ _N, _S, _D, -1, -2},  // start
		{ _N, -1, _D, -1, -2},  // +-  S
		{ _C, -1, -1, -1, -2},  // .   D
		{ _E, _s, -1, -1, -2},  // #   #
                { _E, -1, -1, -1, -2},  // +-  s
		{ _C, -1, -1, _e, -2},  //     C o
		{ _N, -1, _D, _e, -2},  // n   N o
                { _E, -1, -1, -1, -2}   // end E o
	};
	return FourLinesParser(s, cs, st, sizeof(cs)/sizeof(cs[0]), _s);
}

#include <stdio.h>
#include <string.h>

/* 
C program, compile: 'gcc flines.c', run: './a.out [any number string]'
*/
char *result(char*t, char*s, int n) {
	n = n>0? n: -n;
	strncpy(t, s, n);
        t[n] = 0;
	return t;
}

int main(int argc, char *argv[])
{
        char *s = argc > 1? argv[1]: "-1.23#+3";
	char t[sizeof(s)+1];
	int n = myparser(s);
        printf("parsing '%s' to position '%d' as a number %s, its syntax is %s\n", s, n<0? -n: n, result(t, s, n), n>0? "OK" : "Invalid");
        return 0;
}


