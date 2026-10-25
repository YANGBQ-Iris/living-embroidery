# 植物照片与 TD 光影

## 使用

1. 在本机打开 TD 工程 `D:/web-UI/td/plant-web.toe`，保持时间轴播放。
2. 双击网站根目录 `start.cmd`，访问 http://127.0.0.1:5190/ 。
3. 进入花园后向下滚动，花园会化为光点，逐渐进入黑色展示区。向上滚动或“返回花园”可返回。花笺仍使用顶部按钮展开。
4. 左下角“上传植物照片”支持 JPG、PNG、WebP，最大 12 MB。图片仅在本机处理。
5. 检查原图/抠图预览，确认后再点击“使用这株植物”。细叶、细茎与复杂背景可能需要重选照片。
6. TD 更换原有图片输入并重置反馈缓存。网页显示实际 TD 输出，前景粒子由网页绘制。

## 运行条件

Node.js >=20.11；Python 3.11 和 `onnxruntime`、`numpy`、`Pillow`。抠图使用 U2Net 小模型，当前机器已就绪。需要时可设置 `PLANT_PYTHON` 指定 Python 路径。

模型文件 `.runtime/models/u2netp.onnx` 不纳入 Git，首次迁移机器请从 https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx 下载至该路径。

`src/vendor` 内含本地 GSAP 3.13.0 和 ScrollTrigger。动效支持减少动态效果设置与手机版布局。

## TD 接入范围

来自 `PPPANIK-MERRYCRISIS23-20(1).toe` 当前未保存工程的副本，原有视觉网络保留。`td/original-live.tox` 是接入前备份。
只改变原 Movie File In TOP 的图片文件，新增 `/project1/webBridge` 承担图片同步与输出回传。
`td/web_frame_callbacks.py` 的代码已经嵌入 Execute DAT，运行时不依赖外部脚本文件。
默认原图保存为 `assets/td-original-plant.jpg`。

本机桥接的固定目录是 `D:/web-UI/.runtime`。如移动整个网站，需要同步调整 TD DAT 内的路径后另存工程。
`current.json` 只记录已确认的图片；处理失败、预览取消均保留上一株植物。照片、模型和回传帧不提交 Git。

网页根据 TD 心跳显示连接状态。TD 停止或未连接时显示图片预览，不将静态预览标为实时效果。
当前回传为本机 JPEG 预览，约 8 fps；网页粒子层独立绘制。公网、多设备或高帧率展示应改为 WebRTC，此版本不对公网开放服务。

## 验证

`npm run check` 和 `npm test`。浏览器实测包括滚动、上传、抠图、确认、TD 接收对应图片 ID、回传帧、返回花园、花笺、390px 手机布局、减少动态效果和控制台异常。
本机测试截图与结果位于 `output/playwright/`，TD 原节点对照结果位于 `.runtime/td-verification.json`。
