export type SupportedLanguage = "en" | "hi" | "ta" | "te" | "kn" | "bn" | "mr";

export interface TranslationStrings {
  emergencyGreeting: string;
  askPreferredLanguage: string;
  languageAcknowledged: string;
  askNarrative: string;
  askTransactionDetails: string;
  askMissingDate: string;
  askMissingUTR: string;
  askMissingAmount: string;
  askConflictResolution: string;
  reportReady: string;
  reportSubmitted: string;
  reportAccepted: string;
  policeDisclaimer: string;
  noActiveCase: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    emergencyGreeting: "Raksha Emergency Response. Please don't worry at all, we are here to assist you immediately.",
    askPreferredLanguage: "Please choose your language. Reply with the number or language name.",
    languageAcknowledged: "Thank you. We will continue in English.",
    askNarrative: "Please describe what happened in your own words — how did they contact you?",
    askTransactionDetails: "Please upload your payment screenshot or enter transaction details.",
    askMissingDate: "I found the amount and bank details. When did this transaction take place?",
    askMissingUTR: "I only need one thing: please provide the 12-digit UTR or Reference Number from your payment receipt or bank SMS.",
    askMissingAmount: "What was the exact amount debited from your account?",
    askConflictResolution: "I noticed a difference in the transaction amounts. Which amount is correct?",
    reportReady: "Your emergency fraud report is verified and ready for official handoff.",
    reportSubmitted: "Report submitted to 1930 / Cyber Crime Portal gateway.",
    reportAccepted: "Emergency fraud freeze packet accepted. Reference number generated.",
    policeDisclaimer: "Official acknowledgement received. Next step: Follow up on the national cyber crime portal.",
    noActiveCase: "I could not find an active Raksha report on this number yet. Tell me what happened and I will start one.",
  },
  hi: {
    emergencyGreeting: "रक्षा आपातकालीन सेवा। आप बिल्कुल चिंता मत कीजिए, हम तुरंत आपकी सहायता कर रहे हैं।",
    askPreferredLanguage: "कृपया अपनी भाषा चुनें। संख्या या भाषा का नाम लिखें।",
    languageAcknowledged: "धन्यवाद। हम हिंदी में आगे बढ़ेंगे।",
    askNarrative: "कृपया अपने शब्दों में बताएं कि क्या हुआ — आपसे किसने और कैसे संपर्क किया?",
    askTransactionDetails: "कृपया अपने भुगतान का स्क्रीनशॉट अपलोड करें या विवरण दर्ज करें।",
    askMissingDate: "मुझे राशि और बैंक का विवरण मिल गया है। यह लेन-देन किस समय हुआ था?",
    askMissingUTR: "मुझे बस एक जानकारी चाहिए: कृपया 12-अंकों का UTR या संदर्भ संख्या प्रदान करें जो PhonePe या बैंक SMS में आया हो।",
    askMissingAmount: "आपके खाते से कितनी राशि काटी गई थी?",
    askConflictResolution: "लेन-देन की राशि में अंतर है। कृपया सही राशि की पुष्टि करें।",
    reportReady: "आपकी आपातकालीन रिपोर्ट सत्यापित हो चुकी है और भेजने के लिए तैयार है।",
    reportSubmitted: "रिपोर्ट 1930 / साइबर क्राइम पोर्टल गेटवे को भेज दी गई है।",
    reportAccepted: "आपातकालीन फ्रॉड फ्रीज पैकेट स्वीकार कर लिया गया है। संदर्भ संख्या तैयार है।",
    policeDisclaimer: "आधिकारिक पावती प्राप्त हुई। अगला कदम: पोर्टल पर अनुवर्ती कार्रवाई करें।",
    noActiveCase: "इस नंबर पर अभी कोई सक्रिय रक्षा रिपोर्ट नहीं मिली। बताइए क्या हुआ, मैं रिपोर्ट शुरू करूँगा।",
  },
  ta: {
    emergencyGreeting: "ரக்ஷா அவசர உதவி மையம். தயவுசெய்து அமைதியாக இருங்கள், நாங்கள் உடனடியாக உதவுகிறோம்.",
    askPreferredLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும். எண் அல்லது மொழி பெயரை அனுப்பவும்.",
    languageAcknowledged: "நன்றி. தமிழில் தொடர்கிறோம்.",
    askNarrative: "என்ன நடந்தது என்பதை உங்கள் சொந்த வார்த்தைகளில் கூறுங்கள்.",
    askTransactionDetails: "தயவுசெய்து உங்கள் பரிவர்த்தனை ஸ்கிரீன்ஷாட்டை பதிவேற்றவும்.",
    askMissingDate: "தொகை மற்றும் வங்கி விவரங்கள் கிடைத்தன. இந்த பரிவர்த்தனை எப்போது நடந்தது?",
    askMissingUTR: "எனக்கு ஒரு விவரம் மட்டும் தேவை: 12 இலக்க UTR அல்லது குறிப்பு எண்ணை வழங்கவும்.",
    askMissingAmount: "உங்கள் கணக்கிலிருந்து எடுக்கப்பட்ட சரியான தொகை என்ன?",
    askConflictResolution: "பரிவர்த்தனை தொகையில் முரண்பாடு உள்ளது. சரியான தொகையை உறுதிப்படுத்தவும்.",
    reportReady: "உங்கள் அவசர புகார் சரிபார்க்கப்பட்டு சமர்ப்பிக்க தயாராக உள்ளது.",
    reportSubmitted: "புகார் 1930 / சைபர் கிரைம் போர்ட்டலுக்கு அனுப்பப்பட்டது.",
    reportAccepted: "அவசர முடக்கல் அறிக்கை ஏற்றுக்கொள்ளப்பட்டது. குறிப்பு எண் உருவாக்கப்பட்டது.",
    policeDisclaimer: "அதிகாரப்பூர்வ ஒப்புதல் பெறப்பட்டது. அடுத்த கட்ட நடவடிக்கை எடுக்கவும்.",
    noActiveCase: "இந்த எண்ணில் இன்னும் ரக்ஷா புகார் இல்லை. என்ன நடந்தது என்று சொல்லுங்கள்.",
  },
  te: {
    emergencyGreeting: "రక్ష ఎమర్జెన్సీ రెస్పాన్స్. దయచేసి ప్రశాంతంగా ఉండండి, మేము వెంటనే సహాయం చేస్తాము.",
    askPreferredLanguage: "దయచేసి మీ భాషను ఎంచుకోండి. నంబర్ లేదా భాష పేరు పంపండి.",
    languageAcknowledged: "ధన్యవాదాలు. తెలుగులో కొనసాగిస్తాము.",
    askNarrative: "ఏమి జరిగిందో మీ మాటల్లో చెప్పండి.",
    askTransactionDetails: "దయచేసి మీ లావాదేవీ స్క్రీన్‌షాట్‌ను అప్‌లోడ్ చేయండి.",
    askMissingDate: "మొత్తం మరియు బ్యాంక్ వివరాలు లభించాయి. ఈ లావాదేవీ ఎప్పుడు జరిగింది?",
    askMissingUTR: "నాకు 12-అంకెల UTR లేదా రిఫరెన్స్ నంబర్ మాత్రమే అవసరం.",
    askMissingAmount: "మీ ఖాతా నుండి డెబిట్ చేయబడిన ఖచ్చితమైన మొత్తం ఎంత?",
    askConflictResolution: "లావాదేవీ మొత్తంలో తేడా ఉంది. సరైన మొత్తాన్ని నిర్ధారించండి.",
    reportReady: "మీ ఎమర్జెన్సీ రిపోర్ట్ ధృవీకరించబడింది మరియు సమర్పించడానికి సిద్ధంగా ఉంది.",
    reportSubmitted: "రిపోర్ట్ 1930 / సైబర్ క్రైమ్ పోర్టల్‌కు సమర్పించబడింది.",
    reportAccepted: "ఎమర్జెన్సీ ఫ్రీజ్ ప్యాకెట్ ఆమోదించబడింది.",
    policeDisclaimer: "అధికారిక రసీదు వచ్చింది.",
    noActiveCase: "ఈ నంబర్‌పై ఇంకా రక్ష రిపోర్ట్ లేదు. ఏమి జరిగిందో చెప్పండి.",
  },
  kn: {
    emergencyGreeting: "ರಕ್ಷಾ ತುರ್ತು ಸೇವೆ. ದಯವಿಟ್ಟು ಶಾಂತರಾಗಿರಿ, ನಾವು ತಕ್ಷಣ ಸಹಾಯ ಮಾಡುತ್ತಿದ್ದೇವೆ.",
    askPreferredLanguage: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆರಿಸಿ. ಸಂಖ್ಯೆ ಅಥವಾ ಭಾಷೆಯ ಹೆಸರು ಕಳುಹಿಸಿ.",
    languageAcknowledged: "ಧನ್ಯವಾದಗಳು. ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಸುತ್ತೇವೆ.",
    askNarrative: "ಏನು ಸಂಭವಿಸಿದೆ ಎಂದು ನಿಮ್ಮ ಸ್ವಂತ ಮಾತುಗಳಲ್ಲಿ ತಿಳಿಸಿ.",
    askTransactionDetails: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪಾವತಿ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    askMissingDate: "ಮೊತ್ತ ಮತ್ತು ಬ್ಯಾಂಕ್ ವಿವರ ಸಿಕ್ಕಿದೆ. ಈ ವಹಿವಾಟು ಯಾವಾಗ ನಡೆಯಿತು?",
    askMissingUTR: "12-ಅಂಕಿಯ UTR ಅಥವಾ ರೆಫರೆನ್ಸ್ ಸಂಖ್ಯೆಯನ್ನು ಒದಗಿಸಿ.",
    askMissingAmount: "ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಕಡಿತಗೊಳಿಸಲಾದ ನಿಖರ ಮೊತ್ತ ಎಷ್ಟು?",
    askConflictResolution: "ವಹಿವಾಟಿನ ಮೊತ್ತದಲ್ಲಿ ವ್ಯತ್ಯಾಸವಿದೆ. ಸರಿಯಾದ ಮೊತ್ತವನ್ನು ದೃಢೀಕರಿಸಿ.",
    reportReady: "ನಿಮ್ಮ ತುರ್ತು ವರದಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಮತ್ತು ಸಲ್ಲಿಕೆಗೆ ಸಿದ್ಧವಾಗಿದೆ.",
    reportSubmitted: "ವರದಿಯನ್ನು 1930 / ಸೈಬರ್ ಕ್ರೈಮ್ ಪೋರ್ಟಲ್‌ಗೆ ಸಲ್ಲಿಸಲಾಗಿದೆ.",
    reportAccepted: "ತುರ್ತು ವರದಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ.",
    policeDisclaimer: "ಅಧಿಕೃತ ಸ್ವೀಕೃತಿ ಪಡೆಯಲಾಗಿದೆ.",
    noActiveCase: "ಈ ಸಂಖ್ಯೆಯಲ್ಲಿ ಇನ್ನೂ ರಕ್ಷಾ ವರದಿ ಇಲ್ಲ. ಏನಾಯಿತು ಎಂದು ಹೇಳಿ.",
  },
  bn: {
    emergencyGreeting: "রক্ষা জরুরি সহায়তা সেবা। অনুগ্রহ করে শান্ত থাকুন, আমরা অবিলম্বে আপনাকে সাহায্য করছি।",
    askPreferredLanguage: "অনুগ্রহ করে আপনার ভাষা বেছে নিন। নম্বর বা ভাষার নাম পাঠান।",
    languageAcknowledged: "ধন্যবাদ। আমরা বাংলায় এগোব।",
    askNarrative: "কী ঘটেছে তা আপনার নিজের ভাষায় বর্ণনা করুন।",
    askTransactionDetails: "অনুগ্রহ করে আপনার পেমেন্টের স্ক্রিনশট আপলোড করুন।",
    askMissingDate: "লেনদেনের পরিমাণ এবং ব্যাংকের বিবরণ পাওয়া গেছে। এই লেনদেন কখন হয়েছিল?",
    askMissingUTR: "অনুগ্রহ করে ১২-সংখ্যার UTR বা রেফারেন্স নম্বর দিন।",
    askMissingAmount: "আপনার অ্যাকাউন্ট থেকে কত টাকা কেটে নেওয়া হয়েছে?",
    askConflictResolution: "লেনদেনের পরিমাণে গরমিল আছে। সঠিক পরিমাণ নিশ্চিত করুন।",
    reportReady: "আপনার জরুরি রিপোর্ট যাচাই করা হয়েছে এবং জমা দেওয়ার জন্য প্রস্তুত।",
    reportSubmitted: "রিপোর্ট ১৯৩০ / সাইবার ক্রাইম পোর্টালে পাঠানো হয়েছে।",
    reportAccepted: "জরুরি ফ্রড ফ্রিজ প্যাকেট গৃহীত হয়েছে।",
    policeDisclaimer: "অফিসিয়াল প্রাপ্তি স্বীকারপত্র তৈরি হয়েছে।",
    noActiveCase: "এই নম্বরে এখনও রক্ষা রিপোর্ট নেই। কী হয়েছে বলুন, আমি শুরু করব।",
  },
  mr: {
    emergencyGreeting: "रक्षा आपत्कालीन सेवा. कृपया शांत राहा, आम्ही लगेच मदत करत आहोत.",
    askPreferredLanguage: "कृपया आपली भाषा निवडा. क्रमांक किंवा भाषेचे नाव पाठवा.",
    languageAcknowledged: "धन्यवाद. आम्ही मराठीत पुढे जाऊ.",
    askNarrative: "नेमके काय घडले ते तुमच्या शब्दांत सांगा.",
    askTransactionDetails: "कृपया तुमच्या व्यवहाराचा स्क्रीनशॉट अपलोड करा.",
    askMissingDate: "रक्कम आणि बँकेचा तपशील मिळाला आहे. हा व्यवहार कधी झाला?",
    askMissingUTR: "कृपया १२-अंकी UTR किंवा संदर्भ क्रमांक द्या.",
    askMissingAmount: "खात्यातून किती रक्कम कापली गेली?",
    askConflictResolution: "व्यवहाराच्या रकमेत तफावत आहे. कृपया योग्य रक्कम निश्चित करा.",
    reportReady: "तुमचा आपत्कालीन अहवाल सत्यापित झाला असून पाठवण्यासाठी तयार आहे.",
    reportSubmitted: "अहवाल १९३० / सायबर क्राईम पोर्टलकडे पाठवला गेला आहे.",
    reportAccepted: "आपत्कालीन तक्रार स्वीकारली गेली आहे.",
    policeDisclaimer: "अधिकृत पावती मिळाली आहे.",
    noActiveCase: "या नंबरवर अजून रक्षा अहवाल नाही. काय झाले ते सांगा, मी सुरू करेन.",
  },
};

export function getTranslation(lang: string = "en"): TranslationStrings {
  const normalized = (lang.toLowerCase().slice(0, 2) as SupportedLanguage);
  return TRANSLATIONS[normalized] || TRANSLATIONS.en;
}
