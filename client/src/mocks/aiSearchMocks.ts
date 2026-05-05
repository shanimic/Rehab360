import type { AiQuery, SavedContent, SourceCard, AiExchange, AiConversation } from '@/types'

export const MOCK_USER_EMAIL = 'patient@test.com'

export const mockQueryHistory: AiQuery[] = [
  {
    query_id: 'q-001',
    user_id: MOCK_USER_EMAIL,
    query_text: 'Is it normal to feel pain after knee exercises?',
    query_date: '2026-04-06',
  },
  {
    query_id: 'q-002',
    user_id: MOCK_USER_EMAIL,
    query_text: 'How long does rotator cuff recovery take?',
    query_date: '2026-04-05',
  },
  {
    query_id: 'q-003',
    user_id: MOCK_USER_EMAIL,
    query_text: 'Best exercises for lower back pain relief',
    query_date: '2026-04-04',
  },
]

export const mockSearchResults: SourceCard[] = [
  {
    title: 'Understanding Post-Exercise Knee Pain',
    description:
      'Post-exercise knee pain is a common experience among rehabilitation patients. Delayed onset muscle soreness (DOMS) typically appears 24–48 hours after exercise and resolves within 72 hours. Persistent or worsening pain may indicate patellofemoral syndrome or cartilage issues and warrants professional evaluation.',
    content_type: 'Article',
    url: 'https://example.com/knee-pain',
    is_verified: false,
  },
  {
    title: 'Knee Rehabilitation Clinical Guidelines 2024',
    description:
      'Evidence-based guidelines for knee rehabilitation recommend a progressive loading approach. Phase 1 focuses on pain management and range of motion. Phase 2 introduces strengthening exercises. Phase 3 incorporates functional and sport-specific movements.',
    content_type: 'Clinical Guideline',
    url: 'https://example.com/knee-guidelines',
    is_verified: true,
  },
  {
    title: 'Knee Strengthening Exercise Protocol',
    description:
      'A structured knee strengthening protocol includes quad sets, straight leg raises, mini squats, and step-ups. Begin with 2 sets of 10 repetitions and progress gradually. Ensure proper form throughout — avoid knee valgus (caving inward) and maintain alignment.',
    content_type: 'Exercise Guide',
    url: 'https://example.com/knee-protocol',
    is_verified: true,
  },
  {
    title: 'Pain Management in Knee Rehabilitation',
    description:
      'Effective pain management during knee rehabilitation combines ice therapy (20 min post-exercise), NSAID use when prescribed, activity modification, and graded exercise exposure. The RICE method remains a cornerstone for acute pain management.',
    content_type: 'Clinical Guideline',
    url: 'https://example.com/pain-management',
    is_verified: true,
  },
]

export const mockSavedContent: SavedContent[] = [
  {
    recommendation_id: 'rec-002',
    query_id: 'q-001',
    content_title: 'Knee Rehabilitation Clinical Guidelines 2024',
    content_text:
      'Evidence-based guidelines for knee rehabilitation recommend a progressive loading approach. Phase 1 focuses on pain management and range of motion. Phase 2 introduces strengthening exercises. Phase 3 incorporates functional and sport-specific movements.',
    content_type: 'Clinical Guideline',
    source_url: 'https://example.com/knee-guidelines',
    verified_by_physio: true,
    verified_by_trainer: false,
    created_at: '2026-04-06T14:31:00Z',
  },
  {
    recommendation_id: 'rec-004',
    query_id: 'q-001',
    content_title: 'Pain Management in Knee Rehabilitation',
    content_text:
      'Effective pain management during knee rehabilitation combines ice therapy (20 min post-exercise), NSAID use when prescribed, activity modification, and graded exercise exposure.',
    content_type: 'Clinical Guideline',
    source_url: 'https://example.com/pain-management',
    verified_by_physio: true,
    verified_by_trainer: true,
    created_at: '2026-04-06T14:33:00Z',
  },
]

export const mockExchange: AiExchange = {
  query_id: 'q-001',
  query_content: 'Is it normal to feel pain after knee exercises?',
  ai_summary:
    'Some discomfort after knee exercises is normal, especially when starting a new program. However, sharp or intense pain may indicate injury. It is important to differentiate between muscle soreness (DOMS) which typically peaks 24–48 hours post-exercise, and joint pain which should be evaluated by a professional. Always follow your physiotherapist\'s guidance on pain thresholds during rehabilitation.',
  sources: mockSearchResults,
}

export const mockConversation: AiConversation = [mockExchange]
