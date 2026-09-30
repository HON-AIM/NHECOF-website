# DNS, domain and email checklist

Fill in the actual values as each item is done. A checklist with placeholder
ticks is worse than an empty one, because it looks finished.

**Domain:** _TBC_
**Apex:** _TBC_ · **www:** _TBC_
**Email sending domain:** _TBC_
**Owner:** _TBC_

---

## 1. Nameservers and DNS

- [ ] **1.1.** Nameservers are set at the registrar to the nameservers in use
      (e.g. Cloudflare). Evidence: __
- [ ] **1.2.** A backup of the current DNS zone exists before any change
      (`dig` output or a Cloudflare export). Evidence: __
- [ ] **1.3.** Propagation time is allowed for after each change; do not
      verify within minutes of an edit. Evidence: __

## 2. Apex and www

Pick one canonical host and redirect the other to it permanently. Serving both
as 200s splits SEO signals and makes analytics count every visitor twice.

- [ ] **2.1.** Apex `A`/`ALIAS`/`CNAME` points to Vercel. Evidence: __
- [ ] **2.2.** `www` points to Vercel. Evidence: __
- [ ] **2.3.** One of them issues a **301** (not 302) redirect to the other. Evidence:
      `curl -sSI https://<other> | grep -i location`
- [ ] **2.4.** The redirect target is the **canonical** host, chosen
      deliberately and used consistently in `NEXT_PUBLIC_SITE_URL`, the
      sitemap, canonical tags and Open Graph URLs. Evidence: __
- [ ] **2.5.** `NEXT_PUBLIC_SITE_URL` matches the canonical host exactly,
      including scheme and no trailing slash. Evidence: __

## 3. HTTPS

- [ ] **3.1.** A valid certificate is issued for apex and `www`. Evidence: __
- [ ] **3.2.** `https://` works and `http://` redirects to `https://`. Evidence: __
- [ ] **3.3.** No mixed-content warnings on any page. Evidence: __
- [ ] **3.4.** HSTS is present (`Strict-Transport-Security`).
      Evidence: `curl -sSI https://<apex> | grep -i strict-transport`
- [ ] **3.5.** **HSTS preload decision recorded.** The header sets a two-year
      `max-age` with `includeSubDomains` and `preload`. Submitting to the
      preload list is effectively irreversible for `includeSubDomains` — every
      subdomain must be HTTPS-only forever. Confirm every subdomain is
      (`www`, staging, Vercel previews) or reduce the scope first. Evidence: __

## 4. Turnstile

- [ ] **4.1.** Widget created in Cloudflare for the correct hostname(s). Evidence: __
- [ ] **4.2.** Site key (public) and secret key (server) are in the production
      Vercel env, and are the **matching pair**. Evidence: __
- [ ] **4.3.** A form submission succeeds with the live key. Evidence: __
- [ ] **4.4.** A submission from an unlisted hostname is blocked. Evidence: __

## 5. Resend email domain verification

SPF, DKIM and DMARC must all be correct or mail lands in spam.

- [ ] **5.1.** Sending domain added in Resend. Evidence: __
- [ ] **5.2.** SPF record published. Note that SPF allows only **one** record;
      if the provider already has one (e.g. Google Workspace), SPF must be
      merged into a single record or mail will be rejected or fail
      alignment. Evidence: __
- [ ] **5.3.** DKIM records published (Resend supplies a `TXT` record, often with
      multiple `k=` selectors). Evidence: __
- [ ] **5.4.** Domain status shows **verified** in Resend. Evidence: __
- [ ] **5.5.** DMARC record published, starting at `p=none` with `rua` for
      reporting. Move to `p=quarantine`/`p=reject` only after reports confirm
      all legitimate senders pass. Evidence: __

## 6. Inbox delivery test

The requirement is a real end-to-end test, not a Resent success message. A
successful API call proves the provider accepted the message; it does not prove
any inbox received it.

Send one outreach-request submission from production and record the result for
**both** providers.

| Provider | Test address | Received | In Promotions/Spam | Landed in spam | Time to arrive | Evidence |
|---|---|---|---|---|---|---|
| Gmail | _TBC_ | ☐ | ☐ | ☐ | __ | __ |
| Outlook | _TBC_ | ☐ | ☐ | ☐ | __ | __ |
| (optional) Yahoo | _TBC_ | ☐ | ☐ | ☐ | __ | __ |

- [ ] **6.1.** Gmail received the outreach notification. Evidence: __
- [ ] **6.2.** Outlook received the outreach notification. Evidence: __
- [ ] **6.3.** The **acknowledgement to the submitter** also arrived in both.
      Evidence: __
- [ ] **6.4.** Neither message shows a "spam" warning banner. Evidence: __
- [ ] **6.5.** SPF, DKIM and DMARC all **pass** in the message headers of a
      real received message (`Authentication-Results:` header).
      Evidence: paste the header here.
- [ ] **6.6.** The sender domain matches the verified domain. Evidence: __

If a message fails, check in this order: DKIM selectors published → SPF merged
into one record → DMARC alignment (the `From:` domain must match both) →
resend rate limit or suppression list.

## 7. Sanity CORS

- [ ] **7.1.** CORS origins for the **production** dataset include the apex
      and `www`, with credentials enabled. Evidence: __
- [ ] **7.2.** CORS origins for the **development** dataset include localhost
      and the Preview domain. Evidence: __
- [ ] **7.3.** Origins are not wildcarded with credentials — browsers reject
      that combination, and it would be a real vulnerability if they did not. Evidence: __
- [ ] **7.4.** No production origin is missing from the development dataset's
      list by accident. Evidence: __

## 8. Analytics and monitoring

- [ ] **8.1.** `NEXT_PUBLIC_ANALYTICS_PROVIDER` set to `cloudflare` in
      production. Evidence: __
- [ ] **8.2.** The provider's domain appears in the CSP `connect-src`/`script-src`.
      Evidence: `curl -sSI https://<apex> | grep -i content-security`
- [ ] **8.3.** Uptime monitor created for `/`, `/nutrition` and `/api/health`. Evidence: __
- [ ] **8.4.** Alert channel tested by triggering a failure. Evidence: __
- [ ] **8.5.** Sentry DSN set, and a test error appears with no PII. Evidence: __

## 9. Post-launch verification

- [ ] **9.1.** `https://<apex>` loads over HTTPS with no mixed content. Evidence: __
- [ ] **9.2.** `https://www` redirects permanently to the canonical host. Evidence: __
- [ ] **9.3.** `robots.txt` allows crawling and points to the sitemap. Evidence: __
- [ ] **9.4.** `sitemap.xml` fetches successfully and validates. Evidence: __
- [ ] **9.5.** A shared link renders a correct preview (title, description, image). Evidence: __
- [ ] **9.6.** Google Search Console property verified and sitemap submitted. Evidence: __
- [ ] **9.7.** Bing Webmaster Tools property verified and sitemap submitted. Evidence: __
