export const PHOTO_PLACEHOLDER = '/photo-pending.svg';

const SERVICE_IMAGE_DESCRIPTIONS: Record<string, string> = {
  premium_home_cleaning: 'Ethiopian home cleaning professional working in a modern living room',
  deep_cleaning: 'Ethiopian professional sanitizing a modern kitchen or bathroom',
  office_cleaning: 'Ethiopian cleaning staff working in a bright modern office',
  childcare_nanny: 'Ethiopian nanny interacting with a child in a clean home',
  elder_companion: 'Ethiopian caregiver assisting an older adult at home',
  cooking_service: 'Ethiopian cook preparing a healthy meal in a modern kitchen',
  gardening_outdoor: 'Ethiopian gardener caring for a residential garden',
  handyman_plumbing: 'Ethiopian home technician repairing a household fixture',
  maid_laundry: 'Ethiopian home professional carefully folding fresh laundry',
};

export function serviceImageDescription(id: string, name?: string): string {
  return SERVICE_IMAGE_DESCRIPTIONS[id] ?? `Ethiopian home professional providing ${name ?? 'home'} services`;
}

export function serviceImageAlt(id: string, name?: string): string {
  return `Photo placeholder: ${serviceImageDescription(id, name)}`;
}

export function serviceImage(_id: string, _image?: string): string {
  return PHOTO_PLACEHOLDER;
}
