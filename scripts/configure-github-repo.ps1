# Canor GitHub 仓库自动化配置脚本
# 使用方法: 在 PowerShell 中运行 .\scripts\configure-github-repo.ps1

param(
    [string]$Token = $env:GITHUB_TOKEN,
    [string]$Owner = "Aaron-yang1874",
    [string]$Repo = "Canor-pro"
)

$headers = @{
    Authorization = "token $Token"
    Accept = "application/vnd.github.v3+json"
}

function Set-BranchProtection {
    Write-Host "🔒 设置分支保护规则..." -ForegroundColor Cyan
    $body = @{
        required_status_checks = @{
            strict = $true
            contexts = @("CI/CD")
        }
        enforce_admins = $true
        required_pull_request_reviews = @{
            required_approving_review_count = 1
            dismiss_stale_reviews = $true
        }
        restrictions = $null
    } | ConvertTo-Json -Depth 10

    try {
        Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/branches/main/protection" `
            -Headers $headers -Method PUT -Body $body -ContentType "application/json"
        Write-Host "✅ 分支保护规则已设置" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 422) {
            Write-Host "⚠️ 分支保护规则已存在，跳过" -ForegroundColor Yellow
        } else {
            Write-Host "❌ 设置失败: $_" -ForegroundColor Red
        }
    }
}

function Enable-ActionsPermissions {
    Write-Host "⚙️  配置 Actions 权限..." -ForegroundColor Cyan
    $body = @{
        default_workflow_permissions = "read"
        can_approve_pull_request_reviews = $false
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/actions/permissions" `
            -Headers $headers -Method PUT -Body $body -ContentType "application/json"
        Write-Host "✅ Actions 权限已配置" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  配置失败: $_" -ForegroundColor Yellow
    }
}

function Create-Environment {
    Write-Host "🏗️  创建生产环境配置..." -ForegroundColor Cyan
    $body = @{
        protection_rules = @(
            @{
                wait_timer = 0
                reviewers = @()
            }
        )
    } | ConvertTo-Json -Depth 10

    try {
        Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/environments/production" `
            -Headers $headers -Method PUT -Body $body -ContentType "application/json"
        Write-Host "✅ 生产环境已创建" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  环境创建失败: $_" -ForegroundColor Yellow
    }
}

# 主流程
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Canor GitHub 仓库自动化配置" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

if (-not $Token) {
    Write-Host "❌ 请设置 GITHUB_TOKEN 环境变量或传入 -Token 参数" -ForegroundColor Red
    Write-Host "   获取方式: https://github.com/settings/tokens" -ForegroundColor Yellow
    exit 1
}

Set-BranchProtection
Enable-ActionsPermissions
Create-Environment

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "✅ GitHub 仓库配置完成！" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Magenta
Write-Host "请在 GitHub 网页上完成以下配置：" -ForegroundColor Cyan
Write-Host "  1. 启用 CodeQL: Settings → Security → CodeQL analysis" -ForegroundColor Yellow
Write-Host "  2. 启用 GitHub Pages: Settings → Pages → Source: main" -ForegroundColor Yellow
Write-Host "  3. 设置仓库可见性: Settings → Danger Zone" -ForegroundColor Yellow
