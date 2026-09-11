import { IPMActions, CategorizedAdvisory, AdvisoryItem, ApprovedChemicalTreatment } from '../types';

export interface DiseaseKnowledge {
  id: string;
  cropId: string;
  name: string;
  scientificName: string;
  category: 'FUNGAL' | 'BACTERIAL' | 'VIRAL' | 'PEST' | 'DEFICIENCY';
  commonSymptoms: string[];
  weatherFavored: {
    tempRange: [number, number];
    minHumidity: number;
    rainfallFavored: boolean;
  };
  stagesAffected: string[];
  ipm: IPMActions;
  categorizedAdvisory?: CategorizedAdvisory;
}

export const CROP_DISEASE_KNOWLEDGE_BASE: Record<string, DiseaseKnowledge> = {
  // Rice / Paddy diseases
  'rice-blast': {
    id: 'rice-blast',
    cropId: 'rice',
    name: 'Rice Blast (Leaf & Neck Blast)',
    scientificName: 'Magnaporthe oryzae',
    category: 'FUNGAL',
    commonSymptoms: [
      'Spindle-shaped elliptical lesions with grayish centers and dark brown borders on leaves',
      'Lesions coalesce causing complete drying of foliage (blast effect)',
      'Blackish discoloration and breakdown at the panicle neck node in later stages'
    ],
    weatherFavored: {
      tempRange: [20, 28],
      minHumidity: 85,
      rainfallFavored: true
    },
    stagesAffected: ['Tillering', 'Panicle Initiation', 'Flowering'],
    ipm: {
      prevention: [
        'Treat certified seeds with Carbendazim 2g/kg or Trichoderma viride 4g/kg seed before nursery sowing',
        'Avoid excessive nitrogenous fertilizer application; split urea into 3-4 balanced doses with potash'
      ],
      cultural: [
        'Ensure proper field drainage and prevent continuous deep water stagnation during cool foggy mornings',
        'Burn or compost diseased stubbles after harvest to break fungal spore cycles'
      ],
      mechanical: [
        'Maintain 20cm x 15cm hill spacing to improve sunlight penetration and air aeration between tillers'
      ],
      biological: [
        'Foliar spray of Pseudomonas fluorescens (Pf-1 formulation) @ 2.5 kg/ha in 500 liters of water at 30 and 45 DAT'
      ],
      monitoring: [
        'Inspect nurseries and bottom tillers twice a week for early spindle-shaped lesions',
        'Set up spore traps or monitor morning dew duration exceeding 9 hours'
      ],
      chemical: [
        {
          chemicalName: 'Tricyclazole 75% WP',
          tradeNames: ['Beam', 'Baan', 'Civet'],
          dosage: '0.6 g / liter of water (120 g / acre)',
          waterVolume: '200 liters / acre',
          applicationMethod: 'Foliar spray targeting base and foliage using hollow cone nozzle',
          waitingPeriodDays: 30,
          safetyEquipment: ['Chemical resistant gloves', 'N95 face mask', 'Protective eye goggles'],
          restrictions: 'Do not spray during midday heat or when heavy rain is expected within 4 hours. Maximum 2 sprays per season.',
          cibrcApproved: true
        },
        {
          chemicalName: 'Isoprothiolane 40% EC',
          tradeNames: ['Fuji-one'],
          dosage: '1.5 ml / liter of water (300 ml / acre)',
          waterVolume: '200 liters / acre',
          applicationMethod: 'Foliar spray at 5% leaf damage threshold',
          waitingPeriodDays: 21,
          safetyEquipment: ['Protective overalls', 'Rubber boots', 'Nitrile gloves'],
          restrictions: 'Toxic to aquatic organisms. Prevent spray runoff into fish ponds.',
          cibrcApproved: true
        }
      ]
    }
  },

  'rice-bacterial-blight': {
    id: 'rice-bacterial-blight',
    cropId: 'rice',
    name: 'Bacterial Leaf Blight (BLB)',
    scientificName: 'Xanthomonas oryzae pv. oryzae',
    category: 'BACTERIAL',
    commonSymptoms: [
      'Water-soaked to yellowish-white stripes along leaf margins with wavy borders',
      'Milky bacterial ooze drops visible on young lesions during early morning dew',
      'Leaves roll up, turn grayish-white and wither rapidly (kresek symptom in young plants)'
    ],
    weatherFavored: {
      tempRange: [25, 34],
      minHumidity: 80,
      rainfallFavored: true
    },
    stagesAffected: ['Tillering', 'Heading'],
    ipm: {
      prevention: [
        'Plant resistant cultivars such as IR-64, Ajaya, or Swarna-Sub1 in BLB endemic districts',
        'Hot water seed soaking at 52-54°C for 10 minutes prior to germination'
      ],
      cultural: [
        'Immediately suspend top dressing of nitrogen fertilizer upon initial symptom appearance',
        'Drain standing water from infected fields to prevent pathogen dispersal to adjacent plots'
      ],
      mechanical: [
        'Clip clipped infected leaf tips during weeding and bury in soil pit'
      ],
      biological: [
        'Fresh cow dung slurry spray: Filter 20 kg fresh cow dung in 100 liters water, add 1 liter neem oil, spray on canopy'
      ],
      monitoring: [
        'Examine leaf margins for bacterial exudate droplets using 10x hand lens at dawn'
      ],
      chemical: [
        {
          chemicalName: 'Streptocycline (Streptomycin sulphate 90% + Tetracycline hydrochloride 10%)',
          tradeNames: ['Streptocycline', 'Plantomycin'],
          dosage: '0.1 g / liter of water (20 g / acre) mixed with Copper Oxychloride 50% WP @ 2.5 g / liter',
          waterVolume: '200 liters / acre',
          applicationMethod: 'High volume foliar spray with knapsack sprayer',
          waitingPeriodDays: 15,
          safetyEquipment: ['Rubber gloves', 'Dust mask', 'Face shield'],
          restrictions: 'Do not spray antibiotics more than twice per season to prevent antimicrobial resistance.',
          cibrcApproved: true
        }
      ]
    }
  },

  // Wheat diseases
  'wheat-yellow-rust': {
    id: 'wheat-yellow-rust',
    cropId: 'wheat',
    name: 'Yellow / Stripe Rust',
    scientificName: 'Puccinia striiformis',
    category: 'FUNGAL',
    commonSymptoms: [
      'Parallel linear stripes of small, bright yellow pustules (uredinia) on leaf blades',
      'Yellow powder stains fingers easily when wiped across infected foliage',
      'Severe infection leads to premature leaf desiccation, shrivelled grain, and yield drop'
    ],
    weatherFavored: {
      tempRange: [10, 20],
      minHumidity: 70,
      rainfallFavored: false
    },
    stagesAffected: ['Tillering', 'Jointing', 'Booting', 'Milking'],
    ipm: {
      prevention: [
        'Sow rust-resistant wheat varieties (HD 3226, DBW 187, DBW 222, PBW 725)',
        'Avoid late sowing; complete wheat seeding before November 15 in North-Western plains'
      ],
      cultural: [
        'Eradicate wild alternate host grasses (e.g. Berberis spp.) along canal bunds',
        'Apply recommended dose of potassium to strengthen plant epidermal cell walls'
      ],
      mechanical: [
        'Remove early initial focus patches (yellow foci) in the field with clean uprooting'
      ],
      biological: [
        'Spray bio-fungicide Ampelomyces quisqualis or Trichoderma harzianum @ 5g/liter at onset'
      ],
      monitoring: [
        'Daily scouting of sub-mountainous foothills and border fields in December-February'
      ],
      chemical: [
        {
          chemicalName: 'Propiconazole 25% EC',
          tradeNames: ['Tilt', 'Bumper', 'Radar'],
          dosage: '1.0 ml / liter of water (200 ml in 200 liters water / acre)',
          waterVolume: '200 liters / acre',
          applicationMethod: 'Uniform foliar spray as soon as yellow rust foci are noticed',
          waitingPeriodDays: 30,
          safetyEquipment: ['Vapor respirator', 'Protective gloves', 'Apron'],
          restrictions: 'Strictly avoid spraying during strong wind gusts (>15 km/h) to prevent drift.',
          cibrcApproved: true
        },
        {
          chemicalName: 'Tebuconazole 25.9% m/m EC',
          tradeNames: ['Folicur'],
          dosage: '1.0 ml / liter of water (200 ml / acre)',
          waterVolume: '200 liters / acre',
          applicationMethod: 'Foliar application at appearance of first pustule stripe',
          waitingPeriodDays: 28,
          safetyEquipment: ['Full chemical suit', 'Goggles', 'Nitrile gloves'],
          restrictions: 'Allow 15 days interval between two systemic fungicide sprays.',
          cibrcApproved: true
        }
      ]
    }
  },

  // Cotton pest
  'cotton-pink-bollworm': {
    id: 'cotton-pink-bollworm',
    cropId: 'cotton',
    name: 'Pink Bollworm Infestation',
    scientificName: 'Pectinophora gossypiella',
    category: 'PEST',
    commonSymptoms: [
      'Rosetted flowers with petals tied together in twisting shape (no pollination)',
      'Small entrance bore holes on 20-30 day old green bolls closed by excreta',
      'Discolored lint, damaged seeds and premature boll opening with hollowed locules'
    ],
    weatherFavored: {
      tempRange: [24, 32],
      minHumidity: 65,
      rainfallFavored: false
    },
    stagesAffected: ['Squaring', 'Flowering', 'Boll Formation'],
    ipm: {
      prevention: [
        'Plant non-Bt refuge crops along field perimeter to slow resistance development',
        'Terminated crop cycle by December to avoid overwintering diapausing larvae'
      ],
      cultural: [
        'Collect and destroy shed squares, flowers, and fallen immature bolls twice weekly',
        'Deep summer ploughing to expose diapausing pupae to scorching solar heat and bird predation'
      ],
      mechanical: [
        'Install Gossyplure pheromone traps @ 5-8 traps/acre for monitoring moth emergence',
        'Install 15-20 pheromone traps/acre for mass mating disruption if catch exceeds 8 moths/trap/night'
      ],
      biological: [
        'Release egg parasitoid Trichogrammatoidea bactrae @ 60,000 wasps/acre at weekly intervals',
        'Foliar spray of neem seed kernel extract (NSKE 5%) or Azadirachtin 1500 ppm @ 5 ml/liter'
      ],
      monitoring: [
        'Destructive sampling: Dissect 20 green bolls per acre; spray threshold is 10% rosette flowers or 2 larvae/20 bolls'
      ],
      chemical: [
        {
          chemicalName: 'Chlorantraniliprole 18.5% SC',
          tradeNames: ['Coragen', 'Vesticor'],
          dosage: '0.3 ml / liter of water (60 ml / acre)',
          waterVolume: '200 liters / acre',
          applicationMethod: 'Foliar spray during evening twilight when adult moths are actively ovipositing',
          waitingPeriodDays: 20,
          safetyEquipment: ['Protective gloves', 'Face shield', 'Long sleeve cotton shirt'],
          restrictions: 'Use only when economic threshold (ETL) is breached. Rotate modes of action.',
          cibrcApproved: true
        },
        {
          chemicalName: 'Spinetoram 11.7% SC',
          tradeNames: ['Delegate'],
          dosage: '0.9 ml / liter of water (180 ml / acre)',
          waterVolume: '200 liters / acre',
          applicationMethod: 'Direct targeting on squares and young green bolls',
          waitingPeriodDays: 14,
          safetyEquipment: ['Goggles', 'Nitrile gloves', 'Chemical apron'],
          restrictions: 'Toxic to bees; avoid spraying during active honeybee foraging hours (8 AM - 11 AM).',
          cibrcApproved: true
        }
      ]
    }
  },

  // Potato Early / Late Blight
  'potato-late-blight': {
    id: 'potato-late-blight',
    cropId: 'potato',
    name: 'Potato Late Blight',
    scientificName: 'Phytophthora infestans',
    category: 'FUNGAL',
    commonSymptoms: [
      'Water-soaked dark brown to purplish-black irregular lesions on leaf margins and tips',
      'Delicate white fungal mildew ring visible on underside of leaves under high humidity',
      'Rapid stem rotting with foul smelling decaying haulms in fields within 48-72 hours'
    ],
    weatherFavored: {
      tempRange: [12, 22],
      minHumidity: 90,
      rainfallFavored: true
    },
    stagesAffected: ['Vegetative', 'Tuber Formation', 'Tuber Bulking'],
    ipm: {
      prevention: [
        'Plant certified disease-free seed tubers treated with Mancozeb 75% WP @ 2.5g/kg',
        'High earthing-up (hilling) of 15-20 cm soil ridge to prevent zoospore washdown into tubers'
      ],
      cultural: [
        'Destruction of volunteer potato plants and cull piles before the planting season',
        'Drip irrigation or furrow irrigation instead of overhead sprinklers to minimize leaf wetness'
      ],
      mechanical: [
        'Dehaulming: Cut and remove tops 10-12 days before tuber harvest to prevent tuber contamination'
      ],
      biological: [
        'Trichoderma viride foliar spray @ 5g/liter at first cloudiness forecast'
      ],
      monitoring: [
        'Watch for 48 hours of temperature <20°C and RH >90% (Smith Period criteria for late blight outbreak)'
      ],
      chemical: [
        {
          chemicalName: 'Mancozeb 75% WP (Protective Contact)',
          tradeNames: ['Dithane M-45', 'Indofil M-45'],
          dosage: '2.5 g / liter of water (500 g / acre)',
          waterVolume: '200 liters / acre',
          applicationMethod: 'Prophylactic canopy spray before disease appearance upon favorable overcast weather',
          waitingPeriodDays: 7,
          safetyEquipment: ['Dust mask', 'Rubber gloves', 'Protective eye gear'],
          restrictions: 'Contact fungicide; requires reapplication after heavy rains (>25mm).',
          cibrcApproved: true
        },
        {
          chemicalName: 'Cymoxanil 8% + Mancozeb 64% WP (Curative Systemic)',
          tradeNames: ['Curzate'],
          dosage: '3.0 g / liter of water (600 g / acre)',
          waterVolume: '200 liters / acre',
          applicationMethod: 'Curative spray within 48 hours of first symptom detection',
          waitingPeriodDays: 14,
          safetyEquipment: ['Protective chemical gloves', 'Eye goggles', 'Mask'],
          restrictions: 'Do not exceed 3 applications per crop cycle to prevent fungicide resistance.',
          cibrcApproved: true
        }
      ]
    }
  },

  // Tomato Early Blight
  'tomato-early-blight': {
    id: 'tomato-early-blight',
    cropId: 'tomato',
    name: 'Tomato Early Blight',
    scientificName: 'Alternaria solani',
    category: 'FUNGAL',
    commonSymptoms: [
      'Concentric target-board rings with yellow halos starting from lower mature leaves',
      'Dark sunken leathery lesions at the stem end of fruits',
      'Progressive upward yellowing and defoliation exposing green tomatoes to sunscald'
    ],
    weatherFavored: {
      tempRange: [22, 30],
      minHumidity: 75,
      rainfallFavored: true
    },
    stagesAffected: ['Vegetative', 'Flowering', 'Fruiting'],
    ipm: {
      prevention: [
        'Practice 3-year crop rotation with non-solanaceous crops (e.g. maize, pulses)',
        'Mulching beds with 50 micron UV-stabilized black/silver polythene film'
      ],
      cultural: [
        'Prune lower leaves touching soil (up to 30 cm from ground level) after plant establishment',
        'Stake and trellis tomato vines to keep foliage off wet soil'
      ],
      mechanical: [
        'Carefully pluck yellowing lower spotted leaves and burn outside farm boundaries'
      ],
      biological: [
        'Spray Bacillus subtilis (1x10^9 cfu/g) @ 5g/liter on lower canopy'
      ],
      monitoring: [
        'Scout lower leaves every 3 days during warm humid weeks'
      ],
      chemical: [
        {
          chemicalName: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
          tradeNames: ['Amistar Top'],
          dosage: '1.0 ml / liter of water (200 ml / acre)',
          waterVolume: '200 liters / acre',
          applicationMethod: 'Foliar spray ensuring complete coverage of underleaf surface',
          waitingPeriodDays: 5,
          safetyEquipment: ['Protective mask', 'Safety glasses', 'Rubber gloves'],
          restrictions: 'Toxic to apple trees; ensure zero spray drift towards adjacent orchards.',
          cibrcApproved: true
        }
      ]
    }
  }
};

/**
 * Dedicated Categorized Integrated Pest Management (IPM) Database
 * Organized into:
 * 1. Immediate Action
 * 2. Monitoring (ETL)
 * 3. Preventive / Non-Chemical Measures
 * 4. Approved Treatment Guidance
 * Plus "Today's Action Plan"
 */
export const CATEGORIZED_ADVISORIES: Record<string, CategorizedAdvisory> = {
  'rice-blast': {
    immediateActions: [
      {
        action: 'Rogue and safely destroy initial spindle-lesion infected tillers outside field bunds.',
        why: 'Prevents active aerial conidia from dislodging and colonizing adjacent healthy hill tillers during midday winds.',
        timeOfDay: 'Immediate (Morning)',
        type: 'SANITATION'
      },
      {
        action: 'Suspend nitrogen (urea) top-dressing immediately until lesions dry out.',
        why: 'Excess free nitrogen softens foliar cuticle and succulent leaf tissues, directly accelerating fungal hyphal penetration.',
        timeOfDay: 'Immediate',
        type: 'CULTURAL'
      },
      {
        action: 'Drain standing stagnant ponded water to a shallow depth of 2-3 cm.',
        why: 'Reduces microclimatic relative humidity within the vegetative canopy below the 85% critical sporulation threshold.',
        timeOfDay: 'Afternoon',
        type: 'CULTURAL'
      }
    ],
    monitoringSteps: [
      {
        action: 'Early Morning Canopy Inspection: Inspect nursery beds and lower tillers at sunrise before morning dew evaporates.',
        why: 'Spindle-shaped diamond lesions with gray-white necrotic centers and sporulating margins are clearest under early oblique daylight.',
        timeOfDay: '6:30 - 8:30 AM',
        type: 'MONITORING',
        etlThreshold: 'Economic Threshold (ETL): 2% to 5% leaf area affected in vegetative stage, or 1-2 neck lesions per square meter.'
      },
      {
        action: 'Leaf Wetness Duration Tracking: Monitor dew duration on leaves (aim for <8 consecutive hours).',
        why: 'Magnaporthe oryzae requires a minimum of 6-9 continuous hours of surface free water to form appressoria and penetrate cells.',
        timeOfDay: 'Dawn',
        type: 'MONITORING',
        etlThreshold: 'Alert extension officer if dew persistence exceeds 9 hours across 2 consecutive nights.'
      },
      {
        action: 'Check Pheromone & Light Traps on Field Perimeter for secondary fungal spore vectors.',
        why: 'Insect wounding (e.g. leaf folder or stem borer entrance holes) provides secondary mechanical entry ports for blast mycelia.',
        timeOfDay: 'Morning',
        type: 'MONITORING',
        etlThreshold: 'ETL: >8 moths caught per trap per night.'
      }
    ],
    preventiveNonChemical: [
      {
        action: 'Seed Treatment: Treat certified seeds with bio-agent Trichoderma viride @ 4g/kg seed or Pseudomonas fluorescens @ 10g/kg before sowing.',
        why: 'Biocontrol agents establish defensive endophytic colonies in seedling roots, inducing systemic acquired resistance (SAR) throughout vegetative development.',
        type: 'BIOLOGICAL'
      },
      {
        action: 'Canopy Aeration Spacing: Maintain 20 cm x 15 cm hill spacing with skipping of 1 row after every 8-10 rows (paired row technique).',
        why: 'Facilitates cross-canopy airflow and solar penetration, naturally drying leaf wetness and preventing microclimatic fungal stagnation.',
        type: 'CULTURAL'
      },
      {
        action: 'Potash Topdressing: Apply Muriate of Potash (MOP) @ 20 kg/acre in 2 splits alongside balanced basal phosphate.',
        why: 'Potassium thickens outer silica and epidermal cellulose cell walls, providing mechanical resistance against fungal penetration pegs.',
        type: 'CULTURAL'
      },
      {
        action: 'Bio-Fungicide Spray: Apply foliar spray of Pseudomonas fluorescens (Pf-1 liquid formulation) @ 2.5 ml/liter or Trichoderma harzianum @ 5g/liter.',
        why: 'Antagonistic bacteria produce lipopeptides (iturin, surfactin) that inhibit conidial germination without chemical residues.',
        type: 'BIOLOGICAL'
      },
      {
        action: 'Summer Deep Ploughing and Destruction of Alternate Weed Hosts (Panicum, Echinochloa) on bunds.',
        why: 'Breaks the green-bridge cycle where blast inoculum overwinters during off-season fallow periods.',
        type: 'MECHANICAL'
      }
    ],
    approvedTreatmentGuidance: [
      {
        chemicalName: 'Tricyclazole 75% WP',
        tradeNames: ['Beam', 'Baan', 'Civet', 'Bim'],
        dosage: '0.6 g / liter of water (120 g in 200 liters water / acre)',
        waterVolume: '200 liters / acre (high volume knapsack)',
        timing: 'Late afternoon (4:00 - 6:00 PM) when wind is calm (<8 km/h) and temperature drops below 28°C.',
        why: 'Certified systemic melanin biosynthesis inhibitor (MBI). It specifically blocks the melanization of fungal appressoria, preventing infection pegs from mechanically puncturing the rice leaf cuticle. Evening application prevents photolysis and protects foraging pollinators.',
        waitingPeriodDays: 30,
        safetyEquipment: ['N95 chemical respirator', 'Nitrile protective gloves', 'Chemical splash goggles', 'Full sleeve apron'],
        restrictions: 'Statutory: Do not exceed 2 sprays per season. Rotate with non-MBI chemistries to avoid fungal resistance. Keep livestock away for 14 days.',
        cibrcApproved: true,
        officialAdherenceNote: 'Official CIBRC Mandate: Use only at registered dilution ratio. Never spray against wind direction. Always observe the 30-day pre-harvest interval.'
      },
      {
        chemicalName: 'Isoprothiolane 40% EC',
        tradeNames: ['Fuji-one', 'Kitasin'],
        dosage: '1.5 ml / liter of water (300 ml in 200 liters water / acre)',
        waterVolume: '200 liters / acre',
        timing: 'Apply at 5% leaf damage threshold or appearance of initial spindle lesions.',
        why: 'Dual systemic action that curtails lipid biosynthesis in fungal hyphae and strengthens host tillering vigor. Rapid translaminar uptake ensures protection within 2 hours of spraying.',
        waitingPeriodDays: 21,
        safetyEquipment: ['Protective chemical gloves', 'Eye goggles', 'Rubber boots'],
        restrictions: 'Toxic to aquatic organisms. Strictly avoid spray runoff or equipment washing into irrigation canals or community fish ponds.',
        cibrcApproved: true,
        officialAdherenceNote: 'Ensure calibrated hollow cone nozzle is used for uniform misting.'
      }
    ],
    todaysActionPlan: [
      {
        priority: 'URGENT',
        timeOfDay: 'Morning (Before 10:00 AM)',
        title: 'Canopy Inspection & Infected Tiller Removal',
        instruction: 'Walk along the field transects. Hand-pluck and bag severely spotted tillers. Safely burn or bury in pit away from water source.',
        why: 'Prevents thousands of microscopic spores from taking flight as winds pick up in the afternoon.'
      },
      {
        priority: 'HIGH',
        timeOfDay: 'Midday (11:00 AM - 1:00 PM)',
        title: 'Water Management & Fertilizer Hold',
        instruction: 'Open drainage gates to lower standing water from 7 cm to 2-3 cm. Halt urea top-dressing for Plot #WB-01.',
        why: 'Reduces suffocating canopy humidity and stops leaf tissue from growing overly tender.'
      },
      {
        priority: 'RECOMMENDED',
        timeOfDay: 'Evening (4:30 PM - 6:00 PM)',
        title: 'Prophylactic Bio-Agent or CIBRC Spray Application',
        instruction: 'If lesion area exceeds 2-5% ETL: Prepare knapsack sprayer with Tricyclazole 75% WP @ 0.6g/L or Trichoderma viride @ 5g/L. Spray evenly with PPE.',
        why: 'Provides systemic chemical protection or bio-antagonism when the sun is gentle and winds are calm.'
      },
      {
        priority: 'FIELD_CARE',
        timeOfDay: 'Night / Next Dawn',
        title: 'Pheromone Trap Count & Follow-up Log',
        instruction: 'Record moth catch count in trap and inspect leaf wetness duration tomorrow morning.',
        why: 'Ensures secondary pests do not compromise leaf integrity while fungicides take effect.'
      }
    ]
  },

  'rice-bacterial-blight': {
    immediateActions: [
      {
        action: 'Immediately drain standing field water from infected plots into a closed retention sump.',
        why: 'Xanthomonas bacteria are water-borne and spread exponentially through irrigation water currents.',
        timeOfDay: 'Immediate',
        type: 'CULTURAL'
      },
      {
        action: 'Halt all nitrogenous fertilizer applications (urea/DAP) completely.',
        why: 'Excess nitrogen increases succulent vegetative growth which bacteria colonize in vascular bundles.',
        timeOfDay: 'Immediate',
        type: 'CULTURAL'
      }
    ],
    monitoringSteps: [
      {
        action: 'Early Morning Ooze Test: Cut infected leaf section (2 cm), place in clear glass vial with water.',
        why: 'White turbid bacterial streaming out of vascular bundles confirms bacterial blight vs physiological tip burn.',
        timeOfDay: 'Early Morning',
        type: 'MONITORING',
        etlThreshold: 'ETL: 1-2 active bacterial lesions per hill during tillering.'
      }
    ],
    preventiveNonChemical: [
      {
        action: 'Cow Dung Slurry & Neem Extract Spray: Filter 20 kg fresh cow dung in 100 L water, mix 1 L neem oil, spray thoroughly.',
        why: 'Antagonistic phyllosphere bacteria in fresh cow dung suppress Xanthomonas bacterial multiplication naturally.',
        type: 'BIOLOGICAL'
      },
      {
        action: 'Crop Rotation & Plant Resistant Cultivars: Use IR-64, Ajaya, or Swarna-Sub1.',
        why: 'Carries Xa-4 and Xa-21 resistance genes that prevent systemic bacterial vascular clogging.',
        type: 'CULTURAL'
      }
    ],
    approvedTreatmentGuidance: [
      {
        chemicalName: 'Streptocycline + Copper Oxychloride 50% WP',
        tradeNames: ['Streptocycline', 'Plantomycin', 'Blitox'],
        dosage: 'Streptocycline 0.1 g + COC 2.5 g per liter of water',
        waterVolume: '200 liters / acre',
        timing: 'Late afternoon on dry foliage.',
        why: 'Bacteriostatic antibiotic combined with broad-spectrum protective copper ion barrier.',
        waitingPeriodDays: 15,
        safetyEquipment: ['Rubber gloves', 'Dust respirator', 'Face shield'],
        restrictions: 'Do not spray antibiotics more than twice per season to protect human and animal health from antimicrobial resistance.',
        cibrcApproved: true,
        officialAdherenceNote: 'Follow strict CIBRC label guidance. Use protective eye and skin cover.'
      }
    ],
    todaysActionPlan: [
      {
        priority: 'URGENT',
        timeOfDay: 'Morning',
        title: 'Drain Standing Floodwater',
        instruction: 'Cut irrigation inlets and open drainage outlets to dry the topsoil crust.',
        why: 'Cuts off bacterial swimming dispersal to adjacent healthy rice hills.'
      },
      {
        priority: 'HIGH',
        timeOfDay: 'Afternoon',
        title: 'Apply Cow Dung Slurry or Copper Formulation',
        instruction: 'Spray filtered cow dung slurry + neem oil or CIBRC Copper Oxychloride formulation.',
        why: 'Creates an alkaline, antagonistic surface on foliage that halts bacterial entry through hydathodes.'
      }
    ]
  },

  'wheat-yellow-rust': {
    immediateActions: [
      {
        action: 'Identify and isolate early yellow infection focus patches in the field.',
        why: 'Stripe rust spreads exponentially outward from small initial foci through airborne urediniospores.',
        timeOfDay: 'Immediate',
        type: 'SANITATION'
      }
    ],
    monitoringSteps: [
      {
        action: 'Finger Wipe Test: Rub thumb across yellow leaf stripes to check for bright orange-yellow powder.',
        why: 'Urediniospores transfer easily to skin, confirming active sporulation.',
        timeOfDay: 'Morning',
        type: 'MONITORING',
        etlThreshold: 'ETL: 1 active yellow stripe per 10 plants in sub-mountainous blocks.'
      }
    ],
    preventiveNonChemical: [
      {
        action: 'Sow certified rust-resistant wheat varieties (HD 3226, DBW 187, DBW 222).',
        why: 'Genetic resistance halts fungal haustorial feeding without requiring chemical intervention.',
        type: 'CULTURAL'
      },
      {
        action: 'Apply Potash (MOP) @ 15 kg/acre during crown root initiation.',
        why: 'Strengthens leaf epidermis and accelerates stomatal closure against rust spore germ tubes.',
        type: 'CULTURAL'
      }
    ],
    approvedTreatmentGuidance: [
      {
        chemicalName: 'Propiconazole 25% EC',
        tradeNames: ['Tilt', 'Bumper', 'Radar'],
        dosage: '1.0 ml / liter of water (200 ml / acre in 200 L water)',
        waterVolume: '200 liters / acre',
        timing: 'Immediately when first yellow rust pustule stripes appear in cold humid weather.',
        why: 'Triazole ergosterol biosynthesis inhibitor (DMI) that arrests fungal mycelium inside wheat leaf veins.',
        waitingPeriodDays: 30,
        safetyEquipment: ['Vapor respirator', 'Protective gloves', 'Chemical goggles'],
        restrictions: 'Do not spray when wind velocity exceeds 15 km/h. Only apply once per season unless recommended by KVK.',
        cibrcApproved: true,
        officialAdherenceNote: 'Follow official package of practices for wheat from State Agri University / ICAR.'
      }
    ],
    todaysActionPlan: [
      {
        priority: 'URGENT',
        timeOfDay: 'Morning',
        title: 'Scout Northern & Border Field Margins',
        instruction: 'Check border rows facing prevailing winds for linear yellow stripes.',
        why: 'Yellow rust spores travel from northern foothills with cold winds.'
      },
      {
        priority: 'HIGH',
        timeOfDay: 'Evening',
        title: 'Spot Spray Initial Focus Patches',
        instruction: 'Apply targeted systemic triazole or biocontrol on isolated yellow spots.',
        why: 'Stops the epidemic from engulfing the entire acre.'
      }
    ]
  },

  'cotton-pink-bollworm': {
    immediateActions: [
      {
        action: 'Collect and destroy rosetted flowers and fallen green squares twice a week.',
        why: 'Destroys young larvae trapped inside rosetted blooms before they drill into bolls.',
        timeOfDay: 'Morning',
        type: 'SANITATION'
      }
    ],
    monitoringSteps: [
      {
        action: 'Pheromone Trap Scouting: Check Gossyplure traps daily.',
        why: 'Tracks nocturnal adult moth emergence and peak mating flight windows.',
        timeOfDay: 'Morning',
        type: 'MONITORING',
        etlThreshold: 'ETL: 8 moths per trap per night for 3 consecutive nights, or 10% rosetted flowers.'
      }
    ],
    preventiveNonChemical: [
      {
        action: 'Release Egg Parasitoid: Trichogrammatoidea bactrae @ 60,000 wasps/acre at weekly intervals.',
        why: 'Parasitoid wasps lay eggs inside bollworm eggs, killing the pest before it ever hatches.',
        type: 'BIOLOGICAL'
      },
      {
        action: 'Neem Seed Kernel Extract (NSKE 5%) or Azadirachtin 1500 ppm @ 5 ml/liter foliar spray.',
        why: 'Botanical repellent disrupts oviposition and acts as an anti-feedant for young hatching caterpillars.',
        type: 'BIOLOGICAL'
      }
    ],
    approvedTreatmentGuidance: [
      {
        chemicalName: 'Chlorantraniliprole 18.5% SC',
        tradeNames: ['Coragen', 'Vesticor'],
        dosage: '0.3 ml / liter of water (60 ml / acre in 200 L water)',
        waterVolume: '200 liters / acre',
        timing: 'Evening twilight (5:30 - 7:00 PM) when female moths are actively ovipositing.',
        why: 'Ryanodine receptor modulator that paralyzes insect muscle function specifically upon ingestion.',
        waitingPeriodDays: 20,
        safetyEquipment: ['Nitrile gloves', 'Dust mask', 'Full protective overalls'],
        restrictions: 'Only spray if ETL is exceeded. Rotate chemical modes of action to prevent resistance.',
        cibrcApproved: true,
        officialAdherenceNote: 'CIBRC approved for cotton bollworm. Adhere strictly to recommended water volume.'
      }
    ],
    todaysActionPlan: [
      {
        priority: 'URGENT',
        timeOfDay: 'Morning',
        title: 'Collect Shed Squares & Rosetted Blooms',
        instruction: 'Pick all twisted rosetted flowers and drop into soapy water or burn.',
        why: 'Kills the caterpillars before they bore into the developing green cotton bolls.'
      },
      {
        priority: 'HIGH',
        timeOfDay: 'Late Evening',
        title: 'Install Pheromone Traps / Release Trichogramma',
        instruction: 'Mount delta pheromone traps at 1 foot above the cotton crop canopy.',
        why: 'Attracts male moths and disrupts the reproductive mating cycle.'
      }
    ]
  },

  'potato-late-blight': {
    immediateActions: [
      {
        action: 'Immediately hill up soil around potato ridges by 15-20 cm.',
        why: 'Deep soil coverage prevents sporangia and motile zoospores from being washed into underground tubers during rains.',
        timeOfDay: 'Immediate',
        type: 'CULTURAL'
      }
    ],
    monitoringSteps: [
      {
        action: 'Smith Period Meteorological Alert: Watch for 48h with temp <20°C and RH >90%.',
        why: 'These are the precise biometeorological conditions that trigger late blight pandemics in potato tracts.',
        timeOfDay: 'Twice daily',
        type: 'MONITORING',
        etlThreshold: 'ETL: Single active water-soaked lesion found in the field or in an adjoining village.'
      }
    ],
    preventiveNonChemical: [
      {
        action: 'Use certified disease-free seed tubers treated with Trichoderma viride @ 5g/kg.',
        why: 'Prevents primary seed-borne inoculum from infecting emerging sprouts.',
        type: 'BIOLOGICAL'
      },
      {
        action: 'Dehaulming: Cut and remove potato haulms 10-12 days before harvesting.',
        why: 'Prevents live spores on dying foliage from coming into contact with tubers during lifting.',
        type: 'CULTURAL'
      }
    ],
    approvedTreatmentGuidance: [
      {
        chemicalName: 'Mancozeb 75% WP (Protective Contact)',
        tradeNames: ['Dithane M-45', 'Indofil M-45'],
        dosage: '2.5 g / liter of water (500 g / acre in 200 L water)',
        waterVolume: '200 liters / acre',
        timing: 'Prophylactically prior to forecasted fog or overcast rain periods.',
        why: 'Multi-site contact dithiocarbamate fungicide that halts spore germination on leaf surfaces.',
        waitingPeriodDays: 7,
        safetyEquipment: ['Dust mask', 'Rubber gloves', 'Protective eye goggles'],
        restrictions: 'Contact action only; re-spray required if rain exceeds 25 mm within 24 hours.',
        cibrcApproved: true,
        officialAdherenceNote: 'CIBRC registered protective fungicide for solanaceous crops.'
      }
    ],
    todaysActionPlan: [
      {
        priority: 'URGENT',
        timeOfDay: 'Morning',
        title: 'Ridge Hilling & Soil Earthing Up',
        instruction: 'Draw earth around base of potato plants to ensure minimum 15 cm soil depth over tubers.',
        why: 'Protects the valuable potato crop below ground from fungal zoospore wash.'
      },
      {
        priority: 'HIGH',
        timeOfDay: 'Afternoon',
        title: 'Prophylactic Foliar Shield Spray',
        instruction: 'Apply contact fungicide Mancozeb 75% WP @ 2.5g/L or bio-control Trichoderma.',
        why: 'Builds a protective fungicide film on leaves ahead of nightly fog and dew.'
      }
    ]
  },

  'tomato-early-blight': {
    immediateActions: [
      {
        action: 'Prune and destroy lower spotted leaves touching the soil (bottom 30 cm).',
        why: 'Removes primary soil-splash inoculum and improves air movement around lower plant stems.',
        timeOfDay: 'Immediate',
        type: 'SANITATION'
      }
    ],
    monitoringSteps: [
      {
        action: 'Scout lower mature leaves for concentric target-board rings every 3 days.',
        why: 'Alternaria solani starts on senescing lower leaves before moving up to developing tomatoes.',
        timeOfDay: 'Morning',
        type: 'MONITORING',
        etlThreshold: 'ETL: 5% lower foliage covered with target-board rings.'
      }
    ],
    preventiveNonChemical: [
      {
        action: 'Stake and trellis tomato plants to keep foliage off wet soil.',
        why: 'Reduces surface leaf wetness by 60% and stops rain-splash spore transmission.',
        type: 'CULTURAL'
      },
      {
        action: 'Mulch crop beds with straw or UV-stabilized polythene film.',
        why: 'Creates a physical barrier preventing fungal conidia in soil from splashing up onto leaves.',
        type: 'CULTURAL'
      }
    ],
    approvedTreatmentGuidance: [
      {
        chemicalName: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
        tradeNames: ['Amistar Top'],
        dosage: '1.0 ml / liter of water (200 ml / acre)',
        waterVolume: '200 liters / acre',
        timing: 'Late afternoon on dry leaf surfaces.',
        why: 'Dual action: Azoxystrobin inhibits mitochondrial respiration while Difenoconazole stops sterol demethylation.',
        waitingPeriodDays: 5,
        safetyEquipment: ['Protective mask', 'Safety glasses', 'Rubber gloves'],
        restrictions: 'Toxic to apple trees; ensure zero spray drift towards adjoining fruit orchards.',
        cibrcApproved: true,
        officialAdherenceNote: 'CIBRC registered systemic fungicide for tomato blights.'
      }
    ],
    todaysActionPlan: [
      {
        priority: 'URGENT',
        timeOfDay: 'Morning',
        title: 'Bottom Pruning & Clean Removal',
        instruction: 'Clip yellowing bottom leaves touching soil with clean shears; bury away from field.',
        why: 'Stops rain-splashing fungi from climbing into the productive tomato fruit zone.'
      },
      {
        priority: 'HIGH',
        timeOfDay: 'Evening',
        title: 'Targeted Canopy Spray',
        instruction: 'Spray underside of foliage with bio-fungicide or CIBRC-approved solution.',
        why: 'Provides systemic protection when leaves are dry and wind is calm.'
      }
    ]
  }
};

/**
 * Returns complete categorized advisory with practical IPM priorities,
 * clear "Why this action is recommended" explanations, and Today's Action Plan.
 */
export function getCategorizedAdvisory(keyOrName: string): CategorizedAdvisory {
  const normalized = keyOrName.toLowerCase().replace(/[^a-z0-9-]/g, '-').trim();
  
  // Direct match in categorized database
  if (CATEGORIZED_ADVISORIES[normalized]) {
    return CATEGORIZED_ADVISORIES[normalized];
  }

  // Partial match search
  for (const [k, v] of Object.entries(CATEGORIZED_ADVISORIES)) {
    if (normalized.includes(k) || k.includes(normalized)) {
      return v;
    }
  }

  // Fallback match in CROP_DISEASE_KNOWLEDGE_BASE
  const kbEntry = CROP_DISEASE_KNOWLEDGE_BASE[normalized] || CROP_DISEASE_KNOWLEDGE_BASE['rice-blast'];
  
  return {
    immediateActions: [
      {
        action: 'Rogue and safely bury severely diseased plant parts outside cultivation plot.',
        why: 'Prevents active fungal or bacterial spores from dispersing with wind and field workers.',
        timeOfDay: 'Immediate (Morning)',
        type: 'SANITATION'
      },
      {
        action: 'Regulate field water and hold excess nitrogen topdressing until new foliage emerges healthy.',
        why: 'High nitrogen and water stagnation soften plant cell walls and favor pathogen multiplication.',
        timeOfDay: 'Afternoon',
        type: 'CULTURAL'
      }
    ],
    monitoringSteps: [
      {
        action: 'Conduct morning field scouting twice a week across 20 randomly selected plants.',
        why: 'Detects initial focal lesions before symptoms escalate to economic injury level.',
        timeOfDay: 'Early Morning (7:00 - 9:00 AM)',
        type: 'MONITORING',
        etlThreshold: 'ETL: 5% leaf damage or breach of trap threshold limits.'
      }
    ],
    preventiveNonChemical: [
      {
        action: 'Seed & Soil Treatment: Inoculate seeds/soil with Trichoderma viride @ 5g/kg or Pseudomonas fluorescens.',
        why: 'Establishes competitive beneficial microflora around root and crown zones.',
        type: 'BIOLOGICAL'
      },
      {
        action: 'Crop Spacing and Field Hygiene: Maintain recommended plant spacing and eradicate alternate weed hosts.',
        why: 'Enhances canopy ventilation and sunlight exposure, lowering leaf wetness duration.',
        type: 'CULTURAL'
      },
      {
        action: 'Foliar spray of Neem Seed Kernel Extract (NSKE 5%) or cold-pressed neem oil (1500 ppm) @ 5ml/L.',
        why: 'Botanical bio-rational that repels insect vectors and inhibits spore germination.',
        type: 'BIOLOGICAL'
      }
    ],
    approvedTreatmentGuidance: (kbEntry.ipm.chemical || []).map(c => ({
      chemicalName: c.chemicalName,
      tradeNames: c.tradeNames,
      dosage: c.dosage,
      waterVolume: c.waterVolume,
      applicationMethod: c.applicationMethod,
      timing: 'Late afternoon (4:00 - 6:00 PM) when wind is calm (<8 km/h).',
      why: 'CIBRC-registered targeted active ingredient for this crop pest/pathogen. Apply only after non-chemical and cultural thresholds are breached.',
      waitingPeriodDays: c.waitingPeriodDays,
      safetyEquipment: c.safetyEquipment,
      restrictions: c.restrictions,
      cibrcApproved: c.cibrcApproved,
      officialAdherenceNote: 'Official Advisory: Farmers should follow official crop-specific recommendations, approved products, recommended dose, timing, and application instructions.'
    })),
    todaysActionPlan: [
      {
        priority: 'URGENT',
        timeOfDay: 'Morning (Before 10:00 AM)',
        title: 'Canopy Inspection & Infected Tissue Removal',
        instruction: 'Carefully inspect lower canopy leaves. Remove and bury necrotic parts.',
        why: 'Stops pathogen propagation before afternoon winds take effect.'
      },
      {
        priority: 'HIGH',
        timeOfDay: 'Midday',
        title: 'Microclimate & Irrigation Adjustment',
        instruction: 'Ensure adequate drainage and temporarily withhold urea application.',
        why: 'Reduces excessive humidity that feeds foliar pathogens.'
      },
      {
        priority: 'RECOMMENDED',
        timeOfDay: 'Evening (4:30 - 6:00 PM)',
        title: 'Targeted Bio-Agent or Certified Treatment',
        instruction: 'Apply bio-fungicide or CIBRC-registered chemical only if symptoms exceed threshold.',
        why: 'Ensures safe, calibrated control without unnecessary pesticide exposure.'
      }
    ]
  };
}
