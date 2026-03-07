@echo off
chcp 65001 >nul
REM ============================================
REM Push thay đổi lên git (add + commit + push)
REM Cách dùng: push.bat
REM         hoặc: push.bat "nội dung commit"
REM ============================================

set "MSG=%~1"
if "%MSG%"=="" set "MSG=Update data (studyRecords, users...)"

echo.
echo [1/3] git add ...
git add .
if errorlevel 1 (
    echo Loi: git add that bai.
    pause
    exit /b 1
)

echo [2/3] git commit -m "%MSG%"
git commit -m "%MSG%"
if errorlevel 1 (
    echo.
    echo Chu y: Co the khong co thay doi de commit, hoac da commit roi.
    echo Tiep tuc push...
    echo.
)

echo [3/3] git push
git push
if errorlevel 1 (
    echo.
    echo Loi: git push that bai. Kiem tra mang hoac remote.
    pause
    exit /b 1
)

echo.
echo Xong. Da push len remote.
echo.
pause
