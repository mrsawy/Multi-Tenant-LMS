"use client"
import { IUser } from '@/lib/types/user/user.interface';
import { Navbar02 } from '../molecules/nav-bar';
import { useRouter } from '@/i18n/navigation';

function HomeNave({ user }: { user?: IUser }) {
  const router = useRouter();
  return (
    <Navbar02
      user={user}
      onSignInClick={() => {
        router.push('/login');
      }}
      onCtaClick={() => {
        router.push('/signup');
      }}
    />
  );
}

export default HomeNave;
