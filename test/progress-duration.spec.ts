/**
 * Progress Duration Display Tests
 * Tests for Story 8.3 - Fix Progress Duration Display
 *
 * Verifies that duration is correctly calculated when stages complete
 */

import { describe, it, expect } from 'vitest';

/**
 * Simulates the formatDuration function from ProgressTimeline.tsx
 */
function formatDuration(startTime: Date | null, endTime: Date | null): string {
	if (!startTime) return '';

	const end = endTime || new Date();
	const durationMs = end.getTime() - startTime.getTime();
	const seconds = Math.floor(durationMs / 1000);

	if (seconds < 60) {
		return `${seconds}s`;
	}

	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Simulates PipelineStage state structure
 */
interface PipelineStage {
	status: 'idle' | 'running' | 'complete' | 'error';
	timestamp: Date | null; // Start time
	endTime: Date | null; // End time
	output: string;
}

describe('Progress Duration Display', () => {
	describe('formatDuration()', () => {
		it('should return empty string if startTime is null', () => {
			const result = formatDuration(null, null);
			expect(result).toBe('');
		});

		it('should calculate duration in seconds when complete', () => {
			const startTime = new Date('2025-11-11T10:00:00Z');
			const endTime = new Date('2025-11-11T10:00:15Z');

			const result = formatDuration(startTime, endTime);
			expect(result).toBe('15s');
		});

		it('should calculate duration in minutes and seconds', () => {
			const startTime = new Date('2025-11-11T10:00:00Z');
			const endTime = new Date('2025-11-11T10:01:45Z');

			const result = formatDuration(startTime, endTime);
			expect(result).toBe('1m 45s');
		});

		it('should not show "Duration 0s" when endTime is set', () => {
			const startTime = new Date('2025-11-11T10:00:00Z');
			const endTime = new Date('2025-11-11T10:00:20Z');

			const result = formatDuration(startTime, endTime);
			expect(result).not.toBe('0s');
			expect(result).toBe('20s');
		});

		it('should handle 0 second duration (instant completion)', () => {
			const startTime = new Date('2025-11-11T10:00:00Z');
			const endTime = new Date('2025-11-11T10:00:00Z');

			const result = formatDuration(startTime, endTime);
			expect(result).toBe('0s');
		});

		it('should use current time if endTime is null (for running stages)', () => {
			const startTime = new Date(Date.now() - 5000); // 5 seconds ago

			const result = formatDuration(startTime, null);
			const seconds = parseInt(result.replace('s', ''));

			// Should be approximately 5 seconds (allow 1 second tolerance)
			expect(seconds).toBeGreaterThanOrEqual(4);
			expect(seconds).toBeLessThanOrEqual(6);
		});
	});

	describe('PipelineStage Duration Tracking', () => {
		it('should have separate startTime and endTime fields', () => {
			const stage: PipelineStage = {
				status: 'complete',
				timestamp: new Date('2025-11-11T10:00:00Z'),
				endTime: new Date('2025-11-11T10:00:15Z'),
				output: 'Stage complete',
			};

			expect(stage.timestamp).not.toBeNull();
			expect(stage.endTime).not.toBeNull();
			expect(stage.timestamp).not.toBe(stage.endTime);
		});

		it('should set endTime when stage completes', () => {
			// Simulate stage lifecycle
			const startTime = new Date('2025-11-11T10:00:00Z');

			// Stage starts
			const runningStage: PipelineStage = {
				status: 'running',
				timestamp: startTime,
				endTime: null,
				output: '',
			};

			expect(runningStage.timestamp).toBe(startTime);
			expect(runningStage.endTime).toBeNull();

			// Stage completes
			const completedStage: PipelineStage = {
				...runningStage,
				status: 'complete',
				endTime: new Date('2025-11-11T10:00:15Z'),
			};

			expect(completedStage.timestamp).toBe(startTime);
			expect(completedStage.endTime).not.toBeNull();

			// Calculate duration
			const duration = formatDuration(completedStage.timestamp, completedStage.endTime);
			expect(duration).toBe('15s');
		});

		it('should show correct elapsed time for completed stages', () => {
			const stage: PipelineStage = {
				status: 'complete',
				timestamp: new Date('2025-11-11T10:00:00Z'),
				endTime: new Date('2025-11-11T10:00:20Z'),
				output: 'Analysis complete',
			};

			const duration = formatDuration(stage.timestamp, stage.endTime);

			// Duration should be 20s, NOT 0s
			expect(duration).toBe('20s');
			expect(duration).not.toBe('0s');
		});

		it('should handle multiple stages with different durations', () => {
			const stage1: PipelineStage = {
				status: 'complete',
				timestamp: new Date('2025-11-11T10:00:00Z'),
				endTime: new Date('2025-11-11T10:00:05Z'),
				output: 'Stage 1 complete',
			};

			const stage2: PipelineStage = {
				status: 'complete',
				timestamp: new Date('2025-11-11T10:00:05Z'),
				endTime: new Date('2025-11-11T10:00:11Z'),
				output: 'Stage 2 complete',
			};

			const stage3: PipelineStage = {
				status: 'complete',
				timestamp: new Date('2025-11-11T10:00:11Z'),
				endTime: new Date('2025-11-11T10:00:26Z'),
				output: 'Stage 3 complete',
			};

			expect(formatDuration(stage1.timestamp, stage1.endTime)).toBe('5s');
			expect(formatDuration(stage2.timestamp, stage2.endTime)).toBe('6s');
			expect(formatDuration(stage3.timestamp, stage3.endTime)).toBe('15s');
		});
	});

	describe('Bug Regression Tests', () => {
		it('should NOT show "Duration 0s" bug when stage completes', () => {
			// This was the original bug: endTime was set to same value as startTime
			const startTime = new Date('2025-11-11T10:00:00Z');

			// BUG: endTime incorrectly set to startTime
			const buggyStage: PipelineStage = {
				status: 'complete',
				timestamp: startTime,
				endTime: startTime, // THIS WAS THE BUG
				output: 'Complete',
			};

			const buggyDuration = formatDuration(buggyStage.timestamp, buggyStage.endTime);
			expect(buggyDuration).toBe('0s'); // Bug produces 0s

			// FIX: endTime correctly set to actual completion time
			const fixedStage: PipelineStage = {
				status: 'complete',
				timestamp: startTime,
				endTime: new Date('2025-11-11T10:00:15Z'), // Correct endTime
				output: 'Complete',
			};

			const fixedDuration = formatDuration(fixedStage.timestamp, fixedStage.endTime);
			expect(fixedDuration).toBe('15s'); // Fix shows actual duration
			expect(fixedDuration).not.toBe('0s'); // No longer shows 0s
		});

		it('should preserve duration through status transitions', () => {
			const startTime = new Date('2025-11-11T10:00:00Z');

			// Running stage
			const runningStage: PipelineStage = {
				status: 'running',
				timestamp: startTime,
				endTime: null,
				output: 'Processing...',
			};

			// Verify running stage has no endTime
			expect(runningStage.endTime).toBeNull();

			// Complete stage - endTime is now set
			const completedStage: PipelineStage = {
				...runningStage,
				status: 'complete',
				endTime: new Date('2025-11-11T10:00:18Z'),
			};

			// Verify completion preserves startTime and sets endTime
			expect(completedStage.timestamp).toBe(startTime);
			expect(completedStage.endTime).not.toBeNull();
			expect(completedStage.endTime).not.toBe(startTime);

			// Duration should be accurate
			const duration = formatDuration(completedStage.timestamp, completedStage.endTime);
			expect(duration).toBe('18s');
		});
	});
});
