# 导航回放缓存

提案页的“导航回放”使用三个独立生成的建筑，每张地图包含五条固定 GPMP 路线和一条随机跨楼层路线。

| Seed | 建筑布局 | 楼层 | 房间 |
| --- | --- | --- | --- |
| 427036606 | 环形中庭 | 4 | 5 |
| 629042003 | L 形翼楼 | 3 | 3 |
| 339131371 | T 形分支 | 2 | 4 |

浏览器通过同一个 `navigation-demo.js` 播放器读取 `static/navigation/manifest.json`；每张图只有一份建筑网格，每条路线只有一份相机图像、时间与位姿记录、紧凑点云。首次滚动到演示区时才加载第一组数据，切换路线按需读取；内存最多保留两条路线缓存。

三维参考位置按原生 GPMP 路径连续插值。RGB、光轴 Z 深度、点云及距离图使用同一组已采样位姿，采样率随路线时长显示。深度窗口为 0.3–3 m；LiDAR 窗口为 0.1–10 m，`turbo_r` 配色与图例对应。360° 距离图保持 360:61 的原生比例。每条路线最多 128 组传感器帧、每帧最多 512 个三维显示点；完整原生参考线保留。原始扫描为每组 3,000 条射线，显示点云另作抽样。

范围：理想网格几何观测与参考路线回放；路径未做几何碰撞验收，未执行机器人动力学或气体扩散仿真。网站中的随机按钮用于切换提前生成的示例，不调用本地 GPU、RViz 或 `127.0.0.1` 服务。

## 替换缓存

使用已配置 GPU、原生 GPMP 和 Python 环境的 `glocal2-nav` 项目运行：

```bash
NAV_SOURCE=/path/to/glocal2-nav
SITE_ROOT=/path/to/proposal_site
"$NAV_SOURCE/.venv/bin/python" "$SITE_ROOT/tools/export_navigation.py" \
  --source-root "$NAV_SOURCE" \
  --template "$NAV_SOURCE/outputs/upstream_f5580008/easy_00043_edit02" \
  --output "$SITE_ROOT/static/navigation" \
  --seed 427036606 --seed 629042003 --seed 339131371
```

省略 `--seed` 时随机抽取三组 seed；可以设置 `--count`、`--frames` 和 `--points`。不同 seed 不保证不同建筑族，可查看生成后的 manifest 并按需重选。规划失败时生成器最多尝试邻近的三个 seed；manifest 同时记录请求与实际 seed。

导出先在临时目录中完成建筑、GPU VST、全部原生路线与传感器缓存，成功后替换 `static/navigation`。过程失败时保留旧缓存；原始模板及当前在线地图保持只读，临时几何、点云和 VST 在结束后清理。发布内容保留输入哈希及来源提交号，便于追溯，不打包原生库、环境或训练文件。

生成后本地预览并检查播放、重置、选线与换图，再提交网站仓库的更新。GitHub Actions 会发布整个静态站点。

[返回提案页](../../index.html#navigation-demo)
