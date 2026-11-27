# Amharic strings awaiting native-speaker review

Amharic text written as a draft during development, not by a native translator. Each row must be
checked by a native Amharic speaker before launch, with particular care for anything that sounds
legal, financial or safety-related. When a row is approved, delete it from this table (or move it
to "Approved" with the reviewer's name and date).

Terminology follows the existing catalog, for example "የቦታ ማስያዝ ማጣቀሻ" for "booking reference".

## Pending review

| Key | English | Amharic draft |
|---|---|---|
| `errors.INVALID_IDENTIFIER` | The request contains an invalid identifier or value. | ጥያቄው ትክክል ያልሆነ መለያ ወይም እሴት ይዟል። |
| `errors.CONFLICT` | This change conflicts with an existing record. Refresh and try again. | ይህ ለውጥ ካለ መዝገብ ጋር ይጋጫል። ገጹን አድሰው እንደገና ይሞክሩ። |
| `errors.NOT_FOUND` | Not found. | አልተገኘም። |
| `errors.UPSTREAM_TIMEOUT` | Meraki Homes took too long to respond. Please try again. | Meraki Homes ምላሽ ለመስጠት ረጅም ጊዜ ወስዷል። እባክዎ እንደገና ይሞክሩ። |
| `errors.LOOKUP_DETAILS_REQUIRED` | Enter your booking reference and the phone number used for the request. | የቦታ ማስያዝ ማጣቀሻዎን እና ለጥያቄው የተጠቀሙበትን ስልክ ቁጥር ያስገቡ። |
| `errors.LOOKUP_NOT_FOUND` | No request matches that reference and phone number. | ከዚህ ማጣቀሻ እና ስልክ ቁጥር ጋር የሚዛመድ ጥያቄ አልተገኘም። |
| `errors.DEMO_PAYMENTS_DISABLED` | Online payment is not available yet. Our team will confirm payment with you. | የመስመር ላይ ክፍያ ገና አይገኝም። ቡድናችን ክፍያውን ከእርስዎ ጋር ያረጋግጣል። |
| `booking.track.intro` | Enter your booking reference and the phone number used for the request. Both must match. | የቦታ ማስያዝ ማጣቀሻዎን እና ለጥያቄው የተጠቀሙበትን ስልክ ቁጥር ያስገቡ። ሁለቱም መዛመድ አለባቸው። |
| `booking.received.paymentByTeam` | No payment is taken online. Our team will confirm the final price and payment with you. | በመስመር ላይ ምንም ክፍያ አይወሰድም። ቡድናችን የመጨረሻውን ዋጋ እና ክፍያ ከእርስዎ ጋር ያረጋግጣል። |
| `featured.priceAfterReview`, `servicesPage.priceAfterReview`, `serviceDetail.priceAfterReview` | Price after review | ዋጋ ከግምገማ በኋላ |
| `servicesPage.fromPrice`, `serviceDetail.fromPrice` | From {amount} | ከ{amount} ጀምሮ |
| `booking.package.from` (was "ከ{price}") | From {price} | ከ{price} ጀምሮ |
| `serviceDetail.afterReviewNote` | The final price is agreed with you after scope review. | የመጨረሻ ዋጋ ከክልል ግምገማ በኋላ ከእርስዎ ጋር ይስማማል። |
| `serviceDetail.prototypeNote` | Prices shown are starting prices. Availability and final scope require review; a request does not confirm an appointment. | የሚታዩት ዋጋዎች መነሻ ዋጋዎች ናቸው። ተገኝነት እና የመጨረሻ ክልል ግምገማ ይፈልጋሉ፤ ጥያቄ ቀጠሮ አያረጋግጥም። |

## Batch 5 drafts (2026-11-27)

All rows below are pending review. Rows marked ⚠️ describe what a care service does not cover; check them with particular care.

Not in the catalogs (bilingual text written directly in the file, review there): `frontend/app/error.tsx`, `frontend/app/not-found.tsx`, `frontend/app/loading.tsx`. These pages render before the language is known, so they show both languages.

### API error messages (sent by the server, also shown by the app) (110)

| Key | English | Amharic draft |
|---|---|---|
| `errors.SERVICE_UNAVAILABLE` | This service is unavailable. | ይህ አገልግሎት አይገኝም። |
| `errors.WORKERS_DETAILS_REQUIRED` | Choose a service and future preferred time to check workers. | ባለሙያዎችን ለማየት አገልግሎት እና ወደፊት የሚመርጡትን ሰዓት ይምረጡ። |
| `errors.WORKERS_DETAILS_INVALID` | Worker matching details are invalid. | የባለሙያ ማዛመጃ ዝርዝሮች ትክክል አይደሉም። |
| `errors.ADDRESS_SEARCH_TOO_SHORT` | Search with at least 3 characters. | ቢያንስ 3 ቁምፊዎችን በመጠቀም ይፈልጉ። |
| `errors.ADDRESS_SEARCH_NOT_CONFIGURED` | Address search is not configured. Enter the address manually or choose the map pin. | የአድራሻ ፍለጋ አልተዘጋጀም። አድራሻውን በእጅ ያስገቡ ወይም በካርታው ላይ ቦታውን ይምረጡ። |
| `errors.ADDRESS_SEARCH_BUSY` | Address search is busy. Please wait a moment and try again. | የአድራሻ ፍለጋ ሥራ በዝቶበታል። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ። |
| `errors.ADDRESS_SEARCH_UNAVAILABLE` | Address search is temporarily unavailable. Enter the location manually. | የአድራሻ ፍለጋ ለጊዜው አይገኝም። ቦታውን በእጅ ያስገቡ። |
| `errors.MAP_POSITION_INVALID` | Choose a valid map position. | በካርታው ላይ ትክክለኛ ቦታ ይምረጡ። |
| `errors.ADDRESS_LOOKUP_NOT_CONFIGURED` | Address lookup is not configured. Enter the address manually or choose the map pin. | የአድራሻ ማጣራት አልተዘጋጀም። አድራሻውን በእጅ ያስገቡ ወይም በካርታው ላይ ቦታውን ይምረጡ። |
| `errors.ADDRESS_LOOKUP_BUSY` | Address lookup is busy. Please wait a moment and try again. | የአድራሻ ማጣራት ሥራ በዝቶበታል። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ። |
| `errors.ADDRESS_LOOKUP_UNAVAILABLE` | Address lookup is temporarily unavailable. Enter the location manually. | የአድራሻ ማጣራት ለጊዜው አይገኝም። ቦታውን በእጅ ያስገቡ። |
| `errors.PROFILE_DETAILS_INVALID` | Please check your profile details. | እባክዎ የመገለጫ ዝርዝሮችዎን ያረጋግጡ። |
| `errors.PROFILE_EMAIL_IN_USE` | That email is already used by another account. | ይህ ኢሜይል በሌላ መለያ ጥቅም ላይ ውሏል። |
| `errors.ADDRESS_DETAILS_INVALID` | Please check the address details. | እባክዎ የአድራሻ ዝርዝሮቹን ያረጋግጡ። |
| `errors.ADDRESS_NOT_FOUND` | Saved address not found. | የተቀመጠው አድራሻ አልተገኘም። |
| `errors.ADDRESS_DEFAULT_INVALID` | Choose a valid default setting. | ትክክለኛ ነባሪ ምርጫ ይምረጡ። |
| `errors.COORDINATES_PAIR_REQUIRED` | Provide valid latitude and longitude together. | ትክክለኛ ኬክሮስ እና ኬንትሮስ በአንድ ላይ ያስገቡ። |
| `errors.BOOKING_NOT_FOUND` | Booking not found. | ቦታ ማስያዙ አልተገኘም። |
| `errors.AGAZ_VISITOR_SESSION` | Start a new visitor session and try again. | አዲስ የጎብኚ ክፍለ ጊዜ ይጀምሩ እና እንደገና ይሞክሩ። |
| `errors.AGAZ_SIGN_IN_AGAIN` | Please sign in again to continue this conversation. | ይህን ውይይት ለመቀጠል እባክዎ እንደገና ይግቡ። |
| `errors.AGAZ_ACCOUNT_INACTIVE` | Your customer account is not active. | የደንበኛ መለያዎ ንቁ አይደለም። |
| `errors.AGAZ_CONVERSATION_UNAVAILABLE` | This conversation is unavailable. | ይህ ውይይት አይገኝም። |
| `errors.AGAZ_CONVERSATION_GONE` | This conversation has expired or is unavailable. | ይህ ውይይት ጊዜው አልፎበታል ወይም አይገኝም። |
| `errors.AGAZ_MESSAGE_LENGTH` | Write a message between 1 and 2,000 characters. | ከ1 እስከ 2,000 ቁምፊ ያለው መልዕክት ይጻፉ። |
| `errors.AGAZ_LANGUAGE_INVALID` | Choose Auto, English, Amharic, or Afaan Oromo. | ራስ-ሰር፣ እንግሊዝኛ፣ አማርኛ ወይም አፋን ኦሮሞ ይምረጡ። |
| `errors.AGAZ_START_NEW` | Start a new conversation and try again. | አዲስ ውይይት ይጀምሩ እና እንደገና ይሞክሩ። |
| `errors.AGAZ_NOT_CONFIGURED` | Merk is not configured on the server yet. Please contact Meraki Homes for help. | Merk በአገልጋዩ ላይ ገና አልተዘጋጀም። ለእርዳታ እባክዎ Meraki Homesን ያግኙ። |
| `errors.AGAZ_CONVERSATION_EXPIRED` | This conversation has expired. Start a new conversation. | ይህ ውይይት ጊዜው አልፎበታል። አዲስ ውይይት ይጀምሩ። |
| `errors.AGAZ_REPLY_IN_PROGRESS` | Please wait for Merk to finish the previous reply. | እባክዎ Merk የቀደመውን ምላሽ እስኪጨርስ ይጠብቁ። |
| `errors.AGAZ_UNSAFE_RESPONSE` | Merk could not prepare a safe response. Please try again. | Merk ደህንነቱ የተጠበቀ ምላሽ ማዘጋጀት አልቻለም። እባክዎ እንደገና ይሞክሩ። |
| `errors.AGAZ_BUSY` | Merk is temporarily busy. Please try again shortly. | Merk ለጊዜው ሥራ በዝቶበታል። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ። |
| `errors.AGAZ_RATE_LIMIT` | Merk has reached a temporary request limit. Please try again later. | Merk ጊዜያዊ የጥያቄ ገደብ ላይ ደርሷል። እባክዎ ቆይተው እንደገና ይሞክሩ። |
| `errors.AGAZ_QUOTA_DAILY` | Merk has reached a daily request limit. Please try again after the quota resets. | Merk የዕለቱ የጥያቄ ገደብ ላይ ደርሷል። ገደቡ ከታደሰ በኋላ እንደገና ይሞክሩ። |
| `errors.AGAZ_TIMEOUT` | Merk is taking longer than usual. Please try again. | Merk ከወትሮው በላይ ጊዜ እየወሰደ ነው። እባክዎ እንደገና ይሞክሩ። |
| `errors.AGAZ_NETWORK` | Please check your internet connection and try again. | እባክዎ የበይነመረብ ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ። |
| `errors.AGAZ_CONFIG` | Merk is unavailable right now. Please try again later. | Merk አሁን አይገኝም። እባክዎ ቆይተው እንደገና ይሞክሩ። |
| `errors.AGAZ_INVALID` | Merk could not process that request. Please try a shorter message. | Merk ያንን ጥያቄ ማስተናገድ አልቻለም። እባክዎ አጠር ያለ መልዕክት ይሞክሩ። |
| `errors.AGAZ_PROVIDER` | Merk could not get a response from its AI service. Please try again. | Merk ከAI አገልግሎቱ ምላሽ ማግኘት አልቻለም። እባክዎ እንደገና ይሞክሩ። |
| `errors.BOOKING_ITEM_SERVICE_INVALID` | Choose a valid service for every item. | ለእያንዳንዱ ንጥል ትክክለኛ አገልግሎት ይምረጡ። |
| `errors.BOOKING_DETAILS_TOO_LONG` | Service details must be under 3,000 characters. | የአገልግሎት ዝርዝሮች ከ3,000 ቁምፊ በታች መሆን አለባቸው። |
| `errors.BOOKING_ANSWERS_TOO_LONG` | Please shorten the service answers. | እባክዎ የአገልግሎት መልሶቹን ያሳጥሩ። |
| `errors.PACKAGE_REQUIRED` | Choose a current package for the selected service. | ለተመረጠው አገልግሎት የአሁኑን ጥቅል ይምረጡ። |
| `errors.PACKAGE_UNAVAILABLE` | A selected package is unavailable. Refresh the package details. | የተመረጠ ጥቅል አይገኝም። የጥቅል ዝርዝሮቹን ያድሱ። |
| `errors.PACKAGE_CHANGED` | A package price or duration changed. Review the current package options. | የአንድ ጥቅል ዋጋ ወይም የቆይታ ጊዜ ተቀይሯል። የአሁኑን የጥቅል አማራጮች ይመልከቱ። |
| `errors.BOOKING_CURRENCY_MIXED` | Services in one booking must use the same currency. Submit separate bookings for different currencies. | በአንድ ቦታ ማስያዝ ውስጥ ያሉ አገልግሎቶች አንድ አይነት ምንዛሬ መጠቀም አለባቸው። ለተለያዩ ምንዛሬዎች የተለያዩ ቦታ ማስያዞችን ያቅርቡ። |
| `errors.PACKAGE_NO_LONGER_AVAILABLE` | That package is no longer available. Please review the current service options. | ያ ጥቅል ከአሁን በኋላ አይገኝም። እባክዎ የአሁኑን የአገልግሎት አማራጮች ይመልከቱ። |
| `errors.PACKAGE_CHANGED_REVIEW` | This package price or duration changed. Please review the current package options before continuing. | የዚህ ጥቅል ዋጋ ወይም የቆይታ ጊዜ ተቀይሯል። ከመቀጠልዎ በፊት እባክዎ የአሁኑን የጥቅል አማራጮች ይመልከቱ። |
| `errors.PACKAGE_REQUIRED_BEFORE_SEND` | Choose a current package before sending this request. | ይህን ጥያቄ ከመላክዎ በፊት የአሁኑን ጥቅል ይምረጡ። |
| `errors.WORKER_NOT_ELIGIBLE` | That worker is no longer eligible for this service. Refresh worker options. | ያ ባለሙያ ለዚህ አገልግሎት ከአሁን በኋላ ብቁ አይደለም። የባለሙያ አማራጮችን ያድሱ። |
| `errors.WORKER_BUSY` | That worker is busy during the requested time. Choose another worker or let Meraki Homes match. | ያ ባለሙያ በተጠየቀው ሰዓት ሥራ ላይ ነው። ሌላ ባለሙያ ይምረጡ ወይም Meraki Homes እንዲያዛምድ ይፍቀዱ። |
| `errors.WORKER_NEEDS_CONFIRMATION` | That worker availability needs Operations confirmation. Choose another worker or let Meraki Homes match. | የዚያ ባለሙያ መገኘት በኦፕሬሽንስ ቡድኑ መረጋገጥ አለበት። ሌላ ባለሙያ ይምረጡ ወይም Meraki Homes እንዲያዛምድ ይፍቀዱ። |
| `errors.SUBMISSION_KEY_INVALID` | Invalid submission key. | ትክክል ያልሆነ የማስገቢያ ቁልፍ። |
| `errors.DEMO_PAYMENT_DETAILS` | Choose a demo payment method, amount, and explicit outcome. | የሙከራ ክፍያ ዘዴ፣ መጠን እና ግልጽ ውጤት ይምረጡ። |
| `errors.PAYMENT_KEY_REQUIRED` | A valid payment request key is required. | ትክክለኛ የክፍያ ጥያቄ ቁልፍ ያስፈልጋል። |
| `errors.REQUEST_NOT_MATCHED` | No request matches those details. | ከእነዚህ ዝርዝሮች ጋር የሚዛመድ ጥያቄ የለም። |
| `errors.DEMO_PAYMENT_DUPLICATE` | This demo payment was already processed. Look up the receipt. | ይህ የሙከራ ክፍያ አስቀድሞ ተከናውኗል። ደረሰኙን ይፈልጉ። |
| `errors.DEMO_PAYMENT_QUOTE_REQUIRED` | A quote must be approved before a demo payment can be simulated. | የሙከራ ክፍያ ከመደረጉ በፊት የዋጋ ግምቱ መጽደቅ አለበት። |
| `errors.PAYMENT_AMOUNT_INVALID` | Payment amount must match the remaining total or be a smaller partial payment. | የክፍያው መጠን ከቀሪው ጠቅላላ ዋጋ ጋር እኩል ወይም ከእሱ ያነሰ ከፊል ክፍያ መሆን አለበት። |
| `errors.RECEIPT_DETAILS_REQUIRED` | Enter the booking reference and contact phone. | የቦታ ማስያዝ ማጣቀሻውን እና የመገናኛ ስልኩን ያስገቡ። |
| `errors.RECEIPT_NOT_FOUND` | No successful demo payment receipt matches those details. | ከእነዚህ ዝርዝሮች ጋር የሚዛመድ የተሳካ የሙከራ ክፍያ ደረሰኝ የለም። |
| `errors.BOOKING_ACCESS_REQUIRED` | Sign in or use guest booking lookup. | ይግቡ ወይም የእንግዳ ቦታ ማስያዝ ፍለጋን ይጠቀሙ። |
| `errors.REVIEW_DETAILS_REQUIRED` | Choose a completed service, a rating from 1 to 5, and a short review. | የተጠናቀቀ አገልግሎት፣ ከ1 እስከ 5 ያለ ደረጃ እና አጭር አስተያየት ያስገቡ። |
| `errors.REVIEW_SERVICE_NOT_FOUND` | No completed service matches this account. | ከዚህ መለያ ጋር የሚዛመድ የተጠናቀቀ አገልግሎት የለም። |
| `errors.REVIEW_NOT_YET` | Reviews are available after the service item is completed. | አስተያየት መስጠት የሚቻለው አገልግሎቱ ከተጠናቀቀ በኋላ ነው። |
| `errors.REVIEW_WORKER_INVALID` | Choose a worker who completed this service. | ይህን አገልግሎት ያጠናቀቀ ባለሙያ ይምረጡ። |
| `errors.REVIEW_DUPLICATE` | A review has already been submitted for this service. | ለዚህ አገልግሎት አስተያየት አስቀድሞ ተሰጥቷል። |
| `errors.CONTACT_DETAILS_INVALID` | Please check your contact details. | እባክዎ የመገናኛ ዝርዝሮችዎን ያረጋግጡ። |
| `errors.APPROVAL_DECISION_INVALID` | Choose a valid approval decision. | ትክክለኛ የማጽደቅ ውሳኔ ይምረጡ። |
| `errors.WORKER_CHANGE_NOT_FOUND` | No pending worker change matches this account. | ከዚህ መለያ ጋር የሚዛመድ በመጠባበቅ ላይ ያለ የባለሙያ ለውጥ የለም። |
| `errors.SCHEDULE_CHANGE_NOT_FOUND` | No pending schedule change matches this account. | ከዚህ መለያ ጋር የሚዛመድ በመጠባበቅ ላይ ያለ የሰዓት ለውጥ የለም። |
| `errors.SCHEDULE_NO_LONGER_AVAILABLE` | The proposed time is no longer available for every assigned worker. Contact Operations for another time. | የቀረበው ሰዓት ለሁሉም የተመደቡ ባለሙያዎች ከአሁን በኋላ አይገኝም። ለሌላ ሰዓት የኦፕሬሽንስ ቡድኑን ያግኙ። |
| `errors.PRICE_CHANGE_NOT_FOUND` | No pending price change matches this account. | ከዚህ መለያ ጋር የሚዛመድ በመጠባበቅ ላይ ያለ የዋጋ ለውጥ የለም። |
| `errors.PROPOSAL_DECISION_INVALID` | Choose accept or reject for this proposed change. | ለዚህ የቀረበ ለውጥ መቀበል ወይም አለመቀበልን ይምረጡ። |
| `errors.PROPOSAL_NOT_FOUND` | No pending change proposal matches this account. | ከዚህ መለያ ጋር የሚዛመድ በመጠባበቅ ላይ ያለ የለውጥ ሀሳብ የለም። |
| `errors.REQUEST_TOO_LARGE` | This request is too large. | ይህ ጥያቄ በጣም ትልቅ ነው። |
| `errors.REQUEST_DATA_INVALID` | The submitted details do not meet the data requirements. | የቀረቡት ዝርዝሮች የመረጃ መስፈርቶቹን አያሟሉም። |
| `errors.REQUEST_JSON_INVALID` | Request body must contain valid JSON. | የጥያቄው ይዘት ትክክለኛ JSON መሆን አለበት። |
| `errors.PRO_SIGN_IN_REQUIRED` | Professional sign-in is required. | የባለሙያ መግቢያ ያስፈልጋል። |
| `errors.PRO_LOCATION_NOT_ELIGIBLE` | This professional account is not currently eligible to share location. | ይህ የባለሙያ መለያ በአሁኑ ጊዜ አካባቢን ለማጋራት ብቁ አይደለም። |
| `errors.PRO_LOGIN_DETAILS_REQUIRED` | Enter the phone number registered with Meraki and your password. | በMeraki የተመዘገበውን ስልክ ቁጥር እና የይለፍ ቃልዎን ያስገቡ። |
| `errors.PRO_LOGIN_INCORRECT` | Phone number or password is incorrect. | ስልክ ቁጥር ወይም የይለፍ ቃል ትክክል አይደለም። |
| `errors.PRO_ACCOUNT_INACTIVE` | This professional account is not currently active. Contact Meraki Operations. | ይህ የባለሙያ መለያ በአሁኑ ጊዜ ንቁ አይደለም። የMeraki ኦፕሬሽንስ ቡድንን ያግኙ። |
| `errors.PRO_LOCATION_UPDATE_FORBIDDEN` | This professional account cannot update its location. | ይህ የባለሙያ መለያ አካባቢውን ማዘመን አይችልም። |
| `errors.PREFERRED_TIME_INVALID` | Choose a valid preferred time. | ትክክለኛ ተመራጭ ሰዓት ይምረጡ። |
| `errors.PREFERRED_TIME_PAST` | Choose a preferred time in the future. | ወደፊት ያለ ተመራጭ ሰዓት ይምረጡ። |
| `errors.PROFESSIONAL_NOT_FOUND` | Professional not found. | ባለሙያው አልተገኘም። |
| `errors.SERVICE_CHOICE_INVALID` | Choose a valid service. | ትክክለኛ አገልግሎት ይምረጡ። |
| `errors.RATE_MAX_INVALID` | Maximum rate must be zero or more. | ከፍተኛው ክፍያ ዜሮ ወይም ከዚያ በላይ መሆን አለበት። |
| `errors.RATING_MIN_INVALID` | Minimum rating must be between 0 and 5. | ዝቅተኛው ደረጃ ከ0 እስከ 5 መሆን አለበት። |
| `errors.COORDINATES_NOT_NUMBERS` | Coordinates must be numbers. | መጋጠሚያዎች ቁጥሮች መሆን አለባቸው። |
| `errors.LATITUDE_RANGE` | Latitude must be between -90 and 90. | ኬክሮስ ከ-90 እስከ 90 መሆን አለበት። |
| `errors.LONGITUDE_RANGE` | Longitude must be between -180 and 180. | ኬንትሮስ ከ-180 እስከ 180 መሆን አለበት። |
| `errors.COORDINATES_BOTH_REQUIRED` | Send both latitude and longitude. | ኬክሮስ እና ኬንትሮስ ሁለቱንም ይላኩ። |
| `errors.COORDINATES_PLACEHOLDER` | That coordinate is a null island placeholder, not a real location. | ያ መጋጠሚያ ትክክለኛ ቦታ ሳይሆን የ(0,0) ቦታ መያዣ ነው። |
| `errors.ACCURACY_NOT_NUMBER` | Accuracy must be a number of meters. | ትክክለኛነቱ በሜትር የተገለጸ ቁጥር መሆን አለበት። |
| `errors.ACCURACY_RANGE` | Accuracy must be between 0 and 100000 meters. | ትክክለኛነቱ ከ0 እስከ 100000 ሜትር መሆን አለበት። |
| `errors.LIVE_LOCATION_SIGN_IN_VIEW` | Sign in to view live location sharing. | የቀጥታ አካባቢ ማጋራትን ለማየት ይግቡ። |
| `errors.LIVE_LOCATION_SIGN_IN_MANAGE` | Sign in to manage live location sharing. | የቀጥታ አካባቢ ማጋራትን ለማስተዳደር ይግቡ። |
| `errors.LIVE_LOCATION_SIGN_IN_CONSENT` | Sign in to manage live location consent. | የቀጥታ አካባቢ ፈቃድን ለማስተዳደር ይግቡ። |
| `errors.LIVE_LOCATION_WHICH_PROFESSIONAL` | Choose which assigned professional this consent applies to. | ይህ ፈቃድ የሚመለከተውን የተመደበ ባለሙያ ይምረጡ። |
| `errors.LIVE_LOCATION_NONE_ACTIVE` | There is no active live location sharing to stop. | የሚቆም ንቁ የቀጥታ አካባቢ ማጋራት የለም። |
| `errors.LIVE_LOCATION_BOOKING_STATUS` | Live location sharing needs a confirmed or in-progress booking. | የቀጥታ አካባቢ ማጋራት የተረጋገጠ ወይም በሂደት ላይ ያለ ቦታ ማስያዝ ያስፈልገዋል። |
| `errors.LIVE_LOCATION_NOT_ASSIGNED` | That professional is not currently assigned to this booking. | ያ ባለሙያ በአሁኑ ጊዜ ለዚህ ቦታ ማስያዝ አልተመደበም። |
| `errors.LIVE_LOCATION_SIGN_IN_STOP` | Sign in to stop live location sharing. | የቀጥታ አካባቢ ማጋራትን ለማቆም ይግቡ። |
| `errors.LIVE_LOCATION_NOT_FOUND` | No live location sharing found for this booking. | ለዚህ ቦታ ማስያዝ የቀጥታ አካባቢ ማጋራት አልተገኘም። |
| `errors.LIVE_LOCATION_SIGN_IN_UPDATE` | Sign in to update your shared location. | የተጋራውን አካባቢዎን ለማዘመን ይግቡ። |
| `errors.LIVE_LOCATION_START_FIRST` | Start live location sharing before sending a position. | ቦታ ከመላክዎ በፊት የቀጥታ አካባቢ ማጋራትን ይጀምሩ። |
| `errors.LIVE_LOCATION_EXPIRED` | This live location session expired. Both parties must consent again. | ይህ የቀጥታ አካባቢ ክፍለ ጊዜ አብቅቷል። ሁለቱም ወገኖች እንደገና መፍቀድ አለባቸው። |
| `errors.LIVE_LOCATION_NOT_ACTIVE` | Live location sharing is not active for this booking. | ለዚህ ቦታ ማስያዝ የቀጥታ አካባቢ ማጋራት ንቁ አይደለም። |
| `errors.LIVE_LOCATION_INACTIVE` | Live location sharing is no longer active. | የቀጥታ አካባቢ ማጋራት ከአሁን በኋላ ንቁ አይደለም። |

### Service names and descriptions (translated by the API while the database English is unchanged) (16)

| Key | English | Amharic draft |
|---|---|---|
| `serviceCatalog.handyman_plumbing.name` | Minor Home Repairs | አነስተኛ የቤት ጥገናዎች |
| `serviceCatalog.handyman_plumbing.description` | Small household repairs, fittings, and maintenance. Share the issue and our team will review the work and price with you. | አነስተኛ የቤት ውስጥ ጥገናዎች፣ መገጣጠሚያዎች እና እንክብካቤ። ችግሩን ያጋሩ፤ ቡድናችን ሥራውን እና ዋጋውን ከእርስዎ ጋር ይገመግማል። |
| `serviceCatalog.gardening_outdoor.name` | Gardening & Outdoor | የአትክልት እና የውጭ ቦታ እንክብካቤ |
| `serviceCatalog.gardening_outdoor.description` | Garden care and outdoor upkeep for homes. Tell us about the space and the work you have in mind. | ለቤቶች የአትክልት እንክብካቤ እና የውጭ ቦታ ጥገና። ስለ ቦታው እና ስለሚፈልጉት ሥራ ይንገሩን። |
| `serviceCatalog.office_cleaning.name` | Office & Commercial Cleaning | የቢሮ እና የንግድ ቦታ ጽዳት |
| `serviceCatalog.office_cleaning.description` | Cleaning requests for offices and commercial spaces. Scope and schedule are reviewed before confirmation. | ለቢሮዎች እና ለንግድ ቦታዎች የጽዳት ጥያቄዎች። የሥራ ወሰን እና ፕሮግራም ከማረጋገጫ በፊት ይገመገማሉ። |
| `serviceCatalog.elder_companion.name` | Elder Companion Care | የአረጋውያን አጃቢ እንክብካቤ |
| `serviceCatalog.elder_companion.description` | Companion support requests for older adults. Share the kind of support and preferred schedule for a careful review. | ለአረጋውያን የአጃቢ ድጋፍ ጥያቄዎች። ለጥንቃቄ ግምገማ የሚፈልጉትን የድጋፍ አይነት እና ተመራጭ ፕሮግራም ያጋሩ። |
| `serviceCatalog.childcare_nanny.name` | Childcare & Babysitting | የልጅ እንክብካቤ እና የልጅ ማቆያ |
| `serviceCatalog.childcare_nanny.description` | Childcare support for infants, toddlers, and school-age children. Share care requirements for review. | ለሕፃናት፣ ለታዳጊዎች እና ለትምህርት ዕድሜ ልጆች የልጅ እንክብካቤ ድጋፍ። ለግምገማ የእንክብካቤ መስፈርቶችን ያጋሩ። |
| `serviceCatalog.cooking_service.name` | Personal Cooking | የግል ምግብ ዝግጅት |
| `serviceCatalog.cooking_service.description` | In-home meal preparation. Tell us about the menu, dietary needs, and occasion. | በቤት ውስጥ የምግብ ዝግጅት። ስለ ምግብ ዝርዝሩ፣ ስለ አመጋገብ ፍላጎቶች እና ስለ ዝግጅቱ ይንገሩን። |
| `serviceCatalog.maid_laundry.name` | Laundry & Ironing | ልብስ ማጠብ እና መተኮስ |
| `serviceCatalog.maid_laundry.description` | Laundry, ironing, and garment care requests for your household. Final scope is reviewed with you. | ለቤተሰብዎ የልብስ ማጠብ፣ መተኮስ እና የልብስ እንክብካቤ ጥያቄዎች። የመጨረሻው የሥራ ወሰን ከእርስዎ ጋር ይገመገማል። |
| `serviceCatalog.premium_home_cleaning.name` | Premium Home Cleaning | ከፍተኛ የቤት ጽዳት |
| `serviceCatalog.premium_home_cleaning.description` | Thoughtful home cleaning for apartments and villas, with the requested rooms and priorities agreed before a visit. | ለአፓርታማዎች እና ለቪላዎች በጥንቃቄ የሚሰራ የቤት ጽዳት፤ የሚፈለጉት ክፍሎች እና ቅድሚያዎች ከጉብኝቱ በፊት ይስማማሉ። |

### Service detail pages (41)

| Key | English | Amharic draft |
|---|---|---|
| `serviceCopy.handyman_plumbing.overview` | Get help with supported small repairs around your home, from plumbing issues to minor electrical fixes and painting touch-ups. | ከቧንቧ ችግሮች እስከ አነስተኛ የኤሌክትሪክ ጥገናዎች እና የቀለም ማስተካከያዎች ድረስ፣ በቤትዎ ዙሪያ ለሚደገፉ አነስተኛ ጥገናዎች እርዳታ ያግኙ። |
| `serviceCopy.handyman_plumbing.included.1` | Plumbing and fixture repairs | የቧንቧ እና የመገጣጠሚያ ጥገናዎች |
| `serviceCopy.handyman_plumbing.included.2` | Minor electrical fixes | አነስተኛ የኤሌክትሪክ ጥገናዎች |
| `serviceCopy.handyman_plumbing.included.3` | Painting touch-ups | የቀለም ማስተካከያዎች |
| `serviceCopy.handyman_plumbing.included.4` | Other supported small repairs agreed after review | ከግምገማ በኋላ የሚስማሙ ሌሎች የሚደገፉ አነስተኛ ጥገናዎች |
| `serviceCopy.handyman_plumbing.limitations.1` | Major renovation, structural work, and materials are not included unless separately reviewed and approved. | ትላልቅ እድሳቶች፣ የመዋቅር ሥራ እና ቁሳቁሶች በተናጠል ካልተገመገሙ እና ካልጸደቁ በስተቀር አይካተቱም። |
| `serviceCopy.gardening_outdoor.overview` | Arrange upkeep for a home garden, compound, or terrace. Tell us about the space and the work you need so the scope can be reviewed. | ለቤት የአትክልት ስፍራ፣ ግቢ ወይም በረንዳ እንክብካቤ ያዘጋጁ። የሥራ ወሰኑ እንዲገመገም ስለ ቦታው እና ስለሚፈልጉት ሥራ ይንገሩን። |
| `serviceCopy.gardening_outdoor.included.1` | Garden and compound upkeep | የአትክልት ስፍራ እና የግቢ እንክብካቤ |
| `serviceCopy.gardening_outdoor.included.2` | Terrace maintenance | የበረንዳ ጥገና |
| `serviceCopy.gardening_outdoor.included.3` | Pruning, weeding, and general care when agreed | ሲስማማ መግረዝ፣ አረም ማረም እና አጠቃላይ እንክብካቤ |
| `serviceCopy.gardening_outdoor.limitations.1` | Planting materials, equipment, disposal, and larger landscaping work need to be confirmed before the request is accepted. | የመትከያ ቁሳቁሶች፣ መሳሪያዎች፣ ቆሻሻ ማስወገድ እና ትላልቅ የመሬት ገጽታ ሥራዎች ጥያቄው ከመቀበሉ በፊት መረጋገጥ አለባቸው። |
| `serviceCopy.office_cleaning.overview` | Request cleaning for an office or commercial premises. Share the size, areas, and preferred schedule for an operations review. | ለቢሮ ወይም ለንግድ ቦታ ጽዳት ይጠይቁ። ለኦፕሬሽንስ ግምገማ መጠኑን፣ ቦታዎቹን እና ተመራጭ ፕሮግራሙን ያጋሩ። |
| `serviceCopy.office_cleaning.included.1` | Cleaning scope for commercial premises | ለንግድ ቦታዎች የጽዳት የሥራ ወሰን |
| `serviceCopy.office_cleaning.included.2` | One-time or recurring schedule requests where available | በሚቻልበት ጊዜ የአንድ ጊዜ ወይም ተደጋጋሚ የፕሮግራም ጥያቄዎች |
| `serviceCopy.office_cleaning.included.3` | A scope and schedule review before confirmation | ከማረጋገጫ በፊት የሥራ ወሰን እና የፕሮግራም ግምገማ |
| `serviceCopy.office_cleaning.limitations.1` | Recurring arrangements depend on confirmed capacity. Supplies, specialist cleaning, and access requirements must be agreed in advance. | ተደጋጋሚ ዝግጅቶች በተረጋገጠ አቅም ላይ ይወሰናሉ። የጽዳት ቁሳቁሶች፣ ልዩ ጽዳት እና የመግቢያ መስፈርቶች አስቀድመው መስማማት አለባቸው። |
| `serviceCopy.elder_companion.overview` | Arrange a friendly companion visit for an older adult. Share their routines, interests, and the everyday support your household would like reviewed. | ለአረጋዊ ሰው ወዳጃዊ የአጃቢ ጉብኝት ያዘጋጁ። የዕለት ተዕለት ልማዶቻቸውን፣ ፍላጎቶቻቸውን እና ቤተሰብዎ እንዲገመገም የሚፈልገውን የዕለት ተዕለት ድጋፍ ያጋሩ። |
| `serviceCopy.elder_companion.included.1` | Conversation and companionship | ጭውውት እና አብሮነት |
| `serviceCopy.elder_companion.included.2` | Reading, games, or other shared activities | ንባብ፣ ጨዋታዎች ወይም ሌሎች የጋራ እንቅስቃሴዎች |
| `serviceCopy.elder_companion.included.3` | Light everyday assistance when agreed after review | ከግምገማ በኋላ ሲስማማ ቀላል የዕለት ተዕለት እርዳታ |
| `serviceCopy.elder_companion.limitations.1` ⚠️ safety wording | This is a non-medical companion service, not nursing, diagnosis, medication administration, or emergency care. Support needs, suitability, availability, and price are reviewed with the household before confirmation. | ይህ የሕክምና ያልሆነ የአጃቢ አገልግሎት ነው፤ የነርሲንግ፣ የምርመራ፣ መድሃኒት የመስጠት ወይም የድንገተኛ ሕክምና አገልግሎት አይደለም። የድጋፍ ፍላጎቶች፣ ተስማሚነት፣ ተገኝነት እና ዋጋ ከማረጋገጫ በፊት ከቤተሰቡ ጋር ይገመገማሉ። |
| `serviceCopy.childcare_nanny.overview` | Arrange childcare with a schedule and care needs that fit your family. Share children’s ages and requested hours for review. | ለቤተሰብዎ የሚስማማ ፕሮግራም እና የእንክብካቤ ፍላጎቶች ያለው የልጅ እንክብካቤ ያዘጋጁ። ለግምገማ የልጆቹን ዕድሜ እና የሚፈልጓቸውን ሰዓታት ያጋሩ። |
| `serviceCopy.childcare_nanny.included.1` | Childcare requests for infants, toddlers, and school-age children | ለሕፃናት፣ ለታዳጊዎች እና ለትምህርት ዕድሜ ልጆች የልጅ እንክብካቤ ጥያቄዎች |
| `serviceCopy.childcare_nanny.included.2` | Flexible schedule requests | ተለዋዋጭ የፕሮግራም ጥያቄዎች |
| `serviceCopy.childcare_nanny.included.3` | Care requirements discussed before confirmation | ከማረጋገጫ በፊት የሚወያዩባቸው የእንክብካቤ መስፈርቶች |
| `serviceCopy.childcare_nanny.limitations.1` ⚠️ safety wording | Provider availability and qualifications must be confirmed for each request. No appointment is confirmed until the team contacts you. | የአገልግሎት ሰጪው ተገኝነት እና ብቃት ለእያንዳንዱ ጥያቄ መረጋገጥ አለበት። ቡድኑ እስኪያገኝዎ ድረስ ምንም ቀጠሮ አይረጋገጥም። |
| `serviceCopy.cooking_service.overview` | Request in-home meal preparation for daily meals or a weekly plan. Share your menu, dietary needs, servings, and ingredient preferences. | ለዕለታዊ ምግቦች ወይም ለሳምንታዊ ዕቅድ በቤት ውስጥ የምግብ ዝግጅት ይጠይቁ። የምግብ ዝርዝርዎን፣ የአመጋገብ ፍላጎቶችዎን፣ የሰዎች ብዛት እና የግብዓት ምርጫዎችዎን ያጋሩ። |
| `serviceCopy.cooking_service.included.1` | Meal preparation at home | በቤት ውስጥ የምግብ ዝግጅት |
| `serviceCopy.cooking_service.included.2` | Daily or weekly plan requests | የዕለታዊ ወይም የሳምንታዊ ዕቅድ ጥያቄዎች |
| `serviceCopy.cooking_service.included.3` | Menu and dietary preferences reviewed with you | ከእርስዎ ጋር የሚገመገሙ የምግብ ዝርዝር እና የአመጋገብ ምርጫዎች |
| `serviceCopy.cooking_service.limitations.1` | Ingredient purchasing, special equipment, and dietary requirements must be agreed before the service is confirmed. | የግብዓት ግዢ፣ ልዩ መሳሪያዎች እና የአመጋገብ መስፈርቶች አገልግሎቱ ከመረጋገጡ በፊት መስማማት አለባቸው። |
| `serviceCopy.maid_laundry.overview` | Request household laundry and ironing support, with the garment care and expected volume described up front. | የልብስ እንክብካቤውን እና የሚጠበቀውን መጠን አስቀድመው በመግለጽ የቤት ውስጥ ልብስ ማጠብ እና መተኮስ ድጋፍ ይጠይቁ። |
| `serviceCopy.maid_laundry.included.1` | Laundry and garment care | ልብስ ማጠብ እና የልብስ እንክብካቤ |
| `serviceCopy.maid_laundry.included.2` | Ironing | ልብስ መተኮስ |
| `serviceCopy.maid_laundry.included.3` | Wash, fold, or other tasks agreed during review | በግምገማ ወቅት የሚስማሙ ማጠብ፣ ማጠፍ ወይም ሌሎች ሥራዎች |
| `serviceCopy.maid_laundry.limitations.1` | Pickup and delivery are not currently listed as a standard option. Detergents, delicate garments, and turnaround time need to be discussed. | ልብስ መውሰድ እና ማድረስ በአሁኑ ጊዜ እንደ መደበኛ አማራጭ አልተዘረዘሩም። ሳሙናዎች፣ ስስ ልብሶች እና የማጠናቀቂያ ጊዜ መወያየት ያስፈልጋቸዋል። |
| `serviceCopy.premium_home_cleaning.overview` | Arrange thorough home cleaning for your household. Tell us about the property, priority rooms, and any special surfaces or requirements. | ለቤተሰብዎ የተሟላ የቤት ጽዳት ያዘጋጁ። ስለ ቤቱ፣ ቅድሚያ ስለሚሰጣቸው ክፍሎች እና ስለ ማንኛውም ልዩ ወለሎች ወይም መስፈርቶች ይንገሩን። |
| `serviceCopy.premium_home_cleaning.included.1` | Home cleaning scope reviewed for your property | ለቤትዎ የተገመገመ የቤት ጽዳት የሥራ ወሰን |
| `serviceCopy.premium_home_cleaning.included.2` | Priority rooms and tasks agreed with you | ከእርስዎ ጋር የሚስማሙ ቅድሚያ የሚሰጣቸው ክፍሎች እና ሥራዎች |
| `serviceCopy.premium_home_cleaning.included.3` | Equipment and supplies discussed before the visit | ከጉብኝቱ በፊት የሚወያዩባቸው መሳሪያዎች እና ቁሳቁሶች |
| `serviceCopy.premium_home_cleaning.limitations.1` | Equipment and supplies are included only when confirmed for your request. Deep restoration or specialist work may require a separate quote. | መሳሪያዎች እና ቁሳቁሶች የሚካተቱት ለጥያቄዎ ሲረጋገጡ ብቻ ነው። ጥልቅ እድሳት ወይም ልዩ ሥራ የተለየ የዋጋ ግምት ሊያስፈልገው ይችላል። |

### Assistant (Merk / Agaz AI) window (31)

| Key | English | Amharic draft |
|---|---|---|
| `assistant.subtitle` | Meraki Homes AI Assistant | የMeraki Homes AI ረዳት |
| `assistant.online` | Online now | አሁን በመስመር ላይ |
| `assistant.prompt` | Ask about services, pricing, or booking | ስለ አገልግሎቶች፣ ዋጋ ወይም ቦታ ማስያዝ ይጠይቁ |
| `assistant.closeChat` | Close chat | ውይይቱን ዝጋ |
| `assistant.openAssistant` | Open Merk assistant | የMerk ረዳትን ክፈት |
| `assistant.closeAssistant` | Close Merk assistant | የMerk ረዳትን ዝጋ |
| `assistant.chatWithMeraki` | Chat with Meraki | ከMeraki ጋር ይወያዩ |
| `assistant.replyLanguage` | Reply language | የምላሽ ቋንቋ |
| `assistant.languageAuto` | Auto | ራስ-ሰር |
| `assistant.inputLabel` | Message Agaz AI, the Meraki Homes assistant | ለMeraki Homes ረዳት ለAgaz AI መልዕክት ይጻፉ |
| `assistant.placeholder` | Ask Agaz AI about Meraki Homes... | ስለ Meraki Homes Agaz AIን ይጠይቁ... |
| `assistant.send` | Send message | መልዕክት ላክ |
| `assistant.waitForReply` | Please wait for the reply | እባክዎ ምላሹን ይጠብቁ |
| `assistant.enterMessage` | Enter a message to send | ለመላክ መልዕክት ያስገቡ |
| `assistant.conversationRegion` | Conversation and suggestions | ውይይት እና ጥቆማዎች |
| `assistant.conversation` | Conversation | ውይይት |
| `assistant.assistantMessages` | Assistant messages | የረዳቱ መልዕክቶች |
| `assistant.yourMessages` | Your messages | የእርስዎ መልዕክቶች |
| `assistant.suggestedQuestions` | Suggested questions | የተጠቆሙ ጥያቄዎች |
| `assistant.actionBook` | Book a Service | አገልግሎት ያስይዙ |
| `assistant.actionExplore` | Explore Services | አገልግሎቶችን ያስሱ |
| `assistant.actionPricing` | Pricing | ዋጋ |
| `assistant.actionSupport` | Contact Support | ድጋፍ ያግኙ |
| `assistant.typing` | Merk is replying | Merk እየመለሰ ነው |
| `assistant.continueBooking` | Continue to booking | ወደ ቦታ ማስያዝ ይቀጥሉ |
| `assistant.welcome` | 👋 Hello and welcome to Meraki Homes! I’m Agaz AI, Meraki Homes’ assistant. I can help with services, pricing, and booking requests. | 👋 ሰላም፣ እንኳን ወደ Meraki Homes በደህና መጡ! እኔ Agaz AI ነኝ፣ የMeraki Homes ረዳት። በአገልግሎቶች፣ በዋጋ እና በቦታ ማስያዝ ጥያቄዎች ልረዳዎ እችላለሁ። |
| `assistant.helpTopics` | Choose a service question to start. Operations confirms availability, final scope, and price after reviewing a booking request. | ለመጀመር የአገልግሎት ጥያቄ ይምረጡ። የኦፕሬሽንስ ቡድኑ የቦታ ማስያዝ ጥያቄውን ከገመገመ በኋላ ተገኝነትን፣ የመጨረሻ የሥራ ወሰንን እና ዋጋን ያረጋግጣል። |
| `assistant.errorReply` | The assistant could not reply. Please try again. | ረዳቱ መልስ መስጠት አልቻለም። እባክዎ እንደገና ይሞክሩ። |
| `assistant.errorUnexpected` | The assistant returned an unexpected response. Please try again. | ረዳቱ ያልተጠበቀ ምላሽ መልሷል። እባክዎ እንደገና ይሞክሩ። |
| `assistant.errorSlow` | The reply is taking longer than expected. Check your connection and retry. | ምላሹ ከተጠበቀው በላይ እየዘገየ ነው። ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ። |
| `assistant.errorUnavailable` | The assistant is temporarily unavailable. Please try again. | ረዳቱ ለጊዜው አይገኝም። እባክዎ እንደገና ይሞክሩ። |

### Error page (3)

| Key | English | Amharic draft |
|---|---|---|
| `errorPage.title` | This page could not be loaded | ይህ ገጽ ሊጫን አልቻለም |
| `errorPage.body` | Your booking and account records are not affected. Please try again. | የቦታ ማስያዝ እና የመለያ መዝገቦችዎ አልተጎዱም። እባክዎ እንደገና ይሞክሩ። |
| `errorPage.retry` | Try again | እንደገና ይሞክሩ |

### Footer (15)

| Key | English | Amharic draft |
|---|---|---|
| `footer.serviceLinks.premium_home_cleaning` | Premium Home Cleaning | ከፍተኛ የቤት ጽዳት |
| `footer.serviceLinks.cooking_service` | Personal Cooking & Prep | የግል ምግብ ዝግጅት |
| `footer.serviceLinks.childcare_nanny` | Childcare & Babysitting | የልጅ እንክብካቤ እና የልጅ ማቆያ |
| `footer.serviceLinks.elder_companion` | Elder Companion Care | የአረጋውያን አጃቢ እንክብካቤ |
| `footer.serviceLinks.maid_laundry` | Laundry & Ironing | ልብስ ማጠብ እና መተኮስ |
| `footer.serviceLinks.handyman_plumbing` | Minor Repairs & Handyman | አነስተኛ ጥገናዎች እና የእጅ ባለሙያ |
| `footer.serviceLinks.gardening_outdoor` | Gardening & Grounds | የአትክልት እና የግቢ እንክብካቤ |
| `footer.serviceLinks.office_cleaning` | Office & Commercial Cleaning | የቢሮ እና የንግድ ቦታ ጽዳት |
| `footer.team` | Our Team | ቡድናችን |
| `footer.blog` | Journal & Guides | መጽሔት እና መመሪያዎች |
| `footer.faq` | FAQs | ተደጋግመው የሚጠየቁ ጥያቄዎች |
| `footer.emailUs` | Email Us | ኢሜይል ይላኩልን |
| `footer.callUs` | Call Us | ይደውሉልን |
| `footer.directDispatch` | Direct Dispatch: | ቀጥታ ስልክ፦ |
| `footer.emailInquiries` | Email Inquiries: | የኢሜይል ጥያቄዎች፦ |

## Approved

| Key | Reviewer | Date |
|---|---|---|
