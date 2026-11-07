param(
  [string]$SourceDir = "public/assets/transitions/stickers/source",
  [string]$OutputDir = "public/assets/transitions/stickers/extracted"
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$sourceFiles = Get-ChildItem -LiteralPath $SourceDir -Filter '*.jpg' | Sort-Object Name
if ($sourceFiles.Count -ne 4) {
  throw "Expected four sticker source sheets in $SourceDir, found $($sourceFiles.Count)."
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# Coordinates are intentionally explicit: each crop contains one complete sticker and
# enough white margin for the edge-connected background pass below.
$stickers = @(
  @{ s=0; n='organza-flower'; x=12; y=14; w=170; h=150 },
  @{ s=0; n='tomato-stack'; x=294; y=12; w=142; h=270; clip=@(14,0,136,254) },
  @{ s=0; n='apple-juice'; x=164; y=142; w=130; h=150 },
  @{ s=0; n='totoro'; x=270; y=272; w=175; h=205 },
  @{ s=0; n='blue-star'; x=4; y=410; w=190; h=190; ellipse=@(95,98,90,86) },
  @{ s=0; n='roll-cake'; x=274; y=430; w=155; h=145; ellipse=@(78,72,72,64) },
  @{ s=0; n='snack-carton'; x=394; y=472; w=140; h=210 },
  @{ s=0; n='watermelon-bowl'; x=505; y=545; w=168; h=155 },
  @{ s=0; n='denim-star'; x=140; y=655; w=230; h=225 },
  @{ s=0; n='smile-cereal'; x=310; y=770; w=170; h=160 },
  @{ s=0; n='pink-phone'; x=463; y=774; w=95; h=165 },
  @{ s=0; n='smile-lemon'; x=12; y=935; w=160; h=155; clip=@(0,25,158,154) },
  @{ s=0; n='alarm-clock'; x=168; y=910; w=178; h=180 },
  @{ s=0; n='green-money'; x=355; y=920; w=220; h=165 },

  @{ s=1; n='crystal-bow-top'; x=20; y=48; w=500; h=500 },
  @{ s=1; n='pearl-orb'; x=345; y=12; w=220; h=230 },
  @{ s=1; n='crystal-bow-lower'; x=16; y=520; w=500; h=460 },
  @{ s=1; n='iridescent-heart'; x=660; y=620; w=270; h=270 },
  @{ s=1; n='cloud-heart'; x=0; y=1100; w=410; h=390 },
  @{ s=1; n='crystal-butterfly'; x=18; y=1450; w=585; h=445; clip=@(0,34,584,444) },
  @{ s=1; n='clear-heart'; x=650; y=1320; w=360; h=300 },

  @{ s=2; n='paper-exclamation'; x=0; y=0; w=380; h=625 },
  @{ s=2; n='paper-red-burst'; x=330; y=0; w=455; h=575 },
  @{ s=2; n='paper-yellow-question'; x=795; y=0; w=280; h=430 },
  @{ s=2; n='paper-purple-burst'; x=650; y=280; w=430; h=510 },
  @{ s=2; n='paper-pink-heart'; x=0; y=520; w=405; h=390 },
  @{ s=2; n='paper-octagon-heart'; x=395; y=555; w=420; h=365 },
  @{ s=2; n='paper-yellow-burst'; x=0; y=915; w=440; h=450 },
  @{ s=2; n='paper-pink-burst'; x=415; y=925; w=430; h=505 },
  @{ s=2; n='paper-blue-question'; x=775; y=770; w=305; h=530 },
  @{ s=2; n='paper-yellow-heart'; x=10; y=1470; w=395; h=410 },
  @{ s=2; n='paper-bear'; x=470; y=1450; w=450; h=455 },

  @{ s=3; n='paper-wiggle'; x=18; y=92; w=225; h=175 },
  @{ s=3; n='paper-heart-small'; x=255; y=85; w=190; h=180 },
  @{ s=3; n='paper-speech'; x=475; y=76; w=185; h=205 },
  @{ s=3; n='paper-bear-small'; x=14; y=275; w=230; h=220 },
  @{ s=3; n='paper-red-burst-small'; x=235; y=245; w=205; h=215; clip=@(0,28,204,214) },
  @{ s=3; n='paper-purple-burst-small'; x=435; y=250; w=225; h=245 },
  @{ s=3; n='paper-teal-burst'; x=8; y=480; w=220; h=230 },
  @{ s=3; n='paper-octagon-small'; x=220; y=490; w=240; h=225 },
  @{ s=3; n='paper-teal-heart'; x=450; y=485; w=220; h=245; clip=@(0,42,219,244) },
  @{ s=3; n='paper-question-small'; x=12; y=730; w=180; h=255 },
  @{ s=3; n='paper-yellow-burst-small'; x=180; y=700; w=235; h=275 },
  @{ s=3; n='paper-exclamation-small'; x=395; y=720; w=120; h=255 },
  @{ s=3; n='paper-pink-question'; x=505; y=710; w=160; h=270 }
)

function Export-Sticker {
  param(
    [System.Drawing.Bitmap]$Source,
    [hashtable]$Spec,
    [string]$Destination
  )

  $bounds = [System.Drawing.Rectangle]::new($Spec.x, $Spec.y, $Spec.w, $Spec.h)
  $crop = New-Object System.Drawing.Bitmap($Spec.w, $Spec.h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($crop)
  $graphics.DrawImage($Source, [System.Drawing.Rectangle]::new(0, 0, $Spec.w, $Spec.h), $bounds, [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.Dispose()

  $rect = [System.Drawing.Rectangle]::new(0, 0, $crop.Width, $crop.Height)
  $data = $crop.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $bytes = New-Object byte[] ($data.Stride * $crop.Height)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

  $count = $crop.Width * $crop.Height
  $background = New-Object bool[] $count
  $queued = New-Object bool[] $count
  $queue = [System.Collections.Generic.Queue[int]]::new()

  function Test-White([int]$x, [int]$y) {
    $offset = $y * $data.Stride + $x * 4
    $b = [int]$bytes[$offset]
    $g = [int]$bytes[$offset + 1]
    $r = [int]$bytes[$offset + 2]
    $min = [Math]::Min($r, [Math]::Min($g, $b))
    $max = [Math]::Max($r, [Math]::Max($g, $b))
    return ($min -ge 242 -and ($max - $min) -le 18)
  }

  for ($x = 0; $x -lt $crop.Width; $x++) {
    foreach ($y in @(0, ($crop.Height - 1))) {
      $index = $y * $crop.Width + $x
      if (-not $queued[$index] -and (Test-White $x $y)) { $queued[$index] = $true; $queue.Enqueue($index) }
    }
  }
  for ($y = 0; $y -lt $crop.Height; $y++) {
    foreach ($x in @(0, ($crop.Width - 1))) {
      $index = $y * $crop.Width + $x
      if (-not $queued[$index] -and (Test-White $x $y)) { $queued[$index] = $true; $queue.Enqueue($index) }
    }
  }

  while ($queue.Count -gt 0) {
    $index = $queue.Dequeue()
    $background[$index] = $true
    $x = $index % $crop.Width
    $y = [Math]::Floor($index / $crop.Width)
    foreach ($neighbor in @(@(($x - 1), $y), @(($x + 1), $y), @($x, ($y - 1)), @($x, ($y + 1)))) {
      $nx = $neighbor[0]; $ny = $neighbor[1]
      if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $crop.Width -or $ny -ge $crop.Height) { continue }
      $next = $ny * $crop.Width + $nx
      if (-not $queued[$next] -and (Test-White $nx $ny)) { $queued[$next] = $true; $queue.Enqueue($next) }
    }
  }

  for ($y = 0; $y -lt $crop.Height; $y++) {
    for ($x = 0; $x -lt $crop.Width; $x++) {
      $index = $y * $crop.Width + $x
      $offset = $y * $data.Stride + $x * 4
      if ($background[$index]) {
        $bytes[$offset + 3] = 0
        continue
      }

      $touchesBackground = $false
      foreach ($neighbor in @(@(($x - 1), $y), @(($x + 1), $y), @($x, ($y - 1)), @($x, ($y + 1)))) {
        $nx = $neighbor[0]; $ny = $neighbor[1]
        if ($nx -ge 0 -and $ny -ge 0 -and $nx -lt $crop.Width -and $ny -lt $crop.Height -and $background[$ny * $crop.Width + $nx]) {
          $touchesBackground = $true
          break
        }
      }
      if ($touchesBackground) {
        $b = [int]$bytes[$offset]; $g = [int]$bytes[$offset + 1]; $r = [int]$bytes[$offset + 2]
        $distance = [Math]::Sqrt(([Math]::Pow(255 - $r, 2) + [Math]::Pow(255 - $g, 2) + [Math]::Pow(255 - $b, 2)))
        $bytes[$offset + 3] = [byte][Math]::Min(255, [Math]::Max(36, [Math]::Round($distance / 46 * 255)))
      } else {
        $bytes[$offset + 3] = 255
      }
    }
  }

  # The hand-picked crop can still overlap a neighbouring sticker. Keep the
  # target's largest opaque island so every exported PNG is a standalone asset.
  $opaqueSeen = New-Object bool[] $count
  $largestIsland = @()
  for ($y = 0; $y -lt $crop.Height; $y++) {
    for ($x = 0; $x -lt $crop.Width; $x++) {
      $index = $y * $crop.Width + $x
      $offset = $y * $data.Stride + $x * 4
      if ($opaqueSeen[$index] -or $bytes[$offset + 3] -eq 0) { continue }

      $island = [System.Collections.Generic.List[int]]::new()
      $islandQueue = [System.Collections.Generic.Queue[int]]::new()
      $opaqueSeen[$index] = $true
      $islandQueue.Enqueue($index)
      while ($islandQueue.Count -gt 0) {
        $current = $islandQueue.Dequeue()
        $island.Add($current)
        $cx = $current % $crop.Width
        $cy = [Math]::Floor($current / $crop.Width)
        foreach ($neighbor in @(@(($cx - 1), $cy), @(($cx + 1), $cy), @($cx, ($cy - 1)), @($cx, ($cy + 1)))) {
          $nx = $neighbor[0]; $ny = $neighbor[1]
          if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $crop.Width -or $ny -ge $crop.Height) { continue }
          $next = $ny * $crop.Width + $nx
          if ($opaqueSeen[$next]) { continue }
          $nextOffset = $ny * $data.Stride + $nx * 4
          if ($bytes[$nextOffset + 3] -gt 0) {
            $opaqueSeen[$next] = $true
            $islandQueue.Enqueue($next)
          }
        }
      }
      if ($island.Count -gt $largestIsland.Count) { $largestIsland = $island }
    }
  }

  $keep = New-Object bool[] $count
  foreach ($index in $largestIsland) { $keep[$index] = $true }
  for ($y = 0; $y -lt $crop.Height; $y++) {
    for ($x = 0; $x -lt $crop.Width; $x++) {
      $index = $y * $crop.Width + $x
      $insideMask = $true
      if ($Spec.ContainsKey('clip')) {
        $insideMask = $x -ge $Spec.clip[0] -and $y -ge $Spec.clip[1] -and $x -le $Spec.clip[2] -and $y -le $Spec.clip[3]
      }
      if ($insideMask -and $Spec.ContainsKey('ellipse')) {
        $dx = ($x - $Spec.ellipse[0]) / $Spec.ellipse[2]
        $dy = ($y - $Spec.ellipse[1]) / $Spec.ellipse[3]
        $insideMask = (($dx * $dx) + ($dy * $dy)) -le 1
      }
      if (-not $keep[$index] -or -not $insideMask) { $bytes[$y * $data.Stride + $x * 4 + 3] = 0 }
    }
  }

  [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
  $crop.UnlockBits($data)
  $crop.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
  $crop.Dispose()
}

$openedSources = @{}
try {
  foreach ($sticker in $stickers) {
    if (-not $openedSources.ContainsKey($sticker.s)) {
      $openedSources[$sticker.s] = [System.Drawing.Bitmap]::new($sourceFiles[$sticker.s].FullName)
    }
    $destination = Join-Path $OutputDir ($sticker.n + '.png')
    Export-Sticker -Source $openedSources[$sticker.s] -Spec $sticker -Destination $destination
    Write-Output $destination
  }
} finally {
  foreach ($bitmap in $openedSources.Values) { $bitmap.Dispose() }
}
