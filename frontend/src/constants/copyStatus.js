export const COPY_STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "issued", label: "Issued" },
  { value: "reserved", label: "Reserved" },
  { value: "damaged", label: "Damaged" },
  { value: "lost", label: "Lost" },
  { value: "retired", label: "Retired" },
];

export const COPY_CONDITION_OPTIONS = [
  { value: "new", label: "New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

// Badge variant per status — mirrors the semantics already used
// elsewhere (success = good state, warning = needs attention,
// destructive = unusable, secondary = neutral/inactive).
export const COPY_STATUS_BADGE_VARIANT = {
  available: "success",
  issued: "default",
  reserved: "warning",
  damaged: "destructive",
  lost: "destructive",
  retired: "secondary",
};
