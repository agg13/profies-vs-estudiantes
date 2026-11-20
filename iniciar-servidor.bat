@echo off
setlocal
cd /d "%~dp0"
echo.
echo La ultima asesoria mortal: Profesores Zombis
echo Abre http://localhost:8000 en el navegador.
echo Conserva esta ventana abierta mientras pruebas el juego.
echo.
where py >nul 2>nul
if not errorlevel 1 goto servidor_py

python --version >nul 2>nul
if not errorlevel 1 goto servidor_python

where node >nul 2>nul
if not errorlevel 1 goto servidor_node

echo No se encontro Python ni Node.js.
echo Instala Python 3 y vuelve a ejecutar este archivo.
pause
goto fin

:servidor_py
py -m http.server 8000
goto fin

:servidor_python
python -m http.server 8000
goto fin

:servidor_node
node servidor-local.js

:fin
endlocal

