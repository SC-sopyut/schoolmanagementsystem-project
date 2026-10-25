import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const { Presentation, PresentationFile } = await import(
    pathToFileURL(
        'C:/Users/corsi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs',
    ).href
);

const workspaceDir = 'C:/Users/corsi/Documents/scm- Copy';
const skillDir =
    'C:/Users/corsi/.codex/plugins/cache/openai-primary-runtime/presentations/26.1015.12040/skills/presentations';
const outDir = path.join(workspaceDir, '.ppt_out');
const finalPath = path.join(
    outDir,
    'Student-Council-Management-System-3ft-by-8ft-Editable-Poster.pptx',
);
const stageDir = path.join(workspaceDir, '.ppt_build', 'stage');
await fs.mkdir(stageDir, { recursive: true });
await fs.mkdir(outDir, { recursive: true });

// 3 ft x 8 ft at the 96-DPI PowerPoint canvas convention: 3456 x 9216 pixels.
const deck = Presentation.create({ slideSize: { width: 3456, height: 9216 } });
const s = deck.slides.add();
const SX = 4.8,
    SY = 7.2;
const C = {
    bg: '#F4F8F1',
    ink: '#173A21',
    deep: '#0C351D',
    green: '#176B35',
    mid: '#2E8B48',
    pale: '#E6F1E4',
    mint: '#D6E6D1',
    soft: '#EDF4E9',
    gold: '#E5B83D',
    white: '#FFFFFF',
    muted: '#5D7662',
    purple: '#7043A1',
};
s.background.fill = C.bg;
function rect(x, y, w, h, fill, rad = 0, line = 'none') {
    return s.shapes.add({
        geometry: rad ? 'roundRect' : 'rect',
        position: { left: x * SX, top: y * SY, width: w * SX, height: h * SY },
        fill,
        line:
            line === 'none'
                ? { style: 'solid', fill: 'none', width: 0 }
                : { style: 'solid', fill: line, width: 1 * SX },
        borderRadius: rad ? 'rounded-xl' : undefined,
    });
}
function tx(
    x,
    y,
    w,
    h,
    text,
    size = 14,
    color = C.ink,
    bold = false,
    align = 'left',
) {
    const q = s.shapes.add({
        geometry: 'textbox',
        position: { left: x * SX, top: y * SY, width: w * SX, height: h * SY },
        fill: 'none',
        line: { style: 'solid', fill: 'none', width: 0 },
    });
    q.text = text;
    q.text.style = {
        fontSize: size * SX,
        fontFamily: 'Aptos',
        color,
        bold,
        align,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
    };
    return q;
}
function circle(x, y, d, fill) {
    return s.shapes.add({
        geometry: 'ellipse',
        position: { left: x * SX, top: y * SY, width: d * SX, height: d * SY },
        fill,
        line: { style: 'solid', fill: C.white, width: 1 * SX },
    });
}
function icon(x, y, label, fill = C.green) {
    circle(x, y, 34, fill);
    tx(x, y + 7, 34, 20, label, 16, C.white, true, 'center');
}
function header(y, title) {
    rect(20, y, 680, 35, C.deep, 12);
    tx(36, y + 8, 640, 20, title, 15, C.white, true);
}
function card(x, y, w, h, title, body, mark, accent = C.green) {
    rect(x, y, w, h, C.white, 14, C.mint);
    icon(x + 15, y + 14, mark, accent);
    tx(x + 62, y + 17, w - 77, 20, title, 13, C.ink, true);
    tx(x + 17, y + 61, w - 34, h - 70, body, 10, C.muted, false);
}

// Hero area
rect(0, 0, 720, 190, C.deep);
rect(0, 170, 720, 11, C.gold);
rect(0, 182, 720, 4, C.white);
circle(30, 24, 62, C.gold);
tx(30, 45, 62, 19, 'ACC', 14, C.deep, true, 'center');
tx(105, 28, 420, 24, 'ABUYOG COMMUNITY COLLEGE', 18, C.white, true);
tx(106, 54, 320, 16, 'Education for a Brighter Future', 10, '#D8E9D2');
tx(34, 94, 430, 38, 'STUDENT COUNCIL', 28, C.white, true);
tx(34, 127, 485, 38, 'MANAGEMENT SYSTEM', 28, C.white, true);
tx(
    35,
    156,
    450,
    12,
    'Centralized tools for council work and student participation',
    9,
    '#D8E9D2',
);
// editable illustration, purposely composed as simple native shapes
rect(505, 52, 166, 100, '#18291C', 16, '#72A77A');
rect(516, 63, 144, 15, C.pale, 5);
rect(516, 85, 47, 52, C.green, 7);
rect(574, 85, 72, 10, '#72A77A', 4);
rect(574, 102, 58, 8, C.mint, 4);
rect(574, 118, 68, 8, C.mint, 4);
tx(522, 99, 35, 20, 'SCM', 9, C.white, true, 'center');

// Role row
card(
    22,
    207,
    160,
    100,
    'Students',
    'Events, announcements, concerns, and voting.',
    '●',
    '#2E8B48',
);
card(
    194,
    207,
    160,
    100,
    'Officers',
    'Tasks, budgets, events, and council activities.',
    '✓',
    '#176B35',
);
card(
    366,
    207,
    160,
    100,
    'Administrators',
    'Records, users, access, and activity review.',
    '◆',
    C.purple,
);
card(
    538,
    207,
    160,
    100,
    'Role Based',
    'Access and actions match each user role.',
    '♙',
    '#8F6C13',
);

// SDG and agenda
header(330, 'SUSTAINABLE DEVELOPMENT GOALS AND SYSTEM AGENDA');
rect(20, 375, 445, 150, C.white, 16, C.mint);
tx(36, 391, 380, 22, 'Sustainable Development Goals', 15, C.ink, true);
tx(36, 416, 390, 16, 'Relevant SDGs for the project', 10, C.muted);
const sdgs = [
    ['4', 'Quality Education', '#C5192D'],
    ['8', 'Decent Work', '#A21942'],
    ['9', 'Innovation', '#FD6925'],
    ['10', 'Reduced Inequalities', '#DD1367'],
    ['16', 'Strong Institutions', '#00689D'],
    ['17', 'Partnerships', '#19486A'],
];
sdgs.forEach((a, i) => {
    let x = 34 + i * 69;
    rect(x, 448, 60, 58, a[2], 9);
    tx(x, 456, 60, 13, 'SDG ' + a[0], 9, C.white, true, 'center');
    tx(x + 4, 476, 52, 22, a[1], 7, C.white, true, 'center');
});
rect(480, 375, 220, 150, C.pale, 16, C.mint);
tx(497, 391, 170, 22, 'System Agenda', 15, C.ink, true);
[
    'Digital transformation',
    'Inclusive access',
    'Efficient governance',
    'Data security and privacy',
    'Sustainable partnerships',
].forEach((v, i) => {
    icon(497, 423 + i * 19, '✓', C.green);
    tx(538, 428 + i * 19, 145, 13, v, 8, C.ink);
});

// capabilities
header(548, 'CORE SYSTEM FUNCTIONS');
card(
    22,
    595,
    212,
    92,
    'Task Boards',
    'Organize committee work and follow task progress.',
    '☷',
);
card(
    254,
    595,
    212,
    92,
    'Event Planning',
    'Keep budgets, checklists, and attendance together.',
    '▣',
);
card(
    486,
    595,
    212,
    92,
    'Voting and Polling',
    'Manage elections and publish results.',
    '✓',
    C.purple,
);
card(
    22,
    704,
    212,
    92,
    'Concerns Routing',
    'Receive, review, and route student concerns.',
    '☏',
    '#8F6C13',
);
card(
    254,
    704,
    212,
    92,
    'Documents',
    'Store files in shared folders with access control.',
    '▰',
);
card(
    486,
    704,
    212,
    92,
    'Announcements',
    'Share information with the intended audience.',
    '!',
    '#176B35',
);

// editable flow
header(818, 'HOW COUNCIL WORK FLOWS');
const steps = [
    ['1', 'Plan', 'Tasks and events'],
    ['2', 'Engage', 'Announcements and participation'],
    ['3', 'Decide', 'Voting and election results'],
    ['4', 'Review', 'Records and activity oversight'],
];
steps.forEach((a, i) => {
    let x = 32 + i * 170;
    circle(x, 870, 38, [C.green, '#2E8B48', C.purple, '#8F6C13'][i]);
    tx(x, 879, 38, 16, a[0], 13, C.white, true, 'center');
    tx(x + 47, 872, 110, 16, a[1], 11, C.ink, true);
    tx(x + 47, 890, 112, 28, a[2], 8, C.muted);
    if (i < 3) tx(x + 148, 883, 20, 18, '→', 16, C.green, true, 'center');
});

// output focus
header(940, 'PROJECT FOCUS');
[
    ['Organized', 'Manage council records and activities in one system.'],
    [
        'Participatory',
        'Support student engagement through events, concerns, and voting.',
    ],
    [
        'Accountable',
        'Use role-based access and activity records for oversight.',
    ],
].forEach((a, i) => {
    let x = 22 + i * 232;
    rect(x, 990, 212, 80, C.white, 13, C.mint);
    tx(x + 12, 1004, 188, 16, a[0], 13, C.ink, true, 'center');
    tx(x + 18, 1030, 176, 28, a[1], 9, C.muted, false, 'center');
});

// footer
rect(0, 1113, 720, 167, C.deep);
rect(0, 1107, 720, 6, C.gold);
circle(28, 1140, 55, C.gold);
tx(28, 1159, 55, 16, 'ACC', 12, C.deep, true, 'center');
tx(100, 1142, 300, 18, 'ABUYOG COMMUNITY COLLEGE', 15, C.white, true);
tx(100, 1164, 300, 16, 'Student Council Management System', 10, '#D8E9D2');
tx(365, 1141, 260, 14, 'Developed by', 10, '#D8E9D2', true);
tx(
    365,
    1159,
    330,
    30,
    'Sophia Corsiga\nPrincess Lhea Cominador\nEvanlloyd Bandolin',
    9,
    C.white,
);
tx(365, 1205, 300, 14, 'Adviser: Richie A. Cabangon, MSc IT', 9, C.white);

const candidatePath = path.join(
    stageDir,
    'editable-poster-3ft-by-8ft-draft.pptx',
);
await (await PresentationFile.exportPptx(deck)).save(candidatePath);
const { finalizePresentation } = await import(
    pathToFileURL(
        path.join(skillDir, 'container_tools', 'artifact_tool_utils.mjs'),
    ).href
);
await finalizePresentation({
    workspaceDir,
    candidatePath,
    finalPath,
    pythonExecutable:
        'C:/Users/corsi/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
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
        '32918400,87782400',
        '--validate-heading-fit',
    ],
    fontPolicy: { basis: 'design', families: ['Aptos'] },
    verifyArtifactToolImport: true,
    receiptPath: path.join(stageDir, 'validation-3ft-by-8ft.json'),
});
const png = await deck.export({ slide: s, format: 'png', scale: 1 });
await fs.writeFile(
    path.join(stageDir, 'poster-preview.png'),
    new Uint8Array(await png.arrayBuffer()),
);
console.log(finalPath);
