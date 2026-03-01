// サインアップページ
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <SignUp />
        </div>
    );
}
