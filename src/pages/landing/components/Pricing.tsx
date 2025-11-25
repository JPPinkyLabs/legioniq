'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: {
      monthly: 'Free forever',
      yearly: 'Free forever',
    },
    description: 'Perfect for getting started with game analysis.',
    features: [
      '15 images per day',
      'AI-powered analysis',
      'Basic insights',
      'Single-user account',
      'Email support',
    ],
    cta: 'Get started for free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: {
      monthly: 5,
      yearly: 4,
    },
    description: 'Everything you need to improve your gameplay.',
    features: [
      '30 images per day',
      'Advanced AI analysis',
      'Detailed insights',
      'Priority support',
      'Multi-user account',
    ],
    cta: 'Subscribe to Pro',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: {
      monthly: 'Get in touch for pricing',
      yearly: 'Get in touch for pricing',
    },
    description: 'Unlimited access for teams and organizations.',
    features: [
      'Unlimited images',
      'Advanced AI analysis',
      'Custom integrations',
      'Dedicated support',
      'Team management',
    ],
    cta: 'Contact us',
  },
];

export function Pricing() {
  const [frequency, setFrequency] = useState<string>('monthly');

  const formatPrice = (price: number | string, frequency: string) => {
    if (typeof price === 'string') {
      return price;
    }
    return `$${price}/month, billed ${frequency === 'monthly' ? 'monthly' : 'yearly'}.`;
  };

  return (
    <div className="not-prose flex flex-col gap-12 px-8 pt-8 pb-16 text-center">
      <div className="flex flex-col items-center justify-center gap-8">
        <h1 className="mb-0 text-balance font-medium text-5xl tracking-tighter">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-0 mb-0 max-w-2xl text-balance text-lg text-muted-foreground">
          Choose the plan that fits your needs. Start free and upgrade as you grow.
        </p>
        <Tabs defaultValue={frequency} onValueChange={setFrequency}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly
              <Badge variant="secondary" className="ml-2">20% off</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-8 grid w-full max-w-4xl gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              className={cn(
                'relative w-full text-left',
                plan.popular && 'ring-2 ring-primary'
              )}
              key={plan.id}
            >
              {plan.popular && (
                <Badge className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-1/2 rounded-full">
                  Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="font-medium text-xl">
                  {plan.name}
                </CardTitle>
                <CardDescription>
                  {plan.description}
                  <br />
                  {typeof plan.price[frequency as keyof typeof plan.price] ===
                  'number' ? (
                    <span className="font-medium text-foreground">
                      {formatPrice(
                        plan.price[frequency as keyof typeof plan.price] as number,
                        frequency
                      )}
                    </span>
                  ) : (
                    <span className="font-medium text-foreground">
                      {plan.price[frequency as keyof typeof plan.price]}.
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {plan.features.map((feature, index) => (
                  <div
                    className="flex items-center gap-2 text-muted-foreground text-sm"
                    key={index}
                  >
                    <BadgeCheck className="h-4 w-4 shrink-0" />
                    {feature}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'secondary'}
                  disabled
                >
                  Coming soon
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

