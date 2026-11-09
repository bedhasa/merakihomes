import React from 'react';
import { ServiceCategory } from '@shared/types';
import { HeroSection } from './HeroSection';
import { PopularServices } from './PopularServices';
import { WhyChooseUs } from './WhyChooseUs';
import { WhoWeAre } from './WhoWeAre';
import { OurValues } from './OurValues';
import { HowItWorks } from './HowItWorks';
import { Testimonials } from './Testimonials';
import { FaqSection } from './FaqSection';
import { FinalCta } from './FinalCta';

interface HomePageProps {
  services: ServiceCategory[];
  servicesState: 'loading' | 'ready' | 'error';
  onBookNow: (serviceId?: string) => void;
  onExploreServices: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  services,
  servicesState,
  onBookNow,
  onExploreServices,
  onAboutClick,
  onContactClick,
}) => {
  return (
    <div className="w-full">
      {/* Hero: keep the established design unchanged. */}
      <HeroSection
        onBookNow={() => onBookNow()}
        onExploreServices={onExploreServices}
      />

      {/* 1. Why Meraki */}
      <WhyChooseUs />

      {/* 2. Featured services */}
      <PopularServices
        services={services}
        servicesState={servicesState}
        onExploreAll={onExploreServices}
      />

      {/* 3. Who we are and existing trust metrics */}
      <WhoWeAre
        image={services.find((service) => service.id === 'premium_home_cleaning')?.image}
        onAboutClick={onAboutClick}
      />

      {/* 4. Our values */}
      <OurValues />

      {/* Existing booking guidance */}
      <HowItWorks onBookNow={() => onBookNow()} />

      {/* 5. Customer testimonials */}
      <Testimonials />

      {/* Existing booking FAQs */}
      <FaqSection onContactClick={onContactClick} />

      {/* 6. Final call to action */}
      <FinalCta
        onBookNow={() => onBookNow()}
        onContactUs={onContactClick}
      />
    </div>
  );
};
