import type ptBR from './pt-BR';

const en = {
    'home.heroLead': 'Open a',
    'home.heroObject': 'page.',
    'home.inputPlaceholder': 'my-page',
    'home.inputLabel': 'Page address',
    'home.inputError': 'Enter a valid path with up to four parts.',
    'home.openButton': 'Open',
    'home.opening': 'Opening...',
    'home.disclosureAccess': 'Public to anyone with the link',
    'home.disclosureExpiry': 'Removed after 30 days without visits',
    'home.presenceYou': 'you',
    'home.presenceGuest': 'guest',
    'home.example1': 'my-room',
    'home.example2': 'project/review',
    'home.example3': 'team/decisions',
    'editor.placeholder': 'Start typing... Use / for commands, **bold**, *italic*, # headings...',
    'editor.visualLabel': 'Document content',
    'editor.wordCount': '{count} words',
    'editor.characterCount': '{count} characters',
    'editor.sourcePlaceholder': 'Write your Markdown here...',
    'editor.sourceLabel': 'Document Markdown source',
    'editor.loading': 'Preparing the editor...',
    'editor.inlineSourceLabel': 'Edit block as Markdown',
    'editor.inlineSourceHelp': 'Press Enter to apply a single line, Shift+Enter for a new line, or Escape to cancel.',

    'navigation.home': 'Back to home',
    'navigation.skip': 'Skip to main content',

    'documentTree.title': 'Pages',
    'documentTree.breadcrumbs': 'Page path',
    'documentTree.open': 'Open page tree',
    'documentTree.close': 'Close page tree',
    'documentTree.expandSidebar': 'Expand pages panel',
    'documentTree.collapseSidebar': 'Collapse pages panel',
    'documentTree.expand': 'Expand {page}',
    'documentTree.collapse': 'Collapse {page}',
    'documentTree.loading': 'Loading pages...',
    'documentTree.loadError': 'Could not load this branch.',
    'documentTree.retry': 'Try again',
    'documentTree.delete': 'Delete {page}',
    'documentTree.deleteConfirm': 'Delete {page} and everything under it? This cannot be undone.',

    'loader.loading': 'Loading page...',

    'toolbar.ariaLabel': 'Formatting toolbar',
    'toolbar.bold': 'Bold (Ctrl+B)',
    'toolbar.italic': 'Italic (Ctrl+I)',
    'toolbar.underline': 'Underline (Ctrl+U)',
    'toolbar.strike': 'Strikethrough',
    'toolbar.code': 'Inline Code',
    'toolbar.highlight': 'Highlight',
    'toolbar.h1': 'Heading 1',
    'toolbar.h2': 'Heading 2',
    'toolbar.h3': 'Heading 3',
    'toolbar.bulletList': 'Bullet List',
    'toolbar.orderedList': 'Ordered List',
    'toolbar.taskList': 'Task List',
    'toolbar.blockquote': 'Blockquote',
    'toolbar.horizontalRule': 'Horizontal Rule',
    'toolbar.codeBlock': 'Code Block',
    'toolbar.table': 'Table',
    'toolbar.image': 'Image',
    'toolbar.sourceOn': 'Edit Markdown source',
    'toolbar.sourceOff': 'Back to visual mode',
    'toolbar.more': 'More formatting options',
    'toolbar.less': 'Hide additional options',

    'time.now': 'just now',
    'time.seconds': '{count}s ago',
    'time.minutes': '{count}min ago',
    'time.hours': '{count}h ago',
    'time.days': '{count}d ago',

    'status.saving': 'Saving...',
    'status.savedAgo': 'Saved {time}',
    'status.notSaved': 'Not saved yet',
    'status.readonly': 'Read-only',
    'status.readonlyForVisitors': 'Read-only for visitors',
    'status.readonlyForVisitorsLong': 'Visitors can only read this page. You keep editing.',
    'status.lockedForVisitors': 'Password for visitors',
    'status.visitorsLockedReadonly': 'Password and read-only',
    'status.visitorRestrictionLong': 'Restrictions that apply to visitors of this page. They do not affect you.',
    'status.connected': 'Connected',
    'status.disconnected': 'Disconnected',
    'status.failedToSave': 'Failed to save. Will retry...',
    'status.tooLarge': 'Document too large to save. Remove some content.',

    'presence.more': '+{count} more',
    'presence.ariaLabel': 'Other people in this document',
    'presence.online': '{count} online',

    'theme.useLight': 'Use light theme',
    'theme.useDark': 'Use dark theme',

    'slash.heading1': 'Heading 1',
    'slash.heading1Desc': 'Large heading',
    'slash.heading2': 'Heading 2',
    'slash.heading2Desc': 'Medium heading',
    'slash.heading3': 'Heading 3',
    'slash.heading3Desc': 'Small heading',
    'slash.bulletList': 'Bullet List',
    'slash.bulletListDesc': 'Simple unordered list',
    'slash.orderedList': 'Ordered List',
    'slash.orderedListDesc': 'Numbered list',
    'slash.taskList': 'Task List',
    'slash.taskListDesc': 'List with checkboxes',
    'slash.blockquote': 'Blockquote',
    'slash.blockquoteDesc': 'Block quote',
    'slash.codeBlock': 'Code Block',
    'slash.codeBlockDesc': 'Code block with syntax highlighting',
    'slash.horizontalRule': 'Divider',
    'slash.horizontalRuleDesc': 'Horizontal separator line',
    'slash.table': 'Table',
    'slash.tableDesc': 'Insert a 3×3 table',
    'slash.image': 'Image',
    'slash.imageDesc': 'Insert image from URL',
    'slash.ariaLabel': 'Editor commands',
    'slash.noResults': 'No results',

    'imageModal.title': 'Insert Image',
    'imageModal.urlLabel': 'Image URL',
    'imageModal.urlPlaceholder': 'https://example.com/image.png',
    'imageModal.altLabel': 'Alt text (optional)',
    'imageModal.altPlaceholder': 'Image description',
    'imageModal.altHelp': 'Describe informative images. Leave this empty only when the image is decorative.',
    'imageModal.preview': 'Preview',
    'imageModal.loading': 'Loading...',
    'imageModal.previewError': 'Could not load preview. The image will still be inserted.',
    'imageModal.invalidUrl': 'Enter a valid HTTP or HTTPS URL.',
    'imageModal.cancel': 'Cancel',
    'imageModal.close': 'Close image insertion dialog',
    'imageModal.insert': 'Insert image',

    'code.copy': 'Copy code',
    'code.copied': 'Code copied',
    'code.copyFailed': 'Could not copy code',

    'export.markdown': 'Export as Markdown',
    'export.html': 'Export as HTML',

    'expiration.notice': 'This page is automatically deleted after 30 days without visits.',
    'expiration.dismiss': 'Got it',

    'terms.pageTitle': 'Terms & Privacy',
    'terms.back': 'Back',
    'terms.heading': 'Terms & Privacy',
    'terms.effectiveLabel': 'In effect since',
    'terms.effectiveDate': '08/01/2026',

    'terms.truth1.word': 'public',
    'terms.truth1.body': 'Anyone with the address can read the document. There is no login, no owner, no permission.',
    'terms.truth2.word': 'editable',
    'terms.truth2.body': 'Anyone with the address can also write, change and delete whatever is there.',
    'terms.truth3.word': 'temporary',
    'terms.truth3.body': 'Thirty days without a single visit and the document is deleted. Nothing is backed up, ever.',
    'terms.truthClose':
        'Do not write anything here that cannot be read, changed or lost by anyone. The whole service may end at any moment, without prior notice.',

    'terms.indexTitle': 'On this page',

    'terms.s1.title': 'Accepting these terms',
    'terms.s1.summary': 'Using Dumphere means accepting these rules.',
    'terms.s1.p1':
        'By opening, creating or editing any Dumphere page you agree to these terms. If you disagree with any part of them, do not use the service. They apply to anyone who visits the site, whether or not they intend to edit.',
    'terms.s1.p2':
        'The service is intended for people aged 18 or over. Minors should only use it with the supervision of a guardian, who is answerable for that use. Dumphere is not directed at children and does not knowingly collect their data.',

    'terms.s2.title': 'What Dumphere is',
    'terms.s2.summary': 'A shared scratchpad that begins at its address.',
    'terms.s2.p1':
        'Dumphere is a collaborative Markdown editor that works by address. You choose a path in the URL and the page exists. There is no sign-up, account, owner, private folder or permission control.',
    'terms.s2.p2':
        'The service is offered free of charge, as is, and may be changed, limited or shut down at any time.',

    'terms.s3.title': 'Everything is public',
    'terms.s3.summary': 'There is no access control. No document is private.',
    'terms.s3.p1':
        'Anyone who knows or guesses a page address can read, edit and delete its content, including search crawlers and automated scrapers. A hard-to-guess address is not protection.',
    'terms.s3.p2':
        'Treat everything written here as published on the open internet. That holds for anything deleted later too, because it may already have been read, copied or indexed.',

    'terms.s4.title': 'Do not write sensitive data',
    'terms.s4.summary': 'Passwords, identity documents and personal data do not belong here.',
    'terms.s4.p1':
        "Do not publish passwords, API keys, tokens, banking data, identity documents, home addresses, health data, data about children and teenagers, or any personal information, yours or anyone else's, that you would not publish on an open page.",
    'terms.s4.p2':
        "Content travels over encrypted channels, but it is stored without encryption and behind no access barrier. Publishing someone else's personal data is the responsibility of whoever publishes it and may break the law.",

    'terms.s5.title': 'How long content lasts',
    'terms.s5.summary': '30 days without visits and the page is deleted. There is no backup.',
    'terms.s5.p1':
        'Every document records the date it was last accessed. After 30 days without a single visit it is deleted automatically and permanently. There is no trash and no recoverable history.',
    'terms.s5.p2':
        'No data is backed up. We keep no safety copy, neither for you nor for ourselves. Once lost or deleted, content cannot be recovered by anyone, under any circumstances.',
    'terms.s5.p3':
        'We may also delete, interrupt or migrate any content at any time for technical, cost or abuse reasons. Do not use Dumphere to keep anything you cannot afford to lose.',

    'terms.s6.title': 'Acceptable use',
    'terms.s6.summary': 'What may not be published or done here.',
    'terms.s6.i1':
        'Illegal content, including child sexual abuse material, terrorism apology and incitement to violence.',
    'terms.s6.i2': 'Content that infringes copyright, trademarks, trade secrets or third-party image rights.',
    'terms.s6.i3':
        'Third-party personal data without a legal basis, deliberate exposure (doxxing), harassment, threats or hate speech.',
    'terms.s6.i4': 'Malware, phishing, fraud pages, spam, parasite SEO or deceptive redirection.',
    'terms.s6.i5':
        'Attacks on the service, such as abusive automation, attempts to overload it, circumventing rate limits or exploiting flaws.',
    'terms.s6.i6':
        "Deleting or defacing other people's work in bad faith. Since every document is open, respect is the only access control there is.",

    'terms.s7.title': 'Your content is yours',
    'terms.s7.summary': 'You keep your rights. We only need to store and display.',
    'terms.s7.p1':
        'You remain the owner of what you write. By publishing on a Dumphere page you grant a non-exclusive, royalty-free, worldwide licence to store, reproduce and publicly display that content for the sole purpose of operating the service. It ends when the content is deleted.',
    'terms.s7.p2':
        "Because anyone can edit, there is no guarantee of authorship, integrity or permanence of what you wrote. Dumphere's software, name and visual identity are not part of that licence.",

    'terms.s8.title': 'Moderation and removal',
    'terms.s8.summary': 'We may remove any content, at any time.',
    'terms.s8.p1':
        'We do not monitor, review or pre-approve what is published, and we take on no obligation to do so. Even so, we may remove, block or make unavailable any document, with or without notice, when it breaches these terms or the law, or puts the service at risk.',
    'terms.s8.p2': 'We may also limit or block network addresses that are abusing the service.',

    'terms.s9.title': 'Reports and takedown requests',
    'terms.s9.summary': 'Write to the contact at the end of this page.',
    'terms.s9.p1':
        'If a Dumphere page contains illegal content, your personal data, copyrighted material or any breach of these terms, write to the email at the end of this page with the full page address, a description of the problem and, where relevant, your relationship to the content.',
    'terms.s9.p2':
        'We review requests within a reasonable time and may remove content on our own initiative. Court orders and requests from competent authorities are complied with as the law requires. You can also delete the content yourself, because the page is open and you only have to edit it.',

    'terms.s10.title': 'Data we handle',
    'terms.s10.summary': 'Very little, and almost none of it identifies you.',
    'terms.s10.p1':
        'There is no sign-up, so we ask for no name, no email and no identification. What exists is listed below.',
    'terms.s10.k1': 'Document content',
    'terms.s10.v1': 'Text, code and images you publish. It is public and is deleted along with the document.',
    'terms.s10.k2': 'IP address',
    'terms.s10.v2': 'Used at request time to limit abuse and simultaneous connections. It is not linked to documents.',
    'terms.s10.k3': 'Technical logs',
    'terms.s10.v3': 'Server errors and events, kept for a short period for operation and security.',
    'terms.s10.k4': 'Collaboration name',
    'terms.s10.v4':
        'The nickname shown on your cursor. It stays in your browser and is sent to whoever is on the same page while you are there.',
    'terms.s10.k5': 'Local preferences',
    'terms.s10.v5': "Language, theme and dismissed notices, kept in your device's local storage.",
    'terms.s10.k6': 'Cookies',
    'terms.s10.v6':
        'Only the ones strictly needed for the session and CSRF protection. There are no advertising, tracking or analytics cookies.',
    'terms.s10.p2':
        "We do not sell, rent or share data with third parties for commercial purposes. The service runs on hosting providers' infrastructure, and they handle this data solely on our behalf and instructions.",

    'terms.s11.title': 'Your rights over personal data',
    'terms.s11.summary': 'Access, correction, deletion and objection, through the contact email.',
    'terms.s11.p1':
        'You may request access to, correction, deletion, anonymisation or portability of the personal data under our control, and object to a given use of it. Just write to the contact at the end of this page.',
    'terms.s11.p2':
        'There are two honest limits. Since there is no sign-up, in most cases we cannot link a piece of data to you or verify your identity. And content on a public page can be deleted by you, immediately, by editing the page.',

    'terms.s12.title': 'Security',
    'terms.s12.summary': 'Encrypted in transit, open at rest.',
    'terms.s12.p1':
        'Access to the site and the real-time collaboration connection use encrypted channels. The content, however, is stored without end-to-end encryption and without authentication. The safety of what you publish depends entirely on you not publishing what you should not.',
    'terms.s12.p2':
        'No internet service is immune to failure. We do not guarantee the absence of incidents, downtime or data loss.',

    'terms.s13.title': 'Warranties and liability',
    'terms.s13.summary': 'The service is offered as is, at your own risk.',
    'terms.s13.p1':
        'Dumphere is provided as is, with no guarantee of availability, performance, integrity, fitness for a particular purpose or preservation of content. It may go offline or lose data at any time.',
    'terms.s13.p3':
        'The service may be shut down for good at any moment, without prior notice, without a transition period and with no obligation to export, return or preserve any content. If something here matters to you, keep your own copy.',
    'terms.s13.p2':
        'To the fullest extent permitted by law, we are not liable for lost content, lost profits, indirect damages or content published by users. Responsibility for each publication lies with whoever made it. Nothing here excludes liabilities the law does not allow to be excluded.',

    'terms.s14.title': 'Changes and applicable law',
    'terms.s14.summary': 'Changes take effect on publication. Brazilian law applies.',
    'terms.s14.p1':
        'These terms may be updated at any time. The version in force is always the one published on this page, with the date shown at the top. Continuing to use the service after a change means accepting it.',
    'terms.s14.p2':
        "The service is operated from Brazil and is governed by Brazilian law, with the courts of the operator's domicile chosen for anything that cannot be settled through the contact below. If any clause is held invalid, the rest remain in force.",

    'terms.contact.title': 'Contact',
    'terms.contact.body':
        'Reports, takedown requests, personal data and questions about these terms can be sent to the address below.',
    'terms.footer': 'Use at your own risk.',
    'terms.footerHome': 'Home',
    'footer.source': 'Source code',

    'table.addRowBefore': 'Add row above',
    'table.addRowAfter': 'Add row below',
    'table.deleteRow': 'Delete row',
    'table.addColBefore': 'Add column left',
    'table.addColAfter': 'Add column right',
    'table.deleteCol': 'Delete column',
    'table.delete': 'Delete table',
    'error.back': 'Back to the start',
    'error.retryAfter': 'Try again in {seconds} seconds.',
    'error.taken.title': 'This address belongs to someone',
    'error.taken.body': 'Only its owner creates pages inside',
    'error.403.title': 'You do not have access to this',
    'error.403.body': 'The page exists, but whoever manages the address closed this way in.',
    'error.404.title': 'This page does not exist',
    'error.404.body': 'Nothing was ever written here, or it expired after 30 days without visits.',
    'error.409.title': 'This address has reached its page limit',
    'error.409.body': 'Delete an existing page before creating another one.',
    'error.419.title': 'Your session expired',
    'error.419.body': 'You were idle for too long. Reload the page and try again.',
    'error.429.title': 'Slow down',
    'error.429.body': 'Too many attempts arrived from this computer in a short time.',
    'error.500.title': 'Something broke on our side',
    'error.500.body': 'The error was logged. Try again in a few minutes.',
    'error.503.title': 'Down for a moment',
    'error.503.body': 'The service is under maintenance. Come back shortly.',
    'error.default.title': 'This page could not be opened',
    'error.default.body': 'Something interrupted the request along the way.',
    'locked.heading': 'This page has a password',
    'locked.body': 'Ask whoever manages {slug} for the password.',
    'locked.label': 'Password',
    'locked.submit': 'Enter',
    'ownership.settings': 'Settings for /{prefix}',
    'ownership.title': 'Address /{prefix}',
    'ownership.close': 'Close',
    'ownership.ownerPassword': 'Owner password',
    'ownership.readonly': 'Read-only',
    'ownership.readonlyNote': 'Applies to visitors. You keep editing normally.',
    'ownership.ownTheme': 'Use your own theme',
    'ownership.themeSaturation': 'Saturation',
    'ownership.saturationNone': 'No colour, neutral tones',
    'ownership.themeHue': 'Address colour',
    'ownership.preview': 'Editing the theme',
    'ownership.previewLight': 'Light',
    'ownership.previewDark': 'Dark',
    'ownership.themeHueHint': 'Applies to everyone who opens this address, on any computer.',
    'ownership.requirePassword': 'Require a password to visit',
    'ownership.visitorPassword': 'Visitor password',
    'ownership.visitorPasswordKeep': 'Leave blank to keep the current password.',
    'ownership.visitorPasswordMissing': 'Choose a visitor password or uncheck the requirement.',
    'ownership.forgot': 'I forgot the owner password',
    'ownership.open': 'Open',
    'ownership.save': 'Save',
    'ownership.wrongPassword': 'Wrong owner password.',
    'ownership.failed': 'Could not save right now.',
    'ownership.sessionExpired': 'Your session expired. Reload the page and try again.',
    'ownership.tooMany': 'Too many attempts. Wait a minute and try again.',
    'recover.heading': 'I forgot the owner password',
    'recover.body': 'Use the recovery key shown when you bought this address.',
    'recover.prefix': 'Which address you bought',
    'recover.recoveryKey': 'Recovery key',
    'recover.prefixHint': 'Just the start of the address, no slashes. For example: my-page.',
    'recover.recoveryKeyHint': 'Paste the key exactly as you saved it.',
    'recover.newPassword': 'New owner password',
    'recover.confirmPassword': 'Repeat the new password',
    'recover.submit': 'Set new password',
} as const satisfies Record<keyof typeof ptBR, string>;

export default en;
