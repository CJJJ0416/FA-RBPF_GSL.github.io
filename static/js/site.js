"use strict";
(() => {
  const english = {
    "hero.eyebrow": "PUBLIC-SPACE SAFETY · MOBILE ROBOTICS · INTERDISCIPLINARY RESEARCH",
    "hero.title": "Robotic Inspection for Explosive <br class=\"desktop-break\">and Chemical Threat Prevention",
    "hero.subtitle": "Autonomous inspection and hazard source localization <br>in public indoor and multi-level environments",
    "hero.status": "Research proposal · Open for interdisciplinary collaboration",
    "button.outline": "Proposal Outline", "button.plan": "Research Plan", "button.join": "Join the Research",
    "hero.caption": "Research concept: sample across indoor and multi-level environments, narrow down possible sources, and provide evidence for professional review.",
    "hero.handover": "Open original images: <a href=\"./static/images/research/quadruped-inspection-hardware.png\" target=\"_blank\" rel=\"noopener noreferrer\">Quadruped hardware setup</a> · Illustrative handover leads: <a href=\"./static/images/research/handover-location.png\" target=\"_blank\" rel=\"noopener noreferrer\">Source location</a> · <a href=\"./static/images/research/handover-target.png\" target=\"_blank\" rel=\"noopener noreferrer\">Valve and flange detections</a>.",
    "hero.note": "Composition inspired by <a href=\"https://arxiv.org/abs/2605.19958\" target=\"_blank\" rel=\"noopener noreferrer\">TravExplorer · Fig. 1</a> and redrawn for this proposal. Scene photos show existing GlocalNav navigation experiments; gas-inspection integration and validation are proposed work.",
    "nav.abstract": "Abstract", "nav.scenarios": "Scenarios", "nav.method": "Approach", "nav.foundation": "Foundation", "nav.validation": "Validation", "nav.team": "Team",
    "abstract.title": "Abstract",
    "abstract.p1": "This proposal addresses explosive and chemical threat prevention in public spaces such as railway stations, metro stations, and airports. It aims to combine autonomous indoor and multi-level navigation, target-appropriate gas sensing, and active source localization. By collecting observations at multiple locations, a mobile robot would help identify suspicious signals, narrow down possible sources, and provide evidence for professional review.",
    "abstract.p2": "The research focuses on reliable signal detection, spatially constrained active sampling, source uncertainty estimation, and usable task handover. The initial scope is one indoor area, one defined target category, and a single-robot prototype. Signal observability will be established before evaluating end-to-end performance in controlled experiments and a partner setting.",
    "abstract.scope": "Research stage: detection and localization of public-space target substances require separate validation. Existing indoor ethanol experiments provide a technical starting point. Final assessment and response remain with qualified personnel.",
    "viewer.explore": "Explore the space",
    "viewer.help": "Drag to orbit · Scroll / pinch to zoom", "viewer.top": "Top", "viewer.reset": "Reset",
    "viewer.cutaway": "Indoor space · Conceptual cutaway",
    "viewer.credit": "Original spatial concepts with CC0 transport assets; not engineering CAD of an actual facility.",
    "viewer.sources": "Model sources ↗",
    "scenarios.title": "Tasks in Public Indoor Spaces",
    "scenarios.intro": "Begin with an area that permits access, sampling, and independent source verification. Define the first task together with a partner.",
    "scenario.metro": "Metro", "scenario.rail": "High-speed Rail", "scenario.airport": "Airport", "scenarios.diagram": "Illustrative indoor task area",
    "method.title": "Proposed Research Approach", "method.intro": "Connect target sensing, movement decisions, and source estimation into a continuous inspection process.",
    "q1.title": "Which signals can be detected reliably?", "q1.text": "Define the target and background, then evaluate cross-sensitivity, humidity, temperature, baseline variation, and sensor dynamics to establish repeatable measurements.",
    "q2.title": "Where should the robot sample next?", "q2.text": "Combine travel time, floor connectivity, reachability, and information gain. Compare active sampling with a fixed inspection route.",
    "q3.title": "How can the source region be narrowed?", "q3.text": "Combine gas observations, robot poses, spatial geometry, and available airflow information to update source estimates while retaining uncertainty.",
    "q4.title": "How can others verify the findings?", "q4.text": "Associate possible sources with inspectable objects. Provide time, location, observations, and unobserved areas, then assess usefulness for the receiving professionals.",
    "foundation.title": "Existing Research Foundation",
    "foundation.intro": "Two existing studies provide complementary experience in indoor mobility and gas source localization, forming a starting point for integration and validation in this proposal.",
    "navStudy.title": "GlocalNav · Autonomous Indoor and Multi-level Navigation",
    "navStudy.lead": "Existing research addresses quadruped movement through three-dimensional indoor environments, including corridors, narrow doorways, and stairs with obstacles. It provides a mobility foundation for reaching inspection areas, crossing floor connections, and executing sampling tasks.",
    "navStudy.tag1": "Multi-level mobility",
    "navStudy.tag2": "Indoor obstacle avoidance",
    "navStudy.tag3": "Hardware experiments",
    "navStudy.scenesAlt": "GlocalNav hardware experiment scenes: a corridor, stairs, a narrow doorway, and the Go2 EDU platform",
    "navStudy.scenesCaption": "Physical settings and platform: corridor, stairs, narrow doorway, and quadruped robot. Source: GlocalNav experimental-scene figure. Click to enlarge.",
    "navStudy.videoAlt": "GlocalNav stair experiment used as the preview image for the multi-level inspection demonstration link",
    "navStudy.videoTitle": "Multi-level Inspection Demo",
    "navStudy.videoAction": "Watch on Bilibili ↗",
    "navStudy.videoCaption": "Preview image: GlocalNav stair obstacle-avoidance experiment. The window opens the demonstration on Bilibili in a new tab.",
    "navStudy.figureLink": "View the complete stair experiment figure ↗",
    "study.platform": "Research platform",
    "study.evidence": "Existing experiments",
    "study.relevance": "Relevance to this proposal",
    "navStudy.platform": "Unitree Go2 EDU, Livox Mid360, and Jetson Orin NX onboard computing.",
    "navStudy.evidence": "The manuscript reports three physical settings with 10 trials per setting. Stair trials still include failures associated with perception blind spots.",
    "navStudy.relevance": "A navigation foundation for moving between inspection areas, traversing floor connections, and reaching sampling positions.",
    "navStudy.repo": "Gitee · Multi-level Inspection Project",
    "navStudy.watch": "Watch the demonstration ↗",
    "gasStudy.process": "<strong>Spatial information gathered during exploration carries forward into localization.</strong> Before a gas signal is confirmed, the robot explores traversable areas and retains records of visited locations and spatial connectivity. After detection, those records help establish candidate source regions. Subsequent movement gathers additional observations to reduce source uncertainty and produce a position estimate, continuing beyond the first sensor response.",
    "gasStudy.tableCaption": "Records from two hardware runs using an ethanol source",
    "gasStudy.metric": "Recorded measure",
    "gasStudy.trial1": "Run 1",
    "gasStudy.trial2": "Run 2",
    "gasStudy.duration": "Trajectory-record duration",
    "gasStudy.travel": "Total distance travelled",
    "gasStudy.error": "Distance from estimate to placed source",
    "gasStudy.measurement": "Source placement has approximately 0.3 m uncertainty: the 0.08 m discrepancy indicates agreement with the placed source, not demonstrated centimetre-level accuracy. Recorded durations are not independently verified automatic localization times, and two runs do not establish a repeatable success rate. The sensor supplies relative MOX responses rather than calibrated target-gas concentrations.",
    "gasStudy.simulationLead": "Alongside the hardware feasibility study, simulations use single-room, multi-room, and office layouts to examine search before gas detection, source estimation after detection, and complete tasks in more complex spaces. The environments below show the spatial scope of these tests.",
    "gasStudy.title": "Indoor Gas Source Localization",
    "gasStudy.lead": "This research asks a concrete question: <strong>once a robot encounters a gas anomaly indoors, how can it find where the gas is being released?</strong> The existing work takes measurements at different locations, associates gas responses with positions on a map, and uses those observations to estimate a source location for further inspection.",
    "gasStudy.platform": "The experimental system below combines a wheeled robot, a BME680 metal-oxide gas sensor, Livox Mid360 LiDAR, and Jetson onboard computing. A controlled ethanol release serves as the experimental source. As the robot moves, it records gas responses and its position; the resulting source estimate is then compared with the known source location.",
    "gasStudy.hardwareAlt": "Wheeled gas-sensing platform, controlled ethanol source, and two indoor source placements",
    "gasStudy.hardwareCaption": "Experimental system and setting: the mobile sensing platform, ethanol release source, and indoor environments for two source placements. Click to enlarge.",
    "gasStudy.evidence": "<strong>Both hardware runs progressed from exploration to source-position estimation and produced estimates near the placed sources.</strong> The table below shows what was recorded in these runs. A separate baseline run exhausted its exploration targets without entering localization, illustrating why visiting visible space alone does not ensure sufficient gas observations.",
    "gasStudy.simulationAlt": "Single-room, multi-room, and office simulation layouts for indoor gas source localization",
    "gasStudy.simulationCaption": "Simulation layouts, left to right: a single room, multiple rooms, and an office. These support indoor search studies and do not represent a deployment in a transport facility.",
    "gasStudy.relevance": "For this proposal, the contribution is an <strong>experimental foundation for mobile sampling and source-position estimation</strong>. The next step is to combine it with GlocalNav’s multi-level mobility so that a robot can reach different inspection areas and collect measurements. The current hardware study uses a wheeled platform and ethanol; integration with a quadruped, and sensing and localization of explosive or chemical threat targets, still require validation.",
    "gasStudy.source": "Figures and descriptions are based on the experimental system, test settings, and run records in From Exploration Memory to Source Belief.",
    "foundation.bridge": "<strong>Next step:</strong> define the target and pilot conditions, integrate multi-level mobility with target-adapted sensing and active sampling, and evaluate complete inspection tasks and professional handover.",
    "validation.title": "Validation and Deliverables",
    "phase1.title": "Define the Task", "phase1.text": "Agree on the setting, target, inspection process, and source verification with a partner.", "phase1.output": "Task definition and needs evidence",
    "phase2.title": "Establish Observability", "phase2.text": "Compare target, background, and interference samples with reference measurements across dates.", "phase2.output": "Sample data and sampling protocol",
    "phase3.title": "Integrate the Robot", "phase3.text": "Connect navigation, active sampling, source estimation, and complete task records.", "phase3.output": "Single-robot prototype and comparisons",
    "phase4.title": "Review in Context", "phase4.text": "Run repeated small-scale trials and gather feedback from the professionals receiving the results.", "phase4.output": "Validation report and handover format",
    "validation.metrics": "<strong>Evaluation:</strong> detection across independent tasks, false alarms, localization error across all trials, time to a usable handover, and professional verification outcomes.",
    "validation.conditions": "Initial experiments use non-hazardous substitutes under controlled conditions. Target validation, pilot conditions, and acceptance criteria will be defined with qualified partners.",
    "team.title": "Looking for Research Collaborators", "team.intro": "Bring your experience to help establish a concrete task, reliable measurements, and an integrated robotic system.",
    "team.robotics": "Robotics and Artificial Intelligence", "team.roboticsText": "Indoor navigation, active planning, probabilistic estimation, and system integration.",
    "team.materials": "Advanced Materials and Gas Sensing", "team.materialsText": "MOX or electronic noses, material emissions, sampling, calibration, and reference analysis.",
    "team.data": "Data Science and Experimental Analysis", "team.dataText": "Time-series observations, anomaly detection, data protocols, and independent validation.",
    "team.transport": "Transport Operations and Public Safety", "team.transportText": "Real-world needs, site partnerships, professional detection, and review procedures.",
    "team.contact": "Start a Conversation on GitHub", "team.download": "Download the English outline ↓",
    "share.title": "Share the Project", "share.copy": "Copy Summary",
    "share.summary": "We are developing a mobile-robot research proposal for explosive and chemical threat prevention in public spaces, combining indoor multi-level navigation, gas sensing, and active source localization to provide verifiable source leads for qualified personnel. We welcome collaborators in robotics, advanced materials and sensing, data science, transport, and public safety.",
    "references.title": "Related Research and Sources", "references.bosch": "Bosch Sensortec: official BME680 information", "references.internal": "Research materials: experimental settings, platforms, and validation descriptions from GlocalNav and From Exploration Memory to Source Belief. Hardware and simulation scopes are described separately in the Research Foundation section.",
    "contribution.title": "Contribution", "contribution.role": "Project concept and proposal writing; research on robotic navigation and gas source localization.",
    "footer.status": "Research proposal · 2026", "footer.credit": "Layout inspired by", "footer.and": "and", "footer.original": "Independently implemented. Concept diagrams were created for this project; experimental images come from the supplied research manuscripts.", "footer.logo": "University logo source: "
  };
  const scenarioData = {
    metro: {index: "01 / METRO", zh: ["站内设备与维护空间", "围绕经授权进入的设备间、维护通道及相邻楼层，研究异常观测的复测与来源范围缩小。", "试点输入：具体检查任务、目标样本、常见干扰、允许采样的位置及专业复核方式。"], en: ["Station Equipment and Maintenance Areas", "Study repeated measurements and source-region narrowing in authorized equipment rooms, maintenance passages, and connected floors.", "Pilot inputs: a concrete task, target samples, common interference, permitted sampling locations, and professional verification."]},
    rail: {index: "02 / HIGH-SPEED RAIL", zh: ["多层站房中的指定检查区域", "以合作方确定的运维区域为起点，研究楼层连通、通行开销与采样信息收益之间的关系。", "试点输入：允许通行的路线、明确目标与背景条件，以及能够确认实际来源的检查流程。"], en: ["Selected Areas in a Multi-level Station", "Start with a partner-defined operations area and study the relationship between floor connectivity, travel costs, and sampling information gain.", "Pilot inputs: permitted routes, a defined target and background, and a process for checking the true source."]},
    airport: {index: "03 / AIRPORT", zh: ["经授权的室内后勤与设施区域", "在选定区域探索疑似危险信号的异常复测、候选来源定位及与专业检查流程的衔接。", "试点输入：具体业务任务、采样准入条件、干扰样本和接手人员所需的证据字段。"], en: ["Authorized Indoor Service and Facility Areas", "Explore anomaly rechecks, candidate-source localization, and handover to professional inspection within a selected area.", "Pilot inputs: an operational task, sampling access, interference samples, and the evidence needed by the receiving team."]}
  };
  const nodes = [...document.querySelectorAll("[data-i18n]")];
  const chinese = Object.fromEntries(nodes.map(node => [node.dataset.i18n, node.innerHTML]));
  const imageNodes = [...document.querySelectorAll("[data-i18n-alt]")];
  const chineseAlts = new Map(imageNodes.map(node => [node, node.alt]));
  let language = "zh";
  let scenario = "metro";
  function updateScenario() {
    const current = scenarioData[scenario];
    const copy = current[language];
    document.getElementById("scenario-index").textContent = current.index;
    ["scenario-title", "scenario-text", "scenario-condition"].forEach((id, i) => { document.getElementById(id).textContent = copy[i]; });
    document.getElementById("scenario-panel").setAttribute("aria-labelledby", `tab-${scenario}`);
    document.querySelectorAll("[data-scenario]").forEach(button => {
      const selected = button.dataset.scenario === scenario;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    window.dispatchEvent(new CustomEvent("proposal:scenario", { detail: { scenario, language } }));
  }
  function setLanguage(next) {
    language = next;
    const dictionary = next === "en" ? english : chinese;
    nodes.forEach(node => { node.innerHTML = dictionary[node.dataset.i18n] ?? chinese[node.dataset.i18n]; });
    imageNodes.forEach(node => { node.alt = next === "en" ? english[node.dataset.i18nAlt] : chineseAlts.get(node); });
    document.documentElement.lang = next === "en" ? "en" : "zh-CN";
    document.title = next === "en" ? "Public-Space Safety · Red bird project" : "公共空间防爆防化自主巡检与危险源定位 · Red bird project";
    const toggle = document.getElementById("language-toggle");
    toggle.setAttribute("aria-label", next === "en" ? "切换为中文" : "Switch to English");
    toggle.setAttribute("aria-pressed", String(next === "en"));
    document.querySelectorAll("[data-outline-link]").forEach(link => {
      link.href = `./static/docs/proposal-outline-${next}.md`;
    });
    document.getElementById("concept-image").src = `./static/images/mission-${next}.svg`;
    document.getElementById("concept-image").alt = next === "en" ? "Concept diagram of mobile sampling, active source localization, and evidence handover in public indoor spaces" : "公共交通室内空间中，机器人巡检、气体感知、主动溯源与专业复核的研究概念图";
    document.getElementById("architecture-image").src = `./static/images/architecture-${next}.svg`;
    document.getElementById("architecture-image").alt = next === "en" ? "Proposed pipeline from measurements through detection and active sampling to source estimation and evidence handover" : "目标采样、异常检测、主动采样、源位置估计和证据交接的研究架构";
    document.getElementById("copy-status").textContent = "";
    updateScenario();
    try { localStorage.setItem("proposal-language", next); } catch { /* The page also works without browser storage. */ }
  }
  document.getElementById("language-toggle").addEventListener("click", () => setLanguage(language === "zh" ? "en" : "zh"));
  const tabs = [...document.querySelectorAll("[data-scenario]")];
  tabs.forEach((button, index) => {
    button.addEventListener("click", () => { scenario = button.dataset.scenario; updateScenario(); });
    button.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      scenario = tabs[next].dataset.scenario;
      updateScenario();
      tabs[next].focus();
    });
  });
  document.getElementById("copy-summary").addEventListener("click", async () => {
    const summary = document.getElementById("share-summary");
    const text = `${summary.textContent.trim()}\n\nhttps://cjjj0416.github.io/FA-RBPF_GSL.github.io/`;
    const status = document.getElementById("copy-status");
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = language === "en" ? "Summary and project link copied." : "已复制项目简介和网页链接。";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(summary);
      const selection = window.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      status.textContent = language === "en" ? "Summary selected. Use your browser’s Copy command." : "已选中简介，可使用浏览器的复制功能。";
    }
  });
  let preferred = "zh";
  try { if (localStorage.getItem("proposal-language") === "en") preferred = "en"; } catch { /* Default to Chinese. */ }
  setLanguage(preferred);
})();
