"use client"
import { IUser } from '@/lib/types/user/user.interface';
import { Navbar02 } from '../molecules/nav-bar';
import { useRouter } from '@/i18n/navigation';
import { ScrollProgress } from '../atoms/scroll-progress';
import useUserStore from '@/lib/store/userStore';

function HomeNave( ) {
  const router = useRouter();
  const user = useUserStore(state => state.user);
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
