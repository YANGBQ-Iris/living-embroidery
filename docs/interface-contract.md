# 本地作品与后续接口

当前实现使用浏览器本地 Canvas，没有正在运行的串口或 WebSocket 服务。

模拟输入：

```json
{"type":"touch","intensity":1,"timestamp":1792800000000}
```

`type` 为 touch / water。`applyInteraction(params,event)` 过滤未知事件、限制强度并校验参数。touch 增加 touches 与 density；water 增加 waters 与 spread。两者更新随机种子，最终范围 density 15..100、spread 20..100。实际硬件接入前需另行确认去抖与频率。

存储键保留旧项目 `life-embroidery:works:v1`，保存字段：

```js
{
  id: 'UUID', // 后续外部消息中的 artwork_id
  pattern_id: 'botanical-radial-v1',
  status: 'completed',
  name: '叶间生长 · 01',
  createdAt: 'ISO 8601', version: 1, origin: 'original-digital',
  params: {palette:'moss',density:63,spread:70,seed:19,touches:1,waters:1}
}
```

当前保存交互累计次数与最终可重现参数，不记录每次输入的时间序列，不保存未经主动确认的用户画面。旧版本作品读入时补齐纹样标识与状态。

视觉适配器：mount(container,params)、update(params)、destroy()。update 使用 650ms 参数插值，destroy 取消动画。未来 TD 输出需以新适配器实现，不能将预留接口等同于真实连接。

试戴：默认静态原创 SVG 人像，作品使用透明 Canvas 作为发饰。摄像头通过 getUserMedia({video:{facingMode:'user'},audio:false}) 申请。关闭、切回静态、路由变化时停止 tracks；异步权限请求在弹窗关闭后返回也会立即停止新流。没有上传接口，没有人脸追踪。截图以 800×1000 PNG 导出，和镜像预览使用同一手动布局参数。
