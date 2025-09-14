# 胜算云图片生成和编辑工具

这是一个基于胜算云API的Node.js脚本，用于生成和编辑图片。

## 功能特性

- 🎨 **图片生成**: 根据文本提示词生成创意图片
- ✏️ **图片编辑**: 基于参考图片进行智能编辑和优化
- 💾 **自动保存**: 生成的图片自动保存到`images`文件夹
- 🔧 **错误处理**: 完善的错误处理和日志记录
- 📝 **中文支持**: 支持中文提示词和响应

## 安装依赖

```bash
npm install
```

## 配置

1. 在`test-banana.js`文件中，将`YOUR_API_KEY_HERE`替换为你的实际API Key：

```javascript
const API_KEY = 'your-actual-api-key-here';
```

2. 确保`ds.jpg`文件存在于项目根目录（用于图片编辑示例）

## 使用方法

### 直接运行脚本

```bash
npm start
```

这将运行示例代码，包括：
- 生成一张未来科技风格的城市夜景图片
- 编辑`ds.jpg`图片，转换为水彩画风格

### 作为模块使用

```javascript
import { generateImages, editImages } from './test-banana.js';

// 生成图片
const generatedImages = await generateImages("一只可爱的小猫在花园里玩耍");

// 编辑图片
const editedImages = await editImages("将这张图片转换为卡通风格", ["path/to/image.jpg"]);
```

## API接口说明

### 图片生成接口
- **端点**: `POST /v1/images/generations`
- **参数**: 
  - `prompt`: 经过System Prompt包装的用户提示词
  - `model`: 模型名称（默认: `google/gemini-2.5-flash-image-preview`）

### 图片编辑接口
- **端点**: `POST /v1/images/edits`
- **参数**:
  - `prompt`: 经过System Prompt包装的用户提示词
  - `images`: 参考图片数组（base64编码）
  - `model`: 模型名称（默认: `google/gemini-2.5-flash-image-preview`）

## 输出格式

API返回的图片数据会自动解析并保存为文件，同时输出文本描述和修改建议。

## 文件结构

```
test-api-banana/
├── test-banana.js      # 主脚本文件
├── package.json        # 项目配置
├── README.md          # 说明文档
├── ds.jpg             # 源图片文件
└── images/            # 生成的图片保存目录
    ├── generated_*.png
    └── edited_*.png
```

## 注意事项

1. 确保Node.js版本 >= 18.0.0
2. 需要有效的胜算云API Key
3. 生成的图片会自动保存到`images`文件夹
4. 支持多种图片格式（PNG、JPEG等）

## 错误处理

脚本包含完善的错误处理机制：
- API请求失败处理
- 文件读写错误处理
- 图片格式验证
- 详细的错误日志输出

## 许可证

MIT License
