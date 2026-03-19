#!/usr/bin/env pwsh
# ============================================================
# Script: Khởi động Local Database cho Development
# Cách dùng: .\scripts\db-start.ps1
# ============================================================

Write-Host "🐘 Khởi động PostgreSQL local..." -ForegroundColor Cyan

# Kiểm tra Docker đang chạy chưa
$dockerReady = $false
try {
    docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { $dockerReady = $true }
} catch {}

if (-not $dockerReady) {
    Write-Host "❌ Docker Desktop chưa chạy! Vui lòng mở Docker Desktop trước." -ForegroundColor Red
    Write-Host "   Sau khi Docker Desktop ready (icon system tray chuyển xanh), chạy lại script này." -ForegroundColor Yellow
    exit 1
}

# Khởi động container
Write-Host "✅ Docker OK! Đang khởi động container..." -ForegroundColor Green
docker compose up -d

# Đợi DB healthy
Write-Host "⏳ Chờ PostgreSQL sẵn sàng..." -ForegroundColor Yellow
$timeout = 30
$elapsed = 0
while ($elapsed -lt $timeout) {
    $health = docker inspect headhunt_db --format "{{.State.Health.Status}}" 2>&1
    if ($health -eq "healthy") {
        Write-Host "✅ PostgreSQL sẵn sàng!" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 2
    $elapsed += 2
    Write-Host "   Waiting... ${elapsed}s" -ForegroundColor DarkGray
}

if ($elapsed -ge $timeout) {
    Write-Host "⚠️  Timeout chờ DB healthy. Vẫn có thể thử tiếp." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 Kết nối: postgresql://headhunt:headhunt123@localhost:5432/headhunt_manager" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Các bước tiếp theo:" -ForegroundColor White
Write-Host "   1. Đổi DATABASE_URL trong .env sang local URL ở trên" -ForegroundColor Gray
Write-Host "   2. npx prisma db push     (tạo bảng)" -ForegroundColor Gray
Write-Host "   3. npx prisma db seed     (seed data mẫu)" -ForegroundColor Gray
Write-Host "   4. npm run dev            (chạy web)" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Để dừng DB: docker compose stop" -ForegroundColor DarkGray
