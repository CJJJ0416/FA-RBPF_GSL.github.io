# Autonomous Robotic Inspection and Hazard Source Localization for Explosive and Chemical Threat Prevention in Public Spaces

Project: Red bird project  
Version: Research proposal outline · 18 October 2026

This proposal combines autonomous indoor and multi-level navigation, target-appropriate gas sensing, and active source localization for public spaces such as railway stations, metro stations, and airports. A mobile robot would collect observations at multiple locations, investigate suspicious signals, narrow down possible sources, and provide records for professional review. The initial scope is one indoor area, one defined target category, and one robot. Signal observability will be established before evaluating inspection efficiency and the usefulness of the handover.

## 1. Background and Task Scope

### 1.1 Explosive and chemical threat prevention

The research concerns detecting, rechecking, localizing, and handing over suspicious signals associated with possible explosive or chemical hazards. Discussions with facility operators, safety managers, and qualified detection personnel will establish a concrete inspection task, including its trigger, current procedure, search cost, permitted area, and source verification method.

Odors and volatile signatures are candidate sensing cues. Their relationship to a specific threat requires representative samples and reference measurements. Preventing explosive threats is the application objective; the suitability of robot hardware and payloads for explosive atmospheres is a separate deployment requirement. These questions will be evaluated separately.

### 1.2 Indoor and multi-level environments

Initial settings may include authorized station operations and maintenance areas with rooms, stairs, steps, and connected floors. Existing navigation research supports mobile sampling. The study will examine travel costs, accessible sampling positions, and information gain. Multi-level mobility and gas transport between floors require separate validation.

### 1.3 Initial scope

- Task: robotic inspection and hazard source localization for explosive and chemical threat prevention in public spaces.
- Setting: one partner-provided indoor area suitable for research.
- Target: one signal or category with representative samples and independently verifiable ground truth.
- Platform: one robot using existing navigation and sensing interfaces.
- Experiments: begin with non-hazardous substitutes under controlled conditions; target-substance validation requires qualified partners and suitable facilities.
- Outputs: anomalous observations, possible source regions, candidate objects for inspection, and supporting evidence. Substance identity, concentration, and release-rate estimation require their own validation.

## 2. Problem Definition and Stakeholders

### 2.1 Central problem

Turning an anomalous gas observation into an actionable source lead requires reliable measurements, spatial reasoning, and an effective handover. The proposal asks how a robot can select informative inspection locations under limited sampling and constrained indoor movement, narrow down possible sources, and produce findings that professionals can verify.

### 2.2 Stakeholders

| Stakeholder | Main question | Information exchanged |
| --- | --- | --- |
| Facility operations and safety management | Which task merits a pilot, and how would it fit existing procedures? | Actual incidents, access constraints, workflow, acceptance criteria |
| Detection and response professionals | Where should they inspect next, and is the evidence sufficient? | Location estimates, observations, uncertainty, verification process |
| Routine inspection personnel | How can repeated searching be reduced while preserving practical judgment? | Existing routes, common interference, search history, outcomes |
| Materials and sensing researchers | Is the target signal observable, and what causes confusion? | Representative samples, reference analysis, response characteristics |
| Public and on-site staff | How can inspection fit normal use of the space? | Task arrangements compatible with access, privacy, and site management |

### 2.3 Needs evidence

Document concrete events: who notices the anomaly, how it is checked, how long the search takes, who receives the result, and how the source is confirmed. Distinguish interviews, second-hand accounts, site observations, and instrument measurements. Placeholder interviews in earlier coursework are not treated as completed empirical research.

## 3. Research Questions and Objectives

### Q1. Which signals can be detected reliably?

Under a defined target and background, determine whether emissions produce repeatable observational differences. Evaluate temperature, humidity, background shifts, cross-sensitivity, and sensor dynamics.

Outputs: target and interference samples, sampling procedures, reference measurements, sensor selection, and anomaly-detection baselines. Establish observability before adding classification or quantitative estimation.

### Q2. Where should the robot sample next?

Combine information gain, travel time, sampling dwell time, and reachability when selecting the next inspection position in environments containing rooms, stairs, and floor connections.

Outputs: an active-sampling module connected to existing navigation interfaces, records of aborted or evidence-limited tasks, and comparisons with fixed inspection routes.

### Q3. How can the possible source region be narrowed?

Combine gas observations, robot poses, environmental geometry, and available airflow information. Update possible source regions and identify insufficient evidence or model mismatch.

Outputs: source probabilities or candidate regions, repeated-observation consistency measures, localization errors, and failure analysis. Existing approaches such as RBPF-GSL provide reusable baselines; transport assumptions must be checked against the selected ventilation conditions.

### Q4. How can professionals verify and use the findings?

Translate mobile measurements and probabilistic estimates into understandable, checkable task results. Evaluate whether these results reduce unproductive inspections or shorten the time required to produce a useful source lead.

Outputs: records of time, position, raw observations, device identity, source region, uncertainty, and unobserved areas, together with feedback from receiving personnel.

## 4. Existing Research Foundation

### 4.1 Robot and navigation

Existing research materials describe a Go2 EDU platform with Livox Mid360 and Jetson computing hardware, together with indoor mapping, navigation, and multi-level planning. The GlocalNav manuscript provides a hierarchical global and local planning foundation. Suitability for the selected public-space routes will be evaluated separately.

### 4.2 Gas sensing and source localization

Existing work includes an ESP32/BME680 acquisition prototype and indoor source-localization research such as RBPF-GSL. Table 4.2 of the interim technical report records 10 indoor ethanol trials: 9 succeeded under the criterion that the final position was less than 1.5 m from the source; one failed trial had a 5.77 m error. These results describe the existing experimental conditions. Detection, identification, and localization of the proposed target substances require new evidence.

The BME680 raw gas measurement is a resistance value. Relative sensor responses and air-quality outputs must be distinguished from target-specific measurements. Claims about a particular substance, concentration, or hazard level require suitable calibration and reference detection.

### 4.3 Additional research evidence and public presentation

GlocalNav reports physical experiments in corridors, narrow doorways, and stairs, with 10 trials per setting. The website presents the experimental scenes, Go2 EDU platform, and stair obstacle-avoidance execution, with links to the [multi-level inspection project](https://gitee.com/fdsf3e2342/3d_navi_ros2) and [demonstration video](https://www.bilibili.com/video/BV1XtrTBrEcE/).

The hardware study in From Exploration Memory to Source Belief uses a wheeled platform with LiDAR, Jetson computing, and BME680 sensing. It records two runs producing source-position estimates and one baseline run ending before localization. These small-sample feasibility results must not be pooled with the older report's 10 trials to produce a new success rate. The manuscript also covers single-room, multi-room, and office simulation settings. Integration with quadruped multi-level navigation remains a future research task.

Public materials focus on tasks, platforms, experimental settings, and high-level capabilities. They exclude core algorithms, mathematical derivations, internal process diagrams, pseudocode, and parameter configurations.

### 4.4 Optional extensions

Visual recognition could associate candidate sources with facility objects. Airflow measurements or predictions could inform sampling. Include these extensions only if they improve the selected task. Source localization, classification, concentration-field reconstruction, and forecasting need distinct evaluation criteria.

## 5. Proposed Technical Approach

1. Define a concrete task with a transport or public-safety partner: event type, target, pilot area, and source verification.
2. Establish observability by comparing target samples, normal backgrounds, common interference, and mixtures against independent reference measurements.
3. Build an anomaly-detection baseline that accounts for temperature, humidity, sensor state, response and recovery lag, and background changes across dates; retain an unknown category.
4. Integrate navigation and active sampling, recording travel, dwell, measurement, and relocalization costs.
5. Update possible source regions and uncertainty from past and current observations; check consistency with repeat sampling.
6. Produce a handover linked to the map and inspectable objects, with records supporting professional review.

## 6. Potential Contributions and Comparative Evaluation

### 6.1 Candidate research contributions

- Combine indoor and multi-level mobility constraints with information-driven sampling to study whole-task efficiency.
- Develop a target-specific measurement and estimation process that addresses interference and sensor dynamics.
- Include source uncertainty, unobserved areas, and verification evidence in inspection results, and evaluate handover usefulness.

These are proposed contributions requiring literature comparison and experimental support. A transport setting alone does not establish methodological novelty or imply limited competition.

### 6.2 Comparisons

| Comparison | Question addressed |
| --- | --- |
| Current manual inspection procedure | Does the system reduce repeated searching and provide useful handover information? |
| Fixed monitoring locations or fixed-route mobile sampling | Does active selection of sampling positions improve task outcomes? |
| Gas observations alone versus added geometry or airflow information | Does additional information improve localization or failure recognition? |
| With versus without sensor-dynamics processing | Do timing alignment and response compensation improve mobile measurements? |

## 7. Validation Stages and Metrics

### 7.1 Needs and signal observability

Define the task, target and interference samples, reference measurements, and sensor selection. Progress depends on repeatable signals under accessible sampling conditions and independently checkable source ground truth.

### 7.2 Controlled robotic prototype

Integrate anomaly rechecks, active sampling, localization, and task records in an indoor environment with known ground truth. Vary source positions, robot starting positions, background conditions, and ventilation. Include target-absent tasks and record all failures.

### 7.3 Small-scale contextual validation

Run repeated trials across dates in a partner-approved area. Compare against the current procedure and fixed routes. Collect professional verification of the handover. Sample sizes and acceptance thresholds will follow preliminary data and partner requirements.

### 7.4 Evaluation metrics

- Detection: detection rate across independent target-present tasks, false-positive proportion in target-absent tasks, and false alarms per inspection hour.
- Identification: performance on the defined categories and handling of unknown or insufficient-evidence cases.
- Localization: error and source-region size across all tasks, success and failure counts, and failure causes.
- Efficiency: time from task trigger to usable handover, separating movement, sampling, and review time.
- Handover: connection to inspectable objects, repeated-search reduction, and professional verification outcomes.
- Operations: calibration, cleaning, drift checks, and sensor-replacement effort.

## 8. Interdisciplinary Team and Partnerships

| Work area | Relevant experience | Main outputs |
| --- | --- | --- |
| Robotics and AI | Indoor navigation, planning, probabilistic estimation, integration | Active-inspection prototype, source estimates, task logs |
| Materials and gas sensing | MOX/electronic noses, emissions, sampling, calibration, reference analysis | Observability assessment, measurement design, sample data |
| Data science | Time series, anomaly detection, experimental design, independent validation | Data protocols, detection models, evaluation reports |
| Transport and public safety | Operations, safety procedures, site liaison, professional detection | Concrete task, pilot conditions, verification process |

Hardware integration and cost assessment can be added as needed. These are functional roles; members may cover multiple areas. Specific responsibilities will follow team experience and the pilot task.

## 9. Expected Deliverables

1. A partner-confirmed inspection task for explosive and chemical threat prevention in a public space.
2. Sample data and sampling procedures for a defined target and interference conditions.
3. A single-robot prototype integrating navigation, active sampling, source estimation, and task recording.
4. A validation report covering all task outcomes, comparisons, and failure analysis.
5. A professional-reviewable source-lead and task-handover format.
6. A bilingual project website presenting objectives, existing evidence, validation plans, and collaboration needs.

## 10. Public Communication

The website prioritizes the proposal: task scope, candidate settings, research questions, existing foundation, validation, and participation. Concept diagrams are labeled as illustrations. Experimental results state the substance, setting, sample size, and success criterion. Individual contributions appear at the end. Raw interviews, actual security deployment maps, and unauthorized internal documents are excluded from public materials.

## 11. References and Evidence

- UCMP6050 assignments A1–A3: problem exploration, stakeholders, and handover needs. Earlier industrial scenarios provide background to the evolution of the task.
- Interim technical report, project two, integrated version 4: platform and methods, including the indoor ethanol trials in Table 4.2.
- GlocalNav research manuscript: hierarchical indoor navigation and multi-level planning foundation.
- [Bosch Sensortec: BME680 official information](https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme680/).
- [Ojeda et al., Robotic Gas Source Localization With Probabilistic Mapping and Online Dispersion Simulation, IEEE Transactions on Robotics, 2024](https://doi.org/10.1109/TRO.2024.3426368).
- [Railway Technical Research Institute, A Technique to Detect Overheated Switchboards with a Gas Density Detector, 2013](https://www.rtri.or.jp/eng/publish/newsletter/pdf/42/RTA-42-251.pdf). This precedent motivates investigating emissions from abnormal materials; it does not validate this proposal's target recognition or deployment.

## Contribution

Jinhao Chen: project concept and proposal writing; research on robotic navigation and gas source localization.
