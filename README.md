# Red bird project · 公共空间防爆防化自主巡检与危险源定位

面向公共空间防爆防化任务的研究提案主页，包含中英文展示、项目大纲下载、候选交通场景切换、已有研究基础、验证计划和团队交流入口。GlocalNav 区域提供跨楼层巡检项目链接与 Bilibili 视频预览入口。新增导航回放包含 3 个随机建筑 seed、18 条参考路线及 RGB／深度／MID-360 缓存，可直接在 GitHub Pages 交互播放。

## 项目内容

- 应用任务：公共空间防爆防化巡检与危险源定位。
- 技术基础：室内与跨楼层导航、气体感知及概率源定位。
- 研究阶段：首期拟验证一处室内区域、一类明确目标和单机器人原型。
- 已有乙醇实验与拟开展的目标物验证分别说明，研究概念图有明确标注。

缓存范围、布局清单和替换方法见 [导航回放缓存](./static/docs/navigation-cache.md)。

## 本地预览

这是无需构建的静态网站。下载仓库后，在仓库目录运行：

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

在浏览器打开 `http://127.0.0.1:8080`。三维场景通过 ES 模块和本地模型文件加载，需要 HTTP 服务；直接以 `file://` 打开时浏览器可能阻止这些资源。

## 发布到 GitHub Pages

本仓库地址为 [CJJJ0416/FA-RBPF_GSL.github.io](https://github.com/CJJJ0416/FA-RBPF_GSL.github.io)。

1. 将网站文件提交到 `main` 分支。
2. 在仓库 Settings → Pages → Build and deployment 中，将 Source 设为 **GitHub Actions**。
3. `.github/workflows/pages.yml` 会在推送到 `main` 时部署，也支持从 Actions 页面手动运行。
4. 在 Pages 或部署任务中查看成功状态及最终网址。预期地址为 `https://cjjj0416.github.io/FA-RBPF_GSL.github.io/`，只有部署成功后才视为已上线。

配置依据：[GitHub Pages 官方自定义工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 内容修改

| 内容 | 文件 |
| --- | --- |
| 中文正文、资源入口与页末贡献说明 | `index.html` |
| 英文内容、候选场景与交互 | `static/js/site.js` |
| 样式及移动端布局 | `static/css/site.css` |
| 可下载项目大纲 | `static/docs/proposal-outline-zh.md`、`static/docs/proposal-outline-en.md` |
| 中英文任务概念图与研究架构图 | `static/images/` |
| 公开合作交流表单 | `.github/ISSUE_TEMPLATE/collaboration.yml` |

团队交流入口会打开 GitHub 的新 Issue 表单，由访问者自行决定是否提交。网站不在后台提交消息、不收集表单或部署跟踪脚本。尚未公开联系邮箱，因此未填入任何邮箱地址。

## 资料与版式说明

布局参考用户指定的 [TestWeb-ICRA](https://sust-test-org.github.io/TestWeb-ICRA.github.io/) 与其标注的 [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template)。本网站独立实现，没有使用参考站的演示视频、示例研究图片或占位论文链接。

任务概念图和研究架构图为本项目绘制的示意图。研究展示图片选自提供的 GlocalNav 与 From Exploration Memory to Source Belief 稿件，只展示实验场景、平台及任务执行画面。图片及研究内容的权利由各自权利人保留。原始访谈、学号、内部部署地图及未发表论文全文不在本网站中发布。

校标采用 [HKUST(GZ) 招生官网](https://studyathkustgz.hkust-gz.edu.cn/)的[原始透明底蓝金色标志](https://studyathkustgz.hkust-gz.edu.cn/src/img/common/header_logo.png)，按原比例缩小放置于白色页角，链接回学校官网。标志权利由学校保留。

## 研究展示素材与公开范围

| 网页素材 | 稿件来源 | 展示内容 |
| --- | --- | --- |
| `static/images/research/navigation-scenes.jpg` | GlocalNav · Experimental scenarios | 走廊、窄门、楼梯与四足实验平台 |
| `static/images/research/navigation-stairs.jpg` | GlocalNav · Stairs avoidance | 实机运动序列与实验输出画面；同时作为视频链接预览 |
| `static/images/research/gas-hardware.jpg` | From Exploration Memory to Source Belief · Real-world experimental setup | 轮式采样平台、乙醇实验源与测试环境 |
| `static/images/research/gas-simulation.png` | From Exploration Memory to Source Belief · Simulation environments | 单房间、多房间和办公室仿真模型 |

这些文件是选定实验图的栅格化版本，没有附带原始 PDF、LaTeX 源文件或隐藏文档内容。公开文字侧重任务、平台、实验范围和提案关联，不包含核心算法推导、内部流程、伪代码、更新公式或参数配置。

GlocalNav 的四足导航实验与气体源定位稿件的轮式实机实验分别说明；两者整合为四足跨楼层气体巡检是拟开展的研究。旧中期报告的 10 次乙醇试验不是新稿件中两次实机定位运行的统计分母。

- [跨楼层巡检项目（Gitee）](https://gitee.com/fdsf3e2342/3d_navi_ros2)
- [跨楼层巡检演示（Bilibili）](https://www.bilibili.com/video/BV1XtrTBrEcE/)

视频窗口使用 GlocalNav 实验图作预览，点击后在新标签页打开 Bilibili；不会自动播放或预先加载第三方播放器。


## 可交互三维场景

应用场景提供地铁、高铁站与机场三套原创室内概念模型，可旋转、平移、缩放、俯视、复位。支持触摸操作、键盘方向键旋转、`+` / `-` 缩放、`R` 复位、`T` 俯视。WebGL 不可用或模型加载失败时显示提示，正文仍可阅读。切换场景采用请求序号避免异步响应覆盖当前选择；切换语言保持视角。

- 建筑空间：`tools/prepare_scenarios.py` 中的原创示意几何，非实际场站 CAD/BIM，不用于导航或施工。
- 列车：[Kenney Train Kit 1.1](https://kenney.nl/assets/train-kit)，CC0，原始许可证及选用的两个 GLB 保留在 `static/models/`。
- Open3D 0.19：构建空间几何、清理网格、计算法向并导出 PLY。页面仅展示三维模型。
- 浏览器：本地托管的 Three.js 0.180.0、OrbitControls、PLYLoader（MIT），不依赖 CDN、追踪脚本或在线模型服务。
- [Open3D 官方 WebRTC 查看器](https://www.open3d.org/docs/latest/tutorial/visualization/web_visualizer.html)需要运行 Python/C++ 后端，因此本站使用 Open3D 离线导出 + Three.js 静态展示，兼容 GitHub Pages；没有将 Three.js 冒称为原生 Open3D 浏览器组件。
- 来源、模型下载与范围说明：`static/models/sources.html`；导出统计：`static/models/manifest.json`。

重新生成（仅维护素材时需要，普通浏览不需要安装 Python 依赖）：

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r tools/requirements-models.txt
python tools/prepare_scenarios.py --train-kit static/models/original
```

完整站房候选中，Plewr 的 [Metro Station Prototype](https://plewr.itch.io/cc0-metro-station-prototype) 标注 CC0，可供后续室内结构替换参考；此次没有将其下载或导入，也没有使用下载不稳定的 3DAssets.dev 场站模型。

## 概念图与气体研究叙述

任务概念图借鉴 [TravExplorer Fig. 1](https://arxiv.org/abs/2605.19958) 的任务输入、能力、场景执行与输出结构，使用自有稿件的 GlocalNav 场景照片与原创矢量元素重新绘制；没有将 TravExplorer 的实验图或性能当成本项目成果。`tools/draw_mission.py` 生成中英文 SVG。

“交接来源线索”采用用户提供的两幅图片：`static/images/research/handover-location.png`（位置分布与标注）和 `handover-target.png`（阀门、法兰视觉检测）。原图像素及标注保留，在概念图中并列呈现，并提供独立原图查看入口；仅说明位置、观测和候选目标的关联，不将检测分数解释为泄漏确认或定位精度。

四足平台图使用用户提供的透明底硬件照片 `static/images/research/quadruped-inspection-hardware.png`，概念图展示 Unitree Go2 EDU、Livox Mid360、Jetson Orin NX、ESP32 与 BME680 标注。该图展示硬件配置；完整跨层气体巡检的集成验证状态仍由正文说明，不能由硬件照片推导。

根据后续版式要求，概念图采用紧凑四区布局，流程箭头位于各区域之间。四足机器人照片在 SVG 内裁取并横向摆放，外部硬件标注以可缩放文字重绘；原始图片保留完整且可单独查看。概念图提供中文和英文两版，随页面语言按钮切换，硬件型号保留原名。

气体研究章节采用连续叙述，补充探索到定位的高层关系、传感平台、两次乙醇实机运行记录与验证边界。实验时长仅是轨迹记录长度，源位置约 0.3 m 放置不确定性和 MOX 相对响应属性与数据一同说明。不公开核心公式、内部更新规则或参数配置。
