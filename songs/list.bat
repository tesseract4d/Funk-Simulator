setlocal enabledelayedexpansion
set a=const list={
for /d %%i in (*) do (
set a=!a!"%%i":[
cd %%i
for /d %%j in (*) do (
set a=!a!"%%j",
)
set a=!a:~0,-1!],
cd ..
)
echo %a:~0,-1%}>list.js