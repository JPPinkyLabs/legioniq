import { useDateUtils } from "@/hooks/formatting/useDateUtils";

interface TermsContentProps {
  variant?: "page" | "modal";
}

export const TermsContent = ({ variant = "page" }: TermsContentProps) => {
  const { getCurrentDate, getCurrentYear } = useDateUtils();
  
  const headingSize = variant === "page" ? "text-4xl" : "text-2xl";
  const sectionHeadingSize = variant === "page" ? "text-2xl" : "text-lg";
  const textSize = variant === "page" ? "text-base" : "text-sm";
  const spacing = variant === "page" ? "mb-8" : "mb-2";
  const listSpacing = variant === "page" ? "space-y-2" : "space-y-1";

  return (
    <div className="prose prose-invert max-w-none">
      <h1 className={`${headingSize} font-bold ${variant === "page" ? "mb-8" : "mb-2"}`}>
        Terms of Service
      </h1>
      
      <p className={`text-muted-foreground ${variant === "page" ? "mb-6" : "mb-4"}`}>
        Last updated: {getCurrentDate()}
      </p>

      <p className={`${textSize} text-foreground/90 ${variant === "page" ? "mb-8" : "mb-4"}`}>
        These Terms of Service govern your use of LegionIQ, operated by{' '}
        <a
          href="https://pinkylabs.io"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:underline"
        >
          PINKY LABS LLC
        </a>
        . By using our service, you agree to these terms.
      </p>

      <section className={spacing}>
        <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
          1. Acceptance of Terms
        </h2>
        <p className={`${textSize} text-foreground/90`}>
          By accessing and using LegionIQ, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
        </p>
      </section>

      <section className={spacing}>
        <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
          2. Service Description
        </h2>
        <p className={`${textSize} text-foreground/90 ${variant === "page" ? "mb-4" : "mb-2"}`}>
          LegionIQ provides AI-powered gaming assistance through:
        </p>
        <ul className={`list-disc pl-6 ${listSpacing} ${textSize} text-foreground/90`}>
          <li>Screenshot analysis using optical character recognition</li>
          <li>AI-generated gameplay, technical, and strategic recommendations</li>
          <li>User feedback and rating system</li>
        </ul>
      </section>

      <section className={spacing}>
        <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
          3. User Accounts
        </h2>
        <p className={`${textSize} text-foreground/90 ${variant === "page" ? "mb-4" : "mb-2"}`}>
          To use LegionIQ, you must:
        </p>
        <ul className={`list-disc pl-6 ${listSpacing} ${textSize} text-foreground/90`}>
          <li>Create an account with a valid email address</li>
          <li>Maintain the security of your account credentials</li>
          <li>Notify us immediately of any unauthorized access</li>
          <li>Be at least 13 years old or have parental consent</li>
        </ul>
      </section>

      <section className={spacing}>
        <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
          4. Acceptable Use
        </h2>
        <p className={`${textSize} text-foreground/90 ${variant === "page" ? "mb-4" : "mb-2"}`}>
          You agree not to:
        </p>
        <ul className={`list-disc pl-6 ${listSpacing} ${textSize} text-foreground/90`}>
          <li>Upload content that is illegal, harmful, or violates others' rights</li>
          <li>Use the service to harass, abuse, or harm others</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Use automated systems to access the service without permission</li>
          <li>Reverse engineer or attempt to extract source code</li>
          <li>Resell or redistribute our services without authorization</li>
        </ul>
      </section>

      {variant === "page" && (
        <>
          <section className={spacing}>
            <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
              5. Content Ownership
            </h2>
            <p className={`${textSize} text-foreground/90 ${variant === "page" ? "mb-4" : "mb-2"}`}>
              You retain ownership of screenshots and content you upload. By using our service, you grant us a limited license to:
            </p>
            <ul className={`list-disc pl-6 ${listSpacing} ${textSize} text-foreground/90`}>
              <li>Process your screenshots through OCR technology</li>
              <li>Generate AI responses based on your content</li>
              <li>Store your data to provide and improve our services</li>
            </ul>
          </section>

          <section className={spacing}>
            <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
              6. AI-Generated Content
            </h2>
            <p className={`${textSize} text-foreground/90`}>
              AI-generated recommendations are provided "as is" for informational purposes. We do not guarantee the accuracy, completeness, or usefulness of AI responses. Use recommendations at your own discretion.
            </p>
          </section>

          <section className={spacing}>
            <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
              7. Service Availability
            </h2>
            <p className={`${textSize} text-foreground/90`}>
              We strive to maintain service availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any aspect of the service at any time without notice.
            </p>
          </section>

          <section className={spacing}>
            <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
              8. Limitation of Liability
            </h2>
            <p className={`${textSize} text-foreground/90`}>
              LegionIQ and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid for the service in the past 12 months.
            </p>
          </section>

          <section className={spacing}>
            <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
              9. Termination
            </h2>
            <p className={`${textSize} text-foreground/90`}>
              We reserve the right to suspend or terminate your account for violations of these terms. You may terminate your account at any time by contacting us or deleting your account through the service.
            </p>
          </section>

          <section className={spacing}>
            <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
              10. Changes to Terms
            </h2>
            <p className={`${textSize} text-foreground/90`}>
              We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify users of significant changes.
            </p>
          </section>
        </>
      )}

      <section className={spacing}>
        <h2 className={`${sectionHeadingSize} font-semibold ${variant === "page" ? "mb-4" : "mb-2"}`}>
          {variant === "page" ? "11. Contact Information" : "5. Contact Information"}
        </h2>
        {variant === "page" && (
          <p className={`${textSize} text-foreground/90 mb-4`}>
            For questions about these Terms of Service, please contact:
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

