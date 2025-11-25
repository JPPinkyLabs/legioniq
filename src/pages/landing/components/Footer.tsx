'use client';

import { Link } from 'react-router-dom';

const LINKS = [
  {
    title: 'Company',
    items: [
      {
        title: 'About Us',
        href: 'https://pinkylabs.io',
        external: true,
      },
      {
        title: 'LinkedIn',
        href: 'https://www.linkedin.com/company/pinky-labs-llc',
        external: true,
      },
      {
        title: 'hello@pinkylabs.io',
        href: 'mailto:hello@pinkylabs.io',
        external: true,
      },
    ],
  },
  {
    title: 'Legal',
    items: [
      {
        title: 'Terms',
        href: '/terms',
        external: false,
      },
      {
        title: 'Privacy',
        href: '/privacy',
        external: false,
      },
    ],
  },
];

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="w-full border-t pb-8 pt-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 grid grid-cols-1 items-start justify-between gap-8 md:grid-cols-2 lg:gap-12">
          <div>
            <h6 className="text-2xl font-semibold">LegionIQ</h6>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              AI-powered game analysis platform that helps players make smarter
              decisions. Built by{' '}
              <a
                href="https://pinkylabs.io"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                Pinky Labs LLC
              </a>
              .
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:ml-auto">
            {LINKS.map(({ title, items }) => (
              <ul key={title} className="space-y-3">
                <p className="mb-3 font-semibold">{title}</p>
                {items.map(({ title, href, external }) => (
                  <li key={title}>
                    {external ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {title}
                      </a>
                    ) : (
                      <Link
                        to={href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-6 border-t border-border pt-8 md:flex-row md:items-center">
          <p className="max-w-2xl text-sm text-muted-foreground">
            Empowering gamers with AI-driven insights to enhance competitive
            gameplay.
          </p>
          <p className="whitespace-nowrap text-sm text-muted-foreground">
            © {YEAR}{' '}
            <a
              href="https://pinkylabs.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Pinky Labs LLC
            </a>
            . All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
