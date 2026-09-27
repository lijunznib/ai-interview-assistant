param([switch]$DownloadOnly)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$repository = 'lijunznib/ai-interview-assistant'
$installerName = 'ai-interview-assistant-setup.exe'
$headers = @{ 'User-Agent' = 'ai-interview-assistant-installer'; Accept = 'application/vnd.github+json' }

Write-Host 'Checking the latest Windows release...'
$release = Invoke-RestMethod -Uri "https://api.github.com/repos/$repository/releases/latest" -Headers $headers -TimeoutSec 30
$installer = @($release.assets | Where-Object name -EQ $installerName)
$checksums = @($release.assets | Where-Object name -EQ 'SHA256SUMS.txt')
if ($installer.Count -ne 1 -or $checksums.Count -ne 1) {
    throw 'This release does not contain a complete Windows installer. Download it from GitHub Releases.'
}

# Each attempt gets its own directory; never overwrite an existing installer.
$downloadDir = Join-Path ([IO.Path]::GetTempPath()) ('ai-interview-assistant-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $downloadDir | Out-Null
$installerPath = Join-Path $downloadDir $installerName
$checksumPath = Join-Path $downloadDir 'SHA256SUMS.txt'
Write-Host "Downloading $($release.tag_name)..."
Invoke-WebRequest -UseBasicParsing -Uri $installer[0].browser_download_url -OutFile $installerPath -TimeoutSec 600
Invoke-WebRequest -UseBasicParsing -Uri $checksums[0].browser_download_url -OutFile $checksumPath -TimeoutSec 30

$pattern = '^([a-fA-F0-9]{64})\s+\*?' + [regex]::Escape($installerName) + '$'
$expected = @(Get-Content -LiteralPath $checksumPath | ForEach-Object { if ($_ -match $pattern) { $Matches[1] } })
if ($expected.Count -ne 1) { throw 'Missing or ambiguous installer checksum.' }
$actual = (Get-FileHash -LiteralPath $installerPath -Algorithm SHA256).Hash
if ($actual -ne $expected[0]) { throw 'SHA256 verification failed. The downloaded installer will not be started.' }

Write-Host "SHA256 verified: $installerPath"
if (-not $DownloadOnly) {
    Write-Host 'Starting the installer. Enter your own API settings after launch.'
    $setup = Start-Process -FilePath $installerPath -PassThru -Wait
    if ($setup.ExitCode -ne 0) { throw "Installer exited with code $($setup.ExitCode)." }
}
