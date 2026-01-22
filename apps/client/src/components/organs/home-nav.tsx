"use client"
import { IUser } from '@/lib/types/user/user.interface';
import { Navbar02 } from '../molecules/nav-bar';
import { useRouter } from '@/i18n/navigation';
import { ScrollProgress } from '../atoms/scroll-progress';

function HomeNave({ user }: { user?: IUser }) {
  const router = useRouter();
  return (
    <>
      <Navbar02
        user={user}
        onSignInClick={() => {
          router.push('/login');
        }}
        onCtaClick={() => {
          router.push('/signup');
        }}
      />
      <ScrollProgress className='top-16' />
    </>

  );
}

export default HomeNave;
