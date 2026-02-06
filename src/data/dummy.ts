import { 
  User, Recording, Contact, Alert, RecentActivity, 
  TeamSummary, DailyActivity, UserSummary 
} from '@/types'

// Current User (Manager)
export const currentUser: User = {
  id: 'user-001',
  organizationId: 'org-001',
  email: 'manager@company.com',
  name: 'Sarah Manager',
  avatar: undefined,
  role: 'manager',
  status: 'active',
  deviceIds: [],
  createdAt: '2024-01-01T00:00:00Z',
  lastActiveAt: new Date().toISOString()
}

// Team Members (Salespeople)
export const teamMembers: User[] = [
  {
    id: 'user-002',
    organizationId: 'org-001',
    email: 'david.liu@company.com',
    name: 'David Liu',
    role: 'salesperson',
    status: 'active',
    deviceIds: ['device-001'],
    createdAt: '2024-01-15T00:00:00Z',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: 'user-003',
    organizationId: 'org-001',
    email: 'amy.zhang@company.com',
    name: 'Amy Zhang',
    role: 'salesperson',
    status: 'active',
    deviceIds: ['device-002'],
    createdAt: '2024-02-01T00:00:00Z',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'user-004',
    organizationId: 'org-001',
    email: 'tom.wong@company.com',
    name: 'Tom Wong',
    role: 'salesperson',
    status: 'active',
    deviceIds: ['device-003'],
    createdAt: '2024-02-15T00:00:00Z',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'user-005',
    organizationId: 'org-001',
    email: 'lisa.chen@company.com',
    name: 'Lisa Chen',
    role: 'salesperson',
    status: 'active',
    deviceIds: [],
    createdAt: '2024-03-01T00:00:00Z',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: 'user-006',
    organizationId: 'org-001',
    email: 'mike.chen@company.com',
    name: 'Mike Chen',
    role: 'salesperson',
    status: 'active',
    deviceIds: ['device-004'],
    createdAt: '2024-03-15T00:00:00Z',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'user-007',
    organizationId: 'org-001',
    email: 'jenny.lee@company.com',
    name: 'Jenny Lee',
    role: 'salesperson',
    status: 'active',
    deviceIds: [],
    createdAt: '2024-04-01T00:00:00Z',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'user-008',
    organizationId: 'org-001',
    email: 'kevin.wu@company.com',
    name: 'Kevin Wu',
    role: 'salesperson',
    status: 'active',
    deviceIds: ['device-005'],
    createdAt: '2024-04-15T00:00:00Z',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  },
  {
    id: 'user-009',
    organizationId: 'org-001',
    email: 'nancy.tan@company.com',
    name: 'Nancy Tan',
    role: 'salesperson',
    status: 'active',
    deviceIds: [],
    createdAt: '2024-05-01T00:00:00Z',
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: 'user-010',
    organizationId: 'org-001',
    email: 'peter.ho@company.com',
    name: 'Peter Ho',
    role: 'salesperson',
    status: 'invited',
    deviceIds: [],
    createdAt: '2024-05-15T00:00:00Z',
    lastActiveAt: '2024-05-15T00:00:00Z'
  }
]

// Recordings
export const recordings: Recording[] = [
  {
    id: 'rec-001',
    organizationId: 'org-001',
    userId: 'user-002',
    userName: 'David Liu',
    audioUrl: '/audio/recording-001.mp3',
    duration: 923,
    fileSize: 5500000,
    recordedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    uploadedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    status: 'ready',
    transcription: "Hi, thanks for meeting with me today. I'm David from TechSolutions. Thanks for coming, David. I'm John, CEO here at Acme. We've been looking at solutions for our Q2 expansion and your platform caught our attention. What specific challenges are you facing with your current setup? Well, we're dealing with data silos across departments, slow reporting cycles, and our team is frustrated with the manual processes...",
    summary: "Key discussion about Q2 partnership for Acme's regional expansion. John (CEO) interested in enterprise tier for data integration challenges. Pain points: data silos, slow reporting, manual processes. Follow-up scheduled for next Tuesday. Budget range: $50-100K annually.",
    contactId: 'contact-001',
    contactName: 'John Smith',
    businessCards: [
      {
        id: 'card-001',
        recordingId: 'rec-001',
        imageUrl: '/cards/card-001.jpg',
        capturedAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
        timestampOffset: 225,
        extractedData: {
          name: 'John Smith',
          company: 'Acme Inc',
          title: 'CEO',
          email: 'john@acme.com',
          phone: '+852 9123 4567'
        },
        contactId: 'contact-001'
      }
    ],
    location: { lat: 22.2783, lng: 114.1747, address: 'HKCEC, Wan Chai' },
    tags: ['enterprise', 'Q2'],
    notes: 'Very promising lead, decision maker'
  },
  {
    id: 'rec-002',
    organizationId: 'org-001',
    userId: 'user-003',
    userName: 'Amy Zhang',
    audioUrl: '/audio/recording-002.mp3',
    duration: 525,
    fileSize: 3200000,
    recordedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    uploadedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    status: 'ready',
    transcription: "Good morning, I'm Amy from TechSolutions. I understand you're looking for a CRM solution...",
    summary: "Initial discovery call with Sarah Lee, Director at TechCorp. Interested in CRM integration features. Currently using spreadsheets for tracking. Team of 15 salespeople. Timeline: Q2 decision.",
    contactId: 'contact-002',
    contactName: 'Sarah Lee',
    businessCards: [
      {
        id: 'card-002',
        recordingId: 'rec-002',
        imageUrl: '/cards/card-002.jpg',
        capturedAt: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
        timestampOffset: 120,
        extractedData: {
          name: 'Sarah Lee',
          company: 'TechCorp',
          title: 'Director of Sales',
          email: 'sarah@techcorp.com',
          phone: '+852 9234 5678'
        },
        contactId: 'contact-002'
      }
    ],
    location: { lat: 22.3193, lng: 114.1694, address: 'Central, Hong Kong' },
    tags: ['SMB', 'CRM'],
    notes: undefined
  },
  {
    id: 'rec-003',
    organizationId: 'org-001',
    userId: 'user-004',
    userName: 'Tom Wong',
    audioUrl: '/audio/recording-003.mp3',
    duration: 1330,
    fileSize: 8100000,
    recordedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    uploadedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    status: 'processing',
    transcription: undefined,
    summary: undefined,
    contactId: undefined,
    contactName: undefined,
    businessCards: [],
    location: { lat: 22.2988, lng: 114.1722, address: 'Admiralty, Hong Kong' },
    tags: [],
    notes: undefined
  },
  {
    id: 'rec-004',
    organizationId: 'org-001',
    userId: 'user-002',
    userName: 'David Liu',
    audioUrl: '/audio/recording-004.mp3',
    duration: 445,
    fileSize: 2700000,
    recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 3 + 1000 * 60 * 5).toISOString(),
    status: 'ready',
    transcription: "Follow-up call regarding the proposal we sent last week...",
    summary: "Follow-up with existing prospect about proposal. They're reviewing internally. Expect decision within 2 weeks.",
    contactId: 'contact-003',
    contactName: 'Michael Johnson',
    businessCards: [],
    location: undefined,
    tags: ['follow-up'],
    notes: 'Waiting for their legal team review'
  },
  {
    id: 'rec-005',
    organizationId: 'org-001',
    userId: 'user-005',
    userName: 'Lisa Chen',
    audioUrl: '/audio/recording-005.mp3',
    duration: 678,
    fileSize: 4100000,
    recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1000 * 60 * 3).toISOString(),
    status: 'ready',
    transcription: "Conference booth visit. Multiple stakeholders discussed their digital transformation needs...",
    summary: "Booth visit at Tech Summit. Three potential leads from manufacturing sector. Collected 4 business cards. Strong interest in automation features.",
    contactId: undefined,
    contactName: undefined,
    businessCards: [
      {
        id: 'card-003',
        recordingId: 'rec-005',
        imageUrl: '/cards/card-003.jpg',
        capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1000 * 60 * 2).toISOString(),
        timestampOffset: 180,
        extractedData: {
          name: 'Robert Tan',
          company: 'Manufacturing Plus',
          title: 'Operations Manager',
          email: 'robert@mfgplus.com',
          phone: '+852 9345 6789'
        }
      },
      {
        id: 'card-004',
        recordingId: 'rec-005',
        imageUrl: '/cards/card-004.jpg',
        capturedAt: new Date(Date.now() - 1000 * 60 * 60 * 5 + 1000 * 60 * 5).toISOString(),
        timestampOffset: 420,
        extractedData: {
          name: 'Emily Wong',
          company: 'Manufacturing Plus',
          title: 'IT Director',
          email: 'emily@mfgplus.com',
          phone: '+852 9456 7890'
        }
      }
    ],
    location: { lat: 22.3964, lng: 114.1095, address: 'AsiaWorld-Expo, Lantau' },
    tags: ['conference', 'manufacturing'],
    notes: 'Hot leads from Tech Summit booth'
  }
]

// Add more recordings for better demo
for (let i = 6; i <= 47; i++) {
  const userIndex = (i % 8) + 2
  const user = teamMembers[userIndex - 2]
  const hoursAgo = i * 2 + Math.random() * 5
  
  recordings.push({
    id: `rec-${String(i).padStart(3, '0')}`,
    organizationId: 'org-001',
    userId: user.id,
    userName: user.name,
    audioUrl: `/audio/recording-${String(i).padStart(3, '0')}.mp3`,
    duration: Math.floor(300 + Math.random() * 900),
    fileSize: Math.floor(2000000 + Math.random() * 5000000),
    recordedAt: new Date(Date.now() - 1000 * 60 * 60 * hoursAgo).toISOString(),
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * hoursAgo + 1000 * 60 * 5).toISOString(),
    status: i % 10 === 0 ? 'processing' : 'ready',
    transcription: 'Sales conversation transcript...',
    summary: 'AI generated summary of the conversation...',
    contactId: i % 3 === 0 ? `contact-${String(i).padStart(3, '0')}` : undefined,
    contactName: i % 3 === 0 ? `Contact ${i}` : undefined,
    businessCards: [],
    location: undefined,
    tags: [],
    notes: undefined
  })
}

// Contacts
export const contacts: Contact[] = [
  {
    id: 'contact-001',
    organizationId: 'org-001',
    createdByUserId: 'user-002',
    createdByUserName: 'David Liu',
    name: 'John Smith',
    company: 'Acme Inc',
    title: 'CEO',
    email: 'john@acme.com',
    phone: '+852 9123 4567',
    status: 'qualified',
    assignedToUserId: 'user-002',
    assignedToUserName: 'David Liu',
    recordingIds: ['rec-001'],
    recordingCount: 1,
    businessCardIds: ['card-001'],
    source: 'business_card',
    tags: ['enterprise', 'decision-maker'],
    notes: 'Met at HKCEC. Very interested in our enterprise solution.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  },
  {
    id: 'contact-002',
    organizationId: 'org-001',
    createdByUserId: 'user-003',
    createdByUserName: 'Amy Zhang',
    name: 'Sarah Lee',
    company: 'TechCorp',
    title: 'Director of Sales',
    email: 'sarah@techcorp.com',
    phone: '+852 9234 5678',
    status: 'new',
    assignedToUserId: 'user-003',
    assignedToUserName: 'Amy Zhang',
    recordingIds: ['rec-002'],
    recordingCount: 1,
    businessCardIds: ['card-002'],
    source: 'business_card',
    tags: ['SMB'],
    notes: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString()
  },
  {
    id: 'contact-003',
    organizationId: 'org-001',
    createdByUserId: 'user-002',
    createdByUserName: 'David Liu',
    name: 'Michael Johnson',
    company: 'Global Enterprises',
    title: 'VP of Sales',
    email: 'michael@globalent.com',
    phone: '+852 9345 6789',
    status: 'proposal',
    assignedToUserId: 'user-002',
    assignedToUserName: 'David Liu',
    recordingIds: ['rec-004'],
    recordingCount: 3,
    businessCardIds: [],
    source: 'recording',
    tags: ['enterprise', 'proposal-sent'],
    notes: 'Proposal sent, waiting for legal review.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  }
]

// Add more contacts
for (let i = 4; i <= 25; i++) {
  const userIndex = (i % 8) + 2
  const user = teamMembers[userIndex - 2]
  const statuses: Contact['status'][] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']
  
  contacts.push({
    id: `contact-${String(i).padStart(3, '0')}`,
    organizationId: 'org-001',
    createdByUserId: user.id,
    createdByUserName: user.name,
    name: `Contact Person ${i}`,
    company: `Company ${i}`,
    title: ['Manager', 'Director', 'VP', 'CEO', 'CFO'][i % 5],
    email: `contact${i}@company${i}.com`,
    phone: `+852 9${String(i).padStart(3, '0')} ${String(i * 111).padStart(4, '0')}`,
    status: statuses[i % 6],
    assignedToUserId: user.id,
    assignedToUserName: user.name,
    recordingIds: [],
    recordingCount: Math.floor(Math.random() * 5),
    businessCardIds: [],
    source: ['recording', 'business_card', 'manual'][i % 3] as Contact['source'],
    tags: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * i).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * i).toISOString()
  })
}

// Alerts
export const alerts: Alert[] = [
  {
    id: 'alert-001',
    type: 'no_activity',
    severity: 'critical',
    userId: 'user-006',
    userName: 'Mike Chen',
    message: 'No recordings for 2 days',
    details: 'Last recording was on Monday at 4:30 PM',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    isRead: false
  },
  {
    id: 'alert-002',
    type: 'low_activity',
    severity: 'warning',
    userId: 'user-009',
    userName: 'Nancy Tan',
    message: 'Below weekly target',
    details: 'Only 8 recordings this week (target: 15)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isRead: false
  },
  {
    id: 'alert-003',
    type: 'low_activity',
    severity: 'warning',
    userId: 'user-005',
    userName: 'Lisa Chen',
    message: 'Low activity today',
    details: 'Only 1 recording today (team average: 5)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    isRead: true
  }
]

// Recent Activity
export const recentActivity: RecentActivity[] = [
  {
    id: 'activity-001',
    type: 'recording_uploaded',
    userId: 'user-002',
    userName: 'David Liu',
    description: 'uploaded a new recording',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString()
  },
  {
    id: 'activity-002',
    type: 'contact_added',
    userId: 'user-003',
    userName: 'Amy Zhang',
    description: 'added a new contact',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'activity-003',
    type: 'recording_completed',
    userId: 'user-004',
    userName: 'Tom Wong',
    description: 'recording processed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'activity-004',
    type: 'business_card_scanned',
    userId: 'user-005',
    userName: 'Lisa Chen',
    description: 'scanned 2 business cards',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'activity-005',
    type: 'recording_uploaded',
    userId: 'user-007',
    userName: 'Jenny Lee',
    description: 'uploaded a new recording',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  }
]

// Team Summary
export const teamSummary: TeamSummary = {
  organizationId: 'org-001',
  period: 'week',
  startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  totalRecordings: 47,
  totalDuration: 66240, // 18h 24m in seconds
  activeUsers: 8,
  totalUsers: 10,
  newContacts: 12,
  byUser: [
    { userId: 'user-002', userName: 'David Liu', recordings: 42, duration: 15120, contacts: 5, activityLevel: 'high' },
    { userId: 'user-003', userName: 'Amy Zhang', recordings: 38, duration: 13680, contacts: 4, activityLevel: 'high' },
    { userId: 'user-004', userName: 'Tom Wong', recordings: 35, duration: 12600, contacts: 3, activityLevel: 'high' },
    { userId: 'user-005', userName: 'Lisa Chen', recordings: 28, duration: 10080, contacts: 2, activityLevel: 'medium' },
    { userId: 'user-006', userName: 'Mike Chen', recordings: 12, duration: 4320, contacts: 1, activityLevel: 'low' },
    { userId: 'user-007', userName: 'Jenny Lee', recordings: 25, duration: 9000, contacts: 2, activityLevel: 'medium' },
    { userId: 'user-008', userName: 'Kevin Wu', recordings: 22, duration: 7920, contacts: 2, activityLevel: 'medium' },
    { userId: 'user-009', userName: 'Nancy Tan', recordings: 8, duration: 2880, contacts: 1, activityLevel: 'low' }
  ]
}

// Daily Activity for chart
export const weeklyActivity: DailyActivity[] = [
  { userId: 'team', userName: 'Team', date: '2026-02-01', recordingsCount: 45, totalDuration: 16200, contactsAdded: 8, businessCardsScanned: 12, isLowActivity: false, activityLevel: 'high' },
  { userId: 'team', userName: 'Team', date: '2026-02-02', recordingsCount: 52, totalDuration: 18720, contactsAdded: 10, businessCardsScanned: 15, isLowActivity: false, activityLevel: 'high' },
  { userId: 'team', userName: 'Team', date: '2026-02-03', recordingsCount: 48, totalDuration: 17280, contactsAdded: 7, businessCardsScanned: 11, isLowActivity: false, activityLevel: 'high' },
  { userId: 'team', userName: 'Team', date: '2026-02-04', recordingsCount: 41, totalDuration: 14760, contactsAdded: 6, businessCardsScanned: 9, isLowActivity: false, activityLevel: 'medium' },
  { userId: 'team', userName: 'Team', date: '2026-02-05', recordingsCount: 38, totalDuration: 13680, contactsAdded: 5, businessCardsScanned: 8, isLowActivity: false, activityLevel: 'medium' },
  { userId: 'team', userName: 'Team', date: '2026-02-06', recordingsCount: 15, totalDuration: 5400, contactsAdded: 2, businessCardsScanned: 3, isLowActivity: false, activityLevel: 'low' },
  { userId: 'team', userName: 'Team', date: '2026-02-07', recordingsCount: 47, totalDuration: 16920, contactsAdded: 12, businessCardsScanned: 14, isLowActivity: false, activityLevel: 'high' }
]

// Helper function to get recordings by user
export function getRecordingsByUser(userId: string): Recording[] {
  return recordings.filter(r => r.userId === userId)
}

// Helper function to get contacts by user  
export function getContactsByUser(userId: string): Contact[] {
  return contacts.filter(c => c.assignedToUserId === userId)
}

// Helper function to get user by ID
export function getUserById(userId: string): User | undefined {
  if (userId === currentUser.id) return currentUser
  return teamMembers.find(u => u.id === userId)
}

// Helper function to get recording by ID
export function getRecordingById(recordingId: string): Recording | undefined {
  return recordings.find(r => r.id === recordingId)
}

// Helper function to get contact by ID
export function getContactById(contactId: string): Contact | undefined {
  return contacts.find(c => c.id === contactId)
}
