# Backend Setup Instructions

## Prerequisites
- Ruby 3.4.5
- MySQL installed locally
- Bundler

## Setup Steps

### 1. Install MySQL
```bash
brew install mysql
brew services start mysql
```

MySQL is installed without a root password by default.

### 2. Configure Database
The database configuration is already set up in `config/database.yml`:
- Username: root
- Password: (empty)
- Host: localhost
- Port: 3306

To use different credentials, edit lines 16-17 in `config/database.yml`.

### 3. Install Dependencies
```bash
bundle install
```

### 4. Setup Database
```bash
rails db:create
rails db:migrate
rails db:seed
```

### 5. Start Server
```bash
rails server
```

The server will start on http://localhost:3000

## Troubleshooting

### MySQL Connection Issues
If you encounter connection errors:
1. Ensure MySQL is running: `brew services list`
2. Start MySQL if needed: `brew services start mysql`
3. Verify credentials in `config/database.yml`

### Gem Installation Issues
If native extensions fail to compile:
1. Ensure Xcode Command Line Tools are installed: `xcode-select --install`
2. Install MySQL client library: `brew install mysql-client`

## Repository
This backend was cloned from: https://github.com/expertiza/reimplementation-back-end