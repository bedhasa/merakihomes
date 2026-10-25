export interface ServiceDetailsCopy {
  overview: string;
  included: string[];
  limitations: string[];
}

export const serviceDetailsCopy: Record<string, ServiceDetailsCopy> = {
  handyman_plumbing: {
    overview: 'Get help with supported small repairs around your home, from plumbing issues to minor electrical fixes and painting touch-ups.',
    included: ['Plumbing and fixture repairs', 'Minor electrical fixes', 'Painting touch-ups', 'Other supported small repairs agreed after review'],
    limitations: ['Major renovation, structural work, and materials are not included unless separately reviewed and approved.'],
  },
  gardening_outdoor: {
    overview: 'Arrange upkeep for a home garden, compound, or terrace. Tell us about the space and the work you need so the scope can be reviewed.',
    included: ['Garden and compound upkeep', 'Terrace maintenance', 'Pruning, weeding, and general care when agreed'],
    limitations: ['Planting materials, equipment, disposal, and larger landscaping work need to be confirmed before the request is accepted.'],
  },
  office_cleaning: {
    overview: 'Request cleaning for an office or commercial premises. Share the size, areas, and preferred schedule for an operations review.',
    included: ['Cleaning scope for commercial premises', 'One-time or recurring schedule requests where available', 'A scope and schedule review before confirmation'],
    limitations: ['Recurring arrangements depend on confirmed capacity. Supplies, specialist cleaning, and access requirements must be agreed in advance.'],
  },
  elder_companion: {
    overview: 'Arrange a friendly companion visit for an older adult. Share their routines, interests, and the everyday support your household would like reviewed.',
    included: ['Conversation and companionship', 'Reading, games, or other shared activities', 'Light everyday assistance when agreed after review'],
    limitations: ['This is a non-medical companion service, not nursing, diagnosis, medication administration, or emergency care. Support needs, suitability, availability, and price are reviewed with the household before confirmation.'],
  },
  childcare_nanny: {
    overview: 'Arrange childcare with a schedule and care needs that fit your family. Share children’s ages and requested hours for review.',
    included: ['Childcare requests for infants, toddlers, and school-age children', 'Flexible schedule requests', 'Care requirements discussed before confirmation'],
    limitations: ['Provider availability and qualifications must be confirmed for each request. No appointment is confirmed until the team contacts you.'],
  },
  cooking_service: {
    overview: 'Request in-home meal preparation for daily meals or a weekly plan. Share your menu, dietary needs, servings, and ingredient preferences.',
    included: ['Meal preparation at home', 'Daily or weekly plan requests', 'Menu and dietary preferences reviewed with you'],
    limitations: ['Ingredient purchasing, special equipment, and dietary requirements must be agreed before the service is confirmed.'],
  },
  maid_laundry: {
    overview: 'Request household laundry and ironing support, with the garment care and expected volume described up front.',
    included: ['Laundry and garment care', 'Ironing', 'Wash, fold, or other tasks agreed during review'],
    limitations: ['Pickup and delivery are not currently listed as a standard option. Detergents, delicate garments, and turnaround time need to be discussed.'],
  },
  premium_home_cleaning: {
    overview: 'Arrange thorough home cleaning for your household. Tell us about the property, priority rooms, and any special surfaces or requirements.',
    included: ['Home cleaning scope reviewed for your property', 'Priority rooms and tasks agreed with you', 'Equipment and supplies discussed before the visit'],
    limitations: ['Equipment and supplies are included only when confirmed for your request. Deep restoration or specialist work may require a separate quote.'],
  },
};