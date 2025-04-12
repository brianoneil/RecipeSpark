// Color palette for the app
export const Colors = {
  // Base colors
  background: '#2A2A2E', // Dark background
  card: 'rgba(45, 45, 50, 0.7)', // Slightly lighter than background for cards
  cardHighlight: 'rgba(55, 55, 60, 0.8)', // Highlight for active cards

  // Text colors
  text: '#FFFFFF', // White text
  textSecondary: '#CCCCCC', // Light gray for secondary text
  textMuted: '#999999', // Muted text color

  // Accent colors - warm food-friendly colors
  primary: '#FF7D3B', // Warm orange
  secondary: '#E85D75', // Warm pink/red
  tertiary: '#FFB03A', // Warm yellow/amber

  // UI element colors
  success: '#4CD964', // Green for success states
  error: '#FF3B30', // Red for error states
  warning: '#FFCC00', // Yellow for warning states

  // Glassmorphism
  glass: 'rgba(45, 45, 50, 0.6)', // Base glass effect
  glassLight: 'rgba(60, 60, 65, 0.5)', // Lighter glass effect
  glassDark: 'rgba(35, 35, 40, 0.8)', // Darker glass effect

  // Borders
  borderLight: 'rgba(255, 255, 255, 0.15)', // Light border for glass elements
  borderMedium: 'rgba(255, 255, 255, 0.2)', // Medium border for more visibility
  borderDark: 'rgba(255, 255, 255, 0.3)', // Darker border for high contrast

  // Gradients
  gradientStart: '#FF7D3B', // Orange
  gradientMiddle: '#E85D75', // Pink/red
  gradientEnd: '#9B4DCA', // Purple

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.3)',
};

// Blur intensities for glassmorphism - fixed values regardless of light/dark mode
export const BlurIntensities = {
  light: 45,  // Consistent light blur
  medium: 65, // Consistent medium blur
  heavy: 90,  // Consistent heavy blur

  // Use these values for specific components if needed
  button: 65,  // For buttons
  card: 45,    // For cards
  overlay: 90, // For overlays
};

// Gradient presets
export const Gradients = {
  primary: ['#FF7D3B', '#E85D75', '#9B4DCA'], // Warm gradient
  food: ['#FF7D3B', '#FFB03A'], // Food-themed gradient
  dark: ['#2A2A2E', '#1F1F23'], // Dark background gradient
  backgroundStart: '#1A1A1E', // Darker at top
  backgroundMiddle: '#252530', // Slightly lighter in middle
  backgroundEnd: '#1A1A1E', // Darker at bottom
};
