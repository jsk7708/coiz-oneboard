'use client'

import { useEffect, useState } from 'react'

type OrgNode = {
  name: string
  children?: OrgNode[]
}

const ORG_TREE: OrgNode = {
  name: 'CEO',
  children: [
    {
      name: '실장',
      children: [{ name: '회계팀' }]
    },
    {
      name: '상무',
      children: [
        {
          name: '본부장',
          children: [
            {
              name: '영업팀',
              children: [
                { name: '임상팀 (국내영업)' },
                { name: '중국팀' },
                { name: '영어팀' }
              ]
            },
            { name: '마케팅팀' },
            { name: '디자인팀' }
          ]
        },  
        {name: '기획팀'},
        {name: 'DS팀'} ,
        {name: '물류팀'},
        {name: '기계팀'}
        ]
        }
      ]
    }
  

// 팀별 구성원 정의
const TEAM_MEMBERS: Record<string, string[]> = {
  'CEO' : ['우지산(CEO)'],
  '실장': ['이정민실장'] ,
  '상무': ['반남숙상무'],
  '본부장': ['류혜윤본부장'],
  '영업팀' : ['이경선팀장'],
  '회계팀': ['강다정매니저', '김민정매니저'],
  '임상팀 (국내영업)': ['고혜은파트장','고다현매니저','고지호매니저','류채민매니저','이창현매니저','한여름매니저'],
  '중국팀': ['김리리매니저','심조이매니저','종상경매니저','왕서아매니저','유옥매니저'],
  '영어팀': ['김수지매니저','레이첼매니저','박성환매니저','아요나매니저','양희범매니저'],
  '마케팅팀': ['양희용팀장','최정미파트장','노윤서매니저','전지은매니저','이면우매니저','이진석매니저','최서현매니저'],
  '디자인팀' :['송유정팀장','이유진파트장','김서영매니저','김상민매니저','김종담매니저','김인선매니저','안민성매니저','안상아매니저','이륜관매니저'],
  '기획팀' :['한진경파트장','이은서매니저'],
  'DS팀' :['김정숙파트장'],
  '물류팀': ['신제호팀장','박성원파트장','김민철매니저','김상우매니저','김윤영매니저','이지용매니저','이동주매니저','윤혜영매니저','윤정민매니저'],
  '기계팀' :['우정담공장장','전용화파트장','김병준매니저','김진수매니저','정민교매니저','이강서매니저']
}

export default function OrganizationTree() {
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [jobInfoMap, setJobInfoMap] = useState<Record<string, boolean>>({})
  const [jobInfoMapReady, setJobInfoMapReady] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({
    업무: '',
    실적: '',
    목표: '',
    희망: '',
    건의: '',
    능력: '',
    비밀번호: ''
  })
  
  const [isPasswordPromptVisible, setIsPasswordPromptVisible] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [pendingMemberForEdit, setPendingMemberForEdit] = useState<string | null>(null)
  
  const [isReadOnly, setIsReadOnly] = useState(false);

  const fetchJobInfoStatus = async (team: string) => {
    try {
      setJobInfoMapReady(false)
      const res = await fetch(`/api/sales?name=get_all_member_job_info&team=${team}`)
      const data = await res.json()
      const membersWithInfo = data[0] || []
      const map: Record<string, boolean> = {}
      membersWithInfo.forEach((item: { member_name: string }) => {
        map[item.member_name] = true
      })
      setJobInfoMap(map)
      setJobInfoMapReady(true)
    } catch (err) {
      console.error('❌ 구성원 직무 정보 조회 실패:', err)
      setJobInfoMapReady(false)
    }
  }

  useEffect(() => {
    if (!selected || !TEAM_MEMBERS[selected]) return
    fetchJobInfoStatus(selected)
  }, [selected])

  const renderNode = (node: OrgNode): JSX.Element => {
    const hasChildren = node.children && node.children.length > 0

    return (
      <div className="flex flex-col items-center relative">
        {/* 상자 */}
        <div
          className="px-4 py-2 border rounded bg-white text-sm font-medium cursor-pointer hover:bg-blue-100 transition"
          onClick={() => setSelected(node.name)}
        >
          {node.name}
        </div>

        {hasChildren && (
          <>
            {/* ⬇ 수직선: 부모 → 수평선까지 */}
            <div className="w-0.5 h-6 bg-gray-400"></div>

            {/* 수평선 + 자식 노드들 */}
            <div className="relative flex justify-center items-start">
              {/* ⬅ 수평선 */}
              <div className="absolute top-0.1 left-0 right-0 h-0.5 bg-gray-400 z-0" />

              {node.children!.map((child, index) => (
                <div className="flex flex-col items-center px-4 relative z-10" key={index}>
                  {/* ⬇ 수직선: 수평선 → 자식 */}
                  <div className="w-0.5 h-6 bg-gray-400"></div>
                  {renderNode(child)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }
  
  const handleSave = async () => {
    if (!selectedMember || !selectedTeam) {
        alert('구성원 또는 팀이 선택되지 않았습니다.');
        return;
    }
    
    if (!form.비밀번호.trim()) {
      alert('정보 수정시 필요하므로 비밀번호를 꼭 입력해주세요.');
      return;
    }

    const payload = {
        api: 'post_save_coiz_member_job_info', // 반드시 route.ts의 switch와 일치
        member_name: selectedMember,
        team_name: selectedTeam || '', // 선택된 팀이 있다면 포함 (없다면 공백)
        task: form.업무,
        performance: form.실적,
        goal: form.목표,
        hope: form.희망,
        suggestion: form.건의,
        skill: form.능력,
        password: form.비밀번호 || '' // 없으면 빈값
    };

    console.log('✅ 저장할 직무 정보:', payload);

    try {
        const res = await fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (res.ok) {
        alert('직무 정보가 저장되었습니다.');
        
        //저장 후 직무정보 다시 조회해서 버튼 상태 즉시 반영
        if (selectedTeam) {
            await fetchJobInfoStatus(selectedTeam);
        }

        setSelectedMember(null);
        setSelectedTeam(null);
        setForm({
            업무: '',
            실적: '',
            목표: '',
            희망: '',
            건의: '',
            능력: '',
            비밀번호: '' // 혹시 포함되면 초기화
        });
        } else {
        alert(`저장 실패: ${result.error}`);
        }
    } catch (err) {
        console.error('❌ 저장 중 오류 발생:', err);
        alert('오류가 발생했습니다.');
    }
    };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-center">조직도</h2>

      <div className="overflow-x-auto">
        <div className="min-w-fit flex justify-center">
            {renderNode(ORG_TREE)}
        </div>
      </div>

      {selected && (
        <div className="bg-gray-100 border p-4 rounded-md mt-4 max-w-lg mx-auto">
            <h3 className="text-lg font-semibold">{selected} 구성원</h3>

            {!jobInfoMapReady ? (
            <p className="text-sm text-gray-500 mt-2">⏳ 직무 정보 불러오는 중...</p>
            ) : TEAM_MEMBERS[selected] ? (
            <ul className="space-y-2 mt-2">
                {TEAM_MEMBERS[selected].map((member) => (
                <li key={member} className="flex items-center justify-between border rounded px-3 py-2 bg-white">
                    <span>{member}</span>
                    <button
                        onClick={() => {
                            //console.log('[CLICK] 구성원:', member)
                            //console.log('jobInfoMap:', jobInfoMap)
                            //console.log('jobInfoMap[member]:', jobInfoMap[member])

                            if (jobInfoMap[member]) {
                            // 직무정보 수정 → 비밀번호 입력부터
                            //console.log('🔐 수정 모드 - 비밀번호 확인 모달 열기')
                            setPendingMemberForEdit(member);
                            setSelectedTeam(selected);  // 선택된 팀도 유지
                            setIsPasswordPromptVisible(true);
                            } else {
                            // 직무정보 입력
                            //console.log('🆕 입력 모드 - 입력 폼 열기')
                            setSelectedMember(member);
                            setSelectedTeam(selected);
                            }
                        }}
                        className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                        {jobInfoMap[member] ? '직무정보 수정' : '직무정보 입력'}
                    </button>
                </li>
                ))}
            </ul>
            ) : (
            <p className="text-sm text-gray-500 mt-2">등록된 구성원이 없습니다.</p>
            )}
        </div>
      )}

      {selectedMember && (
        <div className="bg-white fixed inset-0 bg-opacity-60 backdrop-blur flex justify-center items-center z-50">
          <div className="bg-white border rounded-lg p-6 w-full max-w-2xl space-y-4 shadow-lg">
            <h3 className="text-lg font-bold mb-2">{selectedMember} 직무 정보 입력</h3>
            {[
              ['업무', '평상시 주요업무 / 보조업무'],
              ['실적', '최근 6개월 주요업무 실적'],
              ['목표', '향후 6개월 주요업무 목표'],
              ['희망', '향후 하고 싶은 일'],
              ['건의', '건의 및 제안사항'],
              ['능력', '전문가적 능력사항']
            ].map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <textarea
                  rows={2}
                  className="w-full border rounded p-2 text-sm"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  readOnly={isReadOnly}
                />
              </div>
            ))}
            <div>
            <label className="block text-sm font-medium mb-1">비밀번호 입력 (수정 시 확인용)</label>
            <input
                type="password"
                className="w-full border rounded p-2 text-sm"
                value={form['비밀번호']}
                onChange={(e) => setForm({ ...form, ['비밀번호']: e.target.value })}
                readOnly={isReadOnly}
            />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
              >
                취소
              </button>
              {!isReadOnly && (
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                저장
              </button>
              )}
            </div>
          </div>
        </div>
      )}
      {isPasswordPromptVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold">비밀번호 확인</h3>
            <input
                type="password"
                placeholder="비밀번호 입력"
                className="w-full border p-2 rounded text-sm"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
                <button
                className="px-4 py-2 text-gray-600 border rounded"
                onClick={() => {
                    setIsPasswordPromptVisible(false);
                    setPasswordInput('');
                    setPendingMemberForEdit(null);
                }}
                >
                취소
                </button>
                <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={async () => {

                    //마스터비밀번호
                    const masterPassword = '1QA@WS#ED0078';

                    // 비밀번호 검증
                    const res = await fetch(`/api/sales?name=verify_member_password&member_name=${pendingMemberForEdit}&team_name=${selectedTeam}&password=${passwordInput}`);
                    const result = await res.json();
                     //console.log('[비밀번호:', result)
                    const dbPwd = result?.[0]?.[0]?.pwd;
                    if ((res.ok && dbPwd === passwordInput) || passwordInput === masterPassword) {
                    // 비밀번호 맞으면 직무정보 가져오기
                    const res2 = await fetch(`/api/sales?name=get_member_job_info&member=${pendingMemberForEdit}&team=${selectedTeam}`);
                    const data = await res2.json();
                    const info = data[0]?.[0] || {}; 

                    setForm({
                        업무: info.task || '',
                        실적: info.performance || '',
                        목표: info.goal || '',
                        희망: info.hope || '',
                        건의: info.suggestion || '',
                        능력: info.skill || '',
                        비밀번호: passwordInput
                    });

                    setSelectedMember(pendingMemberForEdit); // 폼 표시
                    setIsPasswordPromptVisible(false);
                    setPasswordInput('');
                    setIsReadOnly(passwordInput === masterPassword);
                    } else {
                    alert("비밀번호가 틀렸습니다.- 관리자에게 문의 바랍니다!");
                    }
                }}
                >
                확인
                </button>
            </div>
            </div>
        </div>
       )}

    </div>
  )
}

  