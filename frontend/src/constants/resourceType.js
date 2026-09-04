export const RESOURCE_TYPE = {
  JOURNAL: 'journal',
  RESEARCH_PAPER: 'research_paper',
  NOTE: 'note',
  OTHER: 'other',
};

export const RESOURCE_TYPE_VALUES = Object.values(RESOURCE_TYPE);

export const RESOURCE_TYPE_LABELS = {
  [RESOURCE_TYPE.JOURNAL]: 'E-Journal',
  [RESOURCE_TYPE.RESEARCH_PAPER]: 'Research Paper',
  [RESOURCE_TYPE.NOTE]: 'Notes',
  [RESOURCE_TYPE.OTHER]: 'Other',
};
