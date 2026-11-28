import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/** Single locale-aware navigation surface for the customer web app. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
