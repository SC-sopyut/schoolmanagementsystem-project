@REM  @echo off
@REM  echo ==========================================
@REM  echo   🚀 STARTING LARAVEL + VITE PROJECT SETUP
@REM  echo ==========================================

@REM  :: 1. Handle .env Configuration File
@REM  echo 📝 Checking for .env configuration file...
@REM  if not exist ".env" (
@REM      if exist ".env.example" (
@REM          copy ".env.example" ".env" >nul
@REM          echo ✅ Created .env file from .env.example template.
@REM      ) else (
@REM          echo ❌ Error: Neither .env nor .env.example was found.
@REM          echo Please create a .env file manually before continuing.
@REM          pause
@REM          exit /b 1
@REM      )
@REM  ) else (
@REM      echo ℹ️ .env file already exists. Skipping creation.
@REM  )

@REM  :: 2. Install Node Dependencies
@REM  echo 📦 Installing Node.js packages...
@REM  call npm install
@REM  if %errorlevel% neq 0 (
@REM      echo ❌ npm install failed. Make sure Node.js is installed.
@REM      pause
@REM      exit /b %errorlevel%
@REM  )

@REM  :: 3. Install PHP Dependencies
@REM  echo 🐘 Installing PHP Composer packages...
@REM  call composer install
@REM  if %errorlevel% neq 0 (
@REM      echo ❌ composer install failed. Make sure Composer and PHP are installed.
@REM      pause
@REM      exit /b %errorlevel%
@REM  )

@REM  :: 4. Setup SQLite Database File
@REM  echo 🗄️ Setting up SQLite database...
@REM  if not exist "database\database.sqlite" (
@REM      copy nul "database\database.sqlite" >nul
@REM      echo ✅ Created database.sqlite file.
@REM  ) else (
@REM      echo ℹ️ database.sqlite already exists. Skipping creation.
@REM  )

@REM  :: 5. Generate Application Key
@REM  echo 🔑 Generating Laravel application key...
@REM  call php artisan key:generate

@REM  :: 6. Run Migrations
@REM  echo 🗄️ Running database migrations...
@REM  call php artisan config:clear
@REM  call php artisan migrate --force

@REM  echo ==========================================
@REM  echo   🎉 SETUP COMPLETE! 
@REM  echo ==========================================
@REM  echo   To start coding, run these commands in separate terminals:
@REM  echo   1. php artisan serve
@REM  echo   2. npm run dev
@REM  echo ==========================================
@REM  pause