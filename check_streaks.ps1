$records = Get-Content -Raw 'public/data/studyRecords.json' | ConvertFrom-Json -AsHashtable
$usersData = Get-Content -Raw 'public/data/users.json' | ConvertFrom-Json
$users = $usersData.data

# Get users in Challenge 2
$challengeTwoIds = @($users | Where-Object { $_.challengeIds -contains 2 } | ForEach-Object { [string]$_.id })

# Count check-ins
$checkins = @{}
$records.Keys | ForEach-Object {
  $date = $_
  $records[$date].PSObject.Properties | ForEach-Object {
    $uid = $_.Name
    if ($uid -in $challengeTwoIds) {
      $checkins[$uid] = ($checkins[$uid] -as [int]) + 1
    }
  }
}

# Filter 95-100 days
$filtered = $checkins.GetEnumerator() |
  Where-Object { $_.Value -ge 95 -and $_.Value -le 100 } |
  Sort-Object { $_.Value } -Descending

if ($filtered.Count -eq 0) {
  Write-Host 'No users with exactly 95-100 check-in days.' -ForegroundColor Yellow
  Write-Host ''
  Write-Host 'Top 15 users by check-in count:' -ForegroundColor Cyan
  
  $checkins.GetEnumerator() |
    Sort-Object { $_.Value } -Descending |
    Select-Object -First 15 |
    ForEach-Object {
      $uid = $_.Key -as [int]
      $user = $users | Where-Object { $_.id -eq $uid } | Select-Object -First 1
      Write-Host "ID $uid : $($user.name) - $($_.Value) days"
    }
} else {
  Write-Host "Found $($filtered.Count) users with 95-100 check-in days:" -ForegroundColor Green
  Write-Host ''
  
  $filtered | ForEach-Object {
    $uid = $_.Key -as [int]
    $user = $users | Where-Object { $_.id -eq $uid } | Select-Object -First 1
    Write-Host "ID $uid : $($user.name) - $($_.Value) days"
  }
}
