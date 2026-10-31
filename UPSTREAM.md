# 来源与发行版改动

上游：https://github.com/Vincentwei1021/video-talkcraft

基线提交：`a7c29edfb2404612dde6a5a1c8aa94232e85625b`。

Required Notice: Copyright (c) 2026 Vincent Wei (https://github.com/Vincentwei1021/video-talkcraft)

许可全文见根目录 LICENSE。原作者、原模板与上游文档不改署名；本仓库是便携启动发行版，不宣称重新创作了整个工作台。

本发行版增加：

- Windows 一键入口、带校验的本机便携 Node、macOS/Linux 启动脚本；
- 一份精确锁定的共享依赖，启动时不自动升级；
- Windows junction/Unix symlink 适配与示例工程接入；
- 用 Node 文件复制替代 rsync，用当前 Node 执行 Remotion CLI，避免 Windows shell/.cmd 问题；
- 无真人资料的竖屏演示、真实导出接口冒烟与跨平台回归测试；
- 本机状态、用户项目、渲染产物与下载文件的忽略规则。

本发行版源码没有从原使用者的口播工程、视频素材或私人工作目录中复制业务内容。机器本地的历史工作台继续保留，发布版在独立目录验证。
