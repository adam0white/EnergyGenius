/**
 * Tests for narrative-parser.ts
 */

import { describe, it, expect } from 'vitest';
import { parseNarrative, formatAsPlainText, type ParsedNarrative } from '../src/worker/lib/narrative-parser';

describe('parseNarrative', () => {
	it('should handle empty or null input', () => {
		expect(parseNarrative('')).toEqual({
			type: 'plain',
			sections: [],
		});

		expect(parseNarrative('   ')).toEqual({
			type: 'plain',
			sections: [],
		});
	});

	it('should parse plain paragraph text', () => {
		const text = 'This is a simple explanation without any special formatting.';
		const result = parseNarrative(text);

		expect(result.type).toBe('plain');
		expect(result.sections).toHaveLength(1);
		expect(result.sections[0].type).toBe('paragraph');
		expect(result.sections[0].content).toBe(text);
	});

	it('should parse multiple paragraphs', () => {
		const text = `First paragraph with some content.

Second paragraph with more details.

Third paragraph wrapping up.`;

		const result = parseNarrative(text);

		expect(result.type).toBe('structured');
		expect(result.sections).toHaveLength(3);
		expect(result.sections[0].type).toBe('paragraph');
		expect(result.sections[1].type).toBe('paragraph');
		expect(result.sections[2].type).toBe('paragraph');
	});

	it('should parse bullet list with dashes', () => {
		const text = `- First item in the list
- Second item with more details
- Third and final item`;

		const result = parseNarrative(text);

		expect(result.type).toBe('structured');
		expect(result.sections).toHaveLength(1);
		expect(result.sections[0].type).toBe('list');
		expect(result.sections[0].content).toEqual([
			'First item in the list',
			'Second item with more details',
			'Third and final item',
		]);
	});

	it('should parse bullet list with asterisks', () => {
		const text = `* Lowest monthly rate at $89.50
* 100% renewable energy
* No early termination fees`;

		const result = parseNarrative(text);

		expect(result.sections[0].type).toBe('list');
		expect(result.sections[0].content).toEqual([
			'Lowest monthly rate at $89.50',
			'100% renewable energy',
			'No early termination fees',
		]);
	});

	it('should parse numbered list', () => {
		const text = `1. First benefit of this plan
2. Second advantage for your usage
3. Third reason to choose this`;

		const result = parseNarrative(text);

		expect(result.sections[0].type).toBe('list');
		expect(result.sections[0].content).toEqual([
			'First benefit of this plan',
			'Second advantage for your usage',
			'Third reason to choose this',
		]);
	});

	it('should detect metric sections with dollar amounts', () => {
		const text = 'This plan saves you $1,250 annually compared to your current plan.';
		const result = parseNarrative(text);

		expect(result.sections[0].type).toBe('metric');
		expect(result.sections[0].content).toBe(text);
		expect(result.sections[0].value).toBe(1250);
	});

	it('should detect metric sections with percentages', () => {
		const text = 'Reduces your energy costs by 23% while providing 100% renewable energy.';
		const result = parseNarrative(text);

		expect(result.sections[0].type).toBe('metric');
		expect(result.sections[0].value).toBe(23);
	});

	it('should detect metric sections with kWh values', () => {
		const text = 'Perfect for your 850 kWh monthly usage pattern.';
		const result = parseNarrative(text);

		expect(result.sections[0].type).toBe('metric');
		expect(result.sections[0].value).toBe(850);
	});

	it('should detect metric sections with comparison keywords', () => {
		const text = 'This plan lowers your monthly bills significantly.';
		const result = parseNarrative(text);

		expect(result.sections[0].type).toBe('metric');
	});

	it('should handle complex mixed format narrative', () => {
		const text = `This plan is ideal for your usage pattern.

Key benefits:
- Saves $1,200 annually
- 100% renewable energy
- Flexible 12-month contract

The monthly rate of $89.50 is 15% lower than your current plan. Perfect for families with consistent usage around 800 kWh per month.`;

		const result = parseNarrative(text);

		expect(result.type).toBe('structured');
		expect(result.sections.length).toBeGreaterThan(1);

		// Check for different section types
		const types = result.sections.map((s) => s.type);
		expect(types).toContain('paragraph');
		expect(types).toContain('list');
		expect(types).toContain('metric');
	});

	it('should handle narrative with natural structure (no explicit bullets)', () => {
		const text = `This plan offers the best value for your usage profile. You'll save approximately $1,100 per year while getting 100% renewable energy.

The 12-month contract provides rate stability, and there are no early termination fees if your situation changes.`;

		const result = parseNarrative(text);

		expect(result.sections.length).toBeGreaterThan(0);
		// Should detect metrics in first paragraph
		expect(result.sections.some((s) => s.type === 'metric')).toBe(true);
	});

	it('should handle narrative with inline metrics in paragraphs', () => {
		const text = 'With your average usage of 850 kWh per month, this plan saves you $95 monthly, totaling $1,140 annually.';
		const result = parseNarrative(text);

		expect(result.sections[0].type).toBe('metric');
		// Parser prioritizes dollar amounts over kWh as they're more significant for savings
		expect(result.sections[0].value).toBe(95);
	});

	it('should preserve content integrity when parsing', () => {
		const text = `Great choice for consistent users.

- Stable pricing
- Green energy
- No penalties

Best for your needs.`;

		const result = parseNarrative(text);
		const reconstructed = formatAsPlainText(result);

		// Should preserve core content
		expect(reconstructed).toContain('Great choice');
		expect(reconstructed).toContain('Stable pricing');
		expect(reconstructed).toContain('Best for your needs');
	});

	it('should strip markdown bold syntax from text', () => {
		const text = `This plan is **highly recommended** for your usage.

**Key Benefits:**
- Save **$1,200** annually
- **100%** renewable energy
- Flexible contract`;

		const result = parseNarrative(text);

		// Check that markdown bold is stripped from first paragraph
		const firstSection = result.sections[0];
		expect(firstSection.content).toBe('This plan is highly recommended for your usage.');
		expect(firstSection.content).not.toContain('**');

		// Check list items don't have markdown
		const listSection = result.sections.find((s) => s.type === 'list');
		expect(listSection).toBeDefined();
		if (listSection && Array.isArray(listSection.content)) {
			listSection.content.forEach((item) => {
				expect(item).not.toContain('**');
			});
			// Verify list items are present (header "Key Benefits:" may be separate section)
			const savingsItem = listSection.content.find((item) => item.includes('Save'));
			expect(savingsItem).toContain('Save $1,200 annually');
		}
	});

	it('should handle real AI-generated narrative with markdown', () => {
		const text = `This plan is our top recommendation because it could save you approximately **$214 annually** compared to your current plan.

**Key Benefits:**
- 15% annual savings over your current plan
- 100% renewable energy from wind and solar
- Flexible 12-month contract with no early termination fee

**Important to Know:**
This plan offers fixed rates, so your monthly costs will be predictable.

**Estimated Annual Savings: $214.00**`;

		const result = parseNarrative(text);

		// Verify no markdown syntax remains
		result.sections.forEach((section) => {
			if (typeof section.content === 'string') {
				expect(section.content).not.toContain('**');
			} else if (Array.isArray(section.content)) {
				section.content.forEach((item) => {
					expect(item).not.toContain('**');
				});
			}
		});

		// Verify content is properly structured
		expect(result.sections.length).toBeGreaterThan(1);
		expect(result.sections.some((s) => s.type === 'list')).toBe(true);
		expect(result.sections.some((s) => s.type === 'metric')).toBe(true);
	});

	it('should strip markdown italic syntax with asterisks', () => {
		const text = `This plan is *excellent* for your needs. It offers *great value* with savings.`;

		const result = parseNarrative(text);

		expect(result.sections[0].content).toBe('This plan is excellent for your needs. It offers great value with savings.');
		expect(result.sections[0].content).not.toContain('*');
	});

	it('should strip markdown italic syntax with underscores', () => {
		const text = `This plan is _highly recommended_ for your usage pattern.`;

		const result = parseNarrative(text);

		expect(result.sections[0].content).toBe('This plan is highly recommended for your usage pattern.');
		expect(result.sections[0].content).not.toContain('_');
	});

	it('should strip markdown headers at various levels', () => {
		const text = `# Main Header

This is content.

## Subheader

More content here.

### Third Level Header

Final content.`;

		const result = parseNarrative(text);

		// Verify no hash symbols remain
		result.sections.forEach((section) => {
			if (typeof section.content === 'string') {
				expect(section.content).not.toMatch(/^#+\s/);
			}
		});

		// Headers should become regular paragraphs
		const headerSection = result.sections.find((s) =>
			typeof s.content === 'string' && s.content === 'Main Header'
		);
		expect(headerSection).toBeDefined();
	});

	it('should strip inline code syntax', () => {
		const text = 'The rate is `$0.095/kWh` which is very competitive. Use code `SAVE2024` at signup.';

		const result = parseNarrative(text);

		expect(result.sections[0].content).toBe('The rate is $0.095/kWh which is very competitive. Use code SAVE2024 at signup.');
		expect(result.sections[0].content).not.toContain('`');
	});

	it('should handle mixed markdown syntax in one text block', () => {
		const text = '**Bold text** and *italic text* and _underscored_ text.\n\n' +
			'# Header Here\n\n' +
			'- List with **bold** item\n' +
			'- Another *italic* item\n' +
			'- Item with `code` syntax\n\n' +
			'Paragraph with all: **bold**, *italic*, _underscore_, and `code`.';

		const result = parseNarrative(text);

		// Verify no markdown remains anywhere
		result.sections.forEach((section) => {
			if (typeof section.content === 'string') {
				expect(section.content).not.toContain('**');
				expect(section.content).not.toMatch(/(?<!\w)\*(?!\*)/); // Single asterisks not part of word
				expect(section.content).not.toContain('_');
				expect(section.content).not.toContain('`');
				expect(section.content).not.toMatch(/^#+\s/);
			} else if (Array.isArray(section.content)) {
				section.content.forEach((item) => {
					expect(item).not.toContain('**');
					expect(item).not.toMatch(/(?<!\w)\*(?!\*)/);
					expect(item).not.toContain('_');
					expect(item).not.toContain('`');
				});
			}
		});
	});

	it('should handle edge case with nested or overlapping markdown', () => {
		const text = `Text with **bold and *italic* inside** and separate _emphasis_.`;

		const result = parseNarrative(text);

		// Should strip all markdown syntax
		expect(result.sections[0].content).not.toContain('**');
		expect(result.sections[0].content).not.toContain('*');
		expect(result.sections[0].content).not.toContain('_');
		// Verify content is present
		expect(result.sections[0].content).toContain('bold');
		expect(result.sections[0].content).toContain('italic');
		expect(result.sections[0].content).toContain('emphasis');
	});

	it('should handle multiline text with various markdown patterns', () => {
		const text = '# Important Plan Details\n\n' +
			'This is an *excellent* plan with **great savings**.\n\n' +
			'## Key Features\n' +
			'- _Renewable energy_ source\n' +
			'- `Fixed rate` of $0.09/kWh\n' +
			'- **No termination** fees\n\n' +
			'Save **$200** annually!';

		const result = parseNarrative(text);

		// Verify comprehensive markdown removal
		result.sections.forEach((section) => {
			if (typeof section.content === 'string') {
				expect(section.content).not.toContain('**');
				expect(section.content).not.toContain('`');
				expect(section.content).not.toContain('_');
				expect(section.content).not.toMatch(/^#+\s/);
			} else if (Array.isArray(section.content)) {
				section.content.forEach((item) => {
					expect(item).not.toContain('**');
					expect(item).not.toContain('`');
					expect(item).not.toContain('_');
				});
			}
		});

		// Verify structure still parsed correctly
		expect(result.sections.some((s) => s.type === 'list')).toBe(true);
		expect(result.sections.some((s) => s.type === 'metric')).toBe(true);
	});
});

describe('formatAsPlainText', () => {
	it('should convert parsed narrative back to plain text', () => {
		const text = `First paragraph.

- Item one
- Item two

Final paragraph.`;

		const parsed = parseNarrative(text);
		const formatted = formatAsPlainText(parsed);

		expect(formatted).toContain('First paragraph');
		expect(formatted).toContain('Item one');
		expect(formatted).toContain('Item two');
		expect(formatted).toContain('Final paragraph');
	});

	it('should handle empty parsed narrative', () => {
		const parsed: ParsedNarrative = {
			type: 'plain',
			sections: [],
		};

		const formatted = formatAsPlainText(parsed);
		expect(formatted).toBe('');
	});
});
