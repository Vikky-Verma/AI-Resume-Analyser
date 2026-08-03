import { useEffect, useState } from "react";

/**
 * Cycles through `words`, typing each one out then deleting it before
 * moving to the next. Renders as an inline <span> so it can sit inside a
 * heading alongside static text.
 */
const TypewriterText = ({
  words = [],
  typingSpeed = 65,
  deletingSpeed = 35,
  pauseAfterTyping = 1400,
  pauseAfterDeleting = 300,
  className = "",
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("typing"); // typing | pausing | deleting

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!words.length) return;
    if (prefersReducedMotion) {
      setText(words[0]);
      return;
    }

    const current = words[wordIndex % words.length];
    let timeout;

    if (phase === "typing") {
      if (text.length < current.length) {
        timeout = setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          typingSpeed
        );
      } else {
        timeout = setTimeout(() => setPhase("pausing"), pauseAfterTyping);
      }
    } else if (phase === "pausing") {
      timeout = setTimeout(() => setPhase("deleting"), 0);
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timeout = setTimeout(
          () => setText(current.slice(0, text.length - 1)),
          deletingSpeed
        );
      } else {
        timeout = setTimeout(() => {
          setWordIndex((i) => (i + 1) % words.length);
          setPhase("typing");
        }, pauseAfterDeleting);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, phase, wordIndex, words, typingSpeed, deletingSpeed, pauseAfterTyping, pauseAfterDeleting, prefersReducedMotion]);

  return (
    <span className={className}>
      {text}
      <span className="animate-caret inline-block w-[2px] h-[1em] align-middle ml-0.5 bg-current" />
    </span>
  );
};

export default TypewriterText;