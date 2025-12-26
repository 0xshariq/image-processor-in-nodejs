# 🖼️ Multi-threaded Image Processor

A high-performance Node.js image processing tool that leverages worker threads to process images in parallel. Transform, resize, and apply filters to multiple images simultaneously with maximum efficiency.

## ✨ Features

- **Multi-threaded Processing**: Utilizes Node.js worker threads for parallel image processing
- **Worker Pool Management**: Automatically limits concurrent workers based on CPU cores
- **Configurable Transformations**: Customize sizes, quality, and effects through config file
- **Multiple Image Formats**: Supports JPG, PNG, WebP, GIF, BMP, TIFF
- **Built-in Transformations**:
  - Resize (thumbnail, small, medium, large)
  - Grayscale conversion
  - Blur effect
  - Sepia tone
  - Color inversion
  - Image rotation
- **Retry Logic**: Automatically retries failed operations
- **CLI Support**: Command-line arguments for custom input/output directories
- **Progress Tracking**: Real-time progress updates and detailed statistics
- **Error Handling**: Comprehensive error handling with detailed error messages

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/0xshariq/image-processor-in-nodejs.git
cd image-processor-in-nodejs

# Install dependencies
pnpm install
# or
npm install
```

## 🚀 Quick Start

1. **Add images to process:**
   ```bash
   # Place your images in the input-images directory
   mkdir -p input-images
   # Add your images here
   ```

2. **Run the processor:**
   ```bash
   npm run process
   # or
   npm start
   ```

3. **Check the output:**
   - Processed images will be saved in `multi-threaded-output/`
   - Each image will have its own subdirectory with all transformations

## 🎨 Configuration

Edit `config.js` to customize the processing:

```javascript
export const config = {
    directories: {
        input: 'input-images',
        output: 'multi-threaded-output',
    },

    workers: {
        maxWorkers: null, // null = auto (CPU cores)
        timeout: 60000,   // 60 seconds
    },

    imageProcessing: {
        quality: 90, // Output quality (1-100)
        preserveAspectRatio: true,
        fitMode: 'cover', // 'cover', 'contain', 'fill'
        
        transformations: {
            // Resize
            thumbnail: {
                enabled: true,
                width: 150,
                height: 150,
            },
            
            // Filters
            grayscale: {
                enabled: true,
            },
            blur: {
                enabled: true,
                radius: 5, // 1-100
            },
            
            // Adjustments
            brightness: {
                enabled: false,
                value: 0.2, // -1 to 1
            },
            contrast: {
                enabled: false,
                value: 0.3, // -1 to 1
            },
            
            // Effects
            pixelate: {
                enabled: false,
                size: 10,
            },
            colorTone: {
                enabled: false,
                red: 255,
                green: 100,
                blue: 100,
            },
            // ... more transformations
        },
    },

    retry: {
        enabled: true,
        maxRetries: 2,
        delayMs: 1000,
    },

    logging: {
        verbose: true,
        showProgress: true,
        showStats: true,
    },

    performance: {
        memoryOptimization: true,
        clearCache: true,
    },
};
```

### Available Transformations

Enable/disable any transformation in `config.js`:

#### Resize Operations
- **thumbnail**: 150x150px
- **small**: 300x300px
- **medium**: 600x600px
- **large**: 1200x1200px
- **xlarge**: 1920x1920px

#### Filters
- **grayscale**: Black and white conversion
- **blur**: Blur effect (configurable radius 1-100)
- **sepia**: Vintage sepia tone
- **invert**: Color inversion

#### Adjustments
- **brightness**: Adjust brightness (-1 to 1)
- **contrast**: Adjust contrast (-1 to 1)
- **opacity**: Set transparency (0 to 1)
- **fade**: Fade effect (0 to 1)

#### Rotation & Flip
- **rotate**: Rotate by any degree
- **rotate180**: Rotate 180 degrees
- **rotate270**: Rotate 270 degrees
- **flipHorizontal**: Mirror horizontally
- **flipVertical**: Mirror vertically

#### Effects
- **pixelate**: Pixelate effect (configurable size)
- **posterize**: Posterize effect (2-255 levels)
- **normalize**: Auto-adjust levels
- **colorTone**: Apply color tinting (RGB values)

## 💻 CLI Usage

```bash
# Use default settings
npm run process

# Custom input/output directories
npm run process -- --input ./photos --output ./processed

# Specify number of workers
npm run process -- --workers 8

# Combine options
npm run process -- --input ./raw --output ./done --workers 4

# Show help
npm run process -- --help
```

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--input <dir>` | Input directory path | `input-images` |
| `--output <dir>` | Output directory path | `multi-threaded-output` |
| `--workers <num>` | Number of worker threads | CPU cores count |
| `--help, -h` | Show help message | - |

## 📊 Performance

The multi-threaded approach provides significant performance improvements:

- **Sequential Processing**: Processes one image at a time
- **Multi-threaded Processing**: Processes multiple images simultaneously

Example performance with 10 images on a 4-core CPU:
- Sequential: ~34 seconds
- Multi-threaded: ~10 seconds (3.4x faster)

Performance scales with the number of CPU cores available.

## 🏗️ Architecture

```
┌─────────────────┐
│  Main Thread    │
│ multithreading  │
│      .js        │
└────────┬────────┘
         │
         ├─── Worker Pool (CPU cores)
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
┌───▼───┐ ┌──▼───┐ ┌──▼───┐ ┌──▼───┐
│Worker │ │Worker│ │Worker│ │Worker│
│   1   │ │  2   │ │  3   │ │  4   │
└───────┘ └──────┘ └──────┘ └──────┘
```

- **Main Thread**: Manages worker pool and orchestrates processing
- **Worker Threads**: Process individual images with all transformations in parallel
- **Worker Pool**: Limits concurrent workers to prevent resource exhaustion

## 📁 Project Structure

```
image-processor-in-nodejs/
├── config.js              # Configuration file
├── multithreading.js      # Main orchestrator
├── worker.js              # Worker thread logic
├── normal.js              # Deprecated (single-threaded)
├── package.json           # Dependencies and scripts
├── input-images/          # Input directory
│   └── *.jpg/png/webp     # Your images
└── multi-threaded-output/ # Output directory
    └── [image-name]/      # One folder per image
        ├── thumbnail.jpg
        ├── small.jpg
        ├── medium.jpg
        ├── large.jpg
        ├── grayscale.jpg
        └── blur.jpg
```

## 🛠️ Development

### Requirements

- Node.js 18+ (for worker threads support)
- npm or pnpm

### Scripts

```json
{
  "start": "node multithreading.js",
  "process": "node multithreading.js",
  "test": "node multithreading.js"
}
```

## 🔧 Troubleshooting

### Issue: Out of Memory

**Solution**: Reduce the number of workers or process fewer images at once
```bash
npm run process -- --workers 2
```

### Issue: Images not found

**Solution**: Ensure images are in the correct directory
```bash
ls input-images/
```

### Issue: Slow processing

**Solution**: 
- Enable only needed transformations in `config.js`
- Reduce image quality setting
- Check if other processes are consuming CPU

## 📝 Examples

### Basic Processing with Custom Settings

```javascript
// config.js
export const config = {
    imageProcessing: {
        quality: 85,
        transformations: {
            thumbnail: { enabled: true, width: 200, height: 200 },
            large: { enabled: false }, // Disable large size
            grayscale: { enabled: true },
            sepia: { enabled: true }, // Enable sepia
        },
    },
};
```

### Preset: Social Media Optimization

```javascript
// Optimize images for social media platforms
transformations: {
    instagram: { enabled: true, width: 1080, height: 1080 },
    facebook: { enabled: true, width: 1200, height: 630 },
    twitter: { enabled: true, width: 1200, height: 675 },
    thumbnail: { enabled: true, width: 150, height: 150 },
}
```

### Preset: Artistic Effects

```javascript
transformations: {
    grayscale: { enabled: true },
    sepia: { enabled: true },
    pixelate: { enabled: true, size: 15 },
    posterize: { enabled: true, levels: 8 },
    brightness: { enabled: true, value: 0.1 },
}
```

### Preset: E-commerce Product Images

```javascript
transformations: {
    thumbnail: { enabled: true, width: 150, height: 150 },
    small: { enabled: true, width: 300, height: 300 },
    medium: { enabled: true, width: 600, height: 600 },
    large: { enabled: true, width: 1200, height: 1200 },
    xlarge: { enabled: true, width: 1920, height: 1920 },
    normalize: { enabled: true }, // Auto-adjust levels
}
```

### Preset: Thumbnail Gallery

```javascript
transformations: {
    thumbnail: { enabled: true, width: 200, height: 200 },
    grayscale: { enabled: true },
    blur: { enabled: true, radius: 3 },
}
```

### Batch Process Different Folders

```bash
# Process photos folder
npm run process -- --input ./photos --output ./processed-photos

# Process scans folder
npm run process -- --input ./scans --output ./processed-scans
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

ISC

## 👤 Author

**Sharique Chaudhary**

## 🙏 Acknowledgments

- [Jimp](https://github.com/jimp-dev/jimp) - Image processing library
- Node.js Worker Threads - Multi-threading support

---

**Note**: The `normal.js` file has been deprecated in favor of the multi-threaded approach. Use `npm run process` for optimal performance.
