$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$filePath = Join-Path $projectRoot "components\admin\ArticleEditor.tsx"

if (-not (Test-Path -LiteralPath $filePath)) {
  throw "Could not find components\admin\ArticleEditor.tsx. Place this script in the project root and run it again."
}

$content = Get-Content -LiteralPath $filePath -Raw
$old = '<img src={form.imageUrl} alt="" className="mb-8 w-full rounded-2xl object-cover" />'
$new = '<img src={form.imageUrl} alt="" className="mx-auto mb-8 max-h-[500px] w-full rounded-2xl object-contain sm:w-3/4" />'

if (-not $content.Contains($old)) {
  throw "The expected Preview image line was not found. No changes were made."
}

$backupPath = "$filePath.preview-backup"
Copy-Item -LiteralPath $filePath -Destination $backupPath -Force
$content = $content.Replace($old, $new)
Set-Content -LiteralPath $filePath -Value $content -Encoding UTF8

Write-Host "Preview image sizing updated successfully."
Write-Host "Updated: $filePath"
Write-Host "Backup:  $backupPath"
