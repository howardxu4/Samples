javac -d classes -cp "classes/lib/*" src/myutil/*.java
rm dist/*.*
cd classes
jar cfm ../dist/MyUtils.jar manifest.mf myutil/*.class
copy lib/*.jar ../dist
cd ..
