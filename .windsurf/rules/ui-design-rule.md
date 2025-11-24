---
trigger: manual
---

# UI Design Rules for Cursor

## Clarity & Language

- Use human-like, conversational language instead of robotic or technical text
- Button labels must clearly state the action (e.g., "Create account" not "OK" or "Next")
- Dialog options should be descriptive (e.g., "Yes, Cancel" and "Don't Cancel")
- CTAs should use exciting, engaging words (e.g., "Join the Club!" instead of "Submit")
- Avoid redundant verbs in labels when context is clear (e.g., "My address" not "Edit my address")

## Forms & User Input

- Always use single-column layouts for forms to maintain vertical momentum
- Align form elements horizontally for faster user orientation
- Group related fields by increasing space between groups, decreasing space within groups
- Use boxed input fields instead of underlined fields for better recognition
- Placeholder text is for hints only, never use as labels
- Implement input masks for specific formats (phone: (___) ___-____, date: DD/MM/YYYY)
- Show specific error messages with exact location and reason, not generic errors
- Display 2-4 options directly (radio buttons) rather than in dropdowns
- Use toggle tokens for multiple selections instead of long checkbox lists

## Color, Contrast & Shadows

- Never use pure black (#000000); use dark grey to reduce eye strain
- Limit saturation on dark UI elements for better contrast
- Create separate color palettes for light and dark modes
- Apply color psychology (red for destructive actions like "Delete")
- Add dark overlays to bright images to ensure text visibility and contrast
- Use grey elevation (not shadows) to separate layers in dark themes
- Customize shadows: increase blur, lower opacity for softer, natural look
- Maintain single light source direction for all shadows
- Highlight recommended pricing plans visually

## Buttons & Clickability

- Make primary CTAs stand out with distinct primary color
- Follow Fitt's Law: large primary CTAs within thumb reach
- Implement clear button hierarchy (one primary, one secondary maximum)
- Make clickable elements obvious (use buttons on cards, add color to links)
- Expand clickable/tappable areas beyond visual boundaries
- Keep button text on single line, never wrap
- Use full-width buttons on mobile (respect system margins)

## Layout, Icons & Imagery

- Use spacing to divide sections instead of lines
- Break up content blocks with descriptive headings and icons
- Maintain consistent icon sets with matching stroke weights
- Use simple, flat, front-facing icons; avoid complex perspective views
- Pair icons with labels for complex or abstract functions
- Use high-resolution, contextually relevant images
- Add strokes to avatars for background separation
- Create depth with overlapping elements (e.g., avatar on header)
- Design responsively using grids; test on multiple screen sizes

## Navigation & User Flow

- Show progress bars for multi-step flows (e.g., checkout)
- Apply Serial Positioning Effect: place important nav items at corners (first/last)
- Position "Skip" links within thumb reach during onboarding
- Use skeleton loading screens instead of spinners (perceived as faster)
- Implement swipe actions for common list operations (delete, archive)
- Show glimpse of off-screen content to prompt scrolling/swiping

## Typography

- Use single typeface (or minimal typefaces) for consistency
- Limit font sizes to reduce cognitive load
- Ensure all text is properly aligned for readability
- Maintain line length of 45-75 characters for optimal reading
- Never make body text smaller than 14pt
- Avoid all caps for long paragraphs; use sparingly
- Right-align numbers in tables and lists for easy comparison

## General Principles

- Prioritize clarity and usability over visual flair
- Test designs across different devices and screen sizes
- Maintain consistency throughout the interface
- Consider accessibility in all design decisions
- Guide users clearly through flows and interactions