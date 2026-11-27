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

## Approved

| Key | Reviewer | Date |
|---|---|---|
