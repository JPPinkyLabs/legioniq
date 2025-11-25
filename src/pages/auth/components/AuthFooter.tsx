import { useDateUtils } from "@/hooks/formatting/useDateUtils";

const AuthFooter = () => {
  const { getCurrentYear } = useDateUtils();

  return (
    <>
      <p className="text-center text-sm text-muted-foreground">
        Built by gamers, powered by AI
      </p>
      <p className="text-center text-xs text-muted-foreground">
        © {getCurrentYear()}{' '}
        <a
          href="https://pinkylabs.io"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          PINKY LABS LLC
        </a>
        . All rights reserved.
      </p>
    </>
  );
};

export default AuthFooter;

