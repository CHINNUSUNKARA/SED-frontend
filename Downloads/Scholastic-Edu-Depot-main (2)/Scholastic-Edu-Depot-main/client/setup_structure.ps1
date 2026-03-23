# Create main directories
$directories = @(
    "src\assets",
    "src\components\common",
    "src\components\layout",
    "src\components\ui",
    "src\config",
    "src\constants",
    "src\features\auth",
    "src\features\courses",
    "src\features\dashboard",
    "src\features\services",
    "src\hooks",
    "src\lib",
    "src\pages",
    "src\routes",
    "src\services",
    "src\store",
    "src\types",
    "src\utils"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "Created directory: $dir"
}

Write-Host "Directory structure created successfully!"
