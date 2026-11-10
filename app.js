const state = {
  voltage: 6,
  resistance: 3,
  closed: true,
  study: 'voltage',
  challengeIndex: 0,
  correct: new Set(),
  meterRevealed: false,
  challengeMathCorrect: false,
  diagnosisPrediction: '',
};

const byId = (id) => document.getElementById(id);
const format = (value, digits = 2) => Number(value).toFixed(digits);
const current = (voltage, resistance, closed = true) => closed ? voltage / resistance : 0;

const challengeData = [
  { voltage: 6, resistance: 3, answer: 2, unit: 'A', question: 'Set the battery to 6 V and the resistor to 3 Ω. What current should the ammeter show?', known: 'Known: V = 6 V · R = 3 Ω · Find: I', context: 'Use I = V ÷ R. Enter your predicted current before revealing the meter.', hint: 'Divide the voltage by the resistance: 6 ÷ 3.' },
  { voltage: 9, resistance: 3, answer: 3, unit: 'A', question: 'Set the battery to 9 V and keep the resistor at 3 Ω. How does the current compare with Question 1?', known: 'Known: V = 9 V · R = 3 Ω · Find: I', context: 'Calculate the current. Then compare it with the 2 A reading from Question 1.', hint: 'The resistance stayed the same. Calculate 9 ÷ 3, then compare with 2 A.' },
  { voltage: 12, resistance: 4, answer: 3, unit: 'A', question: 'Set the battery to 12 V and the resistor to 4 Ω. What current should flow?', known: 'Known: V = 12 V · R = 4 Ω · Find: I', context: 'Choose the form of Ohm’s Law that gives you current.', hint: 'I = V ÷ R. Substitute: 12 ÷ 4.' },
  { voltage: 6, resistance: 5, answer: 10, unit: 'V', targetCurrent: 2, question: 'A current of 2 A flows through a 5 Ω resistor. What battery voltage would produce this current?', known: 'Known: I = 2 A · R = 5 Ω · Find: V', context: 'Use V = I × R. You can adjust the battery slider until the ammeter reaches 2 A.', hint: 'Multiply the current by the resistance: 2 × 5.' },
  { voltage: 8, resistance: 3, answer: 4, unit: 'Ω', targetCurrent: 2, question: 'The battery is set to 8 V. If the ammeter reads 2 A, what resistance should the resistor have?', known: 'Known: V = 8 V · I = 2 A · Find: R', context: 'Use R = V ÷ I. Adjust the resistor slider to test your answer.', hint: 'Divide the voltage by the current: 8 ÷ 2.' },
  { voltage: 12, resistance: 6, answer: 2, unit: 'A', question: 'Keep the battery at 12 V. Change the resistor from 3 Ω to 6 Ω. What happens to the current?', known: 'Known: V = 12 V · R = 6 Ω · Find: I', context: 'Calculate the current with the 6 Ω resistor and compare it with 4 A at 3 Ω.', hint: 'The new resistance is 6 Ω. Calculate 12 ÷ 6.' },
  { voltage: 6, resistance: 4, answer: 10, unit: 'V', targetCurrent: 2.5, question: 'A 4 Ω resistor should carry a current of 2.5 A. Which battery voltage would produce it?', known: 'Known: I = 2.5 A · R = 4 Ω · Find: V', context: 'Use V = I × R. Adjust the battery until the ammeter reads 2.5 A.', hint: 'Multiply the current by the resistance: 2.5 × 4.' },
  { voltage: 15, resistance: 3, answer: 5, unit: 'Ω', targetCurrent: 3, question: 'The battery is 15 V and the ammeter reads 3 A. What is the resistance?', known: 'Known: V = 15 V · I = 3 A · Find: R', context: 'Use R = V ÷ I. Adjust the resistor until the ammeter reads 3 A.', hint: 'Divide the voltage by the current: 15 ÷ 3.' },
];

function updateCircuit() {
  const amps = current(state.voltage, state.resistance, state.closed);
  byId('voltage-control').value = state.voltage;
  byId('resistance-control').value = state.resistance;
  byId('voltage-output').textContent = `${state.voltage} V`;
  byId('resistance-output').textContent = `${state.resistance} Ω`;
  byId('svg-voltage').textContent = `${state.voltage} V`;
  byId('svg-resistance').textContent = `${state.resistance} Ω`;
  byId('current-reading').textContent = format(amps);
  byId('voltage-reading').textContent = format(state.voltage, 1);
  byId('resistance-reading').textContent = format(state.resistance, 1);
  byId('current-bar').style.width = `${Math.max(0, Math.min(100, amps / 6 * 100))}%`;
  document.querySelector('.circuit-stage').classList.toggle('is-open', !state.closed);
  byId('circuit-status').textContent = state.closed ? 'CIRCUIT CLOSED' : 'CIRCUIT OPEN';
  byId('circuit-status-dot').style.background = state.closed ? '#61a77f' : '#dc8a69';
  byId('explore-switch').textContent = state.closed ? 'Open the switch ↗' : 'Close the switch ↗';
  byId('explore-switch').setAttribute('aria-pressed', String(state.closed));
  byId('meter-note').textContent = state.closed
    ? 'The path is complete, so charges can move around the circuit.'
    : 'The path is broken, so there is no current in the circuit.';
  byId('observation-text').innerHTML = state.closed
    ? `With <strong>${state.resistance} Ω</strong> of resistance, a <strong>${state.voltage} V</strong> battery produces <strong>${format(amps)} A</strong> of current.`
    : `The battery is still <strong>${state.voltage} V</strong>, but the open path stops current from flowing.`;
  byId('diagnose-current').textContent = format(amps);
  byId('diagnose-status').textContent = state.closed ? 'PATH CLOSED' : 'PATH OPEN';
  byId('diagnose-gap').textContent = state.closed ? '✓' : '×';
  document.querySelector('.diagnose-observation').classList.toggle('is-open', !state.closed);
  byId('diagnose-explanation').textContent = state.closed
    ? 'A closed circuit gives charges a complete path to move around.'
    : 'An open circuit interrupts the path. Charges cannot keep moving around the circuit.';
  byId('challenge-voltage-control').value = state.voltage;
  byId('challenge-resistance-control').value = state.resistance;
  byId('challenge-voltage-output').textContent = `${state.voltage} V`;
  byId('challenge-resistance-output').textContent = `${state.resistance} Ω`;
  byId('challenge-svg-voltage').textContent = `${state.voltage} V`;
  byId('challenge-svg-resistance').textContent = `${state.resistance} Ω`;
  updateChallengeMeter(amps);
}

function updateChallengeMeter(amps = current(state.voltage, state.resistance, state.closed)) {
  byId('challenge-current').textContent = state.meterRevealed ? format(amps) : '?';
  byId('challenge-meter-status').textContent = state.meterRevealed ? 'LIVE AMMETER READING' : 'PREDICT BEFORE REVEALING';
  byId('challenge-sim-note').textContent = state.meterRevealed
    ? `The live meter reads ${format(amps)} A for the values currently set in the circuit.`
    : 'Adjust the controls if needed. Calculate first; your answer reveals the meter reading.';
}

function renderStudyGraph() {
  const changingVoltage = state.study === 'voltage';
  const fixed = Number(byId('fixed-control').value);
  const changing = Number(byId('study-control').value);
  const xMax = changingVoltage ? 18 : 12;
  const yScaleMax = Math.max(1, Math.ceil(18 / fixed));
  const x = 62 + changing / xMax * 468;
  const amps = changingVoltage ? changing / fixed : fixed / changing;
  const y = 260 - amps / yScaleMax * 230;
  const yEnd = changingVoltage ? 260 - (18 / fixed) / yScaleMax * 230 : 260 - (fixed / 12) / yScaleMax * 230;
  byId('graph-curve').setAttribute('d', changingVoltage
    ? `M62 260 L530 ${yEnd}`
    : `M${62 + 1 / 12 * 468} ${260 - fixed / yScaleMax * 230} C${62 + 3 / 12 * 468} ${260 - fixed / 3 / yScaleMax * 230}, ${62 + 8 / 12 * 468} ${260 - fixed / 8 / yScaleMax * 230}, 530 ${yEnd}`);
  byId('graph-marker').setAttribute('cx', x);
  byId('graph-marker').setAttribute('cy', y);
  byId('graph-marker-label').setAttribute('x', Math.min(425, x + 12));
  byId('graph-marker-label').setAttribute('y', Math.max(25, y - 10));
  byId('graph-marker-label').textContent = changingVoltage
    ? `${changing} V · ${format(amps)} A`
    : `${changing} Ω · ${format(amps)} A`;
  byId('graph-y-max').textContent = String(yScaleMax);
  byId('graph-x-max').textContent = String(xMax);
  byId('graph-variable').textContent = changingVoltage ? 'voltage' : 'resistance';
  byId('x-axis-label').textContent = changingVoltage ? 'V (V)' : 'R (Ω)';
  byId('graph-equation').textContent = changingVoltage ? `I = V ÷ ${fixed} Ω` : `I = ${fixed} V ÷ R`;
  byId('graph-insight-text').textContent = changingVoltage
    ? 'With resistance fixed, increasing voltage also increases current.'
    : 'With voltage fixed, increasing resistance decreases current.';
}

function setStudy(mode) {
  state.study = mode;
  const changingVoltage = mode === 'voltage';
  document.querySelectorAll('.segment').forEach((button) => {
    const active = button.dataset.study === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  byId('study-description').textContent = changingVoltage
    ? 'Keep resistance fixed. Raise voltage and observe the current.'
    : 'Keep voltage fixed. Raise resistance and observe the current.';
  byId('investigation-question').innerHTML = changingVoltage
    ? '<strong>Predict:</strong> If resistance stays the same and voltage increases, what will happen to current?'
    : '<strong>Predict:</strong> If voltage stays the same and resistance increases, what will happen to current?';
  byId('fixed-label').innerHTML = changingVoltage
    ? 'Fixed resistance <strong><output id="fixed-output">3 Ω</output></strong>'
    : 'Fixed voltage <strong><output id="fixed-output">6 V</output></strong>';
  byId('study-label').innerHTML = changingVoltage
    ? 'Voltage <strong><output id="study-output">6 V</output></strong>'
    : 'Resistance <strong><output id="study-output">3 Ω</output></strong>';
  byId('fixed-control').max = changingVoltage ? '12' : '18';
  byId('fixed-control').value = changingVoltage ? state.resistance : state.voltage;
  byId('study-control').max = changingVoltage ? '18' : '12';
  byId('study-control').value = changingVoltage ? state.voltage : state.resistance;
  byId('fixed-output').textContent = `${byId('fixed-control').value}${changingVoltage ? ' Ω' : ' V'}`;
  byId('study-output').textContent = `${byId('study-control').value}${changingVoltage ? ' V' : ' Ω'}`;
  byId('fixed-min').textContent = changingVoltage ? '1 Ω' : '1 V';
  byId('fixed-max').textContent = changingVoltage ? '12 Ω' : '18 V';
  byId('study-min').textContent = changingVoltage ? '1 V' : '1 Ω';
  byId('study-max').textContent = changingVoltage ? '18 V' : '12 Ω';
  byId('investigation-answer').value = '';
  byId('investigation-feedback').textContent = '';
  byId('investigation-feedback').className = 'feedback';
  renderStudyGraph();
}

function renderChallenge() {
  const item = challengeData[state.challengeIndex];
  state.voltage = item.voltage;
  state.resistance = item.resistance;
  state.closed = true;
  state.meterRevealed = false;
  byId('challenge-label').textContent = `QUESTION ${state.challengeIndex + 1} / ${challengeData.length}`;
  byId('challenge-progress-bar').style.width = `${(state.challengeIndex + 1) / challengeData.length * 100}%`;
  byId('challenge-question').textContent = item.question;
  byId('challenge-context').textContent = item.context;
  byId('equation-hint').textContent = item.known;
  byId('answer-unit').textContent = item.unit;
  byId('challenge-answer').value = '';
  byId('challenge-answer').placeholder = 'Your answer';
  byId('challenge-feedback').textContent = '';
  byId('challenge-feedback').className = 'feedback';
  byId('challenge-hint').hidden = true;
  byId('show-hint').hidden = false;
  byId('next-challenge').hidden = true;
  state.challengeMathCorrect = false;
  byId('challenge-score').textContent = `${state.correct.size} of ${challengeData.length} correct`;
  updateCircuit();
}

function checkChallenge() {
  const item = challengeData[state.challengeIndex];
  const rawAnswer = byId('challenge-answer').value;
  const answer = Number(rawAnswer);
  if (rawAnswer.trim() === '' || !Number.isFinite(answer)) {
    byId('challenge-feedback').textContent = 'Enter a value before checking your calculation.';
    byId('challenge-feedback').className = 'feedback error';
    byId('challenge-answer').focus();
    return;
  }
  state.meterRevealed = true;
  updateChallengeMeter();
  const feedback = byId('challenge-feedback');
  if (Math.abs(answer - item.answer) < 0.011) {
    state.correct.add(state.challengeIndex);
    const explanation = item.unit === 'A'
      ? `${item.voltage} V ÷ ${item.resistance} Ω = ${format(item.answer)} A`
      : item.unit === 'V'
        ? `${format(item.targetCurrent)} A × ${item.resistance} Ω = ${format(item.answer)} V`
        : `${item.voltage} V ÷ ${format(item.targetCurrent)} A = ${format(item.answer)} Ω`;
    const matchesTarget = !item.targetCurrent || Math.abs(current(state.voltage, state.resistance) - item.targetCurrent) < 0.011;
    feedback.textContent = matchesTarget
      ? `Correct! ${explanation}. The ammeter confirms your answer.`
      : `Your calculation is correct: ${explanation}. Now adjust the lab controls until the ammeter reads ${format(item.targetCurrent)} A.`;
    feedback.className = 'feedback success';
    state.challengeMathCorrect = true;
    byId('show-hint').hidden = true;
    byId('next-challenge').hidden = !matchesTarget;
    byId('next-challenge').textContent = state.challengeIndex === challengeData.length - 1 ? 'Finish questions →' : 'Next question →';
  } else {
    feedback.textContent = `Not yet. The ammeter now reads ${format(current(state.voltage, state.resistance))} A. Check the equation and try again.`;
    feedback.className = 'feedback error';
  }
  byId('challenge-score').textContent = `${state.correct.size} of ${challengeData.length} correct`;
}

function updateCompare() {
  const values = ['a', 'b'].map((key) => {
    const voltage = Number(byId(`compare-v${key}`).value);
    const resistance = Number(byId(`compare-r${key}`).value);
    const amps = voltage / resistance;
    byId(`compare-v${key}-out`).textContent = `${voltage} V`;
    byId(`compare-r${key}-out`).textContent = `${resistance} Ω`;
    byId(`compare-i${key}`).textContent = format(amps);
    return amps;
  });
  document.querySelectorAll('.compare-choice').forEach((button) => button.classList.remove('selected'));
  byId('compare-feedback').textContent = '';
  byId('compare-feedback').className = 'feedback';
  return values;
}

function navigate(view) {
  document.querySelectorAll('.step-tab').forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle('active', active);
    button.setAttribute('aria-current', active ? 'step' : 'false');
  });
  document.querySelectorAll('.view-panel').forEach((panel) => {
    const active = panel.id === `view-${view}`;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });
  if (view === 'investigate') renderStudyGraph();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

byId('start-lab').addEventListener('click', () => {
  byId('welcome-dialog').hidden = true;
  byId('explore-title').focus({ preventScroll: true });
});

document.querySelectorAll('.step-tab').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.view)));
document.querySelectorAll('[data-go]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.go)));
document.querySelectorAll('[data-next]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.next)));

byId('voltage-control').addEventListener('input', (event) => {
  state.voltage = Number(event.target.value);
  updateCircuit();
  if (state.study === 'voltage') renderStudyGraph();
});
byId('resistance-control').addEventListener('input', (event) => {
  state.resistance = Number(event.target.value);
  updateCircuit();
  if (state.study === 'resistance') renderStudyGraph();
});
byId('explore-switch').addEventListener('click', () => {
  state.closed = !state.closed;
  updateCircuit();
});

document.querySelectorAll('.segment').forEach((button) => button.addEventListener('click', () => setStudy(button.dataset.study)));
byId('fixed-control').addEventListener('input', (event) => {
  byId('fixed-output').textContent = `${event.target.value}${state.study === 'voltage' ? ' Ω' : ' V'}`;
  renderStudyGraph();
});
byId('study-control').addEventListener('input', (event) => {
  byId('study-output').textContent = `${event.target.value}${state.study === 'voltage' ? ' V' : ' Ω'}`;
  renderStudyGraph();
});
byId('check-investigation').addEventListener('click', () => {
  const expected = state.study === 'voltage' ? 'increase' : 'decrease';
  const feedback = byId('investigation-feedback');
  if (!byId('investigation-answer').value) {
    feedback.textContent = 'Choose an observation before checking your answer.';
    feedback.className = 'feedback error';
  } else if (byId('investigation-answer').value === expected) {
    feedback.textContent = state.study === 'voltage'
      ? 'Correct. Your graph shows that current increases with voltage when resistance is fixed.'
      : 'Correct. Your graph shows that current decreases as resistance increases when voltage is fixed.';
    feedback.className = 'feedback success';
  } else {
    feedback.textContent = 'Look at the graph across several settings. What direction does the current move?';
    feedback.className = 'feedback error';
  }
});

byId('challenge-voltage-control').addEventListener('input', (event) => {
  state.voltage = Number(event.target.value);
  updateCircuit();
  unlockChallengeIfVerified();
});
byId('challenge-resistance-control').addEventListener('input', (event) => {
  state.resistance = Number(event.target.value);
  updateCircuit();
  unlockChallengeIfVerified();
});
function unlockChallengeIfVerified() {
  const item = challengeData[state.challengeIndex];
  if (state.challengeMathCorrect && item.targetCurrent && Math.abs(current(state.voltage, state.resistance) - item.targetCurrent) < 0.011) {
    byId('challenge-feedback').textContent = `Correct! The ammeter now confirms ${format(item.targetCurrent)} A.`;
    byId('challenge-feedback').className = 'feedback success';
    byId('next-challenge').hidden = false;
  }
}
byId('check-answer').addEventListener('click', checkChallenge);
byId('challenge-answer').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') checkChallenge();
});
byId('show-hint').addEventListener('click', () => {
  byId('challenge-hint').textContent = challengeData[state.challengeIndex].hint;
  byId('challenge-hint').hidden = false;
  byId('show-hint').hidden = true;
});
byId('next-challenge').addEventListener('click', () => {
  if (state.challengeIndex < challengeData.length - 1) {
    state.challengeIndex += 1;
    renderChallenge();
  } else {
    byId('challenge-feedback').textContent = `You finished the worksheet calculations! ${state.correct.size} of ${challengeData.length} answers were correct.`;
    byId('challenge-feedback').className = 'feedback success';
    byId('next-challenge').hidden = true;
  }
});

document.querySelectorAll('.diagnose-option').forEach((button) => button.addEventListener('click', () => {
  state.diagnosisPrediction = button.dataset.diagnoseAnswer;
  document.querySelectorAll('.diagnose-option').forEach((option) => option.classList.toggle('selected', option === button));
  const feedback = byId('diagnose-prediction-feedback');
  feedback.textContent = state.diagnosisPrediction === 'zero'
    ? 'Good prediction. Now disconnect the wire to test it.'
    : 'Prediction recorded. Disconnect the wire and use the meter to check your idea.';
  feedback.className = `feedback ${state.diagnosisPrediction === 'zero' ? 'success' : ''}`;
  byId('disconnect-wire').disabled = false;
}));
byId('disconnect-wire').addEventListener('click', () => {
  state.closed = false;
  updateCircuit();
  if (state.diagnosisPrediction) {
    const correct = state.diagnosisPrediction === 'zero';
    byId('diagnose-prediction-feedback').textContent = correct
      ? 'Your prediction was right: the ammeter is approximately zero.'
      : 'The ammeter is approximately zero. Compare that with your prediction.';
    byId('diagnose-prediction-feedback').className = `feedback ${correct ? 'success' : 'error'}`;
  }
});
byId('repair-wire').addEventListener('click', () => {
  state.closed = true;
  updateCircuit();
});

['compare-va', 'compare-ra', 'compare-vb', 'compare-rb'].forEach((id) => byId(id).addEventListener('input', updateCompare));
document.querySelectorAll('.compare-choice').forEach((button) => button.addEventListener('click', () => {
  const amps = updateCompare();
  const winner = Math.abs(amps[0] - amps[1]) < 0.005 ? 'equal' : amps[0] > amps[1] ? 'a' : 'b';
  button.classList.add('selected');
  const feedback = byId('compare-feedback');
  feedback.textContent = button.dataset.choice === winner
    ? `Correct. Circuit A: ${format(amps[0])} A · Circuit B: ${format(amps[1])} A. ${winner === 'equal' ? 'They have equal current.' : `Circuit ${winner.toUpperCase()} has more current.`}`
    : `Check the meter readings: A = ${format(amps[0])} A and B = ${format(amps[1])} A. Which is greater?`;
  feedback.className = `feedback ${button.dataset.choice === winner ? 'success' : 'error'}`;
}));

byId('check-conclusion').addEventListener('click', () => {
  const voltageAnswer = byId('voltage-conclusion').value;
  const resistanceAnswer = byId('resistance-conclusion').value;
  const feedback = byId('conclusion-feedback');
  if (!voltageAnswer || !resistanceAnswer) {
    feedback.textContent = 'Complete both statements before checking your conclusion.';
    feedback.className = 'feedback error';
  } else if (voltageAnswer === 'increase' && resistanceAnswer === 'decrease') {
    feedback.textContent = 'Exactly. At fixed resistance, more voltage increases current; at fixed voltage, more resistance reduces current.';
    feedback.className = 'feedback success';
  } else {
    feedback.textContent = 'Use I = V ÷ R to think about what happens when you change only one quantity.';
    feedback.className = 'feedback error';
  }
});

byId('disconnect-wire').disabled = true;
setStudy('voltage');
renderChallenge();
updateCircuit();
updateCompare();
byId('start-lab').focus();
