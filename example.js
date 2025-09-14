import { generateImages, editImages } from './test-banana.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 使用示例
 */
async function runExamples() {
    try {
        console.log('=== 胜算云图片工具使用示例 ===\n');

        // 示例1: 生成图片
        console.log('1. 生成图片示例:');
        const generatePrompt = "一只可爱的熊猫在竹林中吃竹子，阳光透过竹叶洒下，温馨的画面";
        const generatedImages = await generateImages(generatePrompt);
        console.log('生成的图片文件:', generatedImages);

        console.log('\n' + '='.repeat(60) + '\n');

        // 示例2: 编辑图片
        console.log('2. 编辑图片示例:');
        const sourceImagePath = path.join(__dirname, 'ds.jpg');
        const editPrompt = "将这张图片转换为油画风格，增强色彩饱和度和艺术感";
        const editedImages = await editImages(editPrompt, [sourceImagePath]);
        console.log('编辑后的图片文件:', editedImages);

        console.log('\n' + '='.repeat(60) + '\n');

        // 示例3: 批量生成不同风格的图片
        console.log('3. 批量生成示例:');
        const prompts = [
            "科幻风格的机器人",
            "古典中国山水画",
            "现代抽象艺术作品"
        ];

        for (let i = 0; i < prompts.length; i++) {
            console.log(`\n生成第 ${i + 1} 张图片: ${prompts[i]}`);
            const images = await generateImages(prompts[i]);
            console.log(`完成，保存到: ${images.join(', ')}`);
        }

        console.log('\n=== 所有示例执行完成 ===');

    } catch (error) {
        console.error('示例执行失败:', error);
    }
}

// 运行示例
runExamples();