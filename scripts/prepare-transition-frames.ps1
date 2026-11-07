$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$jobs = @(
  @{ Input='public/assets/transitions/transition-one/frame-camera.png'; Output='public/assets/transitions/transition-one/frame-camera-clean.png' },
  @{ Input='public/assets/transitions/transition-two/frame-television.png'; Output='public/assets/transitions/transition-two/frame-television-clean.png' }
)

foreach ($job in $jobs) {
  $source = [System.Drawing.Bitmap]::new($job.Input)
  try {
    $width = $source.Width
    $height = $source.Height
    $seen = New-Object bool[] ($width * $height)
    $largest = $null

    for ($y = 0; $y -lt $height; $y++) {
      for ($x = 0; $x -lt $width; $x++) {
        $start = $y * $width + $x
        if ($seen[$start]) { continue }
        $seen[$start] = $true
        if ($source.GetPixel($x, $y).A -le 12) { continue }

        $queue = [System.Collections.Generic.Queue[int]]::new()
        $queue.Enqueue($start)
        $count = 0
        $minX = $x; $maxX = $x; $minY = $y; $maxY = $y
        while ($queue.Count -gt 0) {
          $index = $queue.Dequeue()
          $cx = $index % $width
          $cy = [Math]::Floor($index / $width)
          $count++
          $minX = [Math]::Min($minX, $cx); $maxX = [Math]::Max($maxX, $cx)
          $minY = [Math]::Min($minY, $cy); $maxY = [Math]::Max($maxY, $cy)
          foreach ($neighbor in @(@(($cx - 1), $cy), @(($cx + 1), $cy), @($cx, ($cy - 1)), @($cx, ($cy + 1)))) {
            $nx = $neighbor[0]; $ny = $neighbor[1]
            if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $width -or $ny -ge $height) { continue }
            $next = $ny * $width + $nx
            if ($seen[$next]) { continue }
            $seen[$next] = $true
            if ($source.GetPixel($nx, $ny).A -gt 12) { $queue.Enqueue($next) }
          }
        }

        if ($null -eq $largest -or $count -gt $largest.Count) {
          $largest = @{ Count=$count; MinX=$minX; MaxX=$maxX; MinY=$minY; MaxY=$maxY }
        }
      }
    }

    $pad = 8
    $left = [Math]::Max(0, $largest.MinX - $pad)
    $top = [Math]::Max(0, $largest.MinY - $pad)
    $right = [Math]::Min($width - 1, $largest.MaxX + $pad)
    $bottom = [Math]::Min($height - 1, $largest.MaxY + $pad)
    $cropRect = [System.Drawing.Rectangle]::new($left, $top, $right - $left + 1, $bottom - $top + 1)
    $clean = $source.Clone($cropRect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $clean.Save($job.Output, [System.Drawing.Imaging.ImageFormat]::Png)
      Write-Output ("{0}: {1}x{2}, crop {3},{4},{5},{6}" -f $job.Output, $clean.Width, $clean.Height, $left, $top, $cropRect.Width, $cropRect.Height)
    } finally {
      $clean.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}
