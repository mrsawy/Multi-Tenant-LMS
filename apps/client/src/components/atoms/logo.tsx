import Image from 'next/image';
import logoSrc from '@/../public/images/logo.png';

export default function Logo({ ...props }: any) {
  return <Image src={logoSrc} width={40} height={40} alt="Safier Logo" {...props} />;
}
