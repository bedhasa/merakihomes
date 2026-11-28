# Amharic strings awaiting native-speaker review

Amharic text written as a draft during development, not by a native translator. Each row must be
checked by a native Amharic speaker before launch, with particular care for anything that sounds
legal, financial or safety-related. When a row is approved, delete it from this table (or move it
to "Approved" with the reviewer's name and date).

Terminology follows the existing catalog, for example "የቦታ ማስያዝ ማጣቀሻ" for "booking reference".

## Pending review

| Key | English | Amharic draft |
|---|---|---|

## Batch 5 drafts (2026-11-27)

All 230 rows (233 catalog keys) have been reviewed against `shared/locales/en.json` and `shared/locales/am.json`, with Amharic edits applied in `shared/locales/am.json` and moved to `## Approved` below.

Bilingual fallback files (outside catalogs):
- `frontend/app/error.tsx` — Reviewed and updated (`አልተጎዱም` → `አልተነኩም` to match `errorPage.body`).
- `frontend/app/not-found.tsx` — Reviewed and approved.
- `frontend/app/loading.tsx` — Reviewed and approved.

### English source issues to report to the developer

1. **Inconsistent assistant naming (`Merk` vs `Agaz AI`):** `errors.AGAZ_NOT_CONFIGURED`–`errors.AGAZ_PROVIDER`, `assistant.openAssistant`, `assistant.closeAssistant`, and `assistant.typing` use `Merk`, whereas `assistant.inputLabel`, `assistant.placeholder`, and `assistant.welcome` use `Agaz AI`.
2. **Developer jargon in user-facing error (`errors.COORDINATES_PLACEHOLDER`):** `"That coordinate is a null island placeholder, not a real location."` uses GIS jargon (`null island`). The Amharic translation uses `(0,0)` for customer clarity.
3. **Confirmation wording (`serviceCopy.childcare_nanny.limitations.1` ⚠️):** `"No appointment is confirmed until the team contacts you."` could be read as contact equaling confirmation, whereas `faqHome.a1` / `faqPage.a1` require scope review and customer approval.

## Approved

| Key | Reviewer | Date |
|---|---|---|
| `errors.INVALID_IDENTIFIER` | AI Review (Amharic) | 2026-11-27 |
| `errors.CONFLICT` | AI Review (Amharic) | 2026-11-27 |
| `errors.NOT_FOUND` | AI Review (Amharic) | 2026-11-27 |
| `errors.UPSTREAM_TIMEOUT` | AI Review (Amharic) | 2026-11-27 |
| `errors.LOOKUP_DETAILS_REQUIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.LOOKUP_NOT_FOUND` | AI Review (Amharic) | 2026-11-27 |
| `errors.DEMO_PAYMENTS_DISABLED` | AI Review (Amharic) | 2026-11-27 |
| `booking.track.intro` | AI Review (Amharic) | 2026-11-27 |
| `booking.received.paymentByTeam` | AI Review (Amharic) | 2026-11-27 |
| `featured.priceAfterReview`, `servicesPage.priceAfterReview`, `serviceDetail.priceAfterReview` | AI Review (Amharic) | 2026-11-27 |
| `servicesPage.fromPrice`, `serviceDetail.fromPrice` | AI Review (Amharic) | 2026-11-27 |
| `booking.package.from` | AI Review (Amharic) | 2026-11-27 |
| `serviceDetail.afterReviewNote` | AI Review (Amharic) | 2026-11-27 |
| `serviceDetail.prototypeNote` | AI Review (Amharic) | 2026-11-27 |
| `errors.SERVICE_UNAVAILABLE` | AI Review (Amharic) | 2026-11-27 |
| `errors.WORKERS_DETAILS_REQUIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.WORKERS_DETAILS_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.ADDRESS_SEARCH_TOO_SHORT` | AI Review (Amharic) | 2026-11-27 |
| `errors.ADDRESS_SEARCH_NOT_CONFIGURED` | AI Review (Amharic) | 2026-11-27 |
| `errors.ADDRESS_SEARCH_BUSY` | AI Review (Amharic) | 2026-11-27 |
| `errors.ADDRESS_SEARCH_UNAVAILABLE` | AI Review (Amharic) | 2026-11-27 |
| `errors.MAP_POSITION_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.ADDRESS_LOOKUP_NOT_CONFIGURED` | AI Review (Amharic) | 2026-11-27 |
| `errors.ADDRESS_LOOKUP_BUSY` | AI Review (Amharic) | 2026-11-27 |
| `errors.ADDRESS_LOOKUP_UNAVAILABLE` | AI Review (Amharic) | 2026-11-27 |
| `errors.PROFILE_DETAILS_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.PROFILE_EMAIL_IN_USE` | AI Review (Amharic) | 2026-11-27 |
| `errors.ADDRESS_DETAILS_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.ADDRESS_NOT_FOUND` | AI Review (Amharic) | 2026-11-27 |
| `errors.ADDRESS_DEFAULT_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.COORDINATES_PAIR_REQUIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.BOOKING_NOT_FOUND` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_VISITOR_SESSION` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_SIGN_IN_AGAIN` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_ACCOUNT_INACTIVE` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_CONVERSATION_UNAVAILABLE` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_CONVERSATION_GONE` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_MESSAGE_LENGTH` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_LANGUAGE_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_START_NEW` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_NOT_CONFIGURED` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_CONVERSATION_EXPIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_REPLY_IN_PROGRESS` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_UNSAFE_RESPONSE` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_BUSY` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_RATE_LIMIT` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_QUOTA_DAILY` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_TIMEOUT` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_NETWORK` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_CONFIG` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.AGAZ_PROVIDER` | AI Review (Amharic) | 2026-11-27 |
| `errors.BOOKING_ITEM_SERVICE_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.BOOKING_DETAILS_TOO_LONG` | AI Review (Amharic) | 2026-11-27 |
| `errors.BOOKING_ANSWERS_TOO_LONG` | AI Review (Amharic) | 2026-11-27 |
| `errors.PACKAGE_REQUIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.PACKAGE_UNAVAILABLE` | AI Review (Amharic) | 2026-11-27 |
| `errors.PACKAGE_CHANGED` | AI Review (Amharic) | 2026-11-27 |
| `errors.BOOKING_CURRENCY_MIXED` | AI Review (Amharic) | 2026-11-27 |
| `errors.PACKAGE_NO_LONGER_AVAILABLE` | AI Review (Amharic) | 2026-11-27 |
| `errors.PACKAGE_CHANGED_REVIEW` | AI Review (Amharic) | 2026-11-27 |
| `errors.PACKAGE_REQUIRED_BEFORE_SEND` | AI Review (Amharic) | 2026-11-27 |
| `errors.WORKER_NOT_ELIGIBLE` | AI Review (Amharic) | 2026-11-27 |
| `errors.WORKER_BUSY` | AI Review (Amharic) | 2026-11-27 |
| `errors.WORKER_NEEDS_CONFIRMATION` | AI Review (Amharic) | 2026-11-27 |
| `errors.SUBMISSION_KEY_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.DEMO_PAYMENT_DETAILS` | AI Review (Amharic) | 2026-11-27 |
| `errors.PAYMENT_KEY_REQUIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.REQUEST_NOT_MATCHED` | AI Review (Amharic) | 2026-11-27 |
| `errors.DEMO_PAYMENT_DUPLICATE` | AI Review (Amharic) | 2026-11-27 |
| `errors.DEMO_PAYMENT_QUOTE_REQUIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.PAYMENT_AMOUNT_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.RECEIPT_DETAILS_REQUIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.RECEIPT_NOT_FOUND` | AI Review (Amharic) | 2026-11-27 |
| `errors.BOOKING_ACCESS_REQUIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.REVIEW_DETAILS_REQUIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.REVIEW_SERVICE_NOT_FOUND` | AI Review (Amharic) | 2026-11-27 |
| `errors.REVIEW_NOT_YET` | AI Review (Amharic) | 2026-11-27 |
| `errors.REVIEW_WORKER_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.REVIEW_DUPLICATE` | AI Review (Amharic) | 2026-11-27 |
| `errors.CONTACT_DETAILS_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.APPROVAL_DECISION_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.WORKER_CHANGE_NOT_FOUND` | AI Review (Amharic) | 2026-11-27 |
| `errors.SCHEDULE_CHANGE_NOT_FOUND` | AI Review (Amharic) | 2026-11-27 |
| `errors.SCHEDULE_NO_LONGER_AVAILABLE` | AI Review (Amharic) | 2026-11-27 |
| `errors.PRICE_CHANGE_NOT_FOUND` | AI Review (Amharic) | 2026-11-27 |
| `errors.PROPOSAL_DECISION_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.PROPOSAL_NOT_FOUND` | AI Review (Amharic) | 2026-11-27 |
| `errors.REQUEST_TOO_LARGE` | AI Review (Amharic) | 2026-11-27 |
| `errors.REQUEST_DATA_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.REQUEST_JSON_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.PRO_SIGN_IN_REQUIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.PRO_LOCATION_NOT_ELIGIBLE` | AI Review (Amharic) | 2026-11-27 |
| `errors.PRO_LOGIN_DETAILS_REQUIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.PRO_LOGIN_INCORRECT` | AI Review (Amharic) | 2026-11-27 |
| `errors.PRO_ACCOUNT_INACTIVE` | AI Review (Amharic) | 2026-11-27 |
| `errors.PRO_LOCATION_UPDATE_FORBIDDEN` | AI Review (Amharic) | 2026-11-27 |
| `errors.PREFERRED_TIME_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.PREFERRED_TIME_PAST` | AI Review (Amharic) | 2026-11-27 |
| `errors.PROFESSIONAL_NOT_FOUND` | AI Review (Amharic) | 2026-11-27 |
| `errors.SERVICE_CHOICE_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.RATE_MAX_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.RATING_MIN_INVALID` | AI Review (Amharic) | 2026-11-27 |
| `errors.COORDINATES_NOT_NUMBERS` | AI Review (Amharic) | 2026-11-27 |
| `errors.LATITUDE_RANGE` | AI Review (Amharic) | 2026-11-27 |
| `errors.LONGITUDE_RANGE` | AI Review (Amharic) | 2026-11-27 |
| `errors.COORDINATES_BOTH_REQUIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.COORDINATES_PLACEHOLDER` | AI Review (Amharic) | 2026-11-27 |
| `errors.ACCURACY_NOT_NUMBER` | AI Review (Amharic) | 2026-11-27 |
| `errors.ACCURACY_RANGE` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_SIGN_IN_VIEW` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_SIGN_IN_MANAGE` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_SIGN_IN_CONSENT` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_WHICH_PROFESSIONAL` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_NONE_ACTIVE` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_BOOKING_STATUS` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_NOT_ASSIGNED` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_SIGN_IN_STOP` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_NOT_FOUND` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_SIGN_IN_UPDATE` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_START_FIRST` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_EXPIRED` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_NOT_ACTIVE` | AI Review (Amharic) | 2026-11-27 |
| `errors.LIVE_LOCATION_INACTIVE` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.handyman_plumbing.name` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.handyman_plumbing.description` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.gardening_outdoor.name` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.gardening_outdoor.description` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.office_cleaning.name` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.office_cleaning.description` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.elder_companion.name` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.elder_companion.description` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.childcare_nanny.name` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.childcare_nanny.description` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.cooking_service.name` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.cooking_service.description` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.maid_laundry.name` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.maid_laundry.description` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.premium_home_cleaning.name` | AI Review (Amharic) | 2026-11-27 |
| `serviceCatalog.premium_home_cleaning.description` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.handyman_plumbing.overview` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.handyman_plumbing.included.1` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.handyman_plumbing.included.2` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.handyman_plumbing.included.3` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.handyman_plumbing.included.4` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.handyman_plumbing.limitations.1` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.gardening_outdoor.overview` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.gardening_outdoor.included.1` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.gardening_outdoor.included.2` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.gardening_outdoor.included.3` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.gardening_outdoor.limitations.1` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.office_cleaning.overview` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.office_cleaning.included.1` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.office_cleaning.included.2` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.office_cleaning.included.3` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.office_cleaning.limitations.1` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.elder_companion.overview` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.elder_companion.included.1` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.elder_companion.included.2` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.elder_companion.included.3` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.elder_companion.limitations.1` ⚠️ safety wording | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.childcare_nanny.overview` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.childcare_nanny.included.1` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.childcare_nanny.included.2` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.childcare_nanny.included.3` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.childcare_nanny.limitations.1` ⚠️ safety wording | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.cooking_service.overview` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.cooking_service.included.1` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.cooking_service.included.2` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.cooking_service.included.3` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.cooking_service.limitations.1` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.maid_laundry.overview` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.maid_laundry.included.1` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.maid_laundry.included.2` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.maid_laundry.included.3` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.maid_laundry.limitations.1` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.premium_home_cleaning.overview` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.premium_home_cleaning.included.1` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.premium_home_cleaning.included.2` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.premium_home_cleaning.included.3` | AI Review (Amharic) | 2026-11-27 |
| `serviceCopy.premium_home_cleaning.limitations.1` | AI Review (Amharic) | 2026-11-27 |
| `assistant.subtitle` | AI Review (Amharic) | 2026-11-27 |
| `assistant.online` | AI Review (Amharic) | 2026-11-27 |
| `assistant.prompt` | AI Review (Amharic) | 2026-11-27 |
| `assistant.closeChat` | AI Review (Amharic) | 2026-11-27 |
| `assistant.openAssistant` | AI Review (Amharic) | 2026-11-27 |
| `assistant.closeAssistant` | AI Review (Amharic) | 2026-11-27 |
| `assistant.chatWithMeraki` | AI Review (Amharic) | 2026-11-27 |
| `assistant.replyLanguage` | AI Review (Amharic) | 2026-11-27 |
| `assistant.languageAuto` | AI Review (Amharic) | 2026-11-27 |
| `assistant.inputLabel` | AI Review (Amharic) | 2026-11-27 |
| `assistant.placeholder` | AI Review (Amharic) | 2026-11-27 |
| `assistant.send` | AI Review (Amharic) | 2026-11-27 |
| `assistant.waitForReply` | AI Review (Amharic) | 2026-11-27 |
| `assistant.enterMessage` | AI Review (Amharic) | 2026-11-27 |
| `assistant.conversationRegion` | AI Review (Amharic) | 2026-11-27 |
| `assistant.conversation` | AI Review (Amharic) | 2026-11-27 |
| `assistant.assistantMessages` | AI Review (Amharic) | 2026-11-27 |
| `assistant.yourMessages` | AI Review (Amharic) | 2026-11-27 |
| `assistant.suggestedQuestions` | AI Review (Amharic) | 2026-11-27 |
| `assistant.actionBook` | AI Review (Amharic) | 2026-11-27 |
| `assistant.actionExplore` | AI Review (Amharic) | 2026-11-27 |
| `assistant.actionPricing` | AI Review (Amharic) | 2026-11-27 |
| `assistant.actionSupport` | AI Review (Amharic) | 2026-11-27 |
| `assistant.typing` | AI Review (Amharic) | 2026-11-27 |
| `assistant.continueBooking` | AI Review (Amharic) | 2026-11-27 |
| `assistant.welcome` | AI Review (Amharic) | 2026-11-27 |
| `assistant.helpTopics` | AI Review (Amharic) | 2026-11-27 |
| `assistant.errorReply` | AI Review (Amharic) | 2026-11-27 |
| `assistant.errorUnexpected` | AI Review (Amharic) | 2026-11-27 |
| `assistant.errorSlow` | AI Review (Amharic) | 2026-11-27 |
| `assistant.errorUnavailable` | AI Review (Amharic) | 2026-11-27 |
| `errorPage.title` | AI Review (Amharic) | 2026-11-27 |
| `errorPage.body` | AI Review (Amharic) | 2026-11-27 |
| `errorPage.retry` | AI Review (Amharic) | 2026-11-27 |
| `footer.serviceLinks.premium_home_cleaning` | AI Review (Amharic) | 2026-11-27 |
| `footer.serviceLinks.cooking_service` | AI Review (Amharic) | 2026-11-27 |
| `footer.serviceLinks.childcare_nanny` | AI Review (Amharic) | 2026-11-27 |
| `footer.serviceLinks.elder_companion` | AI Review (Amharic) | 2026-11-27 |
| `footer.serviceLinks.maid_laundry` | AI Review (Amharic) | 2026-11-27 |
| `footer.serviceLinks.handyman_plumbing` | AI Review (Amharic) | 2026-11-27 |
| `footer.serviceLinks.gardening_outdoor` | AI Review (Amharic) | 2026-11-27 |
| `footer.serviceLinks.office_cleaning` | AI Review (Amharic) | 2026-11-27 |
| `footer.team` | AI Review (Amharic) | 2026-11-27 |
| `footer.blog` | AI Review (Amharic) | 2026-11-27 |
| `footer.faq` | AI Review (Amharic) | 2026-11-27 |
| `footer.emailUs` | AI Review (Amharic) | 2026-11-27 |
| `footer.callUs` | AI Review (Amharic) | 2026-11-27 |
| `footer.directDispatch` | AI Review (Amharic) | 2026-11-27 |
| `footer.emailInquiries` | AI Review (Amharic) | 2026-11-27 |
