import { LanguageCode } from '../types';

export interface RegionalLanguageMeta {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  script: string;
  regions: string;
  badge: string;
  popular?: boolean;
}

export const INDIAN_REGIONAL_LANGUAGES: RegionalLanguageMeta[] = [
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    script: 'Latin',
    regions: 'National / Pan-India',
    badge: 'EN',
    popular: true
  },
  {
    code: 'hi',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    script: 'Devanagari',
    regions: 'UP, MP, Bihar, Rajasthan, Delhi, Haryana',
    badge: 'HI',
    popular: true
  },
  {
    code: 'bn',
    nativeName: 'বাংলা',
    englishName: 'Bengali',
    script: 'Eastern Nagari',
    regions: 'West Bengal, Tripura, Assam',
    badge: 'WB',
    popular: true
  },
  {
    code: 'te',
    nativeName: 'తెలుగు',
    englishName: 'Telugu',
    script: 'Telugu',
    regions: 'Andhra Pradesh, Telangana',
    badge: 'AP/TG',
    popular: true
  },
  {
    code: 'mr',
    nativeName: 'मराठी',
    englishName: 'Marathi',
    script: 'Devanagari',
    regions: 'Maharashtra, Goa',
    badge: 'MH',
    popular: true
  },
  {
    code: 'ta',
    nativeName: 'தமிழ்',
    englishName: 'Tamil',
    script: 'Tamil',
    regions: 'Tamil Nadu, Puducherry',
    badge: 'TN',
    popular: true
  },
  {
    code: 'ur',
    nativeName: 'اُردُو',
    englishName: 'Urdu',
    script: 'Perso-Arabic',
    regions: 'Telangana, UP, Bihar, J&K, Delhi',
    badge: 'UR',
    popular: true
  },
  {
    code: 'gu',
    nativeName: 'ગુજરાતી',
    englishName: 'Gujarati',
    script: 'Gujarati',
    regions: 'Gujarat, Daman & Diu',
    badge: 'GJ',
    popular: true
  },
  {
    code: 'kn',
    nativeName: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    script: 'Kannada',
    regions: 'Karnataka',
    badge: 'KA',
    popular: true
  },
  {
    code: 'ml',
    nativeName: 'മലയാളം',
    englishName: 'Malayalam',
    script: 'Malayalam',
    regions: 'Kerala, Lakshadweep',
    badge: 'KL',
    popular: true
  },
  {
    code: 'or',
    nativeName: 'ଓଡ଼ିଆ',
    englishName: 'Odia',
    script: 'Odia',
    regions: 'Odisha',
    badge: 'OD',
    popular: true
  },
  {
    code: 'pa',
    nativeName: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    script: 'Gurmukhi',
    regions: 'Punjab, Haryana, Delhi',
    badge: 'PB',
    popular: true
  },
  {
    code: 'as',
    nativeName: 'অসমীয়া',
    englishName: 'Assamese',
    script: 'Assamese',
    regions: 'Assam',
    badge: 'AS'
  },
  {
    code: 'mai',
    nativeName: 'मैथिली',
    englishName: 'Maithili',
    script: 'Devanagari / Mithilakshar',
    regions: 'Bihar, Jharkhand',
    badge: 'BR'
  },
  {
    code: 'sat',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    englishName: 'Santali',
    script: 'Ol Chiki',
    regions: 'Jharkhand, West Bengal, Odisha',
    badge: 'JH'
  },
  {
    code: 'ks',
    nativeName: 'کٲشُر / कॉशुर',
    englishName: 'Kashmiri',
    script: 'Perso-Arabic / Devanagari',
    regions: 'Jammu & Kashmir',
    badge: 'JK'
  },
  {
    code: 'ne',
    nativeName: 'नेपाली',
    englishName: 'Nepali',
    script: 'Devanagari',
    regions: 'Sikkim, West Bengal (Darjeeling)',
    badge: 'SK'
  },
  {
    code: 'kok',
    nativeName: 'कोंकणी',
    englishName: 'Konkani',
    script: 'Devanagari',
    regions: 'Goa, Maharashtra, Karnataka',
    badge: 'GA'
  },
  {
    code: 'sd',
    nativeName: 'سنڌي / सिन्धी',
    englishName: 'Sindhi',
    script: 'Perso-Arabic / Devanagari',
    regions: 'Gujarat, Maharashtra, Rajasthan',
    badge: 'SD'
  },
  {
    code: 'doi',
    nativeName: 'डोगरी',
    englishName: 'Dogri',
    script: 'Devanagari',
    regions: 'Jammu & Kashmir, Himachal Pradesh',
    badge: 'DG'
  },
  {
    code: 'mni',
    nativeName: 'মৈতৈলোন্ / Manipuri',
    englishName: 'Manipuri',
    script: 'Meitei Mayek / Bengali',
    regions: 'Manipur',
    badge: 'MN'
  },
  {
    code: 'brx',
    nativeName: 'बड़ो',
    englishName: 'Bodo',
    script: 'Devanagari',
    regions: 'Assam (Bodoland)',
    badge: 'BD'
  },
  {
    code: 'sa',
    nativeName: 'संस्कृतम्',
    englishName: 'Sanskrit',
    script: 'Devanagari',
    regions: 'Classical Indian Heritage & Research',
    badge: 'SA'
  }
];

export const getLanguageMeta = (code: LanguageCode): RegionalLanguageMeta => {
  return INDIAN_REGIONAL_LANGUAGES.find(l => l.code === code) || INDIAN_REGIONAL_LANGUAGES[0];
};
