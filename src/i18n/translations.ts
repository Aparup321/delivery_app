export type Language = 'en' | 'hi' | 'bn'

export type TranslationVars = Record<string, string | number>

export const languageOptions: Array<{ value: Language; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'bn', label: 'বাংলা (Bengali)' },
]

export const languageLocale: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
}

/**
 * English copy is the lookup key, so any missing translation falls back to the
 * English string instead of showing a raw key. Values may contain {placeholders}
 * which are filled by translate().
 */
const hindi: Record<string, string> = {
  Home: 'होम',
  Orders: 'ऑर्डर',
  History: 'इतिहास',
  Earnings: 'कमाई',
  Profile: 'प्रोफ़ाइल',
  Continue: 'जारी रखें',
  Back: 'वापस',
  Edit: 'बदलें',
  Upload: 'अपलोड',
  Accept: 'स्वीकार करें',
  Reject: 'अस्वीकार करें',
  Contact: 'संपर्क करें',
  'Report issue': 'समस्या बताएं',
  'Go online': 'ऑनलाइन जाएं',
  'Back to home': 'होम पर वापस जाएं',
  'View all': 'सभी देखें',
  'View requests': 'अनुरोध देखें',
  Pending: 'लंबित',
  Submitted: 'जमा किया गया',
  'Under review': 'समीक्षा में',
  Approved: 'स्वीकृत',
  Rejected: 'अस्वीकृत',
  Cancelled: 'रद्द',
  Completed: 'पूर्ण',
  Delivered: 'डिलीवर हुआ',
  Open: 'खुला',
  Paid: 'भुगतान हुआ',
  Processing: 'प्रक्रिया में',
  Expired: 'समाप्त',
  'Not available': 'उपलब्ध नहीं',
  'Not added': 'जोड़ा नहीं गया',
  Uploaded: 'अपलोड किया गया',
  Missing: 'अनुपलब्ध',
  Demo: 'डेमो',
  'Next step': 'अगला चरण',
  'Delivery partner app': 'डिलीवरी पार्टनर ऐप',
  'Grocery and restaurant deliveries across Kolkata.':
    'कोलकाता में किराना और रेस्टोरेंट डिलीवरी।',
  'Sign in': 'साइन इन',
  'Use the mobile number linked to your partner account.':
    'अपने पार्टनर खाते से जुड़ा मोबाइल नंबर इस्तेमाल करें।',
  'Mobile number': 'मोबाइल नंबर',
  'We will send a 6-digit verification code.':
    'हम 6 अंकों का सत्यापन कोड भेजेंगे।',
  'Send OTP': 'OTP भेजें',
  'Prototype build: verification codes are simulated, no SMS is sent, and no account is created.':
    'प्रोटोटाइप बिल्ड: सत्यापन कोड नकली हैं, कोई SMS नहीं भेजा जाता और कोई खाता नहीं बनता।',
  'Enter a valid 10-digit mobile number.':
    'मान्य 10 अंकों का मोबाइल नंबर डालें।',
  'Indian mobile numbers start with 6, 7, 8 or 9.':
    'भारतीय मोबाइल नंबर 6, 7, 8 या 9 से शुरू होते हैं।',
  'Verify your number': 'अपना नंबर सत्यापित करें',
  'We sent a {length}-digit code to {phone}.':
    'हमने {phone} पर {length} अंकों का कोड भेजा है।',
  'Verification code': 'सत्यापन कोड',
  'Verify and continue': 'सत्यापित करें और जारी रखें',
  'Change number': 'नंबर बदलें',
  'Resend in {seconds}s': '{seconds} सेकंड में फिर भेजें',
  'Resend code': 'कोड फिर भेजें',
  'No SMS is sent in this prototype. Use the code {code}.':
    'इस प्रोटोटाइप में SMS नहीं भेजा जाता। कोड {code} इस्तेमाल करें।',
  'Enter the {length}-digit code to continue.':
    'जारी रखने के लिए {length} अंकों का कोड डालें।',
  'This code has expired. Resend a new code to continue.':
    'यह कोड समाप्त हो गया है। जारी रखने के लिए नया कोड भेजें।',
  'That code is not correct. Check the digits and try again.':
    'यह कोड सही नहीं है। अंक जांचें और फिर कोशिश करें।',
  Partner: 'पार्टनर',
  'Active delivery': 'सक्रिय डिलीवरी',
  Grocery: 'किराना',
  Restaurant: 'रेस्टोरेंट',
  Prepaid: 'प्रीपेड',
  Cash: 'नकद',
  'Delivery partner': 'डिलीवरी पार्टनर',
  'Open profile': 'प्रोफ़ाइल खोलें',
  Notifications: 'सूचनाएं',
  'Notifications, {count} unread': '{count} अपठित सूचनाएं',
  'You are Online': 'आप ऑनलाइन हैं',
  'You are Offline': 'आप ऑफ़लाइन हैं',
  'Receiving delivery requests': 'डिलीवरी अनुरोध मिल रहे हैं',
  'Go online to receive requests': 'अनुरोध पाने के लिए ऑनलाइन जाएं',
  Availability: 'उपलब्धता',
  'Continue setup': 'सेटअप जारी रखें',
  'Track status': 'स्थिति देखें',
  'Continue delivery': 'डिलीवरी जारी रखें',
  Deliveries: 'डिलीवरी',
  Rating: 'रेटिंग',
  'Quick actions': 'त्वरित कार्य',
  'Find requests': 'अनुरोध खोजें',
  'My orders': 'मेरे ऑर्डर',
  Support: 'सहायता',
  'New requests': 'नए अनुरोध',
  '{count} waiting': '{count} प्रतीक्षारत',
  Offline: 'ऑफ़लाइन',
  'No requests right now. Stay online to get the next job.':
    'अभी कोई अनुरोध नहीं। अगला काम पाने के लिए ऑनलाइन रहें।',
  'Turn on availability to start receiving nearby grocery and restaurant requests.':
    'पास के किराना और रेस्टोरेंट अनुरोध पाने के लिए उपलब्धता चालू करें।',
  'Application pending': 'आवेदन लंबित',
  'Finish your partner setup and submit it for verification.':
    'पार्टनर सेटअप पूरा करें और सत्यापन के लिए जमा करें।',
  'Application submitted': 'आवेदन जमा हुआ',
  'We received your details and documents. Verification starts next.':
    'हमें आपका विवरण और दस्तावेज मिल गए। अब सत्यापन शुरू होगा।',
  'Application under review': 'आवेदन समीक्षा में',
  'The verification team is checking your documents. This usually takes one working day.':
    'सत्यापन टीम आपके दस्तावेज जांच रही है। इसमें आमतौर पर एक कार्यदिवस लगता है।',
  'Application approved': 'आवेदन स्वीकृत',
  'Your partner account is approved. You can go online and receive delivery requests.':
    'आपका पार्टनर खाता स्वीकृत है। आप ऑनलाइन जाकर डिलीवरी अनुरोध पा सकते हैं।',
  'Application rejected': 'आवेदन अस्वीकृत',
  'Your application was not approved. Review the reason and contact support to continue.':
    'आपका आवेदन स्वीकृत नहीं हुआ। कारण देखें और आगे बढ़ने के लिए सहायता से संपर्क करें।',
  'Requests, active jobs and completed work':
    'अनुरोध, सक्रिय काम और पूर्ण कार्य',
  'Delivery views': 'डिलीवरी दृश्य',
  Available: 'उपलब्ध',
  Active: 'सक्रिय',
  'You are offline': 'आप ऑफ़लाइन हैं',
  'Go online to receive nearby grocery and restaurant requests.':
    'पास के किराना और रेस्टोरेंट अनुरोध पाने के लिए ऑनलाइन जाएं।',
  'No new requests': 'कोई नया अनुरोध नहीं',
  'When you are online, nearby grocery and restaurant requests will appear here.':
    'ऑनलाइन होने पर पास के किराना और रेस्टोरेंट अनुरोध यहां दिखेंगे।',
  'No active delivery': 'कोई सक्रिय डिलीवरी नहीं',
  'Accept a request from the Available tab to start a delivery.':
    'डिलीवरी शुरू करने के लिए उपलब्ध टैब से अनुरोध स्वीकार करें।',
  'Open active delivery': 'सक्रिय डिलीवरी खोलें',
  'No delivery in progress': 'कोई डिलीवरी जारी नहीं',
  'Accept a delivery request to see the route, timeline and delivery actions here.':
    'रूट, टाइमलाइन और डिलीवरी क्रियाएं देखने के लिए अनुरोध स्वीकार करें।',
  Pickup: 'पिकअप',
  'Deliver to': 'यहां डिलीवर करें',
  'Delivery progress': 'डिलीवरी प्रगति',
  'Customer note': 'ग्राहक का नोट',
  'Verify delivery OTP': 'डिलीवरी OTP सत्यापित करें',
  'Ask the customer for the 4-digit code to close this delivery.':
    'डिलीवरी पूरी करने के लिए ग्राहक से 4 अंकों का कोड लें।',
  'Delivery OTP': 'डिलीवरी OTP',
  '4-digit code': '4 अंकों का कोड',
  'Demo build: use 4821 to complete the delivery.':
    'डेमो बिल्ड: डिलीवरी पूरी करने के लिए 4821 इस्तेमाल करें।',
  'Complete delivery': 'डिलीवरी पूरी करें',
  'Delivery completed': 'डिलीवरी पूरी हुई',
  'What went wrong?': 'क्या गलत हुआ?',
  'This cancels the delivery and informs support.':
    'इससे डिलीवरी रद्द होगी और सहायता टीम को सूचना जाएगी।',
  'Customer is unreachable': 'ग्राहक से संपर्क नहीं हो रहा',
  'Address could not be found': 'पता नहीं मिला',
  'Order was damaged': 'ऑर्डर खराब हो गया',
  'Vehicle breakdown': 'वाहन खराब हो गया',
  'I have reached the pickup': 'मैं पिकअप पहुंच गया',
  'Confirm pickup': 'पिकअप की पुष्टि करें',
  'Start the delivery': 'डिलीवरी शुरू करें',
  'I have reached the drop': 'मैं ड्रॉप पहुंच गया',
  'Enter the 4-digit delivery code from the customer.':
    'ग्राहक से 4 अंकों का डिलीवरी कोड डालें।',
  'That code does not match. Check with the customer and try again.':
    'कोड मेल नहीं खाता। ग्राहक से जांचें और फिर कोशिश करें।',
  'New request': 'नया अनुरोध',
  'Order accepted': 'ऑर्डर स्वीकार हुआ',
  'At pickup': 'पिकअप पर',
  'Picked up': 'पिकअप हो गया',
  'On the way': 'रास्ते में',
  'At drop': 'ड्रॉप पर',
  'Every delivery you have completed or cancelled':
    'आपकी पूरी या रद्द हर डिलीवरी',
  'Search by delivery ID or customer': 'डिलीवरी ID या ग्राहक से खोजें',
  'Search deliveries': 'डिलीवरी खोजें',
  'Filter deliveries': 'डिलीवरी फ़िल्टर करें',
  All: 'सभी',
  '{count} delivered': '{count} डिलीवर हुईं',
  '{amount} earned': '{amount} कमाए',
  'No deliveries found': 'कोई डिलीवरी नहीं मिली',
  'Try a different search term or status filter.':
    'दूसरा खोज शब्द या स्थिति फ़िल्टर आजमाएं।',
  'Not completed': 'पूरी नहीं हुई',
  'Payouts, incentives and delivery earnings':
    'भुगतान, इंसेंटिव और डिलीवरी कमाई',
  'Earnings period': 'कमाई अवधि',
  Today: 'आज',
  Week: 'सप्ताह',
  Month: 'महीना',
  "Today's earnings": 'आज की कमाई',
  'This week': 'इस सप्ताह',
  'This month': 'इस महीने',
  'Includes {amount} of incentives': '{amount} इंसेंटिव शामिल',
  'This period': 'इस अवधि',
  'Avg. per delivery': 'प्रति डिलीवरी औसत',
  'After incentives': 'इंसेंटिव के बाद',
  'Earnings trend': 'कमाई का रुझान',
  'Today, by time of day': 'आज, समय के अनुसार',
  'Recent deliveries': 'हाल की डिलीवरी',
  Payouts: 'भुगतान',
  'Demo data for this phase. Earnings will come from live delivery and payment records after the backend integration.':
    'यह चरण डेमो डेटा है। बैकएंड जुड़ने के बाद कमाई लाइव डिलीवरी और भुगतान रिकॉर्ड से आएगी।',
  '{count} unread': '{count} अपठित',
  'You are all caught up': 'सब पढ़ लिया',
  'Mark all as read': 'सभी पढ़ी हुई करें',
  'No notifications': 'कोई सूचना नहीं',
  'Delivery requests, payment updates and account messages will appear here.':
    'डिलीवरी अनुरोध, भुगतान अपडेट और खाता संदेश यहां दिखेंगे।',
  'New grocery request nearby': 'पास में नया किराना अनुरोध',
  'FreshMart Grocery to New Town, about 5.1 km. Accept before the timer ends.':
    'फ्रेशमार्ट ग्रोसरी से न्यू टाउन, लगभग 5.1 किमी। समय खत्म होने से पहले स्वीकार करें।',
  'Weekly payout is being processed': 'साप्ताहिक भुगतान प्रक्रिया में है',
  '₹7,480 for the week of 27 Oct is expected in your bank account on 05 Nov.':
    '27 अक्टूबर के सप्ताह का ₹7,480 05 नवंबर को आपके बैंक खाते में आना चाहिए।',
  'Complete your onboarding': 'अपनी ऑनबोर्डिंग पूरी करें',
  'Add your address, KYC documents and bank details to get approved for deliveries.':
    'डिलीवरी के लिए स्वीकृति पाने हेतु पता, KYC दस्तावेज और बैंक विवरण जोड़ें।',
  'Delivery #DEL7842 completed': 'डिलीवरी #DEL7842 पूरी हुई',
  '₹72 was added to today’s earnings. Thanks for delivering on time.':
    'आज की कमाई में ₹72 जोड़े गए। समय पर डिलीवरी के लिए धन्यवाद।',
  'Restaurant request missed': 'रेस्टोरेंट अनुरोध छूट गया',
  'You did not respond to a request from Spice Villa in time.':
    'आपने स्पाइस विला के अनुरोध का समय पर जवाब नहीं दिया।',
  'Help & support': 'सहायता और समर्थन',
  'FAQs and support tickets': 'सामान्य प्रश्न और सहायता टिकट',
  'Frequently asked': 'अक्सर पूछे जाने वाले',
  'When do I receive my weekly payout?': 'मेरा साप्ताहिक भुगतान कब आता है?',
  'Payouts are processed every Monday for the previous Monday to Sunday period. It can take up to two working days for the amount to reach your bank account.':
    'पिछले सोमवार से रविवार की अवधि का भुगतान हर सोमवार को प्रोसेस होता है। राशि बैंक खाते में आने में दो कार्यदिवस तक लग सकते हैं।',
  'Why can I not go online?': 'मैं ऑनलाइन क्यों नहीं जा सकता?',
  'Going online needs an approved account. Finish your onboarding, KYC and bank details, and wait for the verification team to approve your profile.':
    'ऑनलाइन जाने के लिए खाता स्वीकृत होना चाहिए। ऑनबोर्डिंग, KYC और बैंक विवरण पूरा करें और सत्यापन टीम की स्वीकृति का इंतजार करें।',
  'What should I do if a customer is unreachable?':
    'ग्राहक से संपर्क न हो तो क्या करें?',
  'Call the customer twice and wait at the address for five minutes. Then use Report an issue on the active delivery screen so the support team can help.':
    'ग्राहक को दो बार कॉल करें और पते पर पांच मिनट रुकें। फिर सक्रिय डिलीवरी स्क्रीन पर समस्या बताएं ताकि सहायता टीम मदद कर सके।',
  'How is my delivery earnings calculated?': 'डिलीवरी कमाई कैसे तय होती है?',
  'Earnings combine a base fee, distance pay and any active incentive. The amount offered is shown before you accept a request.':
    'कमाई में आधार शुल्क, दूरी भुगतान और सक्रिय इंसेंटिव शामिल होते हैं। अनुरोध स्वीकारने से पहले राशि दिखाई जाती है।',
  'Can I update my documents later?': 'क्या मैं दस्तावेज बाद में बदल सकता हूं?',
  'Yes. Uploaded documents can be replaced from your profile when they are near expiry or if the review team asks for a clearer copy.':
    'हां। समाप्ति के करीब होने या समीक्षा टीम के कहने पर प्रोफ़ाइल से दस्तावेज बदले जा सकते हैं।',
  'Raise a ticket': 'टिकट बनाएं',
  'Our team replies within one working day.':
    'हमारी टीम एक कार्यदिवस में जवाब देती है।',
  Subject: 'विषय',
  'Short summary of the issue': 'समस्या का संक्षिप्त सारांश',
  'Describe the issue': 'समस्या बताएं',
  'What happened, and when?': 'क्या हुआ और कब?',
  'Add a short subject for your issue.': 'समस्या के लिए छोटा विषय जोड़ें।',
  'Describe the issue in a little more detail.':
    'समस्या थोड़ा विस्तार से बताएं।',
  'Ticket created. You can track its status below.':
    'टिकट बन गया। नीचे इसकी स्थिति देखें।',
  'Submit ticket': 'टिकट जमा करें',
  'Your tickets': 'आपके टिकट',
  'You have not raised any tickets yet.': 'आपने अभी कोई टिकट नहीं बनाया।',
  'Emergency support: 1800 123 4567 (24×7)':
    'आपातकालीन सहायता: 1800 123 4567 (24×7)',
  'Partner account and settings': 'पार्टनर खाता और सेटिंग्स',
  'Partner ID · {id}': 'पार्टनर ID · {id}',
  '{rating} rating': '{rating} रेटिंग',
  'address not added': 'पता नहीं जोड़ा गया',
  Vehicle: 'वाहन',
  'Walking delivery': 'पैदल डिलीवरी',
  'Model not added': 'मॉडल नहीं जोड़ा गया',
  'No vehicle or registration needed': 'वाहन या पंजीकरण की जरूरत नहीं',
  'No registration needed': 'पंजीकरण की जरूरत नहीं',
  'Registration number not added': 'पंजीकरण संख्या नहीं जोड़ी गई',
  Documents: 'दस्तावेज',
  'Aadhaar card': 'आधार कार्ड',
  'PAN card': 'PAN कार्ड',
  'Driving licence': 'ड्राइविंग लाइसेंस',
  'Vehicle RC': 'वाहन RC',
  Application: 'आवेदन',
  'Application status': 'आवेदन स्थिति',
  'Track verification progress': 'सत्यापन प्रगति देखें',
  Preferences: 'प्राथमिकताएं',
  'App language': 'ऐप की भाषा',
  'Request alerts': 'अनुरोध अलर्ट',
  'Notify me about new delivery requests':
    'नए डिलीवरी अनुरोध की सूचना दें',
  'Continue partner setup': 'पार्टनर सेटअप जारी रखें',
  'View partner details': 'पार्टनर विवरण देखें',
  'Sign out': 'साइन आउट',
  'Fafo Delivery Partner App · Prototype build':
    'फाफो डिलीवरी पार्टनर ऐप · प्रोटोटाइप बिल्ड',
  'On foot': 'पैदल',
  Bike: 'बाइक',
  Scooter: 'स्कूटर',
  Bicycle: 'साइकिल',
  'Partner verification': 'पार्टनर सत्यापन',
  'Current status': 'वर्तमान स्थिति',
  'Last update': 'अंतिम अपडेट',
  'Not yet': 'अभी नहीं',
  Progress: 'प्रगति',
  'Application started': 'आवेदन शुरू हुआ',
  'Details and documents received': 'विवरण और दस्तावेज मिले',
  'Verification team checks your documents':
    'सत्यापन टीम आपके दस्तावेज जांचती है',
  Decision: 'निर्णय',
  'Account ready for deliveries': 'डिलीवरी के लिए खाता तैयार',
  'Application not approved': 'आवेदन स्वीकृत नहीं हुआ',
  'Approval or rejection': 'स्वीकृति या अस्वीकृति',
  'Contact support to understand what needs to change before you apply again.':
    'फिर आवेदन करने से पहले क्या बदलना है, यह जानने के लिए सहायता से संपर्क करें।',
  'Contact support': 'सहायता से संपर्क करें',
  'Preview another status (demo)': 'दूसरी स्थिति देखें (डेमो)',
  'No verification service is connected in this prototype. Use these to preview each stage.':
    'इस प्रोटोटाइप में सत्यापन सेवा नहीं जुड़ी है। इनसे हर चरण देखें।',
  'Status is demo data until the verification service is connected.':
    'सत्यापन सेवा जुड़ने तक स्थिति डेमो डेटा है।',
  'Partner Onboarding': 'पार्टनर ऑनबोर्डिंग',
  Personal: 'व्यक्तिगत',
  KYC: 'KYC',
  Training: 'प्रशिक्षण',
  Review: 'समीक्षा',
  'Personal Details': 'व्यक्तिगत विवरण',
  'Tell us about yourself': 'अपने बारे में बताएं',
  'Profile photo': 'प्रोफ़ाइल फोटो',
  'Tap the photo to change it · max 2 MB':
    'बदलने के लिए फोटो दबाएं · अधिकतम 2 MB',
  'Clear front-facing photo, JPG or PNG · max 2 MB':
    'स्पष्ट सामने की फोटो, JPG या PNG · अधिकतम 2 MB',
  'Full name': 'पूरा नाम',
  'Name as on documents': 'दस्तावेजों के अनुसार नाम',
  'Your verified number cannot be changed here.':
    'सत्यापित नंबर यहां नहीं बदला जा सकता।',
  Email: 'ईमेल',
  'Date of birth': 'जन्म तिथि',
  City: 'शहर',
  Address: 'पता',
  'House, street, area': 'मकान, गली, क्षेत्र',
  'PIN code': 'PIN कोड',
  'KYC Verification': 'KYC सत्यापन',
  'Each file must be JPG or PDF and within 2 MB':
    'हर फाइल JPG या PDF और 2 MB के भीतर हो',
  'Front and back, JPG or PDF · max 2 MB':
    'आगे और पीछे, JPG या PDF · अधिकतम 2 MB',
  'Clear photo of the card · max 2 MB':
    'कार्ड की स्पष्ट फोटो · अधिकतम 2 MB',
  'Needed for motorised vehicles · max 2 MB':
    'मोटर वाहनों के लिए जरूरी · अधिकतम 2 MB',
  'Registration certificate · max 2 MB': 'पंजीकरण प्रमाणपत्र · अधिकतम 2 MB',
  'Verification status': 'सत्यापन स्थिति',
  'Documents are checked after you submit, usually within one working day.':
    'जमा करने के बाद दस्तावेज जांचे जाते हैं, आमतौर पर एक कार्यदिवस में।',
  'Bank account details': 'बैंक खाता विवरण',
  'Account holder name': 'खाताधारक का नाम',
  'Account number': 'खाता संख्या',
  'IFSC code': 'IFSC कोड',
  'Find this on your cheque book or bank app.':
    'चेक बुक या बैंक ऐप पर देखें।',
  'Vehicle Details': 'वाहन विवरण',
  'Provide your vehicle and licence information':
    'अपने वाहन और लाइसेंस की जानकारी दें',
  'Vehicle type': 'वाहन प्रकार',
  'Registration number': 'पंजीकरण संख्या',
  'Enter the number printed on the number plate.':
    'नंबर प्लेट पर छपी संख्या डालें।',
  'Walking deliveries do not need a vehicle registration.':
    'पैदल डिलीवरी के लिए वाहन पंजीकरण नहीं चाहिए।',
  'Bicycles do not need a registration number.':
    'साइकिल के लिए पंजीकरण संख्या नहीं चाहिए।',
  'Vehicle model': 'वाहन मॉडल',
  'Vehicle colour': 'वाहन का रंग',
  'Training & Onboarding': 'प्रशिक्षण और ऑनबोर्डिंग',
  'Complete every module before your account is approved':
    'खाता स्वीकृत होने से पहले हर मॉड्यूल पूरा करें',
  'Review & Submit': 'समीक्षा और जमा करें',
  'Check your details before sending them for verification':
    'सत्यापन के लिए भेजने से पहले विवरण जांचें',
  'KYC & bank': 'KYC और बैंक',
  'Profile photo added': 'प्रोफ़ाइल फोटो जोड़ी गई',
  'Profile photo missing': 'प्रोफ़ाइल फोटो नहीं है',
  uploaded: 'अपलोड किया गया',
  missing: 'नहीं है',
  'Walking delivery partner': 'पैदल डिलीवरी पार्टनर',
  'On foot · no vehicle or registration needed':
    'पैदल · वाहन या पंजीकरण की जरूरत नहीं',
  '{completed} of {total} modules complete':
    '{total} में से {completed} मॉड्यूल पूरे',
  'By submitting, you confirm these details are correct. The review team may contact you for clearer documents.':
    'जमा करके आप पुष्टि करते हैं कि विवरण सही हैं। समीक्षा टीम स्पष्ट दस्तावेजों के लिए संपर्क कर सकती है।',
  'Submit application': 'आवेदन जमा करें',
  'Go back': 'वापस जाएं',
  'Partner setup': 'पार्टनर सेटअप',
  'Track application status': 'आवेदन स्थिति देखें',
  'Submitted on {date}.': '{date} को जमा किया गया।',
  'Upload a profile photo to continue.': 'जारी रखने के लिए प्रोफ़ाइल फोटो अपलोड करें।',
  'Enter your full name as it appears on your documents.':
    'अपना पूरा नाम दस्तावेजों के अनुसार डालें।',
  'Enter a valid email address.': 'मान्य ईमेल पता डालें।',
  'Enter your date of birth.': 'अपनी जन्म तिथि डालें।',
  'Enter a valid date of birth.': 'मान्य जन्म तिथि डालें।',
  'Date of birth cannot be in the future.': 'जन्म तिथि भविष्य की नहीं हो सकती।',
  'You must be at least 18 years old to deliver with Fafo.':
    'फाफो के साथ डिलीवरी के लिए आपकी उम्र कम से कम 18 वर्ष होनी चाहिए।',
  'Enter your city.': 'अपना शहर डालें।',
  'Enter your current address.': 'अपना वर्तमान पता डालें।',
  'Enter a 6-digit PIN code.': '6 अंकों का PIN कोड डालें।',
  'Upload your Aadhaar card to continue.': 'जारी रखने के लिए आधार कार्ड अपलोड करें।',
  'Upload your PAN card to continue.': 'जारी रखने के लिए PAN कार्ड अपलोड करें।',
  "Enter the account holder's name.": 'खाताधारक का नाम डालें।',
  'Enter a valid bank account number.': 'मान्य बैंक खाता संख्या डालें।',
  'Enter a valid IFSC code, for example HDFC0001234.':
    'मान्य IFSC कोड डालें, जैसे HDFC0001234।',
  'Enter your vehicle model.': 'अपने वाहन का मॉडल डालें।',
  'Enter a valid registration number, for example WB02AB1234.':
    'मान्य पंजीकरण संख्या डालें, जैसे WB02AB1234।',
  'Complete every training topic to continue.':
    'जारी रखने के लिए हर प्रशिक्षण विषय पूरा करें।',
  'Choose a JPG or PNG image.': 'JPG या PNG छवि चुनें।',
  'Choose an image smaller than 2 MB.': '2 MB से छोटी छवि चुनें।',
  'Could not read that image. Try another file.':
    'वह छवि पढ़ी नहीं जा सकी। दूसरी फाइल आजमाएं।',
  'File is larger than 2 MB. Choose a smaller file.':
    'फाइल 2 MB से बड़ी है। छोटी फाइल चुनें।',
  'Welcome to PicDrop + HopNgo': 'पिकड्रॉप + हॉपएनगो में स्वागत',
  'How to Accept Delivery Orders': 'डिलीवरी ऑर्डर कैसे स्वीकार करें',
  'Pickup & Delivery Process': 'पिकअप और डिलीवरी प्रक्रिया',
  'Customer Interaction Guidelines': 'ग्राहक बातचीत दिशानिर्देश',
  'Delivery Safety & Best Practices': 'डिलीवरी सुरक्षा और सर्वोत्तम प्रथाएं',
  '{count} items': '{count} वस्तुएं',
  '{count} min': '{count} मिनट',
  '{count} km': '{count} किमी',
  'Demo route': 'डेमो रूट',
  'Page not found': 'पेज नहीं मिला',
  'The link may be broken or the page may have moved':
    'लिंक टूटा हो सकता है या पेज हट गया हो',
  'Nothing here': 'यहां कुछ नहीं',
  'The page you are looking for does not exist or may have moved.':
    'आप जो पेज खोज रहे हैं वह मौजूद नहीं है या हट गया है।',
  'Cash on delivery': 'कैश ऑन डिलीवरी',
  Unread: 'अपठित',
  Resolved: 'हल हो गया',
  '2 min': '2 मिनट',
  '3 min': '3 मिनट',
  '4 min': '4 मिनट',
  '{count}s': '{count} सेकंड',
  'Profile photo preview': 'प्रोफ़ाइल फोटो पूर्वावलोकन',
  'Upload profile photo': 'प्रोफ़ाइल फोटो अपलोड करें',
  'Upload {document}': '{document} अपलोड करें',
  'Demo route preview from {pickup} to {destination}':
    '{pickup} से {destination} तक डेमो रूट पूर्वावलोकन',
  'Name as on the bank account': 'बैंक खाते के अनुसार नाम',
  'Week of {date}': '{date} का सप्ताह',
  'Expected {date}': '{date} अपेक्षित',
  '9 AM': 'सुबह 9',
  '11 AM': 'सुबह 11',
  '1 PM': 'दोपहर 1',
  '3 PM': 'दोपहर 3',
  '5 PM': 'शाम 5',
  '7 PM': 'शाम 7',
  Primary: 'मुख्य',
  'Fafo Delivery Partner': 'फाफो डिलीवरी पार्टनर',
  'Planned in this module': 'इस मॉड्यूल में प्रस्तावित',
  '{label} digit {number}': '{label} अंक {number}',
  'Customer unreachable at the delivery address.':
    'डिलीवरी पते पर ग्राहक से संपर्क नहीं हो सका।',
  'Aadhaar number': 'आधार नंबर',
  '12-digit number on your Aadhaar card':
    'आधार कार्ड पर लिखा 12 अंकों का नंबर',
  'Enter a valid 12-digit Aadhaar number.':
    'मान्य 12 अंकों का आधार नंबर दर्ज करें।',
  'JPG / PDF': 'JPG / PDF',
  Change: 'बदलें',
  'PAN number': 'PAN नंबर',
  '10-character PAN, e.g. ABCDE1234F':
    '10 अक्षरों का PAN, जैसे ABCDE1234F',
  'Enter a valid 10-character PAN number.':
    'मान्य 10 अक्षरों का PAN नंबर दर्ज करें।',
  'Licence number': 'लाइसेंस नंबर',
  'Licence number as printed on the card': 'लाइसेंस कार्ड पर लिखा नंबर',
  'Enter a valid driving licence number.':
    'मान्य ड्राइविंग लाइसेंस नंबर दर्ज करें।',
  'Upload your driving licence to continue.':
    'जारी रखने के लिए ड्राइविंग लाइसेंस अपलोड करें।',
  'Registration number printed on the RC': 'RC पर लिखा रजिस्ट्रेशन नंबर',
  'Upload your vehicle RC to continue.':
    'जारी रखने के लिए वाहन RC अपलोड करें।',
  'Bank passbook': 'बैंक पासबुक',
  'Passbook or cancelled cheque · JPG or PDF · max 2 MB':
    'पासबुक या कैंसिल चेक · JPG या PDF · अधिकतम 2 MB',
}

const bengali: Record<string, string> = {
  Home: 'হোম',
  Orders: 'অর্ডার',
  History: 'ইতিহাস',
  Earnings: 'আয়',
  Profile: 'প্রোফাইল',
  Continue: 'চালিয়ে যান',
  Back: 'ফিরে যান',
  Edit: 'সম্পাদনা',
  Upload: 'আপলোড',
  Accept: 'গ্রহণ করুন',
  Reject: 'প্রত্যাখ্যান করুন',
  Contact: 'যোগাযোগ করুন',
  'Report issue': 'সমস্যা জানান',
  'Go online': 'অনলাইন হোন',
  'Back to home': 'হোমে ফিরুন',
  'View all': 'সব দেখুন',
  'View requests': 'অনুরোধ দেখুন',
  Pending: 'অপেক্ষমাণ',
  Submitted: 'জমা দেওয়া হয়েছে',
  'Under review': 'পর্যালোচনায়',
  Approved: 'অনুমোদিত',
  Rejected: 'প্রত্যাখ্যাত',
  Cancelled: 'বাতিল',
  Completed: 'সম্পন্ন',
  Delivered: 'ডেলিভারি হয়েছে',
  Open: 'খোলা',
  Paid: 'পরিশোধিত',
  Processing: 'প্রক্রিয়াধীন',
  Expired: 'মেয়াদ শেষ',
  'Not available': 'উপলব্ধ নয়',
  'Not added': 'যোগ করা হয়নি',
  Uploaded: 'আপলোড করা হয়েছে',
  Missing: 'অনুপস্থিত',
  Demo: 'ডেমো',
  'Next step': 'পরবর্তী ধাপ',
  'Delivery partner app': 'ডেলিভারি পার্টনার অ্যাপ',
  'Grocery and restaurant deliveries across Kolkata.':
    'কলকাতায় মুদি ও রেস্টুরেন্ট ডেলিভারি।',
  'Sign in': 'সাইন ইন',
  'Use the mobile number linked to your partner account.':
    'আপনার পার্টনার অ্যাকাউন্টের সঙ্গে যুক্ত মোবাইল নম্বর ব্যবহার করুন।',
  'Mobile number': 'মোবাইল নম্বর',
  'We will send a 6-digit verification code.':
    'আমরা ৬ সংখ্যার যাচাই কোড পাঠাব।',
  'Send OTP': 'OTP পাঠান',
  'Prototype build: verification codes are simulated, no SMS is sent, and no account is created.':
    'প্রোটোটাইপ বিল্ড: যাচাই কোড সিমুলেট করা, কোনো SMS পাঠানো হয় না এবং কোনো অ্যাকাউন্ট তৈরি হয় না।',
  'Enter a valid 10-digit mobile number.':
    'বৈধ ১০ সংখ্যার মোবাইল নম্বর দিন।',
  'Indian mobile numbers start with 6, 7, 8 or 9.':
    'ভারতীয় মোবাইল নম্বর ৬, ৭, ৮ বা ৯ দিয়ে শুরু হয়।',
  'Verify your number': 'আপনার নম্বর যাচাই করুন',
  'We sent a {length}-digit code to {phone}.':
    'আমরা {phone}-এ {length} সংখ্যার কোড পাঠিয়েছি।',
  'Verification code': 'যাচাই কোড',
  'Verify and continue': 'যাচাই করে চালিয়ে যান',
  'Change number': 'নম্বর পরিবর্তন করুন',
  'Resend in {seconds}s': '{seconds} সেকেন্ডে আবার পাঠান',
  'Resend code': 'কোড আবার পাঠান',
  'No SMS is sent in this prototype. Use the code {code}.':
    'এই প্রোটোটাইপে SMS পাঠানো হয় না। কোড {code} ব্যবহার করুন।',
  'Enter the {length}-digit code to continue.':
    'চালিয়ে যেতে {length} সংখ্যার কোড দিন।',
  'This code has expired. Resend a new code to continue.':
    'এই কোডের মেয়াদ শেষ। চালিয়ে যেতে নতুন কোড পাঠান।',
  'That code is not correct. Check the digits and try again.':
    'কোডটি সঠিক নয়। অঙ্ক দেখে আবার চেষ্টা করুন।',
  Partner: 'পার্টনার',
  'Active delivery': 'সক্রিয় ডেলিভারি',
  Grocery: 'মুদি',
  Restaurant: 'রেস্টুরেন্ট',
  Prepaid: 'প্রিপেইড',
  Cash: 'নগদ',
  'Delivery partner': 'ডেলিভারি পার্টনার',
  'Open profile': 'প্রোফাইল খুলুন',
  Notifications: 'বিজ্ঞপ্তি',
  'Notifications, {count} unread': '{count}টি অপঠিত বিজ্ঞপ্তি',
  'You are Online': 'আপনি অনলাইনে আছেন',
  'You are Offline': 'আপনি অফলাইনে আছেন',
  'Receiving delivery requests': 'ডেলিভারি অনুরোধ পাচ্ছেন',
  'Go online to receive requests': 'অনুরোধ পেতে অনলাইন হোন',
  Availability: 'উপলব্ধতা',
  'Continue setup': 'সেটআপ চালিয়ে যান',
  'Track status': 'স্ট্যাটাস দেখুন',
  'Continue delivery': 'ডেলিভারি চালিয়ে যান',
  Deliveries: 'ডেলিভারি',
  Rating: 'রেটিং',
  'Quick actions': 'দ্রুত কাজ',
  'Find requests': 'অনুরোধ খুঁজুন',
  'My orders': 'আমার অর্ডার',
  Support: 'সহায়তা',
  'New requests': 'নতুন অনুরোধ',
  '{count} waiting': '{count}টি অপেক্ষমাণ',
  Offline: 'অফলাইন',
  'No requests right now. Stay online to get the next job.':
    'এখন কোনো অনুরোধ নেই। পরের কাজ পেতে অনলাইনে থাকুন।',
  'Turn on availability to start receiving nearby grocery and restaurant requests.':
    'কাছাকাছি মুদি ও রেস্টুরেন্টের অনুরোধ পেতে উপলব্ধতা চালু করুন।',
  'Application pending': 'আবেদন অপেক্ষমাণ',
  'Finish your partner setup and submit it for verification.':
    'পার্টনার সেটআপ শেষ করে যাচাইয়ের জন্য জমা দিন।',
  'Application submitted': 'আবেদন জমা হয়েছে',
  'We received your details and documents. Verification starts next.':
    'আমরা আপনার বিবরণ ও নথি পেয়েছি। এরপর যাচাই শুরু হবে।',
  'Application under review': 'আবেদন পর্যালোচনায়',
  'The verification team is checking your documents. This usually takes one working day.':
    'যাচাই দল আপনার নথি পরীক্ষা করছে। সাধারণত এক কর্মদিবস লাগে।',
  'Application approved': 'আবেদন অনুমোদিত',
  'Your partner account is approved. You can go online and receive delivery requests.':
    'আপনার পার্টনার অ্যাকাউন্ট অনুমোদিত। আপনি অনলাইনে গিয়ে ডেলিভারি অনুরোধ পেতে পারেন।',
  'Application rejected': 'আবেদন প্রত্যাখ্যাত',
  'Your application was not approved. Review the reason and contact support to continue.':
    'আপনার আবেদন অনুমোদিত হয়নি। কারণ দেখে এগিয়ে যেতে সহায়তার সঙ্গে যোগাযোগ করুন।',
  'Requests, active jobs and completed work':
    'অনুরোধ, সক্রিয় কাজ ও সম্পন্ন কাজ',
  'Delivery views': 'ডেলিভারি ভিউ',
  Available: 'উপলব্ধ',
  Active: 'সক্রিয়',
  'You are offline': 'আপনি অফলাইনে আছেন',
  'Go online to receive nearby grocery and restaurant requests.':
    'কাছাকাছি মুদি ও রেস্টুরেন্টের অনুরোধ পেতে অনলাইন হোন।',
  'No new requests': 'নতুন অনুরোধ নেই',
  'When you are online, nearby grocery and restaurant requests will appear here.':
    'অনলাইনে থাকলে কাছাকাছি মুদি ও রেস্টুরেন্টের অনুরোধ এখানে দেখাবে।',
  'No active delivery': 'কোনো সক্রিয় ডেলিভারি নেই',
  'Accept a request from the Available tab to start a delivery.':
    'ডেলিভারি শুরু করতে উপলব্ধ ট্যাব থেকে অনুরোধ গ্রহণ করুন।',
  'Open active delivery': 'সক্রিয় ডেলিভারি খুলুন',
  'No delivery in progress': 'কোনো ডেলিভারি চলছে না',
  'Accept a delivery request to see the route, timeline and delivery actions here.':
    'রুট, টাইমলাইন ও ডেলিভারি কাজ দেখতে অনুরোধ গ্রহণ করুন।',
  Pickup: 'পিকআপ',
  'Deliver to': 'এখানে ডেলিভারি করুন',
  'Delivery progress': 'ডেলিভারি অগ্রগতি',
  'Customer note': 'গ্রাহকের নোট',
  'Verify delivery OTP': 'ডেলিভারি OTP যাচাই করুন',
  'Ask the customer for the 4-digit code to close this delivery.':
    'ডেলিভারি শেষ করতে গ্রাহকের কাছ থেকে ৪ সংখ্যার কোড নিন।',
  'Delivery OTP': 'ডেলিভারি OTP',
  '4-digit code': '৪ সংখ্যার কোড',
  'Demo build: use 4821 to complete the delivery.':
    'ডেমো বিল্ড: ডেলিভারি শেষ করতে 4821 ব্যবহার করুন।',
  'Complete delivery': 'ডেলিভারি সম্পন্ন করুন',
  'Delivery completed': 'ডেলিভারি সম্পন্ন',
  'What went wrong?': 'কী সমস্যা হয়েছে?',
  'This cancels the delivery and informs support.':
    'এতে ডেলিভারি বাতিল হবে এবং সহায়তা দলকে জানানো হবে।',
  'Customer is unreachable': 'গ্রাহকের সঙ্গে যোগাযোগ হচ্ছে না',
  'Address could not be found': 'ঠিকানা পাওয়া যায়নি',
  'Order was damaged': 'অর্ডার নষ্ট হয়েছে',
  'Vehicle breakdown': 'যানবাহন নষ্ট হয়েছে',
  'I have reached the pickup': 'আমি পিকআপে পৌঁছেছি',
  'Confirm pickup': 'পিকআপ নিশ্চিত করুন',
  'Start the delivery': 'ডেলিভারি শুরু করুন',
  'I have reached the drop': 'আমি ড্রপে পৌঁছেছি',
  'Enter the 4-digit delivery code from the customer.':
    'গ্রাহকের কাছ থেকে ৪ সংখ্যার ডেলিভারি কোড দিন।',
  'That code does not match. Check with the customer and try again.':
    'কোড মেলেনি। গ্রাহকের সঙ্গে দেখে আবার চেষ্টা করুন।',
  'New request': 'নতুন অনুরোধ',
  'Order accepted': 'অর্ডার গ্রহণ হয়েছে',
  'At pickup': 'পিকআপে',
  'Picked up': 'পিকআপ হয়েছে',
  'On the way': 'পথে',
  'At drop': 'ড্রপে',
  'Every delivery you have completed or cancelled':
    'আপনার সম্পন্ন বা বাতিল প্রতিটি ডেলিভারি',
  'Search by delivery ID or customer': 'ডেলিভারি ID বা গ্রাহক দিয়ে খুঁজুন',
  'Search deliveries': 'ডেলিভারি খুঁজুন',
  'Filter deliveries': 'ডেলিভারি ফিল্টার করুন',
  All: 'সব',
  '{count} delivered': '{count}টি ডেলিভারি হয়েছে',
  '{amount} earned': '{amount} আয়',
  'No deliveries found': 'কোনো ডেলিভারি পাওয়া যায়নি',
  'Try a different search term or status filter.':
    'অন্য অনুসন্ধান বা স্ট্যাটাস ফিল্টার চেষ্টা করুন।',
  'Not completed': 'সম্পন্ন হয়নি',
  'Payouts, incentives and delivery earnings':
    'পেআউট, ইনসেনটিভ ও ডেলিভারি আয়',
  'Earnings period': 'আয়ের সময়কাল',
  Today: 'আজ',
  Week: 'সপ্তাহ',
  Month: 'মাস',
  "Today's earnings": 'আজকের আয়',
  'This week': 'এই সপ্তাহ',
  'This month': 'এই মাস',
  'Includes {amount} of incentives': '{amount} ইনসেনটিভ অন্তর্ভুক্ত',
  'This period': 'এই সময়কাল',
  'Avg. per delivery': 'প্রতি ডেলিভারিতে গড়',
  'After incentives': 'ইনসেনটিভের পরে',
  'Earnings trend': 'আয়ের প্রবণতা',
  'Today, by time of day': 'আজ, সময় অনুযায়ী',
  'Recent deliveries': 'সাম্প্রতিক ডেলিভারি',
  Payouts: 'পেআউট',
  'Demo data for this phase. Earnings will come from live delivery and payment records after the backend integration.':
    'এই ধাপে ডেমো ডেটা। ব্যাকএন্ড যুক্ত হলে আয় লাইভ ডেলিভারি ও পেমেন্ট রেকর্ড থেকে আসবে।',
  '{count} unread': '{count}টি অপঠিত',
  'You are all caught up': 'সব পড়া হয়েছে',
  'Mark all as read': 'সব পঠিত করুন',
  'No notifications': 'কোনো বিজ্ঞপ্তি নেই',
  'Delivery requests, payment updates and account messages will appear here.':
    'ডেলিভারি অনুরোধ, পেমেন্ট আপডেট ও অ্যাকাউন্ট বার্তা এখানে দেখাবে।',
  'New grocery request nearby': 'কাছাকাছি নতুন মুদির অনুরোধ',
  'FreshMart Grocery to New Town, about 5.1 km. Accept before the timer ends.':
    'ফ্রেশমার্ট গ্রোসারি থেকে নিউ টাউন, প্রায় ৫.১ কিমি। সময় শেষের আগে গ্রহণ করুন।',
  'Weekly payout is being processed': 'সাপ্তাহিক পেআউট প্রক্রিয়াধীন',
  '₹7,480 for the week of 27 Oct is expected in your bank account on 05 Nov.':
    '২৭ অক্টোবরের সপ্তাহের ₹৭,৪৮০ ০৫ নভেম্বর আপনার ব্যাঙ্ক অ্যাকাউন্টে আসার কথা।',
  'Complete your onboarding': 'আপনার অনবোর্ডিং সম্পূর্ণ করুন',
  'Add your address, KYC documents and bank details to get approved for deliveries.':
    'ডেলিভারির জন্য অনুমোদন পেতে ঠিকানা, KYC নথি ও ব্যাঙ্ক বিবরণ যোগ করুন।',
  'Delivery #DEL7842 completed': 'ডেলিভারি #DEL7842 সম্পন্ন',
  '₹72 was added to today’s earnings. Thanks for delivering on time.':
    'আজকের আয়ে ₹৭২ যোগ হয়েছে। সময়মতো ডেলিভারির জন্য ধন্যবাদ।',
  'Restaurant request missed': 'রেস্টুরেন্টের অনুরোধ মিস হয়েছে',
  'You did not respond to a request from Spice Villa in time.':
    'আপনি স্পাইস ভিলার অনুরোধে সময়মতো সাড়া দেননি।',
  'Help & support': 'সহায়তা ও সমর্থন',
  'FAQs and support tickets': 'সাধারণ প্রশ্ন ও সহায়তা টিকিট',
  'Frequently asked': 'সাধারণত জিজ্ঞাসিত',
  'When do I receive my weekly payout?': 'আমার সাপ্তাহিক পেআউট কখন আসে?',
  'Payouts are processed every Monday for the previous Monday to Sunday period. It can take up to two working days for the amount to reach your bank account.':
    'আগের সোমবার থেকে রবিবারের পেআউট প্রতি সোমবার প্রক্রিয়া করা হয়। ব্যাঙ্ক অ্যাকাউন্টে আসতে দুই কর্মদিবস পর্যন্ত লাগতে পারে।',
  'Why can I not go online?': 'আমি কেন অনলাইনে যেতে পারছি না?',
  'Going online needs an approved account. Finish your onboarding, KYC and bank details, and wait for the verification team to approve your profile.':
    'অনলাইনে যেতে অনুমোদিত অ্যাকাউন্ট দরকার। অনবোর্ডিং, KYC ও ব্যাঙ্ক বিবরণ সম্পূর্ণ করে যাচাই দলের অনুমোদনের অপেক্ষা করুন।',
  'What should I do if a customer is unreachable?':
    'গ্রাহকের সঙ্গে যোগাযোগ না হলে কী করব?',
  'Call the customer twice and wait at the address for five minutes. Then use Report an issue on the active delivery screen so the support team can help.':
    'গ্রাহককে দুইবার কল করুন এবং ঠিকানায় পাঁচ মিনিট অপেক্ষা করুন। তারপর সক্রিয় ডেলিভারি স্ক্রিনে সমস্যা জানান যাতে সহায়তা দল সাহায্য করতে পারে।',
  'How is my delivery earnings calculated?': 'ডেলিভারি আয় কীভাবে হিসাব হয়?',
  'Earnings combine a base fee, distance pay and any active incentive. The amount offered is shown before you accept a request.':
    'আয়ে বেস ফি, দূরত্বের পেমেন্ট ও সক্রিয় ইনসেনটিভ থাকে। অনুরোধ গ্রহণের আগে পরিমাণ দেখানো হয়।',
  'Can I update my documents later?': 'আমি কি পরে নথি আপডেট করতে পারব?',
  'Yes. Uploaded documents can be replaced from your profile when they are near expiry or if the review team asks for a clearer copy.':
    'হ্যাঁ। মেয়াদ শেষের কাছাকাছি হলে বা পর্যালোচনা দল স্পষ্ট কপি চাইলে প্রোফাইল থেকে নথি বদলানো যায়।',
  'Raise a ticket': 'টিকিট তৈরি করুন',
  'Our team replies within one working day.':
    'আমাদের দল এক কর্মদিবসে উত্তর দেয়।',
  Subject: 'বিষয়',
  'Short summary of the issue': 'সমস্যার সংক্ষিপ্ত সারাংশ',
  'Describe the issue': 'সমস্যা বর্ণনা করুন',
  'What happened, and when?': 'কী হয়েছে এবং কখন?',
  'Add a short subject for your issue.': 'সমস্যার জন্য ছোট বিষয় লিখুন।',
  'Describe the issue in a little more detail.':
    'সমস্যাটি একটু বিস্তারিত বলুন।',
  'Ticket created. You can track its status below.':
    'টিকিট তৈরি হয়েছে। নিচে এর স্ট্যাটাস দেখুন।',
  'Submit ticket': 'টিকিট জমা দিন',
  'Your tickets': 'আপনার টিকিট',
  'You have not raised any tickets yet.': 'আপনি এখনও কোনো টিকিট তৈরি করেননি।',
  'Emergency support: 1800 123 4567 (24×7)':
    'জরুরি সহায়তা: 1800 123 4567 (24×7)',
  'Partner account and settings': 'পার্টনার অ্যাকাউন্ট ও সেটিংস',
  'Partner ID · {id}': 'পার্টনার ID · {id}',
  '{rating} rating': '{rating} রেটিং',
  'address not added': 'ঠিকানা যোগ করা হয়নি',
  Vehicle: 'যানবাহন',
  'Walking delivery': 'হেঁটে ডেলিভারি',
  'Model not added': 'মডেল যোগ করা হয়নি',
  'No vehicle or registration needed': 'যানবাহন বা নিবন্ধনের প্রয়োজন নেই',
  'No registration needed': 'নিবন্ধনের প্রয়োজন নেই',
  'Registration number not added': 'নিবন্ধন নম্বর যোগ করা হয়নি',
  Documents: 'নথি',
  'Aadhaar card': 'আধার কার্ড',
  'PAN card': 'PAN কার্ড',
  'Driving licence': 'ড্রাইভিং লাইসেন্স',
  'Vehicle RC': 'যানবাহনের RC',
  Application: 'আবেদন',
  'Application status': 'আবেদনের অবস্থা',
  'Track verification progress': 'যাচাইয়ের অগ্রগতি দেখুন',
  Preferences: 'পছন্দসমূহ',
  'App language': 'অ্যাপের ভাষা',
  'Request alerts': 'অনুরোধের সতর্কতা',
  'Notify me about new delivery requests':
    'নতুন ডেলিভারি অনুরোধের জন্য জানান',
  'Continue partner setup': 'পার্টনার সেটআপ চালিয়ে যান',
  'View partner details': 'পার্টনার বিবরণ দেখুন',
  'Sign out': 'সাইন আউট',
  'Fafo Delivery Partner App · Prototype build':
    'ফাফো ডেলিভারি পার্টনার অ্যাপ · প্রোটোটাইপ বিল্ড',
  'On foot': 'হেঁটে',
  Bike: 'বাইক',
  Scooter: 'স্কুটার',
  Bicycle: 'সাইকেল',
  'Partner verification': 'পার্টনার যাচাই',
  'Current status': 'বর্তমান অবস্থা',
  'Last update': 'শেষ আপডেট',
  'Not yet': 'এখনও নয়',
  Progress: 'অগ্রগতি',
  'Application started': 'আবেদন শুরু হয়েছে',
  'Details and documents received': 'বিবরণ ও নথি পাওয়া গেছে',
  'Verification team checks your documents':
    'যাচাই দল আপনার নথি পরীক্ষা করে',
  Decision: 'সিদ্ধান্ত',
  'Account ready for deliveries': 'ডেলিভারির জন্য অ্যাকাউন্ট প্রস্তুত',
  'Application not approved': 'আবেদন অনুমোদিত হয়নি',
  'Approval or rejection': 'অনুমোদন বা প্রত্যাখ্যান',
  'Contact support to understand what needs to change before you apply again.':
    'আবার আবেদন করার আগে কী পরিবর্তন করতে হবে জানতে সহায়তার সঙ্গে যোগাযোগ করুন।',
  'Contact support': 'সহায়তার সঙ্গে যোগাযোগ করুন',
  'Preview another status (demo)': 'অন্য স্ট্যাটাস দেখুন (ডেমো)',
  'No verification service is connected in this prototype. Use these to preview each stage.':
    'এই প্রোটোটাইপে যাচাই পরিষেবা যুক্ত নেই। এগুলো দিয়ে প্রতিটি ধাপ দেখুন।',
  'Status is demo data until the verification service is connected.':
    'যাচাই পরিষেবা যুক্ত হওয়া পর্যন্ত স্ট্যাটাস ডেমো ডেটা।',
  'Partner Onboarding': 'পার্টনার অনবোর্ডিং',
  Personal: 'ব্যক্তিগত',
  KYC: 'KYC',
  Training: 'প্রশিক্ষণ',
  Review: 'পর্যালোচনা',
  'Personal Details': 'ব্যক্তিগত বিবরণ',
  'Tell us about yourself': 'আপনার সম্পর্কে বলুন',
  'Profile photo': 'প্রোফাইল ছবি',
  'Tap the photo to change it · max 2 MB':
    'পরিবর্তন করতে ছবিতে ট্যাপ করুন · সর্বোচ্চ ২ MB',
  'Clear front-facing photo, JPG or PNG · max 2 MB':
    'স্পষ্ট সামনের ছবি, JPG বা PNG · সর্বোচ্চ ২ MB',
  'Full name': 'পুরো নাম',
  'Name as on documents': 'নথি অনুযায়ী নাম',
  'Your verified number cannot be changed here.':
    'যাচাই করা নম্বর এখানে পরিবর্তন করা যায় না।',
  Email: 'ইমেল',
  'Date of birth': 'জন্ম তারিখ',
  City: 'শহর',
  Address: 'ঠিকানা',
  'House, street, area': 'বাড়ি, রাস্তা, এলাকা',
  'PIN code': 'PIN কোড',
  'KYC Verification': 'KYC যাচাই',
  'Each file must be JPG or PDF and within 2 MB':
    'প্রতিটি ফাইল JPG বা PDF এবং ২ MB-এর মধ্যে হতে হবে',
  'Front and back, JPG or PDF · max 2 MB':
    'সামনে ও পিছনে, JPG বা PDF · সর্বোচ্চ ২ MB',
  'Clear photo of the card · max 2 MB':
    'কার্ডের স্পষ্ট ছবি · সর্বোচ্চ ২ MB',
  'Needed for motorised vehicles · max 2 MB':
    'মোটরযানের জন্য প্রয়োজন · সর্বোচ্চ ২ MB',
  'Registration certificate · max 2 MB': 'নিবন্ধন সার্টিফিকেট · সর্বোচ্চ ২ MB',
  'Verification status': 'যাচাইয়ের অবস্থা',
  'Documents are checked after you submit, usually within one working day.':
    'জমা দেওয়ার পর নথি পরীক্ষা করা হয়, সাধারণত এক কর্মদিবসে।',
  'Bank account details': 'ব্যাঙ্ক অ্যাকাউন্টের বিবরণ',
  'Account holder name': 'অ্যাকাউন্ট হোল্ডারের নাম',
  'Account number': 'অ্যাকাউন্ট নম্বর',
  'IFSC code': 'IFSC কোড',
  'Find this on your cheque book or bank app.':
    'চেক বই বা ব্যাঙ্ক অ্যাপে দেখুন।',
  'Vehicle Details': 'যানবাহনের বিবরণ',
  'Provide your vehicle and licence information':
    'আপনার যানবাহন ও লাইসেন্সের তথ্য দিন',
  'Vehicle type': 'যানবাহনের ধরন',
  'Registration number': 'নিবন্ধন নম্বর',
  'Enter the number printed on the number plate.':
    'নম্বর প্লেটে লেখা নম্বর দিন।',
  'Walking deliveries do not need a vehicle registration.':
    'হেঁটে ডেলিভারির জন্য যানবাহন নিবন্ধন লাগে না।',
  'Bicycles do not need a registration number.':
    'সাইকেলের জন্য নিবন্ধন নম্বর লাগে না।',
  'Vehicle model': 'যানবাহনের মডেল',
  'Vehicle colour': 'যানবাহনের রঙ',
  'Training & Onboarding': 'প্রশিক্ষণ ও অনবোর্ডিং',
  'Complete every module before your account is approved':
    'অ্যাকাউন্ট অনুমোদনের আগে প্রতিটি মডিউল সম্পূর্ণ করুন',
  'Review & Submit': 'পর্যালোচনা ও জমা দিন',
  'Check your details before sending them for verification':
    'যাচাইয়ের জন্য পাঠানোর আগে বিবরণ দেখুন',
  'KYC & bank': 'KYC ও ব্যাঙ্ক',
  'Profile photo added': 'প্রোফাইল ছবি যোগ করা হয়েছে',
  'Profile photo missing': 'প্রোফাইল ছবি নেই',
  uploaded: 'আপলোড করা হয়েছে',
  missing: 'নেই',
  'Walking delivery partner': 'হেঁটে ডেলিভারি পার্টনার',
  'On foot · no vehicle or registration needed':
    'হেঁটে · যানবাহন বা নিবন্ধনের প্রয়োজন নেই',
  '{completed} of {total} modules complete':
    '{total}-এর মধ্যে {completed}টি মডিউল সম্পূর্ণ',
  'By submitting, you confirm these details are correct. The review team may contact you for clearer documents.':
    'জমা দিয়ে আপনি নিশ্চিত করছেন যে বিবরণ সঠিক। পর্যালোচনা দল স্পষ্ট নথির জন্য যোগাযোগ করতে পারে।',
  'Submit application': 'আবেদন জমা দিন',
  'Go back': 'ফিরে যান',
  'Partner setup': 'পার্টনার সেটআপ',
  'Track application status': 'আবেদনের অবস্থা দেখুন',
  'Submitted on {date}.': '{date}-এ জমা দেওয়া হয়েছে।',
  'Upload a profile photo to continue.':
    'চালিয়ে যেতে প্রোফাইল ছবি আপলোড করুন।',
  'Enter your full name as it appears on your documents.':
    'নথি অনুযায়ী আপনার পুরো নাম দিন।',
  'Enter a valid email address.': 'বৈধ ইমেল ঠিকানা দিন।',
  'Enter your date of birth.': 'আপনার জন্ম তারিখ দিন।',
  'Enter a valid date of birth.': 'বৈধ জন্ম তারিখ দিন।',
  'Date of birth cannot be in the future.':
    'জন্ম তারিখ ভবিষ্যতের হতে পারে না।',
  'You must be at least 18 years old to deliver with Fafo.':
    'ফাফোর সঙ্গে ডেলিভারির জন্য আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে।',
  'Enter your city.': 'আপনার শহর দিন।',
  'Enter your current address.': 'আপনার বর্তমান ঠিকানা দিন।',
  'Enter a 6-digit PIN code.': '৬ সংখ্যার PIN কোড দিন।',
  'Upload your Aadhaar card to continue.':
    'চালিয়ে যেতে আধার কার্ড আপলোড করুন।',
  'Upload your PAN card to continue.':
    'চালিয়ে যেতে PAN কার্ড আপলোড করুন।',
  "Enter the account holder's name.": 'অ্যাকাউন্ট হোল্ডারের নাম দিন।',
  'Enter a valid bank account number.': 'বৈধ ব্যাঙ্ক অ্যাকাউন্ট নম্বর দিন।',
  'Enter a valid IFSC code, for example HDFC0001234.':
    'বৈধ IFSC কোড দিন, যেমন HDFC0001234।',
  'Enter your vehicle model.': 'আপনার যানবাহনের মডেল দিন।',
  'Enter a valid registration number, for example WB02AB1234.':
    'বৈধ নিবন্ধন নম্বর দিন, যেমন WB02AB1234।',
  'Complete every training topic to continue.':
    'চালিয়ে যেতে প্রতিটি প্রশিক্ষণ বিষয় সম্পূর্ণ করুন।',
  'Choose a JPG or PNG image.': 'JPG বা PNG ছবি বাছাই করুন।',
  'Choose an image smaller than 2 MB.': '২ MB-এর ছোট ছবি বাছাই করুন।',
  'Could not read that image. Try another file.':
    'ছবিটি পড়া যায়নি। অন্য ফাইল চেষ্টা করুন।',
  'File is larger than 2 MB. Choose a smaller file.':
    'ফাইল ২ MB-এর বেশি। ছোট ফাইল বাছাই করুন।',
  'Welcome to PicDrop + HopNgo': 'পিকড্রপ + হপএনগোতে স্বাগতম',
  'How to Accept Delivery Orders': 'ডেলিভারি অর্ডার কীভাবে গ্রহণ করবেন',
  'Pickup & Delivery Process': 'পিকআপ ও ডেলিভারি প্রক্রিয়া',
  'Customer Interaction Guidelines': 'গ্রাহক যোগাযোগ নির্দেশিকা',
  'Delivery Safety & Best Practices': 'ডেলিভারি নিরাপত্তা ও সেরা অনুশীলন',
  '{count} items': '{count}টি আইটেম',
  '{count} min': '{count} মিনিট',
  '{count} km': '{count} কিমি',
  'Demo route': 'ডেমো রুট',
  'Page not found': 'পেজ পাওয়া যায়নি',
  'The link may be broken or the page may have moved':
    'লিংক ভাঙা হতে পারে বা পেজ সরে গেছে',
  'Nothing here': 'এখানে কিছু নেই',
  'The page you are looking for does not exist or may have moved.':
    'আপনি যে পেজ খুঁজছেন তা নেই বা সরে গেছে।',
  'Cash on delivery': 'ক্যাশ অন ডেলিভারি',
  Unread: 'অপঠিত',
  Resolved: 'সমাধান হয়েছে',
  '2 min': '২ মিনিট',
  '3 min': '৩ মিনিট',
  '4 min': '৪ মিনিট',
  '{count}s': '{count} সেকেন্ড',
  'Profile photo preview': 'প্রোফাইল ছবির প্রিভিউ',
  'Upload profile photo': 'প্রোফাইল ছবি আপলোড করুন',
  'Upload {document}': '{document} আপলোড করুন',
  'Demo route preview from {pickup} to {destination}':
    '{pickup} থেকে {destination} পর্যন্ত ডেমো রুট প্রিভিউ',
  'Name as on the bank account': 'ব্যাঙ্ক অ্যাকাউন্ট অনুযায়ী নাম',
  'Week of {date}': '{date}-এর সপ্তাহ',
  'Expected {date}': '{date} প্রত্যাশিত',
  '9 AM': 'সকাল ৯',
  '11 AM': 'সকাল ১১',
  '1 PM': 'দুপুর ১',
  '3 PM': 'দুপুর ৩',
  '5 PM': 'সন্ধ্যা ৫',
  '7 PM': 'সন্ধ্যা ৭',
  Primary: 'প্রধান',
  'Fafo Delivery Partner': 'ফাফো ডেলিভারি পার্টনার',
  'Planned in this module': 'এই মডিউলে পরিকল্পিত',
  '{label} digit {number}': '{label} সংখ্যা {number}',
  'Customer unreachable at the delivery address.':
    'ডেলিভারির ঠিকানায় গ্রাহকের সঙ্গে যোগাযোগ করা যায়নি।',
  'Aadhaar number': 'আধার নম্বর',
  '12-digit number on your Aadhaar card':
    'আধার কার্ডে লেখা 12 সংখ্যার নম্বর',
  'Enter a valid 12-digit Aadhaar number.':
    'সঠিক 12 সংখ্যার আধার নম্বর দিন।',
  'JPG / PDF': 'JPG / PDF',
  Change: 'পরিবর্তন করুন',
  'PAN number': 'PAN নম্বর',
  '10-character PAN, e.g. ABCDE1234F': '10 অক্ষরের PAN, যেমন ABCDE1234F',
  'Enter a valid 10-character PAN number.':
    'সঠিক 10 অক্ষরের PAN নম্বর দিন।',
  'Licence number': 'লাইসেন্স নম্বর',
  'Licence number as printed on the card': 'লাইসেন্স কার্ডে লেখা নম্বর',
  'Enter a valid driving licence number.':
    'সঠিক ড্রাইভিং লাইসেন্স নম্বর দিন।',
  'Upload your driving licence to continue.':
    'চালিয়ে যেতে ড্রাইভিং লাইসেন্স আপলোড করুন।',
  'Registration number printed on the RC': 'RC-তে লেখা রেজিস্ট্রেশন নম্বর',
  'Upload your vehicle RC to continue.':
    'চালিয়ে যেতে গাড়ির RC আপলোড করুন।',
  'Bank passbook': 'ব্যাঙ্ক পাসবুক',
  'Passbook or cancelled cheque · JPG or PDF · max 2 MB':
    'পাসবুক বা বাতিল চেক · JPG বা PDF · সর্বোচ্চ 2 MB',
}

export const translations: Record<Exclude<Language, 'en'>, Record<string, string>> =
  {
    hi: hindi,
    bn: bengali,
  }

export function translate(
  language: Language,
  key: string,
  vars?: TranslationVars,
): string {
  const template =
    language === 'en' ? key : (translations[language][key] ?? key)

  if (!vars) {
    return template
  }

  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name)
      ? String(vars[name])
      : match,
  )
}
