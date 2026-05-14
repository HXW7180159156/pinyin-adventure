# 拼音奇遇岛 🏝️

> 专为4-7岁儿童设计的汉语拼音学习应用，游戏化学习，轻松掌握拼音！

[🌐 在线体验](http://localhost:5173/) | [📖 发布指南](./docs/publish-guide.md)

## ✨ 功能特点

### 六大学习模块
| 模块 | 内容 | 图标 |
|------|------|------|
| 🌈 声调谷 | 学习四个声调，感受汉语旋律美 | 一声、二声、三声、四声 |
| 🌊 单韵母岛 | 学习六个单韵母，打好拼音基础 | a, o, e, i, u, ü |
| 🐚 复韵母礁 | 学习九个复韵母，发音更丰富 | ai, ei, ui, ao, ou, iu, ie, üe, er |
| 🏔️ 声母峰 | 挑战23个声母，成为拼音高手 | b, p, m, f, d, t, n, l, g, k, h, j, q, x... |
| 📚 整体认读 | 学习16个整体认读音节 | zhi, chi, shi, ri, zi, ci, si, yi, wu... |
| 🔮 拼读洞 | 学会拼读，拼音大闯关 | 两拼、三拼、声调标位 |

### 游戏化学习
- 🎮 趣味游戏关卡，边玩边学
- ⭐ 收集系统激励，保持学习动力
- 🔊 即时反馈，发音示范
- 📊 个性化学习进度追踪

### 科学学习路径
- 遵循拼音学习规律
- 从易到难循序渐进
- 间隔复习巩固记忆

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 9+

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 运行测试
```bash
npm run test
```

## 📱 移动端打包

### Android
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

APK文件位置: `android/app/build/outputs/apk/debug/app-debug.apk`

### Windows (Microsoft Store)
```bash
npm install @capacitor/windows
npx cap add windows
npx cap sync windows
# 使用Visual Studio打开 windows/PinyinAdventure.sln
```

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **状态管理**: React Context
- **跨平台**: Capacitor

## 📂 项目结构

```
pinyin-adventure/
├── src/
│   ├── components/          # UI组件
│   ├── context/             # 状态管理
│   ├── data/                # 拼音数据
│   ├── pages/               # 页面组件
│   │   ├── Home/            # 首页
│   │   ├── ToneValley/       # 声调谷
│   │   ├── FinalIsland/      # 单韵母岛
│   │   ├── CompoundFinalsIsland/  # 复韵母礁
│   │   ├── InitialPeak/      # 声母峰
│   │   ├── WholeReadingForest/ # 整体认读林
│   │   └── SpellingCave/       # 拼读洞
│   ├── types/                # TypeScript类型
│   └── App.tsx               # 应用入口
├── android/                  # Android原生项目
├── docs/                     # 文档
├── capacitor.config.json      # Capacitor配置
└── package.json
```

## 📖 拼音知识体系

```
汉语拼音
├── 声调（4个一声调）
│   ├── 第一声（阴平） ā
│   ├── 第二声（阳平） á
│   ├── 第三声（上声） ǎ
│   └── 第四声（去声） à
├── 韵母
│   ├── 单韵母（6个）a, o, e, i, u, ü
│   ├── 复韵母（9个）ai, ei, ui, ao, ou, iu, ie, üe, er
│   └── 鼻韵母（9个）an, en, in, un, ün, ang, eng, ing, ong
├── 声母（23个）
│   ├── 双唇音 b, p, m, f
│   ├── 舌尖音 d, t, n, l
│   ├── 舌根音 g, k, h
│   ├── 舌面音 j, q, x
│   ├── 舌尖后音 zh, ch, sh, r
│   ├── 舌尖前音 z, c, s
│   └── 半元音 y, w
└── 整体认读音节（16个）
    ├── zhi, chi, shi, ri
    ├── zi, ci, si
    └── yi, wu, yu, ye, yue, yuan, yin, yun, ying
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📧 联系方式

如有问题，请提交 Issue。

---

*让每个孩子都能轻松学习拼音！* 🌟
