import {
  transformRecording,
  transformRecordings,
  transformContact,
  transformContacts,
  transformSubordinate,
  transformUserSummary,
  transformAlert,
  transformRecentActivity,
  transformDashboard,
} from '../lib/api/transforms';

describe('Recording Transforms', () => {
  it('transforms API recording to frontend model', () => {
    const apiRecording = {
      id: 1,
      user_id: 10,
      audio_url: 'https://example.com/audio.mp3',
      duration: 120,
      created_at: '2026-02-19T10:00:00Z',
      status: 'completed',
      user: {
        display_name: 'John Doe',
        email: 'john@example.com',
      },
      contact_id: 5,
      contact: {
        first_name: 'Jane',
        last_name: 'Smith',
        primary_email: 'jane@example.com',
      },
      transcription: {
        text: 'Hello, this is a test transcription.',
        executive_summary: {
          summary: 'A test meeting summary',
        },
      },
    };

    const result = transformRecording(apiRecording as any);

    expect(result.id).toBe('1');
    expect(result.userId).toBe('10');
    expect(result.userName).toBe('John Doe');
    expect(result.audioUrl).toBe('https://example.com/audio.mp3');
    expect(result.duration).toBe(120);
    expect(result.status).toBe('ready');
    expect(result.contactName).toBe('Jane Smith');
    expect(result.transcription).toBe('Hello, this is a test transcription.');
    expect(result.summary).toBe('A test meeting summary');
  });

  it('handles pending status', () => {
    const apiRecording = {
      id: 1,
      user_id: 10,
      status: 'pending',
      created_at: '2026-02-19T10:00:00Z',
    };

    const result = transformRecording(apiRecording as any);
    expect(result.status).toBe('uploading');
  });

  it('handles processing status', () => {
    const apiRecording = {
      id: 1,
      user_id: 10,
      status: 'processing',
      created_at: '2026-02-19T10:00:00Z',
    };

    const result = transformRecording(apiRecording as any);
    expect(result.status).toBe('processing');
  });

  it('handles failed status', () => {
    const apiRecording = {
      id: 1,
      user_id: 10,
      status: 'failed',
      created_at: '2026-02-19T10:00:00Z',
    };

    const result = transformRecording(apiRecording as any);
    expect(result.status).toBe('failed');
  });

  it('transforms array of recordings', () => {
    const apiRecordings = [
      { id: 1, user_id: 10, status: 'completed', created_at: '2026-02-19T10:00:00Z' },
      { id: 2, user_id: 10, status: 'pending', created_at: '2026-02-19T11:00:00Z' },
    ];

    const result = transformRecordings(apiRecordings as any);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });
});

describe('Contact Transforms', () => {
  it('transforms API contact to frontend model', () => {
    const apiContact = {
      id: 5,
      user_id: 10,
      first_name: 'Jane',
      last_name: 'Smith',
      primary_email: 'jane@example.com',
      job_title: 'CEO',
      mobile_number: '+1234567890',
      work_phone: '+0987654321',
      notes: 'Important client',
      created_at: '2026-02-15T10:00:00Z',
      updated_at: '2026-02-19T10:00:00Z',
      languages: [
        { language_code: 'EN', company: 'Acme Corp', job_title: 'CEO' },
      ],
    };

    const result = transformContact(apiContact as any);

    expect(result.id).toBe('5');
    expect(result.name).toBe('Jane Smith');
    expect(result.email).toBe('jane@example.com');
    expect(result.phone).toBe('+1234567890');
    expect(result.title).toBe('CEO');
    expect(result.company).toBe('Acme Corp');
    expect(result.notes).toBe('Important client');
  });

  it('handles contact with only email', () => {
    const apiContact = {
      id: 1,
      user_id: 10,
      primary_email: 'unknown@example.com',
      created_at: '2026-02-15T10:00:00Z',
    };

    const result = transformContact(apiContact as any);
    expect(result.name).toBe('unknown@example.com');
  });

  it('transforms array of contacts', () => {
    const apiContacts = [
      { id: 1, user_id: 10, first_name: 'John', last_name: 'Doe', created_at: '2026-02-15T10:00:00Z' },
      { id: 2, user_id: 10, first_name: 'Jane', last_name: 'Smith', created_at: '2026-02-15T10:00:00Z' },
    ];

    const result = transformContacts(apiContacts as any);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('John Doe');
    expect(result[1].name).toBe('Jane Smith');
  });
});

describe('Subordinate Transforms', () => {
  it('transforms API subordinate to User model', () => {
    const apiSubordinate = {
      id: 20,
      email: 'employee@example.com',
      display_name: 'Employee Name',
      role: 'salesperson',
      status: 'active',
      created_at: '2026-01-01T10:00:00Z',
      last_active_at: '2026-02-19T10:00:00Z',
    };

    const result = transformSubordinate(apiSubordinate as any);

    expect(result.id).toBe('20');
    expect(result.email).toBe('employee@example.com');
    expect(result.name).toBe('Employee Name');
    expect(result.role).toBe('salesperson');
    expect(result.status).toBe('active');
  });

  it('maps manager role correctly', () => {
    const apiSubordinate = {
      id: 21,
      email: 'manager@example.com',
      role: 'manager',
      status: 'active',
      created_at: '2026-01-01T10:00:00Z',
    };

    const result = transformSubordinate(apiSubordinate as any);
    expect(result.role).toBe('manager');
  });
});

describe('Dashboard Transforms', () => {
  it('transforms user summary', () => {
    const apiUserSummary = {
      user_id: 10,
      user_name: 'John Doe',
      recordings: 15,
      duration: 3600,
      contacts: 8,
      activity_level: 'high',
    };

    const result = transformUserSummary(apiUserSummary as any);

    expect(result.userId).toBe('10');
    expect(result.userName).toBe('John Doe');
    expect(result.recordings).toBe(15);
    expect(result.duration).toBe(3600);
    expect(result.contacts).toBe(8);
    expect(result.activityLevel).toBe('high');
  });

  it('transforms alert', () => {
    const apiAlert = {
      id: 100,
      type: 'inactivity',
      severity: 'warning',
      user_id: 10,
      user_name: 'John Doe',
      message: 'No recordings in 7 days',
      details: { days: 7 },
      created_at: '2026-02-19T10:00:00Z',
      is_read: false,
    };

    const result = transformAlert(apiAlert as any);

    expect(result.id).toBe('100');
    expect(result.type).toBe('inactivity');
    expect(result.severity).toBe('warning');
    expect(result.message).toBe('No recordings in 7 days');
    expect(result.isRead).toBe(false);
  });

  it('transforms recent activity', () => {
    const apiActivity = {
      id: 200,
      type: 'recording',
      user_id: 10,
      user_name: 'John Doe',
      description: 'New recording uploaded',
      timestamp: '2026-02-19T10:00:00Z',
      metadata: { duration: 120 },
    };

    const result = transformRecentActivity(apiActivity as any);

    expect(result.id).toBe('200');
    expect(result.type).toBe('recording');
    expect(result.description).toBe('New recording uploaded');
  });

  it('transforms full dashboard', () => {
    const apiDashboard = {
      total_recordings: 100,
      total_duration: 36000,
      active_users: 5,
      total_users: 10,
      new_contacts: 25,
      by_user: [
        { user_id: 1, user_name: 'User 1', recordings: 20, duration: 7200, contacts: 5, activity_level: 'high' },
        { user_id: 2, user_name: 'User 2', recordings: 15, duration: 5400, contacts: 3, activity_level: 'medium' },
      ],
    };

    const result = transformDashboard(apiDashboard as any);

    expect(result.totalRecordings).toBe(100);
    expect(result.totalDuration).toBe(36000);
    expect(result.activeUsers).toBe(5);
    expect(result.totalUsers).toBe(10);
    expect(result.newContacts).toBe(25);
    expect(result.byUser).toHaveLength(2);
    expect(result.byUser[0].userName).toBe('User 1');
  });
});
