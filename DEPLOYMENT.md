> 当前 `web-ui` 为生命绣谱集成版。以下公开地址与扫码验证记录属于旧版共生间隙，上传源码不会自动更新这些站点。静态打包仅提供网页部分；真实 Arduino、TD 回传及植物处理服务仍需队长电脑运行本地集成服务。

# 共生间隙独立部署说明

## 两个公开入口

- 互动体验：https://yangbingqian54-lgtm.github.io/symbiotic-interlude-demo/
- 电脑与模型可读的项目页：https://yangbingqian54-lgtm.github.io/symbiotic-interlude-demo/project.html
- 纯文本说明：同一站点下的 llms.txt。静态正文无需 JavaScript 或登录；其他模型是否可以访问仍由它自身的联网工具决定。

此前 chatgpt.site 地址已设为公开，但用户手机实际收到 Cloudflare blocked 页面。那是托管域名的访问拦截，不是 QR 编码错误，也不是已确认的网页布局问题。新的发布副本使用独立 GitHub Pages 地址；仍需在手机真实网络上复核，不承诺所有网络畅通。

## 打包现有成品

1. 使用团队 web-ui 分支，确认 Node.js 20.11 或更新版本。
2. 运行 npm run check 和 npm test。
3. 运行 npm run build，生成 dist。不要把整个开发目录当作公开目录。
4. 把 dist 内的文件完整上传到静态网站托管的根目录，保留 src、assets 的相对位置。
5. 使用 HTTP 或 HTTPS 访问。双击 file:// 文件不能可靠运行 ES modules。
6. 核对 index.html、project.html、8.5 秒视频、四株植物、声音、保存和下载，再用真实手机扫码。

不需要数据库服务器、AI Key 或常驻 Node 服务。程序使用当前浏览器的 IndexedDB；更换域名、端口或协议不会自动迁移旧作品。

## GitHub Pages 发布副本

团队仓库 YANGBQ-Iris/living-embroidery 的 web-ui 用于源码协作。当前登录账号只有该仓库 push 权限，不能修改它的 Pages 设置。因此在个人账号 yangbingqian54-lgtm 下建立独立发布仓库 symbiotic-interlude-demo，main 根目录存放 dist 成品，Pages 以 main 的根目录为发布源。

更新时先在团队分支测试与提交，再运行打包，将 dist 同步到发布仓库 main，普通提交并推送，不强制覆盖历史。发布仓库不是新的硬件工程，也不代替团队分支。

## 迁移到其他静态托管

dist 可交给 Nginx、学校服务器或其他静态网站平台。提供正确的 text/javascript、text/css、video/mp4、audio/wav 类型；视频最好支持范围请求。现有资源使用相对路径，可部署在子目录。

更换公开地址后，同步修改本文件、llms.txt、project.json、project.html 的结构化地址、sitemap.xml、README 与二维码，避免继续分享旧地址。不要为了修复托管网络拦截而关闭访客设备的安全设置。

## 接入与公开内容

现有互动仍为网页演示。静态托管不自动提供 Arduino 串口、TouchDesigner、云保存或在线 AI 服务。代码目录里的历史模拟器不代表真实设备接入。

打包只复制运行文件与公开说明，排除包含本地路径的 assets/metadata.json、开发日志、临时导出和凭据。原始 Word 记录的是 V4.8.6 的过程，部署地址以后续本文为准。

## 本轮验证

2026-10-25：桌面与手机尺寸的浏览器检查通过，用户已用真实手机确认新地址能够正常进入花园。此结果适用于本次测试，不代表所有地区和网络均可访问。
