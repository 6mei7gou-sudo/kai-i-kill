// サインインページ
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <SignIn />
        </div>
    );
}
