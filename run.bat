@echo off

echo.-----------------------------------------------
echo               Anime Audio Remover
echo.-----------------------------------------------
echo.

echo Please input the path to the anime folder:
set /p folder=
echo.

node run.mjs "%folder%"

echo.
echo Press any key to exit...
pause >nul