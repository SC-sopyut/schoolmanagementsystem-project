from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.lib import colors
from pathlib import Path

root=Path.cwd(); out=root/'poster-output'; out.mkdir(exist_ok=True)
pdf=out/'CouncilForge_3x8ft_Portrait_Creative_WithImages.pdf'
W,H=1296,3456
c=canvas.Canvas(str(pdf),pagesize=(W,H));
D=HexColor('#062E20'); G=HexColor('#057B49'); M=HexColor('#54D89A'); L=HexColor('#D9F3A5'); P=HexColor('#F2F7EC'); C=HexColor('#FFFDF1'); Gold=HexColor('#E6B331'); Purple=HexColor('#7444A7'); Blue=HexColor('#1273B6'); Coral=HexColor('#E55E47'); Muted=HexColor('#507062'); Line=HexColor('#B8D9C2')
def rect(x,y,w,h,fill,stroke=None,r=0):
 c.setFillColor(fill); c.setStrokeColor(stroke or fill); c.setLineWidth(1)
 if r: c.roundRect(x,y,w,h,r,fill=1,stroke=1)
 else: c.rect(x,y,w,h,fill=1,stroke=1)
def tx(v,x,y,size=16,color=D,bold=False,leading=None):
 c.setFillColor(color);c.setFont('Helvetica-Bold' if bold else 'Helvetica',size);lead=leading or size*1.2
 for i,line in enumerate(v.split('\n')): c.drawString(x,y-i*lead,line)
def centered(v,x,y,w,size=16,color=D,bold=False):
 c.setFillColor(color);c.setFont('Helvetica-Bold' if bold else 'Helvetica',size);c.drawCentredString(x+w/2,y,v)
def circle(x,y,label,col):
 c.setFillColor(col);c.circle(x,y,27,fill=1,stroke=0);centered(label,x-27,y-6,54,14,C,True)
def section(num,title,y,col=D):
 rect(46,y,1204,58,col,r=14);tx(num,72,y+20,16,L,True);tx(title,130,y+17,20,C,True)
def card(x,y,w,h,num,title,body,col=G):
 rect(x,y,w,h,C,Line,14);circle(x+47,y+h-47,num,col);tx(title,x+88,y+h-48,16,D,True);tx(body,x+28,y+42,13,Muted,False,16)
def bullet(x,y,title,body,col):
 c.setFillColor(col);c.circle(x,y+5,6,fill=1,stroke=0);tx(title,x+18,y,15,D,True);tx(body,x+180,y,13,Muted)

# Hero with asymmetric field and color window
rect(0,0,W,H,P);rect(0,2840,W,616,D);rect(770,2840,526,616,G);rect(0,2800,W,40,Gold)
c.setFillColor(Gold);c.circle(88,3355,30,fill=1,stroke=0);centered('ACC',58,3348,60,14,D,True)
tx('ABUYOG COMMUNITY COLLEGE',142,3358,17,C,True);tx('Education for a Brighter Future',142,3336,11,HexColor('#D8EADA'))
tx('STUDENT COUNCIL\nMANAGEMENT SYSTEM',76,3175,41,C,True,48);tx('COUNCILFORGE',78,3098,17,M,True);tx('A civic-tech platform for accountable student leadership',78,3070,17,HexColor('#D8EADA'))
tx('GROUP MEMBERS',820,3325,13,L,True);tx('Sophia Corsiga\nPrincess Lhea Cominador\nEvanlloyd Bandolin',820,3294,17,C,True,22);tx('ADVISER',820,3225,13,L,True);tx('Richie A. Cabangon, MSc IT',820,3195,17,C,True);tx('3 FT × 8 FT  /  PORTRAIT',820,2872,14,L,True)
# Hero visual: two overlapping system screens make the application itself a core poster image.
rect(792,2960,252,168,HexColor('#011C14'),r=14);rect(804,2972,228,144,C,r=5)
c.drawImage(ImageReader(str(root/'.poster-build'/'assets'/'landing.png')),810,2978,216,132,preserveAspectRatio=True,mask='auto')
rect(1014,2918,252,182,HexColor('#011C14'),r=14);rect(1026,2930,228,148,C,r=5)
c.drawImage(ImageReader(str(root/'.poster-build'/'assets'/'council-dashboard.png')),1032,2936,216,136,preserveAspectRatio=True,mask='auto')
rect(988,2901,304,16,HexColor('#083D2A'),r=8)
c.setFillColor(Blue);c.circle(1215,3028,55,fill=1,stroke=0);c.setStrokeColor(C);c.setLineWidth(5);c.circle(1215,3028,42,fill=0,stroke=1);centered('SECURE',1173,3031,84,12,C,True);centered('RBAC',1173,3014,84,11,C,True)

# Problem narrative
rect(46,2630,1204,122,C,Line,18);tx('WHY COUNCILFORGE?',74,2715,14,G,True);tx('Council work becomes difficult to track when tasks, files, concerns, and decisions',74,2674,22,D,True);tx('are scattered across separate channels.',74,2648,22,D,True)
section('01','SYSTEM AGENDA',2532,G)
agenda=[('01','Transparent operations','Clear task, budget, document, and activity records.',Blue),('02','Timely student response','Structured channels for concerns, updates, and events.',G),('03','Responsible governance','Role-aware access and audit visibility.',Gold)]
for i,(n,title,body,col) in enumerate(agenda):
 x=58+i*400;circle(x+38,2438,n,col);tx(title,x+76,2445,15,D,True);tx(body,x+76,2418,12,Muted)

section('02','OBJECTIVES AND SDG ALIGNMENT',2330,Purple)
objectives=[('ORGANIZE','Council work, events, budgets, documents, and voting.',G),('PARTICIPATE','Students receive visible updates and protected concern intake.',Blue),('OVERSEE','Administrators verify accounts and audit access.',Gold)]
for i,(title,body,col) in enumerate(objectives):
 x=58+i*400;rect(x,2162,370,132,C,Line,14);tx(f'0{i+1}',x+24,2238,30,col,True);tx(title,x+96,2242,15,D,True);tx(body,x+24,2190,12,Muted)
for i,(n,name,col) in enumerate([('SDG 4','Quality Education',Coral),('SDG 9','Innovation & Infrastructure',Gold),('SDG 16','Strong Institutions',Blue)]):
 x=58+i*400;rect(x,2074,370,62,col,r=12);tx(n,x+20,2109,13,C,True);tx(name,x+118,2108,13,C,True)

section('03','CORE SYSTEM FUNCTIONS',1974,D)
features=[('▤','Task Boards','Assign, monitor, and review work.',G),('◷','Events','Publish activities and track joins.',Blue),('!','Concerns','Receive and resolve student issues.',Coral),('◆','Voting','Run organized student decisions.',Purple),('₱','Budget','Track allocations and balances.',Gold),('▥','Documents','Keep council files accessible.',G)]
for i,z in enumerate(features): card(58+(i%2)*592,1804-(i//2)*142,560,116,*z)

section('04','SYSTEM BLUEPRINT',1304,G)
# Architecture flow and RBAC as connected editorial panels
rect(58,930,558,330,D,r=18);tx('SYSTEM ARCHITECTURE',86,1218,17,C,True)
for i,(a,bx) in enumerate([('Users','Students, officers, OSA/Admin'),('Platform','Role-aware modules'),('Services','Authentication and workflows'),('Records','Accounts and audit logs')]):
 y=1150-i*58;rect(88,y,136,32,Gold if i==0 else HexColor('#0C5632'),r=8);centered(a,88,y+10,136,11,C,True);tx(bx,246,y+10,12,HexColor('#D8EADA')); 
 if i<3: centered('↓',135,y-20,42,14,M,True)
rect(640,930,598,330,C,Line,18);tx('RBAC AND SECURITY FLOW',670,1218,17,D,True)
steps=[('1','Sign in',G),('2','Verify',Blue),('3','Role check',Purple),('4','Allow',Gold)]
for i,(n,label,col) in enumerate(steps):
 x=678+i*132;circle(x+24,1138,n,col);centered(label,x-20,1089,90,11,D,True)
 if i<3: centered('›',x+77,1132,26,18,G,True)
tx('Permissions limit users to their allowed scope.\nSeparate administrator access and audited identity handling\nprotect sensitive actions.',674,1026,13,Muted,False,17)

section('05','DEVELOPMENT METHOD AND USER ROLES',830,Purple)
for i,(n,label,col) in enumerate([('1','Discover',G),('2','Design',Blue),('3','Build',Purple),('4','Test',Gold),('5','Refine',G)]):
 x=116+i*225;circle(x,730,n,col);centered(label,x-55,674,110,15,D,True)
 if i<4: centered('›',x+88,723,26,18,G,True)
rect(58,474,1180,155,C,Line,18);tx('USER ROLES',86,590,17,D,True)
for i,(role,descr,col) in enumerate([('Student','Submit concerns, join events, view announcements.',G),('Officer','Manage tasks, members, budgets, and activities.',Blue),('President','Coordinate organization-wide council operations.',Purple),('Administrator','Verify accounts, oversee records, and audit access.',Gold)]):
 y=550-i*28;c.setFillColor(col);c.circle(95,y+4,4,fill=1,stroke=0);tx(role,112,y,13,D,True);tx(descr,285,y,13,Muted)

# Screens + footer
section('06','SYSTEM SCREENSHOTS',376,D)
imgs=['landing.png','council-dashboard.png','student-dashboard.png','login.png','admin-dashboard.png'];pos=[(58,220),(422,220),(786,220),(58,82),(422,82)]
for name,(x,y) in zip(imgs,pos):
 c.drawImage(ImageReader(str(root/'.poster-build'/'assets'/name)),x,y,336,116,preserveAspectRatio=True,mask='auto')
rect(786,82,336,116,G,r=12);tx('Students\nCouncils\nAdministration',815,164,18,C,True,22)
rect(0,0,W,55,D);tx('CouncilForge Student Council Management System',58,22,12,C,True);tx('Abuyog Community College',910,22,12,L,True)
c.save();print(pdf)
