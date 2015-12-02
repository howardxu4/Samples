//******************************************************************************
// Package Declaration
//******************************************************************************
package myutil;
//******************************************************************************
// Import Specifications
//******************************************************************************	
import java.io.*;
import java.util.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
/**
 *******************************************************************************
 * <B> Class Description: </B><p><pre>
 *
 * MyXlsx class is a Xlsx File IO utility 
 * 1. load xlsx file to workbook
 * 2. get workbook data to Json data 
 * 3. create workbook from Json data
 * 4. save workbook to xlsx file
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
 *  This is the class for provide Xlsx IO operations based on apache POI 
 * </ul>
 *******************************************************************************
*/

public class MyXlsx {

    public static Map<String, List<String[]>> getWkbkData(String fn){
        return getWkbkData(loadXslx(fn));
    }
    public static Workbook loadXslx(String fn) { 
        FileInputStream fis = null;
        Workbook workbook = null;
        try {
            fis = new FileInputStream(fn);
            // Using XSSF for xlsx format, for xls use HSSF
            workbook = new XSSFWorkbook(fis);
            fis.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return workbook;
    }
    public static Map<String, List<String[]>> getWkbkData(Workbook workbook) { 
        if (workbook == null) return null;
        Map<String, List<String[]>> m = new HashMap<String, List<String[]>>();
            int numberOfSheets = workbook.getNumberOfSheets();
            //System.out.println("Number of Sheet:" + numberOfSheets) ;
            //looping over each workbook sheet
            for (int i = 0; i < numberOfSheets; i++) {
                Sheet sheet = workbook.getSheetAt(i);
                String name = sheet.getSheetName();
                //System.out.println("@@@  " + name + "  ----------( " + i + " )----------");
                List<String[]> l = new ArrayList<String[]>();
                Iterator<Row> rowIterator = sheet.iterator();

                //iterating over each row
                while (rowIterator.hasNext()) {
                    Row row = rowIterator.next();
                    Iterator<Cell> cellIterator = row.cellIterator();
                    List <String> ll = new ArrayList<String>();
                    //Iterating over each cell (column wise)  in a particular row.
                    while (cellIterator.hasNext()) {
                        Cell cell = cellIterator.next();
                        //System.out.print(cell);
                        if (Cell.CELL_TYPE_STRING == cell.getCellType()) {
                            ll.add(cell.toString());
                            //The Cell Containing numeric value will contain marks
                        } else if (Cell.CELL_TYPE_NUMERIC == cell.getCellType()) {
                        int v = (int)cell.getNumericCellValue();
                        if (v == cell.getNumericCellValue())
                            ll.add(String.valueOf(v));
                        else                    
                        ll.add(String.valueOf(cell.getNumericCellValue()));
                    }
                    //end iterating a row, add all the elements of a row in list
                }
                l.add(ll.toArray(new String[0]));
            }
            //System.out.println("**********" + l.size() + "*********");
            m.put (name, l);
        }
        return m;
    }
    public static Workbook createWookbook (Map<String, List<String[]>> m){
        // Using XSSF for xlsx format, for xls use HSSF
        Workbook workbook = new XSSFWorkbook();
        for (String key: m.keySet()) {
            List<String[]> l = (List<String[]>)m.get(key);
           // System.out.println(key + ": " + l.size());
            Sheet sheet = workbook.createSheet(key);
            int rowIndex = 0;
            for (String[]s : l) {
                Row row = sheet.createRow(rowIndex++);
                int cellIndex = 0;
                for(String t: s) {
                    row.createCell(cellIndex++).setCellValue(t);
                }
            }
        }
        return workbook;
    }
    public static boolean saveXslx(String fn, Map<String, List<String[]>> m) { 
        return saveXslx(fn, createWookbook(m));
    }
    public static boolean saveXslx(String fn, Workbook workbook) { 
        //write this workbook in excel file.
        boolean f = false;
        try {
            FileOutputStream fos = new FileOutputStream(fn);
            workbook.write(fos);
            fos.close();
            f = true;
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return f;
    }
    
    public static void main(String args[]) {
        if (args.length == 0) {
            System.out.println("Usage: java -cp .:../dist/* myutl.MyXlsx {input xlsx file} [output.xlsx]");
            System.exit(0);
        }
        String fn = args[0];
        Map<String, List<String[]>> m = getWkbkData(fn);
        if (m != null) { 
            for (String key: m.keySet()) {
                List<String[]> l = (List<String[]>)m.get(key);
                System.out.println(key + ": " + l.size());
                for (String[]s : l) {
                    boolean f = false;
                    for(String t: s) {
                        if (f) System.out.print(",");
                        else f = !f;
                        System.out.print(t);
                    }
                    System.out.println("");
                }
            }
            if (args.length > 1) { 
                fn = args[1]; 
                if (saveXslx(fn,m))
                    System.out.println(fn + " is successfully written");
            }
        }
    }
}
