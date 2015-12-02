import java.io.*;
import java.util.*;
import myutil.*;

public class TestMyNet
{ 

    public static void main(String[] args)
    throws Exception
    {
        String user = null;
        String pswd = null;
        String agent = null;
        String httpsURL = null;
        String host = null;
        String port = null;

        String fn = "config.prop";
        if (args.length > 0)
            fn = args[0];
        
        Properties prop = MyFile.loadProp(fn);
        httpsURL = prop.getProperty("url");
        user = prop.getProperty("user");
        pswd = prop.getProperty("password");
        agent = prop.getProperty("agent");
        host = prop.getProperty("proxyhost");
	    port = prop.getProperty("proxyport");
        
        MyNet.trace(true);
        String auth = MyNet.getAuth(user, pswd);
	    if (host != null && port != null) {
            MyNet.setProxy(host, port);
            MyNet.fixCA();
	    }        
        String line = MyNet.getHttpsInfo(httpsURL, agent, auth);
             
        System.out.println(line);
        System.out.println("----------");
        MyJson myjson = new MyJson();
        myjson.setdebug(false);
        Object data = myjson.parse(line);
        System.out.println(myjson.geterror());
        if (data == null)
            System.out.println("Data is not JSON format");
        else
            System.out.println(myjson.toString(data,4));
    }
}
