#!/usr/bin/python
class MyJson(object):
    """
    Author:  Howard Xu
    Created: 10-24-2015
    Utility: MyJson class for JSON parser and toString
    Methds:  parse, toString, setoption, setdebug, geterror
    Note:    overcome the normal JSON parse failed on invalid token
    """
    def __init__(self):
        """
        Constants
        """
        self.OPTION = False
        self.DEBUG = False
        self.QUOTE ='"'
        self.ARRAY ='A'
        self.OBJCT ='O'
        self.resky = "[]{}:,"
        self.symbol = [["[", "{"], ["]", "}"], [", ", ": "]]
        self.state = {
            "{" : "}Dk",    #Push   }D
            "}" : ",]}",    #Pop
            "[" : "]{[D",   #Push   ]{[D
            "]" : ",]}",    #Pop
            "," : "{[D",    #       {[D
            "K" : ":",      #       :
            ":" : "{[D",    #       {[D  
            ";" : "Dk",     #       D
            "D" : ",]}"     #       ,]}:
        }
        self.error =''
    
    def myprint(self, s):
        if self.DEBUG:
            print(s)
    
    def setoption(self, f=False):
        self.OPTION = f
    
    def setdebug(self, f=False):
        self.DEBUG = f
    
    def geterror(self):
        return self.error
    
    def myseterror(self, errstr):
        self.error = "Error on (" + str(self.index) + ") " + errstr
        self.myprint(self.error)
        return None
    
    def mygetindent(self, l=0):
        return l*self.num*" "

    def mysetnum(self, num=0):
        self.num = num
        self.rtn = ''
        if num > 0:
            self.rtn = "\n"
    
    def mysetstr(self, line):
        self.line = line
        self.start = 0
        self.index = 0
        self.flag = True
        self.count = 0
        self.length = len(line)
        
        self.cobj = None
        self.cstat = None
        self.cobj = None
        self.key = None
        self.stack = []
        self.error = ''
        
    def myoffquote(self, c, f=False):
        f = f or self.OPTION
        if (f and len(c) > 1 and c[0] == '"' and c[-1] == '"'):
            c = c[1:-1]
        return c
    
    def mygettoken(self):
        while (self.index < self.length):
            c = self.line[self.index]
            if self.flag:
                if c in self.resky:
                    if self.count > 0:
                        t = self.line[self.start:self.index].strip()
                        self.count = 0
                        if len(t) > 0:
                            return t
                    self.start = self.index+1
                    self.index += 1
                    return c
                elif c == self.QUOTE:
                    if self.count > 0:
                        t = self.line[self.start:self.index].strip()
                        self.count = 0
                        if len(t) > 0:
                            return t
                    self.flag = False
                    self.start = self.index
                else:
                    self.count += 1
            else:
                if c == self.QUOTE:
                    t = self.line[self.start:self.index+1]
                    self.start = self.index+1
                    self.flag = True
                    self.index += 1
                    return t
            self.index += 1
        return None 
        
    def mypush(self, obj):
        if self.key != None:
            self.stack.append(self.key)
            self.key = None
        self.cobj = obj
        self.stack.append(self.cobj)
    
    def mypop(self):
        r = True
        obj = self.stack.pop()
        if len(self.stack) > 0:
            self.cobj = self.stack[-1]
            if isinstance(self.cobj, str):
                self.key = self.stack.pop()
                self.cobj = self.stack[-1]
            if isinstance(self.cobj, dict):
                self.cobj[self.key] = obj
                self.cstat = self.OBJCT
            else:
                self.cobj.append(obj)
                self.cstat = self.ARRAY
            self.key = None
        else:
            if (self.cstat == self.ARRAY):
                r = False
            self.cstat = None
        return r
    
    def parse(self, line):
        self.mysetstr(line)
        allow = "{"     # start state
        c = self.mygettoken()
        while c != None:
            if len(c) == 1:
                if not (c in allow):
                    if not c.isdigit():
                        return self.myseterror("@@@ Syntax error!!! ")
            if c == '{':
                self.myprint ("Create OBJECT") 
                self.mypush({})
                self.cstat = self.OBJCT
                allow = self.state[c]
            elif c == '[':
                self.myprint ("Create ARRAY")
                self.mypush([])
                self.cstat = self.ARRAY
                allow = self.state[c]
            elif c == '}':
                self.myprint ("End OBJECT")
                if len(self.stack) > 0 and self.cstat == self.OBJCT:
                    self.mypop()
                else:
                    return self.myseterror("@@@ Syntax error!!! object unmatch ")          
                allow = self.state[c]
            elif c == ']':
                self.myprint ("End ARRAY")
                if len(self.stack) > 0 and self.cstat == self.ARRAY:
                    if not self.mypop():
                        return self.myseterror("@@@ Syntax error!!! json object unfinish ")
                else:
                    return self.myseterror("@@@ Syntax error!!! array unmatch ")
                allow = self.state[c]
            elif c == ':':
                self.myprint ("Key Separate Value")
                if self.cstat != self.OBJCT:
                    return self.myseterror("@@@ Syntax error!!! not under object")
                allow = self.state[c]
            elif c == ',':
                self.myprint ("Data Separate")
                if self.cstat == self.ARRAY:
                    allow = self.state[c]
                else:
                    allow = self.state[";"]
            else:
                self.myprint ("Data: " + c)
                if allow[-1] == 'k':
                    self.key = self.myoffquote(c, True)
                    allow = self.state["K"]
                else:
                    c = self.myoffquote(c)
                    if self.key != None:
                        if self.cstat == self.OBJCT:
                            self.cobj[self.key] = c
                        else:
                            return self.myseterror("@@@ Syntax error!!! key : value failed")
                        self.key = None
                    if self.cstat == self.ARRAY:
                        self.cobj.append(c)
                    allow = self.state["D"]
            c = self.mygettoken()
        return self.cobj
     
    def myvalue(self, v, l=0):
        if isinstance(v, dict):
            return self.myobject(v, 1, l+1)
        elif isinstance(v, list):
            return self.myobject(v, 0, l+1)
        else:
            return v 
        
    def myobject(self, d, i, l=0):
        if not (i in [0, 1]):
            return None
        f = False
        s = self.rtn + self.mygetindent(l) + self.symbol[0][i]
        for k in d:
            if f:
                s += self.symbol[2][0]
            if i == 1:
                s += self.rtn + self.mygetindent(l+1) + k + self.symbol[2][1]
                s += self.myvalue(d[k], l)
            else:
                s += self.myvalue(k, l) 
            f = True
        return s + self.symbol[1][i]

    def toString(self, json, num=0):
        self.mysetnum(num)
        if isinstance(json, dict):
            return self.myobject(json, 1, 0)
        return None

# Main test start here
def main():
    s = "{ \"Entry\" :\"License Type\", \"Number\" : \"18\", \"Value\" : [ [ \"Last Update Time\", \"[Timestamp=1440032598]\"], [ \"New Name\", \"\"], [ \"Owner\", \"ARSERVER\"], [ \"Default Value\", \"0\"], [ \"Reserved IDOK\", \"false\"], [ \"Help Text\", \"The type of license the user has. With a read license\"], [ \"Permission List\", \"[[Group Id=-160,Access=2], [Group Id=-110,Access=2], [Group Id=4,Access=2]]\"], [ \"Last Changed By\", \"Action Request Installer Account\"], [ \"Name\", \"License Type\"], [ \"Change Flags\", \"[Criteria={false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false}]\"], [ \"DInstance List\", \"{20002=[[X=60517,Y=12900], [X=106973,Y=14700]], 4=1, 7=2147483650, 20=License Type, 21=[[X=0,Y=400], [X=18672,Y=1800]], 27=16, 28=1, 29=4, 60=1, 61=25, 62=0, 64=1, 65=[[X=0,Y=0], [X=0,Y=0]], 66=[[X=0,Y=0], [X=0,Y=0]], 90=1, 91=2, 143=5, 151=[[X=19235,Y=400], [X=46456,Y=1800]]}\"], [ \"Create Mode\", \"2\"], [ \"Field Map\", \"[]\"], [ \"Diary List\", \"[Appended Text=null]\"], [ \"Option\", \"1\"], [ \"Audit Option\", \"0\"], [ \"Limit\", \"[List Style=1,Values=[[Item Name=Read,Item Number=0], [Item Name=Fixed,Item Number=1], [Item Name=Floating,Item Number=2], [Item Name=Restricted Read,Item Number=3]]]\"], [ \"Key\", \"[Form Name=User,Field Id=109]\"]] }"
    
    myjson = MyJson()
    myjson.setdebug()
    print(s)
    data = myjson.parse(s)
    print("----------")
    print(data)
    print(data["Entry"], data["Number"])
    print("----------")
    print(myjson.toString(data,4))

if __name__ == "__main__": main()