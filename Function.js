document.addEventListener("DOMContentLoaded", function() {
    const problemInput = document.getElementById("problem-input");
    const calculateBtn = document.getElementById("calculate-btn");
    const resultOutput = document.getElementById("result-output");
    const explanationOutput = document.getElementById("explanation-output");

    calculateBtn.addEventListener("click", calculateAndExplain);
    problemInput.addEventListener("keydown", function (event) {
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
                        <p class="math">\\binom{${n}}{${r}} = \\frac{${n}!}{${r}!(${n - r})!}</p>
                        <p>This represents the number of ways to choose ${r} items from a set of ${n} items where order doesn't matter.</p>
                        <p>Step-by-step calculation:</p>
                        <p>${n}! = ${factorial(n)}</p>
                        <p>${r}! = ${factorial(r)}</p>
                        <p>(${n}-${r})! = ${n - r}! = ${factorial(n - r)}</p>
                        <p>\\binom{${n}}{${r}} = \\frac{${factorial(n)}}{${factorial(r)} \\times ${factorial(n - r)}} = ${result}</p>
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
                        <p>(${n}-${r})! = ${n - r}! = ${factorial(n - r)}</p>
                        <p>${n}P${r} = \\frac{${factorial(n)}}{${factorial(n - r)}} = ${result}</p>
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
})