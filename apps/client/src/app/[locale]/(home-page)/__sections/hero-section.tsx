"use client"

import { Button } from '@/components/atoms/button';
import DotGrid from '@/components/DotGrid';
import LiquidEther from '@/components/LiquidEther';
import PrismaticBurst from '@/components/PrismaticBurst';
import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack'
import Squares from '@/components/Squares';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import HeroWithDashboard from './hero-with-dashboard-image';
// import CardSwap, { Card } from '@/components/CardSwap'



const HeroSection: React.FC = () => {
    return (
        <>
            <div className="absolute inset-0 -z-10  min-[2500px]:hidden">
                <LiquidEther
                    colors={['#5227FF', '#FF9FFC', '#B19EEF']}
                    mouseForce={20}
                    cursorSize={100}
                    isViscous={false}
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.5}
                    isBounce={false}
                    autoDemo={true}
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    takeoverDuration={0.25}
                    autoResumeDelay={3000}
                    autoRampDuration={0.6}
                />
            </div>

            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Liquid Ether Background */}
                <div className="absolute inset-0 opacity-40">
                    <LiquidEther
                        colors={["#3b82f6", "#8b5cf6", "#06b6d4"]}
                        mouseForce={25}
                        cursorSize={120}
                    />
                </div>

                {/* Radial gradient overlay */}
                <div
                    className="absolute inset-0 opacity-60"
                    style={{ background: 'var(--gradient-radial)' }}
                />

                {/* <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Sparkles className="w-6 h-6 text-accent animate-pulse" />
                        <span className="text-accent font-medium uppercase tracking-wider text-sm">
                            Future of Learning
                        </span>
                        <Sparkles className="w-6 h-6 text-accent animate-pulse" />
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold mb-8 font-heading">
                        <span className="gradient-text">Revolutionary</span>
                        <br />
                        <span className="text-foreground">LMS Platform</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
                        Experience the next generation of learning management with AI-powered insights,
                        immersive content delivery, and seamless multi-tenant architecture.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary px-8 py-4 text-lg font-medium group"
                        >
                            Start Your Journey
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="border-accent text-accent hover:bg-accent text-accent-foreground px-8 py-4 text-lg font-medium group glass"
                        >
                            <Zap className="mr-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                            Watch Demo
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                        <div className="glass rounded-2xl p-6">
                            <div className="text-3xl font-bold gradient-text mb-2">10M+</div>
                            <div className="text-muted-foreground">Active Learners</div>
                        </div>
                        <div className="glass rounded-2xl p-6">
                            <div className="text-3xl font-bold gradient-text mb-2">50K+</div>
                            <div className="text-muted-foreground">Expert Instructors</div>
                        </div>
                        <div className="glass rounded-2xl p-6">
                            <div className="text-3xl font-bold gradient-text mb-2">500+</div>
                            <div className="text-muted-foreground">Enterprise Clients</div>
                        </div>
                    </div>
                </div> */}
                <HeroWithDashboard />
            </section>
        </>
    );
};

export default HeroSection;