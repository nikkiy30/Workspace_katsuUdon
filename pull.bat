@echo off

echo developブランチから最新のコードを取得します...

for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i

if not "%current_branch%"=="develop" (
    echo %current_branch% から develop に移動します...
    git checkout develop
    if errorlevel 1 (
        echo ❌ developブランチへの移動に失敗しました
        pause
        exit /b 1
    )
) else (
    echo 現在のブランチは develop です
)

git pull origin develop
if errorlevel 1 (
    echo ❌ developブランチから最新のコードを取得に失敗しました
    pause
    exit /b 1
) else (
    echo ✅ developブランチから最新のコードを取得しました
)

pause
