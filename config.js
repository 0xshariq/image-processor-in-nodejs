/**
 * Configuration file for image processor
 * Customize image sizes, quality, and transformations
 */

export const config = {
    // Input/Output directories
    directories: {
        input: 'input-images',
        output: 'multi-threaded-output',
    },

    // Worker pool settings
    workers: {
        // Set to 0 or null to use CPU core count automatically
        maxWorkers: null,
        // Timeout for each worker in milliseconds
        timeout: 60000,
    },

    // Image processing settings
    imageProcessing: {
        // Supported image formats
        supportedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'],
        
        // Output format and quality
        outputFormat: 'jpg',
        quality: 90,

        // Preserve aspect ratio for resize operations
        preserveAspectRatio: true,

        // Fit mode: 'cover', 'contain', 'fill'
        fitMode: 'cover',

        // Transformations to apply
        transformations: {
            // Resize transformations
            thumbnail: {
                enabled: true,
                width: 150,
                height: 150,
                filename: 'thumbnail.jpg',
            },
            small: {
                enabled: true,
                width: 300,
                height: 300,
                filename: 'small.jpg',
            },
            medium: {
                enabled: true,
                width: 600,
                height: 600,
                filename: 'medium.jpg',
            },
            large: {
                enabled: true,
                width: 1200,
                height: 1200,
                filename: 'large.jpg',
            },
            xlarge: {
                enabled: true,
                width: 1920,
                height: 1920,
                filename: 'xlarge.jpg',
            },

            // Filter transformations
            grayscale: {
                enabled: true,
                filename: 'grayscale.jpg',
            },
            blur: {
                enabled: true,
                radius: 5, // 1-100
                filename: 'blur.jpg',
            },
            sepia: {
                enabled: true,
                filename: 'sepia.jpg',
            },
            invert: {
                enabled: true,
                filename: 'invert.jpg',
            },

            // Adjustment transformations
            brightness: {
                enabled: true,
                value: 0.2, // -1 to 1 (0 = no change)
                filename: 'brightness.jpg',
            },
            contrast: {
                enabled: true,
                value: 0.3, // -1 to 1 (0 = no change)
                filename: 'contrast.jpg',
            },
            opacity: {
                enabled: true,
                value: 0.8, // 0 to 1
                filename: 'opacity.png',
            },
            fade: {
                enabled: true,
                value: 0.5, // 0 to 1
                filename: 'fade.jpg',
            },

            // Rotation and flip
            rotate: {
                enabled: true,
                degrees: 90, // Any degree value
                filename: 'rotated.jpg',
            },
            rotate180: {
                enabled: true,
                filename: 'rotate180.jpg',
            },
            rotate270: {
                enabled: true,
                filename: 'rotate270.jpg',
            },
            flipHorizontal: {
                enabled: true,
                filename: 'flip-h.jpg',
            },
            flipVertical: {
                enabled: true,
                filename: 'flip-v.jpg',
            },

            // Effects
            pixelate: {
                enabled: true,
                size: 10, // Pixel size
                filename: 'pixelate.jpg',
            },
            posterize: {
                enabled: true,
                levels: 5, // Number of color levels (2-255)
                filename: 'posterize.jpg',
            },
            normalize: {
                enabled: true,
                filename: 'normalize.jpg',
            },

            // Color adjustments
            colorTone: {
                enabled: true,
                red: 255,
                green: 100,
                blue: 100,
                filename: 'color-tone.jpg',
            },
        },
    },

    // Retry settings
    retry: {
        enabled: true,
        maxRetries: 2,
        delayMs: 1000,
    },

    // Logging settings
    logging: {
        verbose: true,
        showProgress: true,
        showStats: true,
        showErrors: true,
        showWarnings: true,
    },

    // Performance settings
    performance: {
        // Enable memory optimization
        memoryOptimization: true,
        // Clear image cache after processing
        clearCache: true,
    },
};

export default config;
