$ErrorActionPreference = 'Stop'

./deployarm.ps1
./configstorage.ps1
./buildweb.ps1
./deployweb.ps1