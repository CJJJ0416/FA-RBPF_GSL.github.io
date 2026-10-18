"""Draw bilingual proposal SVGs with editable vector labels.

Source photos are embedded unchanged; SVG crops and rotation lay out the
quadruped horizontally without rotating its text labels.
"""
from base64 import b64encode
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def data_image(name):
    return b64encode((ROOT / 'static/images/research' / name).read_bytes()).decode()

photos = data_image('navigation-scenes.jpg')
platform = data_image('quadruped-inspection-hardware.png')
leads = {name: data_image(f'handover-{name}.png') for name in ('location', 'target')}
svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="750" viewBox="0 0 1440 750" role="img">',
    '<title>Cross-floor inspection: from task to source leads</title>',
    '<desc>Define an inspection task, combine mobility with gas sensing, reach and sample indoor areas, and hand over location and visual leads for professional review. The quadruped hardware is shown horizontally with English annotations.</desc>',
    '<defs>',
    f'<image id="nav-photo" width="1600" height="1200" href="data:image/jpeg;base64,{photos}"/>',
    f'<image id="robot-photo" width="544" height="392" href="data:image/png;base64,{platform}"/>',
    '<marker id="flow-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L5 3L0 6" fill="none" stroke="#668ba3" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></marker>',
    '</defs><rect width="1440" height="750" fill="#fff"/>',
]

def text(x, y, value, size=20, color='#43556a', weight=400, anchor='start'):
    svg.append(f'<text x="{x}" y="{y}" font-family="Inter,Arial,Noto Sans CJK SC,Microsoft YaHei,sans-serif" font-size="{size}" fill="{color}" font-weight="{weight}" text-anchor="{anchor}">{escape(value)}</text>')

def rect(x, y, w, h, fill='#f1f5f8', stroke='none', r=12):
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}"/>')

def path(d, color='#668ba3', width=2.5, arrow=False):
    svg.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"' + (' marker-end="url(#flow-arrow)"' if arrow else '') + '/>')

def crop(x, y, w, h, view, photo='nav-photo'):
    svg.append(f'<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="{view}" preserveAspectRatio="xMidYMid slice"><use href="#{photo}"/></svg>')

def badge(x, y, number, label):
    rect(x, y-24, 32, 32, '#deecf3', r=16)
    text(x+16, y-2, number, 14, '#266484', 700, 'middle')
    text(x+44, y, label, 23, '#1e3449', 650)

def callout(label, x, y, route, endpoint, color='#435e73'):
    # Labels remain horizontal and crisp at every rendering scale.
    path(route, color, 1.5)
    svg.append(f'<circle cx="{endpoint[0]}" cy="{endpoint[1]}" r="2.4" fill="{color}"/>')
    text(x, y, label, 15, color, 600, 'middle')

text(28, 33, 'Cross-floor inspection: from task to source leads', 25, '#213c54', 650)
text(1412, 33, 'PROPOSED INTEGRATION', 13, '#718295', 550, 'end')

# Four compact stages, linked through the clear gaps between their panels.
for box in [(28,60,350,300), (420,60,992,300), (420,406,992,316), (28,406,350,316)]:
    rect(*box)
path('M386 210H410', arrow=True)
path('M916 369V397', arrow=True)
path('M412 564H386', arrow=True)

badge(48, 99, '01', 'Define the task')
text(48, 141, 'Inspect a defined indoor area.', 19, '#324e64', 600)
text(48, 165, 'Target · Access · Review', 17)
crop(48, 184, 310, 155, '35 165 735 365')

badge(444, 99, '02', 'Mobility + gas sensing')
text(1164, 99, 'Unitree Go2 EDU', 19, '#324e64', 650, 'middle')
# Compact capability descriptions to the left of the actual hardware.
path('M451 198h16v-19h17v-19h17v-19h16', '#4c89a8', 4)
text(538, 164, 'Multi-level mobility', 23, '#225a78', 650)
text(538, 193, 'Traverse stairs and reach sampling sites', 17)
svg.append('<g transform="translate(466 248)"><circle cx="15" cy="15" r="16" fill="none" stroke="#ae8750" stroke-width="2.7"/><circle cx="15" cy="15" r="4" fill="#ae8750"/><path d="M-9 15h48M15-9v48" stroke="#ae8750" stroke-width="2"/></g>')
text(538, 261, 'Mobile gas observations', 23, '#8c6838', 650)
text(538, 290, 'Collect samples and refine source leads', 17)

# Rotate only the robot photograph crop. All original external raster labels are
# outside this crop; fresh English vector callouts refer to the same components.
svg.append('<g transform="translate(40 0)"><g transform="translate(942 141)"><g transform="translate(0 198) rotate(-90)">')
crop(0, 0, 198, 364.1, '116 47 180 331', 'robot-photo')
svg.append('</g></g>')
callout('Jetson Orin NX', 1000, 129, 'M1000 134V177H1055V221', (1055,221))
callout('BME680 (gas sensors)', 1242, 129, 'M1242 134V181H1263V236', (1263,236), '#3877a7')
callout('Livox Mid360', 1036, 351, 'M1036 336V309H1103V220', (1103,220), '#487d9f')
callout('ESP32', 1196, 351, 'M1196 336V286H1187V263', (1187,263), '#a67340')
svg.append('</g>')

badge(444, 445, '03', 'Reach, sample, localize')
crop(444, 474, 488, 224, '825 100 755 470')
rect(454, 666, 344, 24, '#fffffff0', r=4)
text(464, 683, 'Existing navigation test setting · GlocalNav', 13, '#3f596d', 550)
for y, number, title, sub in [
    (507,'1','Reach the inspection area','Follow traversable routes'),
    (586,'2','Sample at multiple positions','Record gas response and position'),
    (665,'3','Refine the candidate source region','Provide leads for professional review'),
]:
    svg.append(f'<circle cx="974" cy="{y-7}" r="12" fill="#dfebf3"/>')
    text(974,y-2,number,12,'#33769b',650,'middle')
    text(1001,y,title,20,'#344e63',600)
    text(1001,y+25,sub,16,'#708295')
    if number!='3':
        path(f'M974 {y+13}V{y+48}', '#bfd0dc', 1.5)

badge(48, 445, '04', 'Hand over source leads')
for x, name, label in [(48,'location','Location lead'),(211,'target','Visual target')]:
    rect(x, 472, 147, 150, '#fff', '#d9e4ec', 5)
    svg.append(f'<image x="{x+3}" y="475" width="141" height="144" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,{leads[name]}"/>')
    text(x+73.5,644,label,17,'#263f53',600,'middle')
text(48,675,'Link position, observations and targets',16)
text(48,701,'Illustrative leads · Professional review',15,'#6e7e8d')
svg.append('</svg>')
# Hardware model names remain unchanged in both languages.
chinese = {
    'Cross-floor inspection: from task to source leads': '跨楼层巡检：从任务到来源线索',
    'Define an inspection task, combine mobility with gas sensing, reach and sample indoor areas, and hand over location and visual leads for professional review. The quadruped hardware is shown horizontally with English annotations.': '明确巡检任务，结合跨楼层通行与气体感知，到达室内区域并采样，向专业人员交接位置与视觉线索。四足平台横向展示，配有硬件标注。',
    'PROPOSED INTEGRATION': '拟集成方案',
    'Define the task': '明确巡检任务',
    'Inspect a defined indoor area.': '检查指定室内区域，寻找异常来源',
    'Target · Access · Review': '目标样本 · 允许路线 · 复核要求',
    'Mobility + gas sensing': '跨层通行与气体感知',
    'Multi-level mobility': '跨楼层自主通行',
    'Traverse stairs and reach sampling sites': '通过楼梯，到达采样位置',
    'Mobile gas observations': '移动气体感知',
    'Collect samples and refine source leads': '采集多位置观测，缩小来源范围',
    'BME680 (gas sensors)': 'BME680（气体传感器）',
    'Reach, sample, localize': '跨层到达、采样与定位',
    'Existing navigation test setting · GlocalNav': '已有导航实验场景 · GlocalNav',
    'Reach the inspection area': '到达检查区域',
    'Follow traversable routes': '沿可通行路径移动',
    'Sample at multiple positions': '在不同位置采样',
    'Record gas response and position': '记录气体响应与位置',
    'Refine the candidate source region': '逐步缩小候选来源范围',
    'Provide leads for professional review': '形成供专业人员复核的线索',
    'Hand over source leads': '交接来源线索',
    'Location lead': '位置线索',
    'Visual target': '现场目标识别',
    'Link position, observations and targets': '关联位置、观测与候选目标',
    'Illustrative leads · Professional review': '线索示例 · 由专业人员复核',
}
for lang in ('zh','en'):
    content = ''.join(svg)
    if lang == 'zh':
        for original, translated in chinese.items():
            content = content.replace(f'>{escape(original)}<', f'>{escape(translated)}<')
    (ROOT / f'static/images/mission-{lang}.svg').write_text(content)
