javac -d classes -cp "classes/lib/*" src/myutil/*.java
rm -f dist/*.*
cd classes
jar cfm ../dist/MyUtils.jar manifest.mf myutil/*.class
cp lib/*.jar ../dist
cd ..
