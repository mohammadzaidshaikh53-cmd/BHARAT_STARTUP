'use client';

import { motion } from 'framer-motion';
import { Sparkles, Shield, Zap, Crown } from 'lucide-react';
import { ScrollReveal, PhysicsCard } from '@/components/motion';
import { Button } from '@/components/ui/Button';

const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    period: 'forever',
    description: 'Get started with basic marketplace access',
    features: [
      'List up to 50 products',
      'Basic analytics dashboard',
      'Standard support',
      'Community forum access',
      '5 RFQ per month',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2999,
    period: 'month',
    description: 'For growing businesses ready to scale',
    features: [
      'Unlimited product listings',
      'Advanced analytics',
      'Priority support',
      'Verified seller badge',
      'Unlimited RFQ',
      'Custom storefront',
      'API access',
      'Featured listings',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9999,
    period: 'month',
    description: 'Full platform access with dedicated support',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'White-label options',
      'Custom integrations',
      'Bulk discounts',
      'Early feature access',
      'Training sessions',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PremiumPlansPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container-app py-16">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springTransition}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 mb-6"
            >
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Premium Plans
              </span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Unlock Your Business <span className="gradient-text">Potential</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that fits your business. All plans include our trust guarantee
              and access to the One Solution marketplace.
            </p>
          </div>
        </ScrollReveal>

        {/* Plans Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan, index) => (
            <ScrollReveal key={plan.id} delay={index * 0.1}>
              <PhysicsCard className="relative h-full">
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full text-white text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className={`card-premium p-8 h-full ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>

                  <div className="mt-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground">/{plan.period}</span>
                      )}
                    </div>
                  </div>

                  <Button
                    className={`w-full mt-6 ${plan.popular ? '' : 'variant-outline'}`}
                  >
                    {plan.cta}
                  </Button>

                  <div className="mt-8 space-y-4">
                    <p className="text-sm font-medium text-muted-foreground">What's included:</p>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </PhysicsCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Trust Section */}
        <ScrollReveal>
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-8">Every Plan Includes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Shield, title: 'Trust Guarantee', desc: 'Secure transactions with escrow protection' },
                { icon: Zap, title: 'Instant Access', desc: 'Start selling within minutes of signup' },
                { icon: Sparkles, title: '24/7 Support', desc: 'Our team is here to help you succeed' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springTransition, delay: i * 0.1 }}
                  className="card-premium p-6"
                >
                  <item.icon className="w-8 h-8 mx-auto text-primary" />
                  <h3 className="font-bold mt-4">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
