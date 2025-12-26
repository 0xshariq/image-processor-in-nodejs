import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Jimp } from 'jimp';
import { parentPort, workerData } from 'node:worker_threads';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Process a single image with multiple transformations
 * @returns {Promise<void>}
 */
async function processImage() {
    const startTime = Date.now();

    try {
        const { imagePath, filename, outputDir, transformations, quality } = workerData;

        if (!imagePath || !filename || !outputDir) {
            throw new Error('Missing required workerData: imagePath, filename, and outputDir');
        }

        // Create output directory
        const outputSubDirPath = path.join(outputDir, filename.split('.')[0]);
        await mkdir(outputSubDirPath, { recursive: true });

        // Load image
        const image = await Jimp.read(imagePath);
        const originalWidth = image.bitmap.width;
        const originalHeight = image.bitmap.height;

        // Build tasks from configuration
        const tasks = [];

        // Resize operations
        ['thumbnail', 'small', 'medium', 'large'].forEach(size => {
            if (transformations[size]?.enabled) {
                const config = transformations[size];
                tasks.push({
                    name: size,
                    operation: async () => {
                        const cloned = image.clone();
                        cloned.resize({ w: config.width, h: config.height });
                        await cloned.write(path.join(outputSubDirPath, config.filename), quality ? { quality } : {});
                    },
                });
            }
        });

        // Grayscale
        if (transformations.grayscale?.enabled) {
            tasks.push({
                name: 'grayscale',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.greyscale();
                    await cloned.write(path.join(outputSubDirPath, transformations.grayscale.filename), quality ? { quality } : {});
                },
            });
        }

        // Blur
        if (transformations.blur?.enabled) {
            tasks.push({
                name: 'blur',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.blur(transformations.blur.radius || 5);
                    await cloned.write(path.join(outputSubDirPath, transformations.blur.filename), quality ? { quality } : {});
                },
            });
        }

        // Sepia
        if (transformations.sepia?.enabled) {
            tasks.push({
                name: 'sepia',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.sepia();
                    await cloned.write(path.join(outputSubDirPath, transformations.sepia.filename), quality ? { quality } : {});
                },
            });
        }

        // Invert
        if (transformations.invert?.enabled) {
            tasks.push({
                name: 'invert',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.invert();
                    await cloned.write(path.join(outputSubDirPath, transformations.invert.filename), quality ? { quality } : {});
                },
            });
        }

        // Rotate
        if (transformations.rotate?.enabled) {
            tasks.push({
                name: 'rotate',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.rotate(transformations.rotate.degrees || 90);
                    await cloned.write(path.join(outputSubDirPath, transformations.rotate.filename), quality ? { quality } : {});
                },
            });
        }

        // Rotate 180
        if (transformations.rotate180?.enabled) {
            tasks.push({
                name: 'rotate180',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.rotate(180);
                    await cloned.write(path.join(outputSubDirPath, transformations.rotate180.filename), quality ? { quality } : {});
                },
            });
        }

        // Rotate 270
        if (transformations.rotate270?.enabled) {
            tasks.push({
                name: 'rotate270',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.rotate(270);
                    await cloned.write(path.join(outputSubDirPath, transformations.rotate270.filename), quality ? { quality } : {});
                },
            });
        }

        // Flip Horizontal
        if (transformations.flipHorizontal?.enabled) {
            tasks.push({
                name: 'flipHorizontal',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.flip({ horizontal: true, vertical: false });
                    await cloned.write(path.join(outputSubDirPath, transformations.flipHorizontal.filename), quality ? { quality } : {});
                },
            });
        }

        // Flip Vertical
        if (transformations.flipVertical?.enabled) {
            tasks.push({
                name: 'flipVertical',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.flip({ horizontal: false, vertical: true });
                    await cloned.write(path.join(outputSubDirPath, transformations.flipVertical.filename), quality ? { quality } : {});
                },
            });
        }

        // Brightness
        if (transformations.brightness?.enabled) {
            tasks.push({
                name: 'brightness',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.brightness(transformations.brightness.value || 0.2);
                    await cloned.write(path.join(outputSubDirPath, transformations.brightness.filename), quality ? { quality } : {});
                },
            });
        }

        // Contrast
        if (transformations.contrast?.enabled) {
            tasks.push({
                name: 'contrast',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.contrast(transformations.contrast.value || 0.3);
                    await cloned.write(path.join(outputSubDirPath, transformations.contrast.filename), quality ? { quality } : {});
                },
            });
        }

        // Opacity
        if (transformations.opacity?.enabled) {
            tasks.push({
                name: 'opacity',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.opacity(transformations.opacity.value || 0.8);
                    await cloned.write(path.join(outputSubDirPath, transformations.opacity.filename), quality ? { quality } : {});
                },
            });
        }

        // Fade
        if (transformations.fade?.enabled) {
            tasks.push({
                name: 'fade',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.fade(transformations.fade.value || 0.5);
                    await cloned.write(path.join(outputSubDirPath, transformations.fade.filename), quality ? { quality } : {});
                },
            });
        }

        // Pixelate
        if (transformations.pixelate?.enabled) {
            tasks.push({
                name: 'pixelate',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.pixelate(transformations.pixelate.size || 10);
                    await cloned.write(path.join(outputSubDirPath, transformations.pixelate.filename), quality ? { quality } : {});
                },
            });
        }

        // Posterize
        if (transformations.posterize?.enabled) {
            tasks.push({
                name: 'posterize',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.posterize(transformations.posterize.levels || 5);
                    await cloned.write(path.join(outputSubDirPath, transformations.posterize.filename), quality ? { quality } : {});
                },
            });
        }

        // Normalize
        if (transformations.normalize?.enabled) {
            tasks.push({
                name: 'normalize',
                operation: async () => {
                    const cloned = image.clone();
                    cloned.normalize();
                    await cloned.write(path.join(outputSubDirPath, transformations.normalize.filename), quality ? { quality } : {});
                },
            });
        }

        // Color Tone
        if (transformations.colorTone?.enabled) {
            tasks.push({
                name: 'colorTone',
                operation: async () => {
                    const cloned = image.clone();
                    const { red, green, blue } = transformations.colorTone;
                    cloned.color([{ apply: 'mix', params: [{ r: red || 255, g: green || 100, b: blue || 100 }, 50] }]);
                    await cloned.write(path.join(outputSubDirPath, transformations.colorTone.filename), quality ? { quality } : {});
                },
            });
        }

        // Process all tasks in parallel for better performance
        const results = await Promise.allSettled(
            tasks.map(async (task) => {
                try {
                    await task.operation();
                    return { name: task.name, success: true };
                } catch (error) {
                    console.error(`Error in ${task.name}:`, error.message);
                    return { name: task.name, success: false, error: error.message };
                }
            })
        );

        // Check for any failures
        const failures = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success));
        if (failures.length > 0) {
            const failedTasks = failures.map(f => {
                if (f.status === 'rejected') {
                    return `${f.reason}`;
                } else {
                    return `${f.value.name} (${f.value.error})`;
                }
            }).join(', ');
            throw new Error(`Failed to process tasks: ${failedTasks}`);
        }

        const processingTime = Date.now() - startTime;

        // Send success message back to main thread
        parentPort.postMessage({
            success: true,
            filename,
            processingTime,
            originalSize: { width: originalWidth, height: originalHeight },
            tasksCompleted: tasks.length,
        });
    } catch (error) {
        const processingTime = Date.now() - startTime;

        // Send error message back to main thread
        parentPort.postMessage({
            success: false,
            filename: workerData?.filename || 'unknown',
            error: error.message,
            processingTime,
        });

        // Exit with error code
        process.exit(1);
    }
}

// Start processing
processImage();