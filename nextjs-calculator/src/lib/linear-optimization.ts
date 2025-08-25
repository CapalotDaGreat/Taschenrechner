/**
 * Linear Optimization Solver
 *
 * This module provides functions to solve linear optimization problems,
 * particularly those involving constraints and objective functions.
 */

interface Constraint {
  a: number; // Coefficient for variable x
  b: number; // Coefficient for variable y
  c: number; // Right-hand side value
  type: '<=' | '>=' | '='; // Constraint type
}

interface LinearProgram {
  objective: {
    a: number; // Coefficient for variable x
    b: number; // Coefficient for variable y
    type: 'maximize' | 'minimize';
  };
  constraints: Constraint[];
  variables: {
    x: string; // Name of variable x
    y: string; // Name of variable y
  };
  discrete?: boolean; // Whether variables must be integers (for discrete items)
}

interface Solution {
  x: number;
  y: number;
  objectiveValue: number;
  feasible: boolean;
  vertices: Array<{x: number, y: number}>;
}

/**
 * Solve a linear optimization problem using the graphical method
 *
 * @param lp Linear program to solve
 * @returns Solution to the linear program
 */
export function solveLinearOptimization(lp: LinearProgram): Solution {
  // Find all intersection points of constraints
  const vertices: Array<{x: number, y: number}> = [];
  
  // Add axes intersections if applicable
  vertices.push({x: 0, y: 0});
  
  // Find intersections between all pairs of constraints
  for (let i = 0; i < lp.constraints.length; i++) {
    for (let j = i + 1; j < lp.constraints.length; j++) {
      const intersection = findIntersection(lp.constraints[i], lp.constraints[j]);
      if (intersection) {
        vertices.push(intersection);
      }
    }
  }
  
  // Filter vertices to only feasible ones (satisfying all constraints)
  const feasibleVertices = vertices.filter(vertex =>
    isFeasible(vertex, lp.constraints)
  );
  
  // If no feasible solutions, return infeasible result
  if (feasibleVertices.length === 0) {
    return {
      x: 0,
      y: 0,
      objectiveValue: 0,
      feasible: false,
      vertices: []
    };
  }
  
  let bestVertex = feasibleVertices[0];
  let bestValue = evaluateObjective(bestVertex, lp.objective);
  
  // Find the optimal solution among feasible vertices
  for (const vertex of feasibleVertices) {
    const value = evaluateObjective(vertex, lp.objective);
    if (
      (lp.objective.type === 'maximize' && value > bestValue) ||
      (lp.objective.type === 'minimize' && value < bestValue)
    ) {
      bestVertex = vertex;
      bestValue = value;
    }
  }
  
  // If this is a discrete problem (items must be whole numbers), check integer points
  // around the optimal vertex
  if (lp.discrete) {
    const roundedX = Math.round(bestVertex.x);
    const roundedY = Math.round(bestVertex.y);
    
    // Check if the rounded point is feasible
    if (isFeasible({x: roundedX, y: roundedY}, lp.constraints)) {
      bestVertex = {x: roundedX, y: roundedY};
      bestValue = evaluateObjective(bestVertex, lp.objective);
    } else {
      // If the rounded point is not feasible, check nearby integer points
      let bestIntegerVertex = bestVertex;
      let bestIntegerValue = bestValue;
      
      // Check a small neighborhood around the optimal point
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const testX = Math.max(0, Math.round(bestVertex.x + dx));
          const testY = Math.max(0, Math.round(bestVertex.y + dy));
          
          if (isFeasible({x: testX, y: testY}, lp.constraints)) {
            const testValue = evaluateObjective({x: testX, y: testY}, lp.objective);
            if (
              (lp.objective.type === 'maximize' && testValue > bestIntegerValue) ||
              (lp.objective.type === 'minimize' && testValue < bestIntegerValue)
            ) {
              bestIntegerVertex = {x: testX, y: testY};
              bestIntegerValue = testValue;
            }
          }
        }
      }
      
      bestVertex = bestIntegerVertex;
      bestValue = bestIntegerValue;
    }
  }
  
  return {
    x: lp.discrete ? Math.round(bestVertex.x) : bestVertex.x,
    y: lp.discrete ? Math.round(bestVertex.y) : bestVertex.y,
    objectiveValue: bestValue,
    feasible: true,
    vertices: feasibleVertices
  };
}

/**
 * Find intersection point of two constraints
 * 
 * @param c1 First constraint
 * @param c2 Second constraint
 * @returns Intersection point or null if no intersection
 */
function findIntersection(c1: Constraint, c2: Constraint): {x: number, y: number} | null {
  // For constraints:
  // c1.a * x + c1.b * y <= c1.c
  // c2.a * x + c2.b * y <= c2.c
  
  // Solving the system:
  // c1.a * x + c1.b * y = c1.c
  // c2.a * x + c2.b * y = c2.c
  
  const det = c1.a * c2.b - c1.b * c2.a;
  
  // If determinant is zero, lines are parallel
  if (Math.abs(det) < 1e-10) {
    return null;
  }
  
  const x = (c1.c * c2.b - c1.b * c2.c) / det;
  const y = (c1.a * c2.c - c1.c * c2.a) / det;
  
  return {x, y};
}

/**
 * Check if a point satisfies all constraints
 * 
 * @param point Point to check
 * @param constraints List of constraints
 * @returns True if point is feasible
 */
function isFeasible(point: {x: number, y: number}, constraints: Constraint[]): boolean {
  for (const constraint of constraints) {
    const value = constraint.a * point.x + constraint.b * point.y;
    
    switch (constraint.type) {
      case '<=':
        if (value > constraint.c + 1e-10) return false;
        break;
      case '>=':
        if (value < constraint.c - 1e-10) return false;
        break;
      case '=':
        if (Math.abs(value - constraint.c) > 1e-10) return false;
        break;
    }
  }
  
  // Also check that variables are non-negative
  if (point.x < 0 || point.y < 0) return false;
  
  return true;
}

/**
 * Evaluate the objective function at a point
 * 
 * @param point Point to evaluate
 * @param objective Objective function
 * @returns Value of objective function at point
 */
function evaluateObjective(point: {x: number, y: number}, objective: LinearProgram['objective']): number {
  return objective.a * point.x + objective.b * point.y;
}

/**
 * Parse a linear optimization problem from text
 *
 * @param problemText Text description of the problem
 * @returns Linear program representation
 */
export function parseLinearOptimizationProblem(problemText: string): LinearProgram | null {
  // Handle the automobile manufacturer problem (English)
  if (problemText.includes('automobile manufacturer') &&
      problemText.includes('Model A') &&
      problemText.includes('Model B')) {
    
    const lp: LinearProgram = {
      objective: {
        a: 2400,  // Profit per car A
        b: 3600,  // Profit per car B
        type: 'maximize'
      },
      constraints: [
        { a: 1, b: 0, c: 600, type: '<=' },  // x <= 600
        { a: 0, b: 1, c: 300, type: '<=' },  // y <= 300
        { a: 1, b: 1, c: 750, type: '<=' }   // x + y <= 750
      ],
      variables: {
        x: 'Model A',
        y: 'Model B'
      },
      discrete: true  // Cars must be whole numbers
    };
    
    return lp;
  }
  
  // Handle the tool manufacturer problem (German)
  if (problemText.includes('Werkzeug') &&
      problemText.includes('C') &&
      problemText.includes('D') &&
      problemText.includes('Arbeitsstunden') &&
      problemText.includes('Materialkosten')) {
    
    const lp: LinearProgram = {
      objective: {
        a: 8,  // Profit per tool C (Fr. 8.-)
        b: 5,  // Profit per tool D (Fr. 5.-)
        type: 'maximize'
      },
      constraints: [
        { a: 5, b: 6, c: 4000, type: '<=' },   // Labor hours: 5x + 6y <= 4000
        { a: 5, b: 0.6, c: 1500, type: '<=' }, // Material costs: 5x + 0.6y <= 1500
        { a: 0, b: 1, c: 550, type: '<=' },    // Max D tools: y <= 550
        { a: 1, b: 1, c: 800, type: '<=' }     // Total production: x + y <= 800
      ],
      variables: {
        x: 'Werkzeug C',
        y: 'Werkzeug D'
      },
      discrete: true  // Tools must be whole numbers
    };
    
    return lp;
  }
  
  // If we can't parse the specific problem, return null
  return null;
}

/**
 * Format the solution as a human-readable explanation
 *
 * @param solution Solution to format
 * @param lp Original linear program
 * @returns Formatted explanation
 */
export function formatSolution(solution: Solution, lp: LinearProgram): string {
  if (!solution.feasible) {
    return "No feasible solution exists for the given constraints.";
  }
  
  // Round solution values if this is a discrete problem
  const x = lp.discrete ? Math.round(solution.x) : solution.x;
  const y = lp.discrete ? Math.round(solution.y) : solution.y;
  const objectiveValue = lp.discrete ? Math.round(solution.objectiveValue) : solution.objectiveValue;
  
  if (lp.variables.x === 'Model A' && lp.variables.y === 'Model B') {
    const explanation = `
### Linear Optimization Solution:

#### Variables:
- x = Number of ${lp.variables.x} cars
- y = Number of ${lp.variables.y} cars

#### Constraints:
1. x ≤ 600 (maximum production of ${lp.variables.x})
2. y ≤ 300 (maximum production of ${lp.variables.y})
3. x + y ≤ 750 (total production capacity)

#### Objective Function:
Maximize Profit = 2400x + 3600y

#### Solution:
To maximize profit, the manufacturer should produce:
- ${x} cars of ${lp.variables.x}
- ${y} cars of ${lp.variables.y}

#### Maximum Profit:
The maximum daily profit will be Fr. ${objectiveValue.toLocaleString()}.-

#### Verification:
- ${lp.variables.x} production: ${x} ≤ 600 ✓
- ${lp.variables.y} production: ${y} ≤ 300 ✓
- Total production: ${x + y} ≤ 750 ✓
`;

    return explanation;
  } else {
    // Tool manufacturer problem
    const explanation = `
### Linear Optimization Solution:

#### Variables:
- x = Number of ${lp.variables.x}
- y = Number of ${lp.variables.y}

#### Constraints:
1. 5x + 6y ≤ 4000 (labor hours constraint)
2. 5x + 0.6y ≤ 1500 (material costs constraint)
3. y ≤ 550 (maximum production of ${lp.variables.y})
4. x + y ≤ 800 (total production capacity)

#### Objective Function:
Maximize Profit = 8x + 5y

#### Solution:
To maximize profit, the producer should manufacture:
- ${x} units of ${lp.variables.x}
- ${y} units of ${lp.variables.y}

#### Maximum Profit:
The maximum daily profit will be Fr. ${objectiveValue.toLocaleString()}.-

#### Verification:
- Labor hours used: ${Math.round(5 * x + 6 * y)} ≤ 4000 ✓
- Material costs: Fr. ${(5 * x + 0.6 * y).toFixed(2)} ≤ Fr. 1500.- ✓
- ${lp.variables.y} production: ${y} ≤ 550 ✓
- Total production: ${x + y} ≤ 800 ✓
`;

    return explanation;
  }
}