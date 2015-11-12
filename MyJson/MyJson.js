/*
 *  Author:  Howard Xu
 *  Created: 10-24-2015
 *  Utility: MyJson class for JSON parse and toString
 *  Methds:  parse, toString, setoption, setdebug, geterror
 *  Note:    overcome the normal JSON parse failed on invalid token
*/
function MyJson(){
    var self = {}
    
    this.init = function() {
        self.OPTION = false
        self.DEBUG = false
        self.QUOTE ='"'
        self.ARRAY ='A'
        self.OBJCT ='O'
        self.resky = "[]{}:,"
        self.symbol = [["[", "{"], ["]", "}"], [", ", ": "]]
        self.state = {
            "{" : "}Dk",    //Push   }D
            "}" : ",]}",    //Pop
            "[" : "]{[D",   //Push   ]{[D
            "]" : ",]}",    //Pop
            "," : "{[D",    //       {[D
            "K" : ":",      //       :
            ":" : "{[D",    //       {[D  
            ";" : "Dk",     //       D
            "D" : ",]}"     //       ,]}:
        }
        self.error =''
    }
    this.myprint = function(s){ 
        if (self.DEBUG)
            console.log(s)
    }

    this.setoption = function(f) {
        f = f||false
        self.OPTION = f
    }
    
    this.setdebug = function(f) {
        f = f||false
        self.DEBUG = f
    }
    
    this.geterror = function() { 
        return self.error
    }
    
    this.myseterror = function(errstr) { 
        self.error = "Error on (" + self.index + ") " + errstr
        this.myprint(self.error)
        return null
    }
    
    this.mygetindent = function(l) {
        l = l || 0
        s = ""
        l *= self.num
        for (i=0; i<l; i++)
            s+=" "
        return s
    }

    this.mysetnum = function(num) { 
        num = num||0
        self.num = num
        self.rtn = ''
        if (num > 0)
            self.rtn = "\n"
    }
    
    this.mysetstr = function(line) { 
        self.line = line
        self.start = 0
        self.index = 0
        self.flag = true
        self.count = 0
        self.length = line.length
        
        self.cobj = null
        self.cstat = null
        self.cobj = null
        self.key = null
        self.stack = []
        self.error = ''
    }
    
    this.myoffquote = function(c, f) {
        f = f||self.OPTION
        if (f) 
            if (c.length > 1 && c.charAt(0) == '"' && c.charAt(c.length-1) == '"')
                c = c.substring(1,c.length-1) 
        return c
    }
    
    this.mygettoken = function() {
        while (self.index < self.length) { 
            c = self.line[self.index]
            if (self.flag) { 
                if (self.resky.indexOf(c) != -1) {
                    if (self.count > 0) { 
                        t = self.line.substring(self.start,self.index).trim()
                        self.count = 0
                        if (t.length > 0)
                            return t
                    }
                    self.start = self.index+1
                    self.index += 1
                    return c
                }
                else if ( c == self.QUOTE ) { 
                    if (self.count > 0) { 
                        t = self.line.substring(self.start,self.index).trim()
                        self.count = 0
                        if (t.length > 0)
                            return t
                    }
                    self.flag = false
                    self.start = self.index
                }
                else
                    self.count += 1
            }
            else { 
                if (c == self.QUOTE) { 
                    t = self.line.substring(self.start,self.index+1)
                    self.start = self.index+1
                    self.flag = true
                    self.index += 1
                    return t
                }
            }
            self.index += 1
        }
        return null 
    }
    
    this.mypush = function(obj) { 
        if (self.key != null) { 
            self.stack.push(self.key)
            self.key = null
        }
        self.cobj = obj
        self.stack.push(self.cobj)
    }
    
    this.mypop = function() { 
        r = true
        obj = self.stack.pop()
        if (self.stack.length > 0) { 
            self.cobj = self.stack[self.stack.length-1]
            if (!(self.cobj instanceof Object)) {
                self.key = self.stack.pop()
                self.cobj = self.stack[self.stack.length-1]
            }
            if (self.cobj instanceof Object) {
                if (!(self.cobj instanceof Array)) { 
                    self.cobj[self.key] = obj
                    self.cstat = self.OBJCT
                }
                else { 
                    self.cobj.push(obj)
                    self.cstat = self.ARRAY
                }
            }
            self.key = null
        }
        else { 
            if (self.cstat == self.ARRAY)
                r = false
            self.cstat = null
        }
        return r
    }
    this.parse = function(line) { 
        this.mysetstr(line)
        allow = "{"     // start state
        c = this.mygettoken()
        while (c != null) {
            if (c.length == 1)
                if (allow.indexOf(c) == -1)
                    return this.myseterror("@@@ Syntax error!!! ")
            if (c == '{') {
                this.myprint ("Create OBJECT") 
                this.mypush({})
                self.cstat = self.OBJCT
                allow = self.state[c]
            }
            else if (c == '[') {
                this.myprint ("Create ARRAY")
                this.mypush([])
                self.cstat = self.ARRAY
                allow = self.state[c]
            }
            else if (c == '}') {
                this.myprint ("End OBJECT")
                if (self.stack.length > 0 && self.cstat == self.OBJCT)
                    this.mypop()
                else 
                    return this.myseterror("@@@ Syntax error!!! object unmatch ")  
                allow = self.state[c]
            }
            else if (c == ']') {
                this.myprint ("End ARRAY")
                if (self.stack.length > 0 && self.cstat == self.ARRAY) {
                    if (!this.mypop())
                        return this.myseterror("@@@ Syntax error!!! json object unfinish ")
                }
                else
                    return this.myseterror("@@@ Syntax error!!! array unmatch ")
                allow = self.state[c]
            }
            else if (c == ':') {
                this.myprint ("Key Separate Value")
                if (self.cstat != self.OBJCT)
                    return this.myseterror("@@@ Syntax error!!! not under object")
                allow = self.state[c]
            }
            else if (c == ',') {
                this.myprint ("Data Separate")
                if (self.cstat == self.ARRAY)
                    allow = self.state[c]
                else
                    allow = self.state[";"]
            }
            else {
                this.myprint ("Data: " + c)

                if (allow.charAt(allow.length-1) == 'k') { 
                    self.key = this.myoffquote(c, true)
                    allow = self.state["K"]
                }
                else { 
                    c = this.myoffquote(c)
                    if (self.key != null) { 
                        if (self.cstat == self.OBJCT)
                            self.cobj[self.key] = c
                        else
                            return this.myseterror("@@@ Syntax error!!! key : value failed")
                        self.key = null
                    }
                    if (self.cstat == self.ARRAY)
                        self.cobj.push(c)
                    allow = self.state["D"]
                }
            }
            c = this.mygettoken()
        }
        return self.cobj
    }
    this.myvalue = function(v, l){ 
        l = l || 0
        if (v instanceof Object ) { 
            if ( v instanceof Array )
                return this.myobject(v, 0, l+1)
            else 
                return this.myobject(v, 1, l+1)
        }
        else
            return v 
    }
    this.myobject = function(d, i, l){ 
        l = l || 0
        if (i != 1 && i != 0)
            return null
        f = false
        s = self.rtn + this.mygetindent(l) + self.symbol[0][i]
        for ( k in d ){
            if (f)
                s += self.symbol[2][0]
            if (i == 1) { 
                s += self.rtn + this.mygetindent(l+1) + k + self.symbol[2][1]
                s += this.myvalue(d[k], l)
            }
            else 
                s += this.myvalue(d[k], l) 
            f = true
        }
        return s + self.symbol[1][i]
    }
    this.toString = function(v, num){ 
        num = num || 0
        this.mysetnum(num)
        if (v instanceof Object )  
            if (!( v instanceof Array ))
                return this.myobject(v, 1, 0)
        return null
    }
    this.init()
}

