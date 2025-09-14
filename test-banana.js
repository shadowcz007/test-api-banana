import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径（ES模块中__dirname的替代方案）
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const API_BASE_URL = 'https://router.shengsuanyun.com/api';
const API_KEY = 'xu3HDx2Z6SGAVrTmcYc0MEjZfWCYSgcR4-RTQKB6KvRC9PlK242yOPqckqMBpJSD4A5gRaw3d37QGbvuZ7D8WssfkSTDYMy5JUFbBynVDLI'; // 请替换为实际的API Key
const MODEL = 'google/gemini-2.5-flash-image-preview';
const IMAGES_DIR = path.join(__dirname, 'images');
const SOURCE_IMAGE_PATH = path.join(__dirname, 'ds.jpg');

// 确保images目录存在
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// System Prompt 设计
const SYSTEM_PROMPT = `你是一个专业的图像生成和编辑助手。请根据用户的需求：

1. 对于图像生成：创建高质量、创意丰富的图像
2. 对于图像编辑：基于参考图像进行智能编辑和优化

请确保：
- 输出高质量的图像结果
- 提供详细的修改建议和改进方案
- 考虑图像的美学、构图和创意性
- 如果涉及人物，确保符合伦理标准

请用中文回复，并提供具体的图像结果和修改建议。`;

/**
 * 发送API请求
 * @param {string} endpoint - API端点
 * @param {Object} requestBody - 请求体
 * @returns {Promise<Object>} API响应
 */
async function sendApiRequest(endpoint, requestBody) {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

/**
 * 将base64数据保存为图片文件
 * @param {string} base64Data - base64编码的图片数据
 * @param {string} filename - 文件名
 * @param {string} mimeType - MIME类型
 */
function saveBase64Image(base64Data, filename, mimeType = 'image/png') {
    try {
        // 移除data URL前缀
        const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64String, 'base64');

        // 根据MIME类型确定文件扩展名
        const ext = mimeType === 'image/jpeg' ? '.jpg' : '.png';
        const filePath = path.join(IMAGES_DIR, `${filename}${ext}`);

        fs.writeFileSync(filePath, buffer);
        console.log(`图片已保存: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error('保存图片失败:', error);
        throw error;
    }
}

/**
 * 将图片文件转换为base64
 * @param {string} imagePath - 图片文件路径
 * @returns {string} base64编码的图片数据
 */
function imageToBase64(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const mimeType = path.extname(imagePath).toLowerCase() === '.jpg' ? 'image/jpeg' : 'image/png';
        return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
        console.error('读取图片文件失败:', error);
        throw error;
    }
}

/**
 * 生成图片
 * @param {string} userPrompt - 用户提示词
 * @returns {Promise<Array>} 生成的图片文件路径数组
 */
async function generateImages(userPrompt) {
    console.log('开始生成图片...');
    console.log('用户提示词:', userPrompt);

    const fullPrompt = `${SYSTEM_PROMPT}\n\n用户需求: ${userPrompt}`;

    const requestBody = {
        prompt: fullPrompt,
        model: MODEL
    };

    try {
        const response = await sendApiRequest('/v1/images/generations', requestBody);
        console.log('API响应:', JSON.stringify(response, null, 2));

        const savedFiles = [];

        if (response.candidates && Array.isArray(response.candidates)) {
            response.candidates.forEach((candidate, index) => {
                if (candidate.content && candidate.content.parts) {
                    candidate.content.parts.forEach((part, partIndex) => {
                        if (part.inlineData) {
                            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                            const filename = `generated_${timestamp}_${index}_${partIndex}`;
                            const filePath = saveBase64Image(
                                part.inlineData.data,
                                filename,
                                part.inlineData.mimeType
                            );
                            savedFiles.push(filePath);
                        }

                        if (part.text) {
                            console.log(`\n候选者 ${index + 1} 的文本描述:`);
                            console.log(part.text);
                        }
                    });
                }
            });
        }

        console.log(`\n成功生成 ${savedFiles.length} 张图片`);
        return savedFiles;

    } catch (error) {
        console.error('生成图片失败:', error);
        throw error;
    }
}

/**
 * 编辑图片
 * @param {string} userPrompt - 用户提示词
 * @param {Array<string>} imagePaths - 参考图片路径数组
 * @returns {Promise<Array>} 编辑后的图片文件路径数组
 */
async function editImages(userPrompt, imagePaths) {
    console.log('开始编辑图片...');
    console.log('用户提示词:', userPrompt);
    console.log('参考图片:', imagePaths);

    const fullPrompt = `${SYSTEM_PROMPT}\n\n用户需求: ${userPrompt}`;

    // 将图片文件转换为base64
    const base64Images = imagePaths.map(imagePath => {
        if (!fs.existsSync(imagePath)) {
            throw new Error(`图片文件不存在: ${imagePath}`);
        }
        return imageToBase64(imagePath);
    });

    const requestBody = {
        prompt: fullPrompt,
        images: base64Images,
        model: MODEL
    };

    try {
        const response = await sendApiRequest('/v1/images/edits', requestBody);
        console.log('API响应:', JSON.stringify(response, null, 2));

        const savedFiles = [];

        if (response.candidates && Array.isArray(response.candidates)) {
            response.candidates.forEach((candidate, index) => {
                if (candidate.content && candidate.content.parts) {
                    candidate.content.parts.forEach((part, partIndex) => {
                        if (part.inlineData) {
                            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                            const filename = `edited_${timestamp}_${index}_${partIndex}`;
                            const filePath = saveBase64Image(
                                part.inlineData.data,
                                filename,
                                part.inlineData.mimeType
                            );
                            savedFiles.push(filePath);
                        }

                        if (part.text) {
                            console.log(`\n候选者 ${index + 1} 的文本描述:`);
                            console.log(part.text);
                        }
                    });
                }
            });
        }

        console.log(`\n成功编辑生成 ${savedFiles.length} 张图片`);
        return savedFiles;

    } catch (error) {
        console.error('编辑图片失败:', error);
        throw error;
    }
}

/**
 * 主函数 - 演示用法
 */
async function main() {
    try {
        console.log('=== 胜算云图片生成和编辑工具 ===\n');

        // 检查API Key
        if (API_KEY === 'YOUR_API_KEY_HERE') {
            console.error('请先设置正确的API_KEY!');
            return;
        }

        // 检查源图片是否存在
        if (!fs.existsSync(SOURCE_IMAGE_PATH)) {
            console.error(`源图片文件不存在: ${SOURCE_IMAGE_PATH}`);
            return;
        }

        // 示例1: 生成图片
        console.log('1. 生成图片示例:');
        const generatePrompt = "创建一个未来科技风格的城市夜景，包含霓虹灯和飞行汽车";
        const generatedImages = await generateImages(generatePrompt);
        console.log('生成的图片:', generatedImages);

        console.log('\n' + '='.repeat(50) + '\n');

        // 示例2: 编辑图片
        console.log('2. 编辑图片示例:');
        const editPrompt = "将这张图片转换为水彩画风格，保持原有的构图和主要元素";
        const editedImages = await editImages(editPrompt, [SOURCE_IMAGE_PATH]);
        console.log('编辑后的图片:', editedImages);

        console.log('\n=== 任务完成 ===');

    } catch (error) {
        console.error('程序执行失败:', error);
    }
}

// 导出函数供其他模块使用
export {
    generateImages,
    editImages,
    saveBase64Image,
    imageToBase64
};

// 如果直接运行此脚本，则执行主函数
if (
    import.meta.url === `file://${process.argv[1]}`) {
    main();
}