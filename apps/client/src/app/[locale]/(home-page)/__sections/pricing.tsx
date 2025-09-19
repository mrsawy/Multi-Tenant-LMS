"use client"
import React, { useState } from 'react';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { Switch } from '@/components/atoms/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Check, Zap, Crown, Rocket, Users, Building2, Sparkles } from 'lucide-react';

const PricingSection: React.FC = () => {
    const [isAnnual, setIsAnnual] = useState(true);

    const plans = [
        {
            name: 'Starter',
            description: 'Perfect for individuals and small teams',
            icon: Zap,
            color: 'primary',
            monthlyPrice: 29,
            annualPrice: 290,
            maxUsers: '5 users',
            features: [
                'Access to all basic courses',
                'Standard support',
                'Basic analytics',
                'Mobile app access',
                'Certificate of completion',
                '5GB storage space'
            ],
            cta: 'Start Learning',
            popular: false
        },
        {
            name: 'Professional',
            description: 'Ideal for growing teams and departments',
            icon: Crown,
            color: 'secondary',
            monthlyPrice: 99,
            annualPrice: 990,
            maxUsers: '50 users',
            features: [
                'Everything in Starter',
                'Access to premium courses',
                'Priority support',
                'Advanced analytics & reporting',
                'Custom branding',
                'API access',
                'SSO integration',
                '100GB storage space',
                'Live mentorship sessions'
            ],
            cta: 'Go Professional',
            popular: true
        },
        {
            name: 'Enterprise',
            description: 'Comprehensive solution for large organizations',
            icon: Building2,
            color: 'accent',
            monthlyPrice: 299,
            annualPrice: 2990,
            maxUsers: 'Unlimited users',
            features: [
                'Everything in Professional',
                'Custom course creation',
                'Dedicated account manager',
                'White-label solution',
                'Advanced security & compliance',
                'Custom integrations',
                'On-premise deployment option',
                'Unlimited storage',
                'Executive training programs',
                '24/7 phone support'
            ],
            cta: 'Contact Sales',
            popular: false
        }
    ];

    const getPrice = (plan: typeof plans[0]) => {
        const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
        const period = isAnnual ? 'year' : 'month';
        return { price, period };
    };

    const getSavings = (plan: typeof plans[0]) => {
        const monthlyTotal = plan.monthlyPrice * 12;
        const savings = monthlyTotal - plan.annualPrice;
        const percentage = Math.round((savings / monthlyTotal) * 100);
        return { savings, percentage };
    };

    return (
        <section className="py-32 px-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-1/4 left-0 w-full h-full   from-primary via-secondary to-accent" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 [&>*]:p-4">
                <div className="text-center mb-20">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Rocket className="w-6 h-6 text-accent" />
                        <span className="text-accent font-medium uppercase tracking-wider text-sm">
                            Flexible Pricing
                        </span>
                    </div>

                    <h2 className="text-5xl md:text-6xl font-bold mb-8 font-heading">
                        <span className="text-foreground">Scale at</span>
                        <br />
                        <span className="gradient-text">Your Own Pace</span>
                    </h2>

                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
                        Choose the perfect plan for your learning journey. Upgrade or downgrade anytime with no penalties.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 glass rounded-full p-2 max-w-md mx-auto">
                        <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                            Monthly
                        </span>
                        <Switch
                            checked={isAnnual}
                            onCheckedChange={setIsAnnual}
                            className="data-[state=checked]:bg-primary"
                        />
                        <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                            Annual
                        </span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                            Save up to 20%
                        </Badge>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 mb-16">
                    {plans.map((plan, index) => {
                        const { price, period } = getPrice(plan);
                        const { savings, percentage } = getSavings(plan);
                        const IconComponent = plan.icon;

                        return (
                            <Card
                                key={index}
                                className={`relative glass-intense hover-lift hover-glow ${plan.popular ? 'border-primary/50 scale-105' : ''
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-primary text-primary-foreground px-4 py-1">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader className="text-center pb-8 pt-8">
                                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${plan.color === 'primary' ? 'bg-primary/20' :
                                            plan.color === 'secondary' ? 'bg-secondary/20' : 'bg-accent/20'
                                        }`}>
                                        <IconComponent className={`w-8 h-8 ${plan.color === 'primary' ? 'text-primary' :
                                                plan.color === 'secondary' ? 'text-secondary' : 'text-accent'
                                            }`} />
                                    </div>

                                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                                    <CardDescription className="text-base mb-6">
                                        {plan.description}
                                    </CardDescription>

                                    <div className="space-y-2">
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-4xl font-bold">${price}</span>
                                            <span className="text-muted-foreground">/{period}</span>
                                        </div>

                                        {isAnnual && (
                                            <div className="text-sm text-accent">
                                                Save ${savings} ({percentage}% off)
                                            </div>
                                        )}

                                        <div className="text-sm text-muted-foreground">
                                            {plan.maxUsers}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    <Button
                                        size="lg"
                                        className={`w-full ${plan.popular
                                                ? 'bg-primary hover:bg-primary/90 text-primary-foreground glow-primary'
                                                : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {plan.cta}
                                    </Button>

                                    <div className="space-y-4 pt-4">
                                        {plan.features.map((feature, featureIndex) => (
                                            <div key={featureIndex} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                <span className="text-sm text-muted-foreground">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <div className="glass rounded-3xl p-12">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold mb-4">
                            <span className="gradient-text">Frequently Asked Questions</span>
                        </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-2">Can I change plans anytime?</h4>
                                <p className="text-sm text-muted-foreground">
                                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Is there a free trial?</h4>
                                <p className="text-sm text-muted-foreground">
                                    All plans come with a 14-day free trial. No credit card required to start.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-2">What about enterprise features?</h4>
                                <p className="text-sm text-muted-foreground">
                                    Enterprise customers get dedicated support, custom integrations, and SLA guarantees.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Do you offer discounts?</h4>
                                <p className="text-sm text-muted-foreground">
                                    We offer discounts for nonprofits, educational institutions, and startups.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Talk to Sales
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;