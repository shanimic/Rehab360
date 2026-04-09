export interface Exercise {
  id: number
  name: string
  plan: 'Treatment Plan' | 'Training Plan'
  desc: string
  done: boolean
}

export interface Session {
  id: number
  title: string
  professional: string
  date: Date
  time: string
  type: 'online' | 'clinic'
  color: string
}
