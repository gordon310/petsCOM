"""Build the operator-facing business workflow questionnaire from Markdown."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[1]
source = root / 'doc/06_社区宠物到家_小程序运营业务流程需求调查_V0.4.md'
text = source.read_text()
known = re.search(r'## 已确认试点条件\n(.*?)(?=\n## )', text, re.S)
assert known
facts = [line[2:].strip() for line in known.group(1).splitlines() if line.startswith('- ')]
sections = [
    ('S', '服务与运营安排', '确认服务对象、项目、内容与时段。'),
    ('C', '客户端流程', '由运营方定义居民在小程序里的预约、付款、查看和确认路径。'),
    ('W', '工作人员流程', '明确社区接待、上门执行、报告和交接的日常步骤。'),
    ('B', '后台日常流程', '明确平台调度、客服和专业部门每天需要处理的业务。'),
    ('R', '审核与退回', '明确谁审核、看什么、通过后做什么、退回后谁补充和复核。'),
    ('X', '异常与售后', '明确正常流程走不下去时谁接管、怎样决定和告知结果。'),
]
questions = []
for match in re.finditer(r'❓ \*\*([SCWBRX]\d{2}) (.*?)\*\*\s*\n(.*?)(?=\n❓ \*\*[SCWBRX]|\n## |\Z)', text, re.S):
    qid, title, body = match.groups()
    def field(label, following):
        return body.split('**' + label + '**：', 1)[1].split('**' + following + '**：', 1)[0].strip()
    prompt = field('业务问题', '推荐流程')
    recommended = field('推荐流程', '场景追问（Grill-me）')
    challenge = field('场景追问（Grill-me）', '需要补充')
    required = field('需要补充', '前置问题')
    deps = re.findall(r'[SCWBRX]\d{2}', field('前置问题', '填写方式'))
    options = re.findall(r'^- \[ \] (.+)$', body, re.M)
    questions.append(dict(id=qid, section=qid[0], title=title, prompt=prompt, recommended=recommended, challenge=challenge, required=required, dependencies=deps, options=options, single='**填写方式**：单选' in body))
assert len(questions) == 38
assert len({q['id'] for q in questions}) == 38
assert {q['id'] for q in questions} == {f'{s}{i:02}' for s, count in [('S',5),('C',8),('W',8),('B',6),('R',5),('X',6)] for i in range(1,count+1)}
assert facts == ['试点所在地：中国杭州。', '试点对象：两个生活居民社区。']
for q in questions:
    assert all(q[k] for k in ['title','prompt','recommended','challenge','required','options'])
    assert not re.search(r'数据库|技术栈|API|接口对接|服务器|研发排期|研发估算|RPO|RTO|MFA', ' '.join(str(v) for v in q.values()))
settled, remaining = set(), {q['id']:set(q['dependencies']) for q in questions}
while remaining:
    frontier = {qid for qid, deps in remaining.items() if deps <= settled}
    assert frontier, 'Unknown prerequisite or dependency cycle'
    settled.update(frontier)
    remaining = {qid:deps for qid,deps in remaining.items() if qid not in frontier}
(root / 'questionnaire.json').write_text(json.dumps(dict(version='0.4', confirmedFacts=facts, sections=sections, questions=questions), ensure_ascii=False, indent=2) + '\n')
print('PASS: 38 business-flow questions, six operating sections, known facts, complete scenario fields, valid decision dependencies.')
