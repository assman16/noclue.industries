/**
 * Initial legal texts (Markdown → Lexical on seed). Editable afterwards in the CMS (Pages).
 *
 * Operator data is taken from the published NoClue Studio legal information
 * (noclue.studio/ochrana-sukromia, footer) — same legal entity.
 * The texts describe THIS site's processing: no analytics, no marketing cookies,
 * inquiry storage in our own database, optional SMTP notification.
 * Items marked for review are listed in docs/REVIEW.md.
 */

export const privacyMarkdown = `
This notice explains how personal data is processed on **noclue.industries**. We follow Regulation (EU) 2016/679 (GDPR) and Slovak Act No. 18/2018 Coll. on the protection of personal data.

## 1. Controller

The controller is **Sapfir Research & Development s. r. o.**, Záhradná 953/19, 900 24 Veľký Biel, Slovak Republic, IČO 56 275 188, registered in the Commercial Register of the Municipal Court Bratislava III, Section Sro, Insert No. 178856/B. The company operates the NoClue Industries and NoClue Studio brands.

Contact: info@noclue.studio, +421 915 565 511. We have not appointed a data protection officer, as we are not required to; please send any question or request to the email address above.

## 2. What we process, why, and for how long

**Project inquiries.** When you send the inquiry form we process your name, email address, optional company name, the project details you choose to give (scope, stage, timeline, budget, message) and your confirmation that you have read this notice. Legal basis: steps taken at your request before entering into a contract (Art. 6(1)(b) GDPR) and, where you write on behalf of a company, our legitimate interest in answering business inquiries (Art. 6(1)(f) GDPR). Inquiries are stored in our own content-management system and kept for **12 months after our last communication**, unless a project follows — then the rules for client projects apply.

**Abuse protection for the form.** To limit spam and automated abuse we process your IP address briefly in server memory for rate limiting and store only a salted, one-way hash of it alongside your inquiry, together with your browser's user-agent string. Legal basis: our legitimate interest in the security of the website (Art. 6(1)(f) GDPR). These technical details are deleted together with the inquiry.

**Server logs.** When you visit the site, the web server and its infrastructure record technical data such as IP address, time of the request, requested address and browser user-agent. This is necessary to deliver the site and keep it secure (Art. 6(1)(f) GDPR). Logs are kept only as long as needed for operation and security.

**Client projects and accounting.** If a project follows, we process contact and project data to perform the contract (Art. 6(1)(b) GDPR) for the duration of the cooperation and then until limitation periods expire, and invoicing data as required by accounting law (Art. 6(1)(c) GDPR; Act No. 431/2002 Coll.) for 10 years.

Providing data is voluntary, but without contact details we cannot reply to you.

## 3. Recipients

We do not sell personal data. It is made available only to the extent necessary to:

- the provider of the server infrastructure on which this website and its database run,
- our email service provider, which delivers inquiry notifications to our mailboxes,
- accounting, tax and legal advisers bound by confidentiality,
- public authorities where the law requires it.

Processors act on our behalf under Art. 28 GDPR. If any recipient processes data outside the EU/EEA, the transfer relies on an adequacy decision or standard contractual clauses (Art. 46(2)(c) GDPR); we will provide details on request.

## 4. Cookies and similar technologies

This website does **not** use analytics, advertising or tracking cookies and does not load third-party tracking scripts. Visitors to the public site receive no cookies from us.

The content-management area at /admin sets a strictly necessary session cookie (payload-token) for signed-in staff only. No consent is required for strictly necessary cookies.

If we ever introduce optional analytics, we will ask for your consent first and update this notice.

## 5. Your rights

You have the right to access your data (Art. 15), to rectification (Art. 16), to erasure (Art. 17), to restriction of processing (Art. 18), to data portability (Art. 20) and to object to processing based on legitimate interest (Art. 21). To exercise them, write to info@noclue.studio. We respond free of charge without undue delay, at the latest within one month; in justified cases we may extend this by two months and will let you know.

You may also lodge a complaint with the supervisory authority: Úrad na ochranu osobných údajov Slovenskej republiky, Hraničná 12, 820 07 Bratislava 27, www.dataprotection.gov.sk.

## 6. Automated decisions

We do not make automated individual decisions or carry out profiling with legal or similarly significant effects (Art. 22 GDPR).

## 7. Security

We use technical and organisational measures appropriate to the data: encrypted connections, access control to the content-management system, a database that is not reachable from the internet, and regular backups. For sensitive technical documents we recommend agreeing on a secure exchange channel with us first.

## 8. Changes

We update this notice when our processing or the law changes. The current version is always published on this page; the effective date above reflects the latest change.
`

export const legalMarkdown = `
## Operator

NoClue Industries is a brand of:

**Sapfir Research & Development s. r. o.**
Záhradná 953/19
900 24 Veľký Biel
Slovak Republic

- IČO (company ID): 56 275 188
- DIČ (tax ID): 2122265519
- Registered in the Commercial Register of the Municipal Court Bratislava III, Section Sro, Insert No. 178856/B.

The same company operates NoClue Studio (noclue.studio), our software, web and automation studio.

## Contact

- Email: info@noclue.studio
- Phone: +421 915 565 511

## About this website

The content of this website is provided for general information about our engineering services. It does not constitute an offer; individual projects are agreed in writing.

Every image on this site is labelled with what it is. **NoClue hardware** marks renders computer-generated from real design data (ECAD/CAD files). **Demonstration model** marks the DA-02 actuator (and the earlier DA-01 enclosure), which are concept assemblies modelled to illustrate our visualisation and mechanical design process. They are not client products. **Illustrative photography** marks licensed stock photographs by third-party photographers, used to show the kind of work each discipline involves. They do not show our premises, equipment, clients or projects. The photographers are credited on the [image credits](/credits) page.

Product names, part numbers and trademarks of third parties mentioned on this website belong to their respective owners and are used only to describe components in our designs.

## Copyright

Unless stated otherwise, texts, renders and graphics on this website are © Sapfir Research & Development s. r. o. Please ask before reusing them. Illustrative photographs remain the work of their photographers and are used under the Unsplash License. See [image credits](/credits).

Fonts: Saira and JetBrains Mono, used under the SIL Open Font License 1.1.
`
