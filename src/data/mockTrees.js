export const MOCK_TREES = [
  {
    id: 'tree-1',
    name: 'Find more meaningful work',
    createdAt: new Date('2026-03-10T09:00:00Z'),
    updatedAt: new Date('2026-04-05T14:22:00Z'),
    status: 'active',
    linkedFromTreeId: null,
    linkedFromNodeId: null,
  },
  {
    id: 'tree-2',
    name: 'Start my own business',
    createdAt: new Date('2026-03-22T11:30:00Z'),
    updatedAt: new Date('2026-04-07T08:15:00Z'),
    status: 'active',
    linkedFromTreeId: 'tree-1',
    linkedFromNodeId: 'r3a',
  },
  {
    id: 'tree-3',
    name: 'Improve my relationship with money',
    createdAt: new Date('2026-03-01T16:00:00Z'),
    updatedAt: new Date('2026-03-28T10:45:00Z'),
    status: 'complete',
    linkedFromTreeId: null,
    linkedFromNodeId: null,
  },
]
