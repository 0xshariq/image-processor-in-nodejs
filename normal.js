import path from 'node:path';
import { mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Jimp } from 'jimp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, 'normal-output');
const INPUT_DIR = path.join(__dirname, 'input-images');

async function processImage(imagePath, filename) {
    const outputSubDirPath = path.join(OUTPUT_DIR, filename.split('.')[0]);
    await mkdir(outputSubDirPath, { recursive: true });

    const image = await Jimp.read(imagePath);

    const tasks = [
        {
            name: 'thumbnail',
            operation: async () => {
                const cloned = image.clone();
                cloned.resize({ w: 150, h: 150 });
                await cloned.write(path.join(outputSubDirPath, 'thumbnail.jpg'));
            },
        },
        {
            name: 'small',
            operation: async () => {
                const cloned = image.clone();
                cloned.resize({ w: 300, h: 300 });
                await cloned.write(path.join(outputSubDirPath, 'small.jpg'));
            },
        },
        {
            name: 'medium',
            operation: async () => {
                const cloned = image.clone();
                cloned.resize({ w: 600, h: 600 });
                await cloned.write(path.join(outputSubDirPath, 'medium.jpg'));
            },
        },
        {
            name: 'large',
            operation: async () => {
                const cloned = image.clone();
                cloned.resize({ w: 1200, h: 1200 });
                await cloned.write(path.join(outputSubDirPath, 'large.jpg'));
            },
        },
        {
            name: 'grayscale',
            operation: async () => {
                const cloned = image.clone();
                cloned.greyscale();
                await cloned.write(path.join(outputSubDirPath, 'grayscale.jpg'));
            },
        },
        {
            name: 'blur',
            operation: async () => {
                const cloned = image.clone();
                cloned.blur(5);
                await cloned.write(path.join(outputSubDirPath, 'blur.jpg'));
            },
        },
    ];

    for (const task of tasks) {
        await task.operation();
    }
}

async function main() {
    const files = await readdir(INPUT_DIR);
    const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));

    const startTime = Date.now();

    for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const filePath = path.join(INPUT_DIR, file);
        await processImage(filePath, file);
        console.log(`${file} processed!`);
    }

    const totalTime = Date.now() - startTime;

    console.log('='.repeat(30));
    console.log('NORMAL PROCESSING');
    console.log('='.repeat(30));
    console.log(`Total time:${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    console.log(`Average image time:${(totalTime / imageFiles.length).toFixed(0)}ms)`);
    console.log('='.repeat(30));
}

await main();