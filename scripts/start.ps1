param([switch]$SetupOnly,[switch]$NoOpen,[int]$Port=5199,[switch]$Portable)
$ErrorActionPreference='Stop'
$taskRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Set-Location -LiteralPath $taskRoot
$localRoot=Join-Path $taskRoot '.local'
$nodeCommand=Get-Command node.exe -ErrorAction SilentlyContinue
$nodePath=if($nodeCommand){$nodeCommand.Source}else{$null}
$nodeMajor=if($nodePath){[int]((& $nodePath -p 'parseInt(process.versions.node)') | Select-Object -Last 1)}else{0}
if($Portable -or $nodeMajor -lt 22){
    $version=(Get-Content -LiteralPath (Join-Path $PSScriptRoot 'node-version.txt') -Raw).Trim()
    $architecture=if($env:PROCESSOR_ARCHITECTURE -eq 'ARM64'){'arm64'}elseif($env:PROCESSOR_ARCHITECTURE -eq 'AMD64' -or $env:PROCESSOR_ARCHITEW6432 -eq 'AMD64'){'x64'}else{throw 'Only 64-bit Windows is supported.'}
    $folder="node-$version-win-$architecture"
    $nodePath=Join-Path $localRoot "$folder\node.exe"
    if(!(Test-Path -LiteralPath $nodePath)){
        [IO.Directory]::CreateDirectory($localRoot) | Out-Null
        $archive=Join-Path $localRoot "$folder.zip"
        [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12
        Write-Host "Downloading portable Node.js $version (no global installation)..."
        Invoke-WebRequest -UseBasicParsing -Uri "https://nodejs.org/dist/$version/$folder.zip" -OutFile $archive
        $sums=(Invoke-WebRequest -UseBasicParsing -Uri "https://nodejs.org/dist/$version/SHASUMS256.txt").Content
        $expected=($sums -split "`n" | Where-Object {$_ -match ("  "+[regex]::Escape("$folder.zip")+"\s*$")} | Select-Object -First 1) -split '\s+'
        if(!$expected[0] -or (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash -ne $expected[0]){throw 'Node.js checksum verification failed; archive was not executed.'}
        Expand-Archive -LiteralPath $archive -DestinationPath $localRoot -Force
        Remove-Item -LiteralPath $archive
    }
}
$env:Path=(Split-Path -Parent $nodePath)+';'+$env:Path
$launchArgs=@((Join-Path $PSScriptRoot 'oneclick.mjs'),'--port',"$Port")
if($SetupOnly){$launchArgs+='--setup'}
if($NoOpen){$launchArgs+='--no-open'}
& $nodePath @launchArgs
if($LASTEXITCODE -ne 0){throw "Workbench exited with code $LASTEXITCODE"}
