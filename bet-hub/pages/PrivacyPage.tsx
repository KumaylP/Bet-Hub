import React from 'react';

const PrivacyPage: React.FC = () => {
    return (
        <div className="w-full max-w-4xl mx-auto px-6 py-12 space-y-8">
            <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
            <div className="prose prose-invert max-w-none text-gray-400 space-y-6">
                <p>Your privacy is important to us. This Privacy Policy explains how Bet Hub collects, uses, and protects your personal information.</p>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, such as when you create an account, participate in a betting market, or communicate with us.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
                    <p>We use the information we collect to provide, maintain, and improve our services, including to process transactions and send you related information.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">3. Data Security</h2>
                    <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.</p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPage;
