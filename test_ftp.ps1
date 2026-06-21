$ftpServer = "ftp://ftpupload.net/htdocs/"
$username = "if0_42232337"
$password = "RECTOiTPEsF5Z33"

try {
    $request = [System.Net.WebRequest]::Create($ftpServer)
    $request.Credentials = New-Object System.Net.NetworkCredential($username, $password)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
    $response = $request.GetResponse()
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    $files = $reader.ReadToEnd()
    $reader.Close()
    $response.Close()
    Write-Host "FTP Connection Successful! Files in htdocs:"
    Write-Host $files
} catch {
    Write-Host "FTP Connection Failed: $($_.Exception.Message)"
}
