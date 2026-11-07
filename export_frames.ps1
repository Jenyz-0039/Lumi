Add-Type -AssemblyName System.Drawing
$drawingAssembly = [System.Drawing.Bitmap].Assembly.Location
Add-Type -ReferencedAssemblies @($drawingAssembly, (Join-Path (Split-Path $drawingAssembly) 'System.Private.Windows.GdiPlus.dll'), (Join-Path (Split-Path $drawingAssembly) 'System.Private.Windows.Core.dll')) @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class FrameExport {
  public static void Run(string input, string output) {
    using (var source = new Bitmap(input))
    using (var clean = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(clean)) { g.DrawImageUnscaled(source, 0, 0); }
      var rect = new Rectangle(0, 0, clean.Width, clean.Height);
      var data = clean.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int bytes = Math.Abs(data.Stride) * clean.Height;
      var pixels = new byte[bytes];
      Marshal.Copy(data.Scan0, pixels, 0, bytes);
      for (int y = 0; y < clean.Height; y++)
        for (int x = 0; x < clean.Width; x++) {
          int a = y * data.Stride + x * 4 + 3;
          int alpha = pixels[a];
          pixels[a] = alpha < 180 ? (byte)0 : (byte)Math.Min(255, (alpha - 180) * 255 / 73);
        }
      Marshal.Copy(pixels, 0, data.Scan0, bytes);
      clean.UnlockBits(data);
      using (var large = new Bitmap(3840, 2560, PixelFormat.Format32bppArgb)) {
        using (var g = Graphics.FromImage(large)) {
          g.Clear(Color.Transparent);
          g.InterpolationMode = InterpolationMode.HighQualityBicubic;
          g.SmoothingMode = SmoothingMode.HighQuality;
          g.PixelOffsetMode = PixelOffsetMode.HighQuality;
          g.DrawImage(clean, new Rectangle(0, 0, 3840, 2560));
        }
        large.Save(output, ImageFormat.Png);
      }
    }
  }
}
'@
$base = 'C:\Users\46814\.codex\generated_images\01a1a13f-1405-7a93-8ced-9215e3996ed3'
$out = Join-Path $PSScriptRoot 'output\photo_frames'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$files = @{
  '01_goose_yellow.png' = 'exec-60f16f87-2815-42b3-8ca4-286c6e70a55d.png'
  '02_pale_blue.png' = 'exec-bb8bac8f-54cf-484b-9eca-00573fc7d40e.png'
  '03_watermelon_pink.png' = 'exec-e5826370-faba-4c19-819f-2d2c21040efa.png'
  '04_pale_green.png' = 'exec-744c49d3-a1fe-404c-a8c8-c6d7b045defe.png'
  '05_pale_purple.png' = 'exec-37630026-d98b-4e0d-9a68-994f96ba8585.png'
}
foreach ($name in $files.Keys) {
  [FrameExport]::Run((Join-Path $base $files[$name]), (Join-Path $out $name))
  Write-Output (Join-Path $out $name)
}
