from lib import *
from p_inputs import valid_expr, add_dv
import json
PROF = json.load(open('/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/r14/prof.json'))
MIS = {
 'K16': 'An emergency fund often comes first, along with the right cover. It is a good place to start with an adviser.',
 'K14c': "You're open to ups and downs, but your emergency fund is thin. Many people build an emergency fund before taking more risk.",
 'K14l': "You're open to ups and downs, but a fall would hit everyday life right now. Many people build an emergency fund before taking more risk.",
 'K14t': "You're open to ups and downs, but you'll need this money within 5 years. Money needed soon has less time to recover from a fall.",
 'K13': 'You like the idea of growth, but falls may unsettle you. A calmer approach might feel more comfortable. Worth talking through with an adviser.',
 'K15': "Your finances could handle more ups and downs than you'd choose. That's fine. It's worth seeing what playing very safe can cost as prices rise.",
 'K17': "You're comfortable with ups and downs, you can afford them and you have time. A good basis for a growth conversation with an adviser.",
 'OK': 'How you feel about risk and what you can afford are broadly in line. A good starting point.'}
RISK_LBL = ['Cautious', 'Cautious–balanced', 'Balanced', 'Balanced–growth', 'Growth']

def build_profile(bk):
    wb = bk.wb
    if 'Plan profile' in wb.sheetnames: del wb['Plan profile']
    ws = wb.create_sheet('Plan profile'); ws.sheet_properties.tabColor = '5B9BD5'
    ws['B1'] = 'Plan profile: money personality and indicative risk profile (Discover and Understand Me scoring)'; ws['B1'].font = Font(bold=True, size=14)
    ws['B2'] = ('Type the option number the customer picked for each question (1 = the first option on screen). Blank = not answered. Everything below is a formula: the money personality (weights per answer), the indicative risk profile '
                '(the lowest of what you want, what you can afford, how long you can wait and your experience), the mismatch message key and the money terms shown on Me. Guidance, not advice.')
    ws['B2'].alignment = Alignment(wrap_text=True, vertical='top'); ws.merge_cells('B2:H2'); ws.row_dimensions[2].height = 52
    for c, w in zip('ABCDEFGHIJKL', [2, 58, 22, 10, 10, 10, 10, 10, 40, 10, 10, 10]): ws.column_dimensions[c].width = w
    r = 4
    def head(t):
        nonlocal r
        for j, h in enumerate([t, 'Option picked (1 to 4; Q6 1 to 5)']): c = ws.cell(r, 2 + j, h); c.fill = HEAD; c.font = WH
        r += 1
    head('ANSWERS')
    names = [('2', 'Q1 Money habits (Discover 2)'), ('4', 'Q4 An investment tip (Discover 4)'), ('6', 'Q6 How much could you invest (Discover 6)'), ('7', 'Q7 If a surprise bill came (Discover 7)'), ('8', 'Q8 Your road (Discover 8)'), ('9', 'Q9 A fall in your investments (Discover 9)'), ('12', 'Q12 How you feel about money (Discover 12)'),
             ('u4', 'U4 Who decides (Understand Me)'), ('u9', 'U9 How long you can wait (blank = suggested from your goals)'), ('u10', 'U10 Income security'), ('u11', 'U11 Investing experience'), ('u12', 'U12 Dependants and commitments'), ('u14', 'U14 Emergency fund cover')]
    for k, lab in names:
        ws.cell(r, 2, lab); c = ws.cell(r, 3); c.fill = YEL; c.font = BLUE
        if k == '6':
            ws.cell(r, 3, 'the Q6 answer typed on Plan inputs'); c.fill = GREY; ws.cell(r, 4, '=IF(Has_q6=1,In_q6+1,0)')
        else:
            vv = valid_expr(('whole', 1, 4), f'C{r}'); ws.cell(r, 4, f'=IF(ISBLANK(C{r}),0,IF({vv},C{r},0))'); add_dv(ws, ('whole', 1, 4), f'C{r}', 'Option picked')
        bk.cellname(f'PA_{k}', ws, f'D{r}'); bk.cellname(f'PA_{k}_Typed', ws, f'C{r}'); ws.cell(r, 4).fill = GRN; r += 1
    ws.cell(r, 2, 'Investments held: how many chips selected'); c = ws.cell(r, 3); c.fill = YEL; c.font = BLUE; ws.cell(r, 4, f'=IF(ISBLANK(C{r}),0,IF({valid_expr(("whole", 0, 7), f"C{r}")},C{r},0))').fill = GRN; add_dv(ws, ('whole', 0, 7), f'C{r}', 'How many chips'); bk.cellname('PA_chipsN', ws, f'D{r}'); bk.cellname('PA_chipsN_Typed', ws, f'C{r}'); r += 1
    ws.cell(r, 2, 'Investments held: "Shares or funds" selected (Yes/No)'); c = ws.cell(r, 3); c.fill = YEL; c.font = BLUE; ws.cell(r, 4, f'=IF(C{r}="Yes",1,0)').fill = GRN; add_dv(ws, ('list', ['Yes', 'No']), f'C{r}', 'Yes or No'); bk.cellname('PA_chipShares', ws, f'D{r}'); bk.cellname('PA_chipShares_Typed', ws, f'C{r}'); r += 1
    ws.cell(r, 2, 'Investments held: all selected are "None" or "Savings account" (Yes/No)'); c = ws.cell(r, 3); c.fill = YEL; c.font = BLUE; ws.cell(r, 4, f'=IF(C{r}="Yes",1,0)').fill = GRN; add_dv(ws, ('list', ['Yes', 'No']), f'C{r}', 'Yes or No'); bk.cellname('PA_chipsSafe', ws, f'D{r}'); bk.cellname('PA_chipsSafe_Typed', ws, f'C{r}'); r += 2
    # option tables
    for c in range(2, 12): ws.cell(r, c).fill = HEAD
    for j, h in enumerate(['Question|option', 'Score', 'A', 'B', 'E', 'C', 'Money term']): ws.cell(r, 2 + j, h).font = WH
    r += 1; t0 = r
    PW = PROF['PW']
    def put(key, s, w, tag):
        nonlocal r
        ws.cell(r, 2, key); ws.cell(r, 3, s)
        for j, L in enumerate('ABEC'): ws.cell(r, 4 + j, w.get(L, 0))
        ws.cell(r, 8, tag); r += 1
    for q in PROF['DQ']:
        for i, o in enumerate(q['o']): put(f"{q['id']}|{i + 1}", o['s'], PW.get(q['id'], [{}] * 9)[i] if q['id'] in PW else {}, o['tag'])
    for q in PROF['UM']:
        if q.get('u'):
            for i, o in enumerate(q['o']):
                tag = o.get('trait'); put(f"{q['u']}|{i + 1}", o['s'], PW.get(q['u'], [{}] * 9)[i] if q['u'] in PW else {}, tag)
    t1 = r - 1
    rng = lambda col: f"'Plan profile'!${col}${t0}:${col}${t1}"
    bk.name('Prof_Key', f"'Plan profile'!$B${t0}:$B${t1}")
    r += 1
    def row(name, label, f):
        nonlocal r
        ws.cell(r, 2, label); c = ws.cell(r, 3, f); c.fill = PLN
        if name: bk.cellname(name, ws, f'C{r}')
        r += 1
    for c in range(2, 4): ws.cell(r, c).fill = HEAD
    ws.cell(r, 2, 'RESULTS').font = WH; ws.cell(r, 3, 'Value').font = WH; r += 1
    lk = lambda col, qid: f'IF(PA_{qid}>0,SUMIFS({rng(col)},Prof_Key,"{qid}|"&PA_{qid}),0)'
    def sc(L, col):
        return '=' + '+'.join(lk(col, q) for q in ['2', '4', '7', '8', '9', '12', 'u4'])
    row('Prof_DiscCount', 'Discover answers given (of 6)', '=(PA_2>0)+(PA_4>0)+(PA_7>0)+(PA_8>0)+(PA_9>0)+(PA_12>0)')
    row('Prof_UmCount', 'Questions answered (of 13)', '=(PA_2>0)+(PA_4>0)+(PA_6>0)+(PA_7>0)+(PA_8>0)+(PA_9>0)+(PA_12>0)+(PA_u4>0)+(PA_u9>0)+(PA_u10>0)+(PA_u11>0)+(PA_u12>0)+(PA_u14>0)')
    row('Prof_UmSec1', 'Section 1 Your risk: answered (of 3)', '=(PA_8>0)+(PA_9>0)+(PA_u9>0)')
    row('Prof_UmSec2', 'Section 2 Your capacity: answered (of 5)', '=(PA_6>0)+(PA_7>0)+(PA_u10>0)+(PA_u12>0)+(PA_u14>0)')
    row('Prof_UmSec3', 'Section 3 Your investor behaviour: answered (of 5)', '=(PA_2>0)+(PA_12>0)+(PA_4>0)+(PA_u4>0)+(PA_u11>0)')
    row('Prof_UmLeft', 'New questions still to answer (of 7: Q6, U9, U10, U12, U14, U4, U11)', '=7-((PA_6>0)+(PA_u9>0)+(PA_u10>0)+(PA_u12>0)+(PA_u14>0)+(PA_u4>0)+(PA_u11>0))')
    row('Prof_UmLeftTxt', 'Line under "Your money profile"', '=IF(Prof_UmLeft=7,"7 quick questions · your first "&Prof_DiscCount&" answers are filled in",IF(Prof_UmLeft>0,Prof_UmLeft&" of 7 left · your first "&Prof_DiscCount&" answers are filled in","All 7 answered · your first "&Prof_DiscCount&" answers are filled in"))')
    row('Prof_DiscEnough', 'Enough Discover answers (4 or more)', '=IF(Prof_DiscCount>=4,1,0)')
    for L, col in [('A', 'D'), ('B', 'E'), ('E', 'F'), ('C', 'G')]: row(f'Prof_S{L}', f'Personality score {L}', sc(L, col))
    row('Prof_Top', 'Highest score', '=MAX(Prof_SA,Prof_SB,Prof_SE,Prof_SC)')
    for L in 'ABEC': row(f'Prof_T{L}', f'{L} is tied for top (1/0)', f'=IF(Prof_S{L}=Prof_Top,1,0)')
    row('Prof_TiedN', 'Types tied for top', '=Prof_TA+Prof_TB+Prof_TE+Prof_TC')
    row('Prof_L2', 'Q1 type if it is among the tied', '=IF(PA_2>0,CHOOSE(PA_2,IF(Prof_TA=1,"A",""),IF(Prof_TB=1,"B",""),IF(Prof_TE=1,"E",""),IF(Prof_TC=1,"C","")),"")')
    row('Prof_Q4N', 'Q4 types among the tied', '=IF(PA_4>0,CHOOSE(PA_4,Prof_TE,Prof_TA,Prof_TB,Prof_TB+Prof_TC),0)')
    row('Prof_Q4L', 'Q4 type if exactly one', '=IF(Prof_Q4N=1,CHOOSE(PA_4,"E","A","B",IF(Prof_TB=1,"B","C")),"")')
    row('Prof_First', 'First tied type in the order B, A, C, E', '=IF(Prof_TB=1,"B",IF(Prof_TA=1,"A",IF(Prof_TC=1,"C","E")))')
    row('Prof_TypeKey', 'Your type (key)', '=IF(Prof_DiscCount<4,"",IF(Prof_TiedN=1,IF(Prof_TA=1,"A",IF(Prof_TB=1,"B",IF(Prof_TE=1,"E","C"))),IF(Prof_L2<>"",Prof_L2,IF(Prof_Q4L<>"",Prof_Q4L,Prof_First))))')
    row('Prof_Personality', 'Your money personality', '=IF(Prof_TypeKey="","",IF(Prof_TypeKey="A","Achiever",IF(Prof_TypeKey="B","Balancer",IF(Prof_TypeKey="E","Explorer","Contented"))))')
    # risk
    s = lambda col, q: f'IF(PA_{q}>0,SUMIFS({rng("C")},Prof_Key,"{q}|"&PA_{q}),-1)'
    row('Prof_q6', 'Q6 score (-1 = not answered)', '=' + s('C', '6')); row('Prof_q7', 'Q7 score', '=' + s('C', '7')); row('Prof_q8', 'Q8 score', '=' + s('C', '8')); row('Prof_q9', 'Q9 score', '=' + s('C', '9'))
    row('Prof_Full', 'Full profile (all 13 answered)', '=IF(Prof_UmCount=13,1,0)')
    f9 = lambda kind, extra='': (f'IF(COUNTIFS(GL_Kind,"{kind}",GL_AgeRaw,">"&(F_Age+2){extra})=0,9999,_xlfn.MINIFS(GL_AgeRaw,GL_Kind,"{kind}",GL_AgeRaw,">"&(F_Age+2){extra}))')
    row('Prof_PotAge', 'Earliest savings-pot goal more than 2 years away (age)', '=' + f9('pot'))
    row('Prof_OtherAge', 'Else the earliest other goal more than 2 years away with nothing saved (age)', '=MIN(' + ','.join(f9(k, ',GL_Saved,"<=0"') for k in ['spend', 'mfree', 'pot', 'legacy']) + ')')
    row('Prof_SuggestU9', 'Time horizon suggested from your goals (0 to 3)', '=IF(IF(Prof_PotAge<9999,Prof_PotAge-F_Age,IF(Prof_OtherAge<9999,Prof_OtherAge-F_Age,F_R-F_Age+10))<=2,0,IF(IF(Prof_PotAge<9999,Prof_PotAge-F_Age,IF(Prof_OtherAge<9999,Prof_OtherAge-F_Age,F_R-F_Age+10))<=5,1,IF(IF(Prof_PotAge<9999,Prof_PotAge-F_Age,IF(Prof_OtherAge<9999,Prof_OtherAge-F_Age,F_R-F_Age+10))<=10,2,3)))')
    row('Prof_Wait', 'Time horizon used (0 to 3, from your answer or the suggestion)', '=IF(PA_u9>0,PA_u9-1,Prof_SuggestU9)')
    ix = lambda u: f'IF(PA_{u}>0,PA_{u}-1,-1)'
    row('Prof_T', 'Willingness (want)', '=IF(OR(Prof_q8<0,Prof_q9<0),"",MIN(Prof_q8+IF(AND(Prof_q9=4,Prof_q8>=3),1,0),IF(Prof_q9=1,2,IF(Prof_q9=2,3,5))))')
    capl = ['IF(Prof_q7=2,3,5)', 'IF(Prof_q7=1,2,5)',
            'IF(Prof_Full=1,IF(PA_u10=1,2,IF(PA_u10=2,3,IF(PA_u10=3,4,5))),5)', 'IF(Prof_Full=1,IF(PA_u12=1,2,IF(PA_u12=2,4,5)),5)', 'IF(Prof_Full=1,IF(PA_u14=1,2,IF(PA_u14=2,3,5)),5)',
            'IF(AND(Has_cash=1,Has_costsM=1,F_CostsM>0,F_Cash<3*F_CostsM),3,5)']
    row('Prof_C', 'Capacity for loss (can)', '=IF(Prof_T="","",MIN(' + ','.join(capl) + '))')
    row('Prof_H', 'Time horizon (time)', '=IF(Prof_T="","",CHOOSE(Prof_Wait+1,1,2,4,5))')
    row('Prof_KE', 'Knowledge and experience (experience)', '=IF(Prof_T="","",IF(OR(Prof_Full=0,PA_u11=0),3,MIN(CHOOSE(PA_u11,3,4,5,IF(PA_chipShares=1,5,4)),IF(AND(PA_u11>=3,PA_chipsN>0,PA_chipsSafe=1),4,9))))')
    row('Prof_Level', 'Level', '=IF(Prof_T="","",MIN(Prof_T,Prof_C,Prof_H,Prof_KE))')
    row('Prof_Label', 'Indicative risk profile', '=IF(Prof_Level="","",CHOOSE(Prof_Level,"Cautious","Cautious–balanced","Balanced","Balanced–growth","Growth"))')
    row('Prof_Limit', 'Held back by', '=IF(Prof_Level="","",IF(Prof_Level=Prof_T,"want",IF(Prof_Level=Prof_C,"can",IF(Prof_Level=Prof_H,"time","experience"))))')
    row('Prof_Comfort', 'Comfort with ups and downs (Q8 only)', '=IF(Prof_q8<=0,"",CHOOSE(Prof_q8,"Steady","Mostly steady","Balanced","Adventurous"))')
    row('Prof_Cushion', 'Cushion (Q7)', '=IF(Prof_q7<0,"",IF(Prof_q7=4,"Strong","Thin"))')
    row('Prof_Provisional', 'First read (1) or full profile (0)', '=IF(Prof_Full=1,0,1)')
    row('Prof_WantHi', 'Wants more risk (Q8 3 or 4)', '=IF(Prof_q8>=3,1,0)'); row('Prof_WantLo', 'Wants less risk (Q8 1 or 2)', '=IF(AND(Prof_q8>=1,Prof_q8<=2),1,0)')
    row('Prof_CompHi', 'Stays calm (Q9 3 or 4)', '=IF(Prof_q9>=3,1,0)'); row('Prof_CompLo', 'Gets worried (Q9 1 or 2)', '=IF(AND(Prof_q9>=1,Prof_q9<=2),1,0)')
    row('Prof_Thin', 'Thin cushion', '=IF(OR(AND(Prof_q7>=0,Prof_q7<=2),AND(Prof_Full=1,PA_u14>0,PA_u14<=2)),1,0)')
    row('Prof_ShortT', 'Short time horizon', '=IF(AND(Prof_Full=1,Prof_H<>"",Prof_H<=2),1,0)')
    row('Prof_LossLo', 'Low capacity for loss', '=IF(AND(Prof_Full=1,Prof_C<>"",Prof_C<=2),1,0)')
    row('Prof_CapLo', 'Capacity low', '=IF(OR(Prof_Thin=1,Prof_LossLo=1,Prof_ShortT=1),1,0)')
    row('Prof_CapHi', 'Capacity high', '=IF(Prof_Level="",0,IF(Prof_Full=1,IF(AND(Prof_C>=4,Prof_H>=4),1,0),IF(AND(Prof_q7=4,Prof_q6>=3),1,0)))')
    row('Prof_MisKey', 'Mismatch message key', '=IF(Prof_Level="","",IF(AND(Prof_WantLo=1,Prof_CompLo=1,Prof_CapLo=1),"K16",IF(AND(Prof_WantHi=1,Prof_CapLo=1),IF(Prof_Thin=1,"K14c",IF(Prof_LossLo=1,"K14l","K14t")),IF(AND(Prof_WantHi=1,Prof_CompLo=1),"K13",IF(AND(Prof_WantLo=1,Prof_CapHi=1),"K15",IF(AND(Prof_Full=1,Prof_WantHi=1,Prof_CompHi=1,Prof_CapHi=1,PA_u11>=2,PA_u11<>4),"K17","OK"))))))')
    row('Prof_Banner', 'Risk profile banner on Results', '=IF(Prof_DiscEnough=0,"Risk profile: not enough answers yet","Risk profile"&IF(AND(Prof_Provisional=1,Prof_Label<>"")," (first read)","")&": "&IF(Prof_Label="","Not answered yet",Prof_Label)&" · "&IF(Prof_Full=1,"from your profile in Me","Finish in Me to confirm"))')
    tag = lambda q: f'IF(PA_{q}>0,INDEX({rng("H")},MATCH("{q}|"&PA_{q},Prof_Key,0)),"")'
    j = lambda parts: 'MID(' + '&'.join(f'IF({p}="","","|"&{p})' for p in parts) + ',2,500)'
    row('Prof_TermsMindset', 'Money terms: money mindset', '=' + j([tag('2'), tag('12')]))
    row('Prof_TermsBehaviour', 'Money terms: investor behaviour', '=' + j([tag('4'), tag('9'), 'IF(PA_u4=4,"Procrastination · Status quo bias","")', 'IF(PA_u11=4,"Overconfidence bias","")']))
    row('Prof_TermsAppetite', 'Money terms: risk appetite', '=' + j([tag('8')]))
    row('Prof_TermsCapacity', 'Money terms: capacity for loss', '=' + j([tag('7'), tag('6')]))
    return ws
