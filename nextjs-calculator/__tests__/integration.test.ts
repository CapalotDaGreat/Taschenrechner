import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execPromise = promisify(exec);

describe('Integration Tests', () => {
  it('should build the application successfully', async () => {
    // Change to the nextjs-calculator directory and run the build
    try {
      const { stdout, stderr } = await execPromise('cd nextjs-calculator && npm run build');
      console.log('Build stdout:', stdout);
      console.log('Build stderr:', stderr);
      expect(stdout).toContain('Compiled successfully');
    } catch (error) {
      console.error('Build error:', error);
      throw error;
    }
  }, 120000); // 2 minute timeout for build process

  it('should pass all unit tests', async () => {
    // Change to the nextjs-calculator directory and run the tests
    try {
      const { stdout, stderr } = await execPromise('cd nextjs-calculator && npm test');
      console.log('Test stdout:', stdout);
      console.log('Test stderr:', stderr);
      // This is a placeholder - in a real implementation, we would check for test results
      expect(true).toBe(true);
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 120000); // 2 minute timeout for test process
});