import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Presentation, PresentationFile } from '@oai/artifact-tool';

const workspaceDir=process.cwd();
const buildDir=path.join(workspaceDir,'.poster-build');
const assets=path.join(buildDir,'assets');
const skillDir='C:/Users/corsi/.codex/plugins/cache/openai-primary-runtime/presentations/26.1015.12040/skills/presentations';
const finalPath=path.join(workspaceDir,'poster-output','CouncilForge_Academic_Project_Poster_3x8ft_Portrait_WithTeam.pptx');
const nodePython='C:/Users/corsi/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const W=1728,H=4608;
const C={ink:'#081A10',panel:'#102A1A',panel2:'#123821',green:'#159447',mint:'#71E0A0',cream:'#F8F5DF',muted:'#BED5C3',lime:'#C9DD8A',blue:'#2BB9ED',orange:'#FF9A25',purple:'#9B6BFF',line:'#366746',sdg4:'#C5192D',sdg9:'#FD6925',sdg16:'#00689D'};
const p=Presentation.create({slideSize:{width:W,height:H}}); const s=p.slides.add(); s.background.fill=C.ink;
function box(x,y,w,h,fill=C.panel,r='rounded-xl',line='none'){const z={geometry:r==='none'?'rect':'roundRect',position:{left:x,top:y,width:w,height:h},fill,line:{style:'solid',fill:line,width:line==='none'?0:2}};if(r!=='none')z.borderRadius=r;return s.shapes.add(z)}
function text(t,x,y,w,h,size=30,color=C.cream,bold=false,align='left'){const z=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{style:'solid',fill:'none',width:0}});z.text=t;z.text.style={fontFamily:'Aptos',fontSize:size,color,bold,paragraphAlignment:align,marginLeft:0,marginRight:0,marginTop:0,marginBottom:0};return z}
function section(n,title,x,y,w,h){box(x,y,w,h,C.panel,'rounded-xl',C.line);text(n,x+30,y+30,58,40,28,C.mint,true);text(title,x+100,y+30,w-130,40,29,C.cream,true)}
function bullet(t,x,y,w,size=23){text('•',x,y,22,36,size+8,C.mint,true);text(t,x+30,y,w-30,58,size,C.muted)}
async function img(name,x,y,w,h){const f=await fs.readFile(path.join(assets,name));const blob=f.buffer.slice(f.byteOffset,f.byteOffset+f.byteLength);s.images.add({blob,contentType:'image/png',alt:name,fit:'cover',position:{left:x,top:y,width:w,height:h},geometry:'roundRect',borderRadius:'rounded-lg'})}

// Header
box(0,0,W,550,'#0B371E','none');
text('CouncilForge',88,55,700,70,61,C.cream,true);text('STUDENT COUNCIL MANAGEMENT SYSTEM',92,132,890,35,23,C.mint,true);
text('Group Members: Sophia Corsiga  •  Princess Lhea Cominador  •  Evanlloyd Bandolin',92,182,1015,28,17,C.muted,false);
text('Adviser: Richie A. Cabangon, MSc IT',92,213,800,28,17,C.mint,true);
box(1135,75,492,108,C.green,'rounded-xl');text('CIVIC TECH SUITE',1165,99,432,27,18,C.cream,true,'center');text('Abuyog Community College',1165,132,432,25,16,C.cream,false,'center');
text('One campus platform for\naccountable student leadership',92,290,1544,150,55,C.cream,true,'center');
text('ACADEMIC PROJECT POSTER  |  PRINT SIZE: 3 FT × 8 FT  |  PORTRAIT',100,468,1528,30,20,C.muted,true,'center');

const x=70, cw=1588;
section('01','Why CouncilForge?',x,600,cw,360);
text('Student councils often work through scattered chat groups, files, and paper records. This makes tasks hard to track, limits transparency, and slows responses to student concerns.',x+40,690,cw-80,92,28,C.muted);
box(x+40,818,cw-80,86,C.panel2,'rounded-lg');text('System agenda',x+68,842,200,28,21,C.lime,true);text('Centralize operations, strengthen accountability, and give students a clear channel to participate.',x+276,841,cw-340,32,21,C.cream);

section('02','Project objectives',x,1005,cw,442);
bullet('Organize council work, events, budgets, documents, and voting in one system.',x+42,1095,cw-84,24);
bullet('Give students visible updates and a protected concern-submission channel.',x+42,1182,cw-84,24);
bullet('Give administrators oversight without removing organization-level autonomy.',x+42,1269,cw-84,24);

section('03','Sustainable Development Goals',x,1490,cw,372);
const sdgs=[['SDG 4','Quality Education',C.sdg4],['SDG 9','Industry, Innovation\n& Infrastructure',C.sdg9],['SDG 16','Peace, Justice &\nStrong Institutions',C.sdg16]];
sdgs.forEach((a,i)=>{const xx=x+40+i*514;box(xx,1585,472,205,a[2],'rounded-lg');text(a[0],xx+25,1614,160,29,19,C.cream,true);text(a[0].replace('SDG ',''),xx+25,1652,105,62,46,C.cream,true);text(a[1],xx+145,1642,295,72,20,C.cream,true)});

section('04','Key features',x,1905,cw,595);
const features=[['▣','Task boards','Assign, monitor, and review work.'],['◷','Events','Publish events and track joins.'],['!','Concerns','Receive and resolve student issues.'],['◉','Voting','Run organized student decisions.'],['₱','Budget','Track allocations and balances.'],['▤','Documents','Keep council files accessible.']];
features.forEach((a,i)=>{const xx=x+48+(i%2)*766,yy=2003+Math.floor(i/2)*145;text(a[0],xx,yy,42,42,30,C.mint,true);text(a[1],xx+62,yy,270,30,24,C.cream,true);text(a[2],xx+62,yy+36,635,34,20,C.muted)});

// Architecture and security
section('05','System architecture',x,2545,770,650);
const architecture=[['Users','Students, Officers, OSA/Admin'],['Web platform','Role-aware modules and dashboards'],['Services','Authentication, workflows, notifications'],['Data layer','Accounts, organizations, audit records']];
architecture.forEach((a,i)=>{const yy=2642+i*122;box(x+43,yy,230,58,i===0?C.green:C.panel2,'rounded-lg');text(a[0],x+58,yy+17,200,22,17,C.cream,true,'center');text(a[1],x+305,yy+12,410,41,20,i===3?C.lime:C.muted,i===1);if(i<3)text('↓',x+134,yy+60,45,36,23,C.mint,true,'center')});
section('06','RBAC & security flow',858,2545,800,650);
text('Sign in',900,2644,150,28,20,C.cream,true,'center');text('→',1042,2640,44,34,25,C.mint,true,'center');text('Verify identity',1085,2644,190,28,20,C.cream,true,'center');text('→',1268,2640,44,34,25,C.mint,true,'center');text('Check role',1313,2644,140,28,20,C.cream,true,'center');text('→',1445,2640,44,34,25,C.mint,true,'center');text('Allow',1490,2644,125,28,20,C.cream,true,'center');
box(898,2730,720,370,C.panel2,'rounded-lg');bullet('Role-based permissions limit each account to its allowed scope.',930,2770,650,20);bullet('Separate administrator access and account verification protect sensitive actions.',930,2860,650,20);bullet('Audit records log authorized identity reveals and system activity.',930,2950,650,20);

section('07','Development methodology',x,3235,cw,410);
const steps=[['1','Discover','Map workflows'],['2','Design','Define modules'],['3','Build','Integrate services'],['4','Test','Validate access'],['5','Refine','Improve from feedback']];
steps.forEach((a,i)=>{const xx=x+47+i*304;box(xx,3338,82,82,C.green,'rounded-full');text(a[0],xx,3356,82,36,27,C.cream,true,'center');text(a[1],xx-18,3442,120,28,20,C.cream,true,'center');text(a[2],xx-42,3476,166,26,17,C.muted,false,'center');if(i<4)text('›',xx+205,3355,40,42,33,C.mint,true,'center')});

section('08','User roles',x,3685,cw,370);
const roles=[['Student','Submit concerns, join events, view announcements.',C.blue],['Officer','Manage tasks, members, budgets, and activities.',C.green],['President','Coordinate organization-wide council operations.',C.orange],['Administrator','Verify accounts, oversee records, and audit access.',C.purple]];
roles.forEach((a,i)=>{const yy=3780+i*60;text('●',x+48,yy,30,25,18,a[2],true);text(a[0],x+95,yy,220,26,21,C.cream,true);text(a[1],x+335,yy,cw-380,26,20,C.muted)});

section('09','System screenshots',x,4095,cw,415);
await img('landing.png',x+40,4182,482,142);await img('council-dashboard.png',x+553,4182,482,142);await img('student-dashboard.png',x+1066,4182,482,142);await img('login.png',x+40,4347,482,104);await img('admin-dashboard.png',x+553,4347,482,104);
text('CouncilForge connects participation with accountable council operations.',1080,4358,420,55,24,C.cream,true,'center');text('Students  •  Councils  •  Administration',1065,4425,440,22,17,C.mint,true,'center');
text('CouncilForge  |  Student Council Management System  |  Built for campus participation, coordination, and transparent governance',70,4558,1588,27,17,C.muted,false,'center');

const {finalizePresentation}=await import(pathToFileURL(path.join(skillDir,'container_tools','artifact_tool_utils.mjs')).href);const staging=path.join(buildDir,'finalizer');await fs.mkdir(staging,{recursive:true});await fs.mkdir(path.dirname(finalPath),{recursive:true});const candidate=path.join(staging,'candidate-portrait.pptx');await (await PresentationFile.exportPptx(p)).save(candidate);
const result=await finalizePresentation({workspaceDir,candidatePath:candidate,finalPath,pythonExecutable:nodePython,integrityValidatorPath:path.join(skillDir,'container_tools','inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skillDir,'container_tools','inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','16459200,43891200','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Aptos']},verifyArtifactToolImport:true,receiptPath:path.join(staging,'validation-portrait-team.json')});console.log(JSON.stringify(result,null,2));const png=await p.export({slide:s,format:'png',scale:1});await fs.writeFile(path.join(buildDir,'poster-portrait-preview.png'),new Uint8Array(await png.arrayBuffer()));
