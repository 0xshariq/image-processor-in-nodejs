import { Worker } from 'node:worker_threads';
import { readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI arguments
const args = process.argv.slice(2);
const cliArgs = {};
for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
        const key = args[i].substring(2);
        cliArgs[key] = args[i + 1] || true;
        i++;
    }
}

const WORKER_FILE_PATH = path.join(__dirname, 'worker.js');
const INPUT_DIR = path.join(__dirname, cliArgs.input || config.directories.input);
const OUTPUT_DIR = path.join(__dirname, cliArgs.output || config.directories.output);

// Worker pool configuration
const MAX_WORKERS = parseInt(cliArgs.workers) || config.workers.maxWorkers || os.cpus().length;
const workerPool = [];
const taskQueue = [];

/**
 * Run a worker with given file data
 * @param {string} filepath - Path to the image file
 * @param {string} filename - Name of the image file
 * @param {number} attempt - Current retry attempt
 * @returns {Promise<Object>} Worker result
 */
function runWorker(filepath, filename, attempt = 1) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(WORKER_FILE_PATH, {
            workerData: {
                imagePath: filepath,
                filename,
                outputDir: OUTPUT_DIR,
                transformations: config.imageProcessing.transformations,
                quality: config.imageProcessing.quality,
            },
        });

        const timeout = setTimeout(() => {
            worker.terminate();
            const error = new Error(`Worker timeout for ${filename}`);

            // Retry logic
            if (config.retry.enabled && attempt < config.retry.maxRetries) {
                setTimeout(() => {
                    runWorker(filepath, filename, attempt + 1)
                        .then(resolve)
                        .catch(reject);
                }, config.retry.delayMs);
            } else {
                reject(error);
            }
        }, config.workers.timeout);

        worker.on('message', (data) => {
            clearTimeout(timeout);
            resolve(data);
        });

        worker.on('error', (error) => {
            clearTimeout(timeout);
            const err = new Error(`Worker error for ${filename}: ${error.message}`);

            // Retry logic
            if (config.retry.enabled && attempt < config.retry.maxRetries) {
                if (config.logging.verbose) {
                    console.log(`   Retrying ${filename} (attempt ${attempt + 1}/${config.retry.maxRetries})`);
                }
                setTimeout(() => {
                    runWorker(filepath, filename, attempt + 1)
                        .then(resolve)
                        .catch(reject);
                }, config.retry.delayMs);
            } else {
                reject(err);
            }
        });

        worker.on('exit', (code) => {
            clearTimeout(timeout);
            if (code !== 0) {
                const err = new Error(`Worker stopped with exit code ${code} for ${filename}`);

                // Retry logic
                if (config.retry.enabled && attempt < config.retry.maxRetries) {
                    setTimeout(() => {
                        runWorker(filepath, filename, attempt + 1)
                            .then(resolve)
                            .catch(reject);
                    }, config.retry.delayMs);
                } else {
                    reject(err);
                }
            }
        });
    });
}

/**
 * Process images using a worker pool to limit concurrent workers
 * @param {Array<string>} imageFiles - Array of image filenames
 * @returns {Promise<Array>} Results from all workers
 */
async function processWithPool(imageFiles) {
    const results = [];
    const errors = [];
    let activeWorkers = 0;
    let completedTasks = 0;
    let currentIndex = 0;

    return new Promise((resolve) => {
        const startNextTask = async () => {
            if (currentIndex >= imageFiles.length && activeWorkers === 0) {
                resolve({ results, errors });
                return;
            }

            while (activeWorkers < MAX_WORKERS && currentIndex < imageFiles.length) {
                const file = imageFiles[currentIndex];
                const filePath = path.join(INPUT_DIR, file);
                currentIndex++;
                activeWorkers++;

                runWorker(filePath, file)
                    .then((data) => {
                        results.push(data);
                        completedTasks++;

                        if (data.success && config.logging.showProgress) {
                            console.log(`✓ [${completedTasks}/${imageFiles.length}] ${data.filename} (${data.processingTime}ms)`);
                        }
                    })
                    .catch((error) => {
                        errors.push({ filename: file, error: error.message });
                        completedTasks++;
                        if (config.logging.showProgress) {
                            console.error(`✗ [${completedTasks}/${imageFiles.length}] ${file} - ${error.message}`);
                        }
                    })
                    .finally(() => {
                        activeWorkers--;
                        startNextTask();
                    });
            }
        };

        startNextTask();
    });
}

/**
 * Main function to orchestrate image processing
 */
async function main() {
    // Show help
    if (cliArgs.help || cliArgs.h) {
        console.log(`
🖼️  Multi-threaded Image Processor

Usage: pnpm run process [options]

Options:
  --input <dir>      Input directory (default: ${config.directories.input})
  --output <dir>     Output directory (default: ${config.directories.output})
  --workers <num>    Number of worker threads (default: CPU cores)
  --help, -h         Show this help message

Examples:
  pnpm run process
  pnpm run process -- --input ./photos --output ./processed
  pnpm run process -- --workers 8
        `);
        process.exit(0);
    }

    try {
        // Check if input directory exists
        try {
            await access(INPUT_DIR);
        } catch {
            console.error(`❌ Input directory not found: ${INPUT_DIR}`);
            console.log('Please create an "input-images" folder and add some images.');
            process.exit(1);
        }

        // Read and filter image files
        const files = await readdir(INPUT_DIR);
        const formatPattern = new RegExp(`\\.(${config.imageProcessing.supportedFormats.join('|')})$`, 'i');
        const imageFiles = files.filter((file) => formatPattern.test(file));

        if (imageFiles.length === 0) {
            console.log('⚠️  No image files found in input-images directory');
            console.log(`Supported formats: ${config.imageProcessing.supportedFormats.join(', ')}`);
            process.exit(0);
        }

        const enabledTransformations = Object.keys(config.imageProcessing.transformations)
            .filter(key => config.imageProcessing.transformations[key].enabled);

        console.log('\n' + '='.repeat(60));
        console.log('🚀 MULTI-THREADED IMAGE PROCESSING');
        console.log('='.repeat(60));
        console.log(`📁 Input Directory: ${INPUT_DIR}`);
        console.log(`📂 Output Directory: ${OUTPUT_DIR}`);
        console.log(`📊 Total Images: ${imageFiles.length}`);
        console.log(`⚙️  Max Workers: ${MAX_WORKERS} (CPU cores)`);
        console.log(`🖼️  Transformations: ${enabledTransformations.join(', ')}`);
        console.log(`🎨 Quality: ${config.imageProcessing.quality}%`);
        console.log('='.repeat(60) + '\n');

        const startTime = Date.now();

        // Process images with worker pool
        const { results, errors } = await processWithPool(imageFiles);

        const totalTime = Date.now() - startTime;
        const successCount = results.filter(r => r.success).length;
        const failureCount = errors.length;

        // Display results
        if (config.logging.showStats) {
            console.log('\n' + '='.repeat(60));
            console.log('📈 PROCESSING COMPLETE');
            console.log('='.repeat(60));
            console.log(`✓ Successful: ${successCount}`);
            console.log(`✗ Failed: ${failureCount}`);
            console.log(`⏱️  Total Time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
            console.log(`⚡ Average Time per Image: ${(totalTime / imageFiles.length).toFixed(0)}ms`);

            if (successCount > 0) {
                const avgProcessingTime = results
                    .filter(r => r.success)
                    .reduce((sum, r) => sum + r.processingTime, 0) / successCount;
                console.log(`🎯 Average Processing Time: ${avgProcessingTime.toFixed(0)}ms`);
            }

            console.log('='.repeat(60));
        }

        // Display errors if any
        if (errors.length > 0) {
            console.log('\n❌ ERRORS:');
            errors.forEach(({ filename, error }) => {
                console.log(`   - ${filename}: ${error}`);
            });
        }

        console.log(`\n✅ Output saved to: ${OUTPUT_DIR}\n`);

    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
        process.exit(1);
    }
}

// Run main function
main();