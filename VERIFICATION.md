# 发行版验证记录

日期：2026-10-31。平台：Windows x64。

已完成：

- 在独立目录安装runtime锁文件中的依赖；没有使用原工作台的node_modules链接。
- Windows PowerShell 5.1便携分支：下载Node v22.23.4，校验官方SHA256，启动setup成功；未修改全局Node安装。
- Node v24.9.0环境：20项测试通过，包含多工程存档隔离、写回重试、字幕对齐、路径保护及重复导出素材更新。
- TypeScript检查与Vite构建通过；生成的前端构建不复制用户媒体。
- 从导出HTTP接口连续生成两次一秒MP4；确认服务、项目状态和导出链路可用。
- 从真实浏览器进入工作台，确认多轨示例、播放和定位可用；点击“导出成片”完成四秒竖屏示例，按钮显示“已导出”。截图见assets/oneclick-workbench.png。
- 发布文件检查：不包含本机绝对链接、node_modules、个人原视频/字幕、历史成片、API Key、浏览器存档或本机生成的项目元数据。

本机发现并修复：

- 原版rsync与可执行脚本方式在Windows不直接适用，改为Node素材复制及JS CLI入口。
- Node 24/Windows下连续第二次导出时，fs.cpSync覆盖文件出现错误，改为明确的目录遍历和copyFileSync，并增加重复导出回归测试。
- 原上游包含本机node_modules链接及Unix软链接占位文件，发行版从Git中移除这些链接，首次运行按当前目录创建junction/symlink。

边界：

- GitHub Actions另外验证Windows和Ubuntu，具体远端结果以Actions页面为准；macOS与Windows ARM64没有本机实测。
- 默认演示不含真人或自动语音识别；使用自己的素材或AI剪辑需自行提供素材、配置相应助手/识别环境。
- 上游动效库打包后体积较大，Vite有500KB分包提示；本次未改动上游整体架构来消除这一非阻断提示。
- 工具沿用上游PolyForm Noncommercial许可，商业使用须另获原作者授权；另遵守Remotion及素材许可。
