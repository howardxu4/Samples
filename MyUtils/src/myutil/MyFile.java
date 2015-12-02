//******************************************************************************
// Package Declaration
//******************************************************************************
package myutil;
//******************************************************************************
// Import Specifications
//******************************************************************************	
import java.io.*;
import java.util.*;
/**
 *******************************************************************************
 * <B> Class Description: </B><p><pre>
 *
 * MyFile class is a File IO utility 
 * 1. load property file to Properties data
 * 2. read CSV file to List data and write List data to file
 * 3. provide isFile, getFullName methods for common using
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
 *  This is the class for provide CSV parser for embedded comma in double quotes 
 * </ul>
 *******************************************************************************
*/

public class MyFile {

	// check file exist
	public static String getFullName( String path, String file ) {
		String fullName = file;
		if (path != null) { 
            fullName = path.replaceAll("\\\\", "/");
			if (fullName.charAt(path.length()-1) != '/')
				fullName += "/";
			fullName += file;
		}
		return (fullName);
	}
	public static boolean isFile( String anyFile ) {
		File f = new File(anyFile);
		return f.isFile();
	}
    
    // load property file
    public static Properties loadProp(String pfile) {
        Properties prop = new Properties();
        InputStream input = null;
        try { 
            try { 
            input = Class.forName("myutil.MyFile").getClassLoader().getResourceAsStream(pfile);
            }
            catch ( Exception e) {}
            if (input == null) 
                input = new FileInputStream(pfile);
            if (input != null) 
                prop.load(input);
        } 
        catch (IOException e) {
            System.out.println( "Load Properties failed on " + pfile );
            System.out.print("Stack Trace:");
            e.printStackTrace();
        } 
        finally {
            if (input != null) {
                try {
                    input.close();
                } catch (IOException e) {}
            }
        }
        return prop;
    }
    
    // load File into List
    public static List<String> loadFile(String fn) {
        List<String> data = new ArrayList<String>();
        BufferedReader br = null;
		try {
			br = new BufferedReader(new FileReader(fn));
            String line = "";
			while ((line = br.readLine()) != null) {
				data.add( line );
			}
        } catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		return data;
    }
    
    // CSV parser
    private static String[] getTokens(String line) {
        final char COMMA = ',';
        final char QUOTE = '"';
        boolean f = false;
        List <String> myList = new ArrayList<String>();
        int start =0;
        int i = 0;
        for(; i < line.length(); i++) {
            if (line.charAt(i) == QUOTE)
                f = !f;
            else if (!f && line.charAt(i) == COMMA){ 
                myList.add(line.substring(start, i));
                start = i+1;
            }
        }
        if (start < i)
            myList.add(line.substring(start, i));
        return myList.toArray(new String[0]);
    }
	// read CSV file into data
	public static List<String[]> readCSV( String csvFile ){
		List<String[]> data = new ArrayList<String[]> ();
		BufferedReader br = null;
		try {
			br = new BufferedReader(new FileReader(csvFile));
            String line = "";
			while ((line = br.readLine()) != null) {
				data.add( getTokens(line) );
			}
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
		return data;
	}

	// write CSV file from data
	public static boolean writeCSV(String csvFile, List<String[]> data) {
		boolean rtn = true;
		FileWriter fileWriter = null;
		try {
			fileWriter = new FileWriter(csvFile);
			for (String[] d: data) {
                for (int i=0; i<d.length; i++) { 
                    if (i > 0)
                        fileWriter.append(",");
                    fileWriter.append(d[i]);
                }
                fileWriter.append("\n");
			}
		} catch (Exception e) {
            System.out.println("Error in CsvFileWriter !!!");
            e.printStackTrace();
			rtn = false;
        } finally {
            try {
                fileWriter.flush();
                fileWriter.close();
				
            } catch (IOException e) {
                System.out.println("Error while flushing/closing fileWriter !!!");
                e.printStackTrace();
				rtn = false;
            }
        }
		return rtn;
	}

	public static void main(String[] args) {
		if (args.length == 0){
			System.out.println("Usage: java MyFile {inputProp file}");
			System.out.println("Prop file: Key = Value");
            System.out.println("e.g. :  csvinfile=myinput.csv");
            System.out.println("        csvoutfile=mytest.csv");
			System.exit(0);
		}
        System.out.println( args[0] + " check: " + isFile(args[0]));
		Properties prop =loadProp(args[0]);
		
        String fin = prop.getProperty("cvsinfile");
        System.out.println( fin + " check: " + isFile(fin));
		if (fin != null) { 
            List<String[]> data = readCSV(fin);
            System.out.println("Done\t" + data.size());
            
            for (int i = 0; i < data.size(); i++)
                System.out.println("(" + i + ") Size:\t" + data.get(i).length);
            
            String fout = prop.getProperty("cvsoutfile");
            if (fout != null)
                if (writeCSV(fout, data))
                    System.out.println("Save data on file: " + fout );
        }

    }		
}
