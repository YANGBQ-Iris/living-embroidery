# Web UI 团队交接

## 当前版本

共生间隙 V4.5，仓库分支 `web-ui`。以此分支根目录作为可运行前端。旧版苗绣功能不属于现阶段方案，历史提交仍保留。

## 文件职责

| 文件 | 职责 |
| --- | --- |
| index.html | 入口、视频、花园、模块容器 |
| src/app.js | 场景切换、作品生成、记录、上传、删除和交互绑定 |
| src/state.js | 植物配置、选择规则、手势、数据验证、心情计算 |
| src/store.js | IndexedDB 持久化 |
| src/art.js | 压力与湿度网页演示、导出画面 |
| src/particles.js / butterfly.js | 粒子与蝴蝶路径/朝向 |
| src/wind.js / living-background.js | 风感与背景动画 |
| src/audio.js | 配乐与自然质感声音、音量和生命周期 |
| src/*.css | 基础样式与视觉迭代 |
| assets/ | 网站运行所需图片、视频、音频及素材说明 |
| scripts/serve.mjs | 本地静态服务器，支持视频 Range 请求 |
| scripts/check.mjs / tests/ | 可直接用 Node 运行的基础检查 |

## 硬件与 TouchDesigner

尚未接线，也未定义已完成的网络协议。`app.js` 的 `renderSensor()` 创建 `#prototype-frame`；`startDemo()` 启用网页演示。接入时从该展示位与演示控制入口扩展，保持“演示输入”和真实输入的来源区别。

建议团队先约定压力值范围、湿度单位/校准、采样频率、连接方式、断开状态和图像/视频输出方式，再实现适配器。浏览器不能直接展示任意 TouchDesigner 本机窗口；实际画面传输与部署环境需要另行确定。

## 保存与跨端

当前数据库名 `symbiotic-interlude-v4`，音量设置位于 localStorage。名称中的 v4 不应随视觉小版本随意修改，否则会像丢失已有记录。尚无账号、远程数据库和跨设备同步，不要把用户本机记录作为仓库种子数据上传。

## 协作

在各自分支提交，通过团队约定的 Pull Request 流程合并；本次只更新 `web-ui`，不自动合并主分支。运行目录不需要 node_modules 或构建产物。排查素材缺失先运行 `npm run check`。
