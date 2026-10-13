"""Generate the browser questionnaire from the reviewed Markdown source."""
from pathlib import Path
import json
import re

root = Path(__file__).resolve().parents[1]
source = root / 'doc/05_社区宠物到家_平台运营方需求确认问卷_Grill-me_V0.3.md'
text = source.read_text()
questions = []
known_section = re.search(r'## 已确认试点条件\n(.*?)(?=\n## )', text, re.S)
assert known_section, 'Confirmed pilot facts are missing'
confirmed_facts = [line[2:].strip() for line in known_section.group(1).splitlines() if line.startswith('- ')]
assert confirmed_facts == ['试点所在地：中国杭州。', '试点对象：两个生活居民社区。']

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

for match in re.finditer(r'\*\*([A]\d{2})(★?) (.*?)\*\*\s*\n(.*?)(?=\n\*\*[A]\d{2}|\n## |\Z)', text, re.S):
    qid, star, title, body = match.groups()
    options, prompts = [], []
    for line in body.splitlines():
        if line.startswith('- [ ] '):
            options.append(line[6:].strip())
        elif line.strip() and line.strip() != '---' and not line.startswith('回收完成后'):
            prompts.append(line.removeprefix('- ').strip())
    questions.append(dict(id=qid, section=qid[0], title=title, prompt=clean('\n'.join(prompts)), options=options, single='单选' in title or '最多' in title, required=bool(star)))
    # "最多选" questions allow several selections; their limit is handled in the UI.
    if '最多' in title:
        questions[-1]['single'] = False
    limit = re.search(r'最多选\s*(\d+)\s*项', title)
    questions[-1]['maxChoices'] = int(limit.group(1)) if limit else None

assert len(questions) == 53, len(questions)
assert len({q['id'] for q in questions}) == 53
assert {q['id'] for q in questions} == {f'{s}{i:02}' for s, count in [('G',30),('A',24)] for i in range(1,count+1)} - {'A01'}
for q in questions:
    assert q['title'] and isinstance(q['options'],list)
    assert q['id'] not in q.get('dependencies',[])
assert {q['section'] for q in questions} == {'A', 'G'}
settled = set()
remaining = {q['id']: set(q.get('dependencies', [])) for q in questions if q['section'] == 'G'}
while remaining:
    frontier = {qid for qid, deps in remaining.items() if deps <= settled}
    assert frontier, 'Decision dependencies contain a cycle or an unknown question'
    settled.update(frontier)
    remaining = {qid: deps for qid, deps in remaining.items() if qid not in frontier}
(root / 'questionnaire.json').write_text(json.dumps(dict(version='0.3', confirmedFacts=confirmed_facts, questions=questions), ensure_ascii=False, indent=2) + '\n')
print('Generated 53 questions: 30 Grill-me + 23 operator questions; Hangzhou pilot facts confirmed.')
