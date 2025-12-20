import Link from "next/link";

export default function PrivacyPolicy() {
    return (
        <div className="space-y-6">
            <h1>Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
                <h2>1. Introduction</h2>
                <p>
                    Welcome to Framax Solutions ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                </p>
                <p>
                    <strong>For users in the European Union (EU) and European Economic Area (EEA):</strong> We are the controller of your personal data and collect, process, and protect your data in compliance with the General Data Protection Regulation (GDPR).
                </p>
            </section>

            <section>
                <h2>2. Information We Collect</h2>
                <p>We collect personal information that you voluntarily provide to us when you:</p>
                <ul>
                    <li>Register on the website (e.g., via Google OAuth).</li>
                    <li>Express an interest in obtaining information about us or our products and services.</li>
                    <li>Contact us directly via forms or email.</li>
                </ul>
                <p>The personal information we collect may include:</p>
                <ul>
                    <li>Name and Contact Data (Email address, phone number).</li>
                    <li>Credentials (Passwords, hints, and similar security info used for authentication).</li>
                    <li>Payment Data (if applicable, though generally processed by our payment processors).</li>
                </ul>
            </section>

            <section>
                <h2>3. How We Use Your Information</h2>
                <p>We use the information we collect or receive:</p>
                <ul>
                    <li>To facilitate account creation and logon processes.</li>
                    <li>To send you administrative information (product, service, new feature information).</li>
                    <li>To fulfill and manage your orders.</li>
                    <li>To protect our Services (fraud monitoring and prevention).</li>
                    <li>To enforce our terms, conditions, and policies.</li>
                </ul>
            </section>

            <section>
                <h2>4. Cookies and Tracking Technologies</h2>
                <p>
                    We use cookies and similar tracking technologies to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Policy.
                </p>
            </section>

            <section>
                <h2>5. Your Privacy Rights (GDPR)</h2>
                <p>If you are a resident of the EEA or UK, you have certain rights under applicable data protection laws:</p>
                <ul>
                    <li><strong>Right to access:</strong> You may request copies of your personal data.</li>
                    <li><strong>Right to rectification:</strong> You may request that we correct any information you believe is inaccurate.</li>
                    <li><strong>Right to erasure:</strong> You may request that we erase your personal data ("Right to be forgotten").</li>
                    <li><strong>Right to restrict processing:</strong> You may request that we restrict the processing of your personal data.</li>
                    <li><strong>Right to object to processing:</strong> You may object to our processing of your personal data.</li>
                    <li><strong>Right to data portability:</strong> You may request that we transfer the data that we have collected to another organization, or directly to you.</li>
                </ul>
                <p>
                    To exercise these rights, please contact us at contact@framaxsolutions.com.
                </p>
            </section>

            <section>
                <h2>6. Contact Us</h2>
                <p>
                    If you have questions or comments about this policy, you may contact us by email at contact@framaxsolutions.com.
                </p>
            </section>
        </div>
    );
}
