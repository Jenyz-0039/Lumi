param(
  [string]$SourceDirectory = 'D:\桌面\coding素材\模块11素材',
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\public\assets\game')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$imageTools = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public static class LumiGameAssetTools
{
    private static bool IsBackdrop(Color color)
    {
        int max = Math.Max(color.R, Math.Max(color.G, color.B));
        int min = Math.Min(color.R, Math.Min(color.G, color.B));
        return color.A > 0 && min >= 238 && max - min <= 18;
    }

    private static bool IsArtworkBarrier(Color color)
    {
        int max = Math.Max(color.R, Math.Max(color.G, color.B));
        int min = Math.Min(color.R, Math.Min(color.G, color.B));
        return color.A > 0 && (min < 215 || max - min > 28);
    }

    public static Bitmap Crop(Bitmap source, Rectangle area)
    {
        var result = new Bitmap(area.Width, area.Height, PixelFormat.Format32bppArgb);
        using (var graphics = Graphics.FromImage(result))
        {
            graphics.CompositingMode = CompositingMode.SourceCopy;
            graphics.DrawImage(source, new Rectangle(0, 0, area.Width, area.Height), area, GraphicsUnit.Pixel);
        }
        return result;
    }

    public static void RemoveConnectedBackdrop(Bitmap bitmap, Point[] extraSeeds)
    {
        int width = bitmap.Width;
        int height = bitmap.Height;
        var visited = new bool[width * height];
        var queue = new int[width * height];
        int head = 0, tail = 0;

        for (int x = 0; x < width; x++) { TryEnqueue(bitmap, visited, queue, ref tail, x, 0); TryEnqueue(bitmap, visited, queue, ref tail, x, height - 1); }
        for (int y = 0; y < height; y++) { TryEnqueue(bitmap, visited, queue, ref tail, 0, y); TryEnqueue(bitmap, visited, queue, ref tail, width - 1, y); }
        if (extraSeeds != null) foreach (var seed in extraSeeds) TryEnqueue(bitmap, visited, queue, ref tail, seed.X, seed.Y);

        while (head < tail)
        {
            int index = queue[head++];
            int x = index % width;
            int y = index / width;
            TryEnqueue(bitmap, visited, queue, ref tail, x - 1, y);
            TryEnqueue(bitmap, visited, queue, ref tail, x + 1, y);
            TryEnqueue(bitmap, visited, queue, ref tail, x, y - 1);
            TryEnqueue(bitmap, visited, queue, ref tail, x, y + 1);
        }

        for (int y = 0; y < height; y++)
        for (int x = 0; x < width; x++)
        {
            if (!visited[y * width + x]) continue;
            var color = bitmap.GetPixel(x, y);
            bitmap.SetPixel(x, y, Color.FromArgb(0, color.R, color.G, color.B));
        }
    }

    private static void TryEnqueue(Bitmap bitmap, bool[] visited, int[] queue, ref int tail, int x, int y)
    {
        if (x < 0 || y < 0 || x >= bitmap.Width || y >= bitmap.Height) return;
        int index = y * bitmap.Width + x;
        if (visited[index] || !IsBackdrop(bitmap.GetPixel(x, y))) return;
        visited[index] = true;
        queue[tail++] = index;
    }


    public static void RemoveOutsideOfArtwork(Bitmap bitmap)
    {
        int width = bitmap.Width;
        int height = bitmap.Height;
        var exterior = new bool[width * height];
        var queue = new int[width * height];
        int head = 0, tail = 0;
        for (int x = 0; x < width; x++) { TryEnqueueExterior(bitmap, exterior, queue, ref tail, x, 0); TryEnqueueExterior(bitmap, exterior, queue, ref tail, x, height - 1); }
        for (int y = 0; y < height; y++) { TryEnqueueExterior(bitmap, exterior, queue, ref tail, 0, y); TryEnqueueExterior(bitmap, exterior, queue, ref tail, width - 1, y); }
        while (head < tail)
        {
            int index = queue[head++];
            int x = index % width;
            int y = index / width;
            TryEnqueueExterior(bitmap, exterior, queue, ref tail, x - 1, y);
            TryEnqueueExterior(bitmap, exterior, queue, ref tail, x + 1, y);
            TryEnqueueExterior(bitmap, exterior, queue, ref tail, x, y - 1);
            TryEnqueueExterior(bitmap, exterior, queue, ref tail, x, y + 1);
        }
        for (int y = 0; y < height; y++)
        for (int x = 0; x < width; x++)
        {
            if (!exterior[y * width + x]) continue;
            var color = bitmap.GetPixel(x, y);
            bitmap.SetPixel(x, y, Color.FromArgb(0, color.R, color.G, color.B));
        }
    }

    private static void TryEnqueueExterior(Bitmap bitmap, bool[] exterior, int[] queue, ref int tail, int x, int y)
    {
        if (x < 0 || y < 0 || x >= bitmap.Width || y >= bitmap.Height) return;
        int index = y * bitmap.Width + x;
        if (exterior[index] || IsArtworkBarrier(bitmap.GetPixel(x, y))) return;
        exterior[index] = true;
        queue[tail++] = index;
    }

    public static void ExtractLightCharacterFromBlack(Bitmap bitmap, int outlineRadius)
    {
        int width = bitmap.Width;
        int height = bitmap.Height;
        int total = width * height;
        var component = new bool[total];
        var queue = new int[total];
        int seed = -1;
        for (int radius = 0; radius < Math.Min(width, height) / 3 && seed < 0; radius++)
        {
            int left = Math.Max(0, width / 2 - radius);
            int right = Math.Min(width - 1, width / 2 + radius);
            int top = Math.Max(0, height / 2 - radius);
            int bottom = Math.Min(height - 1, height / 2 + radius);
            for (int x = left; x <= right && seed < 0; x++)
            {
                if (IsLight(bitmap.GetPixel(x, top))) seed = top * width + x;
                else if (IsLight(bitmap.GetPixel(x, bottom))) seed = bottom * width + x;
            }
            for (int y = top; y <= bottom && seed < 0; y++)
            {
                if (IsLight(bitmap.GetPixel(left, y))) seed = y * width + left;
                else if (IsLight(bitmap.GetPixel(right, y))) seed = y * width + right;
            }
        }
        if (seed < 0) return;

        int head = 0, tail = 0;
        component[seed] = true;
        queue[tail++] = seed;
        while (head < tail)
        {
            int index = queue[head++];
            int x = index % width;
            int y = index / width;
            TryEnqueueLight(bitmap, component, queue, ref tail, x - 1, y);
            TryEnqueueLight(bitmap, component, queue, ref tail, x + 1, y);
            TryEnqueueLight(bitmap, component, queue, ref tail, x, y - 1);
            TryEnqueueLight(bitmap, component, queue, ref tail, x, y + 1);
        }

        var distance = new short[total];
        for (int i = 0; i < total; i++) distance[i] = -1;
        head = 0; tail = 0;
        for (int i = 0; i < total; i++)
        {
            if (!component[i]) continue;
            distance[i] = 0;
            queue[tail++] = i;
        }
        while (head < tail)
        {
            int index = queue[head++];
            int nextDistance = distance[index] + 1;
            if (nextDistance > outlineRadius) continue;
            int x = index % width;
            int y = index / width;
            TrySpreadDistance(distance, queue, ref tail, width, height, x - 1, y, (short)nextDistance);
            TrySpreadDistance(distance, queue, ref tail, width, height, x + 1, y, (short)nextDistance);
            TrySpreadDistance(distance, queue, ref tail, width, height, x, y - 1, (short)nextDistance);
            TrySpreadDistance(distance, queue, ref tail, width, height, x, y + 1, (short)nextDistance);
        }

        var exterior = new bool[total];
        head = 0; tail = 0;
        for (int x = 0; x < width; x++) { TryEnqueueMaskExterior(distance, exterior, queue, ref tail, width, height, x, 0); TryEnqueueMaskExterior(distance, exterior, queue, ref tail, width, height, x, height - 1); }
        for (int y = 0; y < height; y++) { TryEnqueueMaskExterior(distance, exterior, queue, ref tail, width, height, 0, y); TryEnqueueMaskExterior(distance, exterior, queue, ref tail, width, height, width - 1, y); }
        while (head < tail)
        {
            int index = queue[head++];
            int x = index % width;
            int y = index / width;
            TryEnqueueMaskExterior(distance, exterior, queue, ref tail, width, height, x - 1, y);
            TryEnqueueMaskExterior(distance, exterior, queue, ref tail, width, height, x + 1, y);
            TryEnqueueMaskExterior(distance, exterior, queue, ref tail, width, height, x, y - 1);
            TryEnqueueMaskExterior(distance, exterior, queue, ref tail, width, height, x, y + 1);
        }

        for (int y = 0; y < height; y++)
        for (int x = 0; x < width; x++)
        {
            var color = bitmap.GetPixel(x, y);
            int alpha = exterior[y * width + x] ? 0 : 255;
            bitmap.SetPixel(x, y, Color.FromArgb(alpha, color.R, color.G, color.B));
        }
    }

    private static bool IsLight(Color color) { return Math.Max(color.R, Math.Max(color.G, color.B)) > 28; }

    private static void TryEnqueueLight(Bitmap bitmap, bool[] component, int[] queue, ref int tail, int x, int y)
    {
        if (x < 0 || y < 0 || x >= bitmap.Width || y >= bitmap.Height) return;
        int index = y * bitmap.Width + x;
        if (component[index] || !IsLight(bitmap.GetPixel(x, y))) return;
        component[index] = true;
        queue[tail++] = index;
    }

    private static void TrySpreadDistance(short[] distance, int[] queue, ref int tail, int width, int height, int x, int y, short value)
    {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        int index = y * width + x;
        if (distance[index] >= 0) return;
        distance[index] = value;
        queue[tail++] = index;
    }

    private static void TryEnqueueMaskExterior(short[] distance, bool[] exterior, int[] queue, ref int tail, int width, int height, int x, int y)
    {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        int index = y * width + x;
        if (exterior[index] || distance[index] >= 0) return;
        exterior[index] = true;
        queue[tail++] = index;
    }

    private static Rectangle VisibleBounds(Bitmap bitmap)
    {
        int left = bitmap.Width, top = bitmap.Height, right = -1, bottom = -1;
        for (int y = 0; y < bitmap.Height; y++)
        for (int x = 0; x < bitmap.Width; x++)
        {
            if (bitmap.GetPixel(x, y).A < 8) continue;
            left = Math.Min(left, x); top = Math.Min(top, y);
            right = Math.Max(right, x); bottom = Math.Max(bottom, y);
        }
        return right < left ? Rectangle.Empty : Rectangle.FromLTRB(left, top, right + 1, bottom + 1);
    }

    public static Bitmap Normalize(Bitmap source, int canvasSize, int contentSize)
    {
        var bounds = VisibleBounds(source);
        var result = new Bitmap(canvasSize, canvasSize, PixelFormat.Format32bppArgb);
        if (bounds.IsEmpty) return result;
        double scale = Math.Min((double)contentSize / bounds.Width, (double)contentSize / bounds.Height);
        int width = Math.Max(1, (int)Math.Round(bounds.Width * scale));
        int height = Math.Max(1, (int)Math.Round(bounds.Height * scale));
        int x = (canvasSize - width) / 2;
        int y = (canvasSize - height) / 2;
        using (var graphics = Graphics.FromImage(result))
        {
            graphics.Clear(Color.Transparent);
            graphics.CompositingMode = CompositingMode.SourceCopy;
            graphics.CompositingQuality = CompositingQuality.HighQuality;
            graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
            graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
            graphics.SmoothingMode = SmoothingMode.HighQuality;
            graphics.DrawImage(source, new Rectangle(x, y, width, height), bounds, GraphicsUnit.Pixel);
        }
        return result;
    }
}
'@

$drawingAssemblies = @(
  [System.Drawing.Bitmap].Assembly.Location,
  [System.Drawing.Color].Assembly.Location,
  [object].Assembly.Location,
  (Join-Path $PSHOME 'System.Runtime.dll'),
  (Join-Path $PSHOME 'System.Collections.dll'),
  (Join-Path ([System.IO.Path]::GetDirectoryName([System.Drawing.Bitmap].Assembly.Location)) 'System.Private.Windows.GdiPlus.dll'),
  (Join-Path ([System.IO.Path]::GetDirectoryName([System.Drawing.Bitmap].Assembly.Location)) 'System.Private.Windows.Core.dll')
)
Add-Type -TypeDefinition $imageTools -ReferencedAssemblies $drawingAssemblies
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$expressions = [ordered]@{
  '常规表情.png' = 'lumi-default.png'
  '被摸头表情.png' = 'lumi-patted.png'
}

foreach ($entry in $expressions.GetEnumerator()) {
  Copy-Item -LiteralPath (Join-Path $SourceDirectory $entry.Key) -Destination (Join-Path $OutputDirectory $entry.Value) -Force
}

$blackBackdropExpressions = [ordered]@{
  '即将吃到食物的表情.png' = 'lumi-ready.png'
  '吃食物的时候的表情.png' = 'lumi-chewing.png'
}
foreach ($entry in $blackBackdropExpressions.GetEnumerator()) {
  $original = [System.Drawing.Bitmap]::new((Join-Path $SourceDirectory $entry.Key))
  $processed = [LumiGameAssetTools]::Crop($original, [System.Drawing.Rectangle]::new(0, 0, $original.Width, $original.Height))
  $original.Dispose()
  [LumiGameAssetTools]::ExtractLightCharacterFromBlack($processed, 5)
  $processed.Save((Join-Path $OutputDirectory $entry.Value), [System.Drawing.Imaging.ImageFormat]::Png)
  $processed.Dispose()
}

$foodSource = [System.Drawing.Bitmap]::new((Join-Path $SourceDirectory '食物素材.png'))
$foodRegions = @(
  @{ Name = 'food-donut.png'; Rect = [System.Drawing.Rectangle]::new(48, 62, 462, 424); Seeds = @([System.Drawing.Point]::new(244, 205)) },
  @{ Name = 'food-burger.png'; Rect = [System.Drawing.Rectangle]::new(536, 66, 438, 426); Seeds = @() },
  @{ Name = 'food-bubble-tea.png'; Rect = [System.Drawing.Rectangle]::new(1024, 18, 392, 480); Seeds = @() },
  @{ Name = 'food-cookie.png'; Rect = [System.Drawing.Rectangle]::new(54, 534, 452, 414); Seeds = @() },
  @{ Name = 'food-chocolate.png'; Rect = [System.Drawing.Rectangle]::new(532, 522, 456, 438); Seeds = @() },
  @{ Name = 'food-tart.png'; Rect = [System.Drawing.Rectangle]::new(1031, 554, 441, 380); Seeds = @() }
)

foreach ($food in $foodRegions) {
  $crop = [LumiGameAssetTools]::Crop($foodSource, $food.Rect)
  [LumiGameAssetTools]::RemoveConnectedBackdrop($crop, [System.Drawing.Point[]]$food.Seeds)
  $normalized = [LumiGameAssetTools]::Normalize($crop, 512, 448)
  $normalized.Save((Join-Path $OutputDirectory $food.Name), [System.Drawing.Imaging.ImageFormat]::Png)
  $normalized.Dispose()
  $crop.Dispose()
}
$foodSource.Dispose()

$handOriginal = [System.Drawing.Bitmap]::new((Join-Path $SourceDirectory '可爱卡通摸头手势.png'))
$handSource = [LumiGameAssetTools]::Crop($handOriginal, [System.Drawing.Rectangle]::new(0, 0, $handOriginal.Width, $handOriginal.Height))
$handOriginal.Dispose()
[LumiGameAssetTools]::RemoveOutsideOfArtwork($handSource)
$hand = [LumiGameAssetTools]::Normalize($handSource, 512, 472)
$hand.Save((Join-Path $OutputDirectory 'pat-hand.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$hand.Dispose()
$handSource.Dispose()

Write-Output "Prepared module ten assets in $OutputDirectory"
