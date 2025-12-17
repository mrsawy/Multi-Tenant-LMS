"use client"

import { IconBrandNationalGeographic, IconBrandNexo, IconBrandReact, IconBrandSentry } from '@tabler/icons-react';
import LogoLoop from './LogoLoop';
// import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si';

const techLogos = [
    { node: <IconBrandReact />, title: "React", href: "https://react.dev" },
    { node: <IconBrandNexo />, title: "Next.js", href: "https://nextjs.org" },
    { node: <IconBrandNationalGeographic />, title: "TypeScript", href: "https://www.typescriptlang.org" },
    { node: <IconBrandSentry />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
];

// Alternative with image sources
const imageLogos = [
    { src: "/logos/company1.png", alt: "Company 1", href: "https://company1.com" },
    { src: "/logos/company2.png", alt: "Company 2", href: "https://company2.com" },
    { src: "/logos/company3.png", alt: "Company 3", href: "https://company3.com" },
];

function LogoLoopOrgan() {
    return (
        <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
            <LogoLoop
                logos={techLogos}
                speed={120}
                direction="left"
                logoHeight={48}
                gap={40}
                pauseOnHover
                scaleOnHover
                fadeOut
                fadeOutColor="#ffffff"
                ariaLabel="Technology partners"
            />
        </div>
    );
}
export default LogoLoopOrgan