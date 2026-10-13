"""Generate the browser questionnaire from the reviewed Markdown source."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[1]
source = root / 'doc/04_社区宠物到家_需求确认问卷_Grill-me_V0.2.md'
text = source.read_text()
questions = []

def clean(value):
    return re.sub(r'\*\*|➡️|❓', '', value).strip()

for match in re.finditer(r'❓ \*\*(G\d{2}) (.*?)\*\*\s*\n(.*?)(?=\n❓ \*\*G|\n## |\Z)', text, re.S):
    qid, title, body = match.groups()
    prompt, rest = body.split('➡️ **推荐**：', 1)
    recommended, rest = rest.split('**Grill-me**：', 1)
    challenge, rest = rest.split('**影响**：', 1)
    impact, rest = rest.split('**必填**：', 1)
    required = rest.split('**来源**：', 1)[0].split('\n- [ ]')[0].strip()
    depmatch = re.search(r'前置：(.*?)。', prompt)
    deps = set()
    if depmatch:
        deptext = depmatch.group(1)
        for lo, hi in re.findall(r'G(\d{2}) 至 G(\d{2})', deptext):
            deps.update(f'G{i:02}' for i in range(int(lo), int(hi) + 1))
        deps.update(re.findall(r'G\d{2}', deptext))
        prompt = prompt[depmatch.end():].strip()
    questions.append(dict(id=qid, section='G', title=title, prompt=clean(prompt), recommended=clean(recommended), challenge=clean(challenge), impact=clean(impact), required=clean(required), dependencies=sorted(deps), options=['是，接受推荐', '修改推荐', '待讨论'], single=True))

for match in re.finditer(r'\*\*([ABCD]\d{2})(★?) (.*?)\*\*\s*\n(.*?)(?=\n\*\*[ABCD]\d{2}|\n## |\Z)', text, re.S):
    qid, star, title, body = match.groups()
    options, prompts = [], []
    for line in body.splitlines():
        if line.startswith('- [ ] '):
            options.append(line[6:].strip())
        elif line.strip() and line.strip() != '---' and not line.startswith('回收完成后'):
            prompts.append(line.removeprefix('- ').strip())
    questions.append(dict(id=qid, section=qid[0], title=title, prompt=clean('\n'.join(prompts)), options=options, single='单选' in title or '最多' in title or (qid.startswith('C') and qid in ['C02','C05','C08','C11','C12']) or (qid.startswith('D') and qid in ['D01','D04','D05','D07','D08']), required=bool(star)))
    # "最多选" questions allow several selections; their limit is handled in the UI.
    if '最多' in title:
        questions[-1]['single'] = False
    limit = re.search(r'最多选\s*(\d+)\s*项', title)
    questions[-1]['maxChoices'] = int(limit.group(1)) if limit else None

assert len(questions) == 82, len(questions)
assert len({q['id'] for q in questions}) == 82
assert {q['id'] for q in questions} == {f'{s}{i:02}' for s, count in [('G',30),('A',23),('B',9),('C',12),('D',8)] for i in range(1,count+1)}
for q in questions:
    assert q['title'] and isinstance(q['options'],list)
    assert q['id'] not in q.get('dependencies',[])
(root / 'questionnaire.json').write_text(json.dumps(dict(version='0.2', questions=questions), ensure_ascii=False, indent=2) + '\n')
print('Generated 82 questions: 30 Grill-me + 52 basic questions.')
