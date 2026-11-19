param(
  [string]$OutputDirectory = ''
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $OutputDirectory) {
  $OutputDirectory = Join-Path $projectRoot 'releases'
}

& node (Join-Path $PSScriptRoot 'stamp-assets.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Could not update asset versions.' }
& node (Join-Path $PSScriptRoot 'check-site.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Site checks failed. Fix the reported issue before packaging.' }

$null = New-Item -ItemType Directory -Path $OutputDirectory -Force
$version = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$webArchive = Join-Path $OutputDirectory "Angels-website-$version.zip"
$clientArchive = Join-Path $OutputDirectory "Angels-Claude-$version.zip"

$webFiles = Get-ChildItem -LiteralPath (Join-Path $projectRoot 'dist') -Force |
  Select-Object -ExpandProperty FullName
Compress-Archive -LiteralPath $webFiles -DestinationPath $webArchive -CompressionLevel Optimal

$clientFiles = @(
  'dist', '.claude', '.github', 'scripts', '.gitignore',
  'package.json', 'serve.mjs', 'CLAUDE.md', 'CLAUDE-CLIENT-GUIDE-ru.txt',
  'EDITING-GUIDE-ru.md', 'PUBLISHING-GUIDE-ru.md', 'HOSTING-STATUS.md'
) | ForEach-Object { Join-Path $projectRoot $_ }
Compress-Archive -LiteralPath $clientFiles -DestinationPath $clientArchive -CompressionLevel Optimal

Add-Type -AssemblyName System.IO.Compression.FileSystem
foreach ($archivePath in @($webArchive, $clientArchive)) {
  $archive = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
  try {
    $names = @($archive.Entries | ForEach-Object { $_.FullName.Replace('\', '/') })
    if ($names -match '(^|/)(\.env[^/]*|\.git|node_modules|source-assets)(/|$)') {
      throw 'Unexpected private or development file in archive.'
    }
    $indexPath = if ($archivePath -eq $webArchive) { 'index.html' } else { 'dist/index.html' }
    if ($names -notcontains $indexPath) { throw "Missing $indexPath in archive." }
  } finally {
    $archive.Dispose()
  }
}

Write-Output "Website archive ready: $webArchive"
Write-Output "Claude project archive ready: $clientArchive"
