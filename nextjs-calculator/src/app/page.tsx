"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MathExplanation } from "@/components/math-explanation";

export default function Calculator() {
  const [problem, setProblem] = useState("");
  const [result, setResult] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Array<{problem: string, result: string, explanation: string}>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) {
      setError("Please enter a mathematical problem.");
      return;
    }
    
    // Limit input length for safety
    if (problem.length > 1000) {
      setError("Input too long. Please limit your problem to 1000 characters.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setResult("");
    setExplanation("");
    
    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ problem: problem.trim() }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === "rejected") {
        setError(data.message || "Your request was rejected for safety reasons.");
        return;
      }
      
      if (data.status === "error") {
        setError(data.message || "An error occurred while solving the problem.");
        return;
      }
      
      const newResult = data.final_answer || "";
      const newExplanation = data.explanation || "";
      
      setResult(newResult);
      setExplanation(newExplanation);
      
      // Add to history
      const newHistoryItem = {
        problem: problem.trim(),
        result: newResult,
        explanation: newExplanation
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep only last 10 items
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'calculator-history.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [problem]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.header 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            AI-Powered Calculator
          </h1>
          <p className="text-muted-foreground mt-2">
            Solve complex math problems with step-by-step explanations
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Enter your problem</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <Textarea
                        ref={textareaRef}
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter a complex math problem in English (e.g. 'Find the derivative of x^3 + 2x^2 - 5x + 1' or 'A car travels 120 miles in 2 hours. What is its average speed?')"
                        className="min-h-[120px]"
                        disabled={isLoading}
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Supports algebra, calculus, probability, optimization, and word problems
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="min-w-[120px]"
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <span className="animate-spin mr-2">⏳</span>
                            Solving...
                          </span>
                        ) : "Solve"}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setProblem("")}
                        disabled={isLoading}
                      >
                        Reset
                      </Button>
                      
                      {result && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => copyToClipboard(result)}
                        >
                          Copy Result
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
                
                {error && (
                  <motion.div 
                    className="mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </CardContent>
            </Card>
            
            {(result || explanation) && (
              <motion.div 
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Result</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`${result}\n\n${explanation}`)}
                      >
                        Copy All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {result && (
                      <div className="mb-4 p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">Final Answer:</h3>
                        <p className="text-primary font-mono whitespace-pre-wrap">{result}</p>
                      </div>
                    )}
                    
                    {explanation && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Explanation:</h3>
                        <MathExplanation explanation={explanation} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
          
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>History</CardTitle>
                  {history.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={exportHistory}
                    >
                      Export
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {history.map((item, index) => (
                      <div 
                        key={index} 
                        className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setProblem(item.problem);
                          setResult(item.result);
                          setExplanation(item.explanation);
                        }}
                      >
                        <p className="font-medium text-sm mb-1 line-clamp-1">{item.problem}</p>
                        <p className="text-primary font-mono text-sm truncate">{item.result}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Your solved problems will appear here
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>"Find the derivative of x^2 + 3x - 5"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>"A train travels 300 km in 4 hours. What is its average speed?"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>"Solve the equation 2x + 5 = 15"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>"What is the probability of rolling a 6 on a fair die?"</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
