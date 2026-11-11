# QC Tote Rental source snapshot creator
# Compatible with Windows PowerShell 5.1 and PowerShell 7+

$ErrorActionPreference = "Stop"

$ProjectRoot = (Get-Location).Path
while ($ProjectRoot.EndsWith("\") -or $ProjectRoot.EndsWith("/")) {
    $ProjectRoot = $ProjectRoot.Substring(0, $ProjectRoot.Length - 1)
}

$OutputFile = Join-Path $ProjectRoot "QCToteRental_CODE_SNAPSHOT.md"

$ExcludedDirectories = @(
    "node_modules",
    ".next",
    ".git",
    ".netlify",
    "generated",
    "coverage",
    "dist",
    "build"
)

$ExcludedFileNames = @(
    "QCToteRental_CODE_SNAPSHOT.md",
    "build-error.txt"
)

$AllowedExtensions = @(
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".json", ".css", ".scss", ".md", ".prisma",
    ".yml", ".yaml", ".toml", ".txt", ".ps1"
)

function Get-RelativeProjectPath {
    param([string]$FullName)

    $rootWithSeparator = $ProjectRoot + [System.IO.Path]::DirectorySeparatorChar
    if ($FullName.StartsWith($rootWithSeparator, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $FullName.Substring($rootWithSeparator.Length).Replace("\", "/")
    }

    return [System.IO.Path]::GetFileName($FullName)
}

function Test-IsExcludedPath {
    param([string]$RelativePath)

    $segments = $RelativePath -split "/"
    foreach ($directory in $ExcludedDirectories) {
        if ($segments -contains $directory) {
            return $true
        }
    }

    return $false
}

function Test-IsSensitiveFile {
    param([System.IO.FileInfo]$File)

    $name = $File.Name.ToLowerInvariant()

    if ($name -eq ".env" -or $name.StartsWith(".env.")) { return $true }
    if ($name -like "*.pem" -or $name -like "*.key" -or $name -like "*.pfx" -or $name -like "*.p12") { return $true }
    if ($name -like "*secret*" -or $name -like "*credentials*") { return $true }

    return $false
}

$Files = Get-ChildItem -Path $ProjectRoot -Recurse -File -Force | ForEach-Object {
    $relativePath = Get-RelativeProjectPath -FullName $_.FullName

    if (Test-IsExcludedPath -RelativePath $relativePath) { return }
    if ($ExcludedFileNames -contains $_.Name) { return }
    if (Test-IsSensitiveFile -File $_) { return }
    if ($AllowedExtensions -notcontains $_.Extension.ToLowerInvariant()) { return }

    [PSCustomObject]@{
        File = $_
        RelativePath = $relativePath
    }
} | Sort-Object RelativePath

$Builder = New-Object System.Text.StringBuilder
[void]$Builder.AppendLine("# QC Tote Rental Code Snapshot")
[void]$Builder.AppendLine("")
[void]$Builder.AppendLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')")
[void]$Builder.AppendLine("")
[void]$Builder.AppendLine("> Security note: environment files, common secret files, dependencies, build output, Git data, and generated Prisma client files are excluded. Review this snapshot before sharing.")
[void]$Builder.AppendLine("")
[void]$Builder.AppendLine("## File Index")
[void]$Builder.AppendLine("")

foreach ($entry in $Files) {
    [void]$Builder.AppendLine("- ``$($entry.RelativePath)``")
}

[void]$Builder.AppendLine("")
[void]$Builder.AppendLine("---")
[void]$Builder.AppendLine("")

foreach ($entry in $Files) {
    $extension = $entry.File.Extension.ToLowerInvariant().TrimStart(".")
    $language = switch ($extension) {
        "ts" { "typescript" }
        "tsx" { "tsx" }
        "js" { "javascript" }
        "jsx" { "jsx" }
        "mjs" { "javascript" }
        "cjs" { "javascript" }
        "json" { "json" }
        "css" { "css" }
        "scss" { "scss" }
        "md" { "markdown" }
        "prisma" { "prisma" }
        "yml" { "yaml" }
        "yaml" { "yaml" }
        "toml" { "toml" }
        "ps1" { "powershell" }
        default { "text" }
    }

    [void]$Builder.AppendLine("## $($entry.RelativePath)")
    [void]$Builder.AppendLine("")
    [void]$Builder.AppendLine("````$language")

    try {
        $content = [System.IO.File]::ReadAllText($entry.File.FullName)
        [void]$Builder.Append($content)
        if (-not $content.EndsWith("`n")) {
            [void]$Builder.AppendLine("")
        }
    }
    catch {
        [void]$Builder.AppendLine("[Unable to read file: $($_.Exception.Message)]")
    }

    [void]$Builder.AppendLine("````")
    [void]$Builder.AppendLine("")
}

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($OutputFile, $Builder.ToString(), $Utf8NoBom)

$OutputInfo = Get-Item $OutputFile
$SizeMb = [Math]::Round($OutputInfo.Length / 1MB, 2)

Write-Host ""
Write-Host "Snapshot created successfully." -ForegroundColor Green
Write-Host "Files included: $($Files.Count)"
Write-Host "Output: $OutputFile"
Write-Host "Size: $SizeMb MB"
Write-Host ""
Write-Host "Before sharing, open the snapshot and search for PASSWORD, SECRET, API_KEY, TOKEN, and PRIVATE KEY." -ForegroundColor Yellow
