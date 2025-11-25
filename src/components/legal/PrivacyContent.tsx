import { useDateUtils } from "@/hooks/formatting/useDateUtils";

interface PrivacyContentProps {
  variant?: "page" | "modal";
}

export const PrivacyContent = ({ variant = "page" }: PrivacyContentProps) => {
  const { getCurrentDate, getCurrentYear } = useDateUtils();
  
  const headingSize = variant === "page" ? "text-4xl" : "text-2xl";
  const sectionHeadingSize = variant === "page" ? "text-2xl" : "text-lg";
  const textSize = variant === "page" ? "text-base" : "text-sm";
  const spacing = variant === "page" ? "mb-8" : "mb-2";
  const listSpacing = variant === "page" ? "space-y-2" : "space-y-1";

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className={`${headingSize} font-bold ${variant === "page" ? "mb-8" : "mb-2"}`}>
        Privacy Policy
      </h1>
      
      <p className={`text-muted-foreground ${variant === "page" ? "mb-6" : "mb-4"}`}>
        Last updated: {getCurrentDate()}
      </p>
      
      <p className={`${textSize} text-foreground/90 ${variant === "page" ? "mb-8" : "mb-4"}`}>
        <a
          href="https://pinkylabs.io"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:underline"
        >
          PINKY LABS LLC
        </a>{' '}
        ("we," "our," or "us") operates LegionIQ. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.
      </p>

      <section className={spacing}>
        <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
          1. Information We Collect
        </h2>
        <p className={`${textSize} text-foreground/90 ${variant === "page" ? "mb-4" : "mb-2"}`}>
          We collect information that you provide directly to us, including:
        </p>
        <ul className={`list-disc pl-6 ${listSpacing} ${textSize} text-foreground/90`}>
          <li>Email address and account credentials</li>
          <li>Game screenshots you upload for analysis</li>
          <li>OCR-extracted text from your screenshots</li>
          <li>AI-generated responses and recommendations</li>
          <li>Your ratings and feedback on AI responses</li>
          <li>Usage data and session logs</li>
        </ul>
      </section>

      <section className={spacing}>
        <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
          2. How We Use Your Information
        </h2>
        <p className={`${textSize} text-foreground/90 ${variant === "page" ? "mb-4" : "mb-2"}`}>
          We use the collected information to:
        </p>
        <ul className={`list-disc pl-6 ${listSpacing} ${textSize} text-foreground/90`}>
          <li>Provide, maintain, and improve our AI gaming assistance services</li>
          <li>Process your screenshots and generate personalized recommendations</li>
          <li>Communicate with you about service updates and features</li>
          <li>Analyze usage patterns to enhance user experience</li>
          <li>Ensure the security and integrity of our platform</li>
        </ul>
      </section>

      <section className={spacing}>
        <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
          3. Data Storage and Security
        </h2>
        <p className={`${textSize} text-foreground/90 ${variant === "page" ? "mb-4" : ""}`}>
          Your data is stored securely using industry-standard encryption and security measures. We implement appropriate technical and organizational safeguards to protect your personal information from unauthorized access, disclosure, or destruction.
        </p>
      </section>

      <section className={spacing}>
        <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
          4. Third-Party Services
        </h2>
        <p className={`${textSize} text-foreground/90 ${variant === "page" ? "mb-4" : "mb-2"}`}>
          We use third-party services to provide our features:
        </p>
        <ul className={`list-disc pl-6 ${listSpacing} ${textSize} text-foreground/90`}>
          <li><strong>OCR.space:</strong> For optical character recognition of screenshots</li>
          <li><strong>OpenAI:</strong> For AI-powered analysis and recommendations</li>
          <li><strong>Supabase:</strong> For data storage and authentication</li>
        </ul>
        {variant === "page" && (
          <p className={`${textSize} text-foreground/90 mt-4`}>
            These services have their own privacy policies governing the use of your information.
          </p>
        )}
      </section>

      {variant === "page" && (
        <>
          <section className={spacing}>
            <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
              5. Your Rights
            </h2>
            <p className={`${textSize} text-foreground/90 ${variant === "page" ? "mb-4" : "mb-2"}`}>
              You have the right to:
            </p>
            <ul className={`list-disc pl-6 ${listSpacing} ${textSize} text-foreground/90`}>
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of certain data collection practices</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section className={spacing}>
            <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
              6. Data Retention
            </h2>
            <p className={`${textSize} text-foreground/90`}>
              We retain your personal information only for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your account and associated data at any time.
            </p>
          </section>
        </>
      )}

      <section className={spacing}>
        <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
          {variant === "page" ? "7. Contact Us" : "5. Contact Us"}
        </h2>
        {variant === "page" && (
          <p className={`${textSize} text-foreground/90 mb-4`}>
            If you have questions about this Privacy Policy or our data practices, please contact:
          </p>
        )}
        <p className={`${textSize} text-foreground/90`}>
          <strong>
            <a
              href="https://pinkylabs.io/contact-us"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              PINKY LABS LLC
            </a>
          </strong>
        </p>
      </section>

      <section className={`${variant === "page" ? "mb-8" : ""} pt-8 border-t border-border/50`}>
        <p className={`${variant === "page" ? "text-sm" : "text-xs"} text-muted-foreground text-center`}>
          © {getCurrentYear()}{' '}
          <a
            href="https://pinkylabs.io/contact-us"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            PINKY LABS LLC
          </a>
          . All rights reserved.
        </p>
      </section>
    </div>
  );
};

