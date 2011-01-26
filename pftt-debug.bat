@echo OFF
echo Generating debug build...
attrib -R .pftt-debug.js
cscript /nologo %~dp0\generate-debug.js
attrib +R .pftt-debug.js
echo Executing debug build...
cscript /nologo %~dp0\.pftt-debug.js %*