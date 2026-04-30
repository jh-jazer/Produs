Add-Type -AssemblyName System.Drawing
$imgD = [System.Drawing.Image]::FromFile('c:\Users\PC\OneDrive\Desktop\Produs\client\public\desktopmock.png')
Write-Host "Desktop: $($imgD.Width) x $($imgD.Height)"
$imgD.Dispose()
$imgM = [System.Drawing.Image]::FromFile('c:\Users\PC\OneDrive\Desktop\Produs\client\public\mobilemock.png')
Write-Host "Mobile: $($imgM.Width) x $($imgM.Height)"
$imgM.Dispose()
