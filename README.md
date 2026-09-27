# AI 截屏解题助手

[![检查](https://github.com/lijunznib/ai-interview-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/lijunznib/ai-interview-assistant/actions/workflows/ci.yml)
[![Windows 发布](https://github.com/lijunznib/ai-interview-assistant/actions/workflows/release.yml/badge.svg)](https://github.com/lijunznib/ai-interview-assistant/actions/workflows/release.yml)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC_BY--NC_4.0-lightgrey.svg)](LICENSE)

一个使用自备 API 的中文桌面助手：**先截图，确认后再提交给 AI**，流式展示解题思路和回答。适合刷题、自学、模拟面试，以及允许使用 AI 的辅助场景。

基于 [ooboqoo/interview-coder-cn](https://github.com/ooboqoo/interview-coder-cn) 二次开发，原作者 Gavin Wang。保留 **CC BY-NC 4.0 非商业许可**，修改说明见 [NOTICE.md](NOTICE.md)。

> **[下载 Windows 一键安装包](https://github.com/lijunznib/ai-interview-assistant/releases/latest/download/ai-interview-assistant-setup.exe)** · [全部版本](https://github.com/lijunznib/ai-interview-assistant/releases) · [反馈问题](https://github.com/lijunznib/ai-interview-assistant/issues)

## 能做什么

- `Ctrl+H` 只截图；可连续截多张，`Ctrl+Enter` 才把待提交图片发送给 AI。
- `Ctrl+L` 清空待提交图片和预览，保留已经生成的回答。
- 自备兼容 OpenAI Chat Completions 的 API，支持自定义 Base URL、模型、请求头和多组 API 配置。
- 流式中文回答，Markdown / 代码高亮，支持追问和在当前对话中追加截图。
- 悬浮窗口、透明度、鼠标穿透、窗口移动和回答翻页快捷键。
- 语音转录是可选功能，**不配置也能正常截图解题**。

首发安装包面向 **Windows 10/11 x64**。macOS 保留上游源码构建能力，但本分支未实机验证，也未提供 macOS Release；Linux 未支持。

## 一键部署 / 安装（推荐）

这是 Electron 桌面应用，安装到自己的电脑运行，不需要服务器、Docker、域名或 Node.js。API 由你选择的服务商提供，调用费用由服务商计收。

### 方式一：下载安装包

1. 点击 **[下载最新版 Windows 安装包](https://github.com/lijunznib/ai-interview-assistant/releases/latest/download/ai-interview-assistant-setup.exe)**。
2. 双击 `ai-interview-assistant-setup.exe`，自动安装到当前用户目录并创建桌面快捷方式。
3. 启动「截屏解题助手」，按下面的步骤填写自己的 API。

当前发布未做代码签名，Windows 可能提示未知发布者。先确认下载来源和发布页上的 SHA256，不需要关闭系统安全功能。

### 方式二：下载源码后双击安装

1. 在仓库页面选择 **Code → Download ZIP**，解压到普通目录。
2. 双击根目录的 **`install.cmd`**。
3. 脚本会下载本仓库最新正式版安装包和 `SHA256SUMS.txt`，校验成功后自动启动安装器。

此方式安装的是 **最新正式 Release**，不是现场编译当前源码。无需 Node.js 或 Git，首次安装需要能访问 GitHub API 和 Release 下载服务。脚本仅为当前 PowerShell 进程指定执行策略，不修改系统的持久策略。

如果自动下载失败，直接使用方式一；也可以在 PowerShell 里运行脚本查看错误：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1
```

只下载并验证、不执行安装：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -DownloadOnly
```

已有旧版时，先退出旧助手再安装；同时运行多个类似助手可能导致全局快捷键冲突。

## 首次配置 API

打开应用的 **设置 → AI 配置**，填写：

| 配置项       | 应该填什么                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| API Base URL | 服务商提供的 API 根地址，例如 `https://your-provider.example/v1`，不要填网页控制台地址或重复追加 `/chat/completions` |
| API Key      | 你自己的密钥，仅在本地软件中填写                                                                                     |
| 模型         | 服务商实际可调用、支持图片输入的完整模型 ID                                                                          |
| 自定义请求头 | 可选；仅在网关要求时填写，每行 `名称: 值`                                                                            |

模型必须同时支持**图片输入和流式输出**。模型列表能显示某个名字，不代表账户有权限或上游已经配置了路由；应以实际图片请求成功为准。中转站的模型别名可能与官方不同，必须使用该站的准确名称。

首次配置完成后，选择「解算法题」「通用问答」等提示词场景。语音转录的密钥留空即可。

本项目不会提供公共 API Key，也不会把维护者的个人配置放入源码或安装包。

## 怎么使用

1. 把题目或要分析的内容显示在屏幕上。
2. 按 **`Ctrl+H`** 截图。此时只在本地加入待提交队列，**不会调用 AI**。
3. 题目超过一屏时，滚动题目页面，再按 `Ctrl+H`；重复添加需要的图片。
4. 按 **`Ctrl+Enter`**，一次提交本轮待提交图片，开始新的回答。
5. 看错图或想重来时，按 **`Ctrl+L`** 清空图片，再重新截图。
6. 回答完成后，可点击「追问问题」继续当前对话。

`Ctrl+Shift+Enter` 是另一种操作：**立即截一张图并提交到当前对话**，不会等待 `Ctrl+Enter`。需要先检查截图时，请使用上面的 `Ctrl+H → Ctrl+Enter` 流程。

### Windows 默认快捷键

| 快捷键                          | 功能                                                               |
| ------------------------------- | ------------------------------------------------------------------ |
| `Ctrl+H`                        | 截图并加入待提交队列，不调用 AI                                    |
| `Ctrl+Enter`                    | 提交已截图片，开始新的 AI 回答                                     |
| `Ctrl+L`                        | 清空待提交图片和图片预览，保留已有回答；不删除自动保存到磁盘的文件 |
| `Ctrl+B`                        | 隐藏 / 恢复助手窗口                                                |
| `Ctrl+↑` / `Ctrl+↓`             | 整个助手窗口向上 / 向下移动                                        |
| `Ctrl+←` / `Ctrl+→`             | 整个助手窗口向左 / 向右移动                                        |
| `Ctrl+<` / `Ctrl+>`             | 回答内容向上 / 向下翻页，即 `Ctrl+Shift+,` / `Ctrl+Shift+.`        |
| `Ctrl+Shift+Enter`              | 立即截图并追加到当前对话，自动提交                                 |
| `Ctrl+.`                        | 停止生成                                                           |
| `Ctrl+M`                        | 开关鼠标穿透                                                       |
| `Ctrl+Shift+↑` / `Ctrl+Shift+↓` | 增加 / 降低不透明度                                                |
| `Ctrl+[` / `Ctrl+]`             | 切换上一组 / 下一组 API 配置                                       |
| `Ctrl+T`                        | 开始 / 暂停语音转录，需要另行配置                                  |
| `Ctrl+Shift+T`                  | 清空转录文字                                                       |

可在 **设置 → 快捷键** 中修改。`Ctrl+<` 中的 `<` 是 Shift 加逗号，不是左箭头；`Ctrl+>` 同理。快捷键是全局注册，会占用其他软件同名组合键；不用时退出助手。macOS 的组合键以应用设置中显示的内容为准。

## 语音转录（可选）

默认无需配置。要使用时，在设置的语音转录部分填写阿里云百炼 / DashScope API Key，再使用 `Ctrl+T` 开始或暂停。该密钥与视觉模型的密钥分开；转录文字会随图片提交给视觉模型。费用与可用区域以相应服务商说明为准。

## 共享屏幕与数据说明

- 程序启用了 Electron 的窗口捕获保护，但**不能保证所有会议软件、浏览器、系统版本或录屏方式都看不到窗口**。
- 只共享浏览器标签页通常只包含该标签页；共享整个桌面则取决于捕获实现。应使用另一台设备作为接收端，验证自己的实际会议软件与共享方式。
- `Ctrl+B` 是直接隐藏窗口。捕获保护不是“无法检测”，也不代表能够规避其他监控机制。
- 依据：[Electron 内容保护说明](https://www.electronjs.org/docs/latest/api/browser-window#winsetcontentprotectionenable-macos-windows)、[Windows Display Affinity 说明](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowdisplayaffinity)。
- 桌面程序在本地运行，**AI 推理通常不在本地**。提交时，截图、提示词及相关对话会发送到你配置的 API 服务商；使用语音转录时，音频会发送至相应转录服务。
- 配置保存在当前用户的应用数据目录。API Key 的本地持久化不是加密保险箱，不要分享应用数据目录或带密钥的截图。
- 安装包不内置个人 `.env` 或截图；自动保存截图 / 代码是用户可选项。

## 从源码运行

推荐 **Node.js 22 LTS（自带 npm 10）** 和 Git。GitHub Actions 使用 Node.js 22。请使用 npm，与仓库的 `package-lock.json` 保持一致。

```powershell
git clone https://github.com/lijunznib/ai-interview-assistant.git
cd ai-interview-assistant
npm ci
npm run dev
```

也可以下载 ZIP 解压，在项目目录运行最后两条命令。首次 `npm ci` 会下载 Electron，可能需要等待。

配置 API 推荐使用应用内设置。如果需要源码运行默认值，可复制 `.env.example` 为 `.env`，填写 `API_BASE_URL`、`API_KEY`、`MODEL`。`.env` 已被 Git 忽略且不会打包；已有应用内配置优先。**不要把真实密钥填进 `.env.example`。**

Electron 下载失败时，可以只为当前终端指定镜像再安装：

```powershell
$env:ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/'
npm ci
```

如果使用较新 npm 出现依赖安装脚本被阻止，优先切换到上述已验证的 Node.js / npm 组合，或直接使用 Release 安装包。

### 本地检查与打包

```powershell
npm test
npm run build
npm run build:win
node scripts/verify-package.cjs
```

`npm test` 覆盖截图不发请求、多图提交、清空图片、异步截图竞争以及快捷键迁移。`npm run build` 包含 TypeScript 检查。

Windows 安装包输出到 `dist/ai-interview-assistant-setup.exe`；可直接运行的应用目录为 `dist/win-unpacked/`。本地构建默认不上传 Release。

macOS 源码可尝试 `npm run build:mac`，需要 macOS 环境；该平台在本分支未验证，不能用 Windows 构建结果代替 macOS 测试。

## GitHub 一键构建与发布（维护者）

仓库已配置两个工作流：

- **Check**：推送 `main` 或提交 PR 时运行回归测试、类型检查、生产构建和安装脚本语法检查。
- **Release Windows**：编译 Windows x64 安装包，检查包内容，生成 SHA256 校验文件，再发布 GitHub Release。

### 在网页上一键发布

1. 先更新并提交 `package.json` 和 `package-lock.json` 中的版本号。可运行 `npm version patch --no-git-tag-version`，然后提交、推送。
2. 打开 **[Actions → Release Windows](https://github.com/lijunznib/ai-interview-assistant/actions/workflows/release.yml)**。
3. 点击 **Run workflow**，选择 `main`，再次点击 **Run workflow**。
4. 等待 `build` 和 `publish` 均成功；Release 和同版本标签会自动创建。

工作流使用 GitHub 自动提供的 `GITHUB_TOKEN`，无需把自己的 GitHub Token 或模型 API Key 放入 Actions Secrets。每次正式发布使用新的版本号，避免覆盖别人已经下载的同版本文件。

### 用标签自动发布

例如发布 `2.2.1`，先更新两个包文件并提交，然后：

```powershell
git push origin main
git tag v2.2.1
git push origin v2.2.1
```

标签必须与 `package.json` 版本一致。安装包、增量更新元数据、`latest.yml` 和 `SHA256SUMS.txt` 会出现在 Release 附件中。Windows 更新地址已指向本仓库。

如果复制项目到其他账号，请同步修改 `electron-builder.yml` 的 `publish.owner/repo`、`scripts/install.ps1` 的仓库地址和 README 链接，再发布。

## 常见问题

**快捷键没反应？** 先退出其他占用全局快捷键的助手，再重启本应用；进入设置查看注册状态。不要同时启动多个本应用实例。窗口隐藏时可尝试 `Ctrl+B`，鼠标无法点击时可尝试 `Ctrl+M`。

**按 `Ctrl+Enter` 没有反应？** 需要先 `Ctrl+H` 添加待提交图片。只有旧回答、没有新图片时，不会发起空请求。

**返回 401 / 403？** 核对密钥、账户权限、模型权限或上游账户状态。

**返回 404 / unknown model / no available channel？** 检查 Base URL、模型 ID 和服务商路由；模型出现在列表里不代表一定能调用。

**返回 502 / 超时？** 检查服务商可用性和网络；先截一张简单图片测试，或切换服务商确认。

**模型不认识图片？** 选择真正支持视觉输入的模型，文本模型无法完成截图识别。

**安装脚本下载失败？** 可能是 GitHub 网络或匿名 API 限流；用 README 顶部直接下载链接，或稍后重试。

## 许可证与致谢

感谢 [Gavin Wang / ooboqoo](https://github.com/ooboqoo) 提供原始项目。本仓库是独立维护的修改版本，并非完全从零创作。

遵循 [CC BY-NC 4.0](LICENSE)：需保留署名、许可链接和修改说明，**不得用于商业目的**。上游来源及改动记录见 [NOTICE.md](NOTICE.md)。
