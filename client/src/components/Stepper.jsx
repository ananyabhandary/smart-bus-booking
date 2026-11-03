const STEPS = ['Search', 'Choose bus', 'Select seats', 'Passengers & pay', 'Confirmed'];

export default function Stepper({ current, onGo }) {
  return (
    <nav aria-label="Booking progress">
      <ol className="stepper">
        {STEPS.map((label, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo';
          const canGo = state === 'done' && current < 4;
          return (
            <li key={label} className={`step ${state}`} aria-current={state === 'current' ? 'step' : undefined}>
              {canGo ? (
                <button type="button" onClick={() => onGo(i)} aria-label={`Go back to ${label}`}>
                  <span className="dot">✓</span>
                  <span className="label">{label}</span>
                </button>
              ) : (
                <span className="stepinner">
                  <span className="dot">{state === 'done' ? '✓' : i + 1}</span>
                  <span className="label">{label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
