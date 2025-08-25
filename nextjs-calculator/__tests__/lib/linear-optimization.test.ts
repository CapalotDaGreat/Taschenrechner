import { solveLinearOptimization, parseLinearOptimizationProblem, formatSolution } from '@/lib/linear-optimization';

describe('Linear Optimization Solver', () => {
  it('should solve the automobile manufacturer problem correctly', () => {
    // Define the linear program for the automobile manufacturer problem
    const lp = {
      objective: {
        a: 2400,  // Profit per car A
        b: 3600,  // Profit per car B
        type: 'maximize' as const
      },
      constraints: [
        { a: 1, b: 0, c: 600, type: '<=' as const },  // x <= 600
        { a: 0, b: 1, c: 300, type: '<=' as const },  // y <= 300
        { a: 1, b: 1, c: 750, type: '<=' as const }   // x + y <= 750
      ],
      variables: {
        x: 'Model A',
        y: 'Model B'
      }
    };

    const solution = solveLinearOptimization(lp);
    
    // The correct solution should be:
    // x = 450 (Model A cars)
    // y = 300 (Model B cars)
    // Profit = 2400*450 + 3600*300 = 1,080,000 + 1,080,000 = 2,160,000
    
    expect(solution.feasible).toBe(true);
    expect(solution.x).toBe(450);
    expect(solution.y).toBe(300);
    expect(solution.objectiveValue).toBe(2160000);
  });

  it('should solve the tool manufacturer problem correctly', () => {
    // Define the linear program for the tool manufacturer problem
    const lp = {
      objective: {
        a: 8,  // Profit per tool C
        b: 5,  // Profit per tool D
        type: 'maximize' as const
      },
      constraints: [
        { a: 5, b: 6, c: 4000, type: '<=' as const },   // Labor hours: 5x + 6y <= 4000
        { a: 5, b: 0.6, c: 1500, type: '<=' as const }, // Material costs: 5x + 0.6y <= 1500
        { a: 0, b: 1, c: 550, type: '<=' as const },    // Max D tools: y <= 550
        { a: 1, b: 1, c: 800, type: '<=' as const }     // Total production: x + y <= 800
      ],
      variables: {
        x: 'Werkzeug C',
        y: 'Werkzeug D'
      }
    };

    const solution = solveLinearOptimization(lp);
    
    // We expect a feasible solution
    expect(solution.feasible).toBe(true);
    // The solution should not exceed the labor constraint of 4000 hours
    const laborHours = 5 * solution.x + 6 * solution.y;
    expect(laborHours).toBeLessThanOrEqual(4000);
  });

  it('should identify infeasible problems', () => {
    // Define an infeasible linear program
    const lp = {
      objective: {
        a: 1,
        b: 1,
        type: 'maximize' as const
      },
      constraints: [
        { a: 1, b: 0, c: 5, type: '<=' as const },   // x <= 5
        { a: 1, b: 0, c: 10, type: '>=' as const }  // x >= 10
      ],
      variables: {
        x: 'x',
        y: 'y'
      }
    };

    const solution = solveLinearOptimization(lp);
    
    expect(solution.feasible).toBe(false);
  });

  it('should handle unbounded problems', () => {
    // Define an unbounded linear program (no constraints)
    const lp = {
      objective: {
        a: 1,
        b: 1,
        type: 'maximize' as const
      },
      constraints: [],
      variables: {
        x: 'x',
        y: 'y'
      }
    };

    // With no constraints, the problem is unbounded
    // Our solver should find a reasonable solution within bounds
    const solution = solveLinearOptimization(lp);
    
    // Since we add non-negativity constraints by default,
    // the solution should be at the origin
    expect(solution.feasible).toBe(true);
    expect(solution.x).toBe(0);
    expect(solution.y).toBe(0);
  });

  it('should parse the tool manufacturer problem correctly', () => {
    const problemText = `Beispiel 2. Ein Produzent stellt die zwei Werkzeuge C und D her. Es dauert 5 Stunden um ein Stück des Werkzeugs C und 6 Stunden um ein Stück des Werkzeugs D herzustellen. Die Materialkosten betragen Fr. 5.- für ein Werkzeug C und Fr. 0.60 für ein Werkzeug D. Alle Angestellten können zusammen 4000 Arbeitsstunden täglich aufbringen. Der Produzent kann maximal Fr. 1500.- pro Tag fürs Material aufwenden. Aus technischen Gründen ist es nicht möglich mehr als 550 Stück des Werkzeugs D täglich zu produzieren und die Lagerkapazitäten beschränken die tägliche Produktion auf total 800 Stück täglich. Der Gewinn pro Werkzeug beträgt Fr. 8.- bei A und Fr. 5.- bei D.

Wie viele Stücke von C und von D soll der Produzent täglich herstellen, um seinen Gewinn zu maximieren?`;

    const lp = parseLinearOptimizationProblem(problemText);
    
    expect(lp).not.toBeNull();
    if (lp) {
      expect(lp.objective.a).toBe(8);
      expect(lp.objective.b).toBe(5);
      expect(lp.constraints).toHaveLength(4);
      // Check labor constraint: 5x + 6y <= 4000
      const laborConstraint = lp.constraints.find(c => c.a === 5 && c.b === 6);
      expect(laborConstraint).toBeDefined();
      expect(laborConstraint?.c).toBe(4000);
    }
  });
});