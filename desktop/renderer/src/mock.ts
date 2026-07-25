export interface Session {
  id: string
  title: string
}

export const MOCK_SESSIONS: Session[] = [
  { id: 's1', title: '知识图谱问答' },
  { id: 's2', title: '代码生成任务' },
  { id: 's3', title: '数据分析助手' }
]
