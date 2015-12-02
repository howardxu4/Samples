//******************************************************************************
// Package Declaration
//******************************************************************************
package myutil;
//******************************************************************************
// Import Specifications
//******************************************************************************
import java.net.URL;
import java.io.*;
import java.util.*;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;
/**
 *******************************************************************************
 * <B> Class Description: </B><p><pre>
 *
 * MyNet class is a Network utility 
 * 1. clone the BASE64 encode and decode methods
 * 2. clone the fix CA for pass valid certification
 * 3. provide getAuth, setProxy, fixCA methods for common using
 * This class has implemented the static methods for convenient use.
 *
 * </pre>
 *******************************************************************************
 * <B> Author: </B><p><pre>
 *
 *  Howard Xu
 *
 * </pre>
 *******************************************************************************
 * <B> Notes: </B><ul>
 *  This is the class will add more common network utilities
 * </ul>
 *******************************************************************************
*/


public class MyNet
{ 
    private static boolean TRACE = false;

    private static void myprint(String s){ 
        if (TRACE)
            System.out.println(s);
    }
    public static void trace(boolean f) {
        TRACE = f;
    }
    /*
     *  Base64 utility -- https://en.wikipedia.org/wiki/Base64
     */
    private static final String codes = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    public static byte[] base64Decode(String input)    {
        if (input.length() % 4 != 0)    {
            throw new IllegalArgumentException("Invalid base64 input");
        }
        byte decoded[] = new byte[((input.length() * 3) / 4) - (input.indexOf('=') > 0 ? (input.length() - input.indexOf('=')) : 0)];
        char[] inChars = input.toCharArray();
        int j = 0;
        int b[] = new int[4];
        for (int i = 0; i < inChars.length; i += 4)     {
            // This could be made faster (but more complicated) by precomputing these index locations
            b[0] = codes.indexOf(inChars[i]);
            b[1] = codes.indexOf(inChars[i + 1]);
            b[2] = codes.indexOf(inChars[i + 2]);
            b[3] = codes.indexOf(inChars[i + 3]);
            decoded[j++] = (byte) ((b[0] << 2) | (b[1] >> 4));
            if (b[2] < 64)      {
                decoded[j++] = (byte) ((b[1] << 4) | (b[2] >> 2));
                if (b[3] < 64)  {
                    decoded[j++] = (byte) ((b[2] << 6) | b[3]);
	        }
            }
        }

        return decoded;
    }

    public static String base64Encode(byte[] in)       {
        StringBuffer out = new StringBuffer((in.length * 4) / 3);
        int b;
        for (int i = 0; i < in.length; i += 3)  {
            b = (in[i] & 0xFC) >> 2;
            out.append(codes.charAt(b));
            b = (in[i] & 0x03) << 4;
            if (i + 1 < in.length)      {
                b |= (in[i + 1] & 0xF0) >> 4;
                out.append(codes.charAt(b));
                b = (in[i + 1] & 0x0F) << 2;
                if (i + 2 < in.length)  {
                    b |= (in[i + 2] & 0xC0) >> 6;
                    out.append(codes.charAt(b));
                    b = in[i + 2] & 0x3F;
                    out.append(codes.charAt(b));
                } else  {
                    out.append(codes.charAt(b));
                    out.append('=');
                }
            } else      {
                out.append(codes.charAt(b));
                out.append("==");
            }
        }

        return out.toString();
    }
    
    public static String getAuth(String name, String password) { 
        String authString = name + ":" + password;
        myprint("auth string: " + authString);
        String authStringEnc = base64Encode(authString.getBytes());
        myprint("Base64 encoded auth string: " + authStringEnc);
        return authStringEnc;
    }

    public static void setProxy(String host, String port) {
        System.setProperty("https.proxyHost", host);
        System.setProperty("https.proxyPort", port);
	    myprint("Set Proxy " + host + ":" + port);
    }
    
    public static void fixCA() throws Exception
    {
		/*
		 *  fix for
		 *    Exception in thread "main" javax.net.ssl.SSLHandshakeException:
		 *       sun.security.validator.ValidatorException:
		 *           PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException:
		 *               unable to find valid certification path to requested target
		 */
		TrustManager[] trustAllCerts = new TrustManager[] {
			new X509TrustManager() {
				public java.security.cert.X509Certificate[] getAcceptedIssuers() {
					return null;
				}
				public void checkClientTrusted(X509Certificate[] certs, String authType) {  }
				public void checkServerTrusted(X509Certificate[] certs, String authType) {  }
			}
		};

		SSLContext sc = SSLContext.getInstance("SSL");
		sc.init(null, trustAllCerts, new java.security.SecureRandom());
		HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());

		// Create all-trusting host name verifier
		HostnameVerifier allHostsValid = new HostnameVerifier() {
			public boolean verify(String hostname, SSLSession session) {
			  return true;
			}
		};
		// Install the all-trusting host verifier
		HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);
		/*
		 * end of the fix
		 */
        myprint("fixCA called"); 
	}
    
    public static String getHttpsInfo(String url, String agent, String auth) {
        String result = "";
        try { 
            URL myurl = new URL(url);
            HttpsURLConnection con = (HttpsURLConnection)myurl.openConnection();
            con.setConnectTimeout(100000);                          // 100 secs
            if (agent != null)
                con.setRequestProperty("User-Agent", agent);
            if (auth != null)
                con.setRequestProperty("Authorization", "Basic " + auth);
            InputStream ins = con.getInputStream();
            
            InputStreamReader isr = new InputStreamReader(ins);
            BufferedReader in = new BufferedReader(isr);

            String inputLine;
            while ((inputLine = in.readLine()) != null)
            {
                result += inputLine;
            } 
            in.close();
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }
}
