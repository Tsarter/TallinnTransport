/**
 * FeedbackButton component for user feedback link
 */

export function FeedbackButton() {
  return (
    <a
      id="feedback-btn"
      href="https://tally.so/r/meb90O"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        right: '20px',
        top: '20px',
        zIndex: 1000,
        cursor: 'pointer',
        background: 'none',
        border: 'none',
      }}
    >
      <img
        src="/assets/FeedbackIcon.svg"
        alt="Feedback"
        style={{ width: '35px', height: '35px', display: 'block' }}
      />
    </a>
  );
}
