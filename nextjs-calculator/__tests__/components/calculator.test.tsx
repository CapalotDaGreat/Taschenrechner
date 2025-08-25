import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Calculator from '@/app/page';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
    };
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('Calculator Component', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render the calculator component', () => {
    render(<Calculator />);
    
    expect(screen.getByText('AI-Powered Calculator')).toBeInTheDocument();
    expect(screen.getByText('Enter your problem')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter a complex math problem/i)).toBeInTheDocument();
  });

  it('should show error for empty input', async () => {
    render(<Calculator />);
    
    const solveButton = screen.getByText('Solve');
    fireEvent.click(solveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a mathematical problem.')).toBeInTheDocument();
    });
  });

  it('should handle successful API response', async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        final_answer: '4',
        explanation: '2 + 2 = 4'
      })
    });
    
    render(<Calculator />);
    
    const textarea = screen.getByPlaceholderText(/Enter a complex math problem/i);
    const solveButton = screen.getByText('Solve');
    
    fireEvent.change(textarea, { target: { value: 'What is 2 + 2?' } });
    fireEvent.click(solveButton);
    
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('2 + 2 = 4')).toBeInTheDocument();
    });
  });

  it('should handle rejected API response', async () => {
    // Mock rejected API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        status: 'rejected',
        message: 'Invalid math problem'
      })
    });
    
    render(<Calculator />);
    
    const textarea = screen.getByPlaceholderText(/Enter a complex math problem/i);
    const solveButton = screen.getByText('Solve');
    
    fireEvent.change(textarea, { target: { value: 'Invalid problem' } });
    fireEvent.click(solveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid math problem')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({
        message: 'Internal server error'
      })
    });
    
    render(<Calculator />);
    
    const textarea = screen.getByPlaceholderText(/Enter a complex math problem/i);
    const solveButton = screen.getByText('Solve');
    
    fireEvent.change(textarea, { target: { value: 'What is 2 + 2?' } });
    fireEvent.click(solveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Internal server error')).toBeInTheDocument();
    });
  });

  it('should reset the form', async () => {
    render(<Calculator />);
    
    const textarea = screen.getByPlaceholderText(/Enter a complex math problem/i);
    const resetButton = screen.getByText('Reset');
    
    fireEvent.change(textarea, { target: { value: 'Test problem' } });
    expect(textarea).toHaveValue('Test problem');
    
    fireEvent.click(resetButton);
    expect(textarea).toHaveValue('');
  });

  it('should copy result to clipboard', async () => {
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn(() => Promise.resolve()),
      },
      configurable: true,
    });
    
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        final_answer: '4',
        explanation: '2 + 2 = 4'
      })
    });
    
    render(<Calculator />);
    
    const textarea = screen.getByPlaceholderText(/Enter a complex math problem/i);
    const solveButton = screen.getByText('Solve');
    
    fireEvent.change(textarea, { target: { value: 'What is 2 + 2?' } });
    fireEvent.click(solveButton);
    
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument();
    });
    
    const copyButton = screen.getByText('Copy Result');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('4');
  });
});