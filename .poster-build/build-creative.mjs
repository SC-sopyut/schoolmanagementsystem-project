import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Presentation, PresentationFile } from '@oai/artifact-tool';
const wd = process.cwd(),
    bd = path.join(wd, '.poster-build'),
    a = path.join(bd, 'assets'),
    skill =
        'C:/Users/corsi/.codex/plugins/cache/openai-primary-runtime/presentations/26.1015.12040/skills/presentations',
    out = path.join(
        wd,
        'poster-output',
        'CouncilForge_3x8ft_Portrait_Creative.pptx',
    ),
    py =
        'C:/Users/corsi/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const W = 1728,
    H = 4608,
    C = {
        dark: '#062E20',
        green: '#057B49',
        mint: '#54D89A',
        lime: '#D9F3A5',
        cream: '#FFFDF1',
        paper: '#F2F7EC',
        gold: '#E6B331',
        purple: '#7444A7',
        blue: '#1273B6',
        coral: '#E55E47',
        line: '#B8D9C2',
        muted: '#507062',
    };
const p = Presentation.create({ slideSize: { width: W, height: H } }),
    s = p.slides.add();
s.background.fill = C.paper;
function b(x, y, w, h, f = C.cream, r = 'rounded-xl', l = 'none') {
    const q = {
        geometry: r === 'none' ? 'rect' : 'roundRect',
        position: { left: x, top: y, width: w, height: h },
        fill: f,
        line: { style: 'solid', fill: l, width: l === 'none' ? 0 : 2 },
    };
    if (r !== 'none') q.borderRadius = r;
    return s.shapes.add(q);
}
function t(v, x, y, w, h, z = 24, c = C.dark, strong = false, align = 'left') {
    const q = s.shapes.add({
        geometry: 'textbox',
        position: { left: x, top: y, width: w, height: h },
        fill: 'none',
        line: { style: 'solid', fill: 'none', width: 0 },
    });
    q.text = v;
    q.text.style = {
        fontFamily: 'Aptos',
        fontSize: z,
        color: c,
        bold: strong,
        paragraphAlignment: align,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
    };
    return q;
}
function dot(x, y, n, c = C.green) {
    b(x, y, 72, 72, c, 'rounded-full', c);
    t(n, x, y + 17, 72, 36, 27, C.cream, true, 'center');
}
function bar(n, title, y, c = C.dark) {
    b(64, y, 1600, 82, c, 'rounded-xl', c);
    t(n, 96, y + 20, 58, 34, 22, C.lime, true);
    t(title, 170, y + 17, 1390, 40, 28, C.cream, true);
}
function card(x, y, w, h, n, title, body, c = C.green) {
    b(x, y, w, h, C.cream, 'rounded-xl', C.line);
    dot(x + 28, y + 26, n, c);
    t(title, x + 120, y + 32, w - 145, 30, 22, C.dark, true);
    t(body, x + 32, y + 112, w - 64, h - 130, 18, C.muted);
}
async function im(n, x, y, w, h) {
    const f = await fs.readFile(path.join(a, n)),
        q = f.buffer.slice(f.byteOffset, f.byteOffset + f.byteLength);
    s.images.add({
        blob: q,
        contentType: 'image/png',
        alt: n,
        fit: 'cover',
        position: { left: x, top: y, width: w, height: h },
        geometry: 'roundRect',
        borderRadius: 'rounded-lg',
    });
}
// asymmetrical hero
b(0, 0, W, 700, C.dark, 'none');
b(0, 650, W, 50, C.gold, 'none');
b(1030, 0, 698, 650, C.green, 'none');
dot(86, 80, 'ACC', C.gold);
t('ABUYOG COMMUNITY COLLEGE', 184, 93, 700, 28, 24, C.cream, true);
t('STUDENT COUNCIL\nMANAGEMENT SYSTEM', 84, 220, 1000, 150, 58, C.cream, true);
t('COUNCILFORGE', 88, 405, 580, 32, 23, C.mint, true);
t(
    'A civic-tech platform for accountable student leadership',
    88,
    452,
    860,
    40,
    25,
    '#D9EBDC',
);
t(
    'Group Members\nSophia Corsiga  ·  Princess Lhea Cominador\nEvanlloyd Bandolin\n\nAdviser\nRichie A. Cabangon, MSc IT',
    1100,
    125,
    520,
    230,
    21,
    C.cream,
    true,
);
t('3 FT × 8 FT  /  PORTRAIT', 1100, 490, 480, 28, 19, C.lime, true);
// focus quote
b(64, 760, 1600, 250, C.cream, 'rounded-xl', C.line);
t('THE PROBLEM', 104, 800, 280, 26, 19, C.green, true);
t(
    'Council work becomes difficult to track when tasks, files, concerns, and decisions are scattered across separate channels.',
    104,
    850,
    1430,
    94,
    33,
    C.dark,
    true,
);
t(
    'CouncilForge brings student participation and council operations into one visible, role-aware system.',
    104,
    951,
    1400,
    28,
    20,
    C.muted,
);
bar('01', 'SYSTEM AGENDA', 1060, C.green);
[
    [
        'Transparent operations',
        'Task, budget, document, and activity records stay visible.',
    ],
    [
        'Timely student response',
        'Concerns, updates, and event participation follow clear workflows.',
    ],
    [
        'Responsible governance',
        'Role-aware access and audit records protect sensitive actions.',
    ],
].forEach((r, i) => {
    const x = 64 + i * 535;
    dot(x + 34, 1175, ['◉', '◷', '▣'][i], [C.blue, C.green, C.gold][i]);
    t(r[0], x + 34, 1270, 430, 28, 22, C.dark, true);
    t(r[1], x + 34, 1310, 450, 55, 19, C.muted);
});
bar('02', 'OBJECTIVES + SDGs', 1410, C.purple);
[
    ['Organize', 'Council work, events, budgets, documents, and voting.'],
    ['Participate', 'Students see updates and submit protected concerns.'],
    ['Oversee', 'Administrators verify accounts and audit access.'],
].forEach((r, i) => {
    const x = 64 + i * 535;
    b(x, 1518, 500, 210, C.cream, 'rounded-xl', C.line);
    t(
        '0' + (i + 1),
        x + 30,
        1550,
        65,
        55,
        42,
        [C.green, C.purple, C.gold][i],
        true,
    );
    t(r[0], x + 120, 1558, 330, 28, 24, C.dark, true);
    t(r[0] + '\n' + r[1], x + 120, 1600, 340, 80, 18, C.muted);
});
[
    ['4', 'Quality Education', C.coral],
    ['9', 'Innovation & Infrastructure', C.gold],
    ['16', 'Strong Institutions', C.blue],
].forEach((r, i) => {
    const x = 64 + i * 535;
    b(x, 1760, 500, 100, r[2], 'rounded-lg', r[2]);
    t('SDG ' + r[0], x + 28, 1782, 100, 23, 17, C.cream, true);
    t(r[1], x + 155, 1780, 310, 28, 19, C.cream, true);
});
bar('03', 'KEY FEATURES', 1915, C.dark);
const f = [
    ['▤', 'Task boards', 'Assign, monitor, and review work.', C.green],
    ['◷', 'Events', 'Publish activities and track joins.', C.blue],
    ['!', 'Concerns', 'Receive and resolve student issues.', C.coral],
    ['◆', 'Voting', 'Run organized student decisions.', C.purple],
    ['₱', 'Budget', 'Track allocations and balances.', C.gold],
    ['▥', 'Documents', 'Keep council files accessible.', C.green],
];
f.forEach((r, i) =>
    card(
        64 + (i % 2) * 810,
        2025 + Math.floor(i / 2) * 190,
        770,
        160,
        r[0],
        r[1],
        r[2],
        r[3],
    ),
);
bar('04', 'SYSTEM BLUEPRINT', 2630, C.green);
b(64, 2740, 760, 515, C.dark, 'rounded-xl', C.dark);
t('Architecture', 108, 2785, 450, 32, 26, C.cream, true);
[
    ['Users', 'Students  ·  Officers  ·  OSA/Admin'],
    ['Platform', 'Role-aware modules and dashboards'],
    ['Services', 'Authentication  ·  Workflows  ·  Notifications'],
    ['Records', 'Accounts  ·  Organizations  ·  Audit logs'],
].forEach((r, i) => {
    const y = 2855 + i * 83;
    b(
        110,
        y,
        190,
        48,
        i === 0 ? C.gold : '#0D5536',
        'rounded-lg',
        i === 0 ? C.gold : '#0D5536',
    );
    t(r[0], 130, y + 13, 150, 21, 17, C.cream, true, 'center');
    t(r[1], 335, y + 12, 420, 24, 18, '#D5E8D7');
    if (i < 3) t('↓', 175, y + 48, 45, 27, 20, C.mint, true, 'center');
});
b(850, 2740, 814, 515, C.cream, 'rounded-xl', C.line);
t('RBAC & Security Flow', 894, 2785, 600, 32, 26, C.dark, true);
[
    ['1', 'Sign in', C.green],
    ['2', 'Verify identity', C.blue],
    ['3', 'Check role', C.purple],
    ['4', 'Allow action', C.gold],
].forEach((r, i) => {
    const x = 890 + i * 190;
    dot(x, 2865, r[0], r[2]);
    t(r[1], x - 20, 2950, 115, 24, 16, C.dark, true, 'center');
    if (i < 3) t('›', x + 115, 2880, 35, 35, 27, C.green, true, 'center');
});
t(
    'Permissions limit each user to the correct scope. Separate administrator access, account verification, anonymous concerns, and logged identity reveals protect sensitive actions.',
    894,
    3025,
    690,
    110,
    20,
    C.muted,
);
bar('05', 'DEVELOPMENT METHOD + USER ROLES', 3310, C.purple);
[
    ['1', 'Discover'],
    ['2', 'Design'],
    ['3', 'Build'],
    ['4', 'Test'],
    ['5', 'Refine'],
].forEach((r, i) => {
    const x = 125 + i * 300;
    dot(x, 3430, r[0], [C.green, C.blue, C.purple, C.gold, C.green][i]);
    t(r[1], x - 35, 3520, 142, 25, 20, C.dark, true, 'center');
    if (i < 4) t('›', x + 185, 3444, 36, 34, 27, C.green, true, 'center');
});
[
    ['Student', 'Submit concerns, join events, view announcements.', C.green],
    ['Officer', 'Manage tasks, members, budgets, and activities.', C.blue],
    ['President', 'Coordinate organization-wide council operations.', C.purple],
    [
        'Administrator',
        'Verify accounts, oversee records, and audit access.',
        C.gold,
    ],
].forEach((r, i) => {
    const y = 3605 + i * 55;
    t('●', 110, y, 28, 24, 17, r[2], true);
    t(r[0], 158, y, 230, 25, 20, C.dark, true);
    t(r[1], 420, y, 1100, 25, 19, C.muted);
});
bar('06', 'SYSTEM SCREENSHOTS', 3875, C.dark);
await im('landing.png', 64, 3985, 490, 175);
await im('council-dashboard.png', 584, 3985, 490, 175);
await im('student-dashboard.png', 1104, 3985, 490, 175);
await im('login.png', 64, 4190, 490, 175);
await im('admin-dashboard.png', 584, 4190, 490, 175);
b(1104, 4190, 490, 175, C.green, 'rounded-lg', C.green);
t(
    'Students\nCouncils\nAdministration',
    1145,
    4230,
    380,
    86,
    27,
    C.cream,
    true,
    'center',
);
b(0, 4425, W, 183, C.dark, 'none');
dot(82, 4478, 'ACC', C.gold);
t('ABUYOG COMMUNITY COLLEGE', 185, 4480, 760, 30, 24, C.cream, true);
t(
    'CouncilForge Student Council Management System',
    185,
    4521,
    820,
    24,
    17,
    '#D9EBDC',
);
t(
    'Designed by Sophia Corsiga, Princess Lhea Cominador, and Evanlloyd Bandolin\nAdviser: Richie A. Cabangon, MSc IT',
    990,
    4483,
    640,
    54,
    17,
    C.cream,
    true,
);
const { finalizePresentation } = await import(
    pathToFileURL(
        path.join(skill, 'container_tools', 'artifact_tool_utils.mjs'),
    ).href
);
const st = path.join(bd, 'finalizer');
await fs.mkdir(st, { recursive: true });
await fs.mkdir(path.dirname(out), { recursive: true });
const cp = path.join(st, 'candidate-creative.pptx');
await (await PresentationFile.exportPptx(p)).save(cp);
const res = await finalizePresentation({
    workspaceDir: wd,
    candidatePath: cp,
    finalPath: out,
    pythonExecutable: py,
    integrityValidatorPath: path.join(
        skill,
        'container_tools',
        'inspect_presentation_package_integrity.py',
    ),
    layoutValidatorPath: path.join(
        skill,
        'container_tools',
        'inspect_presentation_layout_geometry.py',
    ),
    layoutArgs: [
        '--expected-slide-size-emu',
        '16459200,43891200',
        '--validate-heading-fit',
    ],
    fontPolicy: { basis: 'design', families: ['Aptos'] },
    verifyArtifactToolImport: true,
    receiptPath: path.join(st, 'validation-creative.json'),
});
console.log(JSON.stringify(res, null, 2));
const png = await p.export({ slide: s, format: 'png', scale: 1 });
await fs.writeFile(
    path.join(bd, 'poster-creative-preview.png'),
    new Uint8Array(await png.arrayBuffer()),
);
