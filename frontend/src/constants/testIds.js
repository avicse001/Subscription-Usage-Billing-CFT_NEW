export const HOME = {
  emergentLink: "home-emergent-link",
};

export const POSTS = {
  loadingScreen: "loading-screen",
  loadingText: "loading-text",
  header: "app-header",
  headerTitle: "header-title",
  weAreListeningBtn: "we-are-listening-btn",
  viewToggleGrid: "view-toggle-grid",
  viewToggleList: "view-toggle-list",
  cardsContainer: "cards-container",
  card: (id) => `card-${id}`,
  cardTitle: (id) => `card-title-${id}`,
  removeCardBtn: (id) => `remove-card-btn-${id}`,
  paginationPrev: "pagination-prev",
  paginationNext: "pagination-next",
  paginationPage: (n) => `pagination-page-${n}`,
  emptyState: "empty-state",
};

export const FEEDBACK = {
  modal: "feedback-modal",
  closeBtn: "feedback-close-btn",
  nameInput: "feedback-name-input",
  emailInput: "feedback-email-input",
  subjectInput: "feedback-subject-input",
  messageInput: "feedback-message-input",
  ratingGroup: "feedback-rating-group",
  ratingStar: (n) => `feedback-rating-${n}`,
  submitBtn: "feedback-submit-btn",
  errorFor: (field) => `feedback-error-${field}`,
};

export const BILLING = {
  page: "billing-page",
  userSelect: "billing-user-select",
  totalUsed: "billing-total-used",
  remaining: "billing-remaining",
  extraUnits: "billing-extra-units",
  extraCharges: "billing-extra-charges",
  logUsageBtn: "billing-log-usage-btn",
  logUsageAction: "billing-log-usage-action",
  logUsageUnits: "billing-log-usage-units",
  logUsageSubmit: "billing-log-usage-submit",
};
