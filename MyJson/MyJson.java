import java.util.*;

/*
    Author:  Howard Xu
    Created: 11-10-2015
    Utility: MyJson class for JSON parser and toString
    Methds:  parse, toString, setoption, setdebug, geterror
    Note:    overcome the normal JSON parse failed on invalid token
*/
public class MyJson {

        private boolean OPTION;
        private boolean DEBUG;
        private String error;
    
        private int start;
        private int index;
        private int count;
        private int number;
        private int length;
    
        private String rtn;
        private String key;
        private String line;
        private boolean flag;
        private STAT cstat;
        private Object cobj;
        private Stack <Object> stack;
        private Map<String,String> state;    
        
        // Constants
        private enum STAT {EMPTY, ARRAY, OBJECT};
        private final char QUOTE = '"';
        private final String resky = "[]{}:,";
        private final String [][] symbol = {{ "[", "{"}, { "]", "}"}, { ", ", ": "}};
        private final String [][] STATE = {
            { "{" , "}Dk" },    //#Push   }D
            { "}" , ",]}" },    //#Pop
            { "[" , "]{[D" },   //#Push   ]{[D
            { "]" , ",]}" },    //#Pop
            { "," , "{[D" },    //#       {[D
            { "K" , ":" },      //#       :
            { ":" , "{[D" },    //#       {[D  
            { ";" , "Dk" },     //#       D
            { "D" , ",]}" }};   //#       ,]}:
        
    public MyJson(){
        this.OPTION = false;
        this.DEBUG = false;
        this.error = "";
        this.index = -1;
        this.number = 0;
        this.rtn = "";
        this.line = "";
        
        this.state = new HashMap<String, String>();
        for (String[] s : STATE) 
            state.put(s[0], s[1]);
    }
    
    public void myprint(String s){ 
        if (this.DEBUG)
            System.out.println(s);
    }
    
    public void setoption(boolean f) {
        this.OPTION = f;
    }
    
    public void setdebug(boolean f) { 
        this.DEBUG = f;
    }

    public String geterror()  {
        return this.error;
    }
    
    private Object myseterror(String errstr) {
        this.error = "Error on (" + this.index + ") " + errstr;
        myprint(this.error);
        return null;
    }
    
    public String mygetindent(int l){
        String s = "";
        for (int i = 0; i < l*this.number; i++)
            s += " ";
        return s;
    }

    public void mysetnum(int num) {
        this.number = num;
        this.rtn = "";
        if (num > 0)
            this.rtn = "\n";
    }
    
    public void mysetstr(String line){
        this.line = line;
        this.start = 0;
        this.index = 0;
        this.flag = true;
        this.count = 0;
        this.length = line.length();
        
        this.cstat = STAT.EMPTY;
        this.cobj = null;
        this.key = "";
        this.stack = new Stack<Object>();
        this.error = "";
    }
        
    private String myoffquote(String  c, boolean f) {
        f = f || this.OPTION;
        if (f && c.length() > 1 && c.charAt(0) == '"' && c.charAt(c.length()-1) == '"')
            c = c.substring(1, c.length()-1);
        return c;
    }
    
    private String mygettoken() {
        while (this.index < this.length){ 
            char c = this.line.charAt(this.index);
            if (this.flag) { 
                if (this.resky.indexOf(c) != -1) { 
                    if (this.count > 0) { 
                        String t = this.line.substring(this.start,this.index).trim();
                        this.count = 0;
                        if (t.length() > 0)
                            return t;
                    }
                    this.start = this.index+1;
                    this.index += 1;
                    return "" + c;
                }
                else if (c == this.QUOTE) { 
                    if (this.count > 0) { 
                        String t = this.line.substring(this.start,this.index).trim();
                        this.count = 0;
                        if (t.length() > 0)
                            return t;
                    }
                    this.flag = false;
                    this.start = this.index;
                }
                else
                    this.count += 1;
            }
            else
                if (c == this.QUOTE) { 
                    String t = this.line.substring(this.start,this.index+1);
                    this.start = this.index+1;
                    this.flag = true;
                    this.index += 1;
                    return t;
                }
            this.index += 1;
        }
        return null; 
    }
       
    private void mypush(Object obj){ 
        if (this.key != "") { 
            this.stack.push(this.key);
            this.key = "";
        }
        this.cobj = obj;
        this.stack.push(this.cobj);
    }
    
    private boolean mypop(){ 
        boolean r = true;
        Object obj = this.stack.pop();
        if (this.stack.size() > 0) { 
            this.cobj = this.stack.peek();
            if (this.cobj instanceof String){ 
                this.key = (String)this.stack.pop();
                this.cobj = this.stack.peek();
            }
            if (this.cobj instanceof Map) { 
                ((Map)(this.cobj)).put(this.key, obj);
                this.cstat = STAT.OBJECT;
            }
            else { 
                ((List)(this.cobj)).add(obj);
                this.cstat = STAT.ARRAY;
            }
            this.key = "";
        }
        else {
            if (this.cstat == STAT.ARRAY)
                r = false;
            this.cstat = STAT.EMPTY;
        }
        return r;
    }
    
    public Object parse(String line) { 
        this.mysetstr(line);
        String allow = "{";     //# start state
        String c = this.mygettoken();
        while (c != null) {
            if (c.length() == 1)
                if (allow.indexOf(c) == -1)
                    return this.myseterror("@@@ Syntax error!!! ");
            if (c.equals("{") ) {
                this.myprint ("Create OBJECT");
                this.mypush(new HashMap<String, Object>());
                this.cstat = STAT.OBJECT;
                allow = this.state.get(c);
            }
            else if (c.equals("[") ){
                this.myprint ("Create ARRAY");
                this.mypush(new ArrayList<Object>());
                this.cstat = STAT.ARRAY;
                allow = this.state.get(c);
            }
            else if (c.equals("}") ) {
                this.myprint ("End OBJECT");
                if (this.stack.size() > 0 && this.cstat == STAT.OBJECT)
                    this.mypop();
                else
                    return this.myseterror("@@@ Syntax error!!! object unmatch ");
                allow = this.state.get(c);
            }
            else if (c.equals("]")) {
                this.myprint ("End ARRAY");
                if ( this.stack.size() > 0 && this.cstat == STAT.ARRAY) { 
                    if (!this.mypop())
                        return this.myseterror("@@@ Syntax error!!! json object unfinish ");
                }
                else
                    return this.myseterror("@@@ Syntax error!!! array unmatch ");
                allow = this.state.get(c);
            }
            else if (c.equals(":") ){
                this.myprint ("Key Separate Value");
                if (this.cstat != STAT.OBJECT)
                    return this.myseterror("@@@ Syntax error!!! not under object");
                allow = this.state.get(c);
            }
            else if (c.equals(",")) { 
                this.myprint ("Data Separate");
                if (this.cstat == STAT.ARRAY)
                    allow = this.state.get(c);
                else
                    allow = this.state.get(";");
            }
            else { 
                this.myprint ("Data: " + c);
                if (allow.charAt(allow.length()-1) == 'k') { 
                    this.key = this.myoffquote(c, true);
                    allow = this.state.get("K");
                }
                else { 
                    c = this.myoffquote(c, false);
                    if (this.key != "") {
                        if (this.cstat == STAT.OBJECT)
                            ((Map)(this.cobj)).put(this.key, c);
                        else
                            return this.myseterror("@@@ Syntax error!!! key : value failed");
                        this.key = "";
                    }
                    if ( this.cstat == STAT.ARRAY)
                        ((List)(this.cobj)).add(c);
                    allow = this.state.get("D");
                }
            }
            c = this.mygettoken();
        }
        return this.cobj;
    }
   
    private Object myvalue(Object v, int l) { 
        if (v instanceof Map) 
            return this.myobject(v, 1, l+1);
        else if (v instanceof List) 
            return this.myobject(v, 0, l+1);
        else
            return v ;
    }
    
    private String myobject(Object d, int i, int l) { 
        if (i != 1 && i != 0)
            return null;
        boolean f = false;
        String s = this.rtn + this.mygetindent(l) + this.symbol[0][i];
        if (i == 1) {
            Map<String, Object> m = (Map <String, Object>)d;
            for (String k : m.keySet()) { 
                if (f)
                    s += this.symbol[2][0];
                else
                    f = true; 
                s += this.rtn + this.mygetindent(l+1) + k + this.symbol[2][1];

                s += this.myvalue(m.get(k), l);
            }
        }
        else { 
            for (Object k: (List)d) { 
                if (f)
                    s += this.symbol[2][0];
                else
                    f = true;
                s += this.myvalue(k, l); 
            }
        }
        return s + this.symbol[1][i];
    }
    
    public String toString(Object json, int num) { 
        this.mysetnum(num);
        if ( json instanceof Map) 
            return this.myobject(json, 1, 0);
        return null;
    }

//# Main test start here
    static public void main(String[] argv) {
    String s = "{ \"Entry\" :\"License Type\", \"Number\" : \"18\", \"Value\" : [ [ \"Last Update Time\", \"[Timestamp=1440032598]\"], [ \"New Name\", \"\"], [ \"Owner\", \"ARSERVER\"], [ \"Default Value\", \"0\"], [ \"Reserved IDOK\", \"false\"], [ \"Help Text\", \"The type of license the user has. With a read license\"], [ \"Permission List\", \"[[Group Id=-160,Access=2], [Group Id=-110,Access=2], [Group Id=4,Access=2]]\"], [ \"Last Changed By\", \"Action Request Installer Account\"], [ \"Name\", \"License Type\"], [ \"Change Flags\", \"[Criteria={false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false}]\"], [ \"DInstance List\", \"{20002=[[X=60517,Y=12900], [X=106973,Y=14700]], 4=1, 7=2147483650, 20=License Type, 21=[[X=0,Y=400], [X=18672,Y=1800]], 27=16, 28=1, 29=4, 60=1, 61=25, 62=0, 64=1, 65=[[X=0,Y=0], [X=0,Y=0]], 66=[[X=0,Y=0], [X=0,Y=0]], 90=1, 91=2, 143=5, 151=[[X=19235,Y=400], [X=46456,Y=1800]]}\"], [ \"Create Mode\", \"2\"], [ \"Field Map\", \"[]\"], [ \"Diary List\", \"[Appended Text=null]\"], [ \"Option\", \"1\"], [ \"Audit Option\", \"0\"], [ \"Limit\", \"[List Style=1,Values=[[Item Name=Read,Item Number=0], [Item Name=Fixed,Item Number=1], [Item Name=Floating,Item Number=2], [Item Name=Restricted Read,Item Number=3]]]\"], [ \"Key\", \"[Form Name=User,Field Id=109]\"]] }";
    
        MyJson myjson = new MyJson();
        myjson.setdebug(false);
        System.out.println(s);
        Map data = (Map)myjson.parse(s);
        System.out.println("----------");
        System.out.println(data);
        System.out.println(data.get( "Entry"));
        System.out.println(data.get("Number"));
        System.out.println("----------");
        System.out.print(myjson.toString(data,4));
    }
}