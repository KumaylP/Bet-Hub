import React from 'react';

const TermsPage: React.FC = () => {
    return (
        <div className="w-full max-w-4xl mx-auto px-6 py-12 space-y-8">
            <h1 className="text-4xl font-black text-white">Terms of Service</h1>
            <div className="prose prose-invert max-w-none text-gray-400 space-y-6">
                <p>By using Bet Hub, you agree to these Terms of Service. Please read them carefully.</p>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">1. Account Terms</h2>
                    <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account and password.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">2. Betting Rules</h2>
                    <p>Users must comply with all rules established for betting markets. We reserve the right to resolve disputes and declare results based on available data.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">3. Limitation of Liability</h2>
                    <p>Bet Hub is provided "as is" without warranty of any kind. We are not liable for any losses incurred through the use of our platform.</p>
                </section>
            </div>
        </div>
    );
};

export default TermsPage;
