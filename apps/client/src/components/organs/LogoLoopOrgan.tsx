'use client';

import { IconBrandNationalGeographic, IconBrandNexo, IconBrandReact, IconBrandSentry } from '@tabler/icons-react';
import LogoLoop from './LogoLoop';
import { useTheme } from 'next-themes';
// import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si';

const techLogos = [
  { node: <IconBrandReact />, title: 'React' },
  { node: <IconBrandNexo />, title: 'Next.js' },
  { node: <IconBrandNationalGeographic />, title: 'TypeScript' },
  { node: <IconBrandSentry />, title: 'Tailwind CSS' },
];

function LogoLoopOrgan() {
  const { theme } = useTheme();

  const isDark = theme == 'dark';
  return (
    <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }} className="ltr">
      <LogoLoop logos={techLogos} speed={120} direction="left" logoHeight={80} gap={80} pauseOnHover scaleOnHover fadeOut fadeOutColor={isDark ? '#ffffff' : '#000'} ariaLabel="Technology partners" />
    </div>
  );
}
export default LogoLoopOrgan;
