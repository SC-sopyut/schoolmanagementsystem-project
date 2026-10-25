import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const workspaceDir = process.cwd();
const skillDir =
    'C:/Users/corsi/.codex/plugins/cache/openai-primary-runtime/presentations/26.1015.12040/skills/presentations';
const buildDir = path.join(workspaceDir, '.poster-build');
const assets = path.join(buildDir, 'assets');
const finalPath = path.join(
    workspaceDir,
    'poster-output',
    'CouncilForge_Academic_Project_Poster_3x8ft_Final.pptx',
);
const nodePython =
    'C:/Users/corsi/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';

const W = 4608,
    H = 1728;
const C = {
    ink: '#081A10',
    panel: '#102A1A',
    panel2: '#123821',
    green: '#159447',
    mint: '#71E0A0',
    teal: '#00B987',
    cream: '#F8F5DF',
    muted: '#BED5C3',
    lime: '#C9DD8A',
    blue: '#2BB9ED',
    orange: '#FF9A25',
    purple: '#9B6BFF',
    line: '#366746',
    sdg4: '#C5192D',
    sdg9: '#FD6925',
    sdg16: '#00689D',
};
const p = Presentation.create({ slideSize: { width: W, height: H } });
const s = p.slides.add();
s.background.fill = C.ink;

function box(x, y, w, h, fill = C.panel, radius = 'rounded-xl', line = 'none') {
    const spec = {
        geometry: radius === 'none' ? 'rect' : 'roundRect',
        position: { left: x, top: y, width: w, height: h },
        fill,
        line: { style: 'solid', fill: line, width: line === 'none' ? 0 : 2 },
    };
    if (radius !== 'none') spec.borderRadius = radius;
    return s.shapes.add(spec);
}
function text(
    t,
    x,
    y,
    w,
    h,
    size = 30,
    color = C.cream,
    bold = false,
    align = 'left',
) {
    const q = s.shapes.add({
        geometry: 'textbox',
        position: { left: x, top: y, width: w, height: h },
        fill: 'none',
        line: { style: 'solid', fill: 'none', width: 0 },
    });
    q.text = t;
    q.text.style = {
        fontFamily: 'Aptos',
        fontSize: size,
        color,
        bold,
        paragraphAlignment: align,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
    };
    return q;
}
function section(title, icon, x, y, w, h) {
    box(x, y, w, h, C.panel, 'rounded-xl', C.line);
    text(icon, x + 28, y + 25, 68, 46, 32, C.mint, true);
    text(title, x + 108, y + 26, w - 136, 46, 31, C.cream, true);
    return { x, y, w, h };
}
function bullet(t, x, y, w, size = 24, color = C.muted) {
    text('•', x, y, 20, 35, size + 8, C.mint, true);
    text(t, x + 29, y, w - 29, 58, size, color, false);
}
async function addImage(name, x, y, w, h) {
    const bytes = await fs.readFile(path.join(assets, name));
    const blob = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
    );
    s.images.add({
        blob,
        contentType: 'image/png',
        alt: name,
        fit: 'cover',
        position: { left: x, top: y, width: w, height: h },
        geometry: 'roundRect',
        borderRadius: 'rounded-lg',
    });
}

// Header
box(0, 0, W, 235, '#0B371E', 'none');
text('CouncilForge', 120, 42, 900, 78, 66, C.cream, true);
text('STUDENT COUNCIL MANAGEMENT SYSTEM', 124, 126, 1040, 40, 24, C.mint, true);
text(
    'One campus platform for accountable student leadership',
    1250,
    62,
    1640,
    68,
    43,
    C.cream,
    true,
    'center',
);
text(
    'Academic Project Poster  |  Print size: 8 ft × 3 ft (landscape)',
    1250,
    137,
    1640,
    34,
    22,
    C.muted,
    false,
    'center',
);
box(3964, 43, 470, 132, C.green, 'rounded-xl');
text('CIVIC TECH SUITE', 3994, 69, 410, 32, 20, C.cream, true, 'center');
text(
    'Abuyog Community College',
    3994,
    104,
    410,
    30,
    18,
    C.cream,
    false,
    'center',
);

// column geometry
const x1 = 92,
    x2 = 1578,
    x3 = 3064,
    col = 1452;
// Problem
section('Why CouncilForge?', '01', x1, 278, col, 286);
text(
    'Student councils often work through scattered chat groups, files, and paper records. This makes tasks hard to track, limits transparency, and slows responses to student concerns.',
    x1 + 34,
    365,
    col - 68,
    122,
    28,
    C.muted,
    false,
);
text('Agenda', x1 + 34, 510, 160, 32, 22, C.lime, true);
text(
    'centralize operations, strengthen accountability, and give students a clear channel to participate.',
    x1 + 198,
    510,
    col - 232,
    40,
    22,
    C.cream,
    false,
);

// Objectives
section('Project objectives', '02', x2, 278, col, 286);
bullet(
    'Organize council work, events, budgets, documents, and voting in one system.',
    x2 + 32,
    365,
    col - 64,
    23,
);
bullet(
    'Provide students with visible updates and a protected concern-submission channel.',
    x2 + 32,
    423,
    col - 64,
    23,
);
bullet(
    'Give administrators oversight without removing organization-level autonomy.',
    x2 + 32,
    481,
    col - 64,
    23,
);

// SDGs
section('Sustainable Development Goals', '03', x3, 278, col, 286);
const sdgs = [
    ['4', 'Quality Education', C.sdg4],
    ['9', 'Industry, Innovation\n& Infrastructure', C.sdg9],
    ['16', 'Peace, Justice &\nStrong Institutions', C.sdg16],
];
sdgs.forEach((d, i) => {
    const xx = x3 + 35 + i * 464;
    box(xx, 368, 410, 132, d[2], 'rounded-lg');
    text('SDG', xx + 22, 391, 86, 28, 17, C.cream, true);
    text(d[0], xx + 22, 418, 94, 60, 46, C.cream, true);
    text(d[1], xx + 119, 404, 268, 66, 19, C.cream, true);
});

// Features
section('Key features', '04', x1, 603, col, 369);
const feats = [
    ['▣', 'Task boards', 'Assign, monitor, and review work.'],
    ['◷', 'Events', 'Publish events and track joins.'],
    ['!', 'Concerns', 'Receive and resolve student issues.'],
    ['◉', 'Voting', 'Run organized student decisions.'],
    ['₱', 'Budget', 'Track allocations and balances.'],
    ['▤', 'Documents', 'Keep council files accessible.'],
];
feats.forEach((f, i) => {
    const cx = x1 + 35 + (i % 2) * 700,
        cy = 691 + Math.floor(i / 2) * 84;
    text(f[0], cx, cy, 38, 38, 27, C.mint, true);
    text(f[1], cx + 54, cy, 215, 29, 22, C.cream, true);
    text(f[2], cx + 54, cy + 30, 610, 28, 18, C.muted, false);
});

// Architecture
section('System architecture', '05', x2, 603, col, 369);
const arch = [
    ['Users', 'Students  •  Officers  •  OSA/Admin'],
    ['Web platform', 'Role-aware modules and dashboards'],
    ['Services', 'Authentication  •  Workflows  •  Notifications'],
    ['Data layer', 'Accounts  •  Organizations  •  Audit records'],
];
arch.forEach((a, i) => {
    const yy = 688 + i * 64;
    box(x2 + 40, yy, 250, 46, i === 0 ? C.green : C.panel2, 'rounded-lg');
    text(a[0], x2 + 60, yy + 11, 210, 23, 18, C.cream, true, 'center');
    text(
        a[1],
        x2 + 334,
        yy + 10,
        1055,
        28,
        21,
        i === 3 ? C.lime : C.muted,
        i === 1,
    );
    if (i < 3) text('↓', x2 + 145, yy + 43, 46, 30, 20, C.mint, true, 'center');
});

// RBAC
section('RBAC & security flow', '06', x3, 603, col, 369);
text('Sign in', x3 + 42, 692, 210, 32, 23, C.cream, true, 'center');
text('→', x3 + 244, 690, 60, 36, 28, C.mint, true, 'center');
text('Verify identity', x3 + 315, 692, 275, 32, 23, C.cream, true, 'center');
text('→', x3 + 588, 690, 60, 36, 28, C.mint, true, 'center');
text('Check role', x3 + 650, 692, 215, 32, 23, C.cream, true, 'center');
text('→', x3 + 858, 690, 60, 36, 28, C.mint, true, 'center');
text('Allow action', x3 + 920, 692, 310, 32, 23, C.cream, true, 'center');
box(x3 + 38, 750, 1368, 170, C.panel2, 'rounded-lg');
bullet(
    'Role-based permissions limit each account to its allowed scope.',
    x3 + 67,
    774,
    1250,
    22,
);
bullet(
    'Separate administrator access, account verification, and logged identity reveals protect sensitive actions.',
    x3 + 67,
    826,
    1250,
    22,
);
bullet(
    'Anonymous concerns stay hidden from officers until authorized handling requires disclosure.',
    x3 + 67,
    878,
    1250,
    22,
);

// Development method
section('Development methodology', '07', x1, 1011, col, 298);
const steps = [
    ['1', 'Discover', 'Map council workflows and user needs'],
    ['2', 'Design', 'Define roles, modules, and interface flows'],
    ['3', 'Build', 'Develop and integrate core services'],
    ['4', 'Test', 'Validate functions, access, and usability'],
    ['5', 'Refine', 'Improve from feedback and observed issues'],
];
steps.forEach((z, i) => {
    const xx = x1 + 38 + i * 278;
    box(xx, 1104, 80, 80, C.green, 'rounded-full');
    text(z[0], xx, 1120, 80, 40, 28, C.cream, true, 'center');
    text(z[1], xx, 1200, 240, 28, 20, C.cream, true, 'center');
    text(z[2], xx, 1230, 248, 45, 16, C.muted, false, 'center');
    if (i < 4) text('›', xx + 222, 1120, 45, 45, 34, C.mint, true, 'center');
});

// roles
section('User roles', '08', x2, 1011, col, 298);
const roles = [
    ['Student', 'Submit concerns, join events, view announcements.'],
    ['Officer', 'Manage tasks, members, budgets, and activities.'],
    ['President', 'Coordinate organization-wide council operations.'],
    ['Administrator', 'Verify accounts, oversee records, and audit access.'],
];
roles.forEach((r, i) => {
    const yy = 1097 + i * 47;
    text(
        '●',
        x2 + 44,
        yy,
        28,
        28,
        19,
        [C.blue, C.green, C.orange, C.purple][i],
        true,
    );
    text(r[0], x2 + 84, yy, 210, 28, 21, C.cream, true);
    text(r[1], x2 + 300, yy, 1090, 28, 19, C.muted, false);
});

// System agenda and expected contribution
section('System agenda', '10', x1, 1348, 2940, 238);
text(
    'CouncilForge supports a student-governance cycle that keeps decisions, responsibilities, and feedback visible to the people they serve.',
    x1 + 38,
    1434,
    2800,
    42,
    27,
    C.cream,
    false,
);
const agenda = [
    [
        'Transparent operations',
        'Clear task, budget, document, and activity records.',
    ],
    [
        'Timely student response',
        'A structured channel for concerns, updates, and events.',
    ],
    [
        'Responsible governance',
        'Role-aware access and audit visibility for sensitive actions.',
    ],
];
agenda.forEach((a, i) => {
    const xx = x1 + 38 + i * 946;
    text(
        ['◉', '◷', '▣'][i],
        xx,
        1502,
        42,
        40,
        28,
        [C.blue, C.mint, C.orange][i],
        true,
    );
    text(a[0], xx + 58, 1501, 780, 30, 23, C.cream, true);
    text(a[1], xx + 58, 1532, 790, 28, 19, C.muted, false);
});

// Screenshots
section('System screenshots', '09', x3, 1011, col, 575);
await addImage('landing.png', x3 + 35, 1098, 426, 192);
await addImage('council-dashboard.png', x3 + 501, 1098, 426, 192);
await addImage('student-dashboard.png', x3 + 967, 1098, 426, 192);
await addImage('login.png', x3 + 35, 1324, 426, 192);
await addImage('admin-dashboard.png', x3 + 501, 1324, 426, 192);
box(x3 + 967, 1324, 426, 192, C.panel2, 'rounded-lg');
text(
    'CouncilForge connects participation with accountable council operations.',
    x3 + 1002,
    1360,
    356,
    78,
    27,
    C.cream,
    true,
    'center',
);
text(
    'Students  •  Councils  •  Administration',
    x3 + 990,
    1468,
    380,
    27,
    18,
    C.mint,
    true,
    'center',
);

// Footer
text(
    'CouncilForge  |  Student Council Management System  |  Built for campus participation, coordination, and transparent governance',
    120,
    1642,
    4368,
    32,
    20,
    C.muted,
    false,
    'center',
);

const { finalizePresentation } = await import(
    pathToFileURL(
        path.join(skillDir, 'container_tools', 'artifact_tool_utils.mjs'),
    ).href
);
const staging = path.join(buildDir, 'finalizer');
await fs.mkdir(staging, { recursive: true });
await fs.mkdir(path.dirname(finalPath), { recursive: true });
const candidate = path.join(staging, 'candidate.pptx');
await (await PresentationFile.exportPptx(p)).save(candidate);
const result = await finalizePresentation({
    workspaceDir,
    candidatePath: candidate,
    finalPath,
    pythonExecutable: nodePython,
    integrityValidatorPath: path.join(
        skillDir,
        'container_tools',
        'inspect_presentation_package_integrity.py',
    ),
    layoutValidatorPath: path.join(
        skillDir,
        'container_tools',
        'inspect_presentation_layout_geometry.py',
    ),
    layoutArgs: [
        '--expected-slide-size-emu',
        '43891200,16459200',
        '--validate-heading-fit',
    ],
    fontPolicy: { basis: 'design', families: ['Aptos'] },
    verifyArtifactToolImport: true,
    receiptPath: path.join(staging, 'validation-final.json'),
});
console.log(JSON.stringify(result, null, 2));
const png = await p.export({ slide: s, format: 'png', scale: 1 });
await fs.writeFile(
    path.join(buildDir, 'poster-preview.png'),
    new Uint8Array(await png.arrayBuffer()),
);
