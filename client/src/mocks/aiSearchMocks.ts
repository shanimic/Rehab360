import type { AiQuery, SavedContent, AiExchange, AiConversation } from '@/types'

export const MOCK_USER_EMAIL = 'patient@test.com'

export const mockQueryHistory: AiQuery[] = [
  {
    query_id: 'q-001',
    user_id: MOCK_USER_EMAIL,
    query_content: 'Is it normal to feel pain after knee exercises?',
    ai_response:
      'Some discomfort after knee exercises is normal, especially when starting a new program. However, sharp or intense pain may indicate injury. It is important to differentiate between muscle soreness (DOMS) which typically peaks 24–48 hours post-exercise, and joint pain which should be evaluated by a professional.',
    query_date: '2026-04-06',
    query_time: '14:30:00',
  },
  {
    query_id: 'q-002',
    user_id: MOCK_USER_EMAIL,
    query_content: 'How long does rotator cuff recovery take?',
    ai_response:
      'Recovery from a rotator cuff injury varies widely depending on severity. Minor tears may heal in 4–6 weeks with physical therapy, while surgical repairs can require 6–12 months. Consistent adherence to a rehabilitation program is key to full recovery.',
    query_date: '2026-04-05',
    query_time: '09:15:00',
  },
  {
    query_id: 'q-003',
    user_id: MOCK_USER_EMAIL,
    query_content: 'Best exercises for lower back pain relief',
    ai_response:
      'Gentle exercises such as cat-cow stretches, pelvic tilts, bird-dog, and knee-to-chest stretches are commonly recommended for lower back pain relief. Always consult your physiotherapist before starting a new exercise routine to ensure suitability for your specific condition.',
    query_date: '2026-04-04',
    query_time: '16:45:00',
  },
]

export const mockSearchResults: SavedContent[] = [
  {
    recommendation_id: 'rec-001',
    query_id: 'q-001',
    content_title: 'Understanding Post-Exercise Knee Pain',
    content_text:
      'Post-exercise knee pain is a common experience among rehabilitation patients. Delayed onset muscle soreness (DOMS) typically appears 24–48 hours after exercise and resolves within 72 hours. Persistent or worsening pain may indicate patellofemoral syndrome or cartilage issues and warrants professional evaluation.',
    content_type: 'Article',
    source_url: 'https://example.com/knee-pain',
    verified_by_physio: false,
    verified_by_trainer: false,
    is_injected: false,
    created_at: '2026-04-06T14:30:00Z',
  },
  {
    recommendation_id: 'rec-002',
    query_id: 'q-001',
    content_title: 'Knee Rehabilitation Clinical Guidelines 2024',
    content_text:
      'Evidence-based guidelines for knee rehabilitation recommend a progressive loading approach. Phase 1 focuses on pain management and range of motion. Phase 2 introduces strengthening exercises. Phase 3 incorporates functional and sport-specific movements. Each phase transition should be guided by a qualified physiotherapist.',
    content_type: 'Clinical Guideline',
    source_url: 'https://example.com/knee-guidelines',
    verified_by_physio: true,
    verified_by_trainer: false,
    is_injected: true,
    created_at: '2026-04-06T14:31:00Z',
  },
  {
    recommendation_id: 'rec-003',
    query_id: 'q-001',
    content_title: 'Knee Strengthening Exercise Protocol',
    content_text:
      'A structured knee strengthening protocol includes quad sets, straight leg raises, mini squats, and step-ups. Begin with 2 sets of 10 repetitions and progress gradually. Ensure proper form throughout — avoid knee valgus (caving inward) and maintain alignment. Rest at least 48 hours between sessions.',
    content_type: 'Exercise Guide',
    source_url: 'https://example.com/knee-protocol',
    verified_by_physio: false,
    verified_by_trainer: true,
    is_injected: false,
    created_at: '2026-04-06T14:32:00Z',
  },
  {
    recommendation_id: 'rec-004',
    query_id: 'q-001',
    content_title: 'Pain Management in Knee Rehabilitation',
    content_text:
      'Effective pain management during knee rehabilitation combines ice therapy (20 min post-exercise), NSAID use when prescribed, activity modification, and graded exercise exposure. The RICE method (Rest, Ice, Compression, Elevation) remains a cornerstone for acute pain management. Always consult your healthcare team before modifying your pain management plan.',
    content_type: 'Clinical Guideline',
    source_url: 'https://example.com/pain-management',
    verified_by_physio: true,
    verified_by_trainer: true,
    is_injected: true,
    created_at: '2026-04-06T14:33:00Z',
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
    is_injected: true,
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
    is_injected: true,
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
