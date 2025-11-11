/**
 * ProgressTimeline - Visual progress tracking for AI recommendation pipeline
 *
 * Displays 3-stage vertical stepper showing:
 * - Data Interpretation (Usage Summary)
 * - Plan Scoring
 * - Narrative Generation
 *
 * Each stage shows status badge, timestamps, and progress
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface Stage {
	name: string;
	status: 'idle' | 'queued' | 'running' | 'completed' | 'complete' | 'error';
	startTime: Date | null;
	endTime: Date | null;
	output: string;
}

interface ProgressTimelineProps {
	stages: Stage[];
}

/**
 * Format duration in human-readable format
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
 * Format timestamp in HH:MM:SS format
 */
function formatTime(date: Date | null): string {
	if (!date) return '';
	return date.toLocaleTimeString('en-US', { hour12: false });
}

/**
 * Stage status badge component
 */
function StatusBadge({ status }: { status: Stage['status'] }) {
	// Normalize status (handle both 'complete' and 'completed')
	const normalizedStatus = status === 'completed' ? 'complete' : status;

	if (normalizedStatus === 'queued' || normalizedStatus === 'idle') {
		return (
			<Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
				<span className="mr-1">○</span>
				Queued
			</Badge>
		);
	}

	if (normalizedStatus === 'running') {
		return (
			<Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
				<span className="mr-1 inline-block animate-spin">⏳</span>
				Running
			</Badge>
		);
	}

	if (normalizedStatus === 'complete') {
		return (
			<Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
				<span className="mr-1">✓</span>
				Complete
			</Badge>
		);
	}

	if (normalizedStatus === 'error') {
		return (
			<Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
				<span className="mr-1">✗</span>
				Error
			</Badge>
		);
	}

	return null;
}

/**
 * Individual stage card component
 */
function StageCard({ stage, isLast }: { stage: Stage; isLast: boolean }) {
	const [elapsedTime, setElapsedTime] = useState<string>('');
	const normalizedStatus = stage.status === 'completed' ? 'complete' : stage.status;

	// Update elapsed time every second for running stages
	useEffect(() => {
		if (normalizedStatus === 'running' && stage.startTime) {
			const interval = setInterval(() => {
				setElapsedTime(formatDuration(stage.startTime, null));
			}, 1000);

			return () => clearInterval(interval);
		}
	}, [normalizedStatus, stage.startTime]);

	// Get background tint based on status
	const getCardBackground = () => {
		if (normalizedStatus === 'running') return 'bg-blue-50';
		if (normalizedStatus === 'complete') return 'bg-green-50';
		return 'bg-white';
	};

	return (
		<div className="relative flex items-start gap-4">
			{/* Connector line */}
			<div className="flex flex-col items-center">
				<div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white" />
				{!isLast && <div className="w-0.5 h-full bg-gray-300 flex-1 min-h-[60px]" />}
			</div>

			{/* Stage card */}
			<Card className={`flex-1 p-5 border border-gray-200 rounded-lg shadow-sm transition-all hover:shadow-md ${getCardBackground()}`}>
				{/* Header with title and badge */}
				<div className="flex items-start justify-between mb-3">
					<h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
					<StatusBadge status={stage.status} />
				</div>

				{/* Output/Description */}
				{stage.output && <p className="text-sm text-gray-600 mb-3 leading-relaxed">{stage.output}</p>}

				{/* Metadata: timestamps and duration */}
				{stage.startTime && (
					<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
						<div>
							<span className="font-medium">Started:</span> {formatTime(stage.startTime)}
						</div>
						{normalizedStatus === 'running' && elapsedTime && (
							<div>
								<span className="font-medium">Elapsed:</span> {elapsedTime}
							</div>
						)}
						{normalizedStatus === 'complete' && stage.endTime && (
							<div>
								<span className="font-medium">Duration:</span> {formatDuration(stage.startTime, stage.endTime)}
							</div>
						)}
					</div>
				)}
			</Card>
		</div>
	);
}

/**
 * Main ProgressTimeline component
 */
export function ProgressTimeline({ stages }: ProgressTimelineProps) {
	// Determine current stage for screen reader announcements
	const currentStage = stages.find((s) => s.status === 'running');
	const completedCount = stages.filter((s) => s.status === 'complete' || s.status === 'completed').length;

	return (
		<div className="w-full max-w-3xl mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8 text-center">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Recommendations</h2>
				<p className="text-gray-600">Our AI is analyzing your data and finding the best energy plans for you</p>
			</div>

			{/* Screen reader announcement for current stage */}
			<div aria-live="polite" aria-atomic="true" className="sr-only">
				{currentStage && `${currentStage.name} is currently running. ${completedCount} of ${stages.length} stages completed.`}
				{completedCount === stages.length && 'All stages completed. Recommendations ready.'}
			</div>

			{/* Timeline stages */}
			<div
				className="space-y-0"
				role="progressbar"
				aria-label="Processing progress"
				aria-valuenow={completedCount}
				aria-valuemin={0}
				aria-valuemax={stages.length}
			>
				{stages.map((stage, index) => (
					<StageCard key={stage.name} stage={stage} isLast={index === stages.length - 1} />
				))}
			</div>

			{/* Bottom message */}
			<div className="mt-8 text-center">
				<p className="text-sm text-gray-500">This typically takes 8-10 seconds. Please wait while we process your request.</p>
			</div>
		</div>
	);
}
