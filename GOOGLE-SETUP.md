# Connect Circuit Lab results to Google Sheets

The assessment ticket works without this integration, but its **Send result to teacher** button reports that sending is not configured. Do not send students to the graded version until an end-to-end test has succeeded.

## 1. Create the spreadsheet and script

1. Sign in to the Google account that should own the results and send the emails.
2. Create a new Google Sheet in Drive. Copy the spreadsheet ID from its URL: the part between `/d/` and `/edit`.
3. In the sheet, open **Extensions → Apps Script**. Replace the sample code with the contents of `google-apps-script/Code.gs` from this project, then save.
4. Open **Project Settings → Script Properties** and add:
   - `SPREADSHEET_ID`: the spreadsheet ID copied above.
   - `NOTIFICATION_EMAIL`: the teacher's email address.
5. In Apps Script, select the `saveSubmission` function only if you intend to run it with test data. Do not run it directly without an argument. Deploy the web app as described below; Google will request authorization when needed.

## 2. Deploy the receiver

1. Select **Deploy → New deployment → Web app**.
2. Set **Execute as** to the account that owns the spreadsheet. For students to submit without Google sign-in, choose **Who has access: Anyone**. The account or school administrator may restrict these options.
3. Deploy and authorize access to Sheets and Mail when prompted. Copy the deployed URL ending in `/exec`. Do not share a URL ending in `/dev`.
4. Paste that URL between the quotes in `submission-config.js`. Do not put the teacher email or Google credentials in that public file.
5. Commit and push the site files to `main`. GitHub Pages publishes them automatically.

If Google does not offer **Anyone**, ask the school administrator for an approved way for students to access the web app. Do not select an unapproved sharing setting.

## 3. Test before class

1. Open the published site in a private window, enter a test name and class, and answer all 10 questions. Submit the ticket.
2. Wait for the explicit confirmation that the result was saved and the notification email was sent. Check the `Circuit Lab Results` tab in the sheet and the teacher's inbox.
3. Verify that one correct answer is worth 0.5 points and that 7/10 yields 3.5 (not passed) while 8/10 yields 4.0 (passed).
4. If sending reports an error or times out, keep the ticket open and retry. The same submission ID is reused so retries do not add another row. If mail delivery fails, the saved row is marked `Pending` and a retry attempts the notification again.

## Important limitations

- The site does not save progress. Refreshing or closing it starts a new session. One attempt per question is enforced only within the current session.
- A public web app endpoint can receive unauthenticated submissions. Names and grades are not verified, and someone can submit fabricated data or start another session. This is a classroom convenience, not a tamper-proof assessment or identity system.
- Only name, class, answers, and the calculated result are sent. The spreadsheet and email are controlled by the Google account owner; restrict access to the sheet. Email notifications are subject to Google quotas and school policies.
- If the page says **not sent**, a ticket alone does not confirm delivery. Print or save the ticket as a fallback and contact the teacher.
- Re-deploy the Apps Script as a new version after changing `Code.gs`. The Google account owner must complete and authorize this configuration; GitHub Pages cannot create the Google Sheet or send email by itself.
