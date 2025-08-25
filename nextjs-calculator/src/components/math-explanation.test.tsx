import React from "react";
import { MathExplanation } from "./math-explanation";

// Example explanation from the task
const sampleExplanation = `### Kultur A:

#### 1. Anfangswert:

- Zu Beginn der Beobachtung besteht die Kultur aus 100 Bakterien. Daher ist der Anfangswert \\( c = 100 \\).


#### 2. Wachstumsfaktor:

- Die Kultur vermehrt sich um 25% pro Stunde. Das bedeutet, dass nach einer Stunde die Anzahl der Bakterien 125% des ursprünglichen Wertes beträgt.

- Der Wachstumsfaktor \\( a \\) wird berechnet als:

\\[
a = 1 + \\text{Wachstumsrate} = 1 + 0.25 = 1.25
\\]

### Kultur B:

#### 1. Anfangswert:

- Zu Beginn der Beobachtung besteht die Kultur aus 2000 Bakterien. Daher ist der Anfangswert \\( d = 2000 \\).

#### 2. Wachstumsfaktor:

- Die Kultur reduziert sich um 10% pro Stunde. Das bedeutet, dass nach einer Stunde die Anzahl der Bakterien 90% des ursprünglichen Wertes beträgt.

- Der Wachstumsfaktor \\( b \\) wird berechnet als:

\\[
b = 1 - \\text{Reduktionsrate} = 1 - 0.10 = 0.90
\\]

Zusammenfassend haben wir:

- Für die Kultur A: \\( c = 100 \\) und \\( a = 1.25 \\)
- Für die Kultur B: \\( d = 2000 \\) und \\( b = 0.90 \\)`;

export function MathExplanationDemo() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Math Explanation Formatting Demo</h2>
      <MathExplanation explanation={sampleExplanation} />
    </div>
  );
}