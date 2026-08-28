# 发布指南

## Web

1. 使用受支持的 Node.js 版本执行 `npm ci`。
2. 依次执行 `npm run lint`、`npm test` 和 `npm run build`。
3. 合并到 `main` 后确认 GitHub Pages 工作流的构建与部署任务成功。
4. 验证首页、六个章节、发音播放、进度恢复和刷新后的深链。

## Android

1. 完成 Web 验证后执行 `npm run build` 和 `npx cap sync android`。
2. 在 Android Studio 中检查并构建项目，或在 `android` 目录执行 `./gradlew assembleDebug`。
3. 在 Android 7.0 及以上设备验证麦克风授权、拒绝授权、录音回放和系统返回键。
4. 发布前更新 `android/app/build.gradle` 中的版本号，并生成签名发布包。

## 验收清单

- 六个学习模块均可进入并完成主要流程。
- 星星、章节解锁、成就和今日任务在刷新后保持一致。
- 无麦克风权限或无语音合成能力时仍可继续学习。
- 键盘、触摸操作以及“减少动态效果”设置均可使用。
- 离线启动已打包的 Android 应用时不依赖远程资源。
