/**
 * Narrative Text Parser
 * Parses AI-generated narrative text into structured, formatted sections
 * for display in recommendation cards.
 */

/**
 * Parsed narrative structure
 */
export interface ParsedNarrative {
	type: 'structured' | 'plain';
	sections: NarrativeSection[];
}

/**
 * Individual section in the narrative
 */
export interface NarrativeSection {
	type: 'paragraph' | 'list' | 'metric';
	content: string | string[];
	/**
	 * For metrics - the actual numeric value if detected
	 */
	value?: number;
}

/**
 * Parse narrative text into structured sections
 * @param text - Raw narrative text from AI
 * @returns Parsed narrative with identified structure
 */
export function parseNarrative(text: string | null | undefined): ParsedNarrative {
	// Handle null/undefined/empty safely
	if (!text || typeof text !== 'string') {
		return {
			type: 'plain',
			sections: [],
		};
	}

	const trimmed = text.trim();
	if (trimmed.length === 0) {
		return {
			type: 'plain',
			sections: [],
		};
	}

	// Strip markdown syntax before parsing
	let cleaned = trimmed;

	// Remove markdown bold syntax (**text**)
	cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');

	// Remove markdown italic syntax (*text* and _text_)
	// BUT: Don't match asterisks at start of line followed by space (those are bullet points!)
	cleaned = cleaned.replace(/(?<!^)(?<!\n)\*([^*\n]+?)\*/g, '$1');
	cleaned = cleaned.replace(/_([^_]+?)_/g, '$1');

	// Remove markdown headers (# Header, ## Header, etc.)
	cleaned = cleaned.replace(/^#{1,6}\s+(.+)$/gm, '$1');

	// Remove inline code syntax (`code`)
	cleaned = cleaned.replace(/`([^`]+?)`/g, '$1');
	const sections: NarrativeSection[] = [];

	// First, try to detect if the text contains embedded bullet lists
	// This handles cases where the AI returns text like: "text\n- item1\n- item2\nmore text"
	// But NOT pure lists where every line is a list item (those use the original logic)
	const lines = cleaned.split('\n').filter((l) => l.trim());
	const listItemCount = lines.filter((l) => /^[\s]*[-*•]\s+/.test(l)).length;
	const hasEmbeddedList = listItemCount > 0 && listItemCount < lines.length;

	if (hasEmbeddedList) {
		// Process line by line, but respect blank line paragraph breaks
		const lines = cleaned.split('\n');
		let currentList: string[] = [];
		let currentParagraph: string[] = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const trimmedLine = line.trim();

			// Blank line = paragraph break
			if (!trimmedLine) {
				// Finish any pending paragraph
				if (currentParagraph.length > 0) {
					const paragraphText = currentParagraph.join(' ');
					if (containsMetric(paragraphText)) {
						sections.push({
							type: 'metric',
							content: paragraphText,
							value: extractNumericValue(paragraphText),
						});
					} else {
						sections.push({
							type: 'paragraph',
							content: paragraphText,
						});
					}
					currentParagraph = [];
				}
				// Finish any pending list
				if (currentList.length > 0) {
					sections.push({
						type: 'list',
						content: currentList,
					});
					currentList = [];
				}
				continue;
			}

			const isListItem = /^[-*•]\s+/.test(trimmedLine);

			if (isListItem) {
				// Finish any pending paragraph
				if (currentParagraph.length > 0) {
					const paragraphText = currentParagraph.join(' ');
					if (containsMetric(paragraphText)) {
						sections.push({
							type: 'metric',
							content: paragraphText,
							value: extractNumericValue(paragraphText),
						});
					} else {
						sections.push({
							type: 'paragraph',
							content: paragraphText,
						});
					}
					currentParagraph = [];
				}

				// Add to current list
				currentList.push(trimmedLine.replace(/^[-*•]\s+/, ''));
			} else {
				// Not a list item
				// Finish any pending list
				if (currentList.length > 0) {
					sections.push({
						type: 'list',
						content: currentList,
					});
					currentList = [];
				}

				// Add to current paragraph
				currentParagraph.push(trimmedLine);
			}
		}

		// Push any remaining list
		if (currentList.length > 0) {
			sections.push({
				type: 'list',
				content: currentList,
			});
		}

		// Push any remaining paragraph
		if (currentParagraph.length > 0) {
			const paragraphText = currentParagraph.join(' ');
			if (containsMetric(paragraphText)) {
				sections.push({
					type: 'metric',
					content: paragraphText,
					value: extractNumericValue(paragraphText),
				});
			} else {
				sections.push({
					type: 'paragraph',
					content: paragraphText,
				});
			}
		}
	} else {
		// Original logic: split by double line breaks
		const paragraphs = cleaned
			.split(/\n\n+/)
			.map((p) => p.trim())
			.filter((p) => p.length > 0);

		for (const paragraph of paragraphs) {
			// Check if it's a bullet list
			const bulletMatch = paragraph.match(/^[\s]*[-*•]\s+/m);
			const numberedMatch = paragraph.match(/^[\s]*\d+\.\s+/m);

			if (bulletMatch || numberedMatch) {
				// Parse as list
				const listItems = paragraph
					.split(/\n/)
					.map((line) => line.trim())
					.filter((line) => line.length > 0)
					.map((line) => {
						// Remove bullet/number markers
						return line.replace(/^[\s]*[-*•]\s+/, '').replace(/^[\s]*\d+\.\s+/, '');
					});

				sections.push({
					type: 'list',
					content: listItems,
				});
			} else if (containsMetric(paragraph)) {
				// Parse as metric/highlight
				const value = extractNumericValue(paragraph);
				sections.push({
					type: 'metric',
					content: paragraph,
					value,
				});
			} else {
				// Regular paragraph
				sections.push({
					type: 'paragraph',
					content: paragraph,
				});
			}
		}
	}

	// If no structure detected, treat as single paragraph
	if (sections.length === 0) {
		sections.push({
			type: 'paragraph',
			content: cleaned,
		});
	}

	return {
		type: sections.length > 1 || sections[0]?.type !== 'paragraph' ? 'structured' : 'plain',
		sections,
	};
}

/**
 * Check if text contains metric-worthy content
 * @param text - Text to check
 * @returns True if text contains metrics or highlights
 */
function containsMetric(text: string): boolean {
	// Check for patterns like:
	// - "$X" or "$X,XXX" (monetary amounts)
	// - "X%" (percentages)
	// - "X kWh" or "X kwh" (energy usage)
	// - Comparison keywords: "saves", "reduces", "lowers", "cheaper"
	const metricPatterns = [
		/\$\d+[,\d]*/,
		/\d+\.?\d*%/,
		/\d+\.?\d*\s*k?wh/i,
		/\b(saves?|saving|saved|reduces?|reducing|reduced|lowers?|lowering|lowered|cheaper)\b/i,
	];

	return metricPatterns.some((pattern) => pattern.test(text));
}

/**
 * Extract numeric value from text (for metrics)
 * @param text - Text containing numeric value
 * @returns Extracted number or undefined
 */
function extractNumericValue(text: string): number | undefined {
	// Try to extract the most significant number
	const dollarMatch = text.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)/);
	if (dollarMatch) {
		return parseFloat(dollarMatch[1].replace(/,/g, ''));
	}

	const percentMatch = text.match(/(\d+(?:\.\d+)?)%/);
	if (percentMatch) {
		return parseFloat(percentMatch[1]);
	}

	const kwhMatch = text.match(/(\d+(?:\.\d+)?)\s*k?wh/i);
	if (kwhMatch) {
		return parseFloat(kwhMatch[1]);
	}

	return undefined;
}

/**
 * Format parsed narrative as plain text (fallback)
 * @param parsed - Parsed narrative structure
 * @returns Plain text representation
 */
export function formatAsPlainText(parsed: ParsedNarrative): string {
	return parsed.sections
		.map((section) => {
			if (Array.isArray(section.content)) {
				return section.content.join('\n');
			}
			return section.content;
		})
		.join('\n\n');
}
