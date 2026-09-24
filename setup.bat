@echo off
echo ==========================================
echo   🚀 STARTING LARAVEL + VITE PROJECT SETUP
echo ==========================================

:: 1. Handle .env Configuration File
echo 📝 Checking for .env configuration file...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo ✅ Created .env file from .env.example template.
    ) else (
        echo ❌ Error: Neither .env nor .env.example was found.
        echo Please create a .env file manually before continuing.
        pause
        exit /b 1
    )
) else (
    echo ℹ️ .env file already exists. Skipping creation.
)

:: 2. Install Node Dependencies
echo 📦 Installing Node.js packages...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed. Make sure Node.js is installed.
    pause
    exit /b %errorlevel%
)

:: 3. Install PHP Dependencies
echo 🐘 Installing PHP Composer packages...
call composer install
if %errorlevel% neq 0 (
    echo ❌ composer install failed. Make sure Composer and PHP are installed.
    pause
    exit /b %errorlevel%
)

:: 4. Setup SQLite Database File
echo 🗄️ Setting up SQLite database...
if not exist "database\database.sqlite" (
    copy nul "database\database.sqlite" >nul
    echo ✅ Created database.sqlite file.
) else (
    echo ℹ️ database.sqlite already exists. Skipping creation.
)

:: 5. Generate Application Key
echo 🔑 Generating Laravel application key...
call php artisan key:generate

:: 6. Run Migrations
echo 🗄️ Running database migrations...
call php artisan config:clear
call php artisan migrate --force

echo ==========================================
echo   🎉 SETUP COMPLETE! 
echo ==========================================
echo   To start coding, run these commands in separate terminals:
echo   1. php artisan serve
echo   2. npm run dev
echo ==========================================
pause