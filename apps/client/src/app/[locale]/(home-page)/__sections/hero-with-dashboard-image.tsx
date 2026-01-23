import { useTranslations } from "next-intl";
import Link from "next/link";
import DashboardImage from "../__components/dashboard-image";
import HeroActionButtons from "../__components/hero-action-buttons";
import { Badge } from "@/components/atoms/badge";
import { Typography } from "@/components/atoms/typography";
import { Cloud, Smartphone, BarChart3, Shield, Users, Zap } from "lucide-react";
import { SparklesText } from "@/components/atoms/sparkles-text";
import { TextAnimate } from "@/components/atoms/text-animate";
import { BentoGrid } from "@/components/atoms/bento-grid";

const HeroWithDashboard = () => {
    const t = useTranslations("Hero");

    return (
        <>
            <section
                id="home"
                className="relative overflow-hidden  pt-[120px] md:pt-[130px] lg:pt-[160px] container max-sm:w-10/12"
            >
                <div className="container">
                    <div className="-mx-4 flex flex-wrap items-center">
                        <div className="w-full px-4">
                            <div
                                className="hero-content wow fadeInUp mx-auto  text-center"
                                data-wow-delay=".2s"
                            >
                                <Badge
                                    variant="default"
                                    className="mb-6 bg-gradient-to-r from-primary/30 to-primary/10 font-bold rounded-full border-none py-2 px-9 text-primary "
                                >
                                    <div className="rounded-full bg-gradient-to-r from-primary/40 to-primary/50 size-2 hover:bg-primary me-3"></div>
                                    {t("numberOneMultiTenantSolution")}
                                </Badge>
                                <SparklesText className="text-3xl font-bold leading-snug sm:text-4xl sm:leading-snug lg:text-8xl lg:leading-[1.2] gradient-text my-12">
                                    <TextAnimate animation="blurInUp" by="word" once as="h1">
                                        {t("title")}
                                    </TextAnimate>
                                </SparklesText>
                                <Typography
                                    variant="p"
                                    size="base"
                                    weight="medium"
                                    className="mx-auto mb-9 max-w-[600px] sm:text-lg sm:leading-[1.44]"
                                >
                                    {t("description")}
                                </Typography>
                                <div className=" max-w-[790px] mx-auto">
                                    <HeroActionButtons />
                                </div>

                                <div>
                                    <Typography
                                        variant="p"
                                        size="base"
                                        weight="medium"
                                        color="muted"
                                        align="center"
                                        className="mb-4 sm:text-center"
                                    >
                                        {t("trustedByOrganizations")}
                                    </Typography>
                                    <div
                                        className="wow fadeInUp flex flex-wrap items-center justify-center gap-6 text-center"
                                        data-wow-delay=".3s"
                                    >
                                        <div className="flex flex-col items-center gap-2 group">
                                            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                <Cloud className="w-6 h-6 text-primary" />
                                            </div>
                                            <Typography variant="span" size="sm" weight="medium">
                                                {t("cloudBased")}
                                            </Typography>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 group">
                                            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                <Smartphone className="w-6 h-6 text-primary" />
                                            </div>
                                            <Typography variant="span" size="sm" weight="medium">
                                                {t("mobileReady")}
                                            </Typography>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 group">
                                            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                <BarChart3 className="w-6 h-6 text-primary" />
                                            </div>
                                            <Typography variant="span" size="sm" weight="medium">
                                                {t("analytics")}
                                            </Typography>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 group">
                                            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                <Shield className="w-6 h-6 text-primary" />
                                            </div>
                                            <Typography variant="span" size="sm" weight="medium">
                                                {t("secure")}
                                            </Typography>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 group">
                                            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                <Users className="w-6 h-6 text-primary" />
                                            </div>
                                            <Typography variant="span" size="sm" weight="medium">
                                                {t("multiTenant")}
                                            </Typography>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 group">
                                            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                <Zap className="w-6 h-6 text-primary" />
                                            </div>
                                            <Typography variant="span" size="sm" weight="medium">
                                                {t("fast")}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DashboardImage imageSrc="/images/dashboard.png" />
                    </div>
                </div>
            </section>
        </>
    );
};

export default HeroWithDashboard;
