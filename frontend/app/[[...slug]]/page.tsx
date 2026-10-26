import type { Metadata } from 'next';
import CustomerApp from '../../src/App';

type PageProps = {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const pageTitles: Record<string, string> = {
  home: 'Home Services, Made Easy',
  about: 'About Meraki Homes',
  services: 'Home Services',
  team: 'Our Team',
  trust: 'Trust and Safety',
  contact: 'Contact Meraki Homes',
  faq: 'Frequently Asked Questions',
  blog: 'Home Services Journal',
  booking: 'Request a Service',
  'track-booking': 'Track a Service Request',
  login: 'Customer Sign In',
  register: 'Create a Customer Account',
  'my-account': 'My Account',
};

export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
  const { slug = [] } = await params;
  const title = slug[0] === 'services' && slug[1]
    ? `${slug[1].replaceAll('_', ' ')} Service`
    : pageTitles[slug[0] || 'home'] || 'Meraki Homes';
  return { title };
}

export default async function CustomerRoute({ params, searchParams }: PageProps) {
  const [{ slug = [] }, query] = await Promise.all([params, searchParams]);
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) value.forEach(item => search.append(key, item));
    else if (value !== undefined) search.set(key, value);
  }

  return <CustomerApp initialPath={slug.length ? `/${slug.join('/')}` : '/'} initialQuery={search.toString()} />;
}
