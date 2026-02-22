export type CoverageLevel = 'full' | 'partial' | 'related';
export type ConfidenceLevel = 'definite' | 'likely' | 'possible';

export interface SeedItem {
  item_id: string;
  title?: string;
  text: string;
  parent?: string | null;
  tags?: string[];
  metadata?: Record<string, unknown>;
  related?: Array<{
    type: 'references' | 'referenced_by' | 'see_also' | 'implements';
    source: string;
    item_id: string;
    title?: string;
  }>;
}

export interface SeedDefinition {
  term: string;
  definition: string;
  defining_item?: string | null;
  metadata?: Record<string, unknown>;
}

export interface SeedMapping {
  framework: string;
  control_id: string;
  control_name?: string | null;
  target_source: string;
  target_items: string[];
  coverage: CoverageLevel;
  notes?: string | null;
  country?: string | null;
  jurisdiction?: string | null;
}

export interface SeedApplicabilityRule {
  sector: string;
  subsector?: string | null;
  applies: 0 | 1;
  confidence: ConfidenceLevel;
  basis_item?: string | null;
  conditions?: Record<string, unknown> | null;
  notes?: string | null;
}

export interface SeedRegistry {
  official_id?: string | null;
  official_version?: string | null;
  last_fetched?: string | null;
  last_updated?: string | null;
  last_checked?: string | null;
  update_frequency?: string | null;
  items_expected?: number | null;
  items_parsed?: number | null;
  quality_status?: 'complete' | 'review' | 'incomplete' | null;
  notes?: string | null;
}

export interface SeedSource {
  id: string;
  full_name: string;
  identifier?: string | null;
  effective_date?: string | null;
  source_url?: string | null;
  authority?: string | null;
  jurisdiction?: string | null;
  instrument_type?: string | null;
  category?: string | null;
  items: SeedItem[];
  definitions?: SeedDefinition[];
  mappings?: SeedMapping[];
  applicability_rules?: SeedApplicabilityRule[];
  source_registry?: SeedRegistry;
}

const GENERATED_AT = '2026-02-22T00:00:00Z';

export const SEED_SNAPSHOTS: SeedSource[] = [
  {
    id: 'WHO_CONSTITUTION',
    full_name: 'Constitution of the World Health Organization',
    identifier: 'WHO-CONSTITUTION',
    effective_date: '1948-04-07',
    source_url: 'https://www.who.int/about/governance/constitution',
    authority: 'World Health Organization',
    jurisdiction: 'INTL',
    instrument_type: 'treaty',
    category: 'global-health-governance',
    items: [
      {
        item_id: 'PREAMBLE',
        title: 'Preamble',
        parent: 'Preamble',
        tags: ['who', 'health-rights', 'governance'],
        text: 'Health is a state of complete physical, mental and social well-being and not merely the absence of disease or infirmity. The enjoyment of the highest attainable standard of health is one of the fundamental rights of every human being.',
        metadata: {
          official_url: 'https://www.who.int/about/governance/constitution',
          paragraph_type: 'preamble',
        },
      },
      {
        item_id: 'ART_1',
        title: 'Article 1 - Objective',
        parent: 'Chapter I',
        tags: ['objective', 'public-health'],
        text: 'The objective of the World Health Organization shall be the attainment by all peoples of the highest possible level of health.',
      },
      {
        item_id: 'ART_2',
        title: 'Article 2 - Functions',
        parent: 'Chapter II',
        tags: ['functions', 'coordination'],
        text: 'To achieve its objective, the Organization shall act as the directing and coordinating authority on international health work and assist governments, upon request, in strengthening health services.',
      },
      {
        item_id: 'ART_21',
        title: 'Article 21 - Power to adopt regulations',
        parent: 'Chapter XIV',
        tags: ['regulations', 'normative-powers'],
        text: 'The Health Assembly shall have authority to adopt regulations concerning sanitary and quarantine requirements and standards related to diagnostic procedures for international use.',
      },
      {
        item_id: 'ART_23',
        title: 'Article 23 - Recommendations',
        parent: 'Chapter XIV',
        tags: ['recommendations', 'guidance'],
        text: 'The Health Assembly shall have authority to make recommendations to members with respect to any matter within the competence of the Organization.',
      },
    ],
    definitions: [
      {
        term: 'health',
        definition: 'A state of complete physical, mental and social well-being and not merely the absence of disease or infirmity.',
        defining_item: 'PREAMBLE',
      },
      {
        term: 'recommendations',
        definition: 'Non-binding instruments that the Health Assembly may issue to member states within the competence of the WHO.',
        defining_item: 'ART_23',
      },
    ],
    applicability_rules: [
      {
        sector: 'healthcare',
        subsector: null,
        applies: 1,
        confidence: 'definite',
        basis_item: 'ART_1',
        conditions: null,
        notes: 'Sets constitutional objective for global health cooperation.',
      },
      {
        sector: 'medical-devices',
        subsector: null,
        applies: 1,
        confidence: 'likely',
        basis_item: 'ART_2',
        conditions: {
          relies_on_member_state_implementation: true,
        },
        notes: 'Applies through WHO coordination and standards processes.',
      },
    ],
    source_registry: {
      official_id: 'WHO-CONSTITUTION',
      official_version: 'Current consolidated text',
      last_fetched: GENERATED_AT,
      last_updated: '2024-01-01',
      last_checked: '2026-02-21',
      update_frequency: 'on_change',
      items_expected: 5,
      items_parsed: 5,
      quality_status: 'complete',
      notes: 'Curated excerpt set for baseline MCP responses.',
    },
  },
  {
    id: 'WHO_IHR_2005',
    full_name: 'International Health Regulations (2005)',
    identifier: 'IHR-2005',
    effective_date: '2007-06-15',
    source_url: 'https://www.who.int/health-topics/international-health-regulations',
    authority: 'World Health Organization',
    jurisdiction: 'INTL',
    instrument_type: 'regulation',
    category: 'health-emergency',
    items: [
      {
        item_id: 'ART_2',
        title: 'Article 2 - Purpose and scope',
        parent: 'Part I',
        tags: ['surveillance', 'response', 'public-health-emergency'],
        text: 'The purpose and scope of these Regulations are to prevent, protect against, control and provide a public health response to the international spread of disease in ways that avoid unnecessary interference with international traffic and trade.',
      },
      {
        item_id: 'ART_6',
        title: 'Article 6 - Notification',
        parent: 'Part II',
        tags: ['notification', 'timelines', 'who-reporting'],
        text: 'Each State Party shall notify WHO of all events which may constitute a public health emergency of international concern within its territory within 24 hours of assessment.',
      },
      {
        item_id: 'ART_13',
        title: 'Article 13 - Public health response',
        parent: 'Part III',
        tags: ['core-capacities', 'response'],
        text: 'Each State Party shall develop, strengthen and maintain the capacity to respond promptly and effectively to public health risks and events.',
      },
      {
        item_id: 'ART_44',
        title: 'Article 44 - Collaboration and assistance',
        parent: 'Part IX',
        tags: ['international-cooperation', 'assistance'],
        text: 'States Parties shall undertake to collaborate with each other, to the extent possible, in detecting and assessing events and responding to requests for technical cooperation.',
      },
      {
        item_id: 'ANNEX_2',
        title: 'Annex 2 - Decision instrument for assessment and notification',
        parent: 'Annexes',
        tags: ['decision-instrument', 'risk-assessment'],
        text: 'States Parties shall assess events occurring within their territory by using the decision instrument in Annex 2 to determine whether an event must be notified to WHO.',
      },
    ],
    definitions: [
      {
        term: 'public health emergency of international concern',
        definition: 'An extraordinary event determined to constitute a public health risk to other States through international spread of disease and to potentially require a coordinated international response.',
        defining_item: 'ART_2',
      },
      {
        term: 'health measure',
        definition: 'Procedures applied to prevent the spread of disease or contamination and which do not include law enforcement or security measures.',
        defining_item: 'ART_2',
      },
    ],
    mappings: [
      {
        framework: 'US_CDC_REPORTING',
        control_id: '42-CFR-71',
        control_name: 'Communicable disease reporting and control',
        target_source: 'WHO_IHR_2005',
        target_items: ['ART_6', 'ANNEX_2'],
        coverage: 'partial',
        country: 'US',
        jurisdiction: 'national',
        notes: 'US reporting obligations align with notification and risk assessment logic.',
      },
      {
        framework: 'EU_CROSS_BORDER_HEALTH',
        control_id: 'EU-2022-2371',
        control_name: 'Serious cross-border threats to health',
        target_source: 'WHO_IHR_2005',
        target_items: ['ART_6', 'ART_13', 'ART_44'],
        coverage: 'related',
        country: 'EU',
        jurisdiction: 'regional',
        notes: 'EU regulation operationalizes IHR collaboration and preparedness duties.',
      },
    ],
    applicability_rules: [
      {
        sector: 'healthcare',
        subsector: 'public-health-authority',
        applies: 1,
        confidence: 'definite',
        basis_item: 'ART_6',
        conditions: {
          event_meets_annex_2_threshold: true,
        },
        notes: 'National focal points must notify WHO for qualifying events.',
      },
      {
        sector: 'medical-devices',
        subsector: null,
        applies: 1,
        confidence: 'possible',
        basis_item: 'ART_13',
        conditions: {
          product_related_health_event: true,
        },
        notes: 'May apply when device incidents contribute to public health events.',
      },
    ],
    source_registry: {
      official_id: 'IHR-2005',
      official_version: 'Third edition',
      last_fetched: GENERATED_AT,
      last_updated: '2024-06-01',
      last_checked: '2026-02-20',
      update_frequency: 'on_change',
      items_expected: 5,
      items_parsed: 5,
      quality_status: 'complete',
      notes: 'Focused article subset for emergency response queries.',
    },
  },
  {
    id: 'WHO_FCTC',
    full_name: 'WHO Framework Convention on Tobacco Control',
    identifier: 'WHO-FCTC',
    effective_date: '2005-02-27',
    source_url: 'https://fctc.who.int',
    authority: 'World Health Organization',
    jurisdiction: 'INTL',
    instrument_type: 'treaty',
    category: 'tobacco-control',
    items: [
      {
        item_id: 'ART_5',
        title: 'Article 5 - General obligations',
        parent: 'Part III',
        tags: ['obligations', 'policy'],
        text: 'Parties shall develop and implement comprehensive multisectoral national tobacco control strategies, plans and programmes.',
      },
      {
        item_id: 'ART_8',
        title: 'Article 8 - Protection from exposure to tobacco smoke',
        parent: 'Part III',
        tags: ['smoke-free', 'public-health-protection'],
        text: 'Parties recognize that scientific evidence has unequivocally established that exposure to tobacco smoke causes death, disease and disability and shall adopt effective measures to protect from exposure.',
      },
      {
        item_id: 'ART_11',
        title: 'Article 11 - Packaging and labelling of tobacco products',
        parent: 'Part III',
        tags: ['labeling', 'consumer-information'],
        text: 'Each Party shall adopt and implement effective measures to ensure tobacco product packaging carries health warnings and does not promote a tobacco product by false means.',
      },
      {
        item_id: 'ART_13',
        title: 'Article 13 - Tobacco advertising, promotion and sponsorship',
        parent: 'Part III',
        tags: ['advertising', 'promotion'],
        text: 'Parties recognize that a comprehensive ban on advertising, promotion and sponsorship would reduce consumption of tobacco products and shall undertake such bans in accordance with constitutional principles.',
      },
      {
        item_id: 'ART_20',
        title: 'Article 20 - Research, surveillance and exchange of information',
        parent: 'Part IV',
        tags: ['surveillance', 'research'],
        text: 'Parties shall establish progressive national systems for epidemiological surveillance of tobacco consumption and related social, economic and health indicators.',
      },
    ],
    definitions: [
      {
        term: 'tobacco control',
        definition: 'A range of supply, demand and harm reduction strategies that aim to improve the health of a population by eliminating or reducing tobacco use and exposure to tobacco smoke.',
        defining_item: 'ART_5',
      },
    ],
    applicability_rules: [
      {
        sector: 'healthcare',
        subsector: 'public-health-policy',
        applies: 1,
        confidence: 'definite',
        basis_item: 'ART_5',
        conditions: null,
        notes: 'Establishes whole-of-government policy duty on Parties.',
      },
      {
        sector: 'medical-devices',
        subsector: null,
        applies: 0,
        confidence: 'likely',
        basis_item: 'ART_8',
        conditions: null,
        notes: 'Generally outside direct medical device compliance scope.',
      },
    ],
    source_registry: {
      official_id: 'WHO-FCTC',
      official_version: 'Convention text and implementation guidance',
      last_fetched: GENERATED_AT,
      last_updated: '2023-11-15',
      last_checked: '2025-12-15',
      update_frequency: 'on_change',
      items_expected: 5,
      items_parsed: 5,
      quality_status: 'review',
      notes: 'Snapshot is stable but implementation guidance should be refreshed quarterly.',
    },
  },
  {
    id: 'ICH_GUIDELINES',
    full_name: 'ICH Harmonised Guidelines (Q, S, E, M series)',
    identifier: 'ICH-GUIDELINES',
    effective_date: null,
    source_url: 'https://www.ich.org/page/ich-guidelines',
    authority: 'International Council for Harmonisation',
    jurisdiction: 'INTL',
    instrument_type: 'guideline',
    category: 'pharmaceutical-quality',
    items: [
      {
        item_id: 'Q9(R1)',
        title: 'Quality Risk Management',
        parent: 'Quality Guidelines',
        tags: ['risk-management', 'quality-system', 'medical-device', 'pharma'],
        text: 'ICH Q9(R1) describes a systematic process for the assessment, control, communication and review of risks to product quality across the lifecycle.',
      },
      {
        item_id: 'Q10',
        title: 'Pharmaceutical Quality System',
        parent: 'Quality Guidelines',
        tags: ['quality-system', 'management-responsibility'],
        text: 'ICH Q10 provides a model for an effective pharmaceutical quality system that encourages continual improvement and management oversight.',
      },
      {
        item_id: 'Q12',
        title: 'Technical and Regulatory Considerations for Pharmaceutical Product Lifecycle Management',
        parent: 'Quality Guidelines',
        tags: ['lifecycle-management', 'change-management'],
        text: 'ICH Q12 supports predictable and efficient management of post-approval chemistry, manufacturing and controls changes.',
      },
      {
        item_id: 'E6(R3)',
        title: 'Good Clinical Practice',
        parent: 'Efficacy Guidelines',
        tags: ['clinical-trials', 'data-integrity', 'ethics'],
        text: 'ICH E6(R3) sets an international ethical and scientific quality standard for designing, conducting, recording and reporting trials that involve human participants.',
      },
      {
        item_id: 'M4Q',
        title: 'Common Technical Document - Quality',
        parent: 'Multidisciplinary Guidelines',
        tags: ['ctd', 'regulatory-submission'],
        text: 'ICH M4Q specifies the format and organization of quality information in the Common Technical Document for regulatory submissions.',
      },
    ],
    definitions: [
      {
        term: 'quality risk management',
        definition: 'A systematic process for the assessment, control, communication and review of risks to the quality of medicinal products.',
        defining_item: 'Q9(R1)',
      },
      {
        term: 'pharmaceutical quality system',
        definition: 'A management system for directing and controlling a pharmaceutical company with regard to quality.',
        defining_item: 'Q10',
      },
      {
        term: 'good clinical practice',
        definition: 'An international ethical and scientific quality standard for designing, conducting, recording and reporting human clinical trials.',
        defining_item: 'E6(R3)',
      },
    ],
    mappings: [
      {
        framework: 'US_FDA_21CFR820',
        control_id: '820.30',
        control_name: 'Design controls',
        target_source: 'ICH_GUIDELINES',
        target_items: ['Q9(R1)', 'Q10'],
        coverage: 'related',
        country: 'US',
        jurisdiction: 'national',
        notes: 'Risk and quality management principles support design control compliance.',
      },
      {
        framework: 'EU_MDR_2017_745',
        control_id: 'ANNEX_IX',
        control_name: 'Conformity assessment based on quality management systems',
        target_source: 'ICH_GUIDELINES',
        target_items: ['Q10', 'Q12'],
        coverage: 'partial',
        country: 'EU',
        jurisdiction: 'regional',
        notes: 'Lifecycle and quality system principles are reusable in QMS evidence packages.',
      },
    ],
    applicability_rules: [
      {
        sector: 'pharmaceuticals',
        subsector: 'manufacturing',
        applies: 1,
        confidence: 'definite',
        basis_item: 'Q10',
        conditions: null,
        notes: 'Core quality system expectation for ICH-participating regions.',
      },
      {
        sector: 'medical-devices',
        subsector: 'software',
        applies: 1,
        confidence: 'possible',
        basis_item: 'Q9(R1)',
        conditions: {
          manufacturer_uses_harmonized_quality_framework: true,
        },
        notes: 'Risk-management concepts often reused for software-enabled devices.',
      },
    ],
    source_registry: {
      official_id: 'ICH-GUIDELINES',
      official_version: 'Q9(R1), Q10, Q12, E6(R3), M4Q',
      last_fetched: GENERATED_AT,
      last_updated: '2025-09-01',
      last_checked: '2026-02-19',
      update_frequency: 'on_change',
      items_expected: 5,
      items_parsed: 5,
      quality_status: 'complete',
      notes: 'Selected high-impact guidelines for initial MCP baseline.',
    },
  },
  {
    id: 'IMDRF_N_SERIES',
    full_name: 'IMDRF N-series Medical Device Guidance',
    identifier: 'IMDRF-N',
    effective_date: null,
    source_url: 'https://www.imdrf.org/documents',
    authority: 'International Medical Device Regulators Forum',
    jurisdiction: 'INTL',
    instrument_type: 'guideline',
    category: 'medical-devices',
    items: [
      {
        item_id: 'N12',
        title: 'Essential Principles of Safety and Performance of Medical Devices',
        parent: 'Core Principles',
        tags: ['medical-device', 'safety', 'performance'],
        text: 'IMDRF N12 describes essential principles that medical devices should meet to ensure they are safe and perform as intended throughout their lifecycle.',
      },
      {
        item_id: 'N23',
        title: 'Software as a Medical Device: Key Definitions',
        parent: 'SaMD',
        tags: ['medical-device', 'software', 'definitions'],
        text: 'IMDRF N23 provides a common set of definitions and foundational concepts for Software as a Medical Device regulation.',
      },
      {
        item_id: 'N47',
        title: 'Principles of Clinical Evaluation',
        parent: 'Clinical Evaluation',
        tags: ['clinical-evaluation', 'medical-device', 'evidence'],
        text: 'IMDRF N47 outlines principles and processes for clinical evaluation of medical devices to support safety and performance claims.',
      },
      {
        item_id: 'N51',
        title: 'Personalized Medical Devices',
        parent: 'Emerging Topics',
        tags: ['personalized-devices', 'manufacturing', 'medical-device'],
        text: 'IMDRF N51 addresses characterization and regulatory considerations for personalized medical devices including patient-matched products.',
      },
      {
        item_id: 'N63',
        title: 'Principles and Practices for Medical Device Cybersecurity',
        parent: 'Cybersecurity',
        tags: ['cybersecurity', 'medical-device', 'post-market'],
        text: 'IMDRF N63 provides principles for integrating cybersecurity across the total product lifecycle, including vulnerability management and coordinated disclosure.',
      },
    ],
    definitions: [
      {
        term: 'software as a medical device',
        definition: 'Software intended to be used for one or more medical purposes that perform these purposes without being part of a hardware medical device.',
        defining_item: 'N23',
      },
      {
        term: 'clinical evaluation',
        definition: 'A systematic and planned process to continuously generate, collect, analyze and assess the clinical data pertaining to a medical device.',
        defining_item: 'N47',
      },
    ],
    mappings: [
      {
        framework: 'US_FDA_21CFR820',
        control_id: '820.100',
        control_name: 'Corrective and preventive action',
        target_source: 'IMDRF_N_SERIES',
        target_items: ['N63'],
        coverage: 'partial',
        country: 'US',
        jurisdiction: 'national',
        notes: 'Cybersecurity vulnerability handling supports CAPA expectations.',
      },
      {
        framework: 'EU_MDR_2017_745',
        control_id: 'ANNEX_I_CHAPTER_II',
        control_name: 'Requirements regarding design and manufacture',
        target_source: 'IMDRF_N_SERIES',
        target_items: ['N12', 'N47', 'N63'],
        coverage: 'full',
        country: 'EU',
        jurisdiction: 'regional',
        notes: 'Essential principles and lifecycle cybersecurity align strongly with MDR GSPRs.',
      },
      {
        framework: 'JP_PMDA_QMS',
        control_id: 'JIS-T14971-ALIGNMENT',
        control_name: 'Risk management alignment',
        target_source: 'IMDRF_N_SERIES',
        target_items: ['N12', 'N23'],
        coverage: 'related',
        country: 'JP',
        jurisdiction: 'national',
        notes: 'Common language and risk constructs support PMDA review packages.',
      },
    ],
    applicability_rules: [
      {
        sector: 'medical-devices',
        subsector: 'software',
        applies: 1,
        confidence: 'definite',
        basis_item: 'N23',
        conditions: {
          product_is_software_only: true,
        },
        notes: 'Core SaMD definitions and scope classification apply.',
      },
      {
        sector: 'medical-devices',
        subsector: 'cybersecurity',
        applies: 1,
        confidence: 'definite',
        basis_item: 'N63',
        conditions: null,
        notes: 'Lifecycle cybersecurity governance is expected for connected devices.',
      },
    ],
    source_registry: {
      official_id: 'IMDRF-N',
      official_version: 'N12/N23/N47/N51/N63 snapshot',
      last_fetched: GENERATED_AT,
      last_updated: '2025-12-05',
      last_checked: '2026-02-18',
      update_frequency: 'on_change',
      items_expected: 5,
      items_parsed: 5,
      quality_status: 'complete',
      notes: 'Medical-device focused set for regulatory requirement mapping.',
    },
  },
  {
    id: 'DECLARATION_HELSINKI',
    full_name: 'World Medical Association Declaration of Helsinki',
    identifier: 'WMA-DOH',
    effective_date: '1964-06-01',
    source_url: 'https://www.wma.net/what-we-do/medical-ethics/declaration-of-helsinki/',
    authority: 'World Medical Association',
    jurisdiction: 'INTL',
    instrument_type: 'declaration',
    category: 'research-ethics',
    items: [
      {
        item_id: 'PARA_8',
        title: 'Paragraph 8 - Primary duty to research participants',
        parent: 'General Principles',
        tags: ['ethics', 'participant-protection'],
        text: 'While the primary purpose of medical research is to generate new knowledge, this goal can never take precedence over the rights and interests of individual research participants.',
      },
      {
        item_id: 'PARA_16',
        title: 'Paragraph 16 - Risk and burden assessment',
        parent: 'Risk, Burden and Benefits',
        tags: ['risk-benefit', 'ethics-review'],
        text: 'Medical research involving human participants may only be conducted if the importance of the objective outweighs the risks and burdens to research participants.',
      },
      {
        item_id: 'PARA_24',
        title: 'Paragraph 24 - Privacy and confidentiality',
        parent: 'Privacy and Confidentiality',
        tags: ['privacy', 'data-protection'],
        text: 'Every precaution must be taken to protect the privacy of research participants and the confidentiality of their personal information.',
      },
      {
        item_id: 'PARA_34',
        title: 'Paragraph 34 - Post-trial provisions',
        parent: 'Post-Trial Provisions',
        tags: ['post-trial', 'access'],
        text: 'In advance of a clinical trial, sponsors, researchers and host country governments should make provisions for post-trial access for all participants who still need an intervention identified as beneficial.',
      },
      {
        item_id: 'PARA_36',
        title: 'Paragraph 36 - Research registration and publication',
        parent: 'Registration and Publication',
        tags: ['registration', 'transparency'],
        text: 'Every research study involving human participants must be registered in a publicly accessible database before recruitment of the first subject and results should be disseminated responsibly.',
      },
    ],
    definitions: [
      {
        term: 'vulnerable group',
        definition: 'A group or individual with an increased likelihood of being wronged or of incurring additional harm in medical research.',
        defining_item: 'PARA_8',
      },
    ],
    applicability_rules: [
      {
        sector: 'healthcare',
        subsector: 'clinical-research',
        applies: 1,
        confidence: 'definite',
        basis_item: 'PARA_16',
        conditions: null,
        notes: 'Human participant protection principles apply to all clinical research protocols.',
      },
      {
        sector: 'medical-devices',
        subsector: 'clinical-investigation',
        applies: 1,
        confidence: 'likely',
        basis_item: 'PARA_24',
        conditions: {
          human_subject_data_processed: true,
        },
        notes: 'Privacy safeguards apply when device investigations involve identifiable participant data.',
      },
    ],
    source_registry: {
      official_id: 'WMA-DOH',
      official_version: 'Current text',
      last_fetched: GENERATED_AT,
      last_updated: '2024-10-01',
      last_checked: '2025-11-30',
      update_frequency: 'on_change',
      items_expected: 5,
      items_parsed: 5,
      quality_status: 'review',
      notes: 'Ethics principles captured for clinical trial and participant-rights analysis.',
    },
  },
  {
    id: 'CODEX_ALIMENTARIUS',
    full_name: 'Codex Alimentarius Standards and Codes',
    identifier: 'CODEX',
    effective_date: null,
    source_url: 'https://www.fao.org/fao-who-codexalimentarius/en/',
    authority: 'FAO and WHO Codex Alimentarius Commission',
    jurisdiction: 'INTL',
    instrument_type: 'standard',
    category: 'food-safety',
    items: [
      {
        item_id: 'CXC_1_1969_PRINCIPLE_3',
        title: 'General Principles of Food Hygiene - Principle 3',
        parent: 'CXC 1-1969',
        tags: ['food-hygiene', 'hazard-control'],
        text: 'Food business operators should control hazards through preventive measures based on good hygienic practices and where appropriate through HACCP-based systems.',
      },
      {
        item_id: 'CXC_1_1969_PRINCIPLE_4',
        title: 'General Principles of Food Hygiene - Principle 4',
        parent: 'CXC 1-1969',
        tags: ['monitoring', 'verification'],
        text: 'Control measures should be monitored, corrective actions should be taken when needed, and systems should be verified and documented.',
      },
      {
        item_id: 'CXG_44_2003',
        title: 'Principles for Risk Analysis in Food Safety Emergencies',
        parent: 'Guidelines',
        tags: ['risk-analysis', 'food-safety-emergency'],
        text: 'Risk analysis during food safety emergencies should be transparent, timely and scientifically robust to support protective and proportionate measures.',
      },
      {
        item_id: 'CXS_193_1995',
        title: 'General Standard for Contaminants and Toxins in Food and Feed',
        parent: 'Commodity Standards',
        tags: ['contaminants', 'limits'],
        text: 'Maximum levels and related provisions for contaminants and toxins should be used to protect public health and promote fair practices in food trade.',
      },
      {
        item_id: 'CXC_80_2020',
        title: 'Code of Practice on Food Hygiene in Traditional Markets',
        parent: 'Codes of Practice',
        tags: ['market-hygiene', 'sanitation'],
        text: 'Operators and authorities should apply risk-based hygiene controls in traditional food markets to prevent contamination and food-borne disease.',
      },
    ],
    definitions: [
      {
        term: 'hazard analysis and critical control point',
        definition: 'A preventive system that identifies, evaluates and controls hazards significant for food safety.',
        defining_item: 'CXC_1_1969_PRINCIPLE_3',
      },
      {
        term: 'contaminant',
        definition: 'Any substance not intentionally added to food which is present as a result of production, processing, transport or environmental contamination.',
        defining_item: 'CXS_193_1995',
      },
    ],
    applicability_rules: [
      {
        sector: 'food-production',
        subsector: null,
        applies: 1,
        confidence: 'definite',
        basis_item: 'CXC_1_1969_PRINCIPLE_3',
        conditions: null,
        notes: 'Core food hygiene baseline for operators and inspectors.',
      },
      {
        sector: 'medical-devices',
        subsector: null,
        applies: 0,
        confidence: 'likely',
        basis_item: 'CXG_44_2003',
        conditions: null,
        notes: 'Generally outside scope except where products intersect with food safety systems.',
      },
    ],
    source_registry: {
      official_id: 'CODEX',
      official_version: 'Selected hygiene and risk-analysis standards',
      last_fetched: GENERATED_AT,
      last_updated: '2024-12-10',
      last_checked: '2025-10-01',
      update_frequency: 'monthly',
      items_expected: 5,
      items_parsed: 5,
      quality_status: 'incomplete',
      notes: 'Representative baseline only; full Codex coverage is pending.',
    },
  },
];

export const SOURCE_IDS = SEED_SNAPSHOTS.map((snapshot) => snapshot.id);

export function getSnapshotById(sourceId: string): SeedSource | undefined {
  return SEED_SNAPSHOTS.find((snapshot) => snapshot.id === sourceId);
}
