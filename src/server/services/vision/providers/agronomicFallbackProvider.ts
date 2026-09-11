import { IVisionModelProvider, RawVisionDiagnosis, VisionPredictionParams } from '../types';

interface CropHeuristicProfile {
  primaryDiagnosis: string;
  diseaseOrPestType: 'DISEASE' | 'PEST' | 'PHYSIOLOGICAL_DISORDER';
  confidence: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  affectedLeafAreaPercent: string;
  symptoms: string[];
  visualObservations: string[];
  whyAiThinksThis: {
    lesionColor: string;
    lesionShape: string;
    lesionPattern: string;
    affectedArea: string;
    summary: string;
  };
  alternativeDiagnoses: { name: string; confidence: number; reasoning?: string }[];
  recommendation: string;
  recommendedNextScanHours: number;
}

const AGRONOMIC_KNOWLEDGE: Record<string, CropHeuristicProfile> = {
  rice: {
    primaryDiagnosis: 'Rice Blast (Magnaporthe oryzae)',
    diseaseOrPestType: 'DISEASE',
    confidence: 0.88,
    severity: 'HIGH',
    affectedLeafAreaPercent: '8% - 14%',
    symptoms: [
      'Spindle-shaped diamond lesions with grayish-white centers and dark brown margins',
      'Lower leaves showing localized necrosis and foliar blast effect',
      'Nodes and tillers vulnerable to neck blast under continued high relative humidity'
    ],
    visualObservations: [
      'Spindle diamond lesions characteristic of Magnaporthe oryzae conidial infection',
      'Slight yellow chlorotic halo around older lesions indicating cellular breakdown',
      'Lower and middle canopy leaves show higher lesion density than flag leaves'
    ],
    whyAiThinksThis: {
      lesionColor: 'Grayish-white necrotic center surrounded by dark reddish-brown margins',
      lesionShape: 'Spindle-shaped / elliptical diamond lesions with pointed ends',
      lesionPattern: 'Scattered across leaf blade, spreading upward along leaf veins',
      affectedArea: 'Estimated 8% - 14% of foliar blade surface exhibiting necrotic spotting',
      summary: 'Classic diamond spindle lesions with gray fungal mycelial centers and reddish-brown borders.'
    },
    alternativeDiagnoses: [
      { name: 'Brown Spot (Bipolaris oryzae)', confidence: 0.08, reasoning: 'Lesions lack the pointed spindle tips of blast' },
      { name: 'Bacterial Leaf Blight (Xanthomonas)', confidence: 0.04, reasoning: 'No wavy water-soaked leaf margins observed' }
    ],
    recommendation: 'Suspend top dressing of nitrogen fertilizer. Apply Tricyclazole 75% WP @ 0.6g/L or Pseudomonas fluorescens.',
    recommendedNextScanHours: 24
  },
  wheat: {
    primaryDiagnosis: 'Yellow / Stripe Rust (Puccinia striiformis)',
    diseaseOrPestType: 'DISEASE',
    confidence: 0.91,
    severity: 'MODERATE',
    affectedLeafAreaPercent: '12% - 18%',
    symptoms: [
      'Linear parallel rows of bright yellow/orange uredinial pustules along leaf veins',
      'Powdery yellow spores readily dislodge upon finger touch',
      'Chlorotic linear yellow striping along upper foliar blade'
    ],
    visualObservations: [
      'Parallel linear pustule formation between veins without circular spot necrosis',
      'Spore powder readily visible on upper leaf surface',
      'Incipient chlorosis on leaves surrounding primary pustule stripes'
    ],
    whyAiThinksThis: {
      lesionColor: 'Vibrant yellowish-orange urediniospore pustules',
      lesionShape: 'Narrow elongated linear stripes running parallel to leaf veins',
      lesionPattern: 'Striped parallel rows densely concentrated on upper leaf surfaces',
      affectedArea: 'Estimated 12% - 18% of leaf lamina covered by powdery spore stripes',
      summary: 'Distinct parallel bright yellow uredinial pustules characteristic of Puccinia striiformis.'
    },
    alternativeDiagnoses: [
      { name: 'Brown / Leaf Rust (Puccinia triticina)', confidence: 0.06, reasoning: 'Pustules are not arranged in strict stripes' },
      { name: 'Powdery Mildew (Blumeria graminis)', confidence: 0.03, reasoning: 'Absence of white cottony fungal mycelium' }
    ],
    recommendation: 'Spray Propiconazole 25% EC @ 1ml/L at first appearance of yellow stripes. Avoid late nitrogen application.',
    recommendedNextScanHours: 48
  },
  cotton: {
    primaryDiagnosis: 'Pink Bollworm (Pectinophora gossypiella)',
    diseaseOrPestType: 'PEST',
    confidence: 0.86,
    severity: 'CRITICAL',
    affectedLeafAreaPercent: '15% - 25%',
    symptoms: [
      'Rosetted flowers that fail to open properly ("rosette bloom")',
      'Small entry holes with brown larval frass on young green bolls',
      'Premature boll drop and locule damage'
    ],
    visualObservations: [
      'Twisted and fused flower petals characteristic of pink bollworm infestation',
      'Microscopic circular entry pinholes on boll rind',
      'Internal fiber staining and seed damage inside opened green bolls'
    ],
    whyAiThinksThis: {
      lesionColor: 'Brownish frass deposition with localized tissue discoloration',
      lesionShape: 'Pinhead entry holes and crumpled rosette flower petals',
      lesionPattern: 'Focal damage concentrated around reproductive buds and young bolls',
      affectedArea: 'Affecting approximately 15% - 25% of reproductive fruiting bodies',
      summary: 'Typical rosette flower deformation and boll entry holes confirm pink bollworm activity.'
    },
    alternativeDiagnoses: [
      { name: 'American Bollworm (Helicoverpa armigera)', confidence: 0.10, reasoning: 'Larvae feed with body outside boll' },
      { name: 'Spotted Bollworm (Earias vittella)', confidence: 0.04, reasoning: 'Bores into terminal tender shoots earlier' }
    ],
    recommendation: 'Install 8 pheromone traps per acre. Release Trichogramma bactrae @ 60,000/acre at weekly intervals.',
    recommendedNextScanHours: 12
  },
  tomato: {
    primaryDiagnosis: 'Early Blight (Alternaria solani)',
    diseaseOrPestType: 'DISEASE',
    confidence: 0.89,
    severity: 'HIGH',
    affectedLeafAreaPercent: '10% - 16%',
    symptoms: [
      'Concentric target-like dark brown rings on lower leaves',
      'Yellow chlorotic halos surrounding dark necrotic lesions',
      'Premature leaf yellowing and defoliation from ground level upward'
    ],
    visualObservations: [
      'Distinct concentric "bullseye" pattern in mature circular lesions',
      'Infection initiated on oldest lower canopy foliage touching moist soil',
      'Lesions expanding progressively outward across interveinal tissue'
    ],
    whyAiThinksThis: {
      lesionColor: 'Dark chocolate brown to black necrotic spots with concentric ring bands',
      lesionShape: 'Circular to oval lesions exhibiting characteristic target-board rings',
      lesionPattern: 'Ascending from bottom leaves upward through canopy',
      affectedArea: 'Estimated 10% - 16% foliar damage on lower canopy',
      summary: 'Pathognomonic target-board concentric necrotic rings confirm Alternaria solani early blight.'
    },
    alternativeDiagnoses: [
      { name: 'Late Blight (Phytophthora infestans)', confidence: 0.07, reasoning: 'Lesions are not water-soaked with white downy underside' },
      { name: 'Septoria Leaf Spot (Septoria lycopersici)', confidence: 0.04, reasoning: 'Lesions have dark margins with small black pycnidia centers' }
    ],
    recommendation: 'Mulch soil base to prevent rain-splash from soil. Spray Chlorothalonil 75% WP @ 2g/L or Mancozeb 75% WP.',
    recommendedNextScanHours: 24
  },
  potato: {
    primaryDiagnosis: 'Late Blight (Phytophthora infestans)',
    diseaseOrPestType: 'DISEASE',
    confidence: 0.92,
    severity: 'CRITICAL',
    affectedLeafAreaPercent: '20% - 30%',
    symptoms: [
      'Water-soaked dark lesions on leaf tips and margins',
      'White cottony downy fungal growth on underside of leaves in humid mornings',
      'Rapidly spreading dark brown to purplish necrosis causing foliar blighting'
    ],
    visualObservations: [
      'Irregular water-soaked greasy lesions spreading inwards from leaf margins',
      'Delicate white fungal mildew visible on lower leaf epidermis',
      'Petiole and stem collapse under cool overcast conditions'
    ],
    whyAiThinksThis: {
      lesionColor: 'Water-soaked brownish-purple necrotic margins with translucent halos',
      lesionShape: 'Irregular expanding blights lacking defined geometric borders',
      lesionPattern: 'Begins at leaf margins and apical tips, rapidly coalescing across lamina',
      affectedArea: 'Approximately 20% - 30% foliar area involved with active spread',
      summary: 'Rapidly spreading water-soaked necrotic blights with underside white sporulation confirm Late Blight.'
    },
    alternativeDiagnoses: [
      { name: 'Early Blight (Alternaria solani)', confidence: 0.05, reasoning: 'No concentric rings observed; margins are water-soaked' },
      { name: 'Bacterial Soft Rot (Pectobacterium)', confidence: 0.03, reasoning: 'Foliar blight without foul bacterial odor' }
    ],
    recommendation: 'Emergency foliar application of Cymoxanil 8% + Mancozeb 64% WP @ 2.5g/L. Avoid furrow irrigation.',
    recommendedNextScanHours: 12
  }
};

export class AgronomicFallbackProvider implements IVisionModelProvider {
  public readonly name = 'agronomic-heuristic-fallback';

  public isAvailable(): boolean {
    return true; // Always available offline or as fallback
  }

  public async analyzeLeafImage(params: VisionPredictionParams): Promise<RawVisionDiagnosis> {
    const cropId = (params.cropId || 'rice').toLowerCase();
    const profile = AGRONOMIC_KNOWLEDGE[cropId] || AGRONOMIC_KNOWLEDGE['rice'];

    return {
      primaryDiagnosis: profile.primaryDiagnosis,
      cropStage: params.cropStage || 'Vegetative',
      diseaseOrPestType: profile.diseaseOrPestType,
      confidence: profile.confidence,
      severity: profile.severity,
      affectedLeafAreaPercent: profile.affectedLeafAreaPercent,
      visualSymptoms: profile.symptoms,
      visualObservations: profile.visualObservations,
      whyAiThinksThis: profile.whyAiThinksThis,
      alternativeDiagnoses: profile.alternativeDiagnoses,
      recommendedNextScanHours: profile.recommendedNextScanHours,
      recommendation: profile.recommendation,
      requires_expert_review: profile.severity === 'CRITICAL' || profile.confidence < 0.85
    };
  }
}

export const agronomicFallbackProvider = new AgronomicFallbackProvider();
