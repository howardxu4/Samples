README
======
Nov 29, 2015 

My Utility Java API:
------------------------
MyUtils.jar is a jar file that built from my wrapper classes,
and it provide the Properties, File, JSON, Net, XLSX IO operations methods.

Source Codes:
-----------
* MyFile.java  -- Wrapper of Java property, CSV File, common File API methods.
* MyNet.java   -- Contains get https info related operation methods. 
* MyJson.java  -- Contains parse string to JSON and reverse operation methods.
* MyXlsx.java  -- Contains XLSX read, create, write operation methods.

Configurable files:
-----------------
* config.prop -- configuration data for MyNet API
* manifest.mf -- standard configure for modify.

Build Script:
-----------
build.sh -- shell script to compile source codes and build the utility MyUtils.jar
build.bat -- batch script to compile source codes and build the utility MyUtils.jar

Contains:
-------

MyUtils ---- README.md
        |
        | ---- build.sh
        |
        | ---- build.bat
        |
        | ---- classes ---- manifest.mf
        |           |
        |           |  .... myutil .... *.class
        |           | 
        |           |  ---- lib ---- poi-3.13-20150929.jar
        |                   |
        |                   | ---- poi-ooxml-3.13-20150929.jar
        |                   |
        |                   | ---- poi-xooxml-schemas-3.13-20150929.jar
        |                   |
        |                   | ---- xmlbeans-2.6.0.jar
        |
        | ---- dist  ..... MyUtils.jar
        |           |
        |           | .... poi*.jar, xmlbeans-2.6.0.jar
        |
        | ---- src  ----- myutil ---- MyFile.java
        |                   |
        |                   |  ---- MyNet.java
        |                   |
        |                   |  ---- MyJson.java
        |                   |
        |                   |  ---- MyXlsx.java
        |                    
        | ---- test  ---- TestMyNet.java
                    |
                    |  ---- config.prop

Usage:
-----
* classes/manifest.mf: modify the configuration as needed
* run shell script: . build.sh
* cd test
* javac -cp .:../dist/* TestMyNet.java 
* java -cp .:../dist/* TestMyNet [param]

Example:
------
$ cd dist
$ java -jar MyUtils.jar
$ java -cp MyUtils.jar myutil.MyFile [para]

  
