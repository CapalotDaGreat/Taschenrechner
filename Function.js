document.addEventListener("DOMContentLoaded", function() {
    const problemInput = document.getElementById("problem-input");
    const calculateBtn = document.getElementById("calculate-btn");
    const resultOutput = document.getElementById("result-output");
    const explanationOutput = document.getElementById("explanation-output");

    calculateBtn.addEventListener("click", calculateAndExplain);
    problemInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            calculateAndExplain();
        }
    });

    function calculateAndExplain() {
        const input = problemInput.value.trim();
        if (!input) {
            showError("Please enter a mathematical problem.");
            return;
        }

        try {
            if (input.toLowerCase().includes("derivative") || input.toLowerCase().includes("deriv")) {
                handleDerivative(input);
            } else if (input.toLowerCase().includes("integrate") || input.toLowerCase().includes("integral")) {
                handleIntegration(input);
            } else if (input.toLowerCase().includes("probability") || input.toLowerCase().includes("prob")) {
                handleProbability(input);
            } else if (input.toLowerCase().includes("solve") || input.toLowerCase().includes("equation")) {
                handleEquation(input);
            } else if (input.toLowerCase().includes("factorial") || input.includes("!")) {
                handleFactorial(input);
            } else if (input.toLowerCase().includes("simplify")) {
                handleSimplify(input);
            } else {
                const result = math.evaluate(input);
                displayResult(result);
                provideExplanation(input, result);
            }
        } catch (error) {
            showError("Error: " + error.message);
        }
    }

    function handleDerivative(input) {
        const match = input.match(/derivative\s+of\s+(.+)$/i) ||
            input.match(/deriv\s+of\s+(.+)$/i) ||
            input.match(/derivative\s*\(\s*(.+)\s*\)/i);

        if (!match) {
            showError("Please format as 'derivative of f(x)' or 'derivative(f(x))'");
            return;
        }

        let expression = match[1].trim();
        let variable = 'x';

        if (expression.includes("with respect to")) {
            const parts = expression.split("with respect to");
            expression = parts[0].trim();
            variable = parts[1].trim();
        }

        try {
            const derivative = math.derivative(expression, variable).toString();
            const result = math.simplify(derivative).toString();

            displayResult(result);

            explanationOutput.innerHTML = `
                <p>Taking the derivative of ${math.parse(expression).toTex()} with respect to ${variable}:</p>
                <p class="math">\\frac{d}{d${variable}}\\left(${math.parse(expression).toTex()}\\right) = ${math.parse(derivative).toTex()}</p>
                <p>Simplified result: ${math.parse(result).toTex()}</p>
                <p>The derivative represents the rate of change of the function with respect to ${variable}.</p>
            `;

            renderMathJax();
        } catch (error) {
            showError("Error computing derivative: " + error.message);
        }
    }

    function handleIntegration(input) {
        showError("Integration functionality is not fully implemented yet. You can use other operations like derivatives, equations, and regular calculations.");
    }

    function handleProbability(input) {
        if (input.toLowerCase().includes("combination") || input.toLowerCase().includes("ncr")) {
            const match = input.match(/(\d+)\s*c\s*(\d+)/i) ||
                input.match(/combination\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);

            if (match) {
                const n = parseInt(match[1]);
                const r = parseInt(match[2]);

                if (n >= r && r >= 0) {
                    const result = calculateCombination(n, r);
                    displayResult(result);

                    explanationOutput.innerHTML = `
                        <p>Calculating ${n} choose ${r} (combinations):</p>
                        <p class="math">\\binom{${n}}{${r}} = \\frac{${n}!}{${r}!(${n-r})!}</p>
                        <p>This represents the number of ways to choose ${r} items from a set of ${n} items where order doesn't matter.</p>
                        <p>Step-by-step calculation:</p>
                        <p>${n}! = ${factorial(n)}</p>
                        <p>${r}! = ${factorial(r)}</p>
                        <p>(${n}-${r})! = ${n-r}! = ${factorial(n-r)}</p>
                        <p>\\binom{${n}}{${r}} = \\frac{${factorial(n)}}{${factorial(r)} \\times ${factorial(n-r)}} = ${result}</p>
                    `;

                    renderMathJax();
                } else {
                    showError("For combinations, n must be >= r and both must be non-negative.");
                }
            } else {
                showError("Format should be 'nCr' or 'combination(n,r)'");
            }
        } else if (input.toLowerCase().includes("permutation") || input.toLowerCase().includes("npr")) {
            const match = input.match(/(\d+)\s*p\s*(\d+)/i) ||
                input.match(/permutation\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);

            if (match) {
                const n = parseInt(match[1]);
                const r = parseInt(match[2]);

                if (n >= r && r >= 0) {
                    const result = calculatePermutation(n, r);
                    displayResult(result);

                    explanationOutput.innerHTML = `
                        <p>Calculating ${n}P${r} (permutations):</p>
                        <p class="math">${n}P${r} = \\frac{${n}!}{(${n}-${r})!}</p>
                        <p>This represents the number of ways to arrange ${r} items from a set of ${n} items where order matters.</p>
                        <p>Step-by-step calculation:</p>
                        <p>${n}! = ${factorial(n)}</p>
                        <p>(${n}-${r})! = ${n-r}! = ${factorial(n-r)}</p>
                        <p>${n}P${r} = \\frac{${factorial(n)}}{${factorial(n-r)}} = ${result}</p>
                    `;

                    renderMathJax();
                } else {
                    showError("For permutations, n must be >= r and both must be non-negative.");
                }
            } else {
                showError("Format should be 'nPr' or 'permutation(n,r)'");
            }
        } else {
            showError("Please specify a probability operation (e.g., '5 C 2' for combinations or '5 P 2' for permutations)");
        }
    }

    function handleEquation(input) {
        const match = input.match(/solve\s+(.+)\s*=\s*(.+)/i) ||
            input.match(/equation\s+(.+)\s*=\s*(.+)/i);

        if (!match) {
            showError("Please format as 'solve f(x) = g(x)'");
            return;
        }

        try {
            const leftSide = match[1].trim();
            const rightSide = match[2].trim();
            const variable = findVariable(leftSide + rightSide);

            if (!variable) {
                showError("Could not identify a variable to solve for. Use x, y, z, etc.");
                return;
            }

            const equation = `${leftSide} - (${rightSide})`;

            const solutions = math.solve(equation, variable);

            if (solutions.length === 0) {
                displayResult("No solutions found");
                explanationOutput.innerHTML = `
                    <p>No solutions exist for the equation ${leftSide} = ${rightSide}.</p>
                `;
            } else {
                const solutionsText = solutions.map(sol => `${variable} = ${sol}`).join(", ");
                displayResult(solutionsText);

                explanationOutput.innerHTML = `
                    <p>Solving the equation: ${leftSide} = ${rightSide}</p>
                    <p>Rearranging to standard form: ${leftSide} - (${rightSide}) = 0</p>
                    <p>Finding values of ${variable} that satisfy this equation:</p>
                    <p>Solutions: ${solutionsText}</p>
                `;

                const verifications = solutions.map(sol => {
                    const leftEval = math.evaluate(leftSide, {[variable]: sol});
                    const rightEval = math.evaluate(rightSide, {[variable]: sol});
                    return `When ${variable} = ${sol}: ${leftSide} = ${leftEval}, ${rightSide} = ${rightEval}`;
                }).join("<br>");

                explanationOutput.innerHTML += `
                    <p>Verification:</p>
                    <p>${verifications}</p>
                `;
            }
        } catch (error) {
            showError("Error solving equation: " + error.message);
        }
    }

    function handleFactorial(input) {
        const factRegex = /(\d+)!/;
        const funcRegex = /factorial\s*\(\s*(\d+)\s*\)/i;

        const factMatch = input.match(factRegex);
        const funcMatch = input.match(funcRegex);

        if (factMatch || funcMatch) {
            const n = parseInt((factMatch ? factMatch[1] : funcMatch[1]));

            if (n > 170) {
                showError("Factorial would overflow. Please use a smaller number.");
                return;
            }

            const result = factorial(n);
            displayResult(result);

            let explanation = `<p>Calculating ${n}!</p>`;
            explanation += `<p>${n}! = ${n}`;

            for (let i = n-1; i >= 2; i--) {
                explanation += ` × ${i}`;
            }

            if (n > 1) {
                explanation += ` × 1`;
            }

            explanation += ` = ${result}</p>`;
            explanation += `<p>Factorial represents the product of all positive integers less than or equal to ${n}.</p>`;

            explanationOutput.innerHTML = explanation;
        } else {
            showError("Format should be 'n!' or 'factorial(n)'");
        }
    }

    function handleSimplify(input) {

        const match = input.match(/simplify\s+(.+)/i);

        if (!match) {
            showError("Please format as 'simplify expression'");
            return;
        }

        const expression = match[1].trim();

        try {
            const simplified = math.simplify(expression).toString();
            displayResult(simplified);

            explanationOutput.innerHTML = `
                <p>Simplifying the expression: ${expression}</p>
                <p>Steps involve combining like terms and applying algebraic rules.</p>
                <p>Original expression: ${math.parse(expression).toTex()}</p>
                <p>Simplified result: ${math.parse(simplified).toTex()}</p>
            `;

            renderMathJax();
        } catch (error) {
            showError("Error simplifying expression: " + error.message);
        }
    }

    function provideExplanation(input, result) {
        const expression = math.parse(input);
        const operations = identifyOperations(expression);

        let explanation = "<p>Calculation breakdown:</p>";
        explanation += `<p>${formatExpression(input)} = ${result}</p>`;

        if (operations.length > 0) {
            explanation += "<p>Order of operations followed:</p><ol>";
            operations.forEach(op => {
                explanation += `<li>${op}</li>`;
            });
            explanation += "</ol>";
        }

        explanationOutput.innerHTML = explanation;
    }

    function identifyOperations(node) {
        const operations = [];

        if (node.type === 'OperatorNode') {
            const leftOps = node.args[0].type === 'OperatorNode' ? identifyOperations(node.args[0]) : [];
            const rightOps = node.args[1].type === 'OperatorNode' ? identifyOperations(node.args[1]) : [];

            operations.push(...leftOps);
            operations.push(...rightOps);

            const left = node.args[0].toString();
            const right = node.args[1].toString();
            operations.push(`${getOperationName(node.op)}: ${left} ${node.op} ${right} = ${node.evaluate()}`);
        } else if (node.type === 'FunctionNode') {
            const args = node.args.map(arg => arg.toString()).join(', ');
            operations.push(`Apply function ${node.name} to ${args}`);
        }

        return operations;
    }

    function getOperationName(op) {
        const map = {
            '+': 'Addition',
            '-': 'Subtraction',
            '*': 'Multiplication',
            '/': 'Division',
            '^': 'Exponentiation',
            '%': 'Modulo'
        };
        return map[op] || 'Operation';
    }

    function formatExpression(expr) {
        return expr.replace(/\*/g, '×').replace(/\//g, '÷');
    }

    function displayResult(result) {
        resultOutput.textContent = result;
    }

    function showError(message) {
        resultOutput.innerHTML = `<span style="color: red">${message}</span>`;
        explanationOutput.textContent = "";
    }

    function calculateCombination(n, r) {
        return factorial(n) / (factorial(r) * factorial(n - r));
    }

    function calculatePermutation(n, r) {
        return factorial(n) / factorial(n - r);
    }

    function factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    function findVariable(expr) {
        const vars = ['x', 'y', 'z', 'a', 'b', 'c', 't', 'u', 'v', 'w'];
        for (const v of vars) {
            if (expr.includes(v)) {
                return v;
            }
        }
        return null;
    }

    function renderMathJax() {

        if (typeof MathJax === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
            script.async = true;
            document.head.appendChild(script);

            window.MathJax = {
                tex: {
                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                    displayMath: [['$$', '$$'], ['\\[', '\\]']]
                },
                options: {
                    enableMenu: false
                }
            };
        } else {

            MathJax.typeset();
        }
    }
});
