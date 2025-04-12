import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { Loader } from 'lucide-react-native';
import { Colors, BlurIntensities } from '@/constants/Colors';

export type ProgressStep = {
  id: string;
  label: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'error';
};

type ProgressIndicatorProps = {
  steps: ProgressStep[];
  currentStepId: string;
  statusMessage: string | null;
  error: string | null;
};

export default function ProgressIndicator({
  steps,
  currentStepId,
  statusMessage,
  error
}: ProgressIndicatorProps) {
  // Animation for the spinner
  const spinValue = useRef(new Animated.Value(0)).current;

  // Start the spinner animation when the component mounts or when currentStepId changes
  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Reset and restart the animation
    spinValue.setValue(0);
    spinAnimation.start();

    return () => {
      spinAnimation.stop();
    };
  }, [currentStepId]); // Re-run when currentStepId changes

  // Map the spin value to a rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Calculate the current step index
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);

  // Calculate progress percentage
  const progress = currentStepIndex >= 0
    ? (currentStepIndex / (steps.length - 1)) * 100
    : 0;

  return (
    <View style={styles.container}>
      <BlurView intensity={BlurIntensities.medium} style={styles.contentContainer}>
        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.stepItem}>
              <View
                style={[
                  styles.stepIndicator,
                  step.status === 'completed' && styles.stepCompleted,
                  step.status === 'in-progress' && styles.stepInProgress,
                  step.status === 'error' && styles.stepError,
                ]}
              >
                {step.status === 'in-progress' && (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Loader size={18} color={Colors.text} />
                  </Animated.View>
                )}
                {step.status === 'completed' && (
                  <Text style={styles.stepCompletedText}>✓</Text>
                )}
                {step.status === 'error' && (
                  <Text style={styles.stepErrorText}>!</Text>
                )}
                {step.status === 'waiting' && (
                  <Text style={styles.stepWaitingText}>{index + 1}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  step.status === 'in-progress' && styles.stepLabelActive,
                  step.status === 'completed' && styles.stepLabelCompleted,
                  step.status === 'error' && styles.stepLabelError,
                ]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Status message */}
        {statusMessage && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.glass,
    width: '90%',
    maxWidth: 500,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: Colors.borderMedium,
  },
  stepInProgress: {
    backgroundColor: Colors.primary,
  },
  stepCompleted: {
    backgroundColor: Colors.success,
  },
  stepError: {
    backgroundColor: Colors.error,
  },
  stepWaitingText: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepCompletedText: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepErrorText: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  stepLabelCompleted: {
    color: Colors.success,
  },
  stepLabelError: {
    color: Colors.error,
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 125, 59, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 125, 59, 0.3)',
  },
  statusText: {
    color: Colors.primary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});
